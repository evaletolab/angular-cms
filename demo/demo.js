(function (ng, undefined) {'use strict';
	angular.module('main', ['ngResource','ngRoute','ngCMS'])

	.config(function($routeProvider, $locationProvider, $provide) {
		// Use the bang prefix for Google ajax crawlability
		// https://developers.google.com/webmasters/ajax-crawling/docs/specification?csw=1


		// Hashbang in HTML5 Mode
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');

		$routeProvider
		    .when('/mixing', {templateUrl: 'mixing.html'})		
		    .when('/blog/:year?/:month?/:day?/:title?', {templateUrl: 'html/ng-cms.doc.html'})
		    .when('/docs/:article', {templateUrl: 'html/ng-cms.doc.html'})
	    	.otherwise({ redirectTo: '/' });
		
	});


	angular.module('main').run(function ($log,gitHubContent) {
	var token=['51722f4e920fe0864c','1623779d2726b84d0661d5'].join('');
  	$log.info("init githubdoc");
  	gitHubContent.initialize({
  		  zenEdit:false,
          root:'.', // specify the root of RDF entity routes
          githubRepo:'aerobatic/markdown-content',
          githubToken:token
      });
	});

})(angular);
