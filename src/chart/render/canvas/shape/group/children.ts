/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasConfig, renderCanvas} from '../create';
import {ICanvasShapeOrConfig} from "../create";
import {array} from "@reactivelib/reactive";
import {procedure} from "@reactivelib/reactive";
import {ICancellable} from '@reactivelib/reactive';
import {IGroupConfig, IReactiveArrayShapeGroup} from './index';
import {unobserved} from '@reactivelib/reactive';
import {HashMap} from "../../../../../collection/hash";
import {nullCancellable} from "@reactivelib/reactive";
import {ICanvasChildShape} from "../index";

export interface IGroupSettingsAttachingShape extends IReactiveArrayShapeGroup{
    settings: IGroupConfig;
}

export function attachChildrenFromConfig(settings: IGroupConfig, shape: IReactiveArrayShapeGroup){
    var lastAdded = new HashMap<ICanvasConfig, ICanvasChildShape>();
    var lastCancel: ICancellable = nullCancellable;
    var p = procedure(p => {
        lastCancel.cancel();
        var val = settings.child;
        if (val){
            unobserved(() => {
                if (array.isReactiveArray(val)){
                    while(shape.children.length > 0){
                        shape.removeChildAt(0);
                    }
                    var ra = <array.IReactiveArray<ICanvasShapeOrConfig>> val;
                    var updater = ra.onUpdateSimple({
                        add: (el, indx) => {
                            shape.addChildAt(renderCanvas(el), indx);
                        },
                        remove: (el, indx) => {
                            shape.removeChildAt(indx);
                        },
                        init: true
                    });
                    lastCancel = {cancel: () => {
                        updater.cancel();
                        while(shape.children.length > 0){
                            shape.removeChildAt(shape.children.length - 1);
                        }
                    }};
                }
                else if (Array.isArray(val)){
                    var toAdd: ICanvasChildShape[] = [];
                    var newlyAdded = new HashMap<ICanvasConfig, ICanvasChildShape>();
                    var rendered = new HashMap<ICanvasChildShape, ICanvasChildShape>();
                    for (var i=0; i < val.length; i++) {
                        var v = val[i];
                        var ns = lastAdded.get(v);
                        if (!ns) {
                            ns = renderCanvas(v);
                            rendered.put(ns, ns);
                        }
                        else {
                            lastAdded.remove(v);
                        }
                        toAdd.push(ns);
                        newlyAdded.put(v, ns);
                    }
                    for (var k in lastAdded.objects){
                        var kv = lastAdded.objects[k];
                        shape.removeChildAt(shape.children.array.indexOf(kv.value));
                    }

                    shape.children.clear();
                    for (var i=0; i < toAdd.length; i++){
                        var ta = toAdd[i];
                        if (rendered.get(ta)){
                            shape.addChildAt(ta, shape.children.length);
                        }
                        else {
                            shape.children.push(ta);
                        }
                    }
                    lastAdded = newlyAdded;
                }
                else if (val){
                    while(shape.children.length > 0){
                        shape.removeChildAt(0);
                    }
                    var child = renderCanvas(<ICanvasShapeOrConfig>val);
                    shape.addChildAt(child, 0);
                    lastCancel = {cancel: () => {
                        shape.removeChildAt(0);
                    }}
                }
            });            
        }
    });
    return {
        cancel: () => {
            p.cancel();
            if (lastCancel){
                lastCancel.cancel();
            }
            while(shape.children.length > 0){
                shape.removeChildAt(0);
            }
        }
    }
}