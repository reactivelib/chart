/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IDiscreteAxisSettings, ILinearAxisSettings, ILogAxisSettings, IXYAxisSettings} from "../index";
import {IPointInterval} from "../../../../geometry/interval/index";
import {CoordinateOrigin} from "../../../render/canvas/shape/group/transform/mapper";
import {array} from "@reactivelib/reactive";


/**
 * Settings for cartesian chart axes of one side. The @api{IXYAxisSettings} that you set in this object will be applied
 * to the @api{primary} and all defined @api{secondary} axes.
 * 
 * 
 * e.g.
 * 
 * ```
 * {
 *  type: "discrete"
 *  primary: {
 *      id: "axis1",
 *      categories: ["A", "B", "C"]
 *  },
 *  secondary: [{
 *      id: "axis2",
 *      categories: ["B", "C", "D"]
 *  }]
 * }
 * ```
 * 
 * The @api{IXYAxisSettings.type} "discrete" will be applied to both "axis1" and "axis2".
 * 
 */
export interface IChartAxisSettings extends IXYAxisSettings{

    shared?: boolean;

    sharedAxes?: any;

    /**
     * The primary axis settings. The primary axis is the main axis that operations like zooming or movement
     * will be applied upon. 
     * 
     * 
     * The primary axis is required an cannot be removed. If not defined, the chart will create a default primary axis
     * with id "primary".
     */
    primary?: IXYAxisSettings;
    /**
     * The settings for secondary axes. Secondary axes window and tick locations are synchronized against the primary
     * axis.
     */
    secondary?: IXYAxisSettings[] | array.IReactiveArray<IXYAxisSettings>;
    
    resizer?: IAutoResizerSettings;

    /**
     * The maximized window of the primary axis.
     * 
     * 
     * Defines the interval the chart will maximize to when you click the "maximize" button.
     * If "auto", maximized domain will equal to the @api{math.IAxis.domain} extended with an offset depending on the axis @api{type}.
     * If an interval is given, will take the given interval as maximum. Otherwise, will take the settings.
     *
     */
    maxWindow?: "auto" | IMaximizedDomainSettings | IPointInterval;

    /**
     * The initial start value for the primary domain
     */
    start?: number;
    /**
     * The initial end value for the primary domain
     */
    end?: number;

    /**
     * Determines how data will be mapped to the viewport
     */
    origin?: CoordinateOrigin;

}

export interface IAutoResizerSettings{
    animate?: boolean;
    deactivated?: boolean;
}

/**
 * Settings for the domain offset.
 */
export interface IDomainOffsetSettings{
    /**
     * Offset for start position. See @api{IMaximizedDomainSettings.offset}.
     */
    start?: string | number;
    /**
     * Offset for end position. See @api{IMaximizedDomainSettings.offset}.
     */
    end?: string | number;
}

/**
 * Settings for the maximized domain.
 */
export interface IMaximizedDomainSettings{

    /**
     * Extends the maximized domain by the given offset.
     */
    offset?: string | number | IDomainOffsetSettings;
    /**
     * Uses the given domain as maximized domain. If not set, will use the @api{math.IAxis.domain} of the axis.
     */
    domain?: IPointInterval;
    
}

export interface IChartCategoricalAxisSettings extends IChartAxisSettings, IDiscreteAxisSettings{
    type: "discrete";
    primary?: IDiscreteAxisSettings;
    secondary?: IDiscreteAxisSettings[];
    
}

export interface IChartLogAxisSettings extends IChartAxisSettings, ILogAxisSettings{
    type: "log";
}

export interface IChartLinearAxisSettings extends IChartAxisSettings, ILinearAxisSettings{
    type?: "linear";
}