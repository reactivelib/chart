import {Highlighter, IHighlightable, StyleHighlighting} from "../index";
import {IColor} from "../../../../../color/index";
import {getAreaHighlightStyleForColor} from "../style";
import {IStylable} from "../../../canvas/style/index";

export default function(shape: IStylable, color: IColor): IHighlightable{
    return new Highlighter(new StyleHighlighting(shape, () => {
        return getAreaHighlightStyleForColor(color);
    }));
}