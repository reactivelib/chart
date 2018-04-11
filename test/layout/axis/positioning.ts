/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import * as chai from 'chai';
var expect = chai.expect;
import {layoutGridElementsRecursive}  from '../../../src/component/layout/axis/positioning/recursive';

function component(dim: number, height = dim){
    return {
        x:0, y:0, width: dim, height: height
    }
}

describe("positioning", () => {
    it("should position correctly outer elements", () => {
        var c1 = {
            component: component(10),
            x: -1, y: 0,
            valign: <any>"top"
        }
        var c2 = {
            component: component(20),
            x: 0, y: -1,
            halign: <any>"left"
        }
        var config = {
            elements: [c1, c2],
            container: {
                x: 10, y: 20,
                width: 500,
                height: 500
            },
            border: {
                right: 10, left: 0, top: 0, bottom: 0
            },
            center: {
                x: 10, y: 20,
                width: 50,
                height: 50
            },
            centerElements: [],
            afterLayout: [],
            afterResize: []
        };

        layoutGridElementsRecursive(config);
        expect(c1.component).to.deep.equal({
            x: 10, y: 40, width: 10, height: 10
        });
        expect(c2.component).to.deep.equal({
            x: 20, y: 20, width: 20, height: 20
        });
        expect(config.center).to.deep.equal({
            x: 20,
            y: 40,
            width: 480,
            height: 480
        });
    });
});
