import {IPositionSettings} from "./index";
import {IGridIntervals} from "./interval";
import {IPointInterval} from "../../../../geometry/interval";
import {RedBlackTree} from "../../../../collection/sorted/redblack";
import {IPadding} from "../../../../geometry/rectangle";

export interface IAssignmentSettings{
    grid: IGridIntervals;
    border: IPadding;
    elements: IPositionSettings[];
}

function getOverflowInterval(valToInterval: RedBlackTree<number, IPointInterval>, start: number, end: number){
    var startIvl = valToInterval.firstBigger(start, true).value;
    var endIvl = valToInterval.firstSmaller(end, true).value;
    if (endIvl.start < startIvl.start){
        var d = endIvl;
        endIvl = startIvl;
        startIvl = d;
    }
    var s = startIvl.start;
    var e = endIvl.end;
    var ivl = {
        start: s,
        end: e
    }
    return ivl;
}

export default function(settings: IAssignmentSettings){
    var els = settings.elements;
    for (var i=0; i < els.length; i++){
        var el = els[i];
        var x = el.x;
        var y = el.y;
        var xIntvl = settings.grid.width.find(x);
        var yIntvl = settings.grid.height.find(y);
        if (el.overflow){
            var left = x - (el.overflow.left || 0);
            var right = x + (el.overflow.right || 0);
            var top = y + (el.overflow.top || 0);
            var bottom = y - (el.overflow.bottom || 0);
            xIntvl = getOverflowInterval(settings.grid.width, left, right);
            yIntvl = getOverflowInterval(settings.grid.height, bottom, top);
        }
        if (el.border === "include"){
            if (x === 0){
                if (!(el.overflow && el.overflow.left)){
                    xIntvl.start -= settings.border.left;
                }
                if (!(el.overflow && el.overflow.right)){
                    xIntvl.start += settings.border.right;
                }
            }
            if (y === 0){
                if (!(el.overflow && el.overflow.bottom)){
                    yIntvl.start -= settings.border.top;
                }
                if (!(el.overflow && el.overflow.top)){
                    yIntvl.end += settings.border.bottom;
                }
            }
        }
        var c = el.component;
        if (el.height){
            c.height = el.height;
        }
        else if (el.resizeHeight){
            c.height = yIntvl.end - yIntvl.start;
        }
        if (el.width){
            c.width = el.width;
        }
        else if (el.resizeWidth){
            c.width = xIntvl.end - xIntvl.start;
        }
        var valign = el.valign || "middle";
        var halign = el.halign || "middle";
        switch (valign){
            case "top":
                c.y = yIntvl.start;
                break;
            case "bottom":
                c.y = Math.round(yIntvl.end - c.height);
                break;
            default:
                c.y = Math.round((yIntvl.end + yIntvl.start) / 2 - (c.height / 2));
        }
        switch(halign){
            case "left":
                c.x = xIntvl.start;
                break;
            case "right":
                c.x = Math.round(xIntvl.end - c.width);
                break;
            default:
                c.x = Math.round((xIntvl.start + xIntvl.end) / 2 - (c.width / 2));
        }
        el.cell = {
            x: xIntvl.start, y: yIntvl.start, width: (xIntvl.end - xIntvl.start), height: (yIntvl.end - yIntvl.start)
        }
        el.shape = c;

    }
}