var Loading = Fire.Class({
    extends: Fire.Behavior,
    properties: {
        mask: {
            default: null,
            type: cc.Node
        },
        title: {
            default: null,
            type: cc.Node
        }
    },
    init: function() {
        if (this.title) {
            this.title.setString("");
        }
        this.setCascadeOpacityEnabled(true);
        this.setPosition(cc.p(320,240));
    },
    ready: function() {
        var callback = cc.callFunc(this._onDisable, this);
        this.runAction(cc.sequence(cc.fadeOut(1), callback));
    },
    _onDisable: function() {
        this.setVisible(false);
    },
    fadeIn: function() {
        this.setVisible(true);
        this.title.setString('loading...');
        this.runAction(cc.fadeIn(1));
    },
    showResult: function(isWin) {
        if (isWin) {
            this.title.setString("You Win!");
        } else {
            this.title.setString("You Lose!");
        }
        this.setVisible(true);
        this.runAction(cc.fadeIn(1));
    },
    showLevelName: function(strName) {
        this.title.setString(strName);
    }
});
