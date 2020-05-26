cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.preloadScene("game", function () {
            cc.log("Next scene preloaded");
        });
    },

    start () {

    },

    onClickStartGame () {
        cc.director.loadScene("game");
    }

    // update (dt) {},
});
