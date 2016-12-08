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
                  var articleTitle = titleParts[(titleParts.length>1)?1:0].strLeftBack('.');
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
              $http({method:'GET', url:apiUrl, withCredentials:false, cache:true}).then(function(result) {
                contentIndex = buildIndexFromGitTree(result.data.tree);
                $log.info("github index",contentIndex)
                contentIndexDeferred.resolve(contentIndex);
              },function(err) {
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
                .then(function(result) {
                    $log.info('Content received ',result.data.length);
                  loads[object.slug].resolve(result.data);
                },function(err) {
                  $log.error("Error returned from API proxy", err);
                  loads[object.slug].reject(err);
                });

              // Return a promise to the caller
              return loads[object.slug].promise;
            }
        };
    };


})(angular, _);
