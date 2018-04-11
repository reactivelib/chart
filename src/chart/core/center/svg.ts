/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {array} from "@reactivelib/reactive";
import {html} from "@reactivelib/html";
import {CoreChart} from "../basic";
import {IRectangle} from "../../../geometry/rectangle/index";
import {autoStart, deps, init, inject} from "../../../config/di/index";

export class CenterSVG{

    public attr: any;
    public node: html.IHtmlShape;
    public tag: "svg";
    public style: any;

    @inject
    chart: CoreChart

    constructor(){

    }

    public child = array<html.IHtmlShapeTypes>();

    @init
    init(){
        var self = this;
        this.attr = {

            get width(){
                return self.chart.center.width;
            },

            get height(){
                return self.chart.center.height;
            },
            class: "center-svg"
        }
        this.style = {
            position: "absolute",
            left: "0px",
            top: "0px"
        }
        this.chart.layoutShape.children.push(this);
    }
}

CenterSVG.prototype.tag = "svg";