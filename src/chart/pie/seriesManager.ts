/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {array, procedure} from "@reactivelib/reactive";
import {PieSeries} from "./series";
import {PieChart} from "./index";
import {getAngleInRadian, IPieChartSettings} from "./factory";
import {normalizeRad, pi05, pi1, pi15, pi2} from "../../math/transform/polar";
import {BoundingBoxCalculator} from "../../geometry/point";
import {HTMLAxisCenter} from "../../component/layout/axis/center";
import {deps} from "../../config/di";

function getBoundingBox(cx: number, cy: number,  er: number, startAngle: number, endAngle: number){
    var fullCircle = false;
    if (startAngle === 0 && endAngle === 0){
        endAngle = pi2;
        fullCircle = true;
    }
    var eRadius = Math.max(0, er);

    var x2 = cx + eRadius*Math.cos(startAngle);
    var y2 = cy + eRadius*Math.sin(startAngle);
    var x3 = cx + eRadius*Math.cos(endAngle);
    var y3 = cy + eRadius*Math.sin(endAngle);

    var bb = new BoundingBoxCalculator();
    bb.addPoint(cx, cy);
    bb.addPoint(x2, y2);
    bb.addPoint(x3, y3);


    if (endAngle < startAngle){
        bb.addPoint(cx + eRadius, cy);
    }
    if (startAngle < pi05 && (endAngle > pi05 || endAngle < startAngle) ||
        startAngle > pi05 && (endAngle > pi05 && endAngle < startAngle)){
        bb.addPoint(cx, cy + eRadius);
    }
    if (startAngle < pi1 && (endAngle > pi1 || endAngle < startAngle) ||
        startAngle > pi1 && (endAngle > pi1 && endAngle < startAngle)){
        bb.addPoint(cx - eRadius, cy);
    }
    if (startAngle < pi15 && (endAngle > pi15 || endAngle < startAngle) ||
        startAngle > pi15 && (endAngle > pi15 && endAngle < startAngle)){
        bb.addPoint(cx, cy - eRadius);
    }
    var _bb = bb.getBoundingBox();
    return _bb;
}

function calculateSeriesShapes(series: PieSeries, chartSettings: IPieChartSettings, center: HTMLAxisCenter, chart: PieChart, colorProvider: () => () => string){
    series.renderedShapes = [];
    var sr = series.startRadius;
    var er = series.endRadius;
    var sangle = normalizeRad(getAngleInRadian(chartSettings.startAngle, chartSettings.angleUnit) || 0);
    var eangle = normalizeRad(getAngleInRadian(chartSettings.endAngle, chartSettings.angleUnit) || 2*Math.PI);
    if (sangle === eangle){
        eangle += 2*Math.PI;
    }
    if (sangle > eangle){
        eangle += 2*Math.PI;
    }    
    var w = center.width;
    var h = center.height;
    var cx = chart.centerX;
    var cy = chart.centerY;
    var colors = colorProvider();
    var data = series.data;
    var l = data.length;
    var valueSum = 0;
    for (var i=0; i < l; i++){
        var d = data.get(i);
        valueSum += d.y;
    }
    var angleDiff = eangle - sangle;        
    for (var i=0; i < l; i++){
        var d = data.get(i);
        var col = (<string>d.c) || colors();
        var ea = sangle + (d.y / valueSum) * angleDiff;
        var shape = {
            x: cx,
            y: cy,
            startRadius: sr,
            endRadius: er,
            startAngle: sangle,
            endAngle: ea,
            color: col,
            bb: <any>null
        };
        series.renderedShapes.push(shape); 
        sangle = ea;
    }
}

