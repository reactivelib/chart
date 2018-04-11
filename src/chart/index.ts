import {IChart} from "./core/basic";
import {ICartesianChart, ICartesianChartSettings} from "./cartesian/index";
import {IXYChart, IXYChartSettings} from "./cartesian/xy/index";
import {IXChart} from "./cartesian/series/x/index";
import {getTheme as getThemeMod, IGlobalChartSettings, setTheme as setThemeMod, ThemeTypes as TT} from "./style";
import {
    IChartCategoricalAxisSettings,
    IChartLinearAxisSettings,
    IChartLogAxisSettings
} from "./cartesian/axis/collection/factory";
import {IPieChartSettings} from "./pie/factory";
import {IChartXSortedValueSeriesSettings, IXSortedValueSeriesSettings} from "./cartesian/series/x/value";
import {IChartXSortedIntervalSeriesSettings, IXSortedIntervalSeriesSettings} from "./cartesian/series/x/interval";
import {IChartXSortedCandleSeriesSettings, IXSortedCandleSeriesSettings} from "./cartesian/series/x/candlestick";
import {attach as at, detach as dt} from "@reactivelib/html";
import {ReactiveXSortedRingBuffer} from "./reactive/collection/ring";
import {ICartesianXPoint} from "../datatypes/value";
import {IXChartSettings} from "./cartesian/series/x";
import {assemble} from "../config/di";
import {ChartFactory} from "./module";

var fact = new ChartFactory()
var render: ChartFactory = assemble({
    instance: fact
});

/**
 * Creates a new cartesian chart of type "xy"
 * @param config
 */
function chart(config: IXYChartSettings): IXYChart;
/**
 * Creates a new cartesian chart of type "x"
 * @param config
 */
function chart(config: IXChartSettings): IXChart;
/**
 * Creates a new chart. For more info, take a look at @rest{/tutorial} or at the chart options
 *
 * @param settings The chart settings
 * @returns {IChart} The created chart
 *
 */
function chart(settings: ICartesianChartSettings): ICartesianChart{
    return <ICartesianChart>render.createChart(settings);
}

/**
 * Chart specific interfaces and functions
 */
namespace chart{

    export type ThemeTypes = TT;

    export function attach(node, settings){
        return at(node, settings);
    }

    export function detach(node){
        dt(node);
    }
    
    export function setTheme(settings: IGlobalChartSettings | ThemeTypes){
        setThemeMod(settings);
    }
    
    export function getTheme(){
        return getThemeMod();
    }
    
    export namespace cartesian{
        export type ChartAxisType = IChartCategoricalAxisSettings | IChartLogAxisSettings | IChartLinearAxisSettings;
        export type CartesianChartTypes = IXChartSettings | IXYChartSettings | IPieChartSettings;
        export type CartesianSeriesType = IXSortedValueSeriesSettings | IChartXSortedValueSeriesSettings
            | IChartXSortedIntervalSeriesSettings | IXSortedIntervalSeriesSettings |
            IChartXSortedCandleSeriesSettings | IXSortedCandleSeriesSettings;
    }

    export function debug(){
        var element = document.getElementById("chart");
        var d = new ReactiveXSortedRingBuffer<ICartesianXPoint>();
        d.push({
            x: 0,
            y: 0.5
        });
        d.push({
            x: 1,
            y: 2
        });
        d.push({
            x: 2, y: 4
        });
        var kaka = [];
        var baba = [];
        var tata = [];
        for (var i=0; i < 20; i++){
            kaka.push({
                x: i, y: Math.random()*400
            });
            baba.push({
                x: i, y: Math.random()*4000
            });
            tata.push({
                x: i, y: Math.random()*40000
            });
        }
        var axis = {
            type: "discrete",
            categories: ["ASDasdf", "Bsdfsadf", "Csadfasdf"],
            shared: true
        };
        var ch = chart({
            type: "x",
            xAxis: <any>{
                type: "discrete",
                categories: ["1960", "1970", "1980", "1990", "2000", "2010"],
            },
            series: {
                shape: "column",
                series: [{
                    id: "Canada",
                    data: [5, 20, 36, 10, 10, 20]
                },
                    {
                        id: "SDGas",
                        data: [5, 20, 36, 10, 10, 20]
                    }]
            }
        });

        attach(element, ch);

        return ch;
    }
    
}
export = chart;