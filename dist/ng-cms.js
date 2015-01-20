(function (ng) {'use strict';
    var defaultSettings={
    	zenEdit:true,		// fullscreen edit on github
    	ttlCache:86400000,  // 24h
        root:'',
        githubRepo:'<user>/<repo>',
        githubApi:'https://api.github.com/repos/',
        githubToken:'2e36ce76cfb03358f0a38630007840e7cb432a24'
    }
    ng.module('ngCMS',['ngRoute']).constant('settings', angular.extend(defaultSettings,ngCMSSettings||{}));  
})(angular);

(function (ng, undefined) {'use strict';
    ng.module('ngCMS')
        .controller('CMSCtrl',CMSCtrl)
        .controller('ContentCtrl',ContentCtrl)


    //
    // github markdown docs
    //
    CMSCtrl.$inject=['$scope', '$rootScope', '$location', '$routeParams', '$document', '$sce', '$log','gitHubContent','settings']
    function CMSCtrl($scope, $rootScope, $location, $routeParams, $document, $sce, $log,gitHubContent,settings){
      console.log('settings - ctrl',settings)

        //
        // setup the scope
        $scope.settings=settings;

        // return true if a name (eg. the/path) is include in the path
        $scope.isActiveDoc=function(name){
            return $location.path()&&($location.path().indexOf(name||'-09roif')!==-1);
        }  

        // strip and build right href for RDF.elements 
        $scope.hrefBuild=function(uri){
            uri=uri.replace(':','');
            return (settings.root&&settings.root.length)?(settings.root+'/'+uri):uri
        }

        //  init help, load JSON help and Github docs content 
        $scope.initCMS=function(){
            gitHubContent.contentIndex().then(function(index) {
                $scope.docArticles = index.docArticles;
            });
        }   
    }


    //
    // prepare github markdown docs
    //
    ContentCtrl.$inject=['$scope','$location','$routeParams','$document','$log','gitHubContent','settings']
    function ContentCtrl($scope, $location, $routeParams, $document, $log, gitHubContent,settings){
        //
        // setup the scope
        $scope.article=$routeParams.article;

        //
        // update page title and get article defined in the path from the github index
        gitHubContent.contentIndex().then(function(index) {            
            if (!$routeParams.article) {
              return;
            }

            var article = gitHubContent.find($routeParams.article);
            if (!article){
                return $location.path('404');
            }

            // Set the title of the page
            $document[0].title = 'Docs | ' + article.title;

            $scope.docArticle = article;
        });        
    }    
})(angular);

