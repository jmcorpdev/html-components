/*global describe,it*/
'use strict';
var assert = require('assert'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    glob = require('glob-all'),
    path = require('path'),
    HTMLComponents = require('../lib/html-components.js');

describe('html-components node module .', function () {
    var htmlComponents = new HTMLComponents({
        componentsFolder: 'test/resources/components-folder'
    });

    it('should correctly list the tags in components folder', function () {
        htmlComponents.initTags();
        assert.strictEqual(htmlComponents.tags.join(','), 'comp1,customselect,scripttest,tag');
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
    it('should process all nodes even data-nodes into attributes object', function () {
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

    var testNodeWithHTML = '<node><_attr1>value1</_attr1><_attr2>value2</_attr2><_data-custom1>datavalue1</_data-custom1><_data-custom2>datavalue2</_data-custom2><label>This is label</label>\n<span>This is span</span> this is direct text</node>';
    it('should put property `html` with the html of the node without custom nodes', function () {
        var $ = cheerio.load(testNodeWithHTML);
        var node = $('node').eq(0);
        var attr = htmlComponents.processAttributes(node, $);
        assert.strictEqual(attr.html, '<label>This is label</label>\n<span>This is span</span> this is direct text');
    });

    it('should get template from name', function () {
        var template = htmlComponents.getTemplate('comp1');
        assert.strictEqual(template, '<div class="comp1">\n' +
            '    {{#if attr1}}<span>{{{attr1}}}</span>{{/if}}\n' +
            '    {{#if attr2}}<span>{{{attr2}}}</span>{{/if}}{{{html}}}\n' +
            '</div>');
    });

    it('should get template from name and type', function () {
        var template = htmlComponents.getTemplate('tag', 'type1');
        assert.strictEqual(template, '<div class="tagtype1">\n' +
            '    {{#if attr1}}<span>{{{attr1}}}</span>{{/if}}\n' +
            '    {{#if attr2}}<span>{{{attr2}}}</span>{{/if}}{{{html}}}\n' +
            '</div>');
    });

    it('should be possible to have a custom tag inside another tag', function () {
        var string = '<comp1><tag type="type1"></tag>blabla</comp1>';
        var newHTML = htmlComponents.processHTML(string);
        //simple test of node "tag" existance
        assert(!/<tag/.test(newHTML));
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
        '    <span>I am attr2</span>\n    \n\n' +
        '</div>\n' +
        '\n' +
        '<div class="tagtype1">\n' +
        '    <span>i am attr1</span>\n' +
        '    <span>I am attr2</span>\n    \n\n' +
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

    it('should process read a file from src dir and write it to dest dir', function () {
        htmlComponents.processFile('page.html', 'test/resources/htmlpages', '.tmp');
        var fileContent = fs.readFileSync('.tmp/page.html', {encoding: 'utf-8'});
        assert.equal(fileContent, resultPageContent);
    });

    it('should process a entire directory and have the same number of files', function () {
        htmlComponents.processDirectory(['**/*.html', '*.html'], 'test/resources/htmlpages', '.tmp');

        var files = glob.sync(['**/*'], {cwd: '.tmp'}).filter(function (f) {
            return fs.lstatSync(path.join('.tmp', f)).isFile();
        });

        assert(fs.existsSync('.tmp/page.html'), 'test if file is written');
        assert(fs.existsSync('.tmp/page2.html'), 'test if file is written');
        assert(fs.existsSync('.tmp/subdir/page3.html'), 'test if file is written');
        assert(fs.existsSync('.tmp/subdir/page3.html'), 'test if file is written');
        assert.equal(files.length, 4);
    });

    it('should transform data object into attributes string', function () {
        var str = htmlComponents.objectToAttributeString('data-', {
            attr1: 'value1',
            attr2: 'value2'
        });

        assert.equal(str, 'data-attr1="value1" data-attr2="value2"');
    });

    it('should have the data object into attached string `dataStr`', function () {
        var testNodeData = '<node attr1="value1" data-custom1="datavalue1" data-custom2="datavalue2">hmtl content</node>';
        var $ = cheerio.load(testNodeData);
        var attrObj = htmlComponents.processAttributes($('node').eq(0), $);

        assert.equal(attrObj.data.custom1, 'datavalue1');
        assert.equal(attrObj.data.custom2, 'datavalue2');
        assert.equal(attrObj.dataStr, 'data-custom1="datavalue1" data-custom2="datavalue2"');
    });

    it('should be possible to specify  the prefix for the node attributes (attrNodePrefix)', function () {
        var htmlTemp = new HTMLComponents({
            attrNodePrefix: 'z-',
            componentsFolder: 'test/resources/components-folder'
        });
        htmlTemp.initTags();
        var testNodeData = '<node><z-attr1>value1</z-attr1><z-attr2>value2</z-attr2><z-data-custom1>datavalue1</z-data-custom1><z-data-custom2>datavalue2</z-data-custom2></node>';
        var $ = cheerio.load(testNodeData);
        var attrObj = htmlTemp.processAttributes($('node').eq(0), $);

        assert.equal(attrObj.attr1, 'value1');
        assert.equal(attrObj.attr2, 'value2');
        assert.equal(attrObj.data.custom1, 'datavalue1');
        assert.equal(attrObj.data.custom2, 'datavalue2');
    });

    it('should be possible to use collections in the component', function () {
        var html = '<customselect><item value="test">label</item><item value="test2">label2</item></customselect>';
        var newHTML = htmlComponents.processHTML(html);
        assert.equal(newHTML, '<select>\n    <option value="test">label</option>\n    <option value="test2">label2</option>\n</select>');
    });
});
