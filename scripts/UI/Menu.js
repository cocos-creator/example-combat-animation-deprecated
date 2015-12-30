var Globals = require('Globals');
var Menu = Fire.Class({
    extends: Fire.Behavior,
    properties: {
        btnTemplate: {
            default: null,
            type: cc.Node
        },
        assetMng: {
            default: null,
            type: cc.Node
        },
        loading: {
            default: null,
            type: cc.Node
        }
    },
    onLoad: function() {
        this.loading.init();
        this.assetMng.init(this._initButtons.bind(this));
    },
    _initButtons: function() {
        // initialization
        var levels = this.assetMng.levelDB;
        for (var levelID in levels) {
            var btn = Fire.instantiate(this.btnTemplate);
            btn.initialize(this, levels[levelID]);
            this.addChild(btn);
        }
        // fade in
        this.loading.ready();
    },
    loadLevel: function(levelInfo) {
        this.loading.fadeIn();
        Globals.setCurrentLevel(levelInfo.levelID);
        Fire.engine.loadScene( 'combat' );
    }
});
