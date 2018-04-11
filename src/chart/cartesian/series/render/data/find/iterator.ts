import {IIterator} from "../../../../../../collection/iterator/index";
import {IShapeWithData} from "../../../../../render/canvas/series/data/index";
import {IRingBuffer} from "../../../../../../collection/array/ring";

export class SeriesShapeDataIterator implements IIterator<IShapeWithData<any>>{
    
    public index = 0;
    
    constructor(public shapes: IRingBuffer<IShapeWithData<any>>){
        
    }
    
    public hasNext(){
        return this.shapes.length > this.index;
    }
    
    public next(){
        var s = this.shapes.get(this.index);
        (<any>s).index = this.index;
        this.index++;
        return s;
    }
    
}