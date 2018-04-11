import {CanvasContext} from "../../../render/canvas/context/index";
import {create, define, init, inject} from "../../../../config/di";
import {ICancellable, IReactiveNode, nullCancellable, procedure, unobserved, variable} from "@reactivelib/reactive";
import {FlexibleChildGroupRenderer} from "../../../render/canvas/shape/group/index";
import {XYAreaSystem} from "../../area";
import {ISeriesRenderer} from "../../../series/render/base";
import {CartesianSeries, ICartesianSeries, ICartesianSeriesSettings} from "../series";
import {seriesToRendererSettings} from "../../../series/render/settings";
import {GroupSeriesRenderer} from "../../../series/render/group";
import {ISeriesRendererSettings} from "./index";

export abstract class BaseCartesianRenderer extends GroupSeriesRenderer implements ISeriesRenderer{

    abstract createRenderer(set: ISeriesRendererSettings): ISeriesRenderer;

    @inject
    series: CartesianSeries

    @inject
    seriesReactive: IReactiveNode

    @inject
    settings: ICartesianSeriesSettings

    @inject
    globalSettings: ICartesianSeriesSettings

    @create
    public r_seriesShapes = variable<ISeriesRenderer[]>(null);

    get seriesShapes(){
        return this.r_seriesShapes.value;
    }

    set seriesShapes(v){
        this.r_seriesShapes.value = v;
    }

    @define
    public mappingGroup = new FlexibleChildGroupRenderer()

    create_r_seriesShapes(){
        var res = variable<ISeriesRenderer[]>([]);
        res.listener(v => {
            var sets = seriesToRendererSettings(this.settings.shape || this.globalSettings.shape || "point");
            this.mappingGroup.children.clear();
            var rends: ISeriesRenderer[] = [];
            for (var i=0; i < sets.length; i++){
                var set = sets[i];
                var renderer = unobserved(() => this.createRenderer(set));
                rends.push(renderer);
            }
            rends.forEach(r => {
                this.mappingGroup.addChild((<any>r));
            });
            v.value = rends;
        });
        return res;
    }

    initHtml(){
        var last: ICancellable = nullCancellable;
        var p = procedure(p => {
            last.cancel();
            var a = <XYAreaSystem>this.series.area;
            last = a.seriesCanvasGroup.register(this.series, {
                tag: "g",
                child: [this.mappingGroup,{
                    tag: "custom",
                    draw: (ctx: CanvasContext) => {
                        this.seriesReactive.observed();
                    }
                }]
            });
        });
        this.cancels.push({
            cancel: () => {
                p.cancel();
                last.cancel();
            }
        });
    }

    @init
    init(){

        this.seriesShapes
        this.initHtml()
    }

}