(function (ng, _) { 'use strict';
    //
    // define factories
    //
    ng.module('ngCMS')
        .factory('localCache',localCache)
        .factory('gitHubContent', gitHubContent) 


    //
    // simple function to slugify string
    //
    function slugify(str) {
      str = str.replace(/^\s+|\s+$/g, ''); // trim
      str = str.toLowerCase();

      // remove accents, swap ñ for n, etc
      var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
      var to   = "aaaaaeeeeeiiiiooooouuuunc------";
      for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
      }

      str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

      return str;
    };        

    //
    // simple function to strLeftBack in javascript
    //
    String.prototype.strLeftBack=function(seperator)    {
        var pos=this.lastIndexOf(seperator);
        var result=this.substring(0,pos)
        return result;
    }


    //
    // factory localCache, keep external markdown in cache until settings.ttlCache
    //
    localCache.$inject=['$rootScope','$http','$q','$log','settings'];
    function localCache($rootScope, $http, $q, $log,settings) {

      function getKey(cacheKey){
        // if there's a TTL that's expired, flush this item
        var ttl = window.localStorage.getItem(cacheKey + 'cachettl');
        if ( ttl && ttl < +new Date() ){
          window.localStorage.removeItem( cacheKey );
          window.localStorage.removeItem( cacheKey + 'cachettl' );
          ttl = 'expired';
          return null
        }
        var value=window.localStorage.getItem(cacheKey)
        return  JSON.parse(value)
      }

      function setKey(cacheKey,value){
        try {
          window.localStorage.setItem( cacheKey, JSON.stringify(strdata) );
          window.localStorage.setItem( cacheKey + 'cachettl', +new Date() + settings.ttlCache );
        } catch (e) {
          window.localStorage.removeItem( cacheKey );
          window.localStorage.removeItem( cacheKey + 'cachettl' );
        }        
      }

      //
      //
      return{
        get:getKey,
        set:setKey
      }
    }

    //
    // factory gitHubContent, help to load markdown content from github
    //
    gitHubContent.$inject=['$rootScope','$http','$q','$log','settings'];
    function gitHubContent($rootScope, $http, $q, $log,settings) {
        var markdownRepo = settings.githubApi+settings.githubRepo;
        var githubToken='access_token='+settings.githubToken

        function buildIndexFromGitTree(tree) {
            var index = {
              blogPosts: [],
              docArticles: [],
              pages:[]
            };

            _.each(tree, function(node) {
              if (node.type === 'blob') {
                // Value of path is in format 'blog/yyyy/mm/dd/title.md'
                var path = node.path.split('/');
                //
                // load blogs
                if (path[0] === 'blog') {
                  // Strip off the .md extension
                  var title = path[4].strLeftBack('.');

                  // Use underscore.string to slugify the title
                  var titleSlug = slugify(title);

                  index.blogPosts.push({
                    // Build a JS date from '2014/07/05'
                    date: new Date(parseInt(path[1]), parseInt(path[2]) - 1, parseInt(path[3])),
                    title: title,
                    sha: node.sha,
                    gitPath: node.path,
                    titleSlug: titleSlug,
                    // Use underscore.string slugify function to get a URL safe
                    // reprensentation of the title
                    urlPath: settings.root+'/' + path.slice(0, 4).concat(titleSlug).join('/')
                  });
                }
                //
                // load docs
                // path is in the form docs/01-introduction.md
                else if (path[0] === 'docs') {
                  var titleParts = path[1].split('_');
                  var articleTitle = titleParts[1].strLeftBack('.');
                  var slug = slugify(articleTitle);

                  index.docArticles.push({
                    title: articleTitle,
                    slug: slug,
                    sequence: titleParts[0],
                    gitPath: node.path,
                    urlPath: settings.root+'/docs/' + slug
                  });
                }
                else if(path[0]==='pages'){
                  var pageTitle = path[1].strLeftBack('.');
                  var slug = slugify(pageTitle);

                  index.pages.push({
                    title: pageTitle,
                    slug: slug,
                    gitPath: node.path,
                    urlPath: settings.root+'/pages/' + slug
                  });
                }
              }
            });

            // Sort the blogPosts in reverse chronological order and doc articles
            // by the sequence prefix, i.e. 01, 02, etc.
            index.blogPosts = _.sortBy(index.blogPosts, 'date').reverse();
            index.docArticles = _.sortBy(index.docArticles, 'sequence');
            return index;
        }

        var contentIndexDeferred = $q.defer();
        var contentIndex;
        // caching markdown load
        var loads={}
        return {
            initialize: function(custom) {
              angular.extend(settings,custom)
              markdownRepo = settings.githubApi+settings.githubRepo;
              githubToken='access_token='+settings.githubToken

              // Go fetch the GitHub tree with references to our Markdown content blobs
              var apiUrl = markdownRepo + '/git/trees/master?recursive=1'+'&'+githubToken;

              // $http.get('/proxy?url=' + encodeURIComponent(apiUrl) + '&cache=1&ttl=600').success(function(data) {
              $http({method:'GET', url:apiUrl, withCredentials:false, cache:true}).success(function(data) {
                contentIndex = buildIndexFromGitTree(data.tree);
                $log.info("github index",contentIndex)
                contentIndexDeferred.resolve(contentIndex);
              }).error(function(err) {
                contentIndexDeferred.reject(err);
                $log.error("Error initializing content index", err);
              });
            },
            contentIndex: function() {
              return contentIndexDeferred.promise;
            },
            find:function(slug){
              // content is not ready
              if(!contentIndex)return '';
              var article = _.find(contentIndex.docArticles, {'slug':slug});
              if(article) return article;
              return _.find(contentIndex.pages, {'slug':slug});
            },
            loadSlug:function(slug){
              // article is in cache
              if(loads[slug])
                return loads[slug].promise;

              // content is not ready
              var self=this;
              // when content is ready
              return this.contentIndex().then(function(index){
                  var article = self.find(slug);
                  return self.load(article);
              });

            },
            load: function(object) {
              if(!object) return $q.when('');
              var apiUrl = markdownRepo+'/contents/'+object.gitPath+'?'+githubToken;
              var accept={'Accept':'application/vnd.github.VERSION.raw'}

              // if load promise exist return it
              if(loads[object.slug])
                return loads[object.slug].promise;
              loads[object.slug] = $q.defer();

              $log.debug("fetching markdown content", apiUrl);
              $http({method:'GET', url:apiUrl,headers:accept, withCredentials:false, cache:true})
                .success(function(content) {
                    $log.info('Content received ',content.length);
                  loads[object.slug].resolve(content);
                }).error(function(err) {
                  $log.error("Error returned from API proxy", err);
                  loads[object.slug].reject(err);
                });

              // Return a promise to the caller
              return loads[object.slug].promise;
            }
        };
    };


})(angular, _);

