/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IAppliedCanvasStyle, ICanvasStyle, IStylable} from "./index";
import {applyNone, CanvasContext, ctxStyleMappings, ILinearGradient} from "../context/index";
import {
    createLinearUserGradient,
    fillShapeGradient,
    strokeShapeGradient
} from "./gradient";
import {applyStyleToContext} from "./draw";

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

export function applyStyle(style: ICanvasStyle, ctx: CanvasContext){
    var last: any = {};
    var _lastStyleState = last;
    if (style){
        var ctxStyle = <IAppliedCanvasStyle>ctx.style;
        var c = ctx.context;
        for (var p in style){
            var m = (<any>ctxStyleMappings)[p] || p;
            if (!(<any>reservedProperties)[m]){
                var val = (<any>style)[p];
                last[m] = ctx.style[m] || (<any>c)[m];
                ctx.style[m] = val;
                (<any>c)[m] = val;
            }
        }
        if ("fillStyle" in style){
            last.applyFill = ctxStyle.applyFill;
            if (!style.fillStyle){
                ctxStyle.fillStyle = null;            
                ctxStyle.applyFill = applyNone;
            }
            else {
                if (typeof style.fillStyle !== "string"){
                    var gradient: ILinearGradient = style.fillStyle;
                    if (gradient.coordinates === "user"){                    
                        var oldFill: string | CanvasGradient | CanvasPattern;                    
                        var grad = createLinearUserGradient(ctx, gradient);
                        last.fillStyle = c.fillStyle;
                        c.fillStyle = grad;
                        ctxStyle.applyFill = fill;
                    }
                    else
                    {
                        last.fillStyle = c.fillStyle;
                        c.fillStyle = <any>style.fillStyle;                        
                        ctxStyle.applyFill = fillShapeGradient;
                    }
                }
                else {
                    last.fillStyle = c.fillStyle;
                    c.fillStyle = style.fillStyle;
                    ctxStyle.applyFill = fill;
                }
            }
        }
        if ("strokeStyle" in style){
            last.applyStroke = ctxStyle.applyStroke;
            if (!style.strokeStyle){
                ctxStyle.strokeStyle = null;
                ctxStyle.applyStroke = applyNone;
            }
            else {
                if (typeof style.strokeStyle !== "string"){
                    var gradient: ILinearGradient = style.strokeStyle;
                    if (gradient.coordinates === "user"){                    
                        var oldFill: string | CanvasGradient | CanvasPattern;                    
                        var grad = createLinearUserGradient(ctx, gradient);
                        last.strokeStyle = c.strokeStyle;
                        c.strokeStyle = grad;
                        ctxStyle.applyStroke = stroke;
                    }
                    else
                    {
                        last.strokeStyle = c.strokeStyle;
                        c.strokeStyle = <any>style.strokeStyle;                        
                        ctxStyle.applyStroke = strokeShapeGradient;
                    }
                }
                else {
                    last.strokeStyle = c.strokeStyle;
                    c.strokeStyle = style.strokeStyle;
                    ctxStyle.applyStroke = stroke;
                }
            }
        }
    }
    return _lastStyleState;
}

export function unapplyStyle(oldStyles: any, ctx: CanvasContext){
    var c = ctx.context;
    for (var s in oldStyles){
        var val = oldStyles[s];
        (<any>c)[s] = val;
        ctx.style[s] = val;
    }
}

export function drawByStyle(shape: IStylable, ctx: CanvasContext, draw: () => void){
    var last = applyStyle(shape.style, ctx);
    draw();
    applyStyleToContext(ctx, (<any>shape)._bb);
    unapplyStyle(last, ctx);
    ctx.context.beginPath();
}