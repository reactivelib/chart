import {IPositionSettings} from "../index";
import {centerPositions, ComponentPosition, IGridPosition, IRelativePositionedGridElement} from "./index";
import {IIterator} from "../../../../../collection/iterator";
import {arrayIterator} from "../../../../../collection/iterator/array";
import {IPoint} from "../../../../../geometry/point";
import {IRectangle} from "../../../../../geometry/rectangle";

class RelativePositionSettings implements IPositionSettings{

    public x: number;
    public y: number;

    constructor(public settings: IRelativePositionedGridElement){

    }

    get component(){
        return <IRectangle>this.settings.component;
    }

    get isSvg(){
        return this.settings.isSvg;
    }

    get resizeWidth(){
        return this.settings.resizeWidth;
    }

    get resizeHeight(){
        return this.settings.resizeHeight;
    }

    get border(){
        return this.settings.border;
    }

    get width(){
        return this.settings.width;
    }

    get height(){
        return this.settings.height;
    }

    get halign(){
        return this.settings.halign;
    }

    get valign(){
        return this.settings.valign;
    }

    get overflow(){
        return this.settings.overflow;
    }

    get cell(){
        return this.settings.cell;
    }

    set cell(v){
        this.settings.cell = v;
    }

    get shape(){
        return this.settings.shape;
    }

    set shape(s){
        this.settings.shape = s;
    }

}

class RelativeCenterPositionedElement implements IRelativePositionedGridElement{

    constructor(public settings: IRelativePositionedGridElement, public position: IGridPosition){

    }

    get isSvg(){
        return this.settings.isSvg;
    }

    get component(){
        return <IRectangle>this.settings.component;
    }

    get resizeWidth(){
        return this.settings.resizeWidth;
    }

    get resizeHeight(){
        return this.settings.resizeHeight;
    }

    get border(){
        return this.settings.border;
    }

    get width(){
        return this.settings.width;
    }

    get height(){
        return this.settings.height;
    }

    get halign(){
        return this.settings.halign;
    }

    get valign(){
        return this.settings.valign;
    }

    get overflow(){
        return this.settings.overflow;
    }

    get cell(){
        return this.settings.cell;
    }

    set cell(v){
        this.settings.cell = v;
    }

    get shape(){
        return this.settings.shape;
    }

    set shape(s){
        this.settings.shape = s;
    }
}

export interface IPositionProvider{
    left: number;
    right: number;
    bottom: number;
    top: number;

    providePosition(direction: string): IPoint;
}

class RootPositionProvider implements IPositionProvider{

    public left = -1;
    public right = 1;
    public bottom = 1;
    public top = -1;

    public providePosition(direction: string){
        var pt: IPoint;
        switch(direction){
            case "left":
                pt = {
                    x: this.left,
                    y: 0
                }
                this.left--;
                break;
            case "right":
                pt = {
                    x: this.right,
                    y: 0
                }
                this.right++;
                break;
            case "bottom":
                pt = {
                    x: 0,
                    y: this.bottom
                }
                this.bottom++;
                break;
            default:
                pt = {
                    x: 0,
                    y: this.top
                }
                this.top--;
                break;
        }
        return pt;
    }

    public provideSharedPosition(direction: string){
        var pt: IPoint;
        switch(direction){
            case "left":
                pt = {
                    x: Math.min(-1, this.left + 1),
                    y: 0
                }
                break;
            case "right":
                pt = {
                    x: Math.max(1, this.right - 1),
                    y: 0
                }
                break;
            case "bottom":
                pt = {
                    x: 0,
                    y: Math.max(1, this.bottom - 1)
                }
                break;
            default:
                pt = {
                    x: 0,
                    y: Math.min(-1, this.top + 1)
                }
                break;
        }
        return pt;
    }

}

class PointBasedPositionProvider implements IPositionProvider{

    public left = -1;
    public right = 1;
    public bottom = 1;
    public top = -1;

    constructor(public point: IPoint){
        this.left = this.point.x - 1;
        this.right = this.point.x + 1;
        this.bottom = this.point.y + 1;
        this.top = this.point.y - 1;
    }

