var AssetMng = require('AssetMng');
var FXManager = require('FXManager');
var AudioMng = require('AudioMng');
var Game = require('Game');

var FighterDisplay = Fire.Class({
    extends: Fire.Behavior,
    properties: {
        // flash: {
        //     default: null,
        //     type: cc.Node
        // },
        isEnemy: false,
        moveForwardDuration: 0,
        moveBackwardDuration: 0,
        attackFreezeDuration: 0,
        hurtFX: 0,
        attackOffset: 0
    },
    init: function(fighterInfo, levelMod) {
        this.setCascadeOpacityEnabled(true);
        // reference
        this.flash = this.getChildByName('flash');
        this.hpBar = null;
        this.icon = null;
        // initialize data
        this.assetID = fighterInfo.assetID;
        this.fighterName = fighterInfo.name;
        var atkMod = levelMod ? levelMod.atkMod : 1;
        var hpMod = levelMod ? levelMod.hpMod : 1;
        this.atk = Math.floor(parseInt(fighterInfo.atk) * atkMod);
        this.agility = parseInt(fighterInfo.agi);
        this.maxHP = Math.floor(parseInt(fighterInfo.hp) * hpMod);
        this.curHP = this.maxHP;
        this.attackOffset = this.isEnemy ? 100 : -100;
        this.initZ = 0;
        // engage in action
        this.canMove = true;
        this.isDead = false;
        // target
        this.targetFighter = null;
        // damage taking
        this.dmgTaken = 0;
        // set sprites
        this._showIdlePose();
        this.flash.setSpriteFrame(this.assetID + '_flash.png');
    },

    // need to get position first
    initActions: function() {
        // actions
        this.actionMoveForward = null;
        this.actionMoveBackward = null;
        var scaleX = this.isEnemy ? 1 : -1;
        this.actionIdle = cc.repeatForever(cc.sequence(cc.scaleTo(1, scaleX, 0.95), cc.scaleTo(1, scaleX, 1))) ;
        // position
        this.targetPos = cc.p(0,0);
        this.selfPos = cc.p(this.x, this.y);
        this.actionMoveBackward = cc.moveTo(this.moveBackwardDuration, this.selfPos).easing(cc.easeCubicActionOut());
        this.flash.setPositionX(this.width/2);
        // retain
        this.actionMoveBackward.retain();
        this.actionIdle.retain();
        Fire.engine.once('pre-launch-scene', function () {
            this.actionMoveBackward.release();
            this.actionIdle.release();
        }.bind(this));
        //
        this.idle();
    },

    setHPBar: function(hpBar) {
        this.hpBar = hpBar;
        this.hpBar.init(this);
    },

    setIcon: function(icon) {
        this.icon = icon;
    },

    idle: function() {
        this.runAction(this.actionIdle);
    },

    moveToAttack: function(target) {
        this.stopAction(this.actionIdle);
        if (this.hpBar) {
            this.hpBar.setVisible(false);
        }
        this.canMove = false;
        this._assignTarget(target, this.attackOffset);
        var callback = cc.callFunc(this._playAttack, this);
        var fx = FXManager.instance.playFX(cc.p(this.x, this.y + 50), FXManager.FXType.Dust, this.getScaleX(), this.getParent());
        fx.setLocalZOrder(this.getLocalZOrder() - 0.5);
        this.runAction(cc.sequence(this.actionMoveForward, callback));
    },

    hurt: function(offset) {
        this.stopAction(this.actionIdle);
        this.canMove = false;
        var move1 = cc.moveBy(this.attackFreezeDuration, cc.p(offset,0)).easing(cc.easeElasticInOut(0.2));
        var move2 = cc.moveBy(this.attackFreezeDuration, cc.p(-offset,0)).easing(cc.easeElasticInOut(0.2));
        var callback = cc.callFunc(this._onHurtEnd, this);
        var cbMid = cc.callFunc(this._onHurtMid, this);
        var seq1 = cc.sequence(move1, cbMid, move2, callback);
        var flash1 = cc.fadeIn(this.attackFreezeDuration/2);
        var flash2 = cc.fadeOut(this.attackFreezeDuration/2);
        var seq2 = cc.sequence(flash1, flash2);
        FXManager.instance.playFX(cc.p(this.x, this.y + 80), FXManager.FXType.Blood, this.getScaleX());
        this.runAction(seq1);
        this.flash.runAction(seq2);
        AudioMng.instance.playAttack();
    },

    _onHurtMid: function() {
        FXManager.instance.playTextDmg(cc.p(this.x, this.y + 80), this.dmgTaken);
        this._updateHP(-this.dmgTaken);
    },

    _updateHP: function(delta) {
        this.curHP += delta;
        if (this.curHP <= 0 && this.isDead === false) {
            this.curHP = 0;
            Game.instance.battleMng.fighterDie(this);
        }
        this.hpBar.setHP(Math.floor(this.curHP), this.maxHP);
    },

    _assignTarget: function(target, offset) {
        this.targetFighter = target;
        this.targetPos = cc.p(target.selfPos.x + offset, target.selfPos.y);
        this.actionMoveForward = cc.jumpTo(this.moveForwardDuration, this.targetPos, 30, 1).easing(cc.easeCubicActionOut());
        // retain
        this.actionMoveForward.retain();
        Fire.engine.once('pre-launch-scene', function () {
            this.actionMoveForward.release();
        }.bind(this));
    },

    _showAtkPose: function() {
        this.setSpriteFrame(this.assetID + '_atk.png');
    },

    _showIdlePose: function() {
        this.setSpriteFrame(this.assetID + '_idle.png');
    },

    _playHitFreeze: function() {
        setTimeout(function() {
            this._moveBack();
        }.bind(this), this.attackFreezeDuration * 1000);
    },

    _playAttack: function() {
        var offset = this.attackOffset;
        this._showAtkPose();
        Game.instance.battleMng.setAttackZ(this);
        var callback = cc.callFunc(this._playHitFreeze, this);
        var seq = cc.sequence(cc.moveBy(this.attackFreezeDuration/4, cc.p(-offset, 0)), callback);
        this.runAction(seq);
        this.targetFighter.hurt(-offset*0.7);
    },

    _moveBack: function() {
        this._showIdlePose();
        Game.instance.battleMng.restoreZ(this);
        var callback = cc.callFunc(this._onAtkEnd, this);
        this.runAction(cc.sequence(this.actionMoveBackward, callback));
    },

    _playDie: function() {
        var callback = cc.callFunc(this._onDieEnd, this);
        this.stopAllActions();
        this.runAction(cc.sequence(cc.fadeOut(0.5), callback));
    },

    _onAtkEnd: function() {
        this.canMove = true;
        this.idle();
        this.hpBar.setVisible(true);
    },

    _onHurtEnd: function() {
        if (this.isDead) {
            this._playDie();
        } else {
            this.canMove = true;
            this.idle();
        }
    },

    _onDieEnd: function() {
        this.hpBar.setVisible(false);
        this.setVisible(false);
    }
});
