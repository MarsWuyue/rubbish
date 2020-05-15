cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        window.g_failed = this;
        this.node.active = false;
    },

    start () {

    },

    show () {
        this.node.active = true;
    },

    restart () {
        g_backlogGroup.destroyAll();
        g_blockGroup.destroyAll();
        this.node.active = false;
        g_backlogGroup.createShape();
    }

    // update (dt) {},
});
