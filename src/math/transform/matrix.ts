/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPoint} from "../../geometry/point";
import {IOptional, optional} from "@reactivelib/core";
import {node} from "@reactivelib/reactive";

export interface ITransformer{
    /**
     * maps the given point to a new point
     * @param x x-position of the point
     * @param y y-position of the point
     */
    (x: number, y: number): IPoint;
}

export interface IReverseTransformer extends ITransformer{
    inverse(): IReverseTransformer;
}

export interface IMatrixTransformer extends IReverseTransformer{
    matrix: AffineMatrix;
}

export interface ITransformation{

    transformRef(x: number, y: number, ref: IPoint);
    transform(x: number, y: number): IPoint;
    inverse(): IOptional<ITransformation>;
    copy(): ITransformation;
    isEqual(tr: ITransformation): boolean;
    
}

export class AffineMatrix implements ITransformation{

    public m00: number;
    constructor(m00: number, public m01: number, public m02: number, public m10: number, public m11: number, public m12: number){
        this.m00 = m00;
    }
    public copy() {
        return new AffineMatrix(this.m00, this.m01, this.m02, this.m10, this.m11, this.m12);
    }
    public translate(x: number, y: number) {
        this.compose(new AffineMatrix(1, 0, x, 0, 1, y));
        return this;
    }
    public rotate(angle: number) {
        return this.compose(new AffineMatrix(Math.cos(angle), -Math.sin(angle), 0, Math.sin(angle), Math.cos(angle), 0));
    }
    public scale(x: number, y: number) {
        this.compose(new AffineMatrix(x, 0, 0, 0, y, 0));
        return this;
    }
    public compose(matrix: AffineMatrix) {
        var m00 = this.m00;
        var m01 = this.m01;
        var m10 = this.m10;
        var m11 = this.m11;
        var m02 = this.m02;
        var m12 = this.m12;
        var n00 = matrix.m00;
        var n01 = matrix.m01;
        var n02 = matrix.m02;
        var n10 = matrix.m10;
        var n11 = matrix.m11;
        var n12 = matrix.m12;
        this.m00 = m00 * n00 + m01 * n10;
        this.m01 = m00 * n01 + m01 * n11;
        this.m02 = m00 * n02 + m01 * n12 + m02;
        this.m10 = m10 * n00 + m11 * n10;
        this.m11 = m10 * n01 + m11 * n11;
        this.m12 = m10 * n02 + m11 * n12 + m12;
        return this;
    }
    public transformX(x: number, y: number) {
        return this.m00 * x + this.m01 * y + this.m02;
    }
    public transformY(x: number, y: number) {
        return this.m10 * x + this.m11 * y + this.m12;
    }
    public transform(x: number, y: number): IPoint{
        var res: any = {};
        this.transformRef(x, y, res);
        return res;
    }

    public transformRef(x: number, y: number, pt: IPoint) {
        pt.x = this.transformX(x, y);
        pt.y = this.transformY(x, y);
    }

    public inverse() {
        var det = ((this.m00 * this.m11) - (this.m01 * this.m10));
        if (det == 0){
            return optional<AffineMatrix>();
        }
        var x1 = this.m00;
        var x2 = this.m01;
        var y1 = this.m10;
        var y2 = this.m11;
        var tx = this.m02;
        var ty = this.m12;
        this.m00 = y2 / det;
        this.m01 = -x2 / det;
        this.m10 = -y1 / det;
        this.m11 = x1 / det;
        this.m02 = (x2 * ty - tx * y2) / det;
        this.m12 = (-x1 * ty + y1 * tx) / det;
        return optional(this);
    }
    public setMatrixValues(m: AffineMatrix) {
        this.m00 = m.m00;
        this.m01 = m.m01;
        this.m02 = m.m02;
        this.m10 = m.m10;
        this.m11 = m.m11;
        this.m12 = m.m12;
    }
    
    public isEqual(m: AffineMatrix){
        return this.m00 === m.m00 && this.m01 === m.m01 && this.m02 === m.m02 && this.m10 === m.m10 &&
                this.m11 === m.m11 && this.m12 === m.m12;
    }

}

