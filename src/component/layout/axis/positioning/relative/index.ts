import {IRectangle} from "../../../../../geometry/rectangle";
import {RectangleSide} from "../../../../../geometry/layout/rectangle/incremental/side";
import {IShapeConfig} from "@reactivelib/html";
import {IComponentConfig} from "../../index";
import {IRectangleBaseShape} from "../../../../../chart/render/rectangle";

export type ComponentPosition = RectangleSide | "inner-left" | "inner-bottom" | "inner-top" | "inner-right";

export var centerPositions = {
    "inner-top": 1,
    "inner-bottom": 1,
    "inner-left": 1,
    "inner-right": 1
}

export interface IOverflowSettings{
    left?: number;
    right?: number;
    bottom?: number;
    top?: number;
}

export interface IGridPosition{

    x: number;
    y: number;
    surface?: "inner" | "outer";

}

export interface IRelativePositionedGridElement{

    position: ComponentPosition | IGridPosition;
    component: IComponentConfig | IShapeConfig | IRectangle;
    resizeWidth?: boolean;
    resizeHeight?: boolean;
    border?: "include" | "exclude";
    width?: number;
    height?: number;
    halign?: "left" | "right" | "middle";
    isSvg?: boolean;
    valign?: "top" | "bottom" | "middle";
    overflow?: IOverflowSettings;
    cell?: IRectangle;
    shape?: IRectangleBaseShape;
    layout?: IRelativePositionedGridElement[];
    cancel?();

}