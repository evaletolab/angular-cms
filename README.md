# Angular CMS

Angular CMS is a markdown content module for angular js. It allows you to quickly embed structured content from a github project to your application.

## Install it as angular module

the easiest way is to run bower, then you just have to add the script and register the module `ng-cms` to you application:

```
./node_modules/.bin/bower install --save https://github.com/evaletolab/angular-cms/tarball/master
```
Setup your angular application to make the help available
```javascript
// load the module
var app=angular.module('app', ['ngCMS']);
...
// init the module
app.run(function (gitHubContent) {
  gitHubContent.initialize({
        root:'page', // specify the prefix route of your content
        githubRepo:'<github-user>/<github-repo>',
        githubToken:'<gitub-token>'
    });
});

// configure your project routes
$routeProvider
    // display blog in ngView with dated structure url 
    .when('/blog/:year?/:month?/:day?/:title?', {templateUrl: 'html/ng-cms.doc.html'})

    // display a single page in ngView
    .when('/page/:docs?/:article?',{title: 'markdown content', templateUrl: 'partials/page.html'})

```

and also your index.html file
```html
TODO
```




## Development
The easiest way to run the development is to use grunt and open your browser at [http://localhost:3000/demo](http://localhost:3000/demo):

```
npm install
./node_modules/.bin/bower install 
./node_modules/.bin/grunt serve
```

## Updates
When code is modified
* The bower version must be changed in the bower.json file. 
* The distribution files must be generated using: `./node_modules/.bin/grunt` 
* Commit and push your changes to git
* On the host module type: `bower update`. 

## custom builds
ng-cms is based around a main directive which generate a top level controller whose API can be accessed by sub directives
(plugins), if you don't need some of these, simply edit the Gruntfile (the pluginList variable) and run `grunt`

## Testing
We use Karma to ensure the quality of the code. The karma task will try to open Firefox and Chrome as browser in which to run the tests. Make sure this is available or change the configuration in karma.conf.js

## Versions
### v0.0.1 (master)
- intitial release

## License

angular CMS module is under GPL license:

> Copyright (C) 2014 evaleto@karibou.ch.
>
> Permission is hereby granted, free of charge, to any person
> obtaining a copy of this software and associated documentation files
> (the "Software"), to deal in the Software without restriction,
> including without limitation the rights to use, copy, modify, merge,
> publish, distribute, sublicense, and/or sell copies of the Software,
> and to permit persons to whom the Software is furnished to do so,
> subject to the following conditions:
>
> The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
> BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
> ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
> CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.
