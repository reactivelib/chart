import {SettingsRectangleRenderer} from "../index";
import {IPoint} from "../../../../../../geometry/point/index";
import {AbstractCanvasShape} from "../../basic";
import {CanvasContext} from "../../../context/index";
import {IFindInfo} from "../../../find/index";

export class PreviewRectangle extends AbstractCanvasShape{

    constructor(public rect: SettingsRectangleRenderer){
        super();
    }

    public oldAlpha: number;

    get style(){
        return this.rect.style;
    }

    public applyStyle(ctx: CanvasContext){
        var old = super.applyStyle(ctx);
        this.oldAlpha = ctx.context.globalAlpha;
        ctx.context.globalAlpha = Math.max(0.1, this.oldAlpha - 0.4);
        return old;
    }

    public unapplyStyle(old: any, ctx: CanvasContext){
        ctx.context.globalAlpha = this.oldAlpha;
        super.unapplyStyle(old, ctx);
    }

    drawShape(ctx: CanvasContext){
        var r = this.rect.generateRectangle(this, ctx);
        this.rect.drawRectangle(r, ctx);
    }

    get x(){
        return this.rect.x;
    }

    get y(){
        return this.rect.y;
    }

    get width(){
        return this.rect.width;
    }

    get height(){
        return this.rect.height;
    }

    find(pt: IPoint, ctx: CanvasContext): IFindInfo[]{
        return null;
    }

}

export class YEndPreviewRectangle extends PreviewRectangle{

    constructor(public rect: SettingsRectangleRenderer, public point: IPoint){
        super(rect);
    }

    get height(){
        var h =  this.point.y - this.y;
        return h;
    }
}

export class YStartPreviewRectangle extends PreviewRectangle{

    constructor(public rect: SettingsRectangleRenderer, public point: IPoint){
        super(rect);
    }

    get y(){
        return this.point.y;
    }

    get height(){
        var h  = this.rect.y + this.rect.height - this.point.y;
        return h;
    }
}

export class XStartPreviewRectangle extends PreviewRectangle{

    constructor(public rect: SettingsRectangleRenderer, public point: IPoint){
        super(rect);
    }

    get x(){
        return this.point.x;
    }

    get width(){
        var h  = this.rect.x + this.rect.width - this.point.x;
        return h;
    }
}

export class XEndPreviewRectangle extends PreviewRectangle{

    constructor(public rect: SettingsRectangleRenderer, public point: IPoint){
        super(rect);
    }

    get width(){
        var h =  this.point.x - this.x;
        return h;
    }
}

export class MovingPreviewRectangle extends PreviewRectangle{
    constructor(public rect: SettingsRectangleRenderer, public point: IPoint){
        super(rect);
    }

    get x(){
        return this.point.x;
    }

    set x(x: number){
        this.point.x = x;
    }

    get y(){
        return this.point.y;
    }

    set y(y: number){
        this.point.y = y;
    }

    get width(){
        return this.rect.width;
    }

    get height(){
        return this.rect.height;
    }

}