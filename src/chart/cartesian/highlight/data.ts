import {IDataHighlightSettings} from "../../series/render/highlight";
import {IXYSeriesData, IXYSeriesSystem} from "../series/series";
import {IChartDataHighlighter, IDataHighlighter} from "../series/render/data/highlight/highlight";
import {HashMap} from "../../../collection/hash";
import {XYChart} from "../index";
import {hash} from "@reactivelib/core";

export interface ICartesianChartDataHighlightSettings{
    point?: IDataHighlightSettings;
    interval?: IDataHighlightSettings;
    candle?: IDataHighlightSettings;
}


interface IProvider{
    get(type: string): IDataHighlightSettings;
}

class ProvideHighlightForAll implements IProvider{
    constructor(public settings: IDataHighlightSettings){

    }

    public get(type: string){
        return this.settings;
    }
}

class ProviderByType implements IProvider{
    constructor(public settings: ICartesianChartDataHighlightSettings){

    }

    public get(type: string){
        return (<any>this.settings)[type];
    }
}

function settingsToTypeProvider(settings?: ICartesianChartDataHighlightSettings){
    if (!settings){
        return new ProvideHighlightForAll({});
    }
    return new ProviderByType(settings);
}

interface ISeriesHolder{
    series: IXYSeriesSystem;
}

type NumberAndSeries = number[] & ISeriesHolder;

export class ChartHighlightContext implements IChartDataHighlighter{

    public seriesToContext = new HashMap<IXYSeriesSystem, IDataHighlighter>();
    public provider: IProvider;

    constructor(public chart: XYChart, public settings: ICartesianChartDataHighlightSettings){
        this.provider = settingsToTypeProvider(settings);
    }

    public highlight(data: IXYSeriesData[]){
        var serIdToDatas: {[s: string]: NumberAndSeries} = {};
        for (var i=0; i < data.length; i++){
            var serId = hash(data[i].series);
            if (!(serId in serIdToDatas)){
                var ss: NumberAndSeries = <NumberAndSeries>[];
                serIdToDatas[serId] = ss;
                (<any>ss).series  = data[i].series;
            }
            serIdToDatas[serId].push(data[i].index);
        }
        var processedSeries = new HashMap<any, any>();
        for (var sid in serIdToDatas){
            var datas = serIdToDatas[sid];
            var series = <IXYSeriesSystem>datas.series;
            var ctx = this.seriesToContext.get(series);
            if (!ctx){
                ctx = series.createDataHighlighter(this.provider.get(series.dataType));
                this.seriesToContext.put(series, ctx);
            }
            ctx.highlight(datas);
            processedSeries.put(series, series);
        }
        for (var o in this.seriesToContext.objects){
            if (!(o in processedSeries.objects)){
                this.seriesToContext.objects[o].value.highlight([]);
            }
        }
    }

    public cancel(){
        for (var s in this.seriesToContext.objects){
            this.seriesToContext.objects[s].value.cancel();
        }
    }

}