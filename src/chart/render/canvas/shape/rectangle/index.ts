/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasChildShape} from "../index";
import {ICanvasConfig} from "../create";
import {CanvasContext} from "../../context/index";
import {IPointRectangle, IRectangle} from "../../../../../geometry/rectangle/index";
import {IInteraction} from "../../interaction/index";
import {
    createRectangleConstrainer,
    IRectangleConstraints,
    RectangleConstrainer
} from "../../../../../geometry/rectangle/constrain";
import {IPoint} from "../../../../../geometry/point/index";
import {registerShapeDocumentMovement} from "../../../html/interaction/move/move";
import {ICanvasEvent, ICanvasEventSettings, ICanvasShapeEventHandler} from "../../event/index";
import {getTransform} from "../group/index";
import {dummy, extend} from "@reactivelib/core";
import {IPointShape} from "../point/index";
import {MovingPreviewRectangle} from "./interaction/preview";
import {sideToRectangleMod} from "./interaction/index";
import {AbstractCanvasShape} from "../basic";
import {addEventTo, removeEventFrom} from "../../event/factories";
import {makeRectangleCrisp} from './generate/crisp';
import {transformRectangle} from './generate/transform';
import {roundFillOrStroke} from "../round/strokeFill";
import {node} from "@reactivelib/reactive";
import {drawArrayChildren} from "../group/draw/children";
import {IFindInfo} from "../../find/index";

export interface IRectangleCanvasShape extends ICanvasChildShape, IRectangle {

}

export type IRectangleModifySide = "xStart" | "yStart" | "xEnd" | "yEnd";

export interface IThumbSettings{
    sides?: IRectangleModifySide[];
    /**
     * When to show the thumbs. Default value "always".
     * 
     * 
     * |value|description|
     * |--|--|
     * |"click"|Shown when user clicks on shape|
     * |"over"|Shown when user moves over shape|
     * |"always"|Always shawn|
     */
    show?: "click" | "over" | "always";
}

export interface IRectangleModificationSettings{
    /**
     * At which sides to add thumbs to modify the shape
     */
    
    thumbs?: IThumbSettings;
    
    /**
     * Define possible values here
     */
    constraints?: IRectangleConstraints;
    /**
     * If true, the whole shape can be moved
     * @default true
     */
    movable?: boolean;
    applyValues?: "immediate" | "finish" | "never";
    onEnd?: (shape: ICanvasChildShape, mod: IRectangle) => void;
    onStart?: (shape: ICanvasChildShape, mod: IRectangle) => void;
    onMove?: (shape: ICanvasChildShape, mod: IRectangle) => void;
}

/**
 * Interaction settings for a rectangle shape
 */
export interface IRectangleInteraction extends IInteraction{

    /**
     * Should the user be able to modify this rectangle.
     */
    modify?: boolean | IRectangleModificationSettings;
    
}

/**
 *  Creates a rectangle.
 */
export interface IRectangleConfig extends ICanvasConfig{

    tag?: "rectangle";
    /**
     * x-position
     */
    x?: number;
    /**
     * y-position
     */
    y?: number;
    /**
     * width
     */
    width?: number;
    /**
     * height
     */
    height?: number;
    
    interaction?: IRectangleInteraction;
    
}

export interface IPartialRectangleGenerator{
    generateRectangle(ctx: CanvasContext): IPointRectangle;
}

export class SettingsRectangleRenderer extends AbstractCanvasShape implements ICanvasShapeEventHandler{

    public additionalEvents: ICanvasEventSettings = {};
    public preview: ICanvasChildShape[];
    public $r = node();

    constructor(public settings: IRectangleConfig){
        super();
    }

    public addChild(c: ICanvasChildShape){
        if (!this.preview){
            this.preview = [];
        }
        this.preview.push(c);
        this.$r.changedDirty();
    }

    public removeChild(c: ICanvasChildShape){
        var indx = this.preview.indexOf(c);
        if (indx >= 0){
            this.preview.splice(indx, 1);
        }        
    }

