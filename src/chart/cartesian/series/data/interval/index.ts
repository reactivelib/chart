import {IReactiveXSortedRingBuffer} from "../../../../reactive/collection/ring";
import {ICartesianXInterval, ICartesianXIntervalSetting} from "../../../../../datatypes/interval";
import {IChartDataSettings} from "../../../../data/convert";

export type CartesianIntervalDataType =
    ICartesianXIntervalSetting[]
    | IReactiveXSortedRingBuffer<ICartesianXInterval>
    | IChartDataSettings;