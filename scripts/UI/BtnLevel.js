var BtnLevel = Fire.Class({
    extends: Fire.Behavior,
    initialize: function(menu, levelInfo) {
        this.levelInfo = levelInfo;
        this.menu = menu;
        this.levelName = this.getChildByName('levelName');
        this.levelName.setString(levelInfo.name);
        this.addTouchEventListener(this._btnTouched, this);
    },
    _btnTouched: function( sender, type ) {
        if (type === ccui.Widget.TOUCH_ENDED) {
            this.menu.loadLevel(this.levelInfo);
        }
    }
});
