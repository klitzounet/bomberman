define([
    "jquery", "underscore", "backbone",

    "Map",
    "MapFrozen",
],function($, _, Backbone, core) {

	MapFactory = Backbone.Model.extend({

        initialize: function() {

        },

		createMap:function(type, options){
			switch (type){
				case 'default':
				default :
					return new Map(options);

				case 'frozen': 
					return new MapFrozen(options);
			}
		}
	});

});