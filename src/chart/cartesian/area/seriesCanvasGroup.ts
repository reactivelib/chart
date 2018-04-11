import {XYChart} from "../index";
import {ICartesianSeries} from "../series/series";
import {default as renderCanvas, ICanvasShapeOrConfig} from "../../render/canvas/shape/create";
import {HashMap} from "../../../collection/hash";
import {node} from "@reactivelib/reactive";
import {ICanvasChildShape} from "../../render/canvas/shape/index";
import {XYAreaSystem} from "./index";
import {init, inject} from "../../../config/di";

export class SeriesCanvasGroup{

    public tag = "g";
    public seriesToRenderer = new HashMap<ICartesianSeries, ICanvasShapeOrConfig>();
    public $r = node();
    public node: ICanvasChildShape;

    @inject
    public chart: XYChart
    @inject
    viewport: XYAreaSystem

    public register(series: ICartesianSeries, canvas: ICanvasShapeOrConfig){
        this.$r.changedDirty();
        this.seriesToRenderer.put(series, canvas);
        return {
            cancel: () => {
                this.seriesToRenderer.remove(series);
            }
        }
    }

    constructor(){

    }

    get child(){
        this.$r.observed();
        var coll = this.chart.series.collection.values;
        var res = [];
        for (var i=0; i < coll.length; i++){
            var c = coll[i];
            var rend = this.seriesToRenderer.get(c);
            if (rend){
                res.push(rend);
            }
        }
        return res;
    }

    @init
    init(){
        var canvasGroup = this.viewport.canvasGroup;
        canvasGroup.addChild(renderCanvas(this));
        this.chart.center.getLayer(0).getCanvas().child.push(canvasGroup);
        this.viewport.cancels.push({
            cancel: () => {
                var c = this.chart.center.getLayer(0).getCanvas().child;
                c.remove(c.indexOf(canvasGroup));
            }
        });
    }
}