import {ICanvasChildShape} from "../shape/index";
import {IInteraction} from "../interaction/index";
import {ICanvasHTMLShape} from "../html/index";

/**
 * Event thrown for canvas shapes
 */
export interface ICanvasEvent{
    /**
     * The current shape that handling the event
     */
    currentTarget: ICanvasChildShape,
    /**
     * The shape that is targeted by this event
     */
    target: ICanvasChildShape,
    /**
     * The interaction for the targeted element
     */
    interaction: IInteraction,
    /**
     * The x-coordinate relative to the top-left canvas position
     */
    x: number,
    /**
     * The y-coordinate relative to the top-left canvas position
     */
    y: number,
    /**
     * x-coordinate relative to the current window
     */
    clientX: number,
    /**
     * y-coordinate relative to the current window
     */
    clientY: number,
    /**
     * Stops the propagation of the event if this function is called in an event handler
     */
    stopPropagation: () => void,
    /**
     * The event that triggered this event.
     */
    mouseEvent: Event,
    /**
     * The canvas shape this event was triggered for.
     */
    canvasShape: ICanvasHTMLShape
}

/**
 * A shape that listens for events.
 */
export interface ICanvasShapeEventHandler{
    /**
     * Adds and event listener
     * @param ev The event to listen to
     * @param listener callback function
     * @param useCapture if true, use capture mode, false otherwise
     */
    addEventListener(ev: string, listener: (ev: ICanvasEvent) => any, useCapture?: boolean): void;
    /**
     * Removes a previously added event listener. All arguments must match the arguments
     * when the listener was added in order for it to be removed.
     * @param ev The event to listen to
     * @param listener callback function
     * @param useCapture if true, use capture mode, false otherwise
     */
    removeEventListener(ev: string, listener: (ev: ICanvasEvent) => any, useCapture?: boolean): void;
}

export interface ICanvasShapeWithEvents extends ICanvasChildShape{
    events: {[s: string]: IObjectMouseHandler[]};
}

/**
 * Function handling events
 */
export interface IFunctionMouseHandler{
    /**
     * @param ev The event
     */
    (ev: ICanvasEvent): void;
}

export interface IObjectMouseHandler{
    handler(ev: ICanvasEvent): void;
    useCapture?: boolean;
};

export type IMouseHandler = IFunctionMouseHandler | IObjectMouseHandler;

export interface ICanvasEventSettings{
    move?: IMouseHandler | IMouseHandler[];
    up?: IMouseHandler | IMouseHandler[];
    down?: IMouseHandler | IMouseHandler[];
    over?: IMouseHandler | IMouseHandler[];
    out?: IMouseHandler | IMouseHandler[];
    enter?: IMouseHandler | IMouseHandler[];
    leave?: IMouseHandler | IMouseHandler[];        
}