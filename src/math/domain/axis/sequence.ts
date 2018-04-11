/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IFlexibleTickAxis} from "./axis";
import {ITicks} from "../marker/base";
import {base10List, ISequence} from "../../sequence/index";
import {IPointInterval} from "../../../geometry/interval/index";
import {IIterable, IIterator} from "../../../collection/iterator/index";
import {syncLinearMarkerDomains} from "./snyc";

export function calculateGridDomain(grid: ITicks, domain: IPointInterval): IPointInterval{
    var s = domain.start;
    var start = grid.nearest(s);
    if (start > domain.start){
        start = grid.previous(domain.start);
    }
    var e = domain.end;
    var end = grid.nearest(e);
    if (end < e)
    {
        end = grid.next(e);
    }
    return {
        start: start,
        end: end
    };
}

export class AxisGridSynchronizer{

    public nice: ISequence<number> = base10List([1, 2, 2.5, 5]);

    constructor(){

    }

    protected getBestDistance(propDist: number){
        var n = this.nice.next(propDist);
        return n;
    }

    protected setDomainSize(size: number, axis: IFlexibleTickAxis){
        var ivl = this.getGridMaxDomain(axis);
        var isize = ivl.end - ivl.start;
        var overhead = Math.round(size / axis.ticks.distance) * axis.ticks.distance - isize;
        isize = Math.max(0, isize + overhead);
        ivl.end = ivl.start + isize;
    }

    protected proportionalDistance(base: IFlexibleTickAxis, md: IFlexibleTickAxis) {
        var bmaxd = this.getMaxDomain(base);
        var maxd = this.getMaxDomain(md);
        var prop = (bmaxd.end - bmaxd.start) / (maxd.end - maxd.start);
        var propDist = md.ticks.distance * prop;
        var d = this.nice.nearest(propDist);
        if (d === propDist) {
            return d;
        }
        return this.getBestDistance(propDist);
    }

    protected getMaxDomain(axis: IFlexibleTickAxis){
        return axis.domain;
    }

    protected getGridMaxDomain(axis: IFlexibleTickAxis){
        return axis.tickDomain;
    }

    protected proportionalDomainSize(refAxis: IFlexibleTickAxis, md: IFlexibleTickAxis){
        var ivl = this.getGridMaxDomain(md);
        var nrOfSteps = (ivl.end - ivl.start) / md.ticks.distance;
        return nrOfSteps * refAxis.ticks.distance;
    }

    public sync(referenceAxis: IFlexibleTickAxis, axes: IIterator<IFlexibleTickAxis>){
        var gridDomain = calculateGridDomain(referenceAxis.ticks, this.getMaxDomain(referenceAxis));
        this.getGridMaxDomain(referenceAxis).start = gridDomain.start;
        this.getGridMaxDomain(referenceAxis).end = gridDomain.end;
        var toReset = [];
        while(axes.hasNext()){
            var dom = axes.next();
            dom.ticks.distance = this.proportionalDistance(dom, referenceAxis);
            var axisDomain = calculateGridDomain(dom.ticks, this.getMaxDomain(dom));
            var domIvl = this.getGridMaxDomain(dom);
            domIvl.start = axisDomain.start;
            domIvl.end = axisDomain.end;
            var refSize = this.proportionalDomainSize(referenceAxis, dom);
            var domSize = this.proportionalDomainSize(dom, referenceAxis);
            var rivl = this.getGridMaxDomain(referenceAxis);
            if (refSize > (rivl.end - rivl.start))
            {
                this.setDomainSize(refSize, referenceAxis);
                for (var j=0; j < toReset.length; j++)
                {
                    var d = toReset[j];
                    this.setDomainSize(this.proportionalDomainSize(d, dom), d);
                }
            }
            else if (domSize > (domIvl.end - domIvl.start))
            {
                this.setDomainSize(domSize, dom);
            }
            toReset.push(dom);
        }
    }
}

export function syncByMarkersAxis(reference: IFlexibleTickAxis, toSync: IIterable<IFlexibleTickAxis>){
    new AxisGridSynchronizer().sync(reference, toSync.iterator());
    syncLinearMarkerDomains(reference, toSync);
}