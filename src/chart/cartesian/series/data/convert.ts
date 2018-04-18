import {DataToBufferConverter} from "../../../data/convert";
import {ReactiveXSortedRingBuffer} from "../../../reactive/collection/ring";
import {IXIndexedData} from "../../../../datatypes/range";

export abstract class XSortedDataToBufferConverter<E extends IXIndexedData, RAW> extends DataToBufferConverter<E, RAW>{

    fillArray(coll: ReactiveXSortedRingBuffer<E>, data: RAW[]){
        var mustSort = false;
        var lastX = -Number.MAX_VALUE;
        data.forEach((d, index) => {
            const data = this.rawDataToData(index, d);
            if (!("x" in data)){
                data.x = index;
            }
            if (data.x < lastX){
                mustSort = true;
            }
            lastX = data.x;
            coll.push(data);
        });
        if (mustSort){
            coll.buffer.array.sort((a, b) => {
                return a.x - b.x;
            });
        }
    }

    createBuffer(): ReactiveXSortedRingBuffer<E>{
        return new ReactiveXSortedRingBuffer<E>();
    }

}