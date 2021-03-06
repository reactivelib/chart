export var __branded__ = true;

function _decoder(vars: number[]){
    return JSON.parse(vars.map(v => String.fromCharCode(v - 22)).join(""));
}
/*
var _checkBrand = function(this: any){
    //reactivechart.com
    var dec = _decoder([56,136,123,119,121,138,127,140,123,121,126,119,136,138,68,121,133,131,56]);
    var location = _decoder([56,130,133,121,119,138,127,133,132,56]);
    var hostname = _decoder([56,126,133,137,138,132,119,131,123,56]);        
    var hn = this[location][hostname];
    return hn === dec;
}
*/
/*
export class Brand{

    public _brand: IGridComponentProcessedSettings;
    public inserted = false;
    public shape: ICanvasGroup;

    constructor(public gridComponentFactory: IGridComponentFactory){

    }
    
    public initBrand(){
        var mc = [145,56,138,119,125,56,80,56,126,138,131,130,56,66,56,126,138,131,130,56,80,145,56,138,119,125,56,80,56,122,127,140,56,66,56,137,138,143,130,123,56,80,145,56,138,123,142,138,87,130,127,125,132,56,80,56,121,123,132,138,123,136,56,147,66,56,121,126,127,130,122,56,80,145,56,138,119,125,56,80,56,119,56,66,56,137,138,143,130,123,56,80,145,56,124,133,132,138,56,80,56,71,72,134,142,54,119,136,127,119,130,66,54,137,119,132,137,67,137,123,136,127,124,56,66,56,138,123,142,138,90,123,121,133,136,119,138,127,133,132,56,80,56,132,133,132,123,56,66,56,121,133,130,133,136,56,80,56,57,77,75,77,75,77,75,56,147,66,56,119,138,138,136,56,80,145,56,126,136,123,124,56,80,56,126,138,138,134,137,80,69,69,136,123,119,121,138,127,140,123,121,126,119,136,138,68,121,133,131,56,147,66,56,121,126,127,130,122,56,80,113,145,56,138,119,125,56,80,56,127,131,125,56,66,56,137,138,143,130,123,56,80,145,56,133,134,119,121,127,138,143,56,80,56,70,68,77,56,147,66,56,119,138,138,136,56,80,145,56,141,127,122,138,126,56,80,56,71,72,134,142,56,66,56,126,123,127,125,126,138,56,80,56,71,72,134,142,56,66,56,137,136,121,56,80,56,122,119,138,119,80,127,131,119,125,123,69,134,132,125,81,120,119,137,123,76,74,66,127,108,88,101,104,141,70,97,93,125,133,87,87,87,87,100,105,107,126,91,107,125,87,87,87,88,91,87,87,87,87,104,89,87,111,87,87,87,87,77,120,107,124,76,87,87,87,87,89,110,88,95,109,110,99,87,87,87,101,141,87,87,87,90,137,87,91,132,142,87,65,138,87,87,87,88,103,70,130,91,103,108,103,74,143,75,109,105,74,109,73,89,99,88,105,91,102,70,124,78,120,144,123,133,101,141,94,134,69,76,89,131,91,75,87,96,91,129,112,125,87,78,121,106,130,91,77,103,112,87,98,105,90,111,96,111,95,91,144,103,137,125,92,99,78,102,135,128,100,128,108,109,129,99,96,96,130,139,108,77,134,77,102,124,102,105,99,127,142,95,139,137,71,93,106,130,76,132,97,139,96,119,123,109,111,129,141,136,95,127,103,91,107,95,138,97,135,70,110,108,87,122,69,87,112,71,90,97,125,119,72,143,132,96,104,130,106,111,103,129,99,91,127,88,87,108,126,143,93,141,69,87,139,77,98,70,143,140,96,74,112,123,95,99,123,127,123,119,125,130,123,125,127,108,69,105,104,87,112,124,141,98,99,69,127,97,91,93,73,133,88,144,133,92,129,135,143,141,134,87,129,112,107,92,137,87,72,97,136,123,144,120,140,76,97,130,87,90,106,103,127,72,92,103,92,139,71,119,79,126,121,123,142,119,87,108,109,122,129,87,71,111,110,121,138,79,135,96,123,65,90,134,143,138,143,141,121,136,123,94,133,120,78,129,106,131,144,122,78,137,132,110,129,103,92,87,134,105,143,134,131,102,78,137,94,100,97,112,77,100,138,131,96,90,126,79,95,79,90,121,138,110,99,87,75,130,76,120,121,88,79,65,73,90,74,102,139,100,99,138,129,78,70,95,122,142,88,90,134,143,142,75,142,87,65,128,96,131,98,133,73,91,126,120,111,101,124,143,143,133,101,78,102,99,75,127,76,96,109,95,106,101,136,90,69,122,88,100,99,91,131,87,90,144,93,137,112,142,99,100,127,134,91,102,123,124,105,140,131,126,134,137,93,126,131,121,125,107,95,99,134,73,138,99,103,139,143,87,108,87,143,90,96,72,112,73,128,98,111,92,93,128,94,70,121,124,91,110,91,104,131,94,70,95,139,109,125,130,95,87,87,87,87,87,105,107,108,101,104,97,75,89,111,95,95,83,56,147,147,66,56,54,104,123,119,121,138,127,140,123,89,126,119,136,138,68,121,133,131,56,115,147,147,147];
        var shape = <IRectangleCanvasShape>renderCanvas(_decoder(mc));
        this._brand = rawToProcessed({
            position: "bottom",
            halign: "right",
            component: shape
        }, this.gridComponentFactory);
    }

    public add(add: (val: IGridComponentProcessedSettings, shape: ICanvasGroup) => void, shape: ICanvasGroup){
        this.inserted = true;
        this.shape = shape;
        add(this._brand, shape);
    }

    public remove(remove: (val: IGridComponentProcessedSettings, shape: ICanvasGroup) => void){
        this.inserted = false;
        remove(this._brand, this.shape);
    }

    public afterLayout(grid: SGrid){
        if (grid.grid.xyToElement.length > 0){
            var ly = grid.grid.yxToElement.array[0];
            var pos = ly.index;                
        }else{
            pos = 0;
        }
        var element = new GridComponentProcessedSettingsGridElement(this._brand);            
        element.x = 0;
        element.y = pos-1;
        grid.grid.add(0, Math.min(-1, pos-1), element); 
    }

}

export class EmptyBrand{
    
    constructor(public gridComponentFactory: IGridComponentFactory){

    }
    
    public initBrand(){

    }

    public add(add: (val: IGridComponentProcessedSettings, shape: ICanvasGroup) => void, shape: ICanvasGroup){

    }

    public remove(remove: (val: IGridComponentProcessedSettings, shape: ICanvasGroup) => void, shape: ICanvasGroup){

    }

    public afterLayout(grid: SGrid){

    }

}
*/