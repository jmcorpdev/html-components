/*global describe,it*/
"use strict";
var assert = require("assert"),
  cheerio = require("cheerio"),
  fs = require("fs.extra"),
  glob = require("glob-all"),
  path = require("path"),
  HTMLComponents = require("../lib/html-components.js");

//clean .tmp folder
fs.rmrfSync(".tmp");
var componentsFolder = "test/resources/components-folder";

var htmlComponents = new HTMLComponents({
  componentsFolder: componentsFolder,
});

describe("Tags", function () {
  it("should correctly list the tags in components folder", function () {
    htmlComponents.initTags();
    assert.strictEqual(htmlComponents.tags.join(","), "comp1,customselect,layout,scripttest,tag"); //script tag is added by code
  });

  it("should get template from name", function () {
    var template = htmlComponents.getTemplate("comp1");
    // template is a function because it is evaluate automatically by the template engine
    assert.strictEqual(template(), '<div class="comp1">\n    \n    \n</div>');
  });

  it("should get template from name and type", function () {
    var template = htmlComponents.getTemplate("tag", "type1");
    assert.strictEqual(template(), '<div class="tagtype1">\n    \n    \n</div>');
  });

  /*it('should put the template in cache', function () {
        var template = htmlComponents.getTemplate('tag', 'type1');
        assert.strictEqual(htmlComponents['tag$type'], '<div class="tagtype1">\n    \n    \n</div>');
    });*/
});

describe("Attributes", function () {
  var testNodeAttr = '<node attr1="value1" attr2="value2"></node>';
  it("should return object from attributes", function () {
    var attrObj = htmlComponents.processAttributes(cheerio.load(testNodeAttr)("node").eq(0));
    assert.strictEqual(attrObj.attr1, "value1");
    assert.strictEqual(attrObj.attr2, "value2");
  });

  var testNodeData = '<node attr1="value1" attr2="value2" data-custom1="datavalue1" data-custom2="datavalue2"></node>';
  it("should return object from data-attributes into object attached to attributes object", function () {
    var $ = cheerio.load(testNodeData);
    var attrObj = htmlComponents.processAttributes($("node").eq(0), $);
    assert.strictEqual(attrObj.data.custom1, "datavalue1");
    assert.strictEqual(attrObj.data.custom2, "datavalue2");
  });

  var testNodeAttrAsNodes =
    "<node><_attr1>value1</_attr1><_attr2>value2</_attr2><_data-custom1>datavalue1</_data-custom1><_data-custom2>datavalue2</_data-custom2></node>";
  it("should process nodes as attributes", function () {
    var $ = cheerio.load(testNodeAttrAsNodes, { xml: { xmlMode: true }, decodeEntities: false }, false);
    var node = $("node").eq(0);
    var attrObj = htmlComponents.processNodesAsAttributes(node, $);
    assert.strictEqual(attrObj.attr1, "value1");
    assert.strictEqual(attrObj.attr2, "value2");
    assert.strictEqual(attrObj["data-custom1"], "datavalue1");
    assert.strictEqual(attrObj["data-custom2"], "datavalue2");
  });

  var testNodeDataAsAttributeProperties =
    "<node><_attr1>value1</_attr1><_attr2>value2</_attr2><_data-custom1>datavalue1</_data-custom1><_data-custom2>datavalue2</_data-custom2></node>";
  it("should process all nodes even data-nodes into attributes object", function () {
    var $ = cheerio.load(testNodeDataAsAttributeProperties, { xml: { xmlMode: true }, decodeEntities: false }, false);
    var node = $("node").eq(0);
    var attrObj = htmlComponents.processAttributes(node, $);

    assert.strictEqual(attrObj.attr1, "value1");
    assert.strictEqual(attrObj.attr2, "value2");
    assert.strictEqual(attrObj.data.custom1, "datavalue1");
    assert.strictEqual(attrObj.data.custom2, "datavalue2");
  });

  it("should remove all attributes nodes after processing nodes", function () {
    var $ = cheerio.load(testNodeAttrAsNodes);
    var node = $("node").eq(0);
    htmlComponents.processNodesAsAttributes(node, $);
    assert.strictEqual(node.children().length, 0);
  });

  var testNodeWithHTML =
    "<node><_attr1>value1</_attr1><_attr2>value2</_attr2><_data-custom1>datavalue1</_data-custom1><_data-custom2>datavalue2</_data-custom2><label>This is label</label>\n<span>This is span</span> this is direct text</node>";
  it("should put property `html` with the html of the node without custom nodes", function () {
    var $ = cheerio.load(testNodeWithHTML, { xml: { xmlMode: true }, decodeEntities: false }, false);
    var node = $("node").eq(0);
    var attr = htmlComponents.processAttributes(node, $);
    assert.strictEqual(attr.html, "<label>This is label</label>\n<span>This is span</span> this is direct text");
  });

  it("should transform data object into attributes string", function () {
    var str = htmlComponents.objectToAttributeString("data-", {
      attr1: "value1",
      attr2: "value2",
    });

    assert.equal(str, 'data-attr1="value1" data-attr2="value2"');
  });

  it("should have the data object into attached string `dataStr`", function () {
    var testNodeData = '<node attr1="value1" data-custom1="datavalue1" data-custom2="datavalue2">hmtl content</node>';
    var $ = cheerio.load(testNodeData, { xml: { xmlMode: true }, decodeEntities: false }, false);
    var attrObj = htmlComponents.processAttributes($("node").eq(0), $);

    assert.equal(attrObj.data.custom1, "datavalue1");
    assert.equal(attrObj.data.custom2, "datavalue2");
    assert.equal(attrObj.dataStr, 'data-custom1="datavalue1" data-custom2="datavalue2"');
  });

  it("should be possible to specify  the prefix for the node attributes (attrNodePrefix)", function () {
    var htmlComp = new HTMLComponents({
      attrNodePrefix: "z-",
      componentsFolder: "test/resources/components-folder",
    });
    htmlComp.initTags();
    var testNodeData =
      "<node><z-attr1>value1</z-attr1><z-attr2>value2</z-attr2><z-data-custom1>datavalue1</z-data-custom1><z-data-custom2>datavalue2</z-data-custom2></node>";
    var $ = cheerio.load(testNodeData);
    var attrObj = htmlComp.processAttributes($("node").eq(0), $);

    assert.equal(attrObj.attr1, "value1");
    assert.equal(attrObj.attr2, "value2");
    assert.equal(attrObj.data.custom1, "datavalue1");
    assert.equal(attrObj.data.custom2, "datavalue2");
  });
});

