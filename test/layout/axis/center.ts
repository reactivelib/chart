/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import * as chai from 'chai';
import {HTMLAxisCenter} from "../../../src/component/layout/axis/center";
import {attach, detach} from "@reactivelib/html";
var expect = chai.expect;
import {stub} from '@reactivelib/test';


describe("axis-center", () => {
    var time = stub.time();
    it("should calculate border correctly", () => {
        var ac = new HTMLAxisCenter();
        ac.style.border = "5px solid black";
        attach(document.body, ac);
        time.runAll();
        expect(ac.border.right).to.equal(5);
        expect(ac.border.left).to.equal(5);
        expect(ac.style.left).to.equal("-5px");
        expect(ac.style.top).to.equal("-5px");
        expect(ac.style.width).to.equal("10px");
        expect(ac.style.height).to.equal("10px");
        detach(ac);
    });
});
