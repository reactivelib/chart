import {TimeUnits} from "../../../../../math/sequence/time";
import {variable} from "@reactivelib/reactive";
import {init, inject} from "../../../../../config/di";
import {IDiscreteAxisSettings, IDiscreteXYAxis, XYAxisSystem} from "../../index";
import createLinearUnit from "./linear";
import createDiscreteUnit from "./discrete";
import procedure from "@reactivelib/reactive";
import {dummy} from "@reactivelib/core";

export interface IAxisTimeUnit{
    /**
     * The current time unit used when rendering axis or tooltip labels.
     */
    unit: TimeUnits;

    /**
     * If true, the domain of the axis is interpreted as time. False otherwise.
     */
    active: boolean;
}

export class AxisTimeUnit implements IAxisTimeUnit{
    
    private r_unit = variable<TimeUnits>(null);
    public active: boolean;

    @inject
    axis: XYAxisSystem
    @inject
    axisSettings: IDiscreteAxisSettings
    @inject
    axesSettings: IDiscreteAxisSettings
    
    get unit(){
        return this.r_unit.value;
    }
    
    set unit(v: TimeUnits){
        this.r_unit.value = v;
    }

    @init
    init(){
        var syncer: any;
        function sync(){
            syncer();
        }
        this.axis.synchronizers.push(sync);
        var pro = procedure(() => {
            var at = this.axis.type;
            var active = false;
            syncer = dummy;
            var axesSettings = this.axesSettings;
            var axisSettings = this.axisSettings;
            if (at === "discrete") {
                if (axisSettings.categoryType === "time" || axesSettings.categoryType === "time") {
                    active = true;
                    syncer = () => {
                        this.unit = createDiscreteUnit(<IDiscreteXYAxis>this.axis);
                    }
                    this.unit = "d";
                }
            }
            else {
                var markersSettings = axisSettings.ticks || axesSettings.ticks;
                switch ((markersSettings && markersSettings.type) || "nice") {
                    case "time":
                        active = true;
                        syncer = () => {
                            this.unit = createLinearUnit(this.axis.ticks.distance);
                        };
                        this.unit = "d";
                        break;
                }
            }
            this.active = active;
        });
        this.axis.cancels.push(pro);
    }
    
}

AxisTimeUnit.prototype.active = false;