import {BaseCartesianRenderer} from "../base";
import {ISeriesRendererSettings} from "../index";
import {ISeriesRenderer} from "../../../../series/render/base";
import {PointShapeRenderer} from "../point/group";
import {ColumnShapeRenderer} from "./column/group";
import {AreaShapeRenderer, IAreaShapeSettings, StackedAreaShapeRenderer} from "./area/shape";
import {LineShapeRenderer, StackedLineShapeRenderer} from "./line/shape";
import {NormalCartesianCategorySeriesGroupRenderer} from "../category/shape";
import {create} from "../../../../../config/di";
import {AreaIntervalShapeRenderer} from "../interval/area/shape";


export class ValueGroupSeriesRenderer extends BaseCartesianRenderer{

    @create
    createRenderer(set: ISeriesRendererSettings): ISeriesRenderer {
        switch(set.type){
            case "point":
                return new PointShapeRenderer(set)
            case "column":
                return new ColumnShapeRenderer(set);
            case "area":
                if (this.series.stack.present){
                    return new AreaIntervalShapeRenderer(<IAreaShapeSettings>set);
                }
                return new AreaShapeRenderer(<IAreaShapeSettings>set)
            case "line":
                if (this.series.stack.present){
                    return new StackedLineShapeRenderer(<IAreaShapeSettings>set);
                }
                return new LineShapeRenderer(set);
            case "discrete":
                return new NormalCartesianCategorySeriesGroupRenderer(set);
            default:
                throw new Error("Unknown renderer "+set.type);
        }
    }
}

/*

//import * as PIXI from 'pixi.js';
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

    attach(){
        this.width = this.center.width;
        this.height = this.center.height;
        this.renderer = new PIXI.Application(this.width, this.height, { antialias: true, transparent: true });
        this.renderer.ticker.autoStart = false;
        this.renderer.ticker.stop();
        this.graphics = new PIXI.Graphics();
        this.graphics.lineStyle(2, 0x0000FF, 1);
        this.graphics.beginFill(0xFF700B, 1);
        this.graphics.drawRect(50, 250, 120, 120);
        this.renderer.stage.addChild(this.graphics);
    }

    nr = 1;

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
        this.nr++;
        if (this.nr === 10){
            console.log("YO");
            this.graphics.lineStyle(2, 0x00FFFF, 1);
            this.graphics.beginFill(0x00FF0B, 1);
            this.graphics.drawRect(250, 250, 120, 120);
        }
        this.node.ctx.push(this.renderer.view);
        this.renderer.ticker.update(performance.now());
    }

}

export class PixiValueRenderer implements ISeriesRenderer{

    color: IColor;
    style: ICanvasStyle;

    @inject
    center: ChartCenter

    constructor(){

    }

    @init
    init(){
        var layer = this.center.getLayer(10);
        layer.child.push(new PixiShape(this.center));
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