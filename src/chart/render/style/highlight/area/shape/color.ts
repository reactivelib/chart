import {IHighlighterShape} from "../../index";
import areaHighlight from '../index';
import {IShapeWithColor} from "../../../../canvas/shape/color";
import {IStylable} from "../../../../canvas/style/index";

export type type = IHighlighterShape & IShapeWithColor & IStylable;

export function highlight(shape: type){
    if (!shape.highlighter){
        shape.highlighter = areaHighlight(shape, shape.color)
    }
    return shape.highlighter.highlight();
}