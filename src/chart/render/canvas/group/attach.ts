/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IIterator, iterator} from "../../../../collection/iterator/index";
import {IAttachmentInfo} from "./array/attachment";
import {IBaseShape} from "@reactivelib/html";
import {ICanvasChildShape} from "../shape";

export function onDetached(shape: IAttachmentInfo, children: IIterator<ICanvasChildShape>){
    shape.isAttached = false;
    iterator(children).forEach((c: ICanvasChildShape) => c.onDetached && c.onDetached());
}

export function onAttached(shape: IAttachmentInfo, children: IIterator<IBaseShape>){
    iterator(children).forEach((c: any) => {
        if (c === shape){
            throw new Error("Shape is already attached");
        }
        c.onAttached && c.onAttached();
    });
    shape.isAttached = true;
}