/**
 * Data highlight settings
 * @settings
 */
import {ICanvasStyle} from "../../render/canvas/style/index";

export interface IDataHighlightSettings{

    /**
     * The type of shape to highlight the data with
     */
    shape?: string;
    style?: ICanvasStyle;

}

/**
 * Renders the "default" highlighting shape for a data point. 
 */
export interface IDefaultHighlightSettings extends IDataHighlightSettings{
    shape?: "default";
}

/**
 * Renders a point when highlighting the data
 */
export interface IPointHighlightSettings extends IDataHighlightSettings{
    shape?: "point";
    /**
     * Radius of the point
     */
    radius?: number;
}


/**
 * Reners a dnout when highlighting the data
 */
export interface IDonutHighlightSettings extends IDataHighlightSettings{
    shape?: "donut";
    /**
     * Start radius of the donut
     */
    startRadius?: number;
    /**
     * End radius of the donut
     */
    endRadius?: number;
}