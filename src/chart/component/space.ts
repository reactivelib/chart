/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {variable} from "@reactivelib/reactive";
import {IComponentConfig} from "../../component/layout/axis/index";
import {RelativePositionedComponentProxy} from "../../component/layout/axis/component/factory";
import {IRelativePositionedGridElement} from "../../component/layout/axis/positioning/relative/index";
import {INamedRelativePosComponentFactory} from "./index";

/**
 * A component that just takes adds some space between components.
 * @editor
 */
export interface ISpaceComponentConfig extends IComponentConfig{
    
    type: "space";

    /**
     * The space to add.
     */
    space: number;

}

class RectangleSettings {

    constructor(public settings: ISpaceComponentConfig){

    }

    public r_x = variable<number>(0);
    public r_y = variable<number>(0);

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

    get height(){
        return this.settings.space;
    }

    get width(){
        return this.settings.space;
    }
}

export class SpaceComponentFactory implements INamedRelativePosComponentFactory
{

    name = "space"

    constructor(){

    }

    create(settings: IRelativePositionedGridElement){
        var rect = new RectangleSettings(<ISpaceComponentConfig>settings.component);
        return new RelativePositionedComponentProxy(settings, rect);
    }

}