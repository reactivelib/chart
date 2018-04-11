/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IMovementPlugin} from "../../../../render/html/interaction/move/move";
import {ITransformation} from "../../../../../math/transform/matrix";
import {IPointRectangle} from "../../../../../geometry/rectangle/index";
import {IAxisCollection} from "../../../axis/collection/index";
import {IWindowChanger} from "../../../../../math/domain/constrain";
import {transaction} from "@reactivelib/reactive";
import {WindowResizer} from "../../../../../math/domain/window/resize";
import {variable} from "@reactivelib/reactive";
import {IUnifiedEvent} from "../../../../render/html/event/unified";
import {ChartCenter} from "../../../../core/center/index";
import {IPoint} from "../../../../../geometry/point";

export class YMovementXZoomPlugin implements IMovementPlugin{

    public startPoint: IPoint;

    constructor(public mapper: () => ITransformation, public domain:  () => IPointRectangle,
                public domainChanger: IWindowChanger, public xAxes: variable.IVariable<IAxisCollection>,
                public center: ChartCenter){

    }

    public start(point: IUnifiedEvent){
        point.preventDefault();
        var cr = this.center.calculateBoundingBox();
        this.startPoint = {
            x: point.clientX - cr.left,
            y: point.clientY - cr.top
        };
        (<WindowResizer>this.xAxes.value.resizer).blocked = true;
    }
    
    public getMult(point: IPoint){
        if (this.xAxes.value.origin === "left" || this.xAxes.value.origin === "right"){
            var mult = (this.startPoint.y - point.y) / 300;
        }
        else {
            mult = (this.startPoint.x - point.x) / 300;
        }
        return mult;
    }

    public moveTo(ev: IUnifiedEvent){
        var cr = this.center.calculateBoundingBox();
        var point = {
            x: ev.clientX - cr.left,
            y: ev.clientY - cr.top
        }
        var inv = this.mapper().copy().inverse();
        if (!inv.present){
            return;
        }
        var x = inv.value.transform(point.x, point.y).x;
        var domain = this.domain();
        var w = domain.xe - domain.xs;
        var leftPart = Math.min(w, Math.max(0, x - domain.xs));
        var rightPart = w - leftPart;
        leftPart = leftPart / w;
        rightPart = rightPart / w;
        var mult = this.getMult(point);
        var add = w * mult * 2;
        var ex = domain.xe;
        var sx = domain.xs - add * leftPart;
        ex += add * rightPart;
        this.domainChanger.changeX(sx, ex);
        this.startPoint = point;
    }

    public stop(){    
        transaction(() => {
            var xres = <WindowResizer> this.xAxes.value.resizer;
            xres.blocked = false;
            xres.detachEnd();
            xres.detachStart();
        });
    }

}