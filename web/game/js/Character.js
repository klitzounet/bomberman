

define([
    "jquery", "underscore", "backbone",

    "Sprite"
],function($, _, Backbone, core) {

    var ORIENT_DOWN = 0;
    var ORIENT_UP = 1;
    var ORIENT_RIGHT = 2;
    var ORIENT_LEFT = 3;


    Character = Sprite.extend({
        defaults: {
            name: '?',
            character: 'john',
            x: 0,
            y: 0,
            orient: ORIENT_DOWN,
            moving: false,
            dead: true,
            score: 0,

            speed: 5,   // default speed : 5 square per second
            maxSpeed: 25,
        },

        deltaMove: function(x, y) {
            this.set('x', this.get('x') + x);
            this.set('y', this.get('y') + y);

            if (x<0)
                this.set('orient', ORIENT_LEFT);
            else if (x>0)
                this.set('orient', ORIENT_RIGHT);
            else if (y<0)
                this.set('orient', ORIENT_UP);
            else if (y>0)
                this.set('orient', ORIENT_DOWN);
        },

        increaseSpeed: function () {
            if (this.get('speed') < this.get('maxSpeed')) {
                this.set('speed',  (this.get('speed') + 2));
            }
        },

        die: function(flame) {
            this.set('dead', true);
            this.trigger('die', flame);
            this.set('frame', 0);
        },

        sendMessage: function(msg) {
            this.set('chat', msg);
        }
    });

});