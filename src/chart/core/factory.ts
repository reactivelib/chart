/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CoreChart, IChartSettings} from "./basic";
import {IPadding} from "../../geometry/rectangle/index";
import {ICalendar} from "../../math/time/calendar";
import {IColor} from "../../color/index";
import {IGlobalChartSettings} from "../style";
import {MultiStarter} from "../../config/start";

export interface ICoreChartObjects{
    settings: IChartSettings;
    calendarFactory: (n: number) => ICalendar;
    chart: CoreChart;
    theme: IGlobalChartSettings;
    chartSettings: IChartSettings;
    padding: IPadding;
    starter: MultiStarter;
    provideColor: () => IColor;
    provideSeriesId: () => string;
    provideAreaId: () => string;
    gridFactories: any;
}
