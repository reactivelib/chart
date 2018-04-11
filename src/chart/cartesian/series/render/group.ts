/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasChildShape} from "../../../render/canvas/shape/index";
import {IXYSeriesSystem} from "../series";
import {DynamicRingBufferArray, IRingBuffer} from "../../../../collection/array/ring";
import {ISeriesRenderer, ISeriesShape, SeriesRenderer} from "../../../series/render/base";
import {IPoint} from "../../../../geometry/point/index";
import {CanvasContext} from "../../../render/canvas/context/index";
import {IDataHighlightProvidingShape} from "./data/highlight/highlight";
import {IShapeDataHolder} from "../../../data/shape/transform/index";
import {BruteForceSeriesShapeFinder} from "../../../render/canvas/series/find/data/brute";
import {CartesianSeriesHighlightedDataGroup} from "./data/highlight/group/shape/index";
import {SeriesShapeDataIterator} from "./data/find/iterator";
import {DataToShapesCalculator} from "../../../render/canvas/series/group/calculator";
import {IStylable} from "../../../render/canvas/style/index";
import {roundStroke} from "../../../render/canvas/shape/round/index";
import {drawIteratorChildren} from "../../../render/canvas/shape/group/draw/children";
import {drawByStyle} from "../../../render/canvas/style/apply";
import {ICancellable, nullCancellable, variable} from "@reactivelib/reactive";
import {IHighlightable} from "../../../render/style/highlight";
import {highlight} from "../../../render/style/highlight/area/shape/color";
import {ISeriesRendererSettings} from "./index";
import {init} from "../../../../config/di";
import {IXIndexedData} from "../../../../datatypes/range";

export function findShapesByIndex(this: CartesianSeriesGroupRenderer, indx: number){
    var s = this.shapes.get(indx);
    if (!s){
        return [];
    }
    return [s];
}

export function findSeriesShapesByIndex(shapes: IRingBuffer<ISeriesShape>, indx: number){
    var s = shapes.get(indx);
    if (!s){
        return [];
    }
    return [s];
}

export abstract class CartesianSeriesGroupRenderer extends SeriesRenderer implements ICanvasChildShape, ISeriesRenderer{

    public parent: ICanvasChildShape;

    public finder: BruteForceSeriesShapeFinder<any>;
    public shapesCalculator: DataToShapesCalculator<IShapeDataHolder<any>, ICanvasChildShape>;
    public r_shapes: variable.IVariable<DynamicRingBufferArray<ISeriesShape & ICanvasChildShape>>

    get shapes(){
        return this.r_shapes.value;
    }
    set shapes(v){
        this.r_shapes.value = v;
    }
    public highlighter: IHighlightable;

    public series: IXYSeriesSystem;

    abstract create(parent: ICanvasChildShape, sd: IShapeDataHolder<any>): ISeriesShape & ICanvasChildShape;

    constructor(settings: ISeriesRendererSettings){
        super(settings);
    }

    @init
    init(){
        this.shapesCalculator = new DataToShapesCalculator(() => this.series.shapeData, this, this.create.bind(this));
        this.finder = new BruteForceSeriesShapeFinder({iterator: () => new SeriesShapeDataIterator(this.shapes)}, (s: ISeriesShape) => s.getScreenBoundingBox());
        this.r_shapes = variable<DynamicRingBufferArray<ISeriesShape & ICanvasChildShape>>(null).listener(v => {
            this.shapesCalculator.update();
            v.value = <any>this.shapesCalculator.buffer;
        });
    }

    public findShapesByIndex(data: any){
        return findSeriesShapesByIndex(this.shapes, data);
    }

    public highlightDataAtIndex(){
        var grp = new CartesianSeriesHighlightedDataGroup(this.series,  i => {
            var shape = this.shapes.get(i);
            if (!shape || !(<IDataHighlightProvidingShape><any>shape).createHighlighter){
                return null;
            }
            return (<IDataHighlightProvidingShape><any>shape).createHighlighter();
        });
        grp.style = this.style;
        return grp;
    }

    public draw(ctx: CanvasContext){
        drawByStyle(<IStylable><any>this, ctx, () => {
            drawIteratorChildren(this.shapes.iterator(), ctx);
        });
    }

    public find(pt: IPoint, ctx: CanvasContext){
        var res =  this.finder.find(pt, ctx);
        return res;
    }

    highlight(): ICancellable{
        return highlight(this);
    }

    public round(n: number){
        return roundStroke(n);
    }
}