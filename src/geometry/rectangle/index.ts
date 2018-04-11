import {IInterval} from "../interval";
import {extend} from "@reactivelib/core";
import {IPoint} from "../point/index";

export class WidthInterval implements IInterval{
    constructor(public rect: IRectangle){

    }

    get start(){
        return this.rect.x;
    }

    set start(v){
        this.rect.x = v;
    }

    get size(){
        return this.rect.width;
    }

    set size(v: number){
        this.rect.width = v;
    }
};

export class HeightInterval implements IInterval{
    constructor(public rect: IRectangle){

    }

    get start(){
        return this.rect.y;
    }

    set start(v){
        this.rect.y = v;
    }

    get size(){
        return this.rect.height;
    }

    set size(v: number){
        this.rect.height = v;
    }
}

export class RectangleWrapper{
    constructor(public rectangle: IRectangle){

    }

    public isOverlappingWith(rectangle: IRectangle){
        var xs1 = this.rectangle.x;
        var xe1 = xs1 + this.rectangle.width;
        var xs2 = rectangle.x;
        var xe2 = rectangle.x + rectangle.width

        var ys1 = this.rectangle.y;
        var ye1 = ys1 + this.rectangle.height;
        var ys2 = rectangle.y;
        var ye2 = rectangle.y + rectangle.height;
        return (xs1 <= xe2 && xe1 >= xs2) && (ys1 <= ye2 && ye1 >= ys2);
    }

    public containsPoint(pt: IPoint){
        return (pt.x >= this.rectangle.x && pt.x <= this.rectangle.x + this.rectangle.width &&
            pt.y >= this.rectangle.y && pt.y <= this.rectangle.y + this.rectangle.height);
    }

    public containsRectangle(r: IRectangle){
        return (r.x + r.width) <= (this.rectangle.x + this.rectangle.width) &&
                r.x >= this.rectangle.x &&
                r.y >= this.rectangle.y &&
                (r.y + r.height) <= (this.rectangle.y + this.rectangle.height);

    }

    public copyTo(rectangle: IRectangle){
        var r = this.rectangle;
        rectangle.x = r.x;
        rectangle.y = r.y;
        rectangle.width = r.width;
        rectangle.height = r.height;
    }

    public mergeInto(rect: IRectangle){
        var r = this.rectangle;
        Object.defineProperty(rect, "x", {
            enumerable: true,
            configurable: true,
            get: function(){
                return r.x;
            },
            set: function(v){
                r.x = v;
            }
        });
        Object.defineProperty(rect, "y", {
            enumerable: true,
            configurable: true,
            get: function(){
                return r.y;
            },
            set: function(v){
                r.y = v;
            }
        });
        Object.defineProperty(rect, "width", {
            enumerable: true,
            configurable: true,
            get: function(){
                return r.width;
            },
            set: function(v){
                r.width = v;
            }
        });
        Object.defineProperty(rect, "height", {
            enumerable: true,
            configurable: true,
            get: function(){
                return r.height;
            },
            set: function(v){
                r.height = v;
            }
        });
    }

    public normalize(){
        if (this.rectangle.width < 0){
            this.rectangle.x += this.rectangle.width;
            this.rectangle.width = -this.rectangle.width;
        }
        if (this.rectangle.height < 0){
            this.rectangle.y += this.rectangle.height;
            this.rectangle.height = -this.rectangle.height;
        }
    }

    public xDistance(rect: IRectangle){
        if (this.rectangle.x < rect.x){
            return Math.max(0, rect.x - (this.rectangle.x + this.rectangle.width));
        }
        else
        {
            return Math.max(0, this.rectangle.x - (rect.x + rect.width));
        }
    }

    public yDistance(rect: IRectangle){
        if (this.rectangle.y < rect.y){
            return Math.max(0, rect.y - (this.rectangle.y + this.rectangle.height));
        }
        else
        {
            return Math.max(0, this.rectangle.y - (rect.y + rect.height));
        }
    }

    public diffFrom(rectangle: IRectangle){
        var r = this.rectangle;
        var bx = r.x;
        var by = r.y;
        var bxe = r.width + bx;
        var bye = r.height + by;
        var dx = rectangle.x;
        var dy = rectangle.y;
        var dxe = rectangle.width + dx;
        var dye = rectangle.height + dy;
        return {
            left: dx - bx,
            top: dy - by,
            right: bxe - dxe,
            bottom: bye - dye
        };
    }

    public centeredSquare(){
        var rectangle = this.rectangle;
        var h = rectangle.height;
        var w = rectangle.width;
        if (h > w) {
            var diff = h - w;
            return {
                x: rectangle.x,
                y: rectangle.y + diff / 2,
                height: w,
                width: w
            };
        }
        else if (w > h) {
            var diff = w - h;
            return {
                y: rectangle.y,
                x: rectangle.x + diff / 2,
                height: h,
                width: h
            };
        }
        else {
            return rectangle;
        }
    }

