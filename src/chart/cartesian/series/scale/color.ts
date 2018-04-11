import {ICartesianSeries, ICartesianSeriesSettings} from "../series";
import {ColorScaleCollection, IColorScale} from "../../../render/canvas/scale/color/index";
import {optional, procedure} from "@reactivelib/reactive";
import {AbstractSeries} from "../../../series/index";

export default function(series: ICartesianSeries, settings: ICartesianSeriesSettings, globalSettings: ICartesianSeriesSettings, colorScales: ColorScaleCollection){
    var res = optional<IColorScale>();
    var prc = procedure(p => {
        var scale = settings.colorScale || globalSettings.colorScale;
        if (scale){
            var cs = colorScales.get(scale);
            if (cs){
                res.value = cs;
                return;
            }
            if (!cs && scale === "default"){
                cs = colorScales.add({
                    type: "direct",
                    id: "default"
                });
                res.value = cs;
                return;
            }
            res.empty();
        }
    });
    (<AbstractSeries><any>series).cancels.push(prc);
    return res;
}