/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPaddingSettings} from "../../../../geometry/rectangle/index";

/**
 * Defines how the shape interacts with mouse or touch events
 */
export interface IInteraction{
    /**
     * Defines and additional padding of pixels to determine if pointer is over an element
     */
    screenPadding?: IPaddingSettings;
    /**
     * If true, this shape will not throw any mouse or touch events and any interaction with this shape will not work.
     */
    ignore?: any;
    /**
     * A shape with a higher z-index will be chosen over a shape with a lower z-index for an "over" event. Default value is 0.
     */
    zIndex?: number;
}

export class InteractionState{

    public interaction: IInteraction = <any>{};
    public oldValues: IInteraction[] = [];

    public push(int: IInteraction){
        var i = int || {};
        var old: IInteraction = {};
        for (var p in i){
            (<any>old)[p] = (<any>this.interaction)[p];
            (<any>this.interaction)[p] = (<any>i)[p];
        }
        this.oldValues.push(old);
    }

    public pop(){
        var old = this.oldValues.pop();
        for (var p in old){
            if ((<any>old)[p] === void 0){
                delete (<any>this.interaction)[p];
            }
            else {
                (<any>this.interaction)[p] = (<any>old)[p];
            }
        }
    }

    public copy(){
        var st = new InteractionState();
        for (var p in this.interaction){
            (<any>st.interaction)[p] = (<any>this.interaction)[p];
        }
        return st;
    }

}