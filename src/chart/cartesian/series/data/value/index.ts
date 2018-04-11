import {ValueCategoricalData} from "./data";
import {IReactiveXSortedRingBuffer} from "../../../../reactive/collection/ring";
import {ICartesianXPoint} from "../../../../../datatypes/value";

export interface ICartesianValueDataSettings {
    type?: "csv" | "json";
    content: string;
    source?: "local" | "link";
}

export type CartesianValueDataType =
    ValueCategoricalData[]
    | IReactiveXSortedRingBuffer<ICartesianXPoint>
    | ICartesianValueDataSettings;