import {CanvasRenderer} from "./index";
import {ICanvasChild, ICanvasChildShape} from "../shape/index";

export function findCanvasShape(shape: ICanvasChildShape): CanvasRenderer {
    if (shape instanceof CanvasRenderer) {
        return <CanvasRenderer>shape;
    }
    if ((<ICanvasChild>shape).parent) {
        return findCanvasShape((<ICanvasChild>shape).parent);
    }
    else {
        return null;
    }
}