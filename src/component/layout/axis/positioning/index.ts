import {IPadding, IRectangle} from "../../../../geometry/rectangle";
import * as lineSize from './size';
import * as intervals from './interval';
import * as center from './center';
import * as assign from './assign';

export interface IOverflowSettings{
    left?: number;
    right?: number;
    bottom?: number;
    top?: number;
}

export interface IPositionSettings{
    x: number;
    y: number;
    component: IRectangle;
    resizeWidth?: boolean;
    resizeHeight?: boolean;
    border?: "include" | "exclude";
    width?: number;
    height?: number;
    halign?: "left" | "right" | "middle";
    valign?: "top" | "bottom" | "middle";
    overflow?: IOverflowSettings;
    cell?: IRectangle;
    shape?: IRectangle;
    isSvg?: boolean;
}

export interface IAxisPositioningSettings{
    center: IRectangle;
    container: IRectangle;
    border: IPadding;
    elements:IPositionSettings[];
}

export default function(settings: IAxisPositioningSettings){
    var widthPositions = lineSize.sortPosToMaxWidth(lineSize.default(settings.elements.map(el => {
        return {
            position: el.x,
            size: el.resizeWidth ? 0 : el.component.width
        }
    })));
    var heightPositions = lineSize.sortPosToMaxWidth(lineSize.default(settings.elements.map(el => {
        return {
            position: el.y,
            size: el.resizeHeight ? 0 : el.component.height
        }
    })));
    var widthPartitionPos = lineSize.partitionPositions(widthPositions);
    var heightPartitionPos = lineSize.partitionPositions(heightPositions);
    var areaSizes = lineSize.getAreaSizes(widthPartitionPos, heightPartitionPos);

    var relativeCenterPositions = center.centerStartsWithBorder({
        areaSizes: areaSizes,
        border: settings.border,
        container: settings.container
    });

    var gridIntervals = intervals.generateIntervalGrid({
        centerPositions: relativeCenterPositions.positions,
        center: relativeCenterPositions.center,
        widthPartitions: widthPartitionPos,
        heightPartitions: heightPartitionPos,
        border: settings.border
    });

    assign.default({
        border: settings.border,
        grid: gridIntervals,
        elements: settings.elements
    });

    settings.center.x = relativeCenterPositions.positions.left+settings.border.left;
    settings.center.width = (relativeCenterPositions.positions.right - settings.border.right) - settings.center.x;
    settings.center.y = relativeCenterPositions.positions.top + settings.border.top;
    settings.center.height = (relativeCenterPositions.positions.bottom - settings.border.bottom) - settings.center.y;

    return gridIntervals;

}