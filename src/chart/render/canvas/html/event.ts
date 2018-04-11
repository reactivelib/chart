import {ICanvasChildShape, ICanvasShape} from "../shape/index";
import {array, procedure, unobserved, variable} from "@reactivelib/reactive";
import {IInteraction} from "../interaction/index";
import {ICanvasShapeWithEvents, IFunctionMouseHandler, IMouseHandler, IObjectMouseHandler} from "../event/index";
import {hash} from "@reactivelib/core";
import {ICanvasHTMLShape} from "./index";
import {getComposedInteraction, IFindInfo} from "../find/index"
import {IBoxModel, measureElement} from "../../html/measure/box";

export class MouseState{

    public rEvent: variable.IVariable<Event> = variable<Event>(null);

    private r_down = variable(false);

    get down(){
        return this.r_down.value;
    }

    set down(v){
        this.r_down.value = v;
    }

    private r_up = variable(true);

    get up(){
        return this.r_up.value;
    }

    set up(v){
        this.r_up.value = v;
    }

    get event(){
        return this.rEvent.value;
    }

    set event(e: Event){
        this.rEvent.value = e;
    }
    
    public evUp(){
        this.up = true;
        this.down = false;
    }
    
    public evOut(){
        this.event = null;
    }
    
    public evMove(ev: Event){
        this.event = ev;
    }
    
    public evDown(ev: Event){
        ev.preventDefault();
        this.down = true;
        this.up = false;
    }
}

export interface ICanvasMouseContext{
    over: ICanvasChildShape;
    entered: array.IReactiveArray<ICanvasChildShape>;
    isBlocked: boolean;
}

export class CanvasMouseContext{

    private r_over = variable<ICanvasChildShape>(null);
    private r_isBlocked = variable<boolean>(false);
    public entered = array<ICanvasChildShape>();
    public state: MouseState;
    public cancel(){

    }

    get isBlocked(){
        return this.r_isBlocked.value;
    }

    set isBlocked(v){
        this.r_isBlocked.value = v;
    }

    get over(){
        return this.r_over.value;
    }

    set over(v){
        this.r_over.value = v;
    }
}

function addListener(el: HTMLElement, event: string, handler: (ev: Event) => void, capture = false){
    el.addEventListener(event, handler, capture);
}

function removeListener(el: HTMLElement, event: string, handler: (ev: Event) => void, capture = false){
    el.removeEventListener(event, handler, capture);
}

function suppressEvent(ev: Event, element: HTMLElement, canvas: HTMLCanvasElement){
    return ev.target !== element && ev.target !== canvas && (<any>ev.target).suppressCanvasEvents;
}

function createDecoratingMouseRegistrar(element: HTMLElement, decorator: (s: (ev: Event) => void) => (ev: Event) => void){
    return (name: string, handler: (ev: Event) => void) => {
        var f = decorator(handler);
        addListener(element, name, f);
        return {
            cancel: () => {
                removeListener(element, name, f);
            }
        }
    }
}

type EventRegisterer = (name: string, ev: (e: Event) => void) => void;

function registerMouseEvents(state: MouseState, register: EventRegisterer){
    register("mouseup", (ev) => {
        state.up = true;
        state.down = false;
    });
    register("mouseleave", (ev) => {
        state.event = null;
    });
    register("mousemove", (ev) => {
        state.event = ev;
    });
    register("mousedown", (ev) => {
        ev.preventDefault();
        state.down = true;
        state.up = false;
    });
}

function registerTouchEvents(state: MouseState, register: EventRegisterer){
    register("touchend", (ev: TouchEvent) => {
        state.up = true;
        state.down = false;
    });
    register( "touchcancel", (ev: TouchEvent) => {
        state.event = null;
    });
    register("touchmove", (ev: TouchEvent) => {
        (<any>ev).clientX = ev.touches[0].clientX;
        (<any>ev).clientY = ev.touches[0].clientY;
        state.event = ev;
    });
    register("touchstart", (ev: TouchEvent) => {
        ev.preventDefault();
        (<any>ev).clientX = ev.touches[0].clientX;
        (<any>ev).clientY = ev.touches[0].clientY;
        state.event = ev;
        state.down = true;
        state.up = false;
    });
}

function createMouseState(element: HTMLElement, canvas: HTMLCanvasElement){
    var state = new MouseState();
    var register = createDecoratingMouseRegistrar(element, function(handler: (ev: Event) => void){
        return function(ev: Event){
            /*if (suppressEvent(ev, element, canvas)){
                state.event = null;
                return;
            }*/
            handler(ev);
        }
    });
    registerMouseEvents(state, register);
    registerTouchEvents(state, register);
    return state;
}

export interface ICanvasEventsContext{
    canvasNode: ICanvasHTMLShape;
    canvasElement: HTMLCanvasElement;
    element: HTMLElement;
}

