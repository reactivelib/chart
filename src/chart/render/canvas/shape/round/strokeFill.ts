import {roundFill, roundStroke} from "./index";
import {applyNone, CanvasContext} from "../../context/index";

export function roundFillOrStroke(ctx: CanvasContext) {
    var round = roundFill;
    if (ctx.style.applyStroke !== applyNone) {
        round = roundStroke;
    }
    return round;
}