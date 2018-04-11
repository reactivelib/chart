import {IRectangle} from "../rectangle/index";
export interface IArrangement{
    (rect: IRectangle): IArrangement;
}

export class RectangleArrangement{

    public start: number = 0;
    private _margin = 0;

    constructor(){

    }

    public margin(margin: number) {
        this._margin = margin;
        return this;
    }

    public startFrom(start: number) {
        this.start = start;
        return this;
    }

    public leftToRight(): IArrangement{
        var _this = this;
        var left = this.start;
        function arr(rect: IRectangle) {
            rect.x = left;
            left += _this._margin + rect.width;
            return arr;
        }
        return arr;
    }

    public rightToLeft(): IArrangement {
        var _this = this;
        var right = this.start;
        function arr(rect: IRectangle){
            rect.x = right - rect.width;
            right -= rect.width + _this._margin;
            return arr;
        }
        return arr;
    }

    public topToBottom(): IArrangement {
        var _this = this;
        var pos = this.start;
        function arr(rect: IRectangle){
            rect.y = pos;
            pos += _this._margin + rect.height;
            return arr;
        }
        return arr;
    }

    public bottomToTop(): IArrangement {
        var _this = this;
        var pos = this.start;
        function arr(rect: IRectangle){
            rect.y = pos - rect.height;
            pos -= rect.height + _this._margin;
            return arr;
        }
        return arr;
    }

}

export default function arrange() {
    return new RectangleArrangement();
}
