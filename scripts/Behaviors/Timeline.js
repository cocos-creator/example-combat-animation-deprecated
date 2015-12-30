var FXManager = require('FXManager');
var AudioMng = require('AudioMng');
var Game = require('Game');
var Globals = require('Globals');

var Timeline = Fire.Class({
    extends: Fire.Behavior,
    properties: {
        minInterval: 0,
        intervalBase: 0,
        speed: 0,
        perfectRange: 0,
        goodRange: 0,
        hitRange: 0,
        bar: {
            default: null,
            type: cc.Node
        },
        mark: {
            default: null,
            type: cc.Node
        },
        iconTemplate: {
            default: null,
            type: cc.Node
        }
    },
    init: function(fighters, battleMng) {
        // reference
        this.battleMng = battleMng;
        this.batchNode = Game.instance.battleMng.batchNode;

        //variables
        var fighterTmp = this.battleMng.fighterTemplate;
        this.attackPrepareDuration = fighterTmp.moveForwardDuration + fighterTmp.attackFreezeDuration/2;
        this.lastIconTime = 0;
        this.perfectX = this.mark.x;
        this.checkingIcon = null;
        this.activeIcons = [];
        this.lastIcon = null;

        // const
        this.startPosX = this.bar.x + this.bar.width/2;
        this.endPosX = this.bar.x - this.bar.width/2;
        var perfectTiming = (this.startPosX - this.perfectX)/this.speed;
        this.checkTime = {
            perfect: perfectTiming,
            inHit: perfectTiming - this.hitRange,
            inGood: perfectTiming - this.goodRange,
            inPerfect: perfectTiming - this.perfectRange,
            outPerfect: perfectTiming + this.perfectRange,
            outGood: perfectTiming + this.goodRange,
            outHit: perfectTiming + this.hitRange,
            full: (this.startPosX - this.endPosX)/this.speed
        };

        // initialization
        this._initTimeline(fighters);
        this._registerInput();
        this.ready = true;
    },
    _initTimeline: function(fighters) {
        for (var i = 0; i < fighters.length; ++i) {
            var fighter = fighters[i];
            var icon = Fire.instantiate(this.iconTemplate);
            icon.init(fighter, this);
            fighter.setIcon(icon);
            this.activeIcons.push(icon);
            // batching
            this.batchNode.addChild(icon);
        }
    },
    update: function(dt) {
        if (!this.ready) return;
        var firstIconTimer = 0;
        var firstIcon = null;
        for (var i = 0,j = this.activeIcons.length; i < j; ++i) {
            var icon = this.activeIcons[i];
            icon.tick(dt);

            if (icon.onTimeline) {
                icon.showRing(false);
                if (icon.onlineTimer > firstIconTimer &&
                    icon.onlineTimer < this.checkTime.outHit) {
                    firstIconTimer = icon.onlineTimer;
                    firstIcon = icon;
                }
            }
        }
        this.checkingIcon = firstIcon;
        if (this.checkingIcon) {
            this.checkingIcon.showRing(true);
        }
    },
    _timelineHit: function() {
        if (this.checkingIcon) {
            this._checkHit(this.checkingIcon);
        }
    },
    _checkHit: function(icon) {
        var curTimer = icon.onlineTimer;
        var checkTime = this.checkTime;
        if (curTimer > checkTime.inPerfect && curTimer < checkTime.outPerfect) {
            icon.playPerfect();
            this.launchAttack(icon.fighter, Globals.HitState.Perfect);
            icon.exitTimeline();
            this.checkingIcon = null;
            return;
        }
        if (curTimer > checkTime.inGood && curTimer < checkTime.outGood) {
            icon.playGood();
            this.launchAttack(icon.fighter, Globals.HitState.Good);
            icon.exitTimeline();
            this.checkingIcon = null;
            return;
        }
        if (curTimer > checkTime.inHit && curTimer < checkTime.outHit) {
            icon.playHit();
            this.launchAttack(icon.fighter, Globals.HitState.Hit);
            icon.exitTimeline();
            this.checkingIcon = null;
            return;
        }
        // miss
        icon.playMiss();
    },
    _registerInput: function() {
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event){
                if (keyCode === cc.KEY.space) {
                    self._timelineHit();
                }
            }
        }, self);
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesBegan:function (touches, event) {
                self._timelineHit();
            }
        }, self);
    },
    getStartPos: function() {
        return cc.p(this.bar.x + this.bar.width/2, this.bar.y);
    },
    setLastIconTime: function() {
        this.lastIconTime = Date.now()/1000;
    },
    canAddNewIcon: function(fighter) {
        if (this.lastIcon === null || this.lastIcon.fighter.isEnemy === fighter.isEnemy) {
            return Date.now()/1000 - this.lastIconTime >= this.minInterval;
        } else {
            return Date.now()/1000 - this.lastIconTime >= this.minInterval * 3;
        }
    },
    orderAttack: function(fighter) {
        this.battleMng.orderAttack(fighter);
    },
    launchAttack: function(fighter, hitState) {
        var modifier = Globals.getModifier(hitState);
        this.battleMng.launchAttack(fighter, modifier);
        FXManager.instance.playTextFX(cc.p(fighter.x, fighter.y + 140), hitState, fighter.isEnemy);
        var fxType;
        if (fighter.isEnemy) {
            if (hitState === Globals.HitState.Perfect || hitState === Globals.HitState.Good) {
                fxType = FXManager.FXType.Block;
            } else {
                fxType = FXManager.FXType.HitNormal;
            }
        } else {
            if (hitState === Globals.HitState.Perfect || hitState === Globals.HitState.Good ) {
                fxType = FXManager.FXType.HitPerfect;
            } else if ( hitState === Globals.HitState.Hit) {
                fxType = FXManager.FXType.HitNormal;
            } else {
                fxType = FXManager.FXType.Block;
            }
        }
        FXManager.instance.playFX(cc.p(fighter.x - fighter.attackOffset/2, fighter.y + 50), fxType, fighter.getScaleX());
    },
    retireFighterIcon: function(fighter) {
        var icon = fighter.icon;
        icon.exitTimeline();
        icon.playFadeOut();
        this.activeIcons.splice(this.activeIcons.indexOf(icon), 1);
    }
});
