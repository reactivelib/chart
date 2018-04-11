import layoutOuter, {IAxisPositioningSettings, IPositionSettings} from "./index";
import {IGridIntervals} from "./interval";
import {layoutAroundCenter} from './inner/center';
import {IGridPosition, IRelativePositionedGridElement} from "./relative";
import {IRectangle} from "../../../../geometry/rectangle";
import {unobserved} from "@reactivelib/reactive";

export interface IRecursiveGridLayoutSettings extends IAxisPositioningSettings{
    afterResize: (() => void)[];
    afterLayout: (() => boolean)[];
    centerElements: IRelativePositionedGridElement[];
}

function calculateWidth(elements:IPositionInfo[], accept: (indx: number) => boolean){
    var posToMaxWidth: {[s: string]: number} = {};
    elements.forEach(el => {
        var x = el.pos;
        if (accept(el.pos)){
            posToMaxWidth[x] = Math.max((posToMaxWidth[x] || 0), el.size);
        }
    });
    var w = 0;
    for (var x in posToMaxWidth){
        w += posToMaxWidth[x];
    }
    return w;
}

export interface IPositionInfo{
    pos: number;
    size: number;
}

function calculateLeftWidth(elements:IPositionInfo[]){
    return calculateWidth(elements, indx => indx < 0);
}

function calculateRightWidth(elements:IPositionInfo[]){
    return calculateWidth(elements, indx => indx > 0);
}

function calculateTopHeight(elements:IPositionInfo[]){
    return calculateHeight(elements, indx => indx < 0);
}

function calculateBottomHeight(elements:IPositionInfo[]){
    return calculateHeight(elements, indx => indx > 0);
}

function calculateHeight(elements:IPositionInfo[], accept: (indx: number) => boolean){
    var posToMaxHeight: {[s: string]: number} = {};
    elements.forEach(el => {
        var y = el.pos;
        if (accept(el.pos)){
            posToMaxHeight[y] = Math.max((posToMaxHeight[y] || 0), el.size);
        }
    });
    var h = 0;
    for (var y in posToMaxHeight){
        h += posToMaxHeight[y];
    }
    return h;
}

function isFit(v1, v2){
    return Math.abs(v2 - v1) < 1;
}

export function layoutGridElementsRecursive(set: IRecursiveGridLayoutSettings): IGridIntervals{
    var finished = false;
    var size: IGridIntervals;
    while(!finished)
    {
        var fits = false;
        var nr = 0;
        while(!fits && nr < 3)
        {

            size = layoutOuter(set);
            layoutAroundCenter(set.centerElements, set.center);

            var innerDims = set.centerElements.map(el => {
                return {
                    width: (<IRectangle>el.component).width,
                    height: (<IRectangle>el.component).height
                }
            });

            var outerDims = set.elements.map(el => {
                return {
                    width: el.component.width,
                    height: el.component.height
                }
            });

            set.afterResize.forEach((r) => r());
            var xOuterPoses = set.elements.map(el => {
                return {
                    pos: el.x,
                    size: el.component.width
                }
            });
            var yOuterPoses = set.elements.map(el => {
                return {
                    pos: el.y,
                    size: el.component.height
                }
            });
            var lw = calculateLeftWidth(xOuterPoses);
            var rw = calculateRightWidth(xOuterPoses);
            var th = calculateTopHeight(yOuterPoses);
            var bh = calculateBottomHeight(yOuterPoses);
            fits = isFit((set.container.x+lw),  (set.center.x - set.border.left));
            fits = fits && isFit((set.container.x + set.container.width - rw), (set.center.x + set.center.width + set.border.right));
            fits = fits && isFit((set.container.y + th), (set.center.y - set.border.top));
            fits = fits && isFit(set.container.y + set.container.height - bh,  set.center.y + set.center.height + set.border.bottom);

            for (var i=0; i < set.centerElements.length; i++){
                var old = innerDims[i];
                var comp = <IRectangle>set.centerElements[i].component;
                if (!isFit(comp.width, old.width) || !isFit(comp.height, old.height)){
                    fits = false;
                    break;
                }
            }

            for (var i=0; i < set.elements.length; i++){
                var old = outerDims[i];
                var comp = <IRectangle>set.elements[i].component;
                if (!isFit(comp.width, old.width) || !isFit(comp.height, old.height)){
                    fits = false;
                    break;
                }
            }

            nr++;
        }
        finished = true;
        for (var i=0; i < set.afterLayout.length; i++)
        {
            var f = set.afterLayout[i]();
            if (!f){
                finished = false;
                break;
            }
        }
    }
    return size;
}