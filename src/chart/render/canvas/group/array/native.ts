import {childAdded, childRemoved, IAttachmentInfo} from "./attachment";
import {IBaseShape} from "@reactivelib/html";

export function addChild(parent: IAttachmentInfo, children: IBaseShape[], shape: IBaseShape){
    children.push(shape);
    childAdded(parent, shape);
}

export function removeChild(parent: IAttachmentInfo, children: IBaseShape[], shape: IBaseShape){
    var indx = children.indexOf(shape);
    if (indx >= 0){
        children.splice(indx, 1);
        childRemoved(parent, shape);
    }
}