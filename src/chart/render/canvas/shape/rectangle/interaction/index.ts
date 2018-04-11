import {IPointConfig, IPointModificationSettings, SettingsPointRenderer} from "../../point/index";
import {IPoint} from "../../../../../../geometry/point/index";
import {
    PreviewRectangle,
    XEndPreviewRectangle,
    XStartPreviewRectangle,
    YEndPreviewRectangle,
    YStartPreviewRectangle
} from "./preview";
import {IRectangle} from "../../../../../../geometry/rectangle/index";
import {RectangleConstrainer} from "../../../../../../geometry/rectangle/constrain";
import {procedure} from "@reactivelib/reactive";
import {renderCanvas} from "../../create";
import {SettingsRectangleRenderer} from "../index";

interface IPointModificator{
    set(pt: IPoint): void;
    get(): IPoint;
}


interface IRectangleModificationConfig{

    onMove(mod: IRectangle): void;
    onStart(mod: IRectangle): void;
    onEnd(mod: IRectangle): void;
    applyValues: "never" | "immediate" | "finish";
    constrainer: RectangleConstrainer;
    
}

function createPointResizer(res: SettingsRectangleRenderer, createPreviewRect: (res: SettingsRectangleRenderer, mod: IPoint) => PreviewRectangle,
                            pointConstainer: (p: IPoint) => IPoint, modificator: IPointModificator, modConfig: IRectangleModificationConfig){
    return () => {
        var prev: PreviewRectangle;
        var prc: procedure.IProcedure;
        var pt = <SettingsPointRenderer>renderCanvas(<IPointConfig>{
            tag: "point",
            style: {
                fillStyle: "rgb(243, 243, 243)",
                strokeStyle: "rgb(120,120, 120)",
                lineWidth: 1
            },
            radius: 8,
            x: 0,
            y: 0,
            interaction: {
                modify: <IPointModificationSettings>{
                    constraints: pointConstainer,
                    onStart: (shape, mod) => {
                        if (prc){
                            prc.cancel();
                        }
                        var mp = modificator.get();
                        pt.settings.x = mp.x;
                        pt.settings.y = mp.y;
                        prev = createPreviewRect(res, mod);
                        if (modConfig.applyValues !== "immediate"){
                            res.addChild(prev);
                        }
                        modConfig.onStart(prev);
                        if (modConfig.applyValues === "immediate"){
                            modificator.set(pt.settings);
                        }
                    },
                    onEnd: shape => {
                        res.removeChild(prev);
                        if (modConfig.applyValues !== "never"){
                            modificator.set(pt.settings);
                        }
                        modConfig.onEnd(prev);
                        start();
                    },

                    onMove: (shape, mod) => {
                        if (modConfig.applyValues === "immediate"){
                            modificator.set(pt.settings);
                        }
                        modConfig.onMove(prev);
                    },
                    applyValue: "immediate"
                },
                screenPadding: {top: 4, left: 4, right: 4, bottom: 4}
            },
            onAttached: () => {
                start();
            },
            onDetached: function(){
                if (prc){
                    prc.cancel();
                }
            }
        });
        function start(){
            prc = procedure(() => {
                var p = modificator.get();
                pt.settings.x = p.x;
                pt.settings.y = p.y;
            });
        }
        pt.parent = res;
        return pt;
    }
}

function createYEndSide(res: SettingsRectangleRenderer, constr: IRectangleModificationConfig){
    return createPointResizer(res, (res, point) => new YEndPreviewRectangle(res, point), point => {
        var nr = constr.constrainer.constrainEnd({x: res.x, y: res.y, width: res.width, height: point.y - res.y});
        return {
            x: res.x + res.width / 2,
            y: nr.y + nr.height
        }
    }, {
        get: function(){
            return {
                x: res.x+res.width/2,
                y: res.y + res.height
            }
        },
        set: function(pt){
            res.height = pt.y - res.y;
        }
    }, constr);
}

function createYStartSide(res: SettingsRectangleRenderer, constr: IRectangleModificationConfig){
    return createPointResizer(res, (res, point) => new YStartPreviewRectangle(res, point), point => {
        var nr = constr.constrainer.constrain({x: res.x, y: point.y, width: res.width, height: (res.y + res.height) - point.y});
        return {
            x: res.x + res.width / 2,
            y: nr.y
        }
    }, {
        get: function(){
            return {
                x: res.x+res.width/2,
                y: res.y
            }
        },
        set: function(pt){
            res.height = (res.y + res.height) - pt.y;
            res.y = pt.y;
        }
    }, constr);
}

function createXStartSide(res: SettingsRectangleRenderer, constr: IRectangleModificationConfig){
    return createPointResizer(res, (res, point) => new XStartPreviewRectangle(res, point), point => {
            var nr = constr.constrainer.constrain({x: point.x, y: res.y, height: res.height, width: (res.x + res.width) - point.x});
            return {
                y: res.y + res.height / 2,
                x: nr.x
            }
        },
        {
            get: function(){
                return {
                    x: res.x,
                    y: res.y+res.height/2
                }
            },
            set: function(pt){
                var v = pt.x;
                res.width = (res.x + res.width) - v;
                res.x = v;
            }
        }, constr);
}

function createXEndSide(res: SettingsRectangleRenderer, constr: IRectangleModificationConfig){
    return createPointResizer(res, (res, point) => new XEndPreviewRectangle(res, point), point => {
        var nr = constr.constrainer.constrainEnd({x: res.x, y: res.y, height: res.height, width: point.x - res.x});
        return {
            y: res.y + res.height / 2,
            x: nr.x + nr.width
        }
    }, {
        get: function(){
            return {
                x: res.x + res.width,
                y: res.y+res.height/2
            }
        },
        set: function(pt){
            res.width = pt.x - res.x;
        }
    }, constr);
}

export var sideToRectangleMod = {
    yEnd: createYEndSide,
    yStart: createYStartSide,
    xStart: createXStartSide,
    xEnd: createXEndSide
}