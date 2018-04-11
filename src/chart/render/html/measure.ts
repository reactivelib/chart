import {IBoxModel, parseBoxModel} from "./measure/box";
import {html} from "@reactivelib/html";

export function calculateFontHeight(style: any, element: HTMLElement = document.body){
    var div = document.createElement("div");
    div.innerHTML = "19gGmMq,?p";
    for (var p in style){
        (<any>div.style)[p] = style[p];
    }
    div.style.position = 'absolute';
    div.style.padding = "0";
    div.style.margin = "0";
    div.style.top = '-10000px';
    div.style.left = '-10000px';
    element.appendChild(div);
    var textHeight = parseInt(window.getComputedStyle(div).height);
    element.removeChild(div);
    return textHeight;
}

export function calculateBoxModel(style: any): IBoxModel{
    var div = document.createElement("div");
    div.innerHTML = "19gGmMq,?p";
    for (var p in style){
        (<any>div.style)[p] = style[p];
    }
    div.style.position = 'absolute';
    div.style.padding = "0";
    div.style.margin = "0";
    div.style.top = '-10000px';
    div.style.left = '-10000px';
    document.body.appendChild(div);
    style = window.getComputedStyle(div);
    var box = parseBoxModel(div, style);
    document.body.removeChild(div);
    return box;
}

export function measureShapeDimensions(create: () => html.IHtmlShape, element: Node){
    var html = create();
    element.appendChild(html.element);
    html.onAttached && html.onAttached();
    var cr = (<HTMLElement>html.element).getBoundingClientRect();
    var res = {
        width: cr.width,
        height: cr.height
    }
    element.removeChild(html.element);
    return res;
}