import {ICartesianChartSettings} from "../index";
import {IRelativePositionedGridElement} from "../../../component/layout/axis/positioning/relative";
export function legendLayout(settings: ICartesianChartSettings): IRelativePositionedGridElement[]{
    if ("legend" in settings && !settings.legend){
        return [];
    }
    else {
        return [{
            position: "bottom",
            component: {
                type: "legend"
            }
        }]
    }
}