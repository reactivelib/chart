import {IChartAxisSettings} from './axis/collection/factory';
import {assemble} from '../../config/di/index';
import {ICartesianChartSettings, XYChart} from './index';
import {MultiStarter} from '../../config/start';
import {AxisCollection, IAxisCollection, XAxisCollection, YAxisCollection} from './axis/collection/index';
import {ICancellable, nullCancellable, procedure, unobserved, variable} from '@reactivelib/reactive';

type IVariable<E> = variable.IVariable<E>;

function axis(create: () => AxisCollection, settings: IVariable< IChartAxisSettings | IAxisCollection>,
    external: IVariable<boolean>, axes: IVariable<AxisCollection>, starter: MultiStarter, chart: XYChart){
        var addToShared = false;
        var lastCancel: ICancellable = nullCancellable;
        var proc = procedure(() => {            
            lastCancel.cancel();
            external.value = false;            
            var axisSet = settings.value;
            if (axisSet){
                if (axisSet instanceof AxisCollection){
                    axes.value = axisSet;
                    external.value = true;
                    lastCancel = nullCancellable;
                    return;
                }
                else{
                    if ((<IChartAxisSettings> axisSet).shared){
                        if ((<IChartAxisSettings> axisSet).sharedAxes && (<IChartAxisSettings> axisSet).sharedAxes.value){
                            var ax = (<IChartAxisSettings> axisSet).sharedAxes.value;
                            axes.value = ax;
                            lastCancel = nullCancellable;
                            external.value = true;
                            return;
                        }
                        else{
                            addToShared = true;
                        }
                    }                
                }                
            }
            var axisColl = create()
            axes.value = axisColl;
            starter.add(() => {                
                axisColl.resizer;
                return nullCancellable;
            });
            if (addToShared){
                if (!(<IChartAxisSettings> axisSet).sharedAxes){
                    (<IChartAxisSettings> axisSet).sharedAxes = variable<AxisCollection>(null);
                }
                unobserved(() => {
                    (<IChartAxisSettings> axisSet).sharedAxes.value = axisColl;
                });                                
            }
            lastCancel = {
                cancel: () => {
                    axisColl.cancel();
                    if (addToShared){
                        unobserved(() => {
                            (<IChartAxisSettings> axisSet).sharedAxes.value = null;
                        });
                    }
                }
            }
        });
        chart.cancels.push({
            cancel: () => {
                proc.cancel();
                lastCancel.cancel();
            }
        });
}

export function xAxes($container, settings: ICartesianChartSettings, chart: XYChart, starter: MultiStarter) {
    var res = variable<AxisCollection>(null);
    axis(() => assemble({instance: new XAxisCollection(), parent: $container}), {
        get value(){
            return settings.xAxis;
        }            
    }, chart.r_xAxesExternal, res, starter, chart);
    return res;
}

export function yAxes($container, settings: ICartesianChartSettings, chart: XYChart, starter: MultiStarter){
    var res = variable<AxisCollection>(null);
    axis(() => assemble({instance: new YAxisCollection(), parent: $container}), {
        get value(){
            return settings.yAxis;
        }            
    }, chart.r_yAxesExternal, res, starter, chart);
    return res;
}