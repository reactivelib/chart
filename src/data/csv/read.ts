export class TableRow{
    
    public index: number = 0;
    
    constructor(public data: string[]){

    }

    public hasNext(){
        return this.index < this.data.length;
    }

    public next(){
        var data = this.data[this.index];
        this.index++;
        return data;
    }
}

export class CSVDataReader{
    
    public datas: string[][];
    public index: number = 0;

    public cellSeparator = ",";
    started = false;

    constructor(public data: string){

    }

    start(){
        if (this.started){
            return;
        }
        this.datas = this.data.split("\n").map(d => d.split(this.cellSeparator));
        this.started = true;
    }

    public hasNext(): boolean{
        this.start();
        return this.index < this.datas.length;
    }

    public next(): TableRow{
        this.start();
        var res = this.datas[this.index];
        this.index++;
        return new TableRow(res);
    };
}