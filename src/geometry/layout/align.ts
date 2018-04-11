import {IRectangle} from "../rectangle/index";
export class Aligner {

    private pos = 0;

    constructor(){
        
    }

    public position(position: number) {
        this.pos = position;
        return this;
    }

    public centerHorizontal(rect: IRectangle) {
        rect.x = this.pos - (rect.width / 2);
        return this;
    }

    public centerVertical(rect: IRectangle) {
        rect.y = this.pos - (rect.height / 2);
        return this;
    }

    public top(rect: IRectangle){
        rect.y = this.pos;
        return this;
    }

    public bottom(rect: IRectangle) {
        rect.y = this.pos - rect.height;
        return this;
    }

    public left(rect: IRectangle) {
        rect.x = this.pos;;
        return this;
    }

    public right(rect: IRectangle) {
        rect.x = this.pos - rect.width;;
        return this;
    }

}

export function top(pos: number, rect: IRectangle){
    rect.y = pos;
}

export function centerHorizontal(pos: number, rect: IRectangle){
    rect.x = pos - (rect.width / 2);
}

export function centerVertical(pos: number, rect: IRectangle){
    rect.y = pos - (rect.height / 2);
}

export function right(pos: number, rect: IRectangle){
    rect.x = pos - rect.width;
}

export default function align() {
    return new Aligner();
}