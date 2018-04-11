import {nextSmallerUnit, TimeUnits} from "../../../../../math/sequence/time";

export default function(tickDistance: number): TimeUnits{
    return nextSmallerUnit(tickDistance);
}