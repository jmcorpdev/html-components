/*global describe,it*/
'use strict';
var assert = require('assert'),
    HTMLComponents = require('../lib/html-components.js');

describe('html-components node module.', function () {
    var htmlComponents = new HTMLComponents({
        componentsFolder: 'test/components-folder'
    });

    it('must get 2 tags from components folder', function () {
        assert(htmlComponents.getTags().length, 2);
    });

    it('must have tags comp1,tag in the result of getTags', function () {
        assert(htmlComponents.getTags().join(','), 'comp1,tag');
    });


});
