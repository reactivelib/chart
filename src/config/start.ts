import {ICancellable} from "@reactivelib/reactive";

export class MultiStarter{

    public starts: (() => ICancellable)[] = [];
    public started = false;
    public toCancel: ICancellable[] = [];
    
    public add(start: () => ICancellable){
        if (this.started){
            this.toCancel.push(start());
        }
        else {
            this.starts.push(start);
        }
    }
    
    public start(){
        this.started = true;
        var toCancel: ICancellable[] = this.toCancel;
        this.starts.forEach(s => {
            toCancel.push(s());
        });
        return {
            cancel: () => {
                toCancel.forEach(c => c.cancel());
            }
        }
    }
    
}