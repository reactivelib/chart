/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasChildShape} from "../index";
import {CanvasContext} from "../../context/index";
import {ICanvasConfig} from "../create";
import {IPoint} from "../../../../../geometry/point/index";
import {IInteraction} from "../../interaction/index";
import {IPointConstraints} from "../../../../../geometry/point/constrain";
import {createInteraction} from "./interaction/index";
import {AbstractCanvasShape} from "../basic";
import {ICanvasEvent, ICanvasEventSettings, ICanvasShapeEventHandler} from "../../event/index";
import crisp from './generate/crisp';
import transform from './generate/transform';
import {roundFillOrStroke} from "../round/strokeFill";
import {node} from "@reactivelib/reactive";
import {addEventTo, removeEventFrom} from "../../event/factories";

export interface IPointModificationSettings{
    
    /**
     * Constraints for moving the point
     */
    constraints?: IPointConstraints | ((point: IPoint) => IPoint);
    onStart?: (pt: IPoint, mod: IPoint) => void;
    onMove?: (pt: IPoint, mod: IPoint) => void;
    onEnd?: (pt: IPoint, mod: IPoint) => void;
    applyValue?: "immediate" | "finish" | "never";
    
}

export interface IPointInteraction extends IInteraction{
    modify: boolean | IPointModificationSettings;
}

/**
 * Settings for a point
 */
export interface IPointConfig extends ICanvasConfig{

    tag: "point";
    /**
     * x position
     */
    x: number;
    /**
     * y position
     */
    y: number;
    /**
     * radius, always in nr of pixels.
     */
    radius: number;
    /**
     * The shape of this point
     */
    form?: "rectangle" | "circle";
    /**
     * Defines the interaction for this point shape
     */
    interaction?: IPointInteraction;
}

export interface IPointShape extends ICanvasChildShape, IPoint{
    radius: number;
}

export interface IPointWithRadius extends IPoint{
    radius: number;
}

export class SettingsPointRenderer extends AbstractCanvasShape implements ICanvasShapeEventHandler{

    public _events: ICanvasEventSettings = {};
    public preview: ICanvasChildShape;
    public $r = node();

    constructor(public settings: IPointConfig){
        super();
    }

    get style(){
        return this.settings.style;
    }

    get interaction(){
        return this.settings.interaction;
    }

    get events(){
        return [this._events, this.settings.event];
    }

    public generatePoint(ctx: CanvasContext){
        return crisp(transform({x: this.x, y: this.y, radius: this.radius}, ctx.transform), roundFillOrStroke(ctx));
    }

    onAttached(){
        this.settings.onAttached && this.settings.onAttached();
    }

    onDetached(){
        this.settings.onDetached && this.settings.onDetached();
    }

    addEventListener(ev: string, listener: (ev: ICanvasEvent) => any, useCapture?: boolean): void{
        addEventTo(this._events, ev, listener, useCapture);
    }

    removeEventListener(ev: string, listener: (ev: ICanvasEvent) => any, useCapture?: boolean): void{
        removeEventFrom(this._events, ev, listener, useCapture);
    }

    draw(ctx: CanvasContext){
        super.draw(ctx);
        this.preview && this.preview.draw(ctx);
    }

    drawShape(ctx: CanvasContext){
        this.$r.observed();
        var pt = this.generatePoint(ctx);
        var r = pt.radius;
        this._bb = {
            x: pt.x - r,
            y: pt.y - r,
            width: r * 2,
            height: r * 2
        }
        this.drawPoint(ctx, pt);
    }

    public drawPoint(ctx: CanvasContext, pt: IPointWithRadius){
        drawCirclePoint(pt, ctx);
    }
    
    public get y(){
        return this.settings.y;
    }
    
    public set y(v: number){
        this.settings.y = v;
    }

    public get x(){
        return this.settings.x;
    }

    public set x(v: number){
        this.settings.x = v;
    }

    public get radius(){
        return this.settings.radius || 4;
    }

    public set radius(v: number){
        this.settings.radius = v;
    }
}

export function fromConfig(config: IPointConfig): IPointShape{
    var pt = new SettingsPointRenderer(config);
    if (config.form){
        var drawer = createPointRendererByForm(config.form);
        pt.drawPoint = function(ctx, pt: IPointWithRadius){
            drawer(pt, ctx);
        }
    }
    if (config.interaction){
        createInteraction(config, pt);
    }
    return pt;
}

export function drawCirclePoint(shape: IPointWithRadius, ctx: CanvasContext){
    ctx.context.arc(shape.x , shape.y, shape.radius, 0, 2 * Math.PI);
}

export function drawThumb(shape: IPointWithRadius, ctx: CanvasContext){
    drawCirclePoint(shape, ctx);
}

export function drawRectanglePoint(shape: IPointWithRadius, ctx: CanvasContext){
    var x = shape.x;
    var y = shape.y;
    var r = shape.radius;
    var size = 2*r;
    ctx.context.rect(x, y, size,  size);
}

var formToRenderer = {
    circle: drawCirclePoint,
    rectangle: drawRectanglePoint
}

export function createPointRendererByForm(type: string): (shape: IPointWithRadius, ctx: CanvasContext) => void{
    return (<any>formToRenderer)[type];
}