var FighterAsset = Fire.Class({
    name: 'FighterAsset',
    properties: {
        hurtFX: 0,
        attackOffset: 0,
        idleTexture: {
            default: null,
            url: Fire.Texture
        },
        atkTexture: {
            default: null,
            url: Fire.Texture
        },
        iconTexture: {
            default: null,
            url: Fire.Texture
        }
    },
    constructor: function() {
    }
});
