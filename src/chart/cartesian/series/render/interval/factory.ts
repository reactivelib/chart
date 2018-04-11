import {BaseCartesianRenderer} from "../base";
import {ISeriesRendererSettings} from "../index";
import {ISeriesRenderer} from "../../../../series/render/base";
import {AreaIntervalShapeRenderer} from "./area/shape";
import {IntervalColumnShapeRenderer} from "./column/factory";

export class IntervalGroupSeriesRenderer extends BaseCartesianRenderer{

    createRenderer(set: ISeriesRendererSettings): ISeriesRenderer {
        switch(set.type){
            case "area":
                return new AreaIntervalShapeRenderer(set)
            case "column":
                return new IntervalColumnShapeRenderer(set);
            default:
                throw new Error("Unknown renderer "+set.type);
        }
    }
    

}