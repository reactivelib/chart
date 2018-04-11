import {BaseCartesianRenderer} from "../../../series/render/base";
import {ISeriesRendererSettings} from "../../../series/render";
import {ISeriesRenderer} from "../../../../series/render/base";
import {PointShapeRenderer} from "../../../series/render/point/group";
import {NormalCartesianCategorySeriesGroupRenderer} from "../../../series/render/category/shape";
import {create} from "../../../../../config/di";

export class XYPointSeriesRenderer extends BaseCartesianRenderer{


    @create
    createRenderer(set: ISeriesRendererSettings): ISeriesRenderer{
        switch(set.type){
            case "point":
                return new PointShapeRenderer(set)
            case "discrete":
                return new NormalCartesianCategorySeriesGroupRenderer(set)
            default:
                return new PointShapeRenderer(set);

        }
    }
}