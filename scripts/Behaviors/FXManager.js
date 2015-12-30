var Animation = require('Animation');
var Game = require('Game');
// var AnimData = Fire.Class({
//     name: 'AnimData',
//     properties: {
//         name: "",
//         count: 0,
//         startIdx: 0,
//         delay: 0.05
//     }
// });
var FXType = Fire.defineEnum({
    Blood  : -1,
    HitNormal: -1,
    HitPerfect: -1,
    Block: -1,
    CoinHit   : -1,
    CoinPerfect : -1,
    Dust   : -1,
    TextMiss: -1,
    TextNormal: -1,
    TextGood: -1,
    TextPerfect: -1
});

var animData = [
    {
        name: "blood_splash_",
        count: 3,
        startIdx: 1,
        delay: 0.05
    },
    {
        name: "hit_normal_0",
        count: 4,
        startIdx: 1,
        delay: 0.05
    },
    {
        name: "hit_0",
        count: 4,
        startIdx: 1,
        delay: 0.05
    },
    {
        name: "block_0",
        count: 2,
        startIdx: 1,
        delay: 0.15
    },
    {
        name: "coin_gather_",
        count: 3,
        startIdx: 1,
        delay: 0.07
    },
    {
        name: "perfect_0",
        count: 6,
        startIdx: 1,
        delay: 0.05
    },
    {
        name: "fog_0",
        count: 7,
        startIdx: 1,
        delay: 0.1
    }
];

var getAnimInfo = function(fxType) {
    return animData[fxType];
};

var DustFX = cc.Sprite.extend({
    ctor: function(parent) {
        var texStr = '#fog_01.png';
        this._super(texStr);
        parent.addChild(this);
        var nameStr = 'fx_dust';
        this.setName(nameStr);
        var animInfo = getAnimInfo(FXType.Dust);
        this.animAction = Animation.createAnimAction(animInfo);
        // retain
        this.animAction.retain();
        Fire.engine.once('pre-launch-scene', function () {
            this.animAction.release();
        }.bind(this));

        var callback = cc.callFunc(this.onPlayEnd, this);
        this.runAction( cc.sequence(this.animAction, callback) );
    },
    newAnim: function() {
        var callback = cc.callFunc(this.onPlayEnd, this);
        this.runAction( cc.sequence(this.animAction, callback) );
    },
    onPlayEnd: function() {
        this.removeFromParent();
        cc.pool.putInPool(this);
    }
});

var AnimateFX = cc.Sprite.extend({
    ctor: function(parent, type) {
        var animInfo = getAnimInfo(type);
        var texStr = '#' + animInfo.name + animInfo.startIdx.toString() + '.png';
        this._super(texStr);
        AnimateFX.fxID ++;
        this.fxID = AnimateFX.fxID;
        parent.addChild(this);
        var nameStr = 'fx_' + FXType[type] + this.fxID;
        this.setName(nameStr);
        var animAction = Animation.createAnimAction(animInfo);
        var callback = cc.callFunc(this.onPlayEnd, this);
        this.runAction( cc.sequence(animAction, callback) );
    },
    newAnim: function(type) {
        var animAction = Animation.createAnimAction(getAnimInfo(type));
        var callback = cc.callFunc(this.onPlayEnd, this);
        this.runAction( cc.sequence(animAction, callback) );
    },
    // unuse: function() {
    //     this.removeFromParent();
    // },
    onPlayEnd: function() {
        this.removeFromParent();
        cc.pool.putInPool(this);
    }
});
AnimateFX.fxID = 0;

var SimpleFX = cc.Sprite.extend({
    ctor: function(parent, texture, type) {
        // create sprite
        this._super(texture);
        SimpleFX.fxID ++;
        this.fxID = SimpleFX.fxID;
        parent.addChild(this);
        var nameStr = 'fx_' + FXType[type] + this.fxID;
        this.setName(nameStr);
        // actions
        this.actionFadeIn = cc.fadeIn(0.2);
        var actionPopNormal = cc.sequence(cc.scaleTo(0.2, 1.2).easing(cc.easeBackOut()), cc.scaleTo(0.2, 1).easing(cc.easeBackOut()));
        var actionPopBig = cc.sequence(cc.scaleTo(0.2, 1.5).easing(cc.easeBackOut()), cc.scaleTo(0.2, 1).easing(cc.easeBackOut()));
        var actionDrop = cc.moveBy(0.2, cc.p(0, 60));
        var actionFadeOut = cc.fadeOut(0.2);
        var popAction = null;
        if (type === FXType.TextPerfect) {
            popAction = actionPopBig;
        } else {
            popAction = actionPopNormal;
        }

        this.runAction( this.actionFadeIn );
        var callback = cc.callFunc(this.onPlayEnd, this);
        this.popSeq = cc.sequence(popAction, actionDrop, actionFadeOut, callback );
        this.runAction( this.popSeq );

        // retain
        this.actionFadeIn.retain();
        Fire.engine.once('pre-launch-scene', function () {
            this.actionFadeIn.release();
        }.bind(this));

    },
    newTexure: function(texture) {
        this.setSpriteFrame(texture);
        var callback = cc.callFunc(this.onPlayEnd, this);
        this.runAction( this.actionFadeIn );
        this.runAction( this.popSeq );
    },
    // unuse: function() {
    // },
    onPlayEnd: function() {
        this.removeFromParent();
        cc.pool.putInPool(this);
    }
});
SimpleFX.fxID = 0;

