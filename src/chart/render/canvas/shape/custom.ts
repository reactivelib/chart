import {ICanvasConfig} from "./create";
import {CanvasContext, ICanvasContext} from "../context/index";
import {ICanvasChildShape} from "./index";
import {IPoint} from "../../../../geometry/point/index";
import {IFindInfo} from "../find/index";

export interface ICustomSettings extends ICanvasConfig{
    tag: "custom";
    draw(ctx: ICanvasContext);
    find?(pt: IPoint, ctx: CanvasContext): IFindInfo[];
}

export class CustomShape implements ICanvasChildShape{

    public parent: ICanvasChildShape;

    constructor(public settings: ICustomSettings){

    }

    public onAttached(){
        this.settings.onAttached && this.settings.onAttached();
    }

    public onDetached(){
        this.settings.onDetached && this.settings.onDetached();
    }

    public draw(ctx: CanvasContext){
        this.settings.draw && this.settings.draw(ctx);
    }

    public find(pt: IPoint, ctx: CanvasContext){
        if (!this.settings.find){
            return null;
        }
        return this.settings.find(pt, ctx);
    }

    public __shape_node: boolean;

}

CustomShape.prototype.__shape_node = true;

export default function(settings: ICustomSettings){
    return new CustomShape(settings);
}