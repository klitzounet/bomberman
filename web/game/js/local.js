



define([
    "jquery", "underscore", "backbone",
],function($, _, Backbone, core) {

	// consts
    var LEFT = 37;
    var UP = 38;
    var RIGHT = 39;
    var DOWN = 40;
    var SPACE = 32;

    //var PLAYER_MOVE_SPEED = 5; // moved to Character.speed
    var PLAYER_MAX_SPEED = 0.9;

    var keymap = {}; // it's ok to be global

    var inChat = false;

    LocalManager = Backbone.Model.extend({
        defaults: {
        },

        initialize: function(opt) {
            this.$document = opt.document;
            this.world = opt.world;
            this.network = opt.network;

            this.me = this.world.player;

            this.$console = $("#console");
            this.$chatbox = $("#chatbox");
            this.$chatbox.keyup(_.throttle(_.bind(function() {
                if (this.$chatbox.val().length>0)
                this.world.player.sendMessage(this.$chatbox.val()+"...");
            }, this),50));

            // keyboard handlers
            this.$document.keydown($.proxy(this.onKeyDown, this));
            this.$document.keyup($.proxy(this.onKeyUp, this));
        },

        onKeyDown: function(e) {
            if (!inChat) {
                keymap[e.keyCode] = true;

                e.stopImmediatePropagation();
                e.preventDefault();
            }

            if (e.keyCode == 13) {
                if (this.$chatbox.is(":focus")) {
                    this.$chatbox.blur();
                    this.$console.animate({
                        'height': 'toggle',
                        'margin-bottom': 'toggle'
                    }, 200);
                    this.network.sendChat(this.$chatbox.val());
                    this.$chatbox.val("");
                    inChat = false;
                } else {
                    this.$console.animate({
                        'height': 'toggle',
                        'margin-bottom': 'toggle'
                    }, 200);
                    this.$chatbox.focus();
                    inChat = true;
                }
            }
        },

        onKeyUp: function(e) {
            keymap[e.keyCode] = false;
        },

        update: function(delta) {
            if (this.me.get('dead')) return;

            var speed = delta * this.me.get('speed');
            if (speed > PLAYER_MAX_SPEED) speed = PLAYER_MAX_SPEED;

            var currentPosition = {
                x: this.me.get('x'),
                y: this.me.get('y')
            };
            
            var moveResult = this.world.map.getMove(keymap, speed, currentPosition);
            var dx = moveResult.dx;
            var dy = moveResult.dy;
          
            if (this.me.get('invertDirections') ) {
                dx = -dx;
                dy = -dy;
            }
            var moving = (dx !== 0 || dy !== 0);
            //var moving = true;//((dx <= -0.005 && dx >= 0.005) || (dy <= -0.005 && dy >= 0.005) || keymap[LEFT] || keymap[RIGHT] || keymap[UP] || keymap[DOWN]);
            //var moving = keymap[LEFT] || keymap[RIGHT] || keymap[UP] || keymap[DOWN];

            if (moving)
                this.requestMove(dx, dy);

            if (keymap[SPACE])
                this.tryPlaceBomb();

            this.me.set('moving', moving===true);
  
            var bonusToRemove = null;
            this.world.bonus.each(_.bind(function(iBonus) {
                var bonus = iBonus;
                if (bonus.get('x') === Math.floor(this.me.get('x')) && 
                    bonus.get('y') === Math.floor(this.me.get('y')) ) {
                        // user get bonus
                        this.userGetBonus(bonus);
                        // remove bonus
                        bonusToRemove = bonus;
                }
            }, this));

            if (bonusToRemove) {
                this.world.onBonusRemoved(bonusToRemove);
            }
            

            var cx = Math.floor(this.me.get('x'));
            var cy = Math.floor(this.me.get('y'));

            var flame = this.world.map.getFlame(cx, cy);
            if (flame!=null) {
                this.me.die(flame);
                play('die');
            }
        },

        userGetBonus: function (iBonus) {
            switch(iBonus.get('type')) {
                case 'speed':
                    this.me.increaseSpeed();
                    break;
                 case 'flame':
                    this.me.increaseBombStrength();
                    break;
                case 'bomb':
                     this.me.increaseMaxPlacedBombs();
                break;
                case 'death':
                    this.handleMalus();
                break;
                default:
                    break;
            }
        },


        handleMalus: function () {

            var rand = Math.floor(Math.random() * (3)); // random between 0 and N
            var timer = 0;
            var endOfMalusTimer = 8000; // 8 seconds

            switch(rand) {
                case 0:
                    // maximal speeeed !
                    this.me.set('speed', 30);
                    setTimeout(function() {
                        this.me.set('speed', 5);
                    }.bind(this), endOfMalusTimer);
                    break;
                case 1:
                    // slowness
                    this.me.set('speed', 2);
                    setTimeout(function() {
                        this.me.set('speed', 5);
                    }.bind(this), endOfMalusTimer);
                    break;
                case 2:
                    // invert directions
                    this.me.set('invertDirections', true);
                    setTimeout(function() {
                        this.me.set('invertDirections', false);
                    }.bind(this), endOfMalusTimer);
                    break;
                default:
                    break;
            }

        },

        tryPlaceBomb: function() {
            var x = Math.floor(this.me.get('x'));
            var y = Math.floor(this.me.get('y'));
            var strength = this.me.get('bombStrength');

            if (this.world.map.getBomb(x, y) == null && this.me.get('placedBombs') < this.me.get('maxPlacedBombs')) {
                this.world.placeBomb(x, y, strength);
                this.me.set('placedBombs',  this.me.get('placedBombs') + 1);
            }
        },

        requestMove: function(dx, dy) {
            var x = this.me.get('x');
            var y = this.me.get('y');

            var PLAYER_GIRTH = 0.35;

            var gx = Math.floor(x);
            var gy = Math.floor(y);
            var gtx = Math.floor(x + dx + util.dir(dx)*PLAYER_GIRTH );
            var gty = Math.floor(y + dy + util.dir(dy)*PLAYER_GIRTH );

            // can it move on X axis?
            if (!this.world.map.canMove( gx, gy, gtx, gy ) )
                dx = 0; // no x axis moving
            else {
                gx = Math.floor(x + dx);
            }

            if (!this.world.map.canMove( gx, gy, gx, gty ) )
                dy = 0; // no y axis moving

            this.me.deltaMove(dx, dy);
        }


    });

    util = {};
    util.dir = function(x) { return x>0 ? 1 : x<0 ? -1 : 0 }
    util.ease = function(x, y, c) {
        return x*(1-c) + y*c;
    }


});