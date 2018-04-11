/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasChildShape} from "../index";
import {applyNone, CanvasContext} from "../../context/index";
import {normalizeRad, pi05, pi1, pi15, pi2} from "../../../../../math/transform/polar";
import {ICanvasConfig} from "../create";
import {BoundingBoxCalculator, IPoint} from "../../../../../geometry/point/index";
import {IPaddingSettings} from "../../../../../geometry/rectangle/index";
import {IFindInfo} from "../../find/index";
import {AbstractCanvasShape} from "../basic";

export interface IDonutShapeConfig extends ICanvasConfig{

    x: number;
    y: number;
    startRadius: number;
    endRadius: number;
    startAngle?: number;
    endAngle?: number;

}

export class DonutRenderer extends AbstractCanvasShape{

    constructor(public settings: IDonutShapeConfig){
        super();
    }

    public drawShape(ctx: CanvasContext){
        this._bb = drawDoughnut(ctx, this);
    }

    get x(){
        return this.settings.x;
    }

    set x(v){
        this.settings.x = v;
    }

    get y(){
        return this.settings.y;
    }

    set y(v: number){
        this.settings.y = v;
    }

    get startRadius(){
        return this.settings.startRadius;
    }

    set startRadius(v: number){
        this.settings.startRadius = v;
    }

    get endRadius(){
        return this.settings.endRadius;
    }

    set endRadius(v){
        this.settings.endRadius = v;
    }

    get startAngle(){
        return this.settings.startAngle || 0;
    }

    get endAngle(){
        return this.settings.endAngle;
    }

    public interacts(pt: IPoint, screenPadding: IPaddingSettings, context: CanvasContext){
        var pad = 0;
        if (screenPadding){
            pad = Math.max(screenPadding.left || 0, screenPadding.top || 0, screenPadding.left || 0, screenPadding.bottom || 0);
        }
        var inv = context.transform.copy().inverse();
        if (!inv.present){
            return false;
        }
        pt = inv.value.transform(pt.x, pt.y);
        var x = pt.x - this.x;
        var y = pt.y - this.y;
        var angle = normalizeRad(Math.atan2(y, x));
        var radius = Math.sqrt(x *x + y * y);
        var sa = normalizeRad(this.startAngle);
        var ea = normalizeRad(this.endAngle);
        var cont = false;
        if (sa > ea){
            cont = angle >= sa || angle <= ea;
        }
        else
        {
            cont = angle <= ea && angle >= sa;
        }
        return cont && radius >= Math.max(0, this.startRadius - pad) && radius <= (this.endRadius + pad);
    }


    public find(pt: IPoint, ctx: CanvasContext): IFindInfo[]{
        if (this.interacts(pt, ctx.interaction.interaction.screenPadding, ctx)){
            return [{shape: this}];
        }
        return [];
    }

}

export function donutInteracts(donut: IDonut, pt: IPoint, context: CanvasContext){
    var screenPadding = context.interaction.interaction.screenPadding;
    var pad = 0;
    if (screenPadding){
        pad = Math.max(screenPadding.left || 0, screenPadding.top || 0, screenPadding.left || 0, screenPadding.bottom || 0);
    }
    var inv = context.transform.copy().inverse();
    if (!inv.present){
        return false;
    }
    pt = inv.value.transform(pt.x, pt.y);
    var x = pt.x - donut.x;
    var y = pt.y - donut.y;
    var angle = normalizeRad(Math.atan2(y, x));
    var radius = Math.sqrt(x *x + y * y);
    var sa = normalizeRad(donut.startAngle);
    var ea = normalizeRad(donut.endAngle);
    var cont = false;
    if (sa > ea){
        cont = angle >= sa || angle <= ea;
    }
    else
    {
        cont = angle <= ea && angle >= sa;
    }
    return cont && radius >= Math.max(0, donut.startRadius - pad) && radius <= (donut.endRadius + pad);
}

