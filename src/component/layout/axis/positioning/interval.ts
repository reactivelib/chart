import {IPartitionedPositions, IPositionAndSize} from "./size";
import {IPointInterval} from "../../../../geometry/interval";
import {RedBlackTree} from "../../../../collection/sorted/redblack";
import {IDimension, IPadding} from "../../../../geometry/rectangle";

export interface IPositionAndInterval{
    position: number;
    interval: IPointInterval;
}

export function generateDecreasingIntervals(positions: IPositionAndSize[], start: number): IPositionAndInterval[]{
    var res = [];
    for (var i=positions.length -1; i >= 0; i--){
        var p = positions[i];
        var end = start - p.size;
        res.push({
            position: p.position,
            interval: {
                end: start,
                start: end
            }

        });
        start = end;
    }
    return res;
}

export function generateIncreasingIntervals(positions: IPositionAndSize[], start: number): IPositionAndInterval[]{
    var res = [];
    for (var i=0; i < positions.length; i++){
        var p = positions[i];
        var end = start + p.size;
        res.push({
            position: p.position,
            interval: {
                end: end,
                start: start
            }
        });
        start = end;
    }
    return res;
}

export interface IIntervalGridSettings{
    centerPositions: IPadding;
    center: IDimension;
    border: IPadding;
    widthPartitions: IPartitionedPositions;
    heightPartitions: IPartitionedPositions;
}

export function insertElements(tree: RedBlackTree<number, IPointInterval>, poses: IPositionAndInterval[]){
    for (var i=0; i < poses.length; i++){
        var l = poses[i];
        tree.insert(l.position, l.interval);
    }
}

export interface IGridIntervals{
    width: RedBlackTree<number, IPointInterval>;
    height: RedBlackTree<number, IPointInterval>;
}

export function generateIntervalGrid(settings: IIntervalGridSettings){

    var widthPartitionPos = settings.widthPartitions;
    var heightPartitionPos = settings.heightPartitions;
    var poses = settings.centerPositions;

    var xLeftInterval = generateDecreasingIntervals(widthPartitionPos.smallerZero, poses.left);
    var xRightInterval = generateIncreasingIntervals(widthPartitionPos.biggerZero, poses.right);
    var yTopInterval = generateDecreasingIntervals(heightPartitionPos.smallerZero, poses.top);
    var yBottomInterval = generateIncreasingIntervals(heightPartitionPos.biggerZero, poses.bottom);

    var width = new RedBlackTree<number, IPointInterval>((a, b) => a - b);
    var height = new RedBlackTree<number, IPointInterval>((a, b) => a - b);
    insertElements(width, xLeftInterval);
    var s = settings.centerPositions.left+settings.border.left;
    width.insert(0, {
        start: s,
        end: s + settings.center.width
    });
    insertElements(width, xRightInterval);
    insertElements(height, yTopInterval);
    var e = settings.centerPositions.top+settings.border.top;
    height.insert(0, {
        start: e,
        end: e + settings.center.height
    });
    insertElements(height, yBottomInterval);
    return {
        width: width,
        height: height
    }
}