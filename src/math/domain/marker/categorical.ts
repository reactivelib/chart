import {rounded, RoundedSequence} from "../../sequence/index";
import {IFlexibleDistanceTicks} from "./base";
import {SequenceGridIterator} from "./iterator";

export class DiscreteTicks implements IFlexibleDistanceTicks{

    public positions: RoundedSequence = rounded(1);
    public minDistance = Number.MIN_VALUE;

    constructor(){

    }

    public iterator(start: number, end: number){
        return new SequenceGridIterator(start, end, this.positions);
    }

    get distance(){
        return this.positions.distance;
    }

    set distance(d: number){
        this.positions.distance = this.estimatePositions(d);
    }

    public nearest(pos: number){
        return this.positions.nearest(pos);
    }

    public next(pos: number){
        return this.positions.next(pos);
    }

    public previous(pos: number){
        return this.positions.previous(pos);
    }

    public morePositions(){
        this.distance = Math.max(1, Math.round(this.positions.distance / 2));
    }

    public lessPositions(){
        this.distance = Math.round(this.positions.distance * 2);
    }

    private estimatePositions(minDistance: number){
        minDistance = Math.max(this.minDistance, minDistance);
        return Math.max(1, Math.pow(2, Math.ceil(Math.log(minDistance) / Math.LN2)));
    }

}