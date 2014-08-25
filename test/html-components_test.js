/*global describe,it*/
'use strict';
var assert = require('assert'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    HTMLComponents = require('../lib/html-components.js');

describe('html-components node module.', function () {
    var htmlComponents = new HTMLComponents({
        componentsFolder: 'test/resources/components-folder'
    });

    it('should correctly list the tags in components folder', function () {
        htmlComponents.initTags();
        assert.strictEqual(htmlComponents.tags.join(','), 'comp1,tag');
    });

    var testNodeAttr = '<node attr1="value1" attr2="value2"></node>';
    it('should return object from attributes', function () {
        var attrObj = htmlComponents.processAttributes(cheerio.load(testNodeAttr)('node').eq(0));
        assert.strictEqual(attrObj.attr1, 'value1');
        assert.strictEqual(attrObj.attr2, 'value2');
    });

    var testNodeData = '<node attr1="value1" attr2="value2" data-custom1="datavalue1" data-custom2="datavalue2"></node>';
    it('should return object from data-attributes into object attached to attributes object', function () {
        var $ = cheerio.load(testNodeData);
        var attrObj = htmlComponents.processAttributes($('node').eq(0), $);
        assert.strictEqual(attrObj.data.custom1, 'datavalue1');
        assert.strictEqual(attrObj.data.custom2, 'datavalue2');
    });


    var testNodeAttrAsNodes = '<node><_attr1>value1</_attr1><_attr2>value2</_attr2><_data-custom1>datavalue1</_data-custom1><_data-custom2>datavalue2</_data-custom2></node>';
    it('should process node as attributes', function () {
        var $ = cheerio.load(testNodeAttrAsNodes);
        var node = $('node').eq(0);
        var attrObj = htmlComponents.processNodesAsAttributes(node, $);

        assert.strictEqual(attrObj.attr1, 'value1');
        assert.strictEqual(attrObj.attr2, 'value2');
        assert.strictEqual(attrObj['data-custom1'], 'datavalue1');
        assert.strictEqual(attrObj['data-custom2'], 'datavalue2');
    });

    var testNodeDataAsAttributeProperties = '<node><_attr1>value1</_attr1><_attr2>value2</_attr2><_data-custom1>datavalue1</_data-custom1><_data-custom2>datavalue2</_data-custom2></node>';
    it('it should process all nodes even data-nodes into attributes object', function () {
        var $ = cheerio.load(testNodeDataAsAttributeProperties);
        var node = $('node').eq(0);
        var attrObj = htmlComponents.processAttributes(node, $);

        assert.strictEqual(attrObj.attr1, 'value1');
        assert.strictEqual(attrObj.attr2, 'value2');
        assert.strictEqual(attrObj.data.custom1, 'datavalue1');
        assert.strictEqual(attrObj.data.custom2, 'datavalue2');
    });

    it('should remove all attributes nodes after processing nodes', function () {
        var $ = cheerio.load(testNodeAttrAsNodes);
        var node = $('node').eq(0);
        htmlComponents.processNodesAsAttributes(node, $);
        assert.strictEqual(node.children().length, 0);
    });

    it('should get template from name', function () {
        var template = htmlComponents.getTemplate('comp1');
        assert.strictEqual(template, '<div class="comp1">\n' +
            '    {{#if attr1}}<span>{{{attr1}}}</span>{{/if}}\n' +
            '    {{#if attr2}}<span>{{{attr2}}}</span>{{/if}}\n' +
            '</div>');
    });

    it('should get template from name and type', function () {
        var template = htmlComponents.getTemplate('tag', 'type1');
        assert.strictEqual(template, '<div class="tagtype1">\n' +
            '    {{#if attr1}}<span>{{{attr1}}}</span>{{/if}}\n' +
            '    {{#if attr2}}<span>{{{attr2}}}</span>{{/if}}\n' +
            '</div>');
    });

    it('should replace node by it\'s generated HTML', function () {
        htmlComponents.initTags();
        var html = '<comp1 attr1="i am attr1"><_attr2>I am attr2</_attr2></comp1>';
        var $ = cheerio.load(html);
        var node = $('comp1').eq(0);
        var newHTML = htmlComponents.processNode(node, $);
        assert.strictEqual(newHTML, '<div class="comp1">\n' +
            '    <span>i am attr1</span>\n' +
            '    <span>I am attr2</span>\n' +
            '</div>');
    });


    var resultPageContent = '<!DOCTYPE html>\n' +
        '<html>\n' +
        '<head lang="en">\n' +
        '    <meta charset="UTF-8">\n' +
        '    <title></title>\n' +
        '</head>\n' +
        '<body>\n' +
        '\n' +
        '<div class="comp1">\n' +
        '    <span>i am attr1</span>\n' +
        '    <span>I am attr2</span>\n' +
        '</div>\n' +
        '\n' +
        '<div class="tagtype1">\n' +
        '    <span>i am attr1</span>\n' +
        '    <span>I am attr2</span>\n' +
        '</div>\n' +
        '\n' +
        '</body>\n' +
        '</html>';
    it('should process an entire html string from file', function () {
        htmlComponents.initTags();
        var html = fs.readFileSync('test/resources/htmlpages/page.html', {encoding: 'utf-8'});
        var newHTML = htmlComponents.processHTML(html);
        assert.equal(newHTML, resultPageContent);
    });

    it('should process read a file from src dir and write it to dest dir', function() {
        htmlComponents.processFile('page.html', 'test/resources/htmlpages', '.tmp');
        var fileContent = fs.readFileSync('.tmp/page.html', {encoding:'utf-8'});
        assert.equal(fileContent, resultPageContent);
    });

});
