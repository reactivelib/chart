/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {transaction, procedure, variable} from "@reactivelib/reactive";
import {IPointRectangle} from "../../../geometry/rectangle/index";
import {IAxisCollection} from "../axis/collection/index";
import {ICanvasEvent} from "../../render/canvas/event/index";
import {defaultTheme, IGlobalChartSettings} from "../../style";
import {extend} from "@reactivelib/core";
import {WindowResizer} from "../../../math/domain/window/resize";
import {Toolbar} from "../component/toolbar";

type IVariable<E> = variable.IVariable<E>;

class MaximizationHTML{

    public tag = "div";
    public child: any;
    public style: any;

    constructor(xAxes: IVariable<IAxisCollection>, yAxes: IVariable<IAxisCollection>, domain: IPointRectangle, icon: string, theme: IGlobalChartSettings){
        this.child ={
            tag: "button",
            prop: {
                suppressCanvasEvents: true,
                onclick: function(ev: ICanvasEvent){
                    transaction(() => {
                        var xres = <WindowResizer>xAxes.value.resizer;
                        var yres = <WindowResizer>yAxes.value.resizer;
                        xres.attachEnd();
                        xres.attachStart();
                        yres.attachEnd();
                        yres.attachStart();
                    });
                }
            },
            style: extend({
                background: "url('"+icon+"')",
                display: "block",
            }, theme.interaction && theme.interaction.button && theme.interaction.button.style || defaultTheme.interaction.button.style)
        }
        this.style = {
            display: "inline-block"
        }
    }
}

export function notifyMaximizationInToolbar(shape: Toolbar, xAxes: IVariable<IAxisCollection>, yAxes: IVariable<IAxisCollection>, maxWindow: () => IPointRectangle, icon: string, theme: IGlobalChartSettings){
    var last: MaximizationHTML = null;
    procedure(() => {
        var xres = <WindowResizer>xAxes.value.resizer;
        var yres = <WindowResizer>yAxes.value.resizer;
        var notattached = !xres.isStartAttached() || !xres.isEndAttached() || !yres.isStartAttached() || !yres.isEndAttached();
        if (notattached){
            if (!last){
                last = new MaximizationHTML(xAxes, yAxes, maxWindow(), icon, theme);
                shape.child.push(last);
            }
        }
        else {
            if (last){
                shape.child.remove(shape.child.indexOf(last));
            }
            last = null;
        }
    });
}