    public providePosition(direction: string){
        var pt: IPoint;
        switch(direction){
            case "left":
                pt = {
                    x: this.left,
                    y: this.point.y
                }
                this.left--;
                break;
            case "right":
                pt = {
                    x: this.right,
                    y: this.point.y
                }
                this.right++;
                break;
            case "bottom":
                pt = {
                    x: this.point.x,
                    y: this.bottom
                }
                this.bottom++;
                break;
            default:
                pt = {
                    x: this.point.x,
                    y: this.top
                }
                this.top--;
                break;
        }
        return pt;
    }

    public provideSharedPosition(direction: string){
        var pt: IPoint;
        switch(direction){
            case "left":
                pt = {
                    x: this.left + 1,
                    y: this.point.y
                }
                break;
            case "right":
                pt = {
                    x: this.right - 1,
                    y: this.point.y
                }
                break;
            case "bottom":
                pt = {
                    x: this.point.x,
                    y: this.bottom - 1
                }
                break;
            default:
                pt = {
                    x: this.point.x,
                    y: this.top + 1
                }
                break;
        }
        return pt;
    }
}

export interface IInnerAndOuterElements{
    elements: IPositionSettings[];
    center: IRelativePositionedGridElement[];
}

function componentToCenteredElement(comp: IRelativePositionedGridElement, pos: IGridPosition): RelativeCenterPositionedElement{
    return new RelativeCenterPositionedElement(comp, pos);
}

class CenterPositionElementAdder{

    public settings: IRelativePositionedGridElement[] = [];

    public lx = -1;
    public rx = 1;
    public by = 1;
    public ty = -1;

    private addComponent(comp: IRelativePositionedGridElement, x: number, y: number){
        var ces = componentToCenteredElement(comp, {
            x: x, y: y
        });
        this.settings.push(ces);
    }

    public add(comp: IRelativePositionedGridElement){
        if (typeof comp.position === "string"){
            switch (comp.position){
                case "inner-bottom":
                    this.addComponent(comp, 0, this.by);
                    this.by++;
                    break;
                case "inner-left":
                    this.addComponent(comp, this.lx, 0);
                    this.lx--;
                    break;
                case "inner-right":
                    this.addComponent(comp, this.rx, 0);
                    this.rx++;
                    break;
                case "inner-top":
                    this.addComponent(comp, 0, this.ty);
                    this.ty--;
                    break;
            }
        }
        else
        {
            this.settings.push(comp);
        }
    }

}

function addComponents(components: IIterator<IRelativePositionedGridElement>,
                       posProvider: IPositionProvider, grid: IInnerAndOuterElements, centerChildren: CenterPositionElementAdder){
    while (components.hasNext()){
        var comp = components.next();
        if (typeof comp.position === "string"){
            if (comp.position in centerPositions){
                centerChildren.add(comp);
            }
            else {
                insertComponent(comp, posProvider, grid, centerChildren);
            }
        }
        else{
            var surface = comp.position.surface || "outer";
            if (surface === "outer"){
                var element = new RelativePositionSettings(comp);
                element.x = comp.position.x;
                element.y = comp.position.y;
                grid.elements.push(element);
            }
            else
            {
                centerChildren.settings.push(comp);
            }
        }
    }
}

function insertComponent(component: IRelativePositionedGridElement, positionProvider: IPositionProvider, grid: IInnerAndOuterElements, centerChildren: CenterPositionElementAdder){
    var element = new RelativePositionSettings(component);
    var point = positionProvider.providePosition(<ComponentPosition>component.position);
    element.x = point.x;
    element.y = point.y;
    grid.elements.push(element);
    if (component.layout){
        var posProvider = new PointBasedPositionProvider({
            x: element.x, y: element.y
        });
        addComponents(arrayIterator(component.layout), posProvider, grid, centerChildren);
    }
}

export default function(center: IRectangle, components: IIterator<IRelativePositionedGridElement>){
    var grid: IInnerAndOuterElements = {
        elements: [],
        center: []
    }
    var posProvider = new RootPositionProvider();
    var centerAdder = new CenterPositionElementAdder();
    addComponents(components, posProvider, grid, centerAdder);
    grid.center = centerAdder.settings;
    return grid;
}
