import {IViewportCollection} from './area/collection/index';
import { IXYChartSystem } from './index';
import { IPointRectangle } from '../../geometry/rectangle/index';
import {deps} from "../../config/di";

export class ReactiveWindow implements IPointRectangle{
    constructor(public viewports: IViewportCollection){

    }

    get xs(){
        return this.viewports.primary.window.xs;
    }

    set xs(v){
        this.viewports.primary.window.xs = v;
    }

    get ys(){
        return this.viewports.primary.window.ys;
    }

    set ys(v){
        this.viewports.primary.window.ys = v;
    }

    get xe(){
        return this.viewports.primary.window.xe;
    }

    set xe(v){
        this.viewports.primary.window.xe = v;
    }

    get ye(){
        return this.viewports.primary.window.ye;
    }

    set ye(v){
        this.viewports.primary.window.ye = v;
    }

    
}