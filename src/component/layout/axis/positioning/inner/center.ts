import {IRectangle} from "../../../../../geometry/rectangle/index";
import {IGridPosition, IRelativePositionedGridElement} from "../relative";
import * as lineSize from '../size';
import {generateDecreasingIntervals, generateIncreasingIntervals, insertElements} from '../interval';
import {RedBlackTree} from "../../../../../collection/sorted/redblack";
import {IPointInterval} from "../../../../../geometry/interval";
import {IRectangleBaseShape} from "../../../../../chart/render/rectangle";

function xAlign(comp: IRelativePositionedGridElement, full: IPointInterval){
    var c = <IRectangle>comp.component;
    if (comp.resizeWidth){
        c.x = full.start;
        c.width = full.end - full.start;
        return;
    }
    var halign = comp.halign || "middle";
    switch(halign){
        case "left":
            c.x = full.start;
            break;
        case "right":
            c.x = full.end - c.width;
            break;
        case "middle":
            c.x = ((full.start + full.end) / 2) - (c.width / 2);
            break;
    }
}

function yAlign(comp: IRelativePositionedGridElement, full: IPointInterval){
    var c = <IRectangle>comp.component;
    if (comp.resizeHeight){
        c.y = full.start;
        c.height = full.end - full.start;
        return;
    }
    var valign = comp.valign || "middle";
    switch(valign){
        case "top":
            c.y = full.start;
            break;
        case "bottom":
            c.y = full.end - c.height;
            break;
        case "middle":
            c.y = ((full.start + full.end) / 2) - (c.height / 2);
            break;
    }
}

export function layoutAroundCenter(settings: IRelativePositionedGridElement[], center: IRectangle){
    var yToSize = lineSize.sortPosToMaxWidth(lineSize.default(settings.filter(s => (<IGridPosition>s.position).x === 0).map(s => {
        return {
            position: (<IGridPosition>s.position).y,
            size: (<IRectangle>s.component).height
        }
    })));
    var xToSize = lineSize.sortPosToMaxWidth(lineSize.default(settings.filter(s => (<IGridPosition>s.position).y === 0).map(s => {
        return {
            position: (<IGridPosition>s.position).x,
            size: (<IRectangle>s.component).width
        }
    })));

    var yPart = lineSize.partitionPositions(yToSize);
    var xPart = lineSize.partitionPositions(xToSize);

    var xLeftInterval = generateIncreasingIntervals(xPart.smallerZero.reverse(), center.x);
    var xRightInterval = generateDecreasingIntervals(xPart.biggerZero.reverse(), center.x + center.width);
    var yTopInterval = generateIncreasingIntervals(yPart.smallerZero.reverse(), center.y);
    var yBottomInterval = generateDecreasingIntervals(yPart.biggerZero.reverse(), center.y + center.height);

    var width = new RedBlackTree<number, IPointInterval>((a, b) => a - b);
    var height = new RedBlackTree<number, IPointInterval>((a, b) => a - b);
    insertElements(width, xLeftInterval);
    insertElements(width, xRightInterval);
    insertElements(height, yTopInterval);
    insertElements(height, yBottomInterval);
    width.insert(0, {start: center.x, end: center.x + center.width});
    height.insert(0, {start: center.y, end: center.y + center.height});

    settings.forEach(el => {
        var ps = <IGridPosition>el.position;
        var comp = <IRectangle> el.component;
        var w = width.find(ps.x);
        var h = height.find(ps.y);
        yAlign(el, h);
        xAlign(el, w);
        el.cell = {
            x: w.start,
            y: h.start,
            width: w.end - w.start,
            height: h.end - h.start
        }
        el.shape = <IRectangleBaseShape>comp;
    });
}