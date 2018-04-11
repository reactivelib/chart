import {ICartesianChart, ICartesianChartSettings} from "../index";
import {IXYSeriesCollection} from "./series/base";
import {IChartXYSeriesSettings, IXYSeriesSettings} from "./series/factory";

export interface IXYChart extends ICartesianChart{
    type: "xy";
    series: IXYSeriesCollection;
}

/**
 *  @editor
 */
export interface IXYChartSettings extends ICartesianChartSettings{
    type: "xy";
    series?: IXYSeriesSettings[] |  IChartXYSeriesSettings;
}