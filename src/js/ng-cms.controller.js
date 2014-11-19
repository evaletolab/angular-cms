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

            var article = _.find(index.docArticles, {'slug': $routeParams.article});
            if (!article){
                return $location.path('404');
            }

            // Set the title of the page
            $document[0].title = 'Docs | ' + article.title;

            $scope.docArticle = article;
        });        
    }    
})(angular);
