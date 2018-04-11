/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IBaseShape} from "@reactivelib/html";
import {ICanvasContext} from "../context/index";
import {IInteraction} from "../interaction/index";
import {IPoint} from "../../../../geometry/point/index";
import {IFindInfo} from "../find/index";

export interface ICanvasChild extends ICanvasChildShape{
    parent: ICanvasChildShape;
}


/**
 * Base shape for canvas shapes
 */
export interface ICanvasShape extends IBaseShape{
}

/**
 * Base shape for all canvas shapes excluding {@link render.ICanvasHTMLShape}
 */
export interface ICanvasChildShape extends ICanvasShape{

    /**
     * The interaction for this shape
     */
    interaction?: IInteraction;
    /**
     * The parent of this shape
     */
    parent: ICanvasShape;
    /**
     * Method is called when the shape should draw itself.
     * @param ctx The context containing the current state of the canvas.
     */
    draw?(ctx: ICanvasContext): void;
    find?(pt: IPoint, ctx: ICanvasContext): IFindInfo[];
    onAttached?(): void;
    onDetached?(): void;
    order?: number;
}