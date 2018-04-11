import {IRectangle} from "../../../../../../geometry/rectangle/index";
import {RTree} from "../../../../../../collection2d/rtree";

export function layoutOverlapping(overlaps: RTree, lbl: IRectangle): boolean{
    var bounds = {
        xs: lbl.x,
        ys: lbl.y,
        xe: lbl.x + lbl.width,
        ye: lbl.y + lbl.height
    };
    if (overlaps.findOverlapping(bounds).length > 0){
        return false;
    }
    overlaps.add(bounds);
    return true;
}