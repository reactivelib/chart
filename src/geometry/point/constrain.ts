import {createValueConstrainer, IValueConstraintsSettings, normalizeValueModifySettings} from "../value/constrain";
import {IPoint} from "./index";

/**
 * Defines the possible values this point can have
 */
export interface IPointConstraints{
    /**
     * Constraints of the x-value
     */
    x?: IValueConstraintsSettings;
    /**
     * Constraints of the y-value 
     */
    y?: IValueConstraintsSettings;
}

export function normalizePointConstraints(constraints: IPointConstraints = {}): IPointConstraints{
    return {
        x: normalizeValueModifySettings(constraints.x),
        y: normalizeValueModifySettings(constraints.y)
    }
}

export class PointConstrainer{

    public constrainX: (x: number) => number;
    public constrainY: (y: number) => number;

    public constrain(pt: IPoint){
        return {
            x: this.constrainX(pt.x),
            y: this.constrainY(pt.y)
        }
    }
}

export function createPointConstrainer(settings: IPointConstraints): PointConstrainer {
    var pc = new PointConstrainer();
    pc.constrainX = createValueConstrainer(settings.x);
    pc.constrainY = createValueConstrainer(settings.y);
    return pc;
}