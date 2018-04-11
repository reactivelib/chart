import {IPadding} from "../../../../geometry/rectangle";

export interface IPositionAndSize{
    position: number;
    size: number;
}

export default function transformToMaxSize(pos: IPositionAndSize[]){
    var posToMaxWidth: {[s: string]: number} = {};
    pos.forEach(p => {
        posToMaxWidth[p.position] = Math.max((posToMaxWidth[p.position] || 0), p.size);
    });
    return posToMaxWidth;
}

export function sortPosToMaxWidth(posToMaxSize: {[s: string]: number}): IPositionAndSize[]{
    var res: IPositionAndSize[] = [];
    for(var x in posToMaxSize){
        var size = posToMaxSize[x];
        res.push({
            position: parseInt(x),
            size: Math.round(size)
        });
    }
    res.sort((a, b) => a.position - b.position);
    return res;
}

export interface IPartitionedPositions{
    smallerZero: IPositionAndSize[];
    biggerZero: IPositionAndSize[];
}

export function partitionPositions(positions: IPositionAndSize[]): IPartitionedPositions{
    var smaller = [];
    var bigger = [];
    for (var i=0; i < positions.length; i++){
        var pos = positions[i];
        if (pos.position < 0){
            smaller.push(pos);
        }
        else if(pos.position > 0)
        {
            bigger.push(pos);
        }
    }
    return {
        smallerZero: smaller,
        biggerZero: bigger
    }
}

export function getFullSize(positions: IPositionAndSize[]){
    var s = 0;
    for (var i=0; i < positions.length; i++){
        s += positions[i].size;
    }
    return s;
}

export function getAreaSizes(widthPartitions: IPartitionedPositions, heightPartitions: IPartitionedPositions): IPadding{
    var leftWidth = getFullSize(widthPartitions.smallerZero);
    var rightWidth = getFullSize(widthPartitions.biggerZero);
    var topHeight = getFullSize(heightPartitions.smallerZero);
    var bottomHeight = getFullSize(heightPartitions.biggerZero);
    return {
        left: leftWidth,
        right: rightWidth,
        top: topHeight,
        bottom: bottomHeight
    }
}