function getPath(root: ICanvasShape, node: ICanvasChildShape){
    var path = [node];
    var p = node;
    while(p.parent){
        if (p.parent === root){
            break;
        }
        path.push(<ICanvasChildShape>p.parent);
        p = <ICanvasChildShape>p.parent;
    }
    return path;
}

function fireLeaveEvents(root: ICanvasHTMLShape, idToEnteredShapes: {[s: string]: ICanvasChildShape}, idToEventProcessedShapes: {[s: string]: ICanvasChildShape}, enteredShapes: array.IReactiveArray<ICanvasChildShape>, ev: Event){
    for (var id in idToEnteredShapes){
        if (!(id in idToEventProcessedShapes)){
            var s = idToEnteredShapes[id];
            delete idToEnteredShapes[id];
            enteredShapes.remove(enteredShapes.array.indexOf(s));
            unobserved(() => {
                var si = getComposedInteraction(s);
                fireEvent(root, "leave", ev, s, s, true, si);
                fireEvent(root, "leave", ev, s, s, false, si);
            });
        }
    }
}

function collectProcessedShapes(path: ICanvasChildShape[]){
    var idToEventProcessedShapes: {[s: string]: ICanvasChildShape} = {};
    path.forEach(p => {
        var s = hash(p);
        idToEventProcessedShapes[s] = p;
    });
    return idToEventProcessedShapes;
}

function fireEnterEvents(root: ICanvasHTMLShape, idToEnteredShapes: {[s: string]: ICanvasChildShape}, idToEventProcessedShapes: {[s: string]: ICanvasChildShape}, enteredShapes: array.IReactiveArray<ICanvasChildShape>, ev: Event){
    unobserved(() => {
        for (var s in idToEventProcessedShapes){
            var p = idToEventProcessedShapes[s];
            if (!(s in idToEnteredShapes)){
                idToEnteredShapes[s] = p;
                var interaction = getComposedInteraction(p);
                fireEvent(root, "enter", ev, p, p, true, interaction);
                fireEvent(root, "enter", ev, p, p, false, interaction);
                enteredShapes.push(p);
            }
        }
    });

}

function processEvent(root: ICanvasHTMLShape, name: string, ev: Event, node: ICanvasChildShape){
    unobserved(() => {
        var path = getPath(root, node);
        var rev = [];
        for (var i=path.length - 1; i >= 0; i--){
            rev.push(path[i]);
        }
        (<any>ev)._stopped = false;
        var int = getComposedInteraction(node);
        processEventPhase(root, name, ev, node, rev, false, int);
        if (!(<any>ev)._stopped){
            processEventPhase(root, name, ev, node, path, true, int);
        }
    });
}

export function selectedNode(allSelects: IFindInfo[]): IFindInfo{
    var z = -Number.MAX_VALUE;
    var dist = Number.MAX_VALUE;
    var selected = null;
    for (var i=0; i < allSelects.length; i++)
    {
        var info = allSelects[i];
        var s = info.shape;
        var d = "distance" in info ? info.distance : Number.MAX_VALUE;
        var zi = "zIndex" in info ? info.zIndex : 0;
        if (zi < z){
            continue;
        }
        if (zi > z){
            selected = info;
            z = zi;
            dist = d;
            continue;
        }
        if (d <= dist){
            dist = d;
            selected = info;
        }
        
    }
    return selected;
}

function processEventPhase(root: ICanvasHTMLShape, name: string, ev: Event, node: ICanvasChildShape, path: ICanvasChildShape[], bubble: boolean, int: IInteraction){
    for (var i=0; i < path.length; i++)
    {
        var n = path[i];
        fireEvent(root, name, ev, node, n, bubble, int);
        if ((<any>ev)._stopped)
        {
            break;
        }
    }
}

function fireEvent(root: ICanvasHTMLShape, name: string, ev: Event, node: ICanvasChildShape, currentNode: ICanvasChildShape, bubble: boolean, int: IInteraction){
    var n = <ICanvasShapeWithEvents><any>currentNode;
    if (n.events){
        if (Array.isArray(n.events)){
            for (var i=0; i < n.events.length; i++){
                var evnt = n.events[i];
                if (evnt){
                    processSingleEventArray(root, ev, node, currentNode, bubble, int, (<any>evnt)[name]);
                }                
            }
        }
        else{
            processSingleEventArray(root, ev, node, currentNode, bubble, int, (<any>n).events[name]);
        }                     
    }
}

function processSingleEventArray(root: ICanvasHTMLShape, ev: Event, node: ICanvasChildShape, currentNode: ICanvasChildShape, bubble: boolean, int: IInteraction, handler: IMouseHandler | IMouseHandler[]){
    if (!handler){
        return;
    }
    if (Array.isArray(handler)){
        for (var j=0; j < handler.length; j++){
            handleEvent(root, handler[j], ev, node, currentNode, bubble, int);
        }
    }    
    else{
        handleEvent(root, handler, ev, node, currentNode, bubble, int);
    }
}

