import {CanvasContext} from "../../../context/index";
import {IDimension} from "../../../../../../geometry/rectangle/index";

export default function sizeBefore(shape: IDimension, ctx: CanvasContext){
    if (shape.width && shape.height){
        ctx.width = shape.width;
        ctx.height = shape.height;
    }
}