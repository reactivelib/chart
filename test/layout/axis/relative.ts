/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import transform from '../../../src/component/layout/axis/positioning/relative/transform';
import {arrayIterator} from "../../../src/collection/iterator/array";
import * as chai from 'chai';
var expect = chai.expect;

describe("relative", () => {
    it("transform elements", () => {
        var c1 = {
            x: 0, y: 0, width: 10, height: 10
        };
        var c2 = {
            x: 0, y: 0, width: 10, height: 10
        }
        var tr = transform({
            x: 0, y: 0, width: 500, height: 500
        },arrayIterator([{
            position: <any>"left",
            component: c1
        },{
            position: <any> "left",
            component: c2
        }]));
        expect(tr.elements[0]).to.contain({
            x: -1, y: 0, component: c1
        });
        expect(tr.elements[1]).to.contain({
            x: -2, y: 0, component: c2
        });
    });
});