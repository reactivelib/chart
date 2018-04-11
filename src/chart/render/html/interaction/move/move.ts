import {IUnifiedEvent, IUnifiedEvents} from "../../event/unified";
import {DocumentMovement} from "./document";

export interface IMovementPlugin{
    over?(point: IUnifiedEvent): void;
    out?(point: IUnifiedEvent): void;
    start(point: IUnifiedEvent): void;
    moveTo(point: IUnifiedEvent): void;
    stop(point: IUnifiedEvent): void;
}

export class MovementPluginGroup implements IMovementPlugin{

    constructor(public plugins: IMovementPlugin[]){

    }

    start(point: IUnifiedEvent){
        this.plugins.forEach(p => p.start(point));
    }
    moveTo(point: IUnifiedEvent){
        this.plugins.forEach(p => p.moveTo(point));
    }
    stop(e: IUnifiedEvent){
        this.plugins.forEach(p => p.stop(e));
    }
    over(e: IUnifiedEvent){
        this.plugins.forEach(p => p.over && p.over(e));
    }
    out(e: IUnifiedEvent){
        this.plugins.forEach(p => p.out && p.out(e));
    }

}

export function registerShapeDocumentMovement(plugin: IMovementPlugin): IUnifiedEvents{
    var started = false;
    var down = (ev: IUnifiedEvent) => {
        started = true;
        plugin.start(ev);
        ev.preventDefault();
        new DocumentMovement({
            move: (ev) => {
                if (started){
                    plugin.moveTo(ev);
                }
            },

            stop: (ev) => {
                if (started){
                    started = false;
                    plugin.stop(ev);
                }
            }
        });
    };
    var over = (ev: IUnifiedEvent) => {
        plugin.over && plugin.over(ev);
    }
    var out = (ev: IUnifiedEvent) => {
        plugin.out && plugin.out(ev);
    }
    return {
        over: over,
        out: out,
        down: down
    }
}