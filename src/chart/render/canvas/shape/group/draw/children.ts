/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CanvasContext} from "../../../context/index";
import {ICanvasChildShape} from "../../index";
import { IIterator } from "../../../../../../collection/iterator/index";

export function drawArrayChildren(children: ICanvasChildShape[], ctx: CanvasContext){
    for (var i=0; i < children.length; i++){
        var c = children[i];
        c.draw(ctx);
    }
}

export function drawIteratorChildren(children: IIterator<ICanvasChildShape>, ctx: CanvasContext){
    while(children.hasNext()){
        var c = children.next();
        c.draw(ctx);
    }
}