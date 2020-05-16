cc.Class({
    extends: cc.Component,

    properties: {
        m_audioSource: {
            default: null,
            type: cc.AudioClip
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        cc.audioEngine.play(this.m_audioSource, false, 1);
    },

    // update (dt) {},
});
