/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IMovementPlugin} from "../../render/html/interaction/move/move";
import {ITransformation} from "../../../math/transform/matrix";
import {IAxisCollection} from "../axis/collection/index";
import {IWindowChanger} from "../../../math/domain/constrain";
import {transaction} from "@reactivelib/reactive";
import {WindowResizer} from "../../../math/domain/window/resize";
import {variable} from "@reactivelib/reactive";
import {IUnifiedEvent} from "../../render/html/event/unified";
import {IPoint} from "../../../geometry/point";
import {ChartCenter} from "../../core/center/index";

export class XMovementPlugin implements IMovementPlugin{

    private startPoint: IPoint;

    constructor(public mapper: () => ITransformation, public domainChanger: IWindowChanger, public xAxes: variable.IVariable<IAxisCollection>, public center: ChartCenter){

    }

    public start(point: IUnifiedEvent){
        var cr = this.center.calculateBoundingBox();
        this.startPoint = {
            x: point.clientX - cr.left,
            y: point.clientY - cr.top
        };
        (<WindowResizer>this.xAxes.value.resizer).blocked = true;
    }

    public moveTo(ev: IUnifiedEvent){
        ev.preventDefault();
        var cr = this.center.calculateBoundingBox();
        var point = {
            x: ev.clientX - cr.left,
            y: ev.clientY - cr.top
        }
        var im = this.mapper().copy().inverse();
        var p1 = {x:0 ,y: 0};
        var p2 = {x:0, y: 0};
        if (im.present){
            im.value.transformRef(this.startPoint.x, this.startPoint.y, p1);
            im.value.transformRef(point.x, point.y, p2);
            var diff = p1.x - p2.x;
            this.domainChanger.moveX(diff);
            this.startPoint = point;
        }
    }

    public stop(){
        transaction(() => {
            var xres = <WindowResizer>this.xAxes.value.resizer;
            xres.blocked = false;
            xres.detachEnd();
            xres.detachStart();
        });
    }
}

export class YMovementPlugin implements IMovementPlugin{

    private startPoint: IPoint;

    constructor(public mapper: () => ITransformation, public domainChanger: IWindowChanger, public yAxes: variable.IVariable<IAxisCollection>, public center: ChartCenter){

    }

    public start(point: IUnifiedEvent){
        var cr = this.center.calculateBoundingBox();
        this.startPoint = {
            x: point.clientX - cr.left,
            y: point.clientY - cr.top
        };
        (<WindowResizer>this.yAxes.value.resizer).blocked = true;
    }

    public moveTo(ev: IUnifiedEvent){
        var cr = this.center.calculateBoundingBox();
        ev.preventDefault();
        var point = {
            x: point.clientX - cr.left,
            y: point.clientY - cr.top
        }
        var im = this.mapper().copy().inverse();
        var p1 = {x:0 ,y: 0};
        var p2 = {x:0, y: 0};
        if (im.present){
            im.value.transformRef(this.startPoint.x, this.startPoint.y, p1);
            im.value.transformRef(point.x, point.y, p2);
            var diff = p1.y - p2.y;
            this.domainChanger.moveY(diff);
            this.startPoint = point;
        }
    }

    public stop(){
        transaction(() => {
            var yres = <WindowResizer>this.yAxes.value.resizer;
            yres.blocked = false;
            yres.detachEnd();
            yres.detachStart();
        });    
    }
}