import {IColorStyleSettings} from "../../../render/style/stylable";

export interface ISeriesRendererSettings extends IColorStyleSettings{
    type: string;
}

export interface ICartesianSeriesShapeSettings extends ISeriesRendererSettings{
    type: "point" | "column" | "line" | "area" | "candle" | "discrete";
}

export type SeriesShapeSettings = "point" | "column" | "line" | "area" | "candle" | "discrete" | ICartesianSeriesShapeSettings;
