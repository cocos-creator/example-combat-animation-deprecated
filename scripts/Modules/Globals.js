var curLevelID = "";

var setCurrentLevel = function(levelID) {
    curLevelID = levelID;
};

var getCurrentLevel = function() {
    return curLevelID;
};

var HitState = Fire.defineEnum({
    Miss: -1,
    Hit: -1,
    Good: -1,
    Perfect: -1
});

function getModifier (hitState) {
    switch (hitState) {
        case HitState.Miss:
            return 0.8;
        case HitState.Hit:
            return 1;
        case HitState.Good:
            return 1.2;
        case HitState.Perfect:
            return 1.5;
    }
}

module.exports = {
    getCurrentLevel: getCurrentLevel,
    setCurrentLevel: setCurrentLevel,
    getModifier: getModifier,
    HitState: HitState
};
