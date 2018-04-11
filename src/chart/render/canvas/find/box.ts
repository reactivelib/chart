import {IPaddingSettings, IRectangle} from "../../../../geometry/rectangle/index";
import {IPoint} from "../../../../geometry/point/index";
import {CanvasContext} from "../context/index";
import {IBoundingBoxShape, IFindInfo} from "./index";

export function boundingBoxInteracts(boundingBox: IRectangle, pt: IPoint, screenPadding: IPaddingSettings){
    var p1 = {x: boundingBox.x, y: boundingBox.y};
    var p2 = {x:boundingBox.x + boundingBox.width, y: boundingBox.y + boundingBox.height};
    var lx = Math.min(p1.x, p2.x);
    var rx = Math.max(p1.x, p2.x);
    var by = Math.min(p1.y, p2.y);
    var ty = Math.max(p1.y, p2.y);
    if (screenPadding){
        lx -= screenPadding.left || 0;
        rx += screenPadding.right || 0;
        by -= screenPadding.bottom || 0;
        ty += screenPadding.top || 0;
    }
    var int = (pt.x >= lx && pt.x <=rx && pt.y >= by && pt.y <= ty);
    return int;
}

export function find(shape: IBoundingBoxShape, pt: IPoint, ctx: CanvasContext): IFindInfo[]{
    if (boundingBoxInteracts(shape.boundingBox, pt, ctx.interaction.interaction.screenPadding)){
        return [{shape: shape, zIndex: ctx.interaction.interaction.zIndex || 0}];
    }
    return null;
}