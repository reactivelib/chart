/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {applyNone, CanvasContext, ctxStyleMappings, ILinearGradient} from "../context/index";
import {extend} from "@reactivelib/core";
import {IAppliedCanvasStyle, ICanvasStyle} from "./index";
import {IRectangle} from "../../../../geometry/rectangle/index";
import {dummy} from "@reactivelib/core";
import {createLinearUserGradient, fillShapeGradient, strokeShapeGradient} from "./gradient";

export function applyStyleToContext(ctx: CanvasContext, bb: IRectangle = null){
    var s = ctx.style;
    if (s.lineDash){
        ctx.context.setLineDash(s.lineDash);
    }
    s.applyFill(ctx, bb);
    s.applyStroke(ctx, bb);
    if (s.lineDash){
        ctx.context.setLineDash([]);
    }
}

var reservedProperties = {
    fillStyle: "fillStyle",
    strokeStyle: "strokeStyle"
}


function fill(ctx: CanvasContext){
    ctx.context.fill();
}

function stroke(ctx: CanvasContext){
    ctx.context.stroke();
}

interface IApplyUnapply{
    apply: (ctx: CanvasContext) => void;
    unapply: (ctx: CanvasContext) => void;
}

function summarizeFillStyle(styleObj: any, ss: IAppliedCanvasStyle, au: IApplyUnapply){
    if ("fillStyle" in ss){
        if (!ss.fillStyle){
            styleObj.fillStyle = null;
            styleObj.applyFill = applyNone;
        }
        else {
            if (typeof ss.fillStyle !== "string"){
                var gradient: ILinearGradient = ss.fillStyle;
                if (gradient.coordinates === "user"){
                    var oldApply = au.apply;
                    var oldFill: string | CanvasGradient | CanvasPattern;
                    au.apply = function(ctx: CanvasContext){
                        oldApply(ctx);
                        var c = ctx.context;
                        var grad = createLinearUserGradient(ctx, gradient);
                        oldFill = c.fillStyle;
                        c.fillStyle = grad;
                    }
                    var oldUnapply = au.unapply;
                    au.unapply = function(ctx: CanvasContext){
                        oldUnapply(ctx);
                        ctx.context.fillStyle = oldFill;
                        oldUnapply(ctx);
                    }
                    styleObj.applyFill = fill;
                }
                else
                {
                    styleObj.fillStyle = ss.fillStyle;
                    styleObj.applyFill = fillShapeGradient;
                }
            }
            else {
                styleObj.fillStyle = ss.fillStyle;
                styleObj.applyFill = fill;
            }
        }
    }
}

function summarizeStrokeStyle(styleObj: any, ss: IAppliedCanvasStyle, au: IApplyUnapply){
    if ("strokeStyle" in ss){
        if (!ss.strokeStyle){
            styleObj.strokeStyle = null;
            styleObj.applyStroke = applyNone;
        }
        else {
            if (typeof ss.strokeStyle !== "string"){
                var gradient: ILinearGradient = ss.strokeStyle;
                if (gradient.coordinates === "user"){
                    var oldApply = au.apply;
                    var oldFill: any;
                    au.apply = function(ctx: CanvasContext){
                        oldApply(ctx);
                        var c = ctx.context;
                        var grad = createLinearUserGradient(ctx, gradient);
                        oldFill = c.strokeStyle;
                        c.strokeStyle = grad;
                    }
                    var oldUnapply = au.unapply;
                    au.unapply = function(ctx: CanvasContext){
                        oldUnapply(ctx);
                        ctx.context.strokeStyle = oldFill;
                        oldUnapply(ctx);
                    }
                    styleObj.applyStroke = stroke;
                }
                else
                {
                    styleObj.strokeStyle = ss.strokeStyle;
                    styleObj.applyStroke = strokeShapeGradient;
                }
            }
            else
            {
                styleObj.strokeStyle = ss.strokeStyle;
                styleObj.applyStroke = stroke;
            }
        }
    }
}

export function summarizeState(style: ICanvasStyle, styles: ICanvasStyle[]){
    
    var ss: IAppliedCanvasStyle = extend({}, style);
    if (styles){
        styles.forEach(s => {
            ss = extend(ss, s);
        });
    }
    var styleObj: any = {};
    var oldStyles: any = {};
    var found = false;
    for (var p in ss){
        found = true;
        if (!(<any>reservedProperties)[p]){
            styleObj[p] = (<any>ss)[p];
        }
    }
    if (!found){
        return {
            apply: dummy,
            unapply: dummy
        }
    }
    var apply = function(ctx: CanvasContext){
        var c = ctx.context;
        for (var s in styleObj){
            var val = styleObj[s];
            var m = (<any>ctxStyleMappings)[s] || s;
            oldStyles[s] = ctx.style[s] || (<any>c)[m];
            (<any>c)[m] = val;
            ctx.style[s] = val; 
        }
    }
    var unapply = function(ctx: CanvasContext){
        var c = ctx.context;
        for (var s in oldStyles){
            var val = oldStyles[s];
            var m = (<any>ctxStyleMappings)[s] || s;
            (<any>c)[m] = oldStyles[s];
            ctx.style[s] = val;
        }
    }
    var au = {
        apply: apply, 
        unapply: unapply
    }
    summarizeFillStyle(styleObj, ss, au);
    summarizeStrokeStyle(styleObj, ss, au);
    return au;
}