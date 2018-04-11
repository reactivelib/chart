import {ICartesianChartSettings} from "../index";
import {IAxisCollection} from "../axis/collection/index";
import {IRelativePositionedGridElement} from "../../../component/layout/axis/positioning/relative";

export function scrollbarLayout(settings: ICartesianChartSettings, yAxes: IAxisCollection): IRelativePositionedGridElement[]{
    if (settings.scrollbars){
        if (settings.type === "x"){
            var origin = yAxes.origin;
            if (origin === "bottom" || origin === "top"){
                return [{
                    position: "top",
                    component: {
                        type: "scrollbar"
                    }
                }]
            }
            return [{
                position: "right",
                component: {
                    type: "scrollbar"
                }
            }]
        }
        else {
            return [{
                position: "top",
                component: {
                    type: "scrollbar"
                }
            },{
                position: "right",
                component: {
                    type: "scrollbar"
                }
            }]
        }
    }
    return [];
}