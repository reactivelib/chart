/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {variable} from "@reactivelib/reactive";
import {IPointInterval} from "../../../geometry/interval";

export class LogPointInterval implements IPointInterval {

    public r_start = variable<number>(0.001);

    get start() {
        if (this.r_start.value <= 0) {
            return 0.0001;
        }
        return this.r_start.value;
    }

    set start(v) {
        this.r_start.value = v;
    }

    public r_end = variable<number>(10);

    get end() {
        return this.r_end.value;
    }

    set end(v) {
        this.r_end.value = v;
    }

}