/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IRectangle} from "../../../../geometry/rectangle/index";
import {ITooltipLayouterSettings, TooltipLayouter} from "../../../../geometry/layout/tooltip/index";
import {arrayIterator} from "../../../../collection/iterator/array";
import {IRectangleCanvasShape} from "../../canvas/shape/rectangle/index";

export interface ITargetAndContent{

    content: IRectangle;
    target: IRectangle;

}

export interface ITooltipManager{

    layout(tooltips: ITargetAndContent[]): void;

}

export class TooltipManager implements ITooltipManager{

    public layouter = new TooltipLayouter();
    

    constructor(public container: IRectangle){
        
    }

    public layout(tooltips: ITargetAndContent[]){
        var ts = tooltips.map(tts => {
            var targ: ITooltipLayouterSettings = {
                target: tts.target,
                boundingBox: tts.content
            }
            return targ;
        });
        var layouts = this.layouter.layout(arrayIterator(ts), this.container);
        layouts.forEach((l, indx) => {
            if (l){
                var tt = tooltips[indx];
                tt.content.x = l.x;
                tt.content.y = l.y;
            }
            else {
                var tt = tooltips[indx];
                tt.content.x = -1000;
                tt.content.y = -1000;
            }
        });
    }

}

export function createTooltipManager(container: IRectangle): ITooltipManager{
    var man = new TooltipManager(container);
    return man;
}