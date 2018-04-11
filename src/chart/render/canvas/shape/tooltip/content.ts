import {html} from "@reactivelib/html";
import {extend} from "@reactivelib/core";
import {IDecimalAttrProps} from "../../../html/decimal";

type IHtmlAttributesAndProperties = html.IHtmlAttributesAndProperties;

export interface ITooltipTableContentSettings{
    
    div?: IHtmlAttributesAndProperties;
    table?: IHtmlAttributesAndProperties;
    tr?: IHtmlAttributesAndProperties;
    td?: IHtmlAttributesAndProperties;
    th?: IHtmlAttributesAndProperties;
    tbody?: IHtmlAttributesAndProperties;
    thead?: IHtmlAttributesAndProperties;
    tfoot?: IHtmlAttributesAndProperties;
    decimal?: IDecimalAttrProps;
    
}

export function createContentCreator(name: string, attributes:IHtmlAttributesAndProperties){
    return function(content: any){
        return extend.deep({
            tag: name
        }, attributes, content)
    }
}

var defaults = {
    div: {
        tag: "div"
    },
    table: {
        tag: "table"
    },
    tr: {
        tag: "tr",
    },
    td: {
        tag: "td"
    },
    th: {
        tag: "th"
    },
    tbody: {
        tag: "tbody"
    },
    thead: {
        tag: "thead"
    },
    tfoot: {
        tag: "tfoot"
    },
    decimal: {
        tag: "decimal",
        format: ",###.###"
    }
}

type Content<T> = {
    [P in keyof T]?: (content: any) => any;
}

export function createTooltipContentCreator(settings: ITooltipTableContentSettings): Content<typeof defaults>{
    var res: any = {};
    for (var k in defaults){
        res[k] = createContentCreator(k, extend.deep({},  (<any>defaults)[k], (<any>settings)[k]));
    }
    return res;
}