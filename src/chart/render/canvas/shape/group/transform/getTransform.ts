import {ITransformingShape} from "./index";
import {getTransform as gt} from "../index";
import {AffineMatrix, TransformationWithMatrix} from "../../../../../../math/transform/matrix";

export type type = ITransformingShape;

export function getTransform(shape: ITransformingShape){
    if ("parent" in shape){
        var tr = gt((<any>shape).parent);
    }
    else {
        tr = new AffineMatrix(1, 0, 0, 0, 1, 0);
    }
    var g: any = shape;
    if (g.x)
    {
        (<AffineMatrix>tr).translate(g.x, 0);
    }
    if (g.y)
    {
        (<AffineMatrix>tr).translate(0, g.y);
    }
    if (g.mapper){
        tr =  new TransformationWithMatrix(<AffineMatrix>tr, g.mapper);
    }
    return tr;
}