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
                    mdSrc:'@',
                    markdownContent:'='
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
                        scope.$watch('markdownContent', function (md,sd) {
                          if(md||scope.markdownContent){
                            loadHtml(element,converter.render(md||scope.markdownContent))
                          }
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
