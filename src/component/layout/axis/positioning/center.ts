import {IDimension, IPadding, IRectangle} from "../../../../geometry/rectangle";

export interface ICenterStartSettings{
    areaSizes: IPadding;
    container: IRectangle;
    border: IPadding;
}

export interface ICenterStartResult{

    center: IDimension;
    positions: IPadding;

}

export function centerStartsWithBorder(settings: ICenterStartSettings): ICenterStartResult{
    var sizes = settings.areaSizes;
    var leftWidth = sizes.left;
    var rightWidth = sizes.right;
    var bottomHeight = sizes.bottom;
    var topHeight = sizes.top;

    var centerWidth = Math.max(0, settings.container.width - leftWidth - rightWidth - settings.border.left - settings.border.right);
    var centerHeight = Math.max(0, settings.container.height - topHeight - bottomHeight - settings.border.bottom - settings.border.top);

    var leftStart = settings.container.x + leftWidth;
    var rightStart = leftStart+centerWidth+settings.border.left+settings.border.right;
    var topStart = settings.container.y + topHeight;
    var bottomStart = topStart +centerHeight + settings.border.top + settings.border.bottom;

    return {
        center: {
            width: centerWidth,
            height: centerHeight
        },
        positions: {
            left: leftStart,
            right: rightStart,
            top: topStart,
            bottom: bottomStart
        }
    }
}