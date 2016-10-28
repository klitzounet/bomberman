define([
    "jquery", "underscore", "backbone",

    "Map",
],function($, _, Backbone, core) {
    var LEFT = 37;
    var UP = 38;
    var RIGHT = 39;
    var DOWN = 40;
    var SPACE = 32;
	MapJungle = Map.extend({


        getImgSource: function(){
            return {
            	tiles: 'res/jungle-tiles.png',
            	bombs: 'res/bombs.png',
            	flames: 'res/flames.png'
            }
        },
		
		drawMap: function (canvasCtx) {
			if (!this._canvas) {
				this._createCanvas(canvasCtx);
			}
			console.log("draw");
		},
		
		unload: function () {
			// TODO remove canvas
		},
		
		_createCanvas: function (canvasCtx) {
			this._imgLoaded = false;
			
			var sizeWidth = canvasCtx.canvas.width;
			var sizeHeight = canvasCtx.canvas.height;
			
			this._canvas = document.createElement('canvas');
			this._canvas.id = "CanvasJungle"+ Date.now();
			this._canvas.width = sizeWidth;
			this._canvas.height = sizeHeight;
			this._canvas.style.zIndex = 100;
			this._canvas.style.position = "absolute";

			// center canvas in page
			this._canvas.style.left = "calc(50% - " + (sizeWidth / 2) + "px)";
			this._canvas.style.top = "calc(50% - " + (sizeHeight / 2) + "px)";

			this._context = this._canvas.getContext("2d");
			document.getElementById('view').appendChild(this._canvas);
			
			
			var nbOfTrees = parseInt((sizeWidth + sizeHeight) / 250);
			if (nbOfTrees > 5) {
				nbOfTrees = 5;
			}
			
			var that = this;
			this._img = new Image();
			this._img.onload = function() {
				that._imgLoaded = true;
				
				if (nbOfTrees === 1) {
					that._context.drawImage(that._img, (sizeWidth/2) - (that._img.width/2) , (sizeHeight/2) - (that._img.width/2));
				}
				else if (nbOfTrees === 2) {
					that._context.drawImage(that._img, (sizeWidth/4) - (that._img.width/2) , (sizeHeight/4) - (that._img.width/2));
					that._context.drawImage(that._img, (3*sizeWidth/4) - (that._img.width/2) , (3*sizeHeight/4) - (that._img.width/2));
				}
				else if (nbOfTrees === 3) {
					that._context.drawImage(that._img, (sizeWidth/4) - (that._img.width/2) , (sizeHeight/4) - (that._img.width/2));
					that._context.drawImage(that._img, (sizeWidth/2) - (that._img.width/2) , (sizeHeight/2) - (that._img.width/2));
					that._context.drawImage(that._img, (3*sizeWidth/4) - (that._img.width/2) , (3*sizeHeight/4) - (that._img.width/2));
				}
				else if (nbOfTrees === 4) {
					that._context.drawImage(that._img, (sizeWidth/4) - (that._img.width/2) , (sizeHeight/4) - (that._img.width/2));
					that._context.drawImage(that._img, (sizeWidth/4) - (that._img.width/2) , (3*sizeHeight/4) - (that._img.width/2));
					that._context.drawImage(that._img, (3*sizeWidth/4) - (that._img.width/2) , (sizeHeight/4) - (that._img.width/2));
					that._context.drawImage(that._img, (3*sizeWidth/4) - (that._img.width/2) , (3*sizeHeight/4) - (that._img.width/2));
				}
				else {
					that._context.drawImage(that._img, (sizeWidth/4) - (that._img.width/2) , (sizeHeight/4) - (that._img.width/2));
					that._context.drawImage(that._img, (sizeWidth/4) - (that._img.width/2) , (3*sizeHeight/4) - (that._img.width/2));
					that._context.drawImage(that._img, (sizeWidth/2) - (that._img.width/2) , (sizeHeight/2) - (that._img.width/2));
					that._context.drawImage(that._img, (3*sizeWidth/4) - (that._img.width/2) , (sizeHeight/4) - (that._img.width/2));
					that._context.drawImage(that._img, (3*sizeWidth/4) - (that._img.width/2) , (3*sizeHeight/4) - (that._img.width/2));
				}
				
				
          	};
          	this._img.src = "res/tree.png";
			
		}

	});

});