describe("Templating", function () {
  it("should be possible to have a custom tag inside another tag", function () {
    var string = '<comp1><tag type="type1"></tag>blabla</comp1>';
    var newHTML = htmlComponents.processHTML(string);
    //simple test of node "tag" existance
    assert(!/<tag/.test(newHTML));
  });

  it("should replace node by it's generated HTML", function () {
    htmlComponents.initTags();
    var html = '<comp1 attr1="i am attr1"><_attr2>I am attr2</_attr2></comp1>';
    var $ = cheerio.load(html, { xml: { xmlMode: true }, decodeEntities: false }, false);
    var node = $("comp1").eq(0);
    var newHTML = htmlComponents.processNode(node, $);
    assert.strictEqual(newHTML, '<div class="comp1">\n' + "    <span>i am attr1</span>\n" + "    <span>I am attr2</span>\n" + "</div>");
  });

  var resultPageContent =
    "<!DOCTYPE html>\n" +
    "<html>\n" +
    '<head lang="en">\n' +
    '    <meta charset="UTF-8">\n' +
    "    <title></title>\n" +
    "</head>\n" +
    "<body>\n" +
    "\n" +
    '<div class="comp1">\n' +
    "    <span>i am attr1</span>\n" +
    "    <span>I am attr2</span>\n    \n\n" +
    "</div>\n" +
    "\n" +
    '<div class="tagtype1">\n' +
    "    <span>i am attr1</span>\n" +
    "    <span>I am attr2</span>\n    \n\n" +
    "</div>\n" +
    "\n" +
    "</body>\n" +
    "</html>";
  it("should process an entire html string from file", function () {
    htmlComponents.initTags();
    var html = fs.readFileSync("test/resources/htmlpages/page.html", { encoding: "utf-8" });
    var newHTML = htmlComponents.processHTML(html);
    assert.equal(newHTML, resultPageContent);
  });

  it("should process read a file from src dir and write it to dest dir", function () {
    htmlComponents.processFile("page.html", "test/resources/htmlpages", ".tmp");
    var fileContent = fs.readFileSync(".tmp/page.html", { encoding: "utf-8" });
    assert.equal(fileContent, resultPageContent);
  });

  it("should process an entire directory and have the same number of files", function () {
    htmlComponents.processDirectory(["**/*.html", "*.html"], "test/resources/htmlpages", ".tmp");

    var files = glob.sync(["**/*"], { cwd: ".tmp" }).filter(function (f) {
      return fs.lstatSync(path.join(".tmp", f)).isFile();
    });

    assert(fs.existsSync(".tmp/page.html"), "test if file is written");
    assert(fs.existsSync(".tmp/page2.html"), "test if file is written");
    assert(fs.existsSync(".tmp/subdir/page3.html"), "test if file is written");
    assert(fs.existsSync(".tmp/subdir/page3.html"), "test if file is written");
    assert.equal(files.length, 5);
  });

  it("should be possible to use collections in the component", function () {
    var html = '<customselect><item value="test">label</item><item value="test2">label2</item></customselect>';
    var newHTML = htmlComponents.processHTML(html);
    assert.equal(newHTML, '<select>\n    <option value="test">label</option>\n    <option value="test2">label2</option>\n</select>');
  });

  it("shoud be possible to process script tags", function () {
    htmlComponents.processFile("scripttest.html", "test/resources/htmlpages", ".tmp");
    var fileContent = fs.readFileSync(".tmp/scripttest.html", { encoding: "utf-8" });
    var $ = cheerio.load(fileContent);

    assert(/<div class="comp1">/.test($("script").eq(0).text()), true);
  });

  it.only("Don't encode next scripts tags", function () {
    const html = `
    <html>
    <head><title>test</title></head>
    <body>test

    <span></span>
    <script type="text/javascript" src="js/framework.js"></script>
    <script type="text/javascript" src="js/header.js"></script>
    </body>
    </html>
  `;

    const newHTML = htmlComponents.processHTML(html);
    assert.equal(html, newHTML);
  });

  it("should generate the layout of a page", function () {
    htmlComponents.processFile("pageWithLayout.html", "test/resources/htmlpages", ".tmp");
    var fileContent = fs.readFileSync(".tmp/pageWithLayout.html", { encoding: "utf-8" });
    var fileToTest = fs.readFileSync("test/resources/resultCompare/pageWithLayout.html", { encoding: "utf-8" });

    assert.equal(fileContent, fileToTest);
  });
});

