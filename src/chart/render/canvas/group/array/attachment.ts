import {IBaseShape} from "@reactivelib/html";
import {ICanvasChildShape} from "../../shape";

export interface IAttachmentInfo extends IBaseShape{
    
    isAttached: boolean;
    
}

export function childAdded(parent: IAttachmentInfo, child: ICanvasChildShape){
    child.parent = parent;
    if (parent.isAttached){
        child.onAttached && child.onAttached();
    }
}

export function childRemoved(parent: IAttachmentInfo, child: ICanvasChildShape){
    if (child && parent.isAttached){
        child.onDetached && child.onDetached();
        child.parent = null;
    }
}