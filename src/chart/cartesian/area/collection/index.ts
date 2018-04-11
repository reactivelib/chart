/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICartesianViewport, ICartesianViewportSystem, XYAreaSystem} from "../index";
import {array} from "@reactivelib/reactive";
import {ICancellable} from "@reactivelib/reactive";
import {findInIterator, IIterator} from "../../../../collection/iterator/index";
import {IXYAxis} from "../../axis/index";
import {Domain, IWindow} from "../../../../math/domain/base";
import {unobserved} from "@reactivelib/reactive";
import {component, create, init, inject} from "../../../../config/di";
import {createValueMapperFactory, IValueMapperFactory} from "../../../render/canvas/shape/group/transform/mapper";
import {variable} from "@reactivelib/reactive";
import {IAxisCollection} from "../../axis/collection";
import {procedure} from "@reactivelib/reactive";
import {ICartesianChartSettings} from "../../index";
import {IndirectIntervalPointRectangle} from "../../../../geometry/rectangle/pointRect";

type IReactiveArray<E> = array.IReactiveArray<E>;

/**
 * A collection containing all viewports in a chart
 */
export interface IViewportCollection {

    /**
     * Returns the viewport for the given x and y axis
     * @param xAxis
     * @param yAxis
     */
    get(xAxis: IXYAxis, yAxis: IXYAxis): ICartesianViewport;
    /**
     * The primary viewport for the primary x- and y-axis
     */
    primary: ICartesianViewport;
    /**
     * A reactive array containing all viewports. read-only.
     */
    collection: IReactiveArray<ICartesianViewport>;

    /**
     * primary window
     */
    window: IWindow;

}

function cancelIf(c: any){
    if ("cancel" in c){
        c.cancel();
    }
}

@component("viewports")
export class XYChartViewportGroup implements IViewportCollection{

    public collection = array<ICartesianViewport>();

    @create(function(this: XYChartViewportGroup){
        var lastX: IXYAxis = null;
        var lastY:IXYAxis = null;
        var vari = variable<ICartesianViewport>(null).listener(v => {
            if (lastX){
                this.remove(lastX, lastY);
            }
            lastX = this.r_xAxes.value.primary;
            lastY = this.r_yAxes.value.primary;
            var a = this.add(lastX, lastY);
            v.value = a;
        });
        return vari;
    })
    public r_primary: variable.IVariable<ICartesianViewport>;

    get primary(){
        return this.r_primary.value;
    }

    set primary(v){
        this.r_primary.value = v;
    }

    @create(function(this: XYChartViewportGroup){
        var window = new Domain(new IndirectIntervalPointRectangle(() => this.r_xAxes.value.window, () => this.r_yAxes.value.window));
        return window;
    })
    public window: IWindow;
    public cancels: ICancellable[] = [];

    @inject
    chartSettings: ICartesianChartSettings

    @inject
    r_xAxes: variable.IVariable<IAxisCollection>
    @inject
    r_yAxes: variable.IVariable<IAxisCollection>

    @create(function(this: XYChartViewportGroup){
        var vari = variable<IValueMapperFactory>(null).listener(v => {
            v.value = createValueMapperFactory(this.r_xAxes.value.origin);
        });
        this.cancels.push(vari.$r);
        return vari;
    })
    createXMapper: variable.IVariable<IValueMapperFactory>

    @create(function(this: XYChartViewportGroup){
        var vari = variable<IValueMapperFactory>(null).listener(v => {
            v.value = createValueMapperFactory(this.r_yAxes.value.origin, this.r_yAxes.value.primary.type === "log");
        });
        this.cancels.push(vari.$r);
        return vari;
    })
    createYMapper: variable.IVariable<IValueMapperFactory>;

    @create
    public areaFactory(xAxis: IXYAxis, yAxis: IXYAxis): ICartesianViewport{
        var s = new XYAreaSystem(this.createXMapper, this.createYMapper, this.r_yAxes);
        s.xAxis = xAxis;
        s.yAxis = yAxis;
        return s;
    }

    @init
    public init(){
        this.injectSettings();
    }

    injectSettings(){
        procedure(p => {
            var vals = this.collection.values;
            for (var i=0; i < vals.length; i++){
                (<XYAreaSystem>vals[i]).settings = null;
            }
            if (this.chartSettings.viewport){
                var found = false;
                var vps = this.chartSettings.viewport;
                if (!Array.isArray(vps)){
                    vps = [vps];
                }
                for (var i=0; i < vps.length; i++){
                    var vp = vps[i];
                    var xAx = this.r_xAxes.value.get(vp.xAxis);
                    var yAx = this.r_yAxes.value.get(vp.yAxis);
                    if (!xAx || !yAx){
                        (<XYAreaSystem>this.primary).settings = vp;
                    }
                    else{
                        var viewp = this.get(xAx, yAx);
                        if (viewp){
                            (<XYAreaSystem>viewp).settings = vp;
                        }
                    }
                }
            }
        });
    }

    public getChildren(): IIterator<ICartesianViewport>{
        return this.collection.iterator();
    }

    public cancel(){
        this.collection.forEach(a => {
            cancelIf(a);
        });
        this.cancels.forEach(c => c.cancel());
    }

    remove(xAxis: IXYAxis, yAxis: IXYAxis){
        return removeFromAreaGroup(this, xAxis, yAxis);
    }

    public get(xAxis: IXYAxis, yAxis: IXYAxis): ICartesianViewport{
        return findInIterator<ICartesianViewport>(this.collection.iterator(), (a) => a.xAxis === xAxis && a.yAxis === yAxis);
    }

    public add(xAxis: IXYAxis, yAxis: IXYAxis): ICartesianViewport{
        var a = unobserved(() => this.get(xAxis, yAxis));
        if (!a){
            var viewport: ICartesianViewportSystem;
            viewport = <ICartesianViewportSystem>addToAreaGroup(this, xAxis, yAxis);
            return viewport;
        }
        (<ICartesianViewportSystem>a).count++;
        return a;
    }

}

export function removeFromAreaGroup(grp: XYChartViewportGroup, xAxis: IXYAxis, yAxis: IXYAxis): ICartesianViewport{
    var area = findInIterator<ICartesianViewport>(grp.collection.iterator(), (a) => a.yAxis === yAxis && a.xAxis === xAxis);
    if (area){
        (<ICartesianViewportSystem>area).count--;
        if ((<ICartesianViewportSystem>area).count === 0){
            cancelIf(area);
            grp.collection.remove(grp.collection.indexOf(area));
        }
    }
    return area;
}

export function addToAreaGroup(grp: XYChartViewportGroup, xAxis: IXYAxis, yAxis: IXYAxis): ICartesianViewport{
    var area: ICartesianViewport = unobserved(() => grp.areaFactory(xAxis, yAxis));
    grp.collection.push(area);
    return area;
}