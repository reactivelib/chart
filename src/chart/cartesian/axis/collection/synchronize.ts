import {AxisCollection, IAxisCollection} from "./index";
import {IXYAxis, IXYAxisSystem} from "../index";
import {IAxis} from "../../../../math/domain/axis/axis";
import {IIterable} from "../../../../collection/iterator/index";
import {syncLogMarkerDomains} from "../../../../math/domain/axis/log";
import {syncLinearDomains} from "../../../../math/domain/axis/snyc";
import {syncByMarkersAxis} from "../../../../math/domain/axis/sequence";
import {procedure, variable} from "@reactivelib/reactive";

export type Synchronizer = "linear" | "marker";

export class AxisProvider{
    constructor(public axes: IAxisCollection){

    }

    get primary(){
        return this.axes.primary;
    }

    public getOther(){
        return this.axes.secondary;
    }

}

export function synchronizer(axes: IAxisCollection, synchronizerType: Synchronizer, primary: variable.IVariable<IXYAxis>){
    var sync: (axis: IAxis, it: IIterable<IAxis>) => void;
    var provider: AxisProvider;
    var proc = procedure(p => {
        provider = new AxisProvider(axes);
        if (primary.value.type === "log"){
            sync = syncLogMarkerDomains;
        }
        else
        {
            switch(synchronizerType){
                case "linear":
                    sync = syncLinearDomains;
                    break;
                case "marker":
                    sync = syncByMarkersAxis;
                    break;
            }
        }
    });
    (<AxisCollection>axes).cancels.push(proc);
    return () => {
        sync(provider.primary, provider.getOther());
        (<IXYAxisSystem>axes.primary).synchronize();
        axes.secondary.forEach(ax => {
            (<IXYAxisSystem>ax).synchronize();
        });
    }
}