(function (ng, undefined) {'use strict';
    ng.module('ngCMS')
        .directive('cmsToc', [function () {
            return {
                restrict: 'E',
                transclude: true,
                templateUrl: 'html/ng-cms.toc.html',
                link: function (scope, element, attr, ctrl) {
                }
            };
        }])

        //
        // different way to display markdown content:
        //  - from any URL
        //  - from github repository
        //  - from dynamic content
        //  - from static content
        .directive("markdown", ['$compile', '$http', '$parse', '$sce','gitHubContent', 
          function ($compile, $http, $parse, $sce, gitHubContent) {
            //
            // load markdown converter
            // console.log('extensions',Object.keys(window.Showdown.extensions))
            // var converter = new Showdown.converter({ extensions: ['table','github'] });
            var converter = new Remarkable();
            //
            // insert html in element and perform some UI tweaks 
            function loadHtml(element, html){
                try{element.html(html)}catch(e){}

                // Apply the table class on all table elements. This will
                // provide the bootstrap styling for tables.
                element.find('table').addClass('table table-bordered');

                // Find all anchors whose href is an absolute url
                angular.forEach(element.find("a"), function(link) {
                    link = angular.element(link);
                    if (/^http[s]?\:\/\//.test(link.attr('href'))) {
                      link.addClass('external');
                      link.attr('target', "external");
                    }
                });
            }
            return {
                restrict: 'E',
                scope:{
                    mdSrc:'@'
                },
                replace: true,
                link: function (scope, element, attrs) {
                    var opts=$parse(attrs.markdownOpts||{})
                    //
                    // load markdown file from any URL
                    if (attrs.mdSrc) {
                        attrs.$observe('mdSrc', function(mdSrc,a){
                            $http.get(attrs.mdSrc).then(function(data) {
                                element.html(converter.render(data.data));
                            },function(data){
                                //
                                // silently quit on error 
                                if(opts.silent){
                                    return element.hide();
                                }
                                element.html(data)
                            });

                        });

                        //
                        // convert markdown from attribut 
                    } else if (attrs.markdownContent){                        
                        attrs.$observe('markdownContent', function(md) {
                            loadHtml(element,converter.render(md))
                        });

                        //
                        // load markdown file from gihub repository
                    } else if(attrs.markdownSlug){
                        attrs.$observe('markdownSlug', function(markdownSlug){
                            if(!markdownSlug)return;
                            gitHubContent.loadSlug(markdownSlug).then(function(content) {
                              loadHtml(element,$sce.trustAsHtml(converter.render(content)).toString());
                            });
                        })                        
                    } else {
                        //
                        // else convert markdown from static text
                        element.html(converter.render(element.text()));
                    }

                }
            };
        }])

        //
        // edit on github on click 
        .directive('editMarkdown', ['gitHubContent','settings',function (gitHubContent, settings) {
            var github='http://github.com/',opts='';
            return {
                restrict: 'A',
                link: function (scope, element, attr, ctrl) {
                    element.click(function(){
                        if(settings.zenEdit)opts='#fullscreen_blob_contents';                        
                        gitHubContent.contentIndex().then(function(index) {            
                            var article = gitHubContent.find(attr.editMarkdown);            
                            window.location.href=github+settings.githubRepo+'/edit/master/'+article.gitPath+opts
                        });                        
                    })
                }
            };
        }])




})(angular);

angular.module('ngCMS').run(['$templateCache', function ($templateCache) {
	$templateCache.put('html/ng-cms.doc.html', '<div ng-controller="ContentCtrl"> <markdown markdown-slug="{{article}}"></markdown> <div class="clearfix"> <hr/> <button class="btn btn-primary pull-right btn-xs" edit-markdown="{{article}}">Improve this page</button> </div> </div>');
}]);