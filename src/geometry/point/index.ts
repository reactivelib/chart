export default function point(x: number, y: number): IPoint{
    return {
        x: x,
        y: y
    }
}

/**
 * Represents a point in cartesian coordinates
 */
export interface IPoint{
    /**
     * x-position
     */
    x: number;
    /**
     * y-position
     */
    y: number;
}


export interface IPoint3d extends IPoint{
    z: number;
}

export class BoundingBoxCalculator{

    private sx = Number.MAX_VALUE;
    private ex = -Number.MAX_VALUE;
    private sy = Number.MAX_VALUE;
    private ey = -Number.MAX_VALUE;

    public addPoint(x: number, y: number){
        this.sx = Math.min(this.sx, x);
        this.ex = Math.max(this.ex, x);
        this.sy = Math.min(this.sy, y);
        this.ey = Math.max(this.ey, y);
    }

    public getBoundingBox(){
        return {
            x: this.sx,
            y: this.sy,
            width: this.ex - this.sx,
            height: this.ey - this.sy
        }
    }

}

export function pointPointDistance(pt: IPoint, pt2: IPoint){
    var dx = Math.abs(pt2.x - pt.x);
    var dy = Math.abs(pt2.y - pt.y);
    return dx + dy;
}