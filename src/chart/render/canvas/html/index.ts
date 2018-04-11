/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {array, procedure, variable} from "@reactivelib/reactive";
import {html} from "@reactivelib/html";
import {CanvasContext} from "../context/index";
import {ICanvasChildShape} from "../shape/index";
import {IPoint} from "../../../../geometry/point/index";
import {AffineMatrix} from "../../../../math/transform/matrix";
import {FlexibleChildGroupRenderer} from "../shape/group/index";
import {CanvasMouseContext, ICanvasMouseContext} from "./event";
import {IFindInfo} from "../find/index";
import {IShapeConfig} from "@reactivelib/html";
import {default as renderCanvas, ICanvasShapeOrConfig} from "../shape/create";

var dummyMapper = new AffineMatrix(1, 0, 0, 0, 1, 0);

export class RenderTime{

    private r_avg = variable(0);

    get avg(){
        return this.r_avg.value;
    }

    set avg(v: number){
        this.r_avg.value = v;
    }
    public measurements = array<number>([]);
    public timeSum: number = 0;

}

/**
 * A shape representing a html canvas.
 */
export interface ICanvasHTMLShape extends html.IHtmlElementShape{

    globalCursor: string;

    events: ICanvasMouseContext;
    /**
     * Forces a redraw of the canvas image
     */
    redraw(): void;
    /**
     * The canvas element
     */
    element: HTMLCanvasElement;

    find(pt: IPoint): IFindInfo[];


}

export function renderCanvasContext(context: CanvasContext, shape: ICanvasChildShape, width: number, height: number){
    context.context.clearRect(0, 0, width, height);
    context.zIndex = 0;
    context.width = width;
    context.height = height;
    context.x = 0;
    context.y = 0;
    context.translateX = 0;
    context.translateY = 0;
    shape.draw(context);
}

export interface ICanvasRendererSettings extends IShapeConfig{
    tag: "canvas";
    child?: ICanvasShapeOrConfig[] | ICanvasShapeOrConfig | array.IReactiveArray<ICanvasShapeOrConfig>;
    node?: ICanvasHTMLShape;
    width?: number;
    height?: number;
    onAttached?(): void;
    onDetached?(): void;
};

export class CanvasRenderer implements ICanvasHTMLShape{

    public context: CanvasContext;
    public events: ICanvasMouseContext;
    public parent: html.IHtmlNodeShape;
    public element: HTMLCanvasElement;
    private _cursor: string = null;
    public childrenGroup: FlexibleChildGroupRenderer;
    private beforeDraws: (() => void)[] = [];
    public afterDraws: (() => void)[] = [];
    private r_globalCursor = variable(null);
    public inits: (() => void)[] = [];
    public __shape_node: boolean;
    
    public addInit(f: () => void){
        this.inits.push(f);
    }

    get parentModel(){
        return this.parent && this.parent.settings;
    }

    get enteredShapes(){
        return this.events.entered;
    }
    
    get globalCursor(){
        return this.r_globalCursor.value;
    }

    set globalCursor(v){
        this.r_globalCursor.value = v;
    }

    public addBeforeDraw(d: () => void){
        this.beforeDraws.push(d);
    }

    public removeBeforeDraw(d: () => void){
        this.beforeDraws.slice(this.beforeDraws.indexOf(d));
    }

    public mouseProce: procedure.IProcedure;
    public mouseCtx: CanvasMouseContext;

    public onAttached(){
        this._initCanvas();
        var self = this;
       /* var mouseCtx = manageCanvasMouseEvents({
            canvasNode: this,
            canvasElement: this.canvasElement,
            element: this.element
        });
        this.mouseCtx = mouseCtx;
        this.events = mouseCtx;*/
        this.mouseProce = procedure(() => {
        /*    var s: any = mouseCtx.over;
            if (this.globalCursor){
                this.cursor = this.globalCursor;
            }
            else if (s && s.style && s.style.cursor){
                this.cursor = s.style.cursor;
            }
            else
            {
                this.cursor = null;
            }*/
        });
        //setOverStyles(this);
        var self = this;
        this.childrenGroup = <FlexibleChildGroupRenderer>renderCanvas({
            tag: "g",
            get child(){
                return self.settings.child;
            }
        });
        this.childrenGroup.parent = this;
        this.childrenGroup.onAttached();
        this.settings.onAttached && this.settings.onAttached();
        this.updater = procedure.manual((p) => {
            this.resize();
            this.drawCanvasContent();
        });
    }

