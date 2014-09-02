/*
 *
 * https://github.com/arnogues/html-components
 *
 * Copyright (c) 2014 Arnaud Gueras
 * Licensed under the MIT license.
 *
 * TODO : <script type="text/html"></script> should be parsed properly. check if 'parse=true' is neccessary
 * TODO : extract handlebars as a plugin
 * TODO : add option for template language (possibility to replace handlebars by another template engine)
 * TODO : check if code formatting can be added easily
 * TODO : documentation
 */

'use strict';

var cheerio = require('cheerio'),
    _ = require('lodash'),
    path = require('path'),
    Handlebars = require('handlebars'),
    mkdirp = require('mkdirp'),
    glob = require('glob-all'),
    fs = require('fs');

var HTMLComponents = function () {
    this.init.apply(this, arguments);
};


HTMLComponents.prototype = {
    constructor: HTMLComponents.prototype.constructor,
    options: {
        componentsFolder: 'components',
        srcDir: '',
        destDir: '',
        attrNodePrefix: '_',
        files: ['*.html']
    },

    /**
     * Constructor
     */
    init: function (options) {
        this.options = _.merge({}, this.options, options);
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
     * Parse all html files of srcDir and write them into destDir
     * @param {String} srcDir source directory
     * @param {String} destDir destination directory
     * @param {Array} patterns files mask, it follows https://github.com/isaacs/node-glob options
     */
    processDirectory: function (patterns, srcDir, destDir) {
        var _this = this;
        var files = glob.sync(patterns, {cwd: srcDir});
        files.forEach(function (file) {
            _this.processFile(file, srcDir, destDir);
        });
    },

    /**
     * Process one file
     * @param filePath the relative file path from srcFolder,
     * @param srcFolder the source folder
     * @param destFolder the destination folder
     *
     * @example
     *      htmlComponents.processFile('myfile.html', 'test', '.tmp');
     *      htmlComponents.processFile('mysubfolder/folder/myfile.html', 'app', 'dist');
     *
     */
    processFile: function (filePath, srcFolder, destFolder) {
        var html = fs.readFileSync(path.join(srcFolder, filePath), {encoding: 'utf-8'});
        var newHTML = this.processHTML(html);
        mkdirp.sync(path.dirname(path.join(destFolder, filePath)));
        fs.writeFileSync(path.join(destFolder, filePath), newHTML, {encoding: 'utf-8'});
    },

    /**
     * Process the HTML by using list of tags
     * @param {String} html String of HTML
     * @returns {String}
     */
    processHTML: function (html) {
        var _this = this;
        this.initTags();
        var $ = cheerio.load(html);
        var nodesToProcess = $(this.tags.join(','));
        nodesToProcess.each(function () {
            var html = _this.processNode($(this), $);
            html = _this.processHTML(html);
            $(this).replaceWith(html);
        });
        return $.html();
    },

    /**
     * Transform HTML custom tag into parsed html from template
     * @param node element
     * @param $ cheerio object
     */
    processNode: function (node, $) {
        var context = this.processAttributes(node, $);
        var nodeName = node[0].name;
        var type = context.type;
        var template = Handlebars.compile(this.getTemplate(nodeName, type));
        return template(context);
    },

    processAttributes: function (node, $) {
        var attr = node.attr();
        var nodesAttr = this.processNodesAsAttributes(node, $);
        attr = _.merge(attr, nodesAttr);
        attr = this.fixAttributesObject(attr);
        return attr;
    },

    /**
     * transform all children nodes of the object into attributes. The nodes must begin by a specific string. By default it's _
     * @param node
     * @param $ (cheerio object)
     * @returns {{}}
     */
    processNodesAsAttributes: function (node, $) {
        var obj = {};
        var regexp = new RegExp('^' + this.options.attrNodePrefix.replace(/([\[\]\$])/g, '\\$1'));
        node.children().each(function () {
            var $this = $(this);
            if (regexp.test(this.name)) {
                var name = this.name.replace(regexp, '');
                obj[name] = $this.html();
                $this.remove();
            }
            //process items
            if(this.name==='item') {
                if(!obj.items) {
                    obj.items = [];
                }
                obj.items.push({
                    html:$this.html(),
                    value:$this.attr('value')
                });
                $this.remove();
            }
        });
        obj.html = node.html();
        return obj;
    },

    /**
     *
     * @param attr
     * @returns {{}}
     */
    fixAttributesObject: function (attr) {
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

        //merge data object from attr into a string
        if (obj.data) {
            obj.dataStr = this.objectToAttributeString('data-', obj.data);
        }

        return obj;
    },

    /**
     * Return the right template from name and type
     * @param name name of the template file
     * @param type if type if specified, then name become a folder and type if the filename of the template
     * @returns {*}
     */
    getTemplate: function (name, type) {
        var filepath = path.normalize(path.join(this.options.componentsFolder, name + (type ? '/' + type : '') + '.hbs'));
        return fs.readFileSync(filepath, {encoding: 'utf-8'});
    },

    objectToAttributeString: function (prefix, obj) {
        var str = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(prefix + key + '="' + obj[key] + '"');
            }
        }
        return str.join(' ');
    }
};

module.exports = HTMLComponents;