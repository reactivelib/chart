/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {SingleGroupAnimationEasing} from "../../../animation/constrain";

export class SeriesAnimationEasing extends SingleGroupAnimationEasing{

}

SeriesAnimationEasing.prototype.easingSettings = {
    duration: 300,
    easing: "outQuad"
}