var FXManager = Fire.Class({
    extends: Fire.Behavior,
    properties: {
        batchNode: {
            default: null,
            type: cc.Node
        },
        textFXTemplate: {
            default: null,
            type: cc.Node
        }
    },
    statics: {
        FXType: FXType,
        getAnimInfo: getAnimInfo
    },
    init: function() {
        FXManager.instance = this;
        // textFX list
        this.textFXList = [];
    },
    playTextFX: function(pos, hitState, isEnemy) { // if displaying attack modifier "atk+xx%" or damage number
        var textFX;
        for (var i = 0; i < this.textFXList.length; ++i) {
            textFX = this.textFXList[i];
            if (textFX.isPlaying === false) {
                textFX.setPosition(pos);
                textFX.playTextFX(hitState, isEnemy);
                return textFX;
            }
        }
        textFX = Fire.instantiate(this.textFXTemplate);
        this.addChild(textFX);
        textFX.setPosition(pos);
        textFX.initTextFX();
        textFX.playTextFX(hitState, isEnemy);
        this.textFXList.push(textFX);
        return textFX;
    },
    playTextDmg: function(pos, dmg) {
        var textFX;
        for (var i = 0; i < this.textFXList.length; ++i) {
            textFX = this.textFXList[i];
            if (textFX.isPlaying === false) {
                textFX.setPosition(pos);
                textFX.playTextDmg(dmg);
                return textFX;
            }
        }
        textFX = Fire.instantiate(this.textFXTemplate);
        this.addChild(textFX);
        textFX.setPosition(pos);
        textFX.initTextFX();
        textFX.playTextDmg(dmg);
        this.textFXList.push(textFX);
        return textFX;
    },
    _spawnFX: function(parent, type) {
        if (cc.pool.hasObject(AnimateFX)) {
            fx = cc.pool.getFromPool(AnimateFX);
            fx.newAnim(type);
            parent.addChild(fx);
            return fx;
        } else {
            fx = new AnimateFX(parent, type);
            return fx;
        }
    },
    _spawnDustFX: function(parent) {
        if (cc.pool.hasObject(DustFX)) {
            fx = cc.pool.getFromPool(DustFX);
            fx.newAnim();
            parent.addChild(fx);
            return fx;
        } else {
            fx = new DustFX(parent);
            return fx;
        }
    },
    _spawnSimpleFX: function(parent, texture, type) {
        if (cc.pool.hasObject(SimpleFX)) {
            fx = cc.pool.getFromPool(SimpleFX);
            parent.addChild(fx);
            fx.newTexure(texture);
            return fx;
        } else {
            fx = new SimpleFX(parent, '#'+texture, type);
            return fx;
        }
    },
    playFX: function(pos, type, scaleX, parent) {
        var p = parent || this.batchNode;
        var fx;
        if (type === FXType.Dust) {
            fx = this._spawnDustFX(p);
        } else {
            fx = this._spawnFX(p, type );
        }

        if (scaleX > 0) {
            scaleX = 1;
        } else {
            scaleX = -1;
        }
        fx.setScaleX(scaleX);
        fx.setPosition(pos);
        return fx;
    },
    playSimpleFX: function(pos, type, isEnemy) {
        var p = this.batchNode;
        var tex = null;
        var str_def = isEnemy ? 'd_' : '';
        switch(type) {
            case FXType.TextMiss:
                tex = 'txt_' + str_def + 'miss.png';
                break;
            case FXType.TextNormal:
                tex = 'txt_' + str_def + 'hit.png';
                break;
            case FXType.TextGood:
                tex = 'txt_' + str_def + 'good.png';
                break;
            case FXType.TextPerfect:
                tex = 'txt_' + str_def + 'perfect.png';
                break;
        }
        var fx = this._spawnSimpleFX(p, tex, type);
        fx.setPosition(pos);
        return fx;
    }
});
