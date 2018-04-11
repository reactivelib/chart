import {IChart, IChartSettings, IDimensionSettings} from "../basic";
import {variable} from "@reactivelib/reactive";
import {parseDimensionSettings} from "./index";
import {deps} from "../../../config/di";

export default deps(function(settings: IChartSettings, chart: IChart){
    var width = variable<IDimensionSettings>(null).listener(v => {
        if (!chart.cancelled){
            v.value = parseDimensionSettings(settings.width);
        }
    });
    return width;
}, ["settings", "chart"])