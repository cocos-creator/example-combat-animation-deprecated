var TextFX = Fire.Class({
    extends: Fire.Behavior,
    properties: {
        // textState: {
        //     default: null,
        //     type: cc.Node
        // },
        dmgColor: {
            default: Fire.Color.red,
            type: Fire.Color
        },
        modColors: {
            default: [],
            type: [Fire.Color]
        },
        stateStrs: {
            default: [],
            type: [Fire.String]
        },
        numStrs: {
            default: [],
            type: [Fire.String]
        }
    },
    initTextFX: function() {
        this.setCascadeOpacityEnabled(true);
        // variable
        this.textState = this.getChildByName('labelState');
        this.textNum = this.getChildByName('labelNum');
        this.isPlaying = false;
        // actions
        var callback = cc.callFunc(this.onPlayEnd, this);
        this.actionFadeIn = cc.fadeIn(0.1);
        this.actionRise = cc.sequence(cc.moveBy(0.3, cc.p(0, 80)).easing(cc.easeBackOut()), cc.fadeOut(0.4), callback);
        this.actionPop = cc.sequence(cc.scaleTo(0.2, 1.2).easing(cc.easeBackOut()), cc.scaleTo(0.2, 1).easing(cc.easeBackOut()), callback);
        // retain
        this.actionFadeIn.retain();
        this.actionRise.retain();
        this.actionPop.retain();
        Fire.engine.once('pre-launch-scene', function () {
            this.actionFadeIn.release();
            this.actionRise.release();
            this.actionPop.release();
        }.bind(this));

    },
    playTextFX: function(hitState, isEnemy) {
        this.isPlaying = true;
        this.setVisible(true);
        var numStr = this.numStrs[hitState];
        numStr = numStr.replace('[f]', isEnemy ? 'Def' : 'Atk');
        this.textState.setString(this.stateStrs[hitState]);
        this.textNum.setString(numStr);
        var color = cc.color(this.modColors[hitState].toHEX('#rrggbb'));
        this.textNum.setScale(0.5);
        this.textState.setColor(color);
        this.textNum.setColor(color);
        this.runAction(this.actionPop);
        this.runAction(this.actionFadeIn);
    },
    playTextDmg: function(dmg) {
        this.isPlaying = true;
        this.setVisible(true);
        this.textState.setString("");
        this.textNum.setString(dmg);
        this.textNum.setScale(0.8);
        var color = cc.color(this.dmgColor.toHEX('#rrggbb'));
        this.textNum.setColor(color);
        this.runAction(this.actionRise);
        this.runAction(this.actionFadeIn);
    },
    onPlayEnd: function() {
        this.setVisible(false);
        this.isPlaying = false;
    }
});
