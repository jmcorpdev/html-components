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
    path = require('path'),
    Handlebars = require('handlebars'),
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
    tags: null,
    initTags: function () {
        if (!this.tags) {
            var filesList = fs.readdirSync(this.options.componentsFolder);
            this.tags = filesList.map(function (filename) {
                return filename.replace(/\.hbs$/, '');
            }).sort();
        }
    },

    /**
     * Process the HTML by using list of tags
     * @param {String} html String of HTML
     * @returns {String}
     */
    processHTML: function (html) {
        var $ = cheerio.load(html);
        this.initTags();
        var nodesToProcess = $.find(this.tags.join(','));
        nodesToProcess.each(function () {

        });
    },

    /**
     * Transform HTML custom tag into parsed html from template
     * @param node element
     * @param $ cheerio object
     */
    processNode: function (node, $) {
        var context = this.processAttributes(node,$);
        var nodeName = node[0].name;
        var type = context.type;
        var template = Handlebars.compile(this.getTemplate(nodeName, type));
        return template(context);
    },

    getTemplate:function(name, type) {
        var filepath = path.normalize(path.join(this.options.componentsFolder, name + (type ? '/' + type : '') + '.hbs'));
        return fs.readFileSync(filepath, {encoding:'utf-8'});
    },

    processAttributes: function (node, $) {
        var attr = node.attr();
        var nodesAttr = this.processNodesAsAttributes(node, $);
        attr = _.merge(attr, nodesAttr);
        return this.processAttributesObject(attr);
    },

    processAttributesObject: function (attr) {
        var obj = {};
        for (var name in attr) {
            if (attr.hasOwnProperty(name)) {
                var dataRegExp = /^data-/;
                if (dataRegExp.test(name)) {
                    if (!obj.data) {
                        obj.data = {};
                    }
                    var dataName = name.replace(dataRegExp, '');
                    obj.data[dataName] = attr[name];
                }
                obj[name] = attr[name];
            }
        }
        return obj;
    },

    /**
     * transform all children nodes of the object into attributes. The nodes must begin by a specific string. By default it's _
     * @param node
     * @param $ (cheerio object)
     * @returns {{}}
     */
    processNodesAsAttributes: function (node, $) {
        var obj = {};
        node.children().each(function () {
            if (/^_/.test(this.name)) {
                var name = this.name.replace(/^_/, '');
                obj[name] = $(this).html();
                $(this).remove();
            }
        });
        return obj;
    }
};

module.exports = HTMLComponents;