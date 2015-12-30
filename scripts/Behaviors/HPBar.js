var HPBar = Fire.Class({
    extends: Fire.Behavior,
    properties: {
        progressBar: {
            default: null,
            type: cc.Node
        },
        hpNum: {
            default: null,
            type: cc.Node
        }
    },
    init: function(fighter) {
        // this.setPosition(cc.p(fighter.width/2, -20));
        this.setCascadeOpacityEnabled(true);
        this.setHP(fighter.curHP, fighter.maxHP);
    },
    setHP: function(hp, maxHp) {
        this.hpNum.setString(hp);
        this.progressBar.setPercent(Math.floor(hp/maxHp * 100));
    }
});
