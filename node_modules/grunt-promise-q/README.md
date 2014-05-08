# grunt-promise-q [![Build Status](https://secure.travis-ci.org/phadej/grunt-promise-q.png?branch=master)](http://travis-ci.org/phadej/grunt-promise-q)


> Write asynchronous grunt tasks with Q promises.

## Getting Started

This package requires Grunt `~0.4.1` (the only tested).

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-promise-q --save-dev
```

Once the plugin has been installed, it may be used to define asynchronous tasks:

```js
var q = require("q");
var asyncTask = require("grunt-promise-q");

module.exports = function (grunt) {
    asyncTask.register(grunt, "delay", "delay for 100 ms", function () {
        return q.delay(100);
    });   
}; 
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

- 0.1.1 Maintenance release
- 0.1.0 Initial preview
