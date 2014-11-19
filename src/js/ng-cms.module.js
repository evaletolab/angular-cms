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
