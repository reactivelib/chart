/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {component, create, inject} from "../../../config/di/index";
import {CoreChart} from "../basic";
import {IPadding, normalizePaddingSettings} from "../../../geometry/rectangle/index";
import {ChartComponentFactory} from './componentFactory';
import {array, ICancellable, nullCancellable, procedure, unobserved, variable} from "@reactivelib/reactive";
import {IRelativePositionedGridElement} from "../../../component/layout/axis/positioning/relative/index";
import transform, {IInnerAndOuterElements} from "../../../component/layout/axis/positioning/relative/transform";
import {arrayIterator} from "../../../collection/iterator/array";
import {LayoutShape} from "./controller";
import {INamedRelativePosComponentFactory} from "../../component";
import {Constructor} from "@reactivelib/core";

export function createChartCenterPadding(centerBorderWidth: number): IPadding {
    return normalizePaddingSettings(centerBorderWidth);
}

function createComponents(layout: IRelativePositionedGridElement, componentFactory: ChartComponentFactory){
    var nl = componentFactory.create(layout);
    if (layout.layout){
        var children = layout.layout.map(l => createComponents(l, componentFactory));
        Object.defineProperty(nl, "layout", {
            get: () => {
                return children;
            },
            configurable: true,
            enumerable: true
        });
    }
    return nl;
}

function cancelComponents(layout: IRelativePositionedGridElement){
    layout.cancel && layout.cancel();
    if (layout.layout){
        layout.layout.forEach(l => cancelComponents(l));
    }
}

@component("grid")
export class ChartGrid{

    @inject
    chart: CoreChart

    factories: Constructor<INamedRelativePosComponentFactory>[];
    @inject
    $container
    @inject
    layoutSettings: variable.IVariable<IRelativePositionedGridElement[] | array.IReactiveArray<IRelativePositionedGridElement>>

    afterLayout: (() => boolean)[]
    afterResize: (() => void)[]

    @create
    buildFactory(f: Constructor<INamedRelativePosComponentFactory>){
        return new f();
    }

    @create(function(this: ChartGrid){
        var res: { [s: string]: INamedRelativePosComponentFactory } = {};
        this.factories.forEach(f => {
            var bf = this.buildFactory(f)
            res[bf.name] = bf;
        });
        return res;
    })
    componentFactories:  { [s: string]: INamedRelativePosComponentFactory }

    @create(function(this: ChartGrid){
        return new ChartComponentFactory(this.componentFactories, this.chart);
    })
    componentFactory: ChartComponentFactory

    @create(function(this: ChartGrid){
        var res = array<IRelativePositionedGridElement>();
        var lastCanc: ICancellable = nullCancellable;
        var p = procedure(p => {
            lastCanc.cancel();
            var els = this.layoutSettings.value;
            var vals = res.array;
            for(var i=0; i < vals.length; i++){
                var v = vals[i];
                cancelComponents(v);
            }
            res.clear();
            unobserved(() => {
                if (Array.isArray(els)){
                    els.forEach(e => res.push(createComponents(e, this.componentFactory)));
                }
                else
                {
                    lastCanc = els.onUpdateSimple({
                        add(v, indx){
                            res.insert(indx, createComponents(v, this.componentFactory));
                        },
                        remove(v, indx){
                            var old = res.remove(indx);
                            cancelComponents(old);
                        },
                        init: true
                    })
                }
            })
        });
        this.chart.cancels.push({
            cancel: () => {
                lastCanc.cancel();
                p.cancel();
            }
        });
        return res;
    })
    relativeComponents: array.IReactiveArray<IRelativePositionedGridElement>

    @create(function(this: ChartGrid){
        var vari = variable<IInnerAndOuterElements>(null).listener(v => {
            var layout = this.relativeComponents.values;
            v.value = transform(this.chart.center, arrayIterator(layout));
        });
        return vari;
    })
    innerAndOuter: variable.IVariable<IInnerAndOuterElements>

    @create(function(this: ChartGrid){
        var shape = new LayoutShape(this.chart.center, this.innerAndOuter, this.chart.settings, this.chart, this.afterResize, this.afterLayout);
        return shape;
    })
    shape: LayoutShape

}