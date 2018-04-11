import {StylableCanvasShape} from "../style/index";
import {CanvasContext} from "../context/index";
import {applyStyle, unapplyStyle} from "../style/apply";
import {applyStyleToContext} from "../style/draw";
import {IFindInfo} from "../find/index";
import {pointRectangleDistance} from "../../../../geometry/rectangle/index";
import {boundingBoxInteracts} from "../find/box";
import {popInteraction, pushInteraction} from "../find/interaction";
import {IPoint} from "../../../../geometry/point/index";
import {IInteraction} from "../interaction/index";

export abstract class AbstractCanvasShape extends StylableCanvasShape{

    public __shape_node: boolean;

    public applyStyle(ctx: CanvasContext): any{
        var old = applyStyle(this.style, ctx);
        return old;
    }

    public unapplyStyle(old: any, ctx: CanvasContext){
        unapplyStyle(old, ctx);
    }

    public draw(ctx: CanvasContext){
        var old = this.applyStyle(ctx);
        this.drawShape(ctx);
        applyStyleToContext(ctx, this._bb);
        ctx.context.beginPath();
        this.unapplyStyle(old, ctx);
    }

    get boundingBox(){
        return this._bb;
    }

    public interaction: IInteraction;

    public abstract drawShape(ctx: CanvasContext): void;

    public find(pt: IPoint, ctx: CanvasContext): IFindInfo[]{
        pushInteraction(this.interaction, ctx);
        if (ctx.interaction.interaction.ignore){
            popInteraction(ctx);
            return null;
        }
        var bb = this.boundingBox;
        if (bb && boundingBoxInteracts(bb, pt, ctx.interaction.interaction.screenPadding)){
            return [{shape: this, distance: pointRectangleDistance(pt, bb)}];
        }
        popInteraction(ctx);
        return null;
    }

}

AbstractCanvasShape.prototype.__shape_node = true;