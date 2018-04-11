import {ICancellable} from "@reactivelib/reactive";
import {extend} from "@reactivelib/core";
import {ICanvasChildShape} from "../../canvas/shape/index";
import {IStylable} from "../../canvas/style/index";

export interface IHighlightable{

    /**
     * Highlights the elements inside this shape
     * 
     * @returns ICancellable cancelling the highlight
     * 
     */
    highlight(): ICancellable;

}

export interface IHighlighterShape extends ICanvasChildShape, IHighlightable{
    highlighter: IHighlightable;
}

export class Highlighter implements IHighlightable{
    
    public nr = 0;

    constructor(public highlighting: IHighlighting){
        
    }
    
    public highlight(){
        this.nr++;
        if (this.nr === 1){
            this.highlighting.doHighlight();
        }
        return { cancel: () => {
            this.nr--;
            if (this.nr === 0){
                this.highlighting.undoHighlight();
            }
        }};
    }

}

export interface IHighlighting{
    doHighlight(): void;
    undoHighlight(): void;
}

export class StyleHighlighting implements IHighlighting{

    private style: any;
    public oldStyle: any;

    constructor(public shape: IStylable, public getStyle: () => any){

    }

    public doHighlight(){
        this.style = this.getStyle();
        this.oldStyle = this.shape.style;
        this.shape.style = extend({}, this.oldStyle, this.style);
    }

    public undoHighlight(){
        if (this.oldStyle){
            this.shape.style = this.oldStyle;
            this.oldStyle = null;
        }        
    }
}