import {IPoint} from "../point";

export function pointIsInPoly(p: IPoint, polygon: IPoint[]) {
    var isInside = false;
    var i = 0, j = polygon.length - 1;
    for (; i < polygon.length; j = i++) {
        if ( (polygon[i].y > p.y) != (polygon[j].y > p.y) &&
            p.x < (polygon[j].x - polygon[i].x) * (p.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x ) {
            isInside = !isInside;
        }
    }
    return isInside;
}