    public generateRectangle(r: IRectangle, ctx: CanvasContext): IPointRectangle{
        return makeRectangleCrisp(transformRectangle({xs: r.x, ys: r.y, xe: r.x + r.width, ye: r.y + r.height}, ctx.transform), roundFillOrStroke(ctx));
    }

    onAttached(){
        if (this.preview){
            this.preview.forEach(p => {
                p.onAttached && p.onAttached();
            });
        }        
        this.settings.onAttached && this.settings.onAttached();
    }

    onDetached(){
        this.settings.onDetached && this.settings.onDetached();
        if (this.preview){
            this.preview.forEach(p => {
                p.onDetached && p.onDetached();
            });
        }
    }

    addEventListener(ev: string, listener: (ev: ICanvasEvent) => any, useCapture?: boolean): void{
        addEventTo(this.additionalEvents, ev, listener, useCapture);
    }
    removeEventListener(ev: string, listener: (ev: ICanvasEvent) => any, useCapture?: boolean): void{
        removeEventFrom(this.additionalEvents, ev, listener, useCapture);
    }

    find(pt: IPoint, ctx: CanvasContext){
        var res: IFindInfo[] = [];
        if (this.preview){
            for (var i=0; i < this.preview.length; i++){
                var p = this.preview[i];
                var r = p.find(pt, ctx);
                if (r){
                    r.forEach(ss => res.push(ss));
                }
            }
        }
        if (res.length > 0){
            return res;
        }
        return super.find(pt, ctx);
    }

    public drawShape(ctx: CanvasContext){
        this.$r.observed();
        var r = this.generateRectangle(this, ctx);
        this._bb = {
            x: r.xs,
            y: r.ys,
            width: r.xe - r.xs,
            height: r.ye - r.ys
        };
        this.drawRectangle(r, ctx);
    }

    public drawRectangle(r: IPointRectangle, ctx: CanvasContext){
        drawPointRectangle(ctx, r);
    }

    public draw(ctx: CanvasContext){
        super.draw(ctx);
        if (this.preview){
            drawArrayChildren(this.preview, ctx);            
        }
    }

    get style(){
        return this.settings.style;
    }

    get interaction(){
        return this.settings.interaction;
    }

    get events(){
        return [this.settings.event, this.additionalEvents];
    }

    get x(){
        return this.settings.x;
    }

    set x(v: number){
        this.settings.x = v;
    }

    get y(){
        return this.settings.y;
    }

    set y(v: number){
        this.settings.y= v;
    }

    get width(){
        return this.settings.width;
    }

    set width(v: number){
        this.settings.width = v;
    }

    get height(){
        return this.settings.height;
    }

    set height(v: number){
        this.settings.height = v;
    }


}

export function getRectangleBoundingBox(rect: IPointRectangle, ctx: CanvasContext){
    return {
        x: rect.xs,
        y: rect.ys,
        width: rect.xe - rect.xs,
        height: rect.ye - rect.ys
    };
}

export function drawRect(r: IRectangle, ctx: CanvasContext){
    ctx.context.rect(r.x, r.y, r.width, r.height);
}

export function drawPointRectangle(ctx: CanvasContext, dr: IPointRectangle){
    ctx.context.rect(dr.xs, dr.ys, dr.xe - dr.xs, dr.ye - dr.ys);
}

export function drawClearRect(ctx: CanvasContext, r: IPointRectangle){
    ctx.context.clearRect(r.xs, r.ys, r.xe - r.xs, r.ye - r.ys);
}

var defaultConfig = {
    onMove: dummy,
    onStart: dummy,
    onEnd: dummy,
    applyValues: "finish",
    constrainer: createRectangleConstrainer({})
};

function createInteractionConfig(interaction: boolean | IRectangleModificationSettings){
    if (typeof interaction === "boolean"){
        return defaultConfig;
    }
    else {
        return extend({
            
        }, defaultConfig, interaction, {
            constrainer: createRectangleConstrainer(interaction.constraints)
        });
    }
}

