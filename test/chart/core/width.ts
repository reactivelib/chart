/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {stub} from '@reactivelib/test';
import chart = require('../../../index');
import {variable} from '@reactivelib/reactive';
import {attach, detach, html} from "@reactivelib/html";
import {expect} from 'chai';

describe("width", () => {
    var time = stub.time();

    it("width of chart should equal set width", () => {
        var config = variable.transformProperties({
            type: "x",
            width: 200,
            height: 300
        });
        var ch = chart(config);
        var node = attach(document.body, ch);
        time.runAll();
        var cr = (<HTMLElement>ch.node.element).getBoundingClientRect();
        expect(cr.width).to.equal(200);
        config.width = 500;
        time.runAll();
        cr = (<HTMLElement>ch.node.element).getBoundingClientRect();
        expect(cr.width).to.equal(500);
        detach(node);
    });

    it("should equal to parent element width when auto", () => {
        var config = variable.transformProperties({
            type: "x",
            width: "auto",
            height: 300
        });
        var ch = {
            tag: "div",
            style: {
                width: "300px",
                padding: "0",
                border: "none",
                margin: "0"
            },
            child: chart(config)
        }
        var node = attach(document.body, ch);
        time.runAll();
        var cr = (<HTMLElement>ch.child.node.element).getBoundingClientRect();
        expect(cr.width).to.equal(300);
        config.width = 100;
        time.runAll();
        cr = (<HTMLElement>ch.child.node.element).getBoundingClientRect();
        expect(cr.width).to.equal(100);
        config.width = "auto";
        time.runAll();
        cr = (<HTMLElement>ch.child.node.element).getBoundingClientRect();
        expect(cr.width).to.equal(300);
        detach(node);
    });

    it("should occupy content", () => {
        var ch = {
            tag: "div",
            style: {
                height: "200px",
                boxSizing: "border-box",
                width: "200px",
                border: "10px solid black",
                padding: "10px"
            },
            child: chart({
                type: "x"
            })
        }
        attach(document.body, ch);
        time.runAll();
        var cr = (<HTMLElement>ch.child.node.element).getBoundingClientRect();
        expect(cr.width).to.equal(160);
        detach(ch);
    });

})