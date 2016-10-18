

define([
    "jquery", "underscore", "backbone",

    "text!../html/lobby.html",
//    "facebook",

    "Game"
], function($, _, Backbone, tpl) {


    LobbyView = Backbone.View.extend({

        initialize: function() {
            this.$el.html(_.template(tpl));

            this.initUsername();

            //this.lobby = io.connect(window.location.protocol + '//' + window.location.hostname + ':3000/lobby');
            this.lobby = io.connect('/lobby');

            this.lobby.on('connect', _.bind(this.lobbyConnect, this));
            this.lobby.on('disconnect', _.bind(this.lobbyDisconnect, this));

            this.lobby.on('list-games', _.bind(this.onGamesList, this));

            this.lobby.on('create-game', _.bind(this.onGameCreate, this));

            this.lobby.on('get-game-param', _.bind(this.lauchGame, this));

//            fb.on("auth", _.bind(this.gotFacebookUser, this));
//            fb.on("not-logged", function() {
//                $("#facebook-login").show();
//            });

            var frame = 0;
            setInterval(function() {
                frame = (frame+1)%4;
                $("ul.character").attr("class", "character frame"+frame);
            }, 250);

        },

        events: {
            "click .character li": "selectCharacter",
            "click .game-mode": "startGame",
            "click .create-game-btn": "createGame",
        },

        selectCharacter: function(e) {
            $(".character li.selected").removeClass("selected");
            $(e.currentTarget).addClass("selected");
        },

        gotFacebookUser: function() {
            $("#facebook-login").fadeOut(500);

            $("#userpic").append($("<img/>").attr("src", window.location.protocol + "//graph.facebook.com/" + fb.uid + "/picture?type=square").fadeIn());
            $('#userid').val(fb.uname);
        },

        lobbyConnect: function(s) {
            console.log("lobby on!");
            this.listGames();
            this.timer = setInterval(_.bind(this.listGames, this), 2000);
        },

        lobbyDisconnect: function() {
            clearInterval(this.timer);
        },

        listGames: function() {
            this.lobby.emit("list-games");
        },

        onGamesList: function(games) {
            var gamesList = $('#games-list').empty();

            _.each(games, function(game, key) {
                var i = $(gameTemplate(game));
                i.data("game", key);
                gamesList.append(i);
            });
        },

        initUsername: function() {
            var $userid = $('#userid');

            var defaultUser = localStorage.getItem("userName");
            var chr = localStorage.getItem("character");

            if (defaultUser)
                $userid.val(defaultUser);

            if (!chr) {
                var chrs = $(".character-select li");
                var chrix = Math.floor(Math.random() * chrs.length);
                chrs.eq(chrix).addClass("selected");
            } else {
                $(".character-select li ." + chr).parent().addClass("selected");
            }

        },

        startGame: function(e) {
            this.currentTarget = e.currentTarget;
            var game = $(e.currentTarget).data("game");

            if ($('#userid').val().length==0) {
                alert("Please enter a name.");
                return;
            }

            this.lobby.emit("get-game-param", {
                game: game
            });
        },

        /*
        *
        */
        lauchGame:function(params){
            console.log('game params', params);

            var name = $('#userid').val();
            var game = $(this.currentTarget).data("game");
            var character = $(".character-select li.selected div").attr("class");

            localStorage.setItem("userName", name);
            localStorage.setItem("character", character);

            console.log("Joining " + game);

            $("#lobby").hide();
            $("#game").show();

            new Game({
                playerName: name,
                // fbuid: fb.uid,
                character: character,
                game: game,
                mapSize: params.mapSize,
                mapType: params.type,
                mode: params.mode
            });
        },

        /*
        * Create a new game on server
        */
        createGame: function(){
            var name = $('#name-map').val();
            var type = $('#type-map').val();
            var size = $('#size-map').val();
            var mode = $('#game-mode').val();


            console.log('create: ', type, size, mode);
            this.lobby.emit("create-game", {
                name: name,
                type: type,
                size: size,
                mode: mode
            });
        },

        /*
        *
        */
        onGameCreate:function(i){
            console.log('game creation success ?', i);
        },


    });

/*    var gameTemplate = _.template('<div class="game-mode <%= type %>">'+
                                    '<div class="counter"><%= count %></div>' +
                                    '<!-- <div class="map-size"><%= size %></div> -->' +
                                    '<div class="map-type <%= type %>"></div>' +
                                    '<div class="play">play</div>' +
                                '</div>)');*/

    var gameTemplate = _.template('<div class="game-mode">'+
	
									'<p class="title-game"><%= name %></p>'+

                                    '<div class="left-side">'+
                                        '<div class="map-type <%= type %>"></div>' +
                                        '<div class="counter"><%= count %> player<% if (count > 1) { %>s<% } %></div>' +
                                    '</div>' +

                                    '<div class="right-side">'+
                                        '<div class="label">Map:</div>' +
                                        '<div class="value"><%= type %> (<%= size %>)</div>' +
                                        '<br />' +
                                        '<div class="label">Mode:</div>' +
                                        '<div class="value"><%= mode %></div>' +
                                    '</div>' +
                                '</div>');

    var FBuid = -1;

});