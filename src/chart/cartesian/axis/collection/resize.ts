/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {AxisCollection} from "./index";
import {IXYAxis, IXYAxisSystem} from "../index";
import {IChartAxisSettings} from "./factory";
import {procedure, unobserved, variable} from "@reactivelib/reactive";
import {IWindowResizer, WindowResizer} from "../../../../math/domain/window/resize";
import {IPointInterval} from "../../../../geometry/interval/index";

export default function resize(axes: AxisCollection, primary: variable.IVariable<IXYAxis>,
    maxWindow: variable.IVariable<IPointInterval>, axesSettings: IChartAxisSettings){
    var vari = variable<IWindowResizer>(null);
    var xResizer: WindowResizer;
    var lastP: procedure.IProcedure;
    vari.listener(p => {
        var x = <IXYAxisSystem>primary.value;
        var mw = maxWindow.value;            
        xResizer && xResizer.cancel();
        lastP && lastP.cancel();
        unobserved(() => {
            xResizer = new WindowResizer(() => x.window, mw);
            if ("start" in axesSettings){
                x.window.start = axesSettings.start;
            }
            else {
                xResizer.attachStart();
            }
            if ("end" in axesSettings){
                x.window.end = axesSettings.end;
            }
            else {
                xResizer.attachEnd();
            }
            if (axesSettings.resizer && axesSettings.resizer.deactivated){
            }
            else
            {
                xResizer.start();
            }
        });
        var resizer = xResizer;
        lastP = procedure(() => {
            if (axesSettings.resizer && "animate" in axesSettings.resizer){
                resizer.startResize.useAnimations = axesSettings.resizer.animate;
                resizer.endResize.useAnimations = axesSettings.resizer.animate;
            }
        });            
        vari.value = resizer;
    });
    axes.cancels.push({
        cancel:() => {
            vari.cancel();
            xResizer.cancel();
            lastP.cancel();
        }
    });
    return vari;
};