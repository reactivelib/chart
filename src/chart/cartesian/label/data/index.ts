/**
 * A function that renders labels for data.
 */

import {ILabelStyle} from "../../../render/canvas/label/cache/index";
import {IRectangleCanvasShape} from "../../../render/canvas/shape/rectangle/index";
import {ICanvasConfig} from "../../../render/canvas/shape/create";
import {DataLabelPositions} from "../../../render/canvas/label/series/index";
import {ICartesianSeries} from "../../series/series";

export interface IDataLabelRendererFunction
{
    /**
     * Renders a label for the given data.
     * @param data The data to render the label for
     * @param series The series this data is found at.
     * @returns Either a string or a @api{render.canvas.IComponent, component}
     */
    (data: any, series: ICartesianSeries): IRectangleCanvasShape | ICanvasConfig | string;
}

/**
 * Settings on how to render data labels for a series.
 */
export interface IDataLabelSettings{

    /**
     * Defines how to render the data.
     *
     *
     * |value|description|
     * |--|--|
     * |"value"|Will render the value of the data, e.g. if data is a point {x: 1, y:2}, will render label "2"|
     * |"auto"|Will render the the label if it is defined in the data, otherwise will render the value of the data
     * |"label"|Will render the label that is defined in the data, e.g. for point data {x:1, y:2, l: "label"} will render "label".
     * |@api{IDataLabelRendererFunction}|Will use this given function to render the label
     */
    render?: "value" | "label" | "auto" | IDataLabelRendererFunction;
    /**
     * Determines were the label will be positioned relative to the shape bounding box. Defaults to "center".
     */
    position?: DataLabelPositions | DataLabelPositions[];
    /**
     * Adds an offset to the x-position of the label
     */
    xOffset?: number;
    /**
     * Adds an offset to the y-position of the label
     */
    yOffset?: number;
    /**
     * If true, labels are allowed to overlap. If false, labels that would overlap will not be rendered.
     */
    overlap?: boolean;
    /**
     * Style of the labels.
     */
    style?: ILabelStyle;
    delay?: number;

}