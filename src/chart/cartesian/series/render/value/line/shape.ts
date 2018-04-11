/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasChildShape} from "../../../../../render/canvas/shape/index";
import {CanvasContext} from "../../../../../render/canvas/context/index";
import {IXSortedSeriesSystem} from "../../../x/index";
import {PointSeriesShape} from "../find";
import {ICartesianPointDataHolder} from "../../../../../data/shape/transform/cartesian/point/index";
import {getEndX} from "../../../../../../datatypes/range";
import {ICartesianXPoint} from "../../../../../../datatypes/value";
import {BruteForceSeriesShapeFinder} from "../../../../../render/canvas/series/find/data/brute";
import {IPoint} from "../../../../../../geometry/point/index";
import {drawByStyle} from "../../../../../render/canvas/style/apply";
import {ICancellable} from "@reactivelib/reactive";
import {highlight} from "../../../../../render/style/highlight/line/shape/color";
import {Highlighter} from "../../../../../render/style/highlight";
import {SeriesRenderer} from "../../../../../series/render/base";
import {ISeriesRendererSettings} from "../../index";
import {init} from "../../../../../../config/di";
import {provideLineStyle} from "../../../../../render/style/stylable";
import {ICartesianSeriesShapeSettings} from "../../../series";

function roundLine(v: number){
    return (v);
}

export interface ILineShapeSettings extends ICartesianSeriesShapeSettings{

    type: "line";

}


/*
class PixiShape{

    constructor(public center: ChartCenter){

    }

    tag = "div";

    style = {
        position: "absolute"
    }

    width: number = 0;
    height: number = 0;
    renderer
    stage
    graphics
    node: IHtmlShape;

    first = true;
    @inject
    series: CartesianSeries

    attach(){
        this.width = this.center.width;
        this.height = this.center.height;
        this.renderer = new PIXI.Application(this.width, this.height, { antialias: true, transparent: true });
        this.renderer.ticker.autoStart = false;
        this.renderer.ticker.stop();
        this.graphics = new PIXI.Graphics();
        this.renderer.stage.addChild(this.graphics);
    }

    public getPosX(data: ICartesianXPoint){
        return (data.x + getEndX(data)) / 2;
    }

    public getPosY(data: ICartesianXPoint){
        return data.y;
    }

    render(ctx: IHtmlRenderContext){
        if (this.first){
            this.attach();
            this.first = false;
        }
        this.node.renderAll();
        var w = this.center.width;
        var h = this.center.height;
        unobserved(() => {
            if (w !== this.width || w !== this.height){
                this.width = w;
                this.height = h;
                this.renderer.renderer.resize(w, h);
            }
        });
        var p = {x: 0, y: 0};
        var it = this.series.shapeData.iterator();
        if (it.hasNext()){
            var first = <ICartesianPointDataHolder>it.next();
        }
        else {
            return;
        }
        var tr = this.series.area.mapper
        tr.transformRef(this.getPosX(first), this.getPosY(first), p);
        var g = this.graphics;
        this.graphics.clear();
        this.graphics.lineStyle(2, 0x0000FF, 1);
        this.graphics.beginFill(0x0000FF, 1);
        //g.moveTo(roundLine(p.x), roundLine(p.y));
        while(it.hasNext()){
            var n = <ICartesianPointDataHolder>it.next();
            tr.transformRef(this.getPosX(n), this.getPosY(n), p);
            g.drawCircle(roundLine(p.x), roundLine(p.y), 2);
        }
        this.node.ctx.push(this.renderer.view);
        this.renderer.ticker.update(performance.now());
    }

}

export class PixiLineRenderer implements ISeriesRenderer{

    color: IColor;
    style: ICanvasStyle;

    @inject
    center: ChartCenter

    constructor(){

    }

    @create
    createShape(){
        return new PixiShape(this.center);
    }

    @init
    init(){
        var layer = this.center.getLayer(10);
        layer.child.push(this.createShape());
    }

    public draw(ctx: CanvasContext){

    }

    findShapesByIndex(data: any): ISeriesShape[] {
        return [];
    }

    cancel(): void {

    }

    highlight(): ICancellable {
        return nullCancellable;
    }



}
*/

export class LineShapeRenderer extends SeriesRenderer implements ICanvasChildShape{

    public parent: ICanvasChildShape;
    public finder: BruteForceSeriesShapeFinder<ICartesianXPoint>;
    public highlighter: Highlighter;
    series: IXSortedSeriesSystem

    constructor(settings: ISeriesRendererSettings){
        super(settings);
    }

    @init
    init(){
        this.finder = new BruteForceSeriesShapeFinder({
            iterator: () => {
                var it = this.series.shapeData.iterator();
                return {
                    hasNext: () => {
                        return it.hasNext();
                    },
                    next: () => {
                        var sd = it.next();
                        var shape = new PointSeriesShape(<ICartesianPointDataHolder>sd, this.series);
                        shape.parent = this;
                        (<any>shape).index = it.index;
                        return shape;
                    }
                }
            }
        }, (s: PointSeriesShape) => s.getScreenBoundingBox());
    }

    provideStyle(){
        return provideLineStyle(this.color);
    }

    public highlight(): ICancellable{
        return highlight(this);
    }
    
    public getPosX(data: ICartesianXPoint){
        return (data.x + getEndX(data)) / 2;
    }

    public getPosY(data: ICartesianPointDataHolder){
        return data.y;
    }

    public draw(ctx: CanvasContext){
        var nr = 0;
        drawByStyle(this, ctx, () => {
            var p = {x: 0, y: 0};
            var it = this.series.shapeData.iterator();
            if (it.hasNext()){
                var first = <ICartesianPointDataHolder>it.next();
            }
            else {
                return;
            }
            var c = ctx.context;
            var tr = ctx.transform;
            tr.transformRef(this.getPosX(first), this.getPosY(first), p);
            c.moveTo(roundLine(p.x), roundLine(p.y));
            while(it.hasNext()){
                var n = <ICartesianPointDataHolder>it.next();
                tr.transformRef(this.getPosX(n), this.getPosY(n), p);
                c.lineTo(roundLine(p.x), roundLine(p.y));
                nr++;
            }
        });
    }

    public findShapesByIndex(indx: number){
        var sd = this.series.shapeData.get(indx);
        if (!sd){
            return [];
        }
        var pss = new PointSeriesShape(<ICartesianPointDataHolder>sd, this.series);
        pss.parent = this;
        return [pss];
    }

    find(pt: IPoint, ctx: CanvasContext){
        return this.finder.find(pt, ctx);
    }
}

export class StackedLineShapeRenderer extends LineShapeRenderer{

    public getPosY(data: ICartesianPointDataHolder){
        return data.ye;
    }
}