var Global = require('global')

cc.Class({
    extends: cc.Component,

    properties: {
        shapeConfig: cc.JsonAsset,
        toolsConfig: cc.JsonAsset,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.config = this;
        this.shapeConfigData = this.shapeConfig.json;
        this.toolsConfigData = this.toolsConfig.json;
    },

    start () {

    },

    getShapes () {
        return this.shapeConfigData.shapes;
    },

    getRotations () {
        return this.shapeConfigData.rotations;
    },

    getsingleBlockSize () {
        return this.shapeConfigData.singleBlockSize;
    },

    getTools () {
        return {
            cleanTools: this.toolsConfigData.cleanTools,
            scoreTools: this.toolsConfigData.scoreTools
        };
    }

    // update (dt) {},
});
