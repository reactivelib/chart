import {IPoint} from "../../../../../../geometry/point/index";
import {CanvasContext} from "../../../context/index";
import {ICanvasChildShape} from "../../index";
import {IIterator} from "../../../../../../collection/iterator/index";

export function findGroupChildren(pt: IPoint, ctx: CanvasContext, children: IIterator<ICanvasChildShape>){
    if (ctx.interaction.interaction.ignore){
        return [];
    }
    var results = [];
    while(children.hasNext()){
        var ch =  <ICanvasChildShape>children.next();
        if ((<any>ch).find){
            var r = (<any>ch).find(pt, ctx);
            if (r){
                for (var j=0; j < r.length; j++)
                {
                    results.push(r[j]);
                }
            }
        }
    }
    return results;
}