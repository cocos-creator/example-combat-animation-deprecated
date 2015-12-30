var FXManager = require('FXManager');
var AudioMng = require('AudioMng');
var Globals = require('Globals');

var FighterIcon = Fire.Class({
    extends: Fire.Behavior,
    properties: {
        // sprite: {
        //     default: null,
        //     type: cc.Node
        // },
        // ring: {
        //     default: null,
        //     type: cc.Node
        // }
    },
    init: function(fighter, timeline) {
        this.setCascadeOpacityEnabled(true);
        // references
        this.timeline = timeline;
        this.fighter = fighter;
        this.ring = this.getChildByName('ring');

        // timer
        this.onlineTimer = 0; // enter timeline to set this to 0 and start timer
        this.offlineTimer = 0; // exit timeline to set this to 0 and start timer
        this.offlineDuration = (1 - fighter.agility/20) * this.timeline.intervalBase; //TEMP formula
        this.onTimeline = false;
        this.attacked = false;
        this.attackEnd = false;

        // init actions
        this._initActions();

        // visual
        this.setName(fighter.getName());
        this.setSpriteFrame(fighter.assetID + '.png');
        this.ring.setSpriteFrame('ring.png');
        this.showRing(false);
        this.setVisible(false);
    },
    _initActions: function() {
        //actions
        this.actionFadeIn = cc.fadeIn(0.2);
        this.actionFadeOut = cc.fadeOut(0.1);
        this.actionPopPerfect = cc.sequence(cc.scaleTo(0.1, 0.6).easing(cc.easeBackOut()), cc.scaleTo(0.1, 1).easing(cc.easeBackOut()), this.actionFadeOut);
        this.actionPopGood = cc.sequence(cc.scaleTo(0.1, 0.7).easing(cc.easeBackOut()), cc.scaleTo(0.1, 1).easing(cc.easeBackOut()), this.actionFadeOut);
        this.actionPopHit = cc.sequence(cc.scaleTo(0.1, 0.8).easing(cc.easeBackOut()), cc.scaleTo(0.1, 1).easing(cc.easeBackOut()), this.actionFadeOut);

        // retain
        this.actionFadeIn.retain();
        this.actionFadeOut.retain();
        this.actionPopPerfect.retain();
        this.actionPopGood.retain();
        this.actionPopHit.retain();
        Fire.engine.once('pre-launch-scene', function () {
            this.actionFadeIn.release();
            this.actionFadeOut.release();
            this.actionPopPerfect.release();
            this.actionPopGood.release();
            this.actionPopHit.release();
        }.bind(this));
    },
    enterTimeline: function() {
        this.setVisible(true);
        this.onTimeline = true;
        this.attacked = false;
        this.attackEnd = false;
        this.timeline.setLastIconTime();
        this.runAction(this.actionFadeIn);
        this.setPosition(this.timeline.getStartPos());
        this.onlineTimer = 0;
    },
    exitTimeline: function() {
        this.onTimeline = false;
        this.showRing(false);
        this.offlineTimer = 0;
    },
    playFadeOut: function() {
        this.runAction(this.actionFadeOut);
    },
    showRing: function(show) {
        if (this.fighter.isEnemy) {
            this.ring.setColor(cc.color(255,0,0,255));
        } else {
            this.ring.setColor(cc.color(255,255,255,255));
        }
        this.ring.setVisible(show);
    },
    tick: function(dt) {
        if (this.onTimeline) {
            this.onlineTimer += dt;
            if (this.onlineTimer >= this.timeline.checkTime.full) {
                this.exitTimeline();
                this.playFadeOut();
                return;
            }
            if (this.onlineTimer >= this.timeline.checkTime.perfect - this.timeline.attackPrepareDuration &&
                this.attacked === false) {
                this.attacked = true;
                this.timeline.orderAttack(this.fighter);
            }
            if (this.onlineTimer >= this.timeline.checkTime.outHit && this.attackEnd === false) {
                this.attackEnd = true;
                this.playMiss();
                this.timeline.launchAttack(this.fighter, Globals.HitState.Miss);
            }
            var delta = this.timeline.speed * dt;
            this.setPositionX(this.x - delta);
        } else {
            this.offlineTimer += dt;
            if (this.offlineTimer >= this.offlineDuration) {
                if (this.timeline.canAddNewIcon(this.fighter)) {
                    this.timeline.lastIcon = this;
                    this.enterTimeline();
                } else {
                    this.offlineTimer -= this.timeline.minInterval;
                }
            }
        }
    },
    playPerfect: function() {
        this.runAction(this.actionPopPerfect);
        FXManager.instance.playFX(cc.p(this.x, this.y), FXManager.FXType.CoinPerfect, 1);
        FXManager.instance.playSimpleFX(cc.p(this.timeline.mark.x, this.timeline.mark.y), FXManager.FXType.TextPerfect, this.fighter.isEnemy );
        AudioMng.instance.playPerfect();
    },
    playGood: function() {
        this.runAction(this.actionPopGood);
        FXManager.instance.playFX(cc.p(this.x, this.y), FXManager.FXType.CoinHit, 1);
        FXManager.instance.playSimpleFX(cc.p(this.timeline.mark.x, this.timeline.mark.y), FXManager.FXType.TextGood, this.fighter.isEnemy );
        AudioMng.instance.playGood();
    },
    playHit: function() {
        this.runAction(this.actionPopHit);
        FXManager.instance.playFX(cc.p(this.x, this.y), FXManager.FXType.CoinHit, 1);
        FXManager.instance.playSimpleFX(cc.p(this.timeline.mark.x, this.timeline.mark.y), FXManager.FXType.TextNormal, this.fighter.isEnemy );
        AudioMng.instance.playHit();
    },
    playMiss: function() {
        AudioMng.instance.playMiss();
        this.showRing(false);
        FXManager.instance.playSimpleFX(cc.p(this.timeline.mark.x, this.timeline.mark.y), FXManager.FXType.TextMiss, this.fighter.isEnemy );
    }
});
