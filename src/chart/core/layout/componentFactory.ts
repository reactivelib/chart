/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {
    IRelativePosComponentFactory,
    RelativePositionedComponentProxy
} from "../../../component/layout/axis/component/factory";
import {IRelativePositionedGridElement} from "../../../component/layout/axis/positioning/relative/index";
import {isNode} from "@reactivelib/html";
import {CoreChart} from "../basic";
import {HTMLComponent} from "../../render/html/component";
import {IComponentConfig} from "../../../component/layout/axis/index";


function getComponentType(s: IRelativePositionedGridElement){
    if (typeof s.component === "string"){
        return s.component;
    }
    else {
        return (<IComponentConfig>s.component).type;
    }
}

export class ChartComponentFactory implements IRelativePosComponentFactory {
    
    constructor(public factories: { [key: string]: IRelativePosComponentFactory }, public chart: CoreChart){
        
    }

    create(config: IRelativePositionedGridElement): IRelativePositionedGridElement {
        if (isNode(config.component) || (typeof config.component !== "string" && ("tag" in config.component))){
            var shape = <any>config.component;
            if (!("width" in shape && "height" in shape && "x" in shape && "y" in shape)){
                shape = new HTMLComponent({
                    get html(){
                        return <any>config.component;
                    },
                    x: 0,
                    y: 0
                });
            }
            var comp = new RelativePositionedComponentProxy(config, shape);
            return comp;
        }
        else if (typeof config.component === "string" || "type" in config.component){
            var facts = this.factories[getComponentType(config)];
            if (!facts){
                return null;
            }
            return facts.create(config);
        }
        return null;
    }

}