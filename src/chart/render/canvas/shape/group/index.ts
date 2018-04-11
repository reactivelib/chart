/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasChildShape} from "../index";
import {array, ICancellable, variable} from "@reactivelib/reactive";
import {ICanvasConfig, ICanvasShapeOrConfig} from "../create";
import {IIterable, IIterator} from "../../../../../collection/iterator/index";
import {AffineMatrix, ITransformation} from "../../../../../math/transform/matrix";
import {iterable} from "../../../../../collection/iterator/array";
import {findCanvasShape} from "../../html/util";
import {ICancasShapeWithConfig} from '../settings';
import {CanvasContext} from "../../context/index";
import {drawArrayChildren, drawIteratorChildren} from "./draw/children";
import {IRectangle} from "../../../../../geometry/rectangle/index";
import {applyStyle, applyStyleToContext, ICanvasStyle, IStylable, unapplyStyle} from "../../style/index";
import {restorePositionAfter, restorePositionBefore} from "./transform/restorePos";
import {positionedAfter, positionedBefore} from "./transform/position";
import {clipAfter, clipBefore} from "./transform/clip";
import {afterTransform, beforeTransform} from "./transform/transformation";
import dim from './transform/dimension';
import {addChildAt, removeChildAt} from '../../group/array/reactive';
import {onAttached, onDetached} from '../../group/attach';
import {attachChildrenFromConfig} from './children';
import {findGroupChildren} from './find/children';
import {findSelf} from './find/self';
import {ITransformingShape} from "./transform/index";
import {IPoint} from "../../../../../geometry/point/index";
import {IFindInfo} from "../../find/index";
import {popInteraction, pushInteraction} from '../../find/interaction';
import {IInteraction} from "../../interaction/index";
import {getTransform as getShapeTransform} from './transform/getTransform';

export interface ICanvasGroup{
    addChild(child: ICanvasChildShape): void;
    removeChild(child: ICanvasChildShape): void;
}

export interface IReactiveArrayShapeGroup{

    children: array.IReactiveArray<ICanvasChildShape>;
    addChildAt(child: ICanvasChildShape, index: number): void;
    removeChildAt(index: number): ICanvasChildShape;

}

export function getTransform(shape: ICanvasChildShape): ITransformation{
    if (!shape){
        return new AffineMatrix(1, 0, 0, 0, 1, 0);
    }
    if ((<any>shape).__transform){
        return (<any>shape).__transform;
    }
    var tr: ITransformation;
    if ("getTransform" in shape){
        tr = (<ITransformingShape>shape).getTransform();
    }
    else if ((<any>shape).parent){
        tr = getTransform(<ICanvasChildShape> shape.parent);
    }
    else {
        tr = new AffineMatrix(1, 0, 0, 0, 1, 0);
    }
    var cs = findCanvasShape(shape);
    if(cs){
        cs.addInit(function(){
            (<any>shape).__transform = null;
        });
    }
    return tr;
}

export class FlexibleChildGroupRenderer implements ICanvasChildShape, IReactiveArrayShapeGroup, IRectangle, IStylable{

    public parent: ICanvasChildShape;
    public children = array<ICanvasChildShape>();
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public style: ICanvasStyle;
    public mapper: ITransformation;
    public doClip: boolean;
    public isAttached: boolean;
    public interaction: IInteraction;

    getChildren(): IIterator<ICanvasChildShape>{
        return this.children.iterator();
    }

    public getTransform(): ITransformation{
        return getShapeTransform(this);
    }

    public draw(ctx: CanvasContext){
        var rect = restorePositionBefore(ctx);
        dim(this, ctx);
        positionedBefore(this,ctx);
        if (this.doClip){
            clipBefore(ctx);
        }
        if (this.mapper){
            var tr = beforeTransform(this.mapper, ctx);
            if (tr.present){
                this.drawShape(ctx);
                afterTransform(tr.value, ctx);
            }
        }
        else
        {
            this.drawShape(ctx);
        }
        if (this.doClip){
            clipAfter(ctx);
        }
        positionedAfter(this, ctx);
        restorePositionAfter(rect, ctx);
    }

    public drawShape(ctx: CanvasContext){
        var old = applyStyle(this.style, ctx);
        drawArrayChildren(this.children.values, ctx);
        applyStyleToContext(ctx, null);
        unapplyStyle(old, ctx);
    }

    addChildAt(child: ICanvasChildShape, indx: number){
        addChildAt(this, child, this.children, indx);
    }

    public addChild(child: ICanvasChildShape){
        this.addChildAt(child, this.children.length);
    }

    removeChildAt(indx: number){
        return removeChildAt(this,this.children, indx);
    }

    public removeChild(child: ICanvasChildShape){
        this.removeChildAt(this.children.array.indexOf(child));
    }

    public findShape(pt: IPoint, ctx: CanvasContext): IFindInfo[]{
        var res = findGroupChildren(pt, ctx, this.children.iterator());
        if (!res || res.length === 0){
            return findSelf(this, pt, ctx);
        }
        return res;
    }

