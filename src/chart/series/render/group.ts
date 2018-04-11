import {ISeriesRenderer, ISeriesShape} from "./base";
import {ICancellable} from "@reactivelib/reactive";
import {IColor} from "../../../color/index";
import {
    DataHighlightGroupCollection,
    IHighlightedDataGroup
} from "../../cartesian/series/render/data/highlight/group/shape";


export abstract class AbstractGroupSeriesRenderer implements ISeriesRenderer{
    
    public color: IColor;

    public style: any;

    constructor(){
    }

    public abstract findShapesByIndex(data: any): ISeriesShape[];
    public abstract highlight(): ICancellable;
    public abstract cancel(): void;

}

export class GroupSeriesRenderer extends AbstractGroupSeriesRenderer{


    public seriesShapes: ISeriesRenderer[];
    public cancels: ICancellable[] = [];

    public highlightDataAtIndex(){
        var res: IHighlightedDataGroup[] = [];
        this.seriesShapes.forEach(ss => {
            if ("highlightDataAtIndex" in ss){
                res.push((<any>ss).highlightDataAtIndex());
            }
        });
        if (res.length > 0){
            var hl = new DataHighlightGroupCollection(res);
            return hl;
        }
        return null;
    }

    public findShapesByIndex(data: any): ISeriesShape[]{
        return this.seriesShapes.map(s => s.findShapesByIndex(data)).reduce((p, c, []) => p.concat(c));
    }

    public highlight(){
        var cancels = this.seriesShapes.map(s => s.highlight());
        return {
            cancel: () => {
                cancels.forEach(c => c.cancel());
            }
        }
    }

    public cancel(){
        this.seriesShapes.forEach(s => s.cancel());
        this.cancels.forEach(c => c.cancel());
    }

}