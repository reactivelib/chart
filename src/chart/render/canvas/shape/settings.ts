/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import { ICanvasConfig } from "./create";

export interface ICancasShapeWithConfig {
    settings: ICanvasConfig;
}

export default {
    get style(this: ICancasShapeWithConfig){
        return this.settings.style;
    },

    get interaction(this: ICancasShapeWithConfig){
        return this.settings.interaction;
    },

    get events(this: ICancasShapeWithConfig){
        return [(<any>this)._events, this.settings.event];
    }
}