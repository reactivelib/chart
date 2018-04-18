import {ValueCategoricalData} from "./data";
import {IReactiveXSortedRingBuffer} from "../../../../reactive/collection/ring";
import {ICartesianXPoint} from "../../../../../datatypes/value";
import {IChartDataSettings} from "../../../../data/convert";

export type CartesianValueDataType =
    ValueCategoricalData[]
    | IReactiveXSortedRingBuffer<ICartesianXPoint>
    | IChartDataSettings;