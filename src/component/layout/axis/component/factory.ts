import {IRelativePositionedGridElement} from "../positioning/relative";
import {IRectangle} from "../../../../geometry/rectangle";

export class RelativePositionedComponentProxy implements IRelativePositionedGridElement{

    constructor(public original: IRelativePositionedGridElement, public component: IRectangle){

    }

    public cancel(){

    }

    get position(){
        return this.original.position;
    }

    get isSvg(){
        return this.original.isSvg;
    }

    get resizeWidth(){
        return this.original.resizeWidth;
    }

    get resizeHeight(){
        return this.original.resizeHeight;
    }

    get border(){
        return this.original.border;
    }

    get width(){
        return this.original.width;
    }

    get height(){
        return this.original.height;
    }

    get halign(){
        return this.original.halign;
    }

    get valign(){
        return this.original.valign;
    }

    get overflow(){
        return this.original.overflow;
    }

    get cell(){
        return this.original.cell;
    }

    set cell(c){
        this.original.cell = c;
    }

    get shape(){
        return this.original.shape;
    }

    set shape(s){
        this.original.shape = s;
    }

    get layout(){
        return this.original.layout;
    }


}

export interface IRelativePosComponentFactory{
    create(comp: IRelativePositionedGridElement): IRelativePositionedGridElement;
}