var Global = require('global')

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        Global.failed = this;
        this.node.zIndex = 9999;
        this.node.active = false;
    },

    start () {

    },

    show () {
        this.node.active = true;
        cc.log('failed');
    },

    restart () {
        Global.sourceArea.destroyAll();
        Global.placedArea.destroyAll();
        Global.toolArea.destroyAll();
        Global.top.destroyAll();
        Global.sourceArea.refreshShapes();
        this.node.active = false;
    }

    // update (dt) {},
});
