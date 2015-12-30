var AudioMng = Fire.Class({
    extends: Fire.Behavior,
    properties: {
        bgmAsset: {
            default: '',
            url: Fire.AudioClip,
        },
        missSFX: {
            default: '',
            url: Fire.AudioClip,
        },
        hitSFX: {
            default: '',
            url: Fire.AudioClip,
        },
        goodSFX: {
            default: '',
            url: Fire.AudioClip,
        },
        perfectSFX: {
            default: '',
            url: Fire.AudioClip,
        },
        attackSFX: {
            default: '',
            url: Fire.AudioClip,
        }
    },
    onLoad: function() {
        AudioMng.instance = this;    
        if ( !cc.audioEngine.isMusicPlaying() ) {
            cc.audioEngine.playMusic( this.bgmAsset, true );
        }
    },
    playMiss: function() {
        cc.audioEngine.playEffect( this.missSFX, false );
    },
    playHit: function() {
        cc.audioEngine.playEffect( this.hitSFX, false );
    },
    playGood: function() {
        cc.audioEngine.playEffect( this.goodSFX, false );
    },
    playPerfect: function() {
        cc.audioEngine.playEffect( this.perfectSFX, false );
    },
    playAttack: function() {
        cc.audioEngine.playEffect( this.attackSFX, false );
    }
});
