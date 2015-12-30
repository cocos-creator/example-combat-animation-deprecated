var Globals = require('Globals');
var Game = Fire.Class({
    extends: Fire.Behavior,
    properties: {
        assetMng: {
            default: null,
            type: cc.Node
        },
        timeline: {
            default: null,
            type: cc.Node
        },
        battleMng: {
            default: null,
            type: cc.Node
        },
        fxMng: {
            default: null,
            type: cc.Node
        },
        audioMng: {
            default: null,
            type: cc.Node
        },
        loading: {
            default: null,
            type: cc.Node
        },
        levelID: "",
        player1: "",
        player2: "",
        player3: "",
        cheat: false
    },
    onLoad: function() {
        Game.instance = this;
        cc.director.setDisplayStats(true);
        // cc.game.setFrameRate(45);
        this.loading.init();
        this.assetMng.init(this.initModules.bind(this));
    },
    initModules: function() {
        var levelID = Globals.getCurrentLevel() || this.levelID;
        var levelInfo = this.assetMng.getLevelInfo(levelID);

        this.loading.showLevelName(levelInfo.name);
        this.battleMng.init({
            level: levelID,
            players: [
                this.player1,
                this.player2,
                this.player3
            ]
        });
        // initialization
        this.timeline.init(this.battleMng.fighters, this.battleMng);
        this.fxMng.init();
        // fade in
        this.loading.ready();
    },
    victory: function() {
        this.loading.showResult(true);
        this._loadMenu();
    },
    defeat: function() {
        this.loading.showResult(false);
        this._loadMenu();
    },
    _loadMenu: function() {
        setTimeout(function() {
            Fire.engine.loadScene( 'menu' );
        }, 2000);
    }

});
