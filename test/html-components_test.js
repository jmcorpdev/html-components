/*global describe,it*/
'use strict';
var assert = require('assert'),
    cheerio = require('cheerio'),
    HTMLComponents = require('../lib/html-components.js');

describe('html-components node module.', function () {
    var htmlComponents = new HTMLComponents({
        componentsFolder: 'test/resources/components-folder'
    });

    it('must get 2 tags from components folder', function () {
        assert(htmlComponents.getTags().length, 2);
    });

    it('getTags : must have tags `comp1,tag` in the result of getTags', function () {
        assert(htmlComponents.getTags().join(','), 'comp1,tag');
    });

    var testNodeAttr = '<node attr1="value1" attr2="value2"></node>';
    it('processAttributes : must return attributes for `' + testNodeAttr + '`', function () {
        var attrObj = htmlComponents.processAttributes(cheerio.load(testNodeAttr)('node').eq(0));
        assert(attrObj.attr1, 'value1');
        assert(attrObj.attr2, 'value2');
    });

    var testNodeData = '<node attr1="value1" attr2="value2" data-custom1="datavalue1" data-custom2="datavalue2"></node>';
    it('processAttributes : must return attributes attr1 and attr2 for `' + testNodeData + '', function () {
        var $ = cheerio.load(testNodeData);
        var attrObj = htmlComponents.processAttributes($('node').eq(0), $);
        assert(attrObj.data.custom1, 'datavalue1');
        assert(attrObj.data.custom2, 'datavalue2');
    });


    var testNodeAttrAsNodes = '<node><_attr1>value1</_attr1><_attr2>value2</_attr2><_data-custom1>datavalue1</_data-custom1><_data-custom2>datavalue2</_data-custom2></node>';
    it('processAttributes : must process nodes as attributes from `' + testNodeAttrAsNodes + '', function () {
        var $ = cheerio.load(testNodeAttrAsNodes);
        var node = $('node').eq(0);
        var attrObj = htmlComponents.processNodesAsAttributes(node, $);

        assert(attrObj.attr1, 'value1');
        assert(attrObj.attr2, 'value2');
        assert(attrObj['data-custom1'], 'datavalue1');
        assert(attrObj['data-custom2'], 'datavalue2');
    });

    var testNodeDataAsAttributeProperties = '<node><_attr1>value1</_attr1><_attr2>value2</_attr2><_data-custom1>datavalue1</_data-custom1><_data-custom2>datavalue2</_data-custom2></node>';
    it('processAttributes : must process nodes as attributes and data nodes as attributes into data object from `' + testNodeDataAsAttributeProperties + '', function () {
        var $ = cheerio.load(testNodeDataAsAttributeProperties);
        var node = $('node').eq(0);
        var attrObj = htmlComponents.processAttributes(node, $);

        assert(attrObj.attr1, 'value1');
        assert(attrObj.attr2, 'value2');
        assert(attrObj.data.custom1, 'datavalue1');
        assert(attrObj.data.custom2, 'datavalue2');
    });

    it('processNodesAsAttributes : node must have 0 children after processing `' + testNodeAttrAsNodes + '', function () {
        var $ = cheerio.load(testNodeAttrAsNodes);
        var node = $('node').eq(0);
        htmlComponents.processNodesAsAttributes(node, $);
        assert(node.children().length === 0, true);
    });

});
