var AssetMng = Fire.Class({
    extends: Fire.Behavior,
    properties: {
        fighterAtlasAsset: {
            default: "",
            url: Runtime.SpriteAtlas
        },
        fighterAtlasTex: {
            default: "",
            url: Fire.Texture
        },
        fxAtlasAsset: {
            default: "",
            url: Runtime.SpriteAtlas
        },
        fxAtlasTex: {
            default: "",
            url: Fire.Texture
        },
        fighterJson: {
            default: "",
            url: Fire.RawAsset
        },
        levelJson: {
            default: "",
            url: Fire.RawAsset
        }
    },
    init: function(cb) {
        AssetMng.instance = this;
        this.fighterDB = {};
        this.levelDB = {};
        this._loadJson(cb);
        if (this.fighterAtlasAsset) {
            cc.spriteFrameCache.addSpriteFrames(this.fighterAtlasAsset);
        }
        if (this.fxAtlasAsset) {
            cc.spriteFrameCache.addSpriteFrames(this.fxAtlasAsset);
        }
    },
    _loadJson: function(cb) {
        var count = 2;
        cc.loader.loadJson(this.fighterJson, function(error, data){
            for (var i = 0; i < data.length; ++i) {
                if (data[i].id === "") break;
                this.fighterDB[data[i].id] = data[i];
            }
            if (--count <= 0) {
                cb();
            }
        }.bind(this));
        cc.loader.loadJson(this.levelJson, function(error, data){
            for (var i = 0; i < data.length; ++i) {
                if (data[i].levelID === "") break;
                this.levelDB[data[i].levelID] = data[i];
            }
            if (--count <= 0) {
                cb();
            }
        }.bind(this));
    },
    getFighterInfo: function (id) {
        return this.fighterDB[id];
    },
    getLevelInfo: function(id) {
        return this.levelDB[id];
    },
    getLevelEnemyInfo: function(levelID, enemyIndex) {
        var level = this.getLevelInfo(levelID);
        var enemyID = level['enemy' + (enemyIndex + 1).toString()];
        return this.getFighterInfo(enemyID);
    },
    getLevelModifier: function(levelID) {
        var level = this.getLevelInfo(levelID);
        return { hpMod: +level.hpMod, atkMod: +level.atkMod };
    }
});