export function fromConfig(config: IDonutShapeConfig){
    var res = new DonutRenderer(config);
    return res;
}

export interface IDonut{
    startRadius: number;
    endRadius: number;
    startAngle: number;
    endAngle: number;
    x: number;
    y: number;
}

export interface IDonutShape extends ICanvasChildShape, IDonut{

    

}

export function drawDoughnut(ctx: CanvasContext, shape: IDonut){
    var cx = shape.x;
    var cy = shape.y;
    var sr = Math.max(0, shape.startRadius);
    var er = Math.max(sr, shape.endRadius);
    var pt = ctx.transform.transform(cx, cy);
    cx = Math.round(pt.x);
    cy = Math.round(pt.y);
    var startAngle = normalizeRad(shape.startAngle);
    var endAngle = normalizeRad(shape.endAngle);
    var fullCircle = false;
    if (startAngle === 0 && endAngle === 0){
        endAngle = pi2;
        fullCircle = true;
    }
    var sRadius = Math.max(0, sr);
    var eRadius = Math.max(0, er);

    var x1 = cx + sRadius*Math.cos(startAngle);
    var y1 = cy + sRadius*Math.sin(startAngle);

    var x2 = cx + eRadius*Math.cos(startAngle);
    var y2 = cy + eRadius*Math.sin(startAngle);

    var x3 = cx + eRadius*Math.cos(endAngle);
    var y3 = cy + eRadius*Math.sin(endAngle);

    var x4 = cx + sRadius*Math.cos(endAngle);
    var y4 = cy + sRadius*Math.sin(endAngle);

    var bb = new BoundingBoxCalculator();
    bb.addPoint(cx, cy);
    bb.addPoint(x1, y1);
    bb.addPoint(x2, y2);
    bb.addPoint(x3, y3);
    bb.addPoint(x4, y4);

    if (endAngle < startAngle){
        bb.addPoint(cx + eRadius, cy);
    }
    if (startAngle < pi05 && (endAngle > pi05 || endAngle < startAngle) ||
        startAngle > pi05 && (endAngle > pi05 && endAngle < startAngle)){
        bb.addPoint(cx, cy + eRadius);
    }
    if (startAngle < pi1 && (endAngle > pi1 || endAngle < startAngle) ||
        startAngle > pi1 && (endAngle > pi1 && endAngle < startAngle)){
        bb.addPoint(cx - eRadius, cy);
    }
    if (startAngle < pi15 && (endAngle > pi15 || endAngle < startAngle) ||
        startAngle > pi15 && (endAngle > pi15 && endAngle < startAngle)){
        bb.addPoint(cx, cy - eRadius);
    }
    var _bb = bb.getBoundingBox();

    var c = ctx.context;
    c.beginPath();
    if (shape.startRadius === 0){
        if (!fullCircle){
            c.moveTo(x1, y1);
            c.lineTo(x2, y2);
        }
        c.arc(cx, cy, eRadius, startAngle, endAngle);
        c.closePath();
    }
    else
    {
        if (fullCircle){
            
            c.arc(cx, cy, eRadius, startAngle, endAngle, false);
            c.arc(cx, cy, sRadius, startAngle, endAngle, true);
            ctx.style.applyFill(ctx);
            if (ctx.style.applyStroke !== applyNone){
                c.beginPath();
                c.arc(cx, cy, eRadius, startAngle, endAngle, false);
                c.stroke();
                c.beginPath();
                c.arc(cx, cy, sRadius, startAngle, endAngle, true);
                ctx.style.applyStroke(ctx);
            }
            ctx.context.beginPath();
        }
        else
        {
            c.moveTo(x1, y1);
            c.lineTo(x2, y2);
            c.arc(cx, cy, eRadius, startAngle, endAngle);
            c.lineTo(x4, y4);
            c.arc(cx, cy, sRadius, endAngle, startAngle, true);
            c.closePath();
        }
    }
    return _bb;
}