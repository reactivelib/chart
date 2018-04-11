import {IHighlighterShape} from "../../index";
import lineHighlight from '../index';
import {IShapeWithColor} from "../../../../canvas/shape/color";
import {IStylable} from "../../../../canvas/style/index";

export type type = IHighlighterShape & IShapeWithColor & IStylable;

export function highlight(shape: type){
    if (!shape.highlighter){
        shape.highlighter = lineHighlight(shape, shape.color)
    }
    return shape.highlighter.highlight();
}