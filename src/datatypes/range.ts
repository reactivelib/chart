export interface IYIndexedData{
    y: number;
}

export interface IXIndexedData{
    x: number;
}

export interface IXIntervalData extends IXIndexedData{
    xe?: number;
}

export interface IYIntervalData{
    y: number;
    ye?: number;
}

export interface ITimeHorizontalDataRange extends IXIntervalData{
    cat: number;
}

export function getEndX(data: IXIntervalData){
    if ("xe" in data){
        return data.xe;
    }
    return data.x;
}

export function getEndY(data: IYIntervalData){
    if ("ye" in data){
        return data.ye;
    }
    return data.y;
}

export function getXSize(data: IXIntervalData){
    return getEndX(data) - data.x;
}