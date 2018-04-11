import {SettingsPointRenderer} from "../index";
import {CanvasContext} from "../../../context/index";
import {ICanvasChildShape} from "../../index";
import {AbstractCanvasShape} from "../../basic";
import {IFindInfo} from "../../../find/index";
import {IPoint} from "../../../../../../geometry/point/index";
import transform from "../generate/transform";
import crisp from '../generate/crisp';
import {roundFillOrStroke} from "../../round/strokeFill";

export class PointPreview extends AbstractCanvasShape implements ICanvasChildShape{
    
    constructor(public point: SettingsPointRenderer){
        super();
    }
    
    get radius() {
        return this.point.radius;
    }

    get style(){
        return this.point.style;
    }

    public oldAlpha: number;

    public x: number;
    public y: number;

    public generatePoint(ctx: CanvasContext){
        return crisp(transform({x: this.x, y: this.y, radius: this.point.radius}, ctx.transform), roundFillOrStroke(ctx));
    }

    applyStyle(ctx: CanvasContext){
        var old = super.applyStyle(ctx);
        this.oldAlpha = ctx.context.globalAlpha;
        ctx.context.globalAlpha = Math.max(0.1, this.oldAlpha - 0.4);
        return old;
    }

    unapplyStyle(old: any, ctx: CanvasContext){
        ctx.context.globalAlpha = this.oldAlpha;
        super.unapplyStyle(old, ctx);
    }
    
    public drawShape(ctx: CanvasContext){
        this.point.drawPoint(ctx, this.generatePoint(ctx));
    }

    find(pt: IPoint, ctx: CanvasContext): IFindInfo[]{
        return null;
    }
}