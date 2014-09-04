Global
===





---

HTMLComponents
===
https://github.com/arnogues/html-components

**Defaults** - options
**componentsFolder** - default folder where the components are stored
**srcDir** - source directory, srcDir is relative to the projectFolder
**destDir** - Destination directory, where the html files are generated, the destDir is relative to the projectFolder
**attrNodePrefix** - Prefix of the attr when you need to use html content inside an attribute
**files** - https://github.com/arnogues/html-components

HTMLComponents
===


**tags** - 
HTMLComponents.initTags() 
-----------------------------
Generate list of tags from a directory, the generated tags is set to `tags`

HTMLComponents.processDirectory(srcDir, destDir, patterns) 
-----------------------------
Parse all html files of srcDir and write them into destDir

**Parameters**

**srcDir**: String, source directory

**destDir**: String, destination directory

**patterns**: Array, files mask, it follows https://github.com/isaacs/node-glob options

HTMLComponents.processFile(filePath, srcFolder, destFolder) 
-----------------------------
Process one file

**Parameters**

**filePath**: the relative file path from srcFolder,

**srcFolder**: the source folder

**destFolder**: the destination folder

HTMLComponents.processNode(node, $) 
-----------------------------
Transform HTML custom tag into parsed html from template

**Parameters**

**node**: element

**$**: cheerio object

HTMLComponents.processHTML(html) 
-----------------------------
Process the HTML by using list of tags

**Parameters**

**html**: String, String of HTML

**Returns**: String, Process the HTML by using list of tags
HTMLComponents.processAttributes(node, $) 
-----------------------------
Transforms all attributes of a node into an object

**Parameters**

**node**: Transforms all attributes of a node into an object

**$**: Transforms all attributes of a node into an object

**Returns**: *, Transforms all attributes of a node into an object
HTMLComponents.processNodesAsAttributes(node, $) 
-----------------------------
transform all children nodes of the object into attributes. The nodes must begin by a specific string. By default it's _

**Parameters**

**node**: jQuery, html node to process

**$**: (cheerio object)

**Returns**: Object, transform all children nodes of the object into attributes. The nodes must begin by a specific string. By default it's _
HTMLComponents.fixAttributesObject(attr) 
-----------------------------
**Parameters**

**attr**: 

**Returns**: Object, 
HTMLComponents.getTemplate(name, type) 
-----------------------------
Return the right template from name and type

**Parameters**

**name**: name of the template file

**type**: if type if specified, then name become a folder and type if the filename of the template

**Returns**: *, Return the right template from name and type
HTMLComponents.objectToAttributeString(prefix, obj) 
-----------------------------
Generate object into string

**Parameters**

**prefix**: String, The prefix to use

**obj**: Object, The object to transform

**Returns**: string, Generate object into string


---








