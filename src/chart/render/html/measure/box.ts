import {html} from "@reactivelib/html";

export interface IBoxModel{
    paddingLeft: number;
    paddingRight: number;
    paddingBottom: number;
    paddingTop: number;
    borderLeft: number;
    borderRight: number;
    borderBottom: number;
    borderTop: number;
    marginLeft: number;
    marginRight: number;
    marginTop: number;
    marginBottom: number;
    contentWidth: number;
    contentHeight: number;
    width: number;
    height: number;
}

export function parseBoxModel(el: Element, style: html.ICSSStyle): IBoxModel
{
    var notFound = false;
    if (!style){
        style = {

        };
        notFound = true;
    }
    var ml = parseFloat(style.marginLeft) || 0;
    var bl =  parseFloat(style.borderLeftWidth) || 0;
    var pl = parseFloat(style.paddingLeft) || 0;
    var mt = parseFloat(style.marginTop) || 0;
    var bt = parseFloat(style.borderTopWidth) || 0;
    var pt = parseFloat(style.paddingTop) || 0;
    var mr = parseFloat(style.marginRight) || 0;
    var br = parseFloat(style.borderRightWidth) || 0;
    var pr = parseFloat(style.paddingRight) || 0;
    var mb = parseFloat(style.marginBottom) || 0;
    var bb = parseFloat(style.borderBottomWidth) || 0;
    var pb = parseFloat(style.paddingBottom) || 0;
    var width = (<HTMLElement>el).offsetWidth + ml + mr;
    var height = (<HTMLElement>el).offsetHeight + mt + mb;
    width = Math.max(1, width);
    height = Math.max(1, height);
    return {
        paddingLeft: pl,
        paddingRight: pr,
        paddingBottom: pb,
        paddingTop: pt,
        borderLeft: bl,
        borderRight: br,
        borderBottom: bb,
        borderTop: bt,
        marginLeft: ml,
        marginRight: mr,
        marginTop: mt,
        marginBottom: mb,
        contentWidth: width - ml - bl - pl - mr - br - pr,
        contentHeight: height - mt - bt -pt - mb - bb - pb,
        width: width,
        height: height
    }
}

export function measureElement(el: Element){
    var style = window.getComputedStyle(el, null);
    return parseBoxModel(el, style || {});
}
