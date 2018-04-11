/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {layoutOverlapping} from '../../render/canvas/label/collection/layout/overlap';
import {IValuePoint} from "../../../datatypes/value";
import {LabelDimensionCacher} from "../../render/canvas/label/dimension";
import {ILabelStyle} from "../../render/canvas/label/cache/index";
import {IPieSeries, PieSeries} from "../series";
import {IDimension, IRectangle} from "../../../geometry/rectangle";
import {PieChart} from "..";
import {array} from "@reactivelib/reactive";
import {RTree} from "../../../collection2d/rtree";
import {IDonut} from '../../render/canvas/shape/doughnut/index';
import {polarToCartesian} from '../../../math/transform/polar';
import {HashMap} from '../../../collection/hash';
import {html} from "@reactivelib/html";
import {ILabelAndCancel, ILabelRenderer} from "./render";
import {create, init, inject} from "../../../config/di";
import render from './render';

class DimensionCacher extends LabelDimensionCacher<IValuePoint>{

    constructor(public render: (data: IValuePoint, series: IPieSeries) => ILabelRenderer){
        super();
    }

    public series: IPieSeries;

    calculateLabelDimensions(data: IValuePoint){
        return this.render(data, this.series).getDimension();
    }
}

class CachingLabelGroup{


    public dataToLabel = new HashMap<IValuePoint, ILabelAndCancel>();
    public old: HashMap<IValuePoint, ILabelAndCancel>;

    constructor(public render: (data: IValuePoint, series: IPieSeries) => ILabelRenderer){

    }

    public start(){
        this.old = this.dataToLabel;
        this.dataToLabel = new HashMap();
    }

    public addLabel(data: IValuePoint, series: IPieSeries): IRectangle{
        var old = this.old.get(data);
        if (!old){
            var label = this.render(data, series).attachLabel();
            this.dataToLabel.put(data, label);
            return label.label;
        }
        else{
            this.dataToLabel.put(data, old);
            return old.label;
        }
    }

    public finish(){
        for (var p in this.old.objects){
            if (!(p in this.dataToLabel.objects)){
                var oldL = this.old.objects[p];
                oldL.value.cancel();
                this.old.remove(oldL.key);
            }
        }
    }

}

export class PieChartLabelLayouter{

    @create(function(this: PieChartLabelLayouter){
        return new DimensionCacher(this.render)
    })
    public dimensions: DimensionCacher;
    @create(function(this: PieChartLabelLayouter){
        return new CachingLabelGroup(this.render)
    })
    public labelGroup: CachingLabelGroup;

    @inject
    chart: PieChart

    @inject
    series: array.IReactiveArray<PieSeries>

    @init
    init(){
        var self = this;
        this.chart.center.getLayer(10).getSvg().child.push({
            tag: "custom",
            render(){
                self.layoutLabels();
            }
        });
    }

    @create(function(this: PieChartLabelLayouter){
        return render(this.chart.settings, this.chart);
    })
    render: (data: IValuePoint, series: IPieSeries) => ILabelRenderer

    public calculateLabelPosition(shape: IDonut, dimensions: IDimension, cx: number, cy: number){
        var radius = shape.startRadius + ((shape.endRadius - shape.startRadius) / (3/2));
        var angle = (shape.startAngle + shape.endAngle) / 2;
        var pt = polarToCartesian(angle, radius);
        pt.x += cx - dimensions.width / 2;
        pt.y += cy - dimensions.height / 2;
        return pt;
    }

    public layoutLabels(){
        var rtree = new RTree();
        var cx = this.chart.centerX;
        var cy = this.chart.centerY;
        var sers = this.series.array;
        var overlap = (this.chart.settings.label && this.chart.settings.label.overlap) || false;
        this.labelGroup.start();
        for (var i=0; i < sers.length; i++){
            var ser = sers[i];
            this.dimensions.series = ser;
            for (var j=0; j < ser.data.length; j++){
                var dat = ser.data.get(j);
                var dim = this.dimensions.getDimensions(dat);
                var shape = ser.renderedShapes[j];
                var pos = this.calculateLabelPosition(shape, dim, cx, cy);
                var rect = {
                    x: pos.x,
                    y: pos.y,
                    width: dim.width,
                    height: dim.height
                }
                if (overlap || layoutOverlapping(rtree, rect)){
                    var lab = this.labelGroup.addLabel(dat, ser);
                    lab.x = pos.x;
                    lab.y = pos.y;
                }
            }
        }
        this.labelGroup.finish();
    }

}

export interface IPieDataLabelRenderer{
    (data: IValuePoint, series: IPieSeries): html.IHtmlConfig | "string";
}

/**
 * Settings on how to render data labels for a series.
 * @settings
 */
export interface IPieLabelSettings{
    
        /**
         * Defines how to render the data.
         * 
         * 
         * |value|description|
         * |--|--|
         * |"value"|Will render the value of the data, e.g. if data is a point {x: 1, y:2}, will render label "2"|
         * |"auto"|Will render the the label if it is defined in the data, otherwise will render the value of the data
         * |"label"|Will render the label that is defined in the data, e.g. for point data {x:1, y:2, l: "label"} will render "label".
         * |@api{IPieDataLabelRenderer}|Will use this given function to render the label
         */
        render?: "value" | "label" | "auto" | IPieDataLabelRenderer;
        /**
         * If true, labels are allowed to overlap. If false, labels that would overlap will not be rendered.
         */
        overlap?: boolean;
        /**
         * Style of the labels.
         */
        style?: ILabelStyle;

        show?: boolean;
        
    }