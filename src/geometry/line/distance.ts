import {IPoint} from "../point";

function sqr(x:number) {
    return x * x
}

function dist2(x1:number, y1:number, x2:number, y2:number) {
    return sqr(x1 - x2) + sqr(y1 - y2)
}

export function pointXYDistance(point: IPoint, lStart: IPoint, lEnd: IPoint) {
    var x = point.x;
    var y = point.y;
    var x1 = lStart.x;
    var y1 = lStart.y;
    var x2 = lEnd.x;
    var y2 = lEnd.y;

    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) //in case of 0 length line
        param = dot / len_sq;

    var xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    }
    else if (param > 1) {
        xx = x2;
        yy = y2;
    }
    else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}