export function createMatrix(m00 = 1, m01 = 0, m02 = 0, m10 = 0, m11 = 1, m12 = 0){
	return new AffineMatrix(m00, m01, m02, m10, m11, m12);
}

export default createMatrix;

export class ReactiveAffineMatrix extends AffineMatrix{

    public $r = node();

    public copy() {
        this.$r.observed();
        return super.copy();
    }
    public translate(x: number, y: number) {
        super.translate(x, y);
        this.$r.changedDirty();
        return this;
    }
    public rotate(angle: number) {
        super.rotate(angle);
        this.$r.changedDirty();
        return this;
    }
    public scale(x: number, y: number) {
        super.scale(x, y);
        this.$r.changedDirty();
        return this;
    }
    public compose(matrix: AffineMatrix) {
        super.compose(matrix);
        this.$r.changedDirty();
        return this;
    }
    public transformX(x: number, y: number) {
        this.$r.observed();
        return this.m00 * x + this.m01 * y + this.m02;
    }
    public transformY(x: number, y: number) {
        this.$r.observed();
        return this.m10 * x + this.m11 * y + this.m12;
    }
    public transform(x: number, y: number) {
        return {
            x: this.transformX(x, y),
            y: this.transformY(x, y)
        };
    }
    public inverse(): IOptional<AffineMatrix> {
        var opt = super.inverse();
        this.$r.changedDirty();
        if (!opt.present){
            return opt;
        }
        return optional<AffineMatrix>(this);
    }
    public setMatrixValues(m: AffineMatrix) {
        super.setMatrixValues(m);
        this.$r.changedDirty();
    }

}

export function reactiveMapper(){
    return new ReactiveAffineMatrix(1, 0, 0, 0, 1, 0);
}

export class TransformationWithMatrix implements ITransformation{
    
    constructor(public matrix: AffineMatrix, public transformation: ITransformation){
        
    }

    public translate(x: number, y: number) {
        this.matrix.translate(x, y);
        return this;
    }

    transform(x: number, y: number): IPoint{
        var p = this.transformation.transform(x, y);
        var pt = this.matrix.transform(p.x, p.y);
        return pt;
    }

    transformRef(x: number, y: number, ref: IPoint){
        this.transformation.transformRef(x, y, ref);
        this.matrix.transformRef(ref.x, ref.y, ref);
    }
    
    inverse(): IOptional<ITransformation>{
        var minv = this.matrix.inverse();
        if (!minv.present)
        {
            return optional();
        }
        var trinv = this.transformation.inverse();
        if (!trinv.present){
            return optional();
        }
        return optional(new InverseTransformationWithMatrix(minv.value, trinv.value));
    }
    
    copy(): ITransformation{
        return new TransformationWithMatrix(this.matrix.copy(), this.transformation.copy());
    }
    
    isEqual(v: TransformationWithMatrix){
        return v.matrix && v.matrix.isEqual(this.matrix) && v.transformation && v.transformation.isEqual(this.transformation);
    }
    
}


export class InverseTransformationWithMatrix implements ITransformation{

    constructor(public matrix: AffineMatrix, public transformation: ITransformation){

    }

    public translate(x: number, y: number) {
        this.matrix.translate(x, y);
        return this;
    }

    transformRef(x: number, y: number, ref: IPoint){
        this.matrix.transformRef(x ,y, ref);
        this.transformation.transformRef(ref.x, ref.y, ref);
    }

    transform(x: number, y: number): IPoint{
        var p = this.matrix.transform(x, y);
        var pt = this.transformation.transform(p.x, p.y);
        return pt;
    }

    inverse(): IOptional<ITransformation>{
        var minv = this.matrix.inverse();
        if (!minv.present)
        {
            return optional();
        }
        var trinv = this.transformation.inverse();
        if (!trinv.present){
            return optional();
        }
        return optional(new TransformationWithMatrix(minv.value, trinv.value));
    }

    copy(): ITransformation{
        return new InverseTransformationWithMatrix(this.matrix.copy(), this.transformation.copy());
    }

    isEqual(v: TransformationWithMatrix){
        return v.matrix && v.matrix.isEqual(this.matrix) && v.transformation && v.transformation.isEqual(this.transformation);
    }

}