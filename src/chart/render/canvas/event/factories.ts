import {ICanvasEvent, ICanvasEventSettings} from "./index";

export function addEventTo(events: ICanvasEventSettings, ev: string, listener: (ev: ICanvasEvent) => any, useCapture = false){
    var listeners = (<any>events)[ev];
    if (!listeners){
        listeners = [];
        (<any>events)[ev] = listeners;
    }
    listeners.push({
        useCapture: useCapture,
        handler: listener
    });
}

export function removeEventFrom(events: ICanvasEventSettings, ev: string, listener: (ev: ICanvasEvent) => any, useCapture = false){
    var listeners = (<any>events)[ev];
    if (listeners){
        for (var i=0; i < listeners.length; i++){
            var l = listeners[i];
            if (l.useCapture === useCapture && l.handler === listener){
                listeners.splice(i, 1);
                if (listeners.length === 0){
                    delete (<any>events)[ev];
                }
                return;
            }
        }
    }
}