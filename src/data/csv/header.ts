export function hasHeader(lines: string[][], dataIndex: number){
    if (lines.length === 0){
        return false;
    }    
    var line1 = lines[0];
    for (var i=dataIndex; i < line1.length; i++){
        if (!(/^\d+$/.test(line1[i]))){
            return true;
        }
    }
    return false;
}