import {Highlighter, IHighlightable, StyleHighlighting} from "../index";
import {getLineHighlightStyleForColor} from "../style";
import {IColor} from "../../../../../color";
import {IStylable} from "../../../canvas/style/index";

export default function(shape: IStylable, color: IColor): IHighlightable{
    return new Highlighter(new StyleHighlighting(shape, () => {
        return getLineHighlightStyleForColor(color);
    }));
}