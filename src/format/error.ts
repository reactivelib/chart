import {INumberFormatter} from "./index";

export class RoundingErrorFormat implements INumberFormatter{
    
    constructor(public nrOfCommas: number){
        
    }
    
    public format(numb: number){
        var split = (numb+"").split(".");
        if (split.length === 1)
        {
            return split[0];
        }
        else{
            var left = split[0];
            var right = split[1];
            right = right.substr(0, Math.min(this.nrOfCommas, right.length));
            var lastIndex = right.length - 1;
            while(lastIndex >= 0 && right[lastIndex] === '0'){
                lastIndex --;
            }
            if (lastIndex === -1){
                return left;
            }
            else{
                return left+"."+right.substr(0, lastIndex+1);
            }
        }
    }
    
}

export default function(nrOfCommas: number){
    return new RoundingErrorFormat(nrOfCommas);
}