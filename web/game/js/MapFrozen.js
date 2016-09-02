define([
    "jquery", "underscore", "backbone",

    "Map",
],function($, _, Backbone, core) {
    var LEFT = 37;
    var UP = 38;
    var RIGHT = 39;
    var DOWN = 40;
    var SPACE = 32;
	MapFrozen = Map.extend({


        getImgSource: function(){
            return {
            	tiles: 'res/frozen-tiles.png',
            	bombs: 'res/bombs.png',
            	flames: 'res/flames.png'
            }
        },

        getMove: function(keymap, speed, currentPosition) {
            if (!this._xSpeed) {
                this._xSpeed = 0;

            }
            if (!this._ySpeed) {
                this._ySpeed = 0;
            }

            var dx = 0;
            var dy = 0;
            if (keymap[LEFT]) {
                 dx-=speed;
                 this._xSpeed-=5;
            }  
            if (keymap[RIGHT]) {
                dx+=speed;
                this._xSpeed+=5;
            }  
            if (keymap[UP]) {
                dy-=speed;
                this._ySpeed-=5;
            }    
            if (keymap[DOWN]) {
                dy+=speed;
                this._ySpeed+=5;
            }   

            if (this._ySpeed > 100) {
                this._ySpeed = 100;
            }
            if (this._xSpeed > 100) {
                this._xSpeed = 100;
            }

            if (this._xSpeed < -100) {
                this._xSpeed = -100;
            }
            if (this._ySpeed < -100) {
                this._ySpeed = -100;
            }

        
            dx = (this._xSpeed * speed)/100;
            dy = (this._ySpeed * speed)/100;

            this._ySpeed *= 0.985;  // inertie
            this._xSpeed *= 0.985;

            var x = currentPosition.x;
            var y = currentPosition.y;

            var PLAYER_GIRTH = 0.35;

            var gx = Math.floor(x);
            var gy = Math.floor(y);
            var gtx = Math.floor(x + dx + util.dir(dx)*PLAYER_GIRTH );
            var gty = Math.floor(y + dy + util.dir(dy)*PLAYER_GIRTH );

            // can it move on X axis?
            if (!this.canMove( gx, gy, gtx, gy ) ) {
                dx = 0; // no x axis moving
                this._xSpeed = 0;
            }
            else {
                gx = Math.floor(x + dx);
            }

            if (!this.canMove( gx, gy, gx, gty ) ) {
                dy = 0; // no y axis moving
                this._ySpeed = 0;
            }

            if (dx < 0.01 && dx > -0.01) {
                dx = 0;
            }
            if (dy < 0.01 && dy > -0.01) {
                dy = 0;
            }
            return {dx: dx, dy: dy};
        }
	});

});