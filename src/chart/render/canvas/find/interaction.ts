import {ICanvasChildShape} from "../shape/index";
import {IPoint} from "../../../../geometry/point/index";
import {CanvasContext} from "../context/index";
import {IInteraction} from "../interaction/index";

export type type = ICanvasChildShape;

export function find(find: type['find']): type['find']{
    return function(this: ICanvasChildShape, pt: IPoint, ctx: CanvasContext){
        if (this.interaction){
            if (this.interaction.ignore){
                return null;
            }
            ctx.interaction.push(this.interaction);
        }
        var res = find.call(this, pt, ctx);
        if (this.interaction){
            ctx.interaction.pop();
        }
        return res;
    }
}

export function pushInteraction(interaction: IInteraction, ctx: CanvasContext){
    ctx.interaction.push(interaction);
}

export function popInteraction(ctx: CanvasContext){
    ctx.interaction.pop();
}