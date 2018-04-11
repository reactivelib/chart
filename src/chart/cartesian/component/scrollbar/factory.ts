import {variable} from '@reactivelib/reactive';
import {IComponentConfig} from "../../../../component/layout/axis";

/**
 * @editor
 */
export interface IScrollbarComponentSettings extends IComponentConfig{
    
    type: "scrollbar";
    axis?: "x" | "y";
    direction?: "horizontal" | "vertical";
}
/*
export class ScrollbarComponentFactory implements IComponentFactory{

    constructor(public $container: IContainer){

    }

    create(config: IScrollbarComponentSettings | string){
        return <IRectangleCanvasShape>buildAndFetch(this.$container, $configuration({settings: config}, ScrollbarComponentFactoryFactories), "component");
    }

}
/*
var targ = {xs:0, ys:0, xe: this.target.width, ye: this.target.height};
this.xMapper = this.xMapperFactory.value(this.xAxis.window, targ);
this.yMapper = this.yMapperFactory.value(this.yAxis.window, targ);
if (this.yOrigin === "left" || this.yOrigin === "right"){
    this.mapper = new XYExchangedPointMapper(this.xMapper, this.yMapper);
}
else
{
    this.mapper = createPointRectangleMapper(this.xMapper, this.yMapper);
}
*/
/*

function createXScrollbar(chart: ICartesianChart, settings: IScrollbarComponentSettings){
    var dir = settings.direction || "horizontal";
    var w = chart.window;
    var mwx = chart.xAxes.maxWindow;
    var mwy = chart.yAxes.maxWindow;
    var xEnd = {};
    Object.defineProperty(xEnd, "max", {
        get: function(){
            return mwx.end;
        }
    });
    Object.defineProperty(xEnd, "min", {
        get: function(){
            return mwx.start;
        }
    });
    var xStart = {};
    Object.defineProperty(xStart, "min", {
        get: function(){
            return mwx.start;
        }
    });
    Object.defineProperty(xStart, "max", {
        get: function(){
            return mwx.end;
        }
    });
    var cb = <IRectangleConstraints>{
        width: {
            min: 0
        },
        height: {
            min: 0
        },
        xEnd: xEnd,
        xStart: xStart
    }
    var config = {
        tag: "rectangle",
        interaction:{
            modify: {
                movable: true,
                thumbs: {
                    sides: <string[]>[],
                    show: "always"
                },
                constraints: cb,
                applyValues: "immediate"
            },
            zIndex: 1
        },
        style: {
            fillStyle: "rgba(130, 130,130 , 0.5)",
            cursor: "grab"
        }
    };
    Object.defineProperties(config,{
        x: {
            get: function(){
                return w.xs;
            },
            set: function(x){
                var wi = this.width;
                w.xs = x;
                w.xe = x + wi;
            }
        },
        width: {
            get: function(){
                return w.xe - w.xs;
            },
            set: function(wi){
                w.xe = w.xs + wi;
            }
        },
        y: {
            get: function(){
                return 2;
            },

            set: function(y){

            }
        },
        height: {
            get: function(){
                return 14;
            },
            set: function(h){

            }
        }
    });
    if (dir === "horizontal") {
        config.interaction.modify.thumbs.sides = ["xStart", "xEnd"];
    }
    else {
        config.interaction.modify.thumbs.sides = ["yStart", "yEnd"];
    }
    var grp = new ReactiveGroupRenderer();
    grp.x = 0;
    grp.y = 0;
    grp.width = 14;
    grp.height = 17;
    var bar = renderCanvas(config);
    grp.addChild(bar);
    var mapper = variable<ITransformation>(null).listener(v => {
        var targ = grp;    
        var vp = <XYAreaSystem>chart.viewports.primary;
        var xMapper = vp.xMapperFactory.value(mwx, {xs:0, ys: 0, xe: grp.width, ye: grp.height});
        var yMapper = nullValueTransformer;
        if (vp.yOrigin === "left" || vp.yOrigin === "right"){
            var mapper: ITransformation = new XYExchangedPointMapper(xMapper, yMapper);
        }
        else
        {
            mapper = createPointRectangleMapper(xMapper, yMapper);
        }
        v.value = mapper;
    });
    Object.defineProperty(grp, "mapper", {
        configurable: true,
        enumerable: true,
        get: function(){
            return mapper.value;
        }
    });

    return grp;

}

function createYScrollbar(chart: ICartesianChart, settings: IScrollbarComponentSettings){

    var dir = settings.direction || "horizontal";
    var w = chart.window;
    var mwx = chart.xAxes.maxWindow;
    var mwy = chart.yAxes.maxWindow;
    var yEnd = {};
    Object.defineProperty(yEnd, "max", {
        get: function(){
            return mwy.end;
        }
    });
    Object.defineProperty(yEnd, "min", {
        get: function(){
            return mwy.start;
        }
    });
    var yStart = {};
    Object.defineProperty(yStart, "max", {
        get: function(){
            return mwy.end;
        }
    });
    Object.defineProperty(yStart, "min", {
        get: function(){
            return mwy.start;
        }
    });
    var cb = <IRectangleConstraints>{
        width: {
            min: 0
        },
        height: {
            min: 0
        },
        yEnd: yEnd,
        yStart: yStart
    }
    var config = {
        tag: "rectangle",
        interaction:{
            modify: {
                movable: true,
                thumbs: {
                    sides: <string[]>[],
                    show: "always"
                },
                constraints: cb,
                applyValues: "immediate"
            },
            zIndex: 1
        },
        style: {
            fillStyle: "rgba(130, 130,130 , 0.5)",
            cursor: "grab"
        }
    };
    Object.defineProperties(config,{
        y: {
            get: function(){
                return w.ys;
            },
            set: function(x){
                var wi = this.height;
                w.ys = x;
                w.ye = x + wi;
            }
        },
        height: {
            get: function(){
                return w.ye - w.ys;
            },
            set: function(wi){
                w.ye = w.ys + wi;
            }
        },
        x: {
            get: function(){
                return 1;
            },

            set: function(y){

            }
        },
        width: {
            get: function(){
                return 14;
            },
            set: function(h){

            }
        }
    });
    if (dir === "horizontal") {
        config.interaction.modify.thumbs.sides = ["xStart", "xEnd"];
    }
    else {
        config.interaction.modify.thumbs.sides = ["yStart", "yEnd"];
    }
    var grp = new ReactiveGroupRenderer();
    grp.x = 0;
    grp.y = 0;
    grp.width = 17;
    grp.height = 14;
    var bar = renderCanvas(config);
    grp.addChild(bar);
    var mapper = variable<ITransformation>(null).listener(v => {
        var targ = grp;    
        var vp = <XYAreaSystem>chart.viewports.primary;
        var yMapper = vp.yMapperFactory.value(mwy, {xs:0, ys: 0, xe: grp.width, ye: grp.height});
        var xMapper = nullValueTransformer;
        if (vp.yOrigin === "left" || vp.yOrigin === "right"){
            var mapper: ITransformation = new XYExchangedPointMapper(xMapper, yMapper);
        }
        else
        {
            mapper = createPointRectangleMapper(xMapper, yMapper);
        }
        v.value = mapper;
    });
    Object.defineProperty(grp, "mapper", {
        configurable: true,
        enumerable: true,
        get: function(){
            return mapper.value;
        }
    });
    return grp;
}

export var ScrollbarComponentFactoryFactories = $configuration({
    
    component: (chart: ICartesianChart, settings: IScrollbarComponentSettings) => {
        var dir = settings.direction || "horizontal";
        var axis = settings.axis || "x";
        if (axis === "x"){
            return createXScrollbar(chart, settings);
        }
        return createYScrollbar(chart, settings);
    }
})

export function addResizeBySide(side: ComponentPosition, toAdd: any){
    switch(side){
        case "left":
        case "right":
        case "inner-left":
        case "inner-right":
            toAdd.resizeHeight = true;
            break;
        case "bottom":
        case "top":
        case "inner-bottom":
        case "inner-top":
            toAdd.resizeWidth = true;
            break;
    }
}

export class ScrollbarGridComponentFactory implements IRelativePosComponentFactory{

    constructor(public factory: IComponentFactory, public yAxes: IVariable<IAxisCollection>){
    }

    public create(comp: IRelativePositionedGridElement, component: IScrollbarComponentSettings): IRelativePositionedGridElement{
        var side = comp.position;
        var yAxes = this.yAxes;
        var axis;
        var direction;
        switch(side){
            case "inner-top":
            case "inner-bottom":
            case "top":
            case "bottom":
                direction = "horizontal";
                if (yAxes.value.origin === "bottom" || yAxes.value.origin === "top"){
                    axis = "x";
                }
                else {
                    axis = "y";
                }
                break;
            default:
                direction = "vertical";
                if (yAxes.value.origin === "bottom" || yAxes.value.origin === "top"){
                    axis = "y";
                }
                else {
                    axis = "x";
                }
        }
        var c = {component: this.factory.create($configuration(<any>component, {axis: axis, direction: direction})), rawSettings: comp, position: side};
        addResizeBySide(side, c);
        return c;
    }
}

export var ScrollbarComponentFactories = $configuration({

    name: "scrollbar",

    componentFactory: ($container: IContainer) => {
        var c = new ScrollbarComponentFactory($container);
        return c;
    },

    gridComponentFactory: (componentFactory: ScrollbarComponentFactory, yAxes: IVariable<IAxisCollection>) => {
        return new ScrollbarGridComponentFactory(componentFactory, yAxes);
    }
})

*/