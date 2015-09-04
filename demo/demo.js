(function (ng, undefined) {'use strict';
	angular.module('main', ['ngResource','ngCMS'])

	.config(function($routeProvider, $locationProvider, $provide) {
		// Use the bang prefix for Google ajax crawlability
		// https://developers.google.com/webmasters/ajax-crawling/docs/specification?csw=1


		// Hashbang in HTML5 Mode
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');

		$routeProvider
		    .when('/blog/:year?/:month?/:day?/:title?', {templateUrl: 'html/ng-cms.doc.html'})
		    .when('/docs/:article', {templateUrl: 'html/ng-cms.doc.html'})
	    	.otherwise({ redirectTo: '/' });
		
	});


	angular.module('main').run(function ($log,gitHubContent) {
  	$log.info("init githubdoc");
  	gitHubContent.initialize({
  		  zenEdit:false,
          root:'.', // specify the root of RDF entity routes
          githubRepo:'evaletolab/karibou-doc',
          githubToken:'0f067e48882f391a63d8c36b22b92ea806c39cad'
      });
	});

})(angular);