describe("Render correctly without modification", function () {
  it("Should use render correctly", function () {
    var htmlCompWithBeforeHTML = new HTMLComponents({
      componentsFolder: componentsFolder,
    });

    function ts(string) {
      var newHTML = htmlCompWithBeforeHTML.processHTML(string);
      //simple test of node "tag" existance
      assert.equal(newHTML, string);
    }

    ts("<div>foo<br>bar</div>");
    ts("<div>foo<hr>bar</div>");
    ts('<div>foo<input type="text">bar</div>');
  });
});

describe("callbacks", function () {
  it("Should use beforeHTML callback", function () {
    var htmlCompWithBeforeHTML = new HTMLComponents({
      componentsFolder: componentsFolder,
      beforeProcessHTML: function (html) {
        return html.replace(/<span>(.+?)<\/span>/g, "<strong>$1</strong>");
      },
    });

    var newHTML = htmlCompWithBeforeHTML.processHTML("<div>foobar<span>buzz</span></div>");
    //simple test of node "tag" existanc
    assert.equal(newHTML, "<div>foobar<strong>buzz</strong></div>");
  });

  it("Should use afterProcessHTML callback", function () {
    var htmlCompWithBeforeHTML = new HTMLComponents({
      componentsFolder: componentsFolder,
      afterProcessHTML: function (html) {
        return html.replace(/<span>(.+?)<\/span>/g, "<strong>$1</strong>");
      },
    });

    var newHTML = htmlCompWithBeforeHTML.processHTML("<div>foobar<span>buzz</span></div>");
    //simple test of node "tag" existanc
    assert.equal(newHTML, "<div>foobar<strong>buzz</strong></div>");
  });
});

/*
describe("bugs", function() {
    it.only("Should not render multiple <br>", function() {
      var newHTML = htmlComponents.processHTML("<td>Foo<br/>barr</td>");
      //simple test of node "tag" existance
      assert.equal(newHTML, "<td>Foo<br>barr</td>");
    });
});*/