    public resize(){
        if (this.settings.width){
            if (this.width !== this.settings.width){
                this.width = this.settings.width;
            }
        }
        if (this.settings.height && this.settings.height !== this.height){
            this.height = this.settings.height;
        }
    }

    public drawCanvasContent(){
        var start = Date.now();
        this.inits.forEach(i => i());
        this.inits = [];
        this.beforeDraws.forEach(bd => bd());
        renderCanvasContext(this.context, this.childrenGroup, this.width, this.height);
        this.afterDraws.forEach(ad => ad());
        this.afterDraws = [];
        var end = Date.now();
        var runtime = end - start;
        this.renderTime.measurements.push(runtime);
        this.renderTime.timeSum += runtime;
        if (this.renderTime.measurements.length > 10){
            var rt = this.renderTime.measurements.remove(0);
            this.renderTime.timeSum -= rt;
        }
        this.renderTime.avg = this.renderTime.timeSum / this.renderTime.measurements.length;
    }

    public updater: procedure.IManualProcedureExecution;

    private first = true;

    public render(ctx: html.IHtmlRenderContext){
        if (this.first){
            this.onAttached();
        }
        this.first = false;
        ctx.push(this.element);
        this.updater.update();
    }

    public onDetached(){
        if (!this.first){
            this.childrenGroup.onDetached();
            //  this.mouseProce.$r.cancel();
            //   this.mouseCtx.cancel();
            this.settings.onDetached && this.settings.onDetached();
            this.first = true;
        }
    }

    public find(pt: IPoint){
        return this.childrenGroup.find(pt, this.context);
    }

    constructor(public settings: ICanvasRendererSettings){
        this.createElement();
        this.rWidth = variable(this.element.width);
        this.rHeight = variable(this.element.height);
        this.renderTime = new RenderTime();
    }

    public createElement(){
        this.element = document.createElement("canvas");
        var ctx = this.element.getContext("2d");
        this.context = new CanvasContext(ctx);
        this.context.canvasShape = this;
    }

    private set cursor(s: string){
        this._cursor = s;
        if (!s){
            this.context.context.canvas.style.cursor = "";
        }
        else
        {
            var st = this.context.context.canvas.style;
            st.cursor = "-moz-"+s;
            st.cursor = "-webkit-"+s;
            st.cursor = s;
        }
    }

    private get cursor(): string{
        return this._cursor;
    }

    public getMapper(){
        return dummyMapper;
    }

    public getTransform(){
        return new AffineMatrix(1, 0, 0, 0, 1, 0);
    }

    public getComposedInteraction(){
        return {};
    }
    
    public rWidth: variable.IVariable<number>;
    public rHeight: variable.IVariable<number>;
    public renderTime: RenderTime;
    
    public _initCanvas(){
        var el = this.element;
        this.width = el.width;
        this.height = el.height;        
    }

    public redraw(){
        this.updater.$r.changedDirty();
    }

    get width(){
        return this.rWidth.value;
    }

    get height(){
        return this.rHeight.value;
    }

    set width(w: number){
        var ctx = <any>this.context.context;
        var PIXEL_RATIO = (function () {
            var dpr = window.devicePixelRatio || 1;
            var bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || dpr;

            return dpr / bsr;
        })();
        var canvas = this.element;
        canvas.style.width  = w  + "px";
        canvas.width  = w * PIXEL_RATIO;
        var context = canvas.getContext('2d');
        context.scale(PIXEL_RATIO, PIXEL_RATIO)
        this.rWidth.value = canvas.width;
    }

    set height(h: number){
        var ctx = <any>this.context.context;
        var PIXEL_RATIO = (function () {
            var dpr = window.devicePixelRatio || 1;
            var bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || dpr;

            return dpr / bsr;
        })();
        var canvas = this.element;
        canvas.style.height  = h  + "px";
        canvas.height  = h * PIXEL_RATIO;

        var context = canvas.getContext('2d');
        context.scale(PIXEL_RATIO, PIXEL_RATIO)
        this.rHeight.value = canvas.height;
    }

}

CanvasRenderer.prototype.__shape_node = true;

export function createCanvasShape(shape: ICanvasRendererSettings){
    var r = new CanvasRenderer(shape);
    shape.node = r;
    return r;
}