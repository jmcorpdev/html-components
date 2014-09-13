> Create html components from templates in a simple way


## Getting Started

Install the module with: `npm install html-components --save-dev`

```js
var HtmlComponents = require('html-components');
var htmlComponent = new HtmlComponents({
    componentsFolder:'components',
});
```

##usage


## Documentation

All methods are described here :
[lib/html-components.js](doc/lib/html-components.md)


## Examples
- Create a component into the components folder
components/mycomp.hbs

```html
<div class="mycomp">
    {{{myattr}}}
    
    {{#if attr2}}
        <span>I am another attribute : {{attr2}}
    {{/if}}
</div>
```

Use it in a html page 

```html
<!DOCTYPE html>
<html>
<body>

<mycomp myattr="custom attribute">
    <_attr2>
        I can also use the attribute<br> with html or another custom html <strong>components</strong>
    </_attr2>
</mycomp>

</body>
</html>
```

Result : 
```html
<!DOCTYPE html>
<html>
<body>

<div class="mycomp">
    custom attribute
    
    <span>I am another attribute : I can also use the attribute<br> with html or another custom html <strong>components</strong>
        
</div>

</body>
</html>
```





## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com).


# Todo list
* TODO : add possibility to create data-dummy and data-foo object in addition to the data object. example : <node data-dummy-bar="foo" data-dummy-fooooo="bar"> become an object data-dummy and a string if necessary
* TODO : add cache for templates
* TODO : extract handlebars as a plugin
* TODO : manage boolean attributes (if attribute="false" or attribute="true" become boolean)
* TODO : manage single attributes like <node attribute required nothing readonly></node>
* TODO : add option to remove empty lines when there are more than 2 lines
* TODO : add option for template language (possibility to replace handlebars by another template engine)
* TODO : check if code formatting can be added easily
* TODO : documentation
 

## License

Copyright (c) 2014 Arnaud Gueras  
Licensed under the MIT license.