    find(pt: IPoint, ctx: CanvasContext): IFindInfo[]{
        pushInteraction(this.interaction, ctx);
        if (ctx.interaction.interaction.ignore){
            popInteraction(ctx);
            return null;
        }
        var rect = restorePositionBefore(ctx);
        dim(this, ctx);
        positionedBefore(this,ctx);
        var res: IFindInfo[];
        if (this.mapper){
            var tr = beforeTransform(this.mapper, ctx);
            if (tr.present){
                res = this.findShape(pt, ctx);
                afterTransform(tr.value, ctx);
            }
        }
        else
        {
            res = this.findShape(pt, ctx);
        }
        positionedAfter(this, ctx);
        restorePositionAfter(rect, ctx);
        popInteraction(ctx);
        return res;
    }

    onDetached(){
        onDetached(this, this.children.iterator());
    }

    onAttached(){
        onAttached(this, this.children.iterator());
    }

    public __shape_node: true;

}

FlexibleChildGroupRenderer.prototype.doClip = false;
FlexibleChildGroupRenderer.prototype.__shape_node = true;

export interface IGroupConfig extends ICanvasConfig{

    x?: number;
    y?: number;
    width?: number;
    height?: number;
    child?: ICanvasShapeOrConfig[] | ICanvasShapeOrConfig | array.IReactiveArray<ICanvasShapeOrConfig>;

}

export class SettingsGroupRenderer extends FlexibleChildGroupRenderer {

    constructor(public settings: IGroupConfig){
        super();
    }

    public cancel: ICancellable;

    public onAttached(){
        super.onAttached();
        this.cancel = attachChildrenFromConfig(this.settings, this);
    }

    public onDetached(){
        this.cancel.cancel();
        super.onDetached();
    }

    get events(){
        return this.settings.event;
    }

    get style(){
        return this.settings.style;
    }

    get interaction(){
        return this.settings.interaction;
    }

    get x(){
        return this.settings.x;
    }

    get y(){
        return this.settings.y;
    }

    get width(){
        return this.settings.width;
    }

    get height(){
        return this.settings.height;
    }

    get event(){
        return this.settings.event;
    }

}

export interface IGroupShapeWithConfig extends ICancasShapeWithConfig, ICanvasChildShape{
    settings: IGroupConfig;
}

export class ReactiveGroupRenderer extends FlexibleChildGroupRenderer{

    private r_x = variable(null);
    private r_y = variable(null);
    private r_width = variable(null);
    private r_height = variable(null);

    get height(){
        return this.r_height.value;
    }

    set height(v){
        this.r_height.value = v;
    }

    get width(){
        return this.r_width.value;
    }

    set width(v){
        this.r_width.value = v;
    }

    get y(){
        return this.r_y.value;
    }

    set y(v){
        this.r_y.value = v;
    }

    get x(){
        return this.r_x.value;
    }

    set x(v){
        this.r_x.value = v;
    }
}

export function fromConfig(config: IGroupConfig): IGroupShapeWithConfig{
    var gr = new SettingsGroupRenderer(config);
    return gr;
}

export class ProxyGroup extends FlexibleChildGroupRenderer{

    draw(ctx: CanvasContext){
        drawArrayChildren(this.children.values, ctx);
    }

    find(pt: IPoint, ctx: CanvasContext){
        return findGroupChildren(pt, ctx, this.children.iterator());
    }

}

export class ReactiveArrayProxyGroup extends ProxyGroup{

    private r_x = variable(null);
    private r_y = variable(null);
    private r_width = variable(null);
    private r_height = variable(null);

    get height(){
        return this.r_height.value;
    }

    set height(v){
        this.r_height.value = v;
    }

    get width(){
        return this.r_width.value;
    }

    set width(v){
        this.r_width.value = v;
    }

    get y(){
        return this.r_y.value;
    }

    set y(v){
        this.r_y.value = v;
    }

    get x(){
        return this.r_x.value;
    }

    set x(v){
        this.r_x.value = v;
    }

}

export class ConstantProxyGroup implements ICanvasChildShape{

    public parent: ICanvasChildShape;
    public isAttached: boolean;

    constructor(public children: IIterable<ICanvasChildShape>){
        initConstantGroup(this, children.iterator());
    }

    getChildren(): IIterator<ICanvasChildShape>{
        return this.children.iterator();
    }

    onAttached(){
        onAttached(this, this.children.iterator());
    }

    onDetached(){
        onDetached(this, this.children.iterator());
    }

    draw(ctx: CanvasContext){
        drawIteratorChildren(this.children.iterator(), ctx);
    }

    find(pt: IPoint, ctx: CanvasContext){
        return findGroupChildren(pt, ctx, this.children.iterator());
    }

}

export function initConstantGroup(shape: ICanvasChildShape, it: IIterator<ICanvasChildShape>){
    while(it.hasNext()){
        var s = it.next();
        s.parent = shape;
    }
}

export class RenderOnlyConstantGroup extends ConstantProxyGroup{
    public find(pt: IPoint, ctx: CanvasContext): IFindInfo[]{
        return null;
    }

}


export function createConstantShapeGroupFromArray(children: ICanvasChildShape[]){
    var grp = new ConstantProxyGroup(iterable(children));
    return grp;
}