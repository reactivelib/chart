/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import renderChart = require('./src/chart/index');
import * as coreChart from "./src/chart/core/basic";
import * as diMod from './src/config/di/index';
import * as cartMod from './src/chart/cartesian';
import * as cartData from './src/chart/cartesian/data/parse';
import * as cartSeries from "./src/chart/cartesian/series/series";
import rtreemod from './src/collection2d/rtree';
import html from '@reactivelib/html';
import {ICartesianChartSeriesConfig as EICartesianChartSeriesConfig} from "./src/chart/cartesian/series/collection";
import {ReactivePointRectangle as EReactivePointRectangle} from "./src/chart/reactive/geometry/rectangle";
import {IPointRectangle, pointRectangleDistance} from "./src/geometry/rectangle";
import {PointRectangleBackedRectangle} from "./src/geometry/rectangle/pointRect";
import * as colorMod from './src/color';
import {DocumentMovement, IDocumentMovementEvents} from "./src/chart/render/html/interaction/move/document";
import erounder from "./src/math/round";
import {map1d as emap1d} from "./src/math/transform";
import {ITextLabelSettings as e_ITextLabelSettings} from "./src/chart/component/text";
import {createNumberTextShape} from './src/chart/render/html/decimal';
import "./src/style/style.css";

function chart(config: coreChart.IChartSettings): coreChart.IChart{
    return renderChart(<any>config);
}

html.html.register("decimal", createNumberTextShape);

namespace chart{
    export type IChart = coreChart.IChart;
    export type IChartSettings = coreChart.IChartSettings;

    export const create = chart;

    export namespace cartesian{
        export type ICartesianSeriesSettings = cartSeries.ICartesianSeriesSettings;
        export type ICartesianChartSeriesConfig = EICartesianChartSeriesConfig;
        export type ICartesianChartSettings = cartMod.ICartesianChartSettings;
        export type ICartesianChart = cartMod.ICartesianChart;
        export const parseData = cartData.readTable;
    }

    export namespace component{
        export type ITextLabelSettings = e_ITextLabelSettings;
    }

    /**
     * @beta
     */
    export namespace di{
        export const assemble = diMod.assemble;
        export type IContainer = diMod.IContainer;
        export const join = diMod.join;
        export const variable = diMod.variableFactory;
        export const autostart = diMod.autoStart;
        export const deps = diMod.deps;
        export const inject = diMod.inject;
        export const create = diMod.create;
        export const define = diMod.define;
        export const init = diMod.init;
        export const component = diMod.component;
    }

    export namespace collection{
        export const rtree = rtreemod;
    }

    export namespace geometry{
        export function reactivePointRectangle(): IPointRectangle{
            return new EReactivePointRectangle();
        }
        export namespace rectangle{
            export const pointRectangleDist = pointRectangleDistance;
            export function pointRectangleBasedRectangle(rect: IPointRectangle){
                return new PointRectangleBackedRectangle(rect);
            }

            export const ReactivePointRectangle = EReactivePointRectangle;
        }
    }

    export function color(s: string | colorMod.IColor){
        return colorMod.color(s);
    }

    export namespace color{
        export const Hsla = colorMod.Hsla;
        export const Rgba = colorMod.Rgba;
        export type IColor = colorMod.IColor;
        export const colorNameToHex = colorMod.colourNameToHex;
    }

    export namespace html{

        export function documentMovement(settings: IDocumentMovementEvents){
            new DocumentMovement(settings);
        }
    }

    export namespace math{
        export const rounder = erounder;
        export const map1d = emap1d;
    }


}


export = chart;