function handleEvent(root: ICanvasHTMLShape, handler: IMouseHandler, event: Event, node: ICanvasChildShape, currentNode: ICanvasChildShape, bubble: boolean, int: IInteraction){
    var ev = {
        currentTarget: currentNode,
        target: node,
        interaction: int,
        x: (<any>event).rel_x,
        y: (<any>event).rel_y,
        clientX: (<any>event).clientX,
        clientY: (<any>event).clientY,
        stopPropagation: function(){
            (<any>event)._stopped = true;
        },
        mouseEvent: event,
        canvasShape: root
    }
    if (typeof handler === "function"){
        if (bubble)
        {
            (<IFunctionMouseHandler>handler)(ev);
        }
    }
    else {
        var h = <IObjectMouseHandler> handler;
        if (bubble){
            if (!(h.useCapture)){
                h.handler(ev);
            }
        }
        else {
            if (h.useCapture){
                h.handler(ev);
            }
        }
    }
}

function getContentRect(element: HTMLElement){
    var style = measure(element);
    var x = style.paddingLeft + style.borderLeft;
    var y = style.paddingTop + style.borderTop;
    return {
        x: x,
        y: y
    }
}

function measure(element: HTMLElement): IBoxModel{
    var box = measureElement(element);
    return box;
}

export function getRelativeMousePoint(element: HTMLElement, x: number, y: number){
    var content = getContentRect(element);
    var cr = element.getBoundingClientRect();
    return {
        x: x - content.x - cr.left,
        y: y - content.y - cr.top
    }
}

export function addRelativeMousePoint(element: HTMLElement, ev: Event){
    var content = getContentRect(element);
    var cr = element.getBoundingClientRect();
    (<any>ev)['rel_x'] = (<any>ev).clientX - content.x - cr.left;
    (<any>ev)['rel_y'] = (<any>ev).clientY - content.y - cr.top;
}

export function manageCanvasMouseEvents(context: ICanvasEventsContext){
    var state = createMouseState(context.element, context.canvasElement);
    var ctx = new CanvasMouseContext();
    ctx.state = state;
    var lastEv: Event = null;
    var lastSelected: ICanvasChildShape = null;
    var idToEnteredShapes: {[s: string]: ICanvasChildShape} = {};
    var p = procedure.animationFrame(function(){
        if (ctx.isBlocked){
            return;
        }
        var ev = state.event;
        var selects = [];
        var selected = null;
        var upS = state.up;
        var dS = state.down;
        unobserved(() => {
            idToEventProcessedShapes = {};
            if (ev){
                addRelativeMousePoint(context.element,  ev);
                selects = context.canvasNode.find({
                        x: (<any>state.event)['rel_x'],
                        y: (<any>state.event)['rel_y']
                    }) || [];
                selected = selectedNode(selects);
                if (selected){
                    var idToEventProcessedShapes = collectProcessedShapes(getPath(context.canvasNode, selected));
                }
                if (lastSelected !== selected){
                    if (selected) {
                        ctx.over = selected;
                    }
                    else {
                        ctx.over = null;
                    }
                    if (lastSelected)
                    {
                        processEvent(context.canvasNode, "out", ev, lastSelected);
                    }
                    fireLeaveEvents(context.canvasNode, idToEnteredShapes, idToEventProcessedShapes, ctx.entered, ev);
                    fireEnterEvents(context.canvasNode, idToEnteredShapes, idToEventProcessedShapes, ctx.entered, ev);
                    if (selected){
                        processEvent(context.canvasNode, "over", ev, selected);
                    }
                }
                else {
                    fireLeaveEvents(context.canvasNode, idToEnteredShapes, idToEventProcessedShapes, ctx.entered, ev);
                    fireEnterEvents(context.canvasNode, idToEnteredShapes, idToEventProcessedShapes, ctx.entered, ev);
                }
                if (selected){
                    if (!lastEv || ((<any>lastEv).clientX !== (<any>ev).clientX || (<any>lastEv).clientY !== (<any>ev).clientY)){
                        processEvent(context.canvasNode, "move", ev, selected);
                    }
                    if (upS){
                        processEvent(context.canvasNode, "up", ev, selected);
                    }
                    if (dS){
                        processEvent(context.canvasNode, "down", ev, selected);
                    }
                }
            }
            else
            {
                ctx.entered.clear();
                if (lastSelected){
                    ctx.over = null;
                    processEvent(context.canvasNode, "out", lastEv, lastSelected);
                }
                for (var id in idToEnteredShapes){
                    var s = idToEnteredShapes[id];
                    unobserved(() => {
                        var si = getComposedInteraction(s);
                        fireEvent(context.canvasNode, "leave", lastEv, s, s, true, si);
                        fireEvent(context.canvasNode, "leave", lastEv, s, s, false, si);
                    });
                }
                idToEnteredShapes = {};
            }
            unobserved(() => {
                state.up = false;
                state.down = false;
            });
        })
        
        lastEv = ev;
        lastSelected = selected;
    });
    ctx.cancel = function(){
        p.cancel();
    }
    return ctx;
}