import {IRectangle} from "../../../rectangle/index";

export interface IPositioned{

    position: number;

}

export interface IPositionedRectangle extends IPositioned, IRectangle{

}