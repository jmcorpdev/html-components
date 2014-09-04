#  [![Build Status](https://secure.travis-ci.org/arnogues/html-components.png?branch=master)](http://travis-ci.org/arnogues/html-components)

> Create html components from templates in a simple way




## Getting Started

Install the module with: `npm install html-components --save-dev`

```js
var html-components = require('html-components');
html-components.awesome(); // "awesome"
```

## quick example
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

<mycomp myattr="custom attribute">
    <_attr2>
        I can also use the attribute with html or another custom html components
    </_attr2>
</mycomp>

<div class="mycomp">
    custom attribute
    
    {{#if attr2}}
        <span>I am another attribute : I can also use the attribute<br> with html or another custom html <strong>components</strong>
    {{/if}}
</div>

</body>
</html>
```

## Documentation
Generated documentation for methods is here : 
[lib/html-components.js](lib/html-components.md)


## Examples

_(Coming soon)_


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com).


## License

Copyright (c) 2014 Arnaud Gueras  
Licensed under the MIT license.
