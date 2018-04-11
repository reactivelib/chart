import {ISequence} from "../../sequence/index";

export class SequenceGridIterator{

    constructor(public start: number, public end: number, public sequence: ISequence<number>){
        var p = this.sequence.previous(this.start);
        if (this.start - p < 0.000000000001){
            this.start = p;
        }
        else {
            this.start = this.sequence.next(p);
        }
    }

    public hasNext(){
        return this.start - this.end < 0.000000000001;
    }

    public next(){
        var s = this.start;
        this.start = this.sequence.next(s);
        return s;
    }
}
