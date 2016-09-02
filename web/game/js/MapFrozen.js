define([
    "jquery", "underscore", "backbone",

    "Map",
],function($, _, Backbone, core) {

	MapFrozen = Map.extend({

        getImgSource: function(){
            return {
            	tiles: 'res/frozen-tiles.png',
            	bombs: 'res/bombs.png',
            	flames: 'res/flames.png'
            }
        }
	});

});