/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasChildShape} from '../../../render/canvas/shape/index';
import {CartesianSeriesGroupRenderer} from "./group";
import {IRectangle} from "../../../../geometry/rectangle/index";
import {IXYSeriesSystem} from "../series";
import {IDataHighlightProvidingShape} from './data/highlight/highlight';
import {ICanvasStyle} from '../../../render/canvas/style/index';
import {CanvasContext} from '../../../render/canvas/context/index';

export interface ISeriesShapeBase{
    series: IXYSeriesSystem;
    data: any;
    getScreenBoundingBox(): IRectangle;
    parent: CartesianSeriesGroupRenderer;
    _bb: IRectangle;
}

export abstract class AbstractSeriesShapeBase implements ICanvasChildShape, ISeriesShapeBase, IDataHighlightProvidingShape{
    
    public style: ICanvasStyle;
    public _bb: IRectangle;

    constructor(public data: any, public parent: CartesianSeriesGroupRenderer){

    }

    public lastStyle: any;

    get series(){
        return this.parent.series;
    }

    get boundingBox(){
        return this.getScreenBoundingBox();
    }

    getScreenBoundingBox(): IRectangle{
        return this._bb || {x: 0, y: 0, width: 0, height: 0};
    }

    public abstract draw(ctx: CanvasContext): void;

    public abstract createHighlighter(): ICanvasChildShape;
}