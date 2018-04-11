/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICancellable} from "@reactivelib/reactive";
import {IXYChartInteractionModes} from "../factory";

export interface IInteractionMode{
    icon: string;
    title: string;
    handler: () => ICancellable;
    id: IXYChartInteractionModes;
}