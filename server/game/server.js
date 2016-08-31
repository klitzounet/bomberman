

TILE_EMPTY = 0;
TILE_BRICK = 1;
TILE_SOLID = 2;


SPAWNING_TIME = 5000;


_ = require('underscore')._;
Backbone = require('backbone');

var redis;

require('./map.js');
require('./game.js');
require('./model.js');
require("./player.js");


var Server = Backbone.Model.extend({

    initialize: function(opt) {
        io = opt.io;
        redis = opt.redis;

        //global.counters.players = 0;
        global.counters.mapfill = 0;
        games = [];

        if (redis) {
            redis.incr("counters.restarts");
            redis.set("stats.last-start-time", (new Date()).getTime());
        }

        io.set('log level', 1);

        //this._createNewGame();

        this.lobby = io.of('/lobby');
        this.lobby.on('connection', _.bind(this.lobbyConnection, this));
    },


    /*
    * Create a new game
    */
    _createNewGame:function(opt){
        opt = opt || {};

        var game = new Game({
            redis: redis,
            type: opt.type || 'free',
            mode: opt.mode || 'timeless',
            size: opt.size || 'm',
            title: 'game' + games.length
        });

        game.bombs.on('remove',  _.bind(this.onBombRemoved, this, game));
        game.on('score-changes', _.debounce(_.bind(this.notifyScoreUpdates, this, game), 50), this);

        game.countersPlayer = 0;

        var endpoint = io.of('/game' + games.length);
        game.endpoint = endpoint;
        endpoint.on('connection', _.bind(this.connection, this, game));

        games.push(game);
    },

    /*
    * Delete game from games
    */
    _deleteGame:function(gameTitle){
        for(var i=0;i<games.length;i++){
            if(games[i].title === gameTitle){
                var toDelete = games[i];

                //to do: disconnect all players and close endpoint (io namespace)
                //toDelete.endpoint

                games.splice(i, 1);
            }
        }
    },

    lobbyConnection: function(socket) {
        socket.on('list-games', _.bind(function(d) {

            var gamesList = {};

            for(var i=0;i<games.length;i++){
                gamesList[games[i].title] = {
                    type: games[i].type,
                    count: games[i].countersPlayer,
                    size: games[i].size
                }
            }

            socket.emit("list-games", gamesList);
        }, this));



        socket.on('create-game', _.bind(function(d) {
            d = d || {};

            console.log('create new game :', d);

            this._createNewGame({
                type: d.type || 'free',
                size: d.size || 'regular',
                mode: d.mode || 'timeless'
            });

            socket.emit("create-game", {
                "response": "game created"
            });
        }, this));



        socket.on('get-game-param', _.bind(function(d) {
            d = d || {};

            console.log('someone aks params of ', d.game);

            var params = {};

            for(var i=0;i<games.length;i++){
                if(games[i].title === d.game){
                    params['type'] = games[i].type;
                    params['mode'] = games[i].mode;
                    params['mapSize'] = {
                        w: games[i].map.getMap().w,
                        h: games[i].map.getMap().h
                    };
                }
            }

            socket.emit("get-game-param", params);
        }, this));

    },

    connection: function(game, socket) {
        game.countersPlayer++;

        // generate id
        var playerId = game.generatePlayerId();

        // send game info
        socket.emit('game-info', {
            game:"demo1",
            ver: 1,
            your_id: playerId
        });

        // wait for join
        socket.on('join', _.bind(function(d) {
            var name = d.name;

            if (redis)
                redis.incr("counters.joined-players");

            // create new player
            var me = new Player({
                id: playerId,
                name: d.name,
                character: d.character,
                fbuid: d.fbuid
            });
            game.playersById[playerId] = me;

            // setup a player controller
            var ctrl = new PlayerController({
                id: playerId,
                player: me,
                game: game, // TODO joined game
                socket: socket,
                endpoint: game.endpoint
            });
            game.ctrlsById[playerId] = ctrl;

            ctrl.on('disconnect', _.bind(function(game) {
                delete game.playersById[playerId];
                delete game.ctrlsById[playerId];


                // FIXME D.R.Y.
                _.each(game.ctrlsById, function(ctrl, id) {
                    if (id == playerId) return;
                    ctrl.notifyFriendBattles();
                });

                game.countersPlayer--;
            }, this, game));

            console.log("+ " + name + " joined the game " + d.fbuid);

            // notify everyone about my join
            socket.broadcast.emit('player-joined', me.getInitialInfo());

            // update me about the current game state
            ctrl.notifyGameState();

            _.each(game.ctrlsById, function(ctrl, id) {
                if (id == playerId) return;
                ctrl.notifyFriendBattles();
            });
        }, this));

    },

    onBombRemoved: function(game, b) {
        game.endpoint.emit('bomb-boomed', {
            x: b.get('x'),
            y: b.get('y'),
            strength: b.get('strength')
        });
    },

    notifyScoreUpdates: function(game) {
        var scoring = {};
        _.each(game.playersById, function(p,id) {
            scoring[id] = p.get('score');
        });

        game.endpoint.emit('score-updates', scoring);
    }


});



module.exports = Server;