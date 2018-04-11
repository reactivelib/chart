import {IPointConfig, SettingsPointRenderer} from "../index";
import {IPoint} from "../../../../../../geometry/point/index";
import {dummy} from "@reactivelib/core";
import {createPointConstrainer} from "../../../../../../geometry/point/constrain";
import {registerShapeDocumentMovement} from "../../../../html/interaction/move/move";
import {getTransform} from "../../group/index";
import {PointPreview} from './preview';
import {IUnifiedEvent} from "../../../../html/event/unified";

export function createInteraction(config: IPointConfig, pt: SettingsPointRenderer){
    var modify = config.interaction.modify;
    var cpt: (pt: IPoint) => IPoint;
    var onStart: any = dummy;
    var onEnd: any = dummy;
    var onMove: any = dummy;
    var applyMode = "finish";
    if (typeof modify === "boolean"){
        cpt = (pt: IPoint) => pt;
    }
    else
    {
        applyMode = modify.applyValue ? modify.applyValue : "finish";
        if (modify.constraints){
            if (typeof modify.constraints === "function"){
                cpt = modify.constraints;
            }
            else {
                var constr = createPointConstrainer(modify.constraints);
                cpt = (pt) => constr.constrain(pt);
            }
        }
        if (modify.onStart){
            onStart = modify.onStart;
        }
        if (modify.onEnd){
            onEnd = modify.onEnd;
        }
        if (modify.onMove){
            onMove = modify.onMove;
        }
    }
    var started = false;
    var preview: PointPreview;
    registerShapeDocumentMovement({

        over: (p) => {
        //    pt.addStyle(addedStyle);
        },

        out: (p) => {
        //    pt.removeStyle(addedStyle);
        },

        start: (p) => {
            var inv = getTransform(pt).inverse();
            if (!inv.present){
                return;
            }
            started = true;
            var point = cpt(inv.value.transform(p.clientX, p.clientY));
            (<IUnifiedEvent>p).stopPropagation();
            var prev = new PointPreview(pt);
            preview = prev;
            prev.x = point.x;
            prev.y = point.y;
            pt.preview = prev;
            pt.$r.changedDirty();
            onStart(pt, prev);
        },

        moveTo: (p) => {
            if (!started){
                return;
            }
            var inv = getTransform(pt).inverse();
            if (!inv.present){
                return;
            }
            var tp = inv.value.transform(p.clientX, p.clientY);
            tp = cpt(tp);
            preview.x = tp.x;
            preview.y = tp.y;
            if (applyMode === "immediate"){
                pt.x = preview.x;
                pt.y = preview.y;
            }
            onMove(pt, preview);
            pt.$r.changedDirty();
        },

        stop: (p) => {
            started = false;
            pt.preview = null;
         //   pt.removeStyle(pt.styles[pt.styles.length - 1]);
            onEnd(pt, preview);
            if (applyMode !== "never"){
                pt.x = preview.x;
                pt.y = preview.y;
            }
            pt.$r.changedDirty();
        }
    });
}