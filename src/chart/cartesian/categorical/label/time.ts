/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ITicks} from "../../../../math/domain/marker/base";
import {ICalendar} from "../../../../math/time/calendar";
import {IIterator} from "../../../../collection/iterator/index";
import {IPointInterval} from "../../../../geometry/interval/index";
import {ICartesianChartAxisLabelSettings} from "../../label/component";
import {IPositionedLabel} from "../../../render/canvas/label/position/index";
import {IAxisTimeUnit} from "../../axis/time/unit/index";
import {getFormatterForUnit} from "../../../../format/time/distance";
import {ICategoryCollection} from "../../axis/discrete/collection";

export interface ICategoricalDateLabelSettings extends ICartesianChartAxisLabelSettings{
    
}

export class DateLabelsPositionedLabelIterator implements IIterator<IPositionedLabel>{

    private iterator: IIterator<number>;
    public formatter: (n: number) => (time: number) => string;
    private format: (time: number) => string;

    constructor(public domain: IPointInterval, public timeUnit: IAxisTimeUnit, public sequence: ITicks, private catColl: ICategoryCollection, public calendarFactory: (time: number) => ICalendar){
        if (!this.timeUnit.unit){
            this.iterator = {
                hasNext: () => false,
                next: () => {
                    throw new Error("No elements");
                }
            }
            return;
        }
        var sm = this.catColl.get(0);
        var biggest = this.catColl.get(this.catColl.length - 1);
        if (!sm){
            sx = -Number.MAX_VALUE;
            bx = Number.MAX_VALUE;
        }
        else{
            var sx = sm.x;
            var bx = biggest.x;
        }
        var start = Math.max(domain.start, sx);
        var end = Math.min(domain.end, bx);
        this.format = getFormatterForUnit(this.calendarFactory, this.timeUnit.unit);
        this.iterator = sequence.iterator(start, end);

    }

    public hasNext(){
        return this.iterator.hasNext();
    }

    public next(){
        var s = this.iterator.next();
        var data = this.catColl.getByIndex(s);
        if (!data){
            return null;
        }
        return {
            label: this.format(<number>data.id),
            position: s
        }
    }
}