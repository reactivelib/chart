import {IReactiveRingBuffer, ReactiveRingBuffer} from "../../reactive/collection/ring";
import ajax from "../../../ajax";

export interface IChartDataSettings{

    type?: "csv" | "json";
    content: string;
    source?: "local" | "link";

}

export abstract class DataToBufferConverter<E, RAW>{

    createBuffer(): ReactiveRingBuffer<E>{
        return new ReactiveRingBuffer<E>();
    }

    fillArray(array: ReactiveRingBuffer<E>, data: RAW[]){
        data.forEach((d, i) => array.push(this.rawDataToData(i, d)));
    }

    abstract rawDataToData(index: number, data: RAW): E;

    parseText(text: string, settings: IChartDataSettings): RAW[]{
        switch(settings.type || "csv"){
            case "json":
                var data = <RAW[]>JSON.parse("("+text+")");
                return data;
            default:
                return this.parseCSVText(text);
        }
    }

    abstract parseCSVText(text: string): RAW[];

    convert(data: IReactiveRingBuffer<E> | RAW[] | IChartDataSettings): IReactiveRingBuffer<E>{
        var coll = this.createBuffer();
        if (Array.isArray(data)){
            this.fillArray(coll, data);
        }
        else if ("content" in data)
        {
            var s = <IChartDataSettings>data;
            switch (s.source || "local"){
                case "link":
                    ajax({
                        url: s.content,
                        result: (resp) => {
                            var response = resp.responseText;
                            this.fillArray(coll, this.parseText(response, s));
                        }
                    });
                    break;
                default:
                    this.fillArray(coll, this.parseText(s.content, s));
            }
        }
        else {
            return <ReactiveRingBuffer<E>>data;
        }
        return coll;
    }

}