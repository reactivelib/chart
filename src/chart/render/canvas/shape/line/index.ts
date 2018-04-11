/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CanvasContext} from "../../context/index";
import {pointXYDistance} from "../../../../../geometry/line/distance";
import {ICanvasConfig} from "../create";
import {ILine} from "../../../../../geometry/line/index";
import {IPoint} from "../../../../../geometry/point/index";
import {IPaddingSettings} from "../../../../../geometry/rectangle/index";
import {AbstractCanvasShape} from "../basic";

/**
 * Defines a line shape
 */
export interface ILineConfig extends ILine, ICanvasConfig{

    /**
     * Line type
     */
    tag?: "line";
    
}

export function drawLine(config: ILine, ctx: CanvasContext){
    var x1 = config.start.x;
    var y1 = config.start.y;
    var x2 = config.end.x;
    var y2 = config.end.y;
    var p1 = ctx.transform.transform(x1, y1);
    var p2 = ctx.transform.transform(x2, y2);
    x1 = p1.x;
    y1 = p1.y;
    x2 = p2.x;
    y2 = p2.y;
    ctx.context.moveTo(x1, y1);
    ctx.context.lineTo(x2, y2);
}

export class SettingsLineRenderer extends AbstractCanvasShape{

    constructor(public settings: ILineConfig){
        super();
    }

    get start(){
        return this.settings.start;
    }
    
    get end(){
        return this.settings.end;
    }

    get style(){
        return this.settings.style;
    }

    get interaction(){
        return this.settings.interaction;
    }

    get events(){
        return this.settings.event;
    }

    public drawShape(ctx: CanvasContext) {
        drawLine(this, ctx);
    }

    public interacts(pt: IPoint, screenPadding: IPaddingSettings, context: CanvasContext){
        var pad = 0;
        if (screenPadding){
            pad = Math.max(screenPadding.left || 0, screenPadding.top || 0, screenPadding.left || 0, screenPadding.bottom || 0);
        }
        var s = this.start;
        var e = this.end;
        var m = context.transform;
        s = m.transform(s.x, s.y);
        e = m.transform(e.x, e.y);
        var xyDist = pointXYDistance(pt,s, e);
        return xyDist - pad <= 3;
    }

    public find(pt: IPoint, ctx:CanvasContext){
        if (this.interacts(pt, ctx.interaction.interaction.screenPadding, ctx)){
            return [{shape: this}];
        }
        return null;
    }

}

export function fromConfig(config: ILineConfig){
    var r = new SettingsLineRenderer(config);
    return r;
}

export function crispLine(sp: IPoint, ep: IPoint, add = 0.5){
    if (Math.abs(sp.y - ep.y) > Math.abs(sp.x - ep.x)){
        sp.x = Math.floor(sp.x) + add;
        ep.x = Math.floor(ep.x) + add;
        sp.y = Math.round(sp.y);
        ep.y = Math.round(ep.y);
    }
    else
    {
        sp.x = Math.round(sp.x);
        ep.x = Math.round(ep.x);
        sp.y = Math.floor(sp.y) + add;
        ep.y = Math.floor(ep.y) + add;
    }
}