export default function(series: array.IReactiveArray<PieSeries>, center: HTMLAxisCenter, chart: PieChart,
     settings: IPieChartSettings, colorProvider: () => () => string){
    return () => {
        if ("seriesDistance" in settings){
            var innerDist = settings.seriesDistance;
        }
        else{
            innerDist = 2;
        }
        var sa = getAngleInRadian(settings.startAngle, settings.angleUnit) || 0;
        var ea = getAngleInRadian(settings.endAngle, settings.angleUnit) || 0;
        sa = normalizeRad(sa);
        ea = normalizeRad(ea);
        if (sa <= pi15 && ea >= pi15 || (sa >= ea && !(ea <= pi15 && sa >= pi15))){
            var angletop = pi05;
        }
        else{
            angletop = Math.max(0, pi05 - Math.abs((ea - pi15)), pi05 - Math.abs(sa - pi15));
        } 
        if (sa <= pi05 && ea >= pi05 || (sa >= ea && !(ea <= pi05 && sa >= pi05))){
            var anglebottom = pi05;
        }
        else{
            anglebottom = Math.max(0, pi05 - Math.abs((ea - pi05)), pi05 - Math.abs(sa - pi05));
        }
        var bottomMult = Math.cos(pi05 - anglebottom);
        var topMult = Math.cos(pi05 - angletop);        
        var ch2 = center.height / 2;
        var topAdd = topMult /(bottomMult + topMult) * (ch2);
        var bottomAdd = bottomMult /(bottomMult + topMult) * (ch2);
        var cy = (ch2) + topAdd - bottomAdd;
        if (angletop == pi05){
            var maxRadiusTop = cy;
        }
        else if (angletop == 0){
            maxRadiusTop = Number.MAX_VALUE;
        }
        else{
            var b = cy/Math.tan(angletop);
            maxRadiusTop = Math.sqrt(b*b + cy * cy);
        }
        if (anglebottom == pi05){
            var maxRadiusBottom = center.height - cy;
        }
        else if (anglebottom == 0){
            maxRadiusBottom = Number.MAX_VALUE;
        }
        else{
            var yb = center.height - cy;
            var b = yb / Math.tan(anglebottom);
            maxRadiusBottom = Math.sqrt(b*b + yb*yb);
        }
        var maxHRadius = Math.min(maxRadiusBottom, maxRadiusTop);

        if (sa <= 0 && ea >= 0 || (sa >= ea && !(ea <= 0 && sa >= 0))){
            var angleright = pi05;
        }
        else{
            angleright = Math.max(0, pi05 - Math.abs((ea)), pi05 - Math.abs(sa));
        } 
        if (sa <= pi1 && ea >= pi1 || (sa >= ea && !(ea <= pi1 && sa >= pi1))){
            var angleleft = pi05;
        }
        else{
            angleleft = Math.max(0, pi05 - Math.abs((ea - pi1)), pi05 - Math.abs(sa - pi1));
        }
        var rightMult = Math.cos(pi05 - angleright);
        var leftMult = Math.cos(pi05 - angleleft);
        var cw2 = center.width / 2;
        var leftAdd = leftMult / (leftMult + rightMult) * cw2;
        var rightAdd =  rightMult / (leftMult + rightMult) * cw2;
        var cx = cw2 + leftAdd - rightAdd;

        if (angleleft == pi05){
            var maxRadiusLeft = cx;
        }
        else if (angleleft == 0){
            maxRadiusLeft = Number.MAX_VALUE;
        }
        else{
            var b = cx/Math.tan(angleleft);
            maxRadiusLeft = Math.sqrt(b*b + cx * cx);
        }
        if (angleright == pi05){
            var maxRadiusRight = center.width - cx;
        }
        else if (angleright == 0){
            maxRadiusRight = Number.MAX_VALUE;
        }
        else{
            var yb = center.width - cx;
            var b = yb / Math.tan(angleright);
            maxRadiusRight = Math.sqrt(b*b + yb*yb);
        }

        var maxWRadius = Math.min(maxRadiusLeft, maxRadiusRight);                
        var maxRadius = Math.min(maxWRadius, maxHRadius) - innerDist * (series.length - 1);

        var bb = getBoundingBox(cx, cy, maxRadius, sa, ea);
        var wadd = ((center.width - (bb.x + bb.width)) - bb.x) / 2;
        var hadd = ((center.height - (bb.y + bb.height)) - bb.y) / 2;

        chart.centerX = cx + wadd;
        chart.centerY = cy + hadd;

        var sr = settings.startRadius || 0;
        if (sr < 1){
            sr = maxRadius * sr;
        }
        var sr = Math.min(maxRadius - 1, sr);
        var diff = maxRadius - sr;
        var add = diff / series.length;
        var sers = series.array;
        for (var i=0; i < sers.length; i++){
            sers[i].startRadius = sr;
            sr += add;
            sers[i].endRadius = sr;
            sr += innerDist;
            calculateSeriesShapes(sers[i], settings, center, chart, colorProvider);
        }
    };  
}