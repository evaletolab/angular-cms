[![build status](https://secure.travis-ci.org/CaryLandholt/grunt-hustler.png)](http://travis-ci.org/CaryLandholt/grunt-hustler)
# grunt-hustler

## Contents

* [What is grunt-hustler?](#what-is-grunt-hustler)
* [Installation](#installation)
* [Usage](#usage)
* [Versioning](#versioning)
* [Bug Tracker](#bug-tracker)
* [Author](#author)
* [License](#license)

## What is grunt-hustler?

A collection of [grunt](https://github.com/cowboy/grunt) tasks.

* coffee - _deprecated_, use [grunt-contrib-coffee](https://github.com/gruntjs/grunt-contrib-coffee)
* copy - _deprecated_, use [grunt-contrib-copy](https://github.com/gruntjs/grunt-contrib-copy)
* delete - _deprecated_, use [grunt-contrib-clean](https://github.com/gruntjs/grunt-contrib-clean)
* inlineTemplate - adds views to script blocks
* less - _deprecated_, use [grunt-contrib-less](https://github.com/gruntjs/grunt-contrib-less)
* minifyHtml - minifies html views (not using grunt-contrib until their minifier supports valueless attributes and xml namespaces)
* ngTemplateCache - creates a JavaScript file, placing all views in the AngularJS $templateCache
* rename - renames files
* requirejs - _deprecated_, use [grunt-contrib-requirejs](https://github.com/gruntjs/grunt-contrib-requirejs)
* server - _deprecated_, use [grunt-express](https://github.com/blai/grunt-express)
* template - compiles views containing Lo-Dash template commands.

## Installation

```bash
$ npm install grunt-hustler
```

## Usage

Include the following line in your Grunt file.

```javascript
grunt.loadNpmTasks('grunt-hustler');
```

## Versioning

For transparency and insight into our release cycle, and for striving to maintain backwards compatibility, this module will be maintained under the Semantic Versioning guidelines as much as possible.

Releases will be numbered with the follow format:

`<major>.<minor>.<patch>`

And constructed with the following guidelines:

* Breaking backwards compatibility bumps the major
* New additions without breaking backwards compatibility bumps the minor
* Bug fixes and misc changes bump the patch

For more information on SemVer, please visit http://semver.org/.

## Bug tracker

Have a bug?  Please create an issue here on GitHub!

https://github.com/CaryLandholt/grunt-hustler/issues

## Author

**Cary Landholt**

+ http://twitter.com/CaryLandholt
+ http://github.com/CaryLandholt


## License

Copyright 2013 Cary Landholt

Licensed under the MIT license.