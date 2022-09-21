/**
 *
 * https://github.com/arnogues/html-components
 *
 * @author Arnaud Guéras
 * @class HTMLComponents
 * @copyright (c) 2014 Arnaud Gueras
 * @license MIT
 *
 *
 */

"use strict";

var cheerio = require("cheerio"),
  _ = require("lodash"),
  path = require("path"),
  Handlebars = require("handlebars"),
  mkdirp = require("mkdirp"),
  glob = require("glob-all"),
  fs = require("fs"),
  helpers = require("handlebars-helpers")({
    handlebars: Handlebars,
  });

var HTMLComponents = function () {
  this.init.apply(this, arguments);
  this.cache = {};
  this.tags = null;
};

HTMLComponents.prototype = {
  constructor: HTMLComponents.prototype.constructor,

  /**
   * @member {Object} Defaults options
   */
  options: {
    /**
     * @member {String} componentsFolder
     * default folder where the components are stored
     * @default 'components'
     */
    componentsFolder: "components",

    /**
     * @member {String} srcDir
     * source directory, srcDir is relative to the projectFolder
     * @exemple : 'app/'
     */
    srcDir: "",

    /**
     * @member {String} destDir
     * Destination directory, where the html files are generated, the destDir is relative to the projectFolder
     */
    destDir: "",

    /**
     * @member {String} attrNodePrefix
     * Prefix of the attr when you need to use html content inside an attribute
     * @example
     * // use the attribute value as a var
     * // normal usage
     * <node value="foo"></node>
     * // usage as attribute
     * <node>
     *     <_value>long string with <strong>html inside</strong></_value>
     * </node>
     */
    attrNodePrefix: "_",

    /**
     * @mamber {Array} files
     * The match of the html files, base on the minimatch library
     * @default ['*.html']
     */
    files: ["*.html"],

    /**
     *
     * @param html
     * Modify the HTML code before HTML is processed
     * @returns {String}
     */
    beforeProcessHTML: function (html) {
      return html;
    },

    /**
     *
     * @param html
     * Modify the HTML code after HTML is processed
     * @returns {String}
     */
    afterProcessHTML: function (html) {
      return html;
    },
  },

  /**
   * @constructs
   * @param {Object} options object
   */
  init: function (options) {
    this.options = _.merge({}, this.options, options);
  },

  /**
   * @membere {Array} List of tags
   */
  tags: null,
  /**
   * Generate list of tags from a directory, the generated tags is set to `tags`
   * @method
   */
  initTags: function () {
    if (!this.tags) {
      var filesList = fs.readdirSync(this.options.componentsFolder);
      this.tags = filesList
        .map(function (filename) {
          return filename.replace(/\.hbs$/, "");
        })
        .sort();
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
    var files = glob.sync(patterns, { cwd: srcDir });
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
   * htmlComponents.processFile('myfile.html', 'test', '.tmp');
   * htmlComponents.processFile('mysubfolder/folder/myfile.html', 'app', 'dist');
   *
   */
  processFile: function (filePath, srcFolder, destFolder) {
    var html = fs.readFileSync(path.join(srcFolder, filePath), { encoding: "utf-8" });
    var newHTML = this.processHTML(html);
    mkdirp.sync(path.dirname(path.join(destFolder, filePath)));
    fs.writeFileSync(path.join(destFolder, filePath), newHTML, { encoding: "utf-8" });
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
    var template = this.getTemplate(nodeName, type);
    return template(context);
  },

  /**
   * Process the HTML by using list of tags
   * @param {String} html String of HTML
   * @returns {String}
   */
  processHTML: function (html) {
    html = this.options.beforeProcessHTML(html);
    // fix <br> bug
    html = html.replace(/<br>/g, "<br/>");
    var _this = this;
    this.initTags();
    var $ = cheerio.load(html, { xmlMode: true, selfClosingTags: false });
    var nodesToProcess = $(this.tags.join(","));
    nodesToProcess.each(function () {
      var html = _this.processNode($(this), $);
      html = _this.processHTML(html);
      $(this).replaceWith(html);
    });
    $("script")
      .filter('[type="text/html"],[type="text/template"]')
      .each(function () {
        var html = $(this).text();
        if (/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/.test(html)) {
          var re = /<!\[CDATA\[([\s\S]+)\]\]>/;
          var htmlTrimmed = html.trim();
          var hasCDATA = re.test(htmlTrimmed);
          var htmlToParse = html;
          if (hasCDATA) {
            htmlToParse = htmlTrimmed.replace(re, "$1");
          }
          var newHTML = _this.processHTML(htmlToParse);
          if (hasCDATA) {
            newHTML = "<![CDATA[" + newHTML + "]]>";
          }
          $(this).text(newHTML);
        }
      });
    //return $.html();

    var finalString = $.html({ xmlMode: false });

    return this.options.afterProcessHTML(finalString);
  },

  /**
   * Transforms all attributes of a node into an object
   * @param node
   * @param $
   * @returns {*}
   */
  processAttributes: function (node, $) {
    var attr = node.attr();
    var nodesAttr = this.processNodesAsAttributes(node, $);
    attr = _.merge({}, attr, nodesAttr);
    attr = this.fixAttributesObject(attr);
    return attr;
  },

  /**
   * transform all children nodes of the object into attributes. The nodes must begin by a specific string. By default it's _
   * @param {jQuery} node html node to process
   * @param $ (cheerio object)
   * @returns {{}}
   */
  processNodesAsAttributes: function (node, $) {
    var obj = {};
    var regexp = new RegExp("^" + this.options.attrNodePrefix.replace(/([\[\]\$])/g, "\\$1"));
    node.children().each(function () {
      var $this = $(this);
      if (regexp.test(this.name)) {
        var name = this.name.replace(regexp, "");
        obj[name] = $this.html();
        $this.remove();
      }
      //process items
      if (this.name === "item") {
        if (!obj.items) {
          obj.items = [];
        }
        obj.items.push({
          html: $this.html(),
          value: $this.attr("value"),
        });
        $this.remove();
      }
    });
    obj.html = node.html();
    return obj;
  },

  /**
   *
   * @ignore
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
          var dataName = name.replace(dataRegExp, "");
          obj.data[dataName] = attr[name];
        }
        obj[name] = attr[name];
      }
    }

    //merge data object from attr into a string
    if (obj.data) {
      obj.dataStr = this.objectToAttributeString("data-", obj.data);
    }

    return obj;
  },

  /**
   * Return the right template from name and type
   * @param name name of the template file
   * @param type if type if specified, then name become a folder and type if the filename of the template
   * @returns {*}
   * @ignore
   */
  cache: {},
  getTemplate: function (name, type) {
    var template;
    if (!this.cache[name + "$" + type]) {
      // check if folder structure like {component}/component.hbs or {component}/{type}/{type}.hbs exists
      let templatePath = `${name}/${name}.hbs`;
      if (type) {
        templatePath = `${name}/${type}/${type}.hbs`;
      }
      let filepath = path.normalize(path.join(this.options.componentsFolder, templatePath));

      // if template with advanced folder struct doesn't exist, we use simple folder structure
      if (!fs.existsSync(filepath)) {
        templatePath = name + (type ? "/" + type : "") + ".hbs";
        filepath = path.normalize(path.join(this.options.componentsFolder, templatePath));
      }
      if (!fs.existsSync(filepath)) {
        console.error(`Template ${templatePath} doesn't exist`);
        process.exit(process.exitCode || 1);
      }

      template = Handlebars.compile(fs.readFileSync(filepath, { encoding: "utf-8" }));
      this.cache[name + "$" + type] = template;
    } else {
      template = this.cache[name + "$" + type];
    }
    return template;
  },

  /**
   * Reset the cache
   */
  resetCache: function () {
    this.cache = {};
    return this;
  },

  /**
   * Generate object into string
   * @example
   * // returns: data-item="value" data-foo="bar"
   * htmlComponents.objectToAttributeString('data-', {item:'value', foo:'bar'});
   *
   * @param {String} prefix The prefix to use
   * @param {Object} obj The object to transform
   * @returns {string}
   *
   */
  objectToAttributeString: function (prefix, obj) {
    var str = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(prefix + key + '="' + obj[key] + '"');
      }
    }
    return str.join(" ");
  },
};

module.exports = HTMLComponents;
