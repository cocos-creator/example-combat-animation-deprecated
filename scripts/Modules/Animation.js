var createAnimation = function(animInfo) {
    var animFrames = [];
    var frame,str;
    // init run animation
    for (var i = animInfo.startIdx; i < animInfo.startIdx + animInfo.count; i++) {
        var num = i;
        str = animInfo.name + num + ".png";
        frame = cc.spriteFrameCache.getSpriteFrame(str);
        animFrames.push(frame);
    }
    return new cc.Animation(animFrames, animInfo.delay);
};

var createAnimAction = function(animInfo) {
    return cc.animate(createAnimation(animInfo));
};

module.exports = {
    createAnimation: createAnimation,
    createAnimAction: createAnimAction
};
