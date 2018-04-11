import {IInterval} from "../../interval/index";

export function zentralizeInterval(point: number, interval: IInterval){
    interval.start = point + interval.size / 2;
}