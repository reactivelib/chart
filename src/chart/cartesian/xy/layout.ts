import {IRelativePositionedGridElement} from "../../../component/layout/axis/positioning/relative";

export function xyToolbarLayout(): IRelativePositionedGridElement[]{
    return [{
        position: "inner-top",
        component: {
            type: "toolbar"
        },
        halign: "left"
    }];
}