    get interval(){
        var self = this;
        return {
            vertical: function(){
                return new HeightInterval(self.rectangle);
            },

            horizontal: function(){
                return new WidthInterval(self.rectangle);
            }
        }
    }
}

export function rectangleXDistance(rect: IRectangle, rectangle: IRectangle){
    if (rectangle.x < rect.x){
        return Math.round(Math.max(0, rect.x - (rectangle.x + rectangle.width)));
    }
    else
    {
        return Math.round(Math.max(0, rectangle.x - (rect.x + rect.width)));
    }
}

export function rectangleYDistance(rect: IRectangle, rectangle: IRectangle){
    if (rectangle.y < rect.y){
        return Math.round(Math.max(0, rect.y - (rectangle.y + rectangle.height)));
    }
    else
    {
        return Math.round(Math.max(0, rectangle.y - (rect.y + rect.height)));
    }
}

export function rectangleDistance(rect: IRectangle, rectangle: IRectangle){
    return Math.round(rectangleXDistance(rect, rectangle) + rectangleYDistance(rect, rectangle));
}

export function normalizeRectangle(rect: IRectangle): IRectangle{
    var r: IRectangle = <any>{};
    if (rect.width < 0){
        r.x = rect.x + rect.width;
        r.width = -rect.width;
    }
    else
    {
        r.x = rect.x;
        r.width = rect.width;
    }
    if (rect.height < 0){
        r.y = rect.y + rect.height;
        r.height = -rect.height;
    }
    else {
        r.y = rect.y;
        r.height = rect.height;
    }
    return r;
}

export const dummyPadding = {
    left:0, right: 0, top: 0, bottom: 0
}

export class PaddedRectange implements IRectangle{

    public bleft: number = 0;
    public bright = 0;
    public bbottom = 0;
    public btop = 0;

    constructor(public rect: IRectangle, public padding: IPadding){
        
    }

    get x(){
        return this.rect.x - this.padding.left + this.bleft;
    }

    set x(x: number){
        this.rect.x = x + this.padding.left - this.bleft;
    }

    get y(){
        return this.rect.y - this.padding.top + this.btop;
    }

    set y(y: number){
        this.rect.y = y + this.padding.top - this.btop;
    }

    get width(){
        return this.rect.width + this.padding.left + this.padding.right - this.bright - this.bleft;
    }
    
    set width(w: number){
        this.rect.width =  w - this.padding.left - this.padding.right + this.bright + this.bleft;
    }

    get height(){
        return this.rect.height + this.padding.top + this.padding.bottom - this.bbottom - this.btop;
    }
    
    set height(h: number){
        this.rect.height = h - this.padding.top - this.padding.bottom + this.bbottom + this.btop;
    }
    
}

export function getOverlapArea(r1: IRectangle, r2: IRectangle){
    var x11 = r1.x;
    var y11 = r1.y;
    var x12 = r1.x  + r1.width;
    var y12 = r1.y + r1.height;
    var x21 = r2.x;
    var y21 = r2.y;
    var x22 = r2.x + r2.width;
    var y22 = r2.y + r2.height;
    var x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21));
    var y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21));
    return x_overlap * y_overlap;
}

export default function rectangle(rect: IRectangle){
    return new RectangleWrapper(rect);
}

export interface IDimension{
    width: number;
    height: number;
}

export interface IRectangle extends IDimension{
    x: number;
    y: number;
}

/**
 * A rectangle determined by a start and end point
 */
export interface IPointRectangle{
    /**
     * The x-coordinate of the start point
     */
    xs: number;
    /**
     * The y-coordinate of the start point
     */
    ys: number;
    /**
     * The x-coordinate of the end point
     */
    xe: number;
    /**
     * The y-coordinate of the end point
     */
    ye: number;
}

export interface IPadding{
    left: number;
    top: number;
    bottom: number;
    right: number;
}

/**
 * Settings for a padding
 * @editor
 */
export interface IPaddingSettings{
    /**
     * Adds padding at the top
     */
    top?: number;
    /**
     * Adds padding at the left
     */
    left?: number;
    /**
     * Adds padding at the right
     */
    right?: number;
    /**
     * Adds padding at the bottom
     */
    bottom?: number;
}

export function normalizePaddingSettings(padding: IPaddingSettings | number): IPadding{
    if (typeof padding === "number"){
        var p = <number> padding;
        return {
            left: p, right: p, bottom: p, top: p
        }
    }
    return extend({
        left: 0, right: 0, bottom: 0, top: 0
    }, padding);
}

export function pointRectangleDistance(pt: IPoint, r: IRectangle){
    var dy: number;
    var dx: number;
    if (pt.y < r.y){
        dy = Math.max(0, r.y - pt.y);
    }
    else
    {
        dy = Math.max(0, pt.y - (r.y + r.height));
    }
    if (pt.x < r.x){
        dx = Math.max(0, r.x - pt.x);
    }
    else {
        dx = Math.max(0, pt.x - (r.x + r.width));
    }
    return dx + dy;
}