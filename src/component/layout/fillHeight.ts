import {html} from "@reactivelib/html";
import {IDimension} from "../../geometry/rectangle";
import {measureElement} from "../../chart/render/html/measure/box";

export default function(child: html.IHtmlConfig & IDimension){
    var childNode: html.IHtmlNodeShape;
    return {
        tag: "custom",
        onAttached: () => {
            childNode = <html.IHtmlNodeShape>html(child);
        },
        render(ctx: html.IHtmlRenderContext){
            var mes = measureElement((<HTMLElement>ctx.element));
            child.width = mes.contentWidth;
            child.height = mes.contentHeight;
            childNode.render(ctx);
        },
        onDetached(){
            childNode.onDetached();
        }
    }

}