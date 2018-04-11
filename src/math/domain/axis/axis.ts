/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IFlexibleDistanceTicks, ITicks} from "../marker/base";
import {IPointInterval} from "../../../geometry/interval/index";

/**
 * An axis contains information over the space of a chart
 */
export interface IAxis{
    /**
     * The interval of the visible portion of the 
     */
    window: IPointInterval;
    /**
     * The maximally visible interval of this axis
     */
    domain: IPointInterval;
}

/**
 * An axis containing ticks
 */
export interface ITickAxis extends IAxis{
    /**
     * Tick points that are used to identify "nice" label positions in the visible space of the axis. 
     */
    ticks: ITicks;
    /**
     * The @api{domain} extended to end and start with tick points
     */
    tickDomain: IPointInterval;
}


/**
 * An axis with flexible distance ticks
 */
export interface IFlexibleTickAxis extends ITickAxis{
    ticks: IFlexibleDistanceTicks;
}