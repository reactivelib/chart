/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IShapeConfig} from "@reactivelib/html";
import {IInteraction} from "../interaction/index";
import {fromConfig as renderRectangle, IRectangleConfig} from "./rectangle/index";
import {fromConfig as renderDonut, IDonutShapeConfig} from "./doughnut/index";
import {fromConfig as renderPoint, IPointConfig} from "./point/index";
import {fromConfig as renderLine, ILineConfig} from "./line/index";
import {fromConfig as renderGroup, IGroupConfig} from "./group/index";
import {fromConfig as renderHTML, IHtmlRendererConfig} from "./html/index";
import {isNode} from "@reactivelib/html";
import {ICanvasStyle} from "../style/index";
import {renderSvgShape} from "./svg";
import {ICanvasEventSettings} from "../event/index";
import {default as custom, ICustomSettings} from "./custom";
import {ICanvasChildShape} from "./index";

/**
 * A shape inside a canvas
 */
export interface ICanvasConfig extends IShapeConfig{
    
    interaction?: IInteraction;
    style?: ICanvasStyle;
    event?: ICanvasEventSettings;
    onAttached?: () => void;
    onDetached?: () => void;
    node?: ICanvasChildShape;

}

export type CanvasShapeSettings = IPointConfig | IRectangleConfig | IHtmlRendererConfig | ILineConfig | IDonutShapeConfig | IGroupConfig | ICustomSettings;
export type ICanvasShapeOrConfig = CanvasShapeSettings | ICanvasConfig | ICanvasChildShape;

export function renderCanvas(config: ICanvasShapeOrConfig): ICanvasChildShape{
    if ((isNode(config))){
        return <ICanvasChildShape>config;
    }
    var res: ICanvasChildShape;
    switch((<ICanvasConfig>config).tag){
        case "rectangle":
            res = renderRectangle(<any>config);
            break;
        case "donut":
        case "doughnut":
            res = renderDonut(<any> config);
            break;
        case "point":
            res = renderPoint(<any> config);
            break;
        case "line":
            res = renderLine(<any> config);
            break;
        case "g":
        case "group":
            var gr = renderGroup(<any> config);
            res = gr;
            break;
        case "html":
            res = renderHTML(<any>config);
            break;
        case "svg":
            res = renderSvgShape(<any>config);
            break;
        case "chart":
            break;
        case "custom":
            res = custom(<any>config);
            break;
        default:
            throw new Error("Unknown canvas shape type "+(<ICanvasConfig>config).tag);
    }
    (<ICanvasConfig>config).node = res;
    return res;
}

export default renderCanvas;