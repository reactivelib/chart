import {CanvasContext} from "../context/index";
import {variable} from "@reactivelib/reactive";
import {StylableCanvasShape} from "../style/index";

export interface IArcConfig{
    x: number;
    y: number;
    radius: number;
    startAngle?: number;
    endAngle?: number;
}

export class ArcRenderer extends StylableCanvasShape implements IArcConfig{

    public x = 0;
    public y = 0;
    public radius = 10;
    public startAngle = 0;
    public endAngle = 2*Math.PI;
    public type: string;
    constructor(){
        super();
    }

    public drawShape(ctx: CanvasContext){

    }

}

ArcRenderer.prototype.drawShape = drawArc;
ArcRenderer.prototype.type = "arc";

export class ReactiveArcRenderer extends ArcRenderer{

    private r_x = variable(0);
    private r_y = variable(0);
    private r_radius = variable(0);
    private r_startAngle = variable(0);
    private r_endAngle = variable(0);

    get endAngle(){
        return this.r_endAngle.value;
    }

    set endAngle(v){
        this.r_endAngle.value = v;
    }

    get startAngle(){
        return this.r_startAngle.value;
    }

    set startAngle(v){
        this.r_startAngle.value = v;
    }

    get radius(){
        return this.r_radius.value;
    }

    set radius(v){
        this.r_radius.value = v;
    }

    get y(){
        return this.r_y.value;
    }

    set y(v){
        this.r_y.value = v;
    }

    get x(){
        return this.r_x.value;
    }

    set x(v){
        this.r_x.value = v;
    }

}

export function drawArc(this: IArcConfig, ctx: CanvasContext){
    var x = this.x;
    var y = this.y;
    var r = Math.max(0, this.radius);
    var pt = ctx.transform.transform(x, y);
    x = pt.x;
    y = pt.y;
    ctx.context.arc(x, y, r, this.startAngle || 0, this.endAngle || (2 * Math.PI));
    ctx.context.closePath();
}