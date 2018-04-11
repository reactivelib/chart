/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointInterval} from "../../../geometry/interval/index";
import {IAxis} from "./axis";
import {syncLinearDomains} from "./snyc";
import {syncByMarkersAxis} from "./sequence";
import {IIterable} from "../../../collection/iterator/index";

/**
 * Defines how to separate the space of an axis. See @api{ITickSettings.type}.
 */
export type TickType = "nice" | "discrete" | "time";

/**
 * The settings for the tick points inside an axis. Tick points determine the position of labels that are shown for an axis.
 * 
 */
export interface ITickSettings{
    /**
     * Minimal distance between 2 tick locations.
     */
    minDistance?: number;
    /**
     * Determines how marker points will be calculated.
     * 
     * 
     * If "nice", marker points will have "nice" numbers like [5, 10, 15] or [10, 20, 30]. Normally used for linear axes.
     * 
     * If "discrete", marker points will be natural numbers of power 2, like [1,2,3,4,5,6] or [2, 4, 8, 16]. Used for categorical axes.
     * 
     * If "time", marker points will represent timestamps that represent "nice" times, like every hour or every day. Used for linear axes that represent timestamps.
     */
    type?: TickType;
}

/**
 * 
 * Base settings for an axis. See also the subinterfaces of this interface.
 * 
 */
export interface IAxisSettings{

    /**
     * If specified, the axis will use the given window instead of creating a new one.
     */
    window?: IPointInterval;
    
    /**
     * Settings for the tick locations of the axis.
     */
    ticks?: ITickSettings;

}

export function createAxisSynchronizer(type: "linear" | "marker" = "marker"){
    var synchronizer: (reference: IAxis, toSync: IIterable<IAxis>) => void;
    switch(type || "linear"){
        case "linear":
            synchronizer = syncLinearDomains;
            break;
        case "marker":
            synchronizer = syncByMarkersAxis;
        default:
            throw new Error("Unknown synchronizer "+type);
    }
    return synchronizer;
}