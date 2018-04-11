import {IMovementPlugin} from "./move";
import {IUnifiedEvent} from "../../event/unified";

export type MovementDirection = "left" | "right" | "up" | "down" | "left-up" | "left-down" | "right-up" | "right-down";

export interface IDirectionMovementSettings{

    direction: MovementDirection;
    plugin: IMovementPlugin;

}

class DirectionMovementPlugin implements IMovementPlugin{

    public sp: IUnifiedEvent;
    public pixels = 4;
    private active: IMovementPlugin;
    private directionToPlugin: {[s: string]: IMovementPlugin} = {};

    constructor(public sets: IDirectionMovementSettings[]){
        sets.forEach(s => {
            this.directionToPlugin[s.direction] = s.plugin;
        });
    }

    start(point: IUnifiedEvent){
        this.sp = point;
    }

    private moveActive(dir: string, point: IUnifiedEvent){
        var pl = this.directionToPlugin[dir];
        if (pl){
            this.active = pl;
            this.active.start(this.sp);
            this.active.moveTo(point);
            return true;
        }
        return false;
    }

    public moveTo(point: IUnifiedEvent){
        if (this.active){
            this.active.moveTo(point);
            return;
        }
        var dx = (point.clientX - this.sp.clientX);
        var dy = (point.clientY - this.sp.clientY);
        var lr: string;
        var ud: string;
        if (dx > this.pixels){
            lr = "right";
        }
        if (-dx > this.pixels){
            lr = "left";
        }
        if (dy > this.pixels){
            ud = "down";
        }
        if (-dy > this.pixels){
            ud = "up"
        }
        if (lr && ud){
            if (this.moveActive(lr+"-"+ud, point)){
                return;
            }
        }
        if (lr){
            if (this.moveActive(lr, point)){
                return;
            }
        }
        if (ud){
            if (this.moveActive(ud, point)){
                return;
            }
        }
    }

    stop(point: IUnifiedEvent){
        if (this.active){
            this.active.stop(point);
            this.active = null;
        }
    }
}

export interface IDirectionMovementPluginSettings{

    pixels?: number;
    directions: IDirectionMovementSettings[];
}


export function createDirectionMovementPlugin(settings: IDirectionMovementPluginSettings): IMovementPlugin{
    var pl = new DirectionMovementPlugin(settings.directions);
    pl.pixels = settings.pixels || 10;
    return pl;
}