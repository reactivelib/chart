/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {PieSeries} from "./index";
import {CanvasContext} from "../../render/canvas/context/index";
import {drawDoughnut} from "../../render/canvas/shape/doughnut/index";
import {color} from "../../../color";


export class PieHighlighterShape{

    public tag = "custom";

    constructor(public series: PieSeries, public index: number){

    }
    
    draw(ctx: CanvasContext){
        var sp = this.series.renderedShapes[this.index];
        if (sp){
            var last = ctx.context.strokeStyle;
            var hsl = color(sp.color).toHSL();
            hsl.l -= 0.15;            
            ctx.context.strokeStyle = hsl.toRGB().toString();
            drawDoughnut(ctx, sp);
            ctx.context.stroke();
            ctx.context.beginPath();
            ctx.context.strokeStyle = last;
        }
    }

}

export interface IPieSeriesHighlightSettings{
    data: number[];
}