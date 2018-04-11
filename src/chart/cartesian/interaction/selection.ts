/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IMovementPlugin} from "../../render/html/interaction/move/move";
import {IPoint} from "../../../geometry/point/index";
import {IAxisCollection} from "../axis/collection/index";
import {IWindowChanger} from "../../../math/domain/constrain";
import {transaction, variable} from "@reactivelib/reactive";
import {WindowResizer} from "../../../math/domain/window/resize";
import {ChartCenter} from "../../core/center/index";
import {IUnifiedEvent} from "../../render/html/event/unified";
import {ICartesianViewport} from "../area";
import {ReactivePointRectangle} from "../../reactive/geometry/rectangle";

class PointRectangleAttr extends ReactivePointRectangle{

    public attr: any;
    public tag = "rect";
    public style: any;

    constructor() {
        super();
        var self = this;
        this.attr = {
            get x() {
                return Math.min(self.xs, self.xe);
            },
            get y() {
                return Math.min(self.ys, self.ye);
            },
            get width() {
                return Math.abs(self.xe - self.xs);
            },
            get height() {
                return Math.abs(self.ye - self.ys);
            },
            fill: "blue",
            opacity: "0.3"
        }
    }

}

type IVariable<E> = variable.IVariable<E>;

export class SelectionMovementPlugin implements IMovementPlugin{

    public rect: PointRectangleAttr;
    public sp: IPoint;
    public xOnly = false;

    constructor(public center: ChartCenter, public domainChanger: IWindowChanger, public primaryTarget: IVariable<ICartesianViewport>,
         public xAxes: IVariable<IAxisCollection>, public yAxes: IVariable<IAxisCollection>){

    }

    start(ev: IUnifiedEvent){
        var cr = this.center.calculateBoundingBox();
        var pt = {
            x: ev.clientX - cr.left,
            y: ev.clientY - cr.top
        }
        var rect = new PointRectangleAttr();
        rect.xs = pt.x;
        rect.xe = pt.x;
        (<WindowResizer>this.xAxes.value.resizer).blocked = true;
        if (!this.xOnly){
            rect.ys = pt.y;
            rect.ye = pt.y;
            (<WindowResizer>this.yAxes.value.resizer).blocked = true;
        }
        else
        {
            rect.ys = 0;
            rect.ye = this.center.height;
            
        }
        this.center.getLayer(10).getSvg().child.push(rect);
        this.rect = rect;
        this.sp = pt;
    }

    moveTo(ev: IUnifiedEvent){
        if (!this.rect){
            return;
        }
        var rect = this.rect;
        var cr = this.center.calculateBoundingBox();
        var p = {
            x: ev.clientX - cr.left,
            y: ev.clientY - cr.top
        }
        rect.xe = p.x;
        if (!this.xOnly){
            rect.ye = p.y;
        }
        else
        {
            rect.ye = this.center.height;
        }
    }

    stop(ev: IUnifiedEvent){
        if (!this.rect){
            return;
        }
        var r = this.rect;
        var svg = this.center.getLayer(10).getSvg();
        svg.child.remove(svg.child.indexOf(r));
        if (Math.abs(r.attr.width) < 5 || (!this.xOnly && Math.abs(r.attr.height) < 5)){
            
        }
        else {
            var pr1 = {
                x: r.attr.x,
                y: r.attr.y
            }
            var pr2 = {
                x: r.attr.x + r.attr.width,
                y: r.attr.y + r.attr.height
            }
            var tr = this.primaryTarget.value.mapper.copy().inverse();
            if (!tr.present){
                return;
            }
            var p1 = tr.value.transform(pr1.x, pr1.y);
            var p2 = tr.value.transform(pr2.x, pr2.y);
            this.domainChanger.changeX(Math.min(p1.x, p2.x), Math.max(p1.x, p2.x), true, {
                onFinished: () => {
                    transaction(() => {
                        var xres = <WindowResizer> this.xAxes.value.resizer;
                        xres.detachEnd();
                        xres.detachStart();
                        xres.blocked = false;
                        if (!this.xOnly){
                            var yres = <WindowResizer> this.yAxes.value.resizer;
                            yres.detachEnd();
                            yres.detachStart();
                            yres.blocked = false;
                        }
                    });                    
                }
            });
            if (!this.xOnly){
                this.domainChanger.changeY(Math.min(p1.y, p2.y), Math.max(p1.y, p2.y), true);
            }
        }
    }

}
