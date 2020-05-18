cc.Class({
    extends: cc.Component,

    properties: {
        m_playButton: cc.Button,

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.loader.loadRes('lastDance', cc.AudioClip, function (err, clip) {
            cc.audioEngine.playMusic(clip, true);
        });
    },

    start () {
    },

    playMusic () {
        if (cc.audioEngine.isMusicPlaying()) {
            cc.audioEngine.pauseMusic();
            this.m_playButton.string = '继续播放';
        } else {
            cc.audioEngine.resumeMusic();
            this.m_playButton.string = '暂停播放';
        }
    },

    onDestroy: function () {
        cc.audioEngine.stop(this.current);
    }

    // update (dt) {},
});
