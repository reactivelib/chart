import {IPointConstraints, normalizePointConstraints, PointConstrainer} from "../point/constrain";
import {ILine} from "./index";

export interface ILineConstraints{
    start?: IPointConstraints;
    end?: IPointConstraints;
}

export function normalizeLineConstraints(settings: ILineConstraints = {}): ILineConstraints{
    return {
        start: normalizePointConstraints(settings.start),
        end: normalizePointConstraints(settings.end)
    }
}

export class LineConstrainer{

    public start: PointConstrainer;
    public end: PointConstrainer;

    public constrain(line: ILine): ILine{
        return {
            start: this.start.constrain(line.start),
            end: this.end.constrain(line.end)
        }
    }


}