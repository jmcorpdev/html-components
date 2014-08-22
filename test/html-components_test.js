/*global describe,it*/
'use strict';
var assert = require('assert'),
    cheerio = require('cheerio'),
    HTMLComponents = require('../lib/html-components.js');

describe('html-components node module.', function () {
    var htmlComponents = new HTMLComponents({
        componentsFolder: 'test/components-folder'
    });


    it('must get 2 tags from components folder', function () {
        assert(htmlComponents.getTags().length, 2);
    });

    it('getTags : must have tags `comp1,tag` in the result of getTags', function () {
        assert(htmlComponents.getTags().join(','), 'comp1,tag');
    });

    var testNodeAttr = '<node attr1="value1" attr2="value2"></node>';
    it('processAttributes : must return attributes for `' + testNodeAttr + '`', function() {
        var attrObj = htmlComponents.processAttributes(cheerio.load(testNodeAttr)('node').eq(0));
        assert(attrObj.attr1, 'value1');
        assert(attrObj.attr2, 'value2');
    });

//    var testNodeData = '<node attr1="value1" attr2="value2" data-custom1="datavalue1" data-custom2="datavalue2"></node>';
//    it('processAttributes : must return attributes attr1 and attr2 for `' + testNodeData + '', function() {
//        var attrObj = htmlComponents.processAttributes(cheerio.load(testNodeData)('node').eq(0));
//        assert(attrObj.custom1, 'datavalue1');
//        assert(attrObj.custom1, 'datavalue2');
//    });
});
