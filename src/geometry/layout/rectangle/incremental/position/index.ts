/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPositioned, IPositionedRectangle} from "../../position/index";
import {IRectangle} from "../../../../rectangle/index";
import {IIterator, mapIterator} from "../../../../../collection/iterator/index";
import {
    IFitnessAndRectangles, createFitnessAndRectanglesCalculator, TooFewFitnessMeasurer,
    TooManyFitnessMeasurer
} from "../fitness";
import {IInterval} from "../../../../interval/index";
import {layoutBySide} from "../../position/side";
import {RectangleSide, getRectangleSideIntervalProvider} from "../side";

export interface I4SideLayouterSettings{
    side: RectangleSide;
}

export function createPositioned4SideRectangleLayouter(settings: I4SideLayouterSettings){
    var intervalProvider: (r: IRectangle) => IInterval = getRectangleSideIntervalProvider(settings.side);
    var fitness = createFitnessAndRectanglesCalculator({
        tooFew: () => new TooFewFitnessMeasurer(intervalProvider),
        tooMany: () => new TooManyFitnessMeasurer()
    });
    var layout = layoutBySide(settings.side);
    return function (it: IIterator<IPositionedRectangle>): IFitnessAndRectangles{
        return fitness(mapIterator(it, (p) => {
            layout(p);
            return p;
        }));
    }
}