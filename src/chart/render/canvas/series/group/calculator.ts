import {ICanvasChildShape} from "../../shape/index";
import {DynamicRingBufferArray} from "../../../../../collection/array/ring";
import {ICancellableIterator} from "@reactivelib/reactive";
import {IReactiveRingBuffer} from "../../../../reactive/collection/ring";
import {array} from "@reactivelib/reactive";
import {hash} from "@reactivelib/core";

export class DataToShapesCalculator<D, E extends ICanvasChildShape>{

    public buffer: DynamicRingBufferArray<E>;
    public updates: ICancellableIterator<array.ArrayUpdate<D>>;
    public last: IReactiveRingBuffer<D>;

    constructor(public getData: () => IReactiveRingBuffer<D>, 
                public parent: ICanvasChildShape, 
                public transform: (parent: ICanvasChildShape, sd: D) => E){

    }

    public update(){
        var data = this.getData();
        if (this.last !== data){
            if (this.updates){
                this.updates.cancel();
            }
            this.buffer = new DynamicRingBufferArray<E>();
            this.updates = data.updates();
            var sd = data;
            var l = sd.length;
            for (var i=0; i < l; i++){
                this.buffer.push(this.transform(this.parent, sd.get(i)));
            }
        }
        var transform = this.transform;
        var res = this.buffer;
        var parent = this.parent;
        while(this.updates.hasNext()){
            var upd = this.updates.next();
            var indx = upd.index;
            var val = upd.value;
            if (upd.type === "ADD"){
                if (indx === 0){
                    var s = transform(parent, val)
                    s.parent = parent;
                    s.onAttached && s.onAttached();
                    res.unshift(s);
                }
                else {
                    var s = transform(parent, val)
                    s.parent = parent;
                    s.onAttached && s.onAttached();
                    res.push(s);
                }
            }else if (upd.type === "REMOVE"){
                if (indx === 0){
                    var r = res.shift();
                    r.onDetached && r.onDetached();
                }
                else {
                    var r = res.pop();
                    r.onDetached && r.onDetached();
                }
            }
            else {
                var r = res.get(indx);
                r.onDetached && r.onDetached();
                var s = transform(parent, val);
                s.parent = parent;
                s.onAttached && s.onAttached();
                res.set(indx, s);
            }
        }
    }
    
}