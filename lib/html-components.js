/*
 * 
 * https://github.com/arnogues/html-components
 *
 * Copyright (c) 2014 Arnaud Gueras
 * Licensed under the MIT license.
 */

'use strict';

var cheerio = require('cheerio'),
    _ = require('lodash'),
    //glob = require('glob'),
    fs = require('fs');

var HTMLComponents = function () {
    this.init.apply(this, arguments);
};


HTMLComponents.prototype = {
    constructor: HTMLComponents.prototype.constructor,
    options: {
        componentsFolder: 'components',
        files: ['*.html']
    },

    /**
     * Constructor
     */
    init: function (options) {
        this.options = _.merge({}, this.options, options);
        console.log(this.options);
    },

    /**
     * Generate list of tags from a directory
     * @returns {Array}
     */
    tags: [],
    getTags: function () {
        var filesList = fs.readdirSync(this.options.componentsFolder);
        return filesList.map(function (filename) {
            return filename.replace(/\.hbs$/, '');
        }).sort();
    },

    /**
     * Process the HTML by using list of tags
     * @param {String} html String of HTML
     * @returns {String}
     */
    processHTML: function (html) {
        var $ = cheerio.load(html);
        if (!this.tags.length) {
            this.tags = this.getTags();
        }
        var nodesToProcess = $.find(this.tags.join(','));
        nodesToProcess.each(function() {

        });
    },

    /**
     * Transform HTML custom tag into parsed html from template
     * @param node
     */
    processNode:function(/*node*/) {

    },

    processAttributes:function(node) {
        var attr = node.attr();
        var obj = {};
        for (var name in attr) {
            if(attr.hasOwnProperty(name)) {
                /*if(/data-/.test(name)) {
                    if(!obj.data) {
                        obj.data = {};
                    }
                    //var dataName =
                }*/

                obj[name] = attr[name];
            }
        }
        return obj;
    }
};

module.exports = HTMLComponents;