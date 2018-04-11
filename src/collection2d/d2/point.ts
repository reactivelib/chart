/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPoint} from "../../geometry/point/index";
import {IPointRectangle} from "../../geometry/rectangle/index";
import {IIterator} from "../../collection/iterator/index";

export interface IPointNode extends IPoint, IPointRectangle{

    getChildren(): IIterator<IPoint>;
    isNode: boolean;

}

export interface IPointCollection {

    add(pt: IPoint): void;

    remove(pt: IPoint): IPoint;

    contains(pt: IPoint): boolean;

    find(rect: IPointRectangle): IIterator<IPoint>;

    findChild(p: IPoint): IPoint;

    iterator(): IIterator<IPoint>;

    length: number;
    root: IPointNode;

}