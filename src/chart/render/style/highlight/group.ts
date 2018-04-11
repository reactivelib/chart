import {IHighlighterShape} from "./index";
import {ICancellable} from "@reactivelib/reactive";
import {IIterator} from "../../../../collection/iterator/index";
import {IBaseShape} from "@reactivelib/html";

export function highlight(children: IIterator<IBaseShape>): ICancellable {
    var cancels: ICancellable[] = [];
    while (children.hasNext()) {
        var c = children.next();
        if ((<IHighlighterShape>c).highlight) {
            cancels.push((<IHighlighterShape>c).highlight());
        }
    }
    return {
        cancel: () => {
            cancels.forEach(c => c.cancel());
        }
    }
}