import {CanvasRenderer} from "./index";
import {ICanvasEvent} from "../event/index";

function getHoverStyle(ev: ICanvasEvent, style: any){
    if (typeof style === "function"){
        return style(ev);
    }
    else
    {
        return style;
    }
}

export function setOverStyles(node: CanvasRenderer){
   /* var lastOver: IStylable = null;
    var lastOverStyle: ICanvasStyle = null;
    var oldStyle: any =  {};
    var otherStyle = rvar<any>(null);
    node.childrenGroup.addEventListener("over", (ev) => {
        if (ev.interaction.overStyle){
            otherStyle.value = getHoverStyle(ev, ev.interaction.overStyle);
            lastOver = <IStylable>ev.target;
        }
    });
    node.childrenGroup.addEventListener("out", (ev) => {
        if (lastOver && lastOverStyle){        
            for (var p in oldStyle){

            }
            lastOver.removeStyle(lastOverStyle);
            lastOverStyle = null;
        }
        lastOver = null;
        otherStyle.value = null;
    });
    
    procedure(() => {
        var os = otherStyle.value;
        if (os){
            if (lastOverStyle){
                lastOver.removeStyle(lastOverStyle);
            }
            lastOverStyle = os;
            lastOver.addStyle(os);
        }
    });
*/


}