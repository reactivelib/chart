import {ICanvasChildShape} from "../index";

export interface IShapeWithRounder extends ICanvasChildShape{

    round(n: number): number;

}

export function roundStroke(x: number){
    return Math.round(x - 0.5) + 0.5;
}

export function roundFill(x: number){
    return Math.round(x);
}