export function fromConfig(config: IRectangleConfig): SettingsRectangleRenderer{
    var res: SettingsRectangleRenderer;
    res = new SettingsRectangleRenderer(config);
    if (config.interaction && config.interaction.modify){
        var interactionConfig = createInteractionConfig(config.interaction.modify);
        var mod = config.interaction.modify;
        var modRect: RectangleConstrainer = interactionConfig.constrainer;
        var movable = true;
        var sides: IRectangleModifySide[] = [];
        var mode = "over";
        if (typeof mod === "boolean"){
            
        }
        else {
            var handles = mod.thumbs || {};
            if ("movable" in mod){
                movable = mod.movable;
            }
            sides = handles.sides || [];
            mode = handles.show || "over";
        }
        var sideShapeMakers: (() => IPointShape)[] = [];
        sides.forEach(s => {
            sideShapeMakers.push(sideToRectangleMod[s](res, interactionConfig));
        });
        if (mode === "over"){
            addEventTo(res.additionalEvents,"enter", l => {
                sideShapeMakers.forEach(m => {
                    res.addChild(m());
                });
            });
            addEventTo(res.additionalEvents, "leave", l => {
                res.preview = [];
                res.$r.changedDirty();
            });
        }
        else if (mode === "click"){
            var downed = false;
            res.addEventListener("down", l => {
                downed = true;
            });
            res.addEventListener("up", l => {
                if (downed){
                    sideShapeMakers.forEach(m => {
                        res.addChild(m());
                    });
                }
            });
            res.addEventListener("leave", l => {
                res.preview = [];
                res.$r.changedDirty();
                downed = false;
            });
        }
        else {
            sideShapeMakers.forEach(m => {
                res.addChild(m());
            });
        }
        var started = false;
        if (movable){
            var dx = 0;
            var dy = 0;
            var topLeft: IPoint;
            var prev: MovingPreviewRectangle;
            registerShapeDocumentMovement({
                start: p => {
                    var str = getTransform(res);
                    var tr = str.copy().inverse();
                    started = false;
                    if (!tr.present){
                        return;
                    }
                    started = true;
                    (p).stopPropagation();
                    var rp = tr.value.transform(p.clientX, p.clientY);
                    dx = rp.x - res.x;
                    dy = rp.y - res.y;
                    topLeft = {
                        x: rp.x - dx,
                        y: rp.y - dy
                    }
                    prev = new MovingPreviewRectangle(res, topLeft);
                    if (interactionConfig.applyValues === "immediate"){
                        res.x = prev.x;
                        res.y = prev.y;
                        res.width = prev.width;
                        res.height = prev.height;
                    }
                    else {
                        res.addChild(prev);
                    }
                    interactionConfig.onStart(res, prev);
                },
                moveTo: p => {
                    if (!started){
                        return;
                    }
                    var str = getTransform(res);
                    var tr = str.copy().inverse();
                    if (!tr.present){
                        return;
                    }
                    var rp = tr.value.transform(p.clientX, p.clientY);
                    var nx = modRect.moveX(prev, rp.x - dx);
                    var ny = modRect.moveY(prev, rp.y - dy);
                    prev.x = nx;
                    prev.y = ny;
                    if (interactionConfig.applyValues === "immediate"){
                        res.x = prev.x;
                        res.y = prev.y;
                        res.width = prev.width;
                        res.height = prev.height;
                    }
                    res.$r.changedDirty();
                    interactionConfig.onMove(res, prev);
                },
                stop: p => {
                    if (interactionConfig.applyValues !== "never"){
                        res.x = prev.x;
                        res.y = prev.y;
                        res.width = prev.width;
                        res.height = prev.height;
                    }
                    res.removeChild(prev);
                    interactionConfig.onEnd(res, prev);
                }
            });
        }
    }
    return res;
}