import {childAdded, childRemoved, IAttachmentInfo} from "./attachment";
import {array} from "@reactivelib/reactive";
import {IBaseShape} from "@reactivelib/html";
import {ICanvasChildShape} from "../../shape";

export function addChildAt(parent: IAttachmentInfo, shape: ICanvasChildShape, children: array.IReactiveArray<ICanvasChildShape>, index: number){
    children.insert(index, shape);
    childAdded(parent, shape);
}

export function removeChildAt(parent: IAttachmentInfo, children: array.IReactiveArray<ICanvasChildShape>, index: number){
    var s = children.remove(index);
    childRemoved(parent, s);
    return s;
}

export function replace(parent: IAttachmentInfo, children: array.IReactiveArray<ICanvasChildShape>, child: ICanvasChildShape, index: number){
    var c = children.array[index];
    children.set(index, child);
    if (parent.isAttached){
        child.onAttached && child.onAttached();
        child.parent = parent;
        if (c){
            c.onDetached && c.onDetached();
            c.parent = null;
        }
    }
    return c;
}