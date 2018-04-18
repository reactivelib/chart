import {BaseCartesianRenderer} from "../base";
import {ISeriesRendererSettings} from "../index";
import {ISeriesRenderer} from "../../../../series/render/base";
import {AreaIntervalShapeRenderer} from "./area/shape";
import {IntervalColumnShapeRenderer} from "./column/factory";
import {create} from "../../../../../config/di";

export class IntervalGroupSeriesRenderer extends BaseCartesianRenderer{

    @create
    createRenderer(set: ISeriesRendererSettings): ISeriesRenderer {
        switch(set.type){
            case "column":
                return new IntervalColumnShapeRenderer(set);
            default:
                return new AreaIntervalShapeRenderer(set)
        }
    }
    

}