import {IShapeDataHolder} from "../transform";
import {ITransformerData} from "./transformer";
import {IXIndexedData} from "../../../../datatypes/range";
import {create, inject} from "../../../../config/di";
import {variable} from "@reactivelib/reactive";
import {IReactiveRingBuffer, IReactiveXSortedRingBuffer} from "../../../reactive/collection/ring";
import {ICartesianChartSettings, XYChart} from "../../../cartesian";
import {CartesianSeries} from "../../../cartesian/series/series";
import {IShapeDataProvider, NormalShapeDataProvider, OffsetShapeDataProvider} from "./offset";
import {createShapesDataCollection} from "./data";
import {StackingShapesDataCollectionUpdater} from "./transformer/x/stacking";
import valueTransformer from './value/transformer';
import intervalTransformer from './interval/transformer';
import candleTransformer from './candle/transformer';
import {IDataTransformer} from "./transformer/x/update";
import {createShapesDataCollection as createXYColl} from './transformer/xy/data';

export class CartesianShapeData{

    @create
    xTypeToData: any;

    create_xTypeToData(){
        var self = this;
        return {
            point: this.valueData.bind(this),
            interval: this.intervalData.bind(this),
            candle: this.candleData.bind(this)
        }
    }

    @inject
    chartSettings: ICartesianChartSettings

    @inject
    series: CartesianSeries

    @inject
    chart: XYChart

    @create
    public r_shapeData: variable.IVariable<IReactiveRingBuffer<IShapeDataHolder<IXIndexedData>>>

    get shapeData(){
        return this.r_shapeData.value;
    }

    set shapeData(v){
        this.r_shapeData.value = v;
    }
    create_r_shapeData(){
        var lastData: ITransformerData = {
            cancel: () => {

            },
            data: null
        };
        var vari = variable<IReactiveRingBuffer<IShapeDataHolder<IXIndexedData>>>(null);
        vari.listener(v => {
            lastData.cancel();
            if (this.chartSettings.type === "xy"){
                lastData = createXYColl(this.pointTransformer(), this.series.data);
                v.value = lastData.data;
            }
            else {
                if (this.series.xCategory.present){
                    const xCat = this.series.xCategory.value;
                    xCat.nr;
                    xCat.position;
                    xCat.shared;
                    xCat.size;
                    xCat.stack;
                }
                lastData = this.xTypeToData[this.series.dataType]();
                v.value = lastData.data;
            }
        });
        this.series.cancels.push({
            cancel: () => {
                vari.cancel();
                lastData.cancel();
            }
        });
        return vari;
    }

    @create
    public r_shapeDataProvider: variable.IVariable<IShapeDataProvider>

    get shapeDataProvider(){
        return this.r_shapeDataProvider.value;
    }

    set shapeDataProvider(v){
        this.r_shapeDataProvider.value = v;
    }

    create_r_shapeDataProvider(){
        var res = variable<IShapeDataProvider>(null).listener((v) => {
            switch(this.chart.type){
                case "x":
                    v.value = new OffsetShapeDataProvider(<any>this.series.shapeData);
                    break;
                default:
                    v.value = new NormalShapeDataProvider(this.series.shapeData);
            }
        });
        this.series.cancels.push(res.$r);
        return res;
    }

    @create
    pointTransformer: () => IDataTransformer
    create_pointTransformer(): () => IDataTransformer{
        return valueTransformer(this.series.yCategory, this.series.xCategory);
    }

    @create
    intervalTransformer: () => IDataTransformer
    create_intervalTransformer(): () => IDataTransformer{
        return intervalTransformer(this.series.yCategory, this.series.xCategory);
    }

    @create
    candleTransformer: () => IDataTransformer
    create_candleTransformer(): () => IDataTransformer{
        return candleTransformer(this.series.yCategory, this.series.xCategory);
    }

    valueData(){
        if (this.series.stack.present){
            var updater = new StackingShapesDataCollectionUpdater(<IReactiveXSortedRingBuffer<any>>this.series.data, this.pointTransformer(), () => this.series.xAxis.window);
            var st = this.series.stack.value;
            st.add(updater);
            return {
                cancel: () => {
                    st.remove(updater);
                    updater.cancel();
                },
                data: updater.shapeData
            }
        }
        else
        {
            return createShapesDataCollection(this.pointTransformer(), () => this.series.xAxis.window, this.series.r_data);
        }
    }

    intervalData(){
        return createShapesDataCollection(this.intervalTransformer(), () => this.series.xAxis.window, this.series.r_data);
    }

    candleData(){
        return createShapesDataCollection(this.candleTransformer(), () => this.series.xAxis.window, this.series.r_data);
    }


}