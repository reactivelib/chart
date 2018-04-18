import {IReactiveXSortedRingBuffer} from "../../../../reactive/collection/ring";
import {ICartesianXInterval, ICartesianXIntervalSetting} from "../../../../../datatypes/interval";
import {IChartDataSettings} from "../../../../data/convert";
import {ICartesianXCandle, ICartesianXCandleSetting} from "../../../../../datatypes/candlestick";

export type CartesianCandleDataType =
    ICartesianXCandleSetting[]
    | IReactiveXSortedRingBuffer<ICartesianXCandle>
    | IChartDataSettings;