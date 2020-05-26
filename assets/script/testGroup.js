var Global = require('global')

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // this.node.on('touchstart', function (event) {
        //     cc.log(Global.sourceArea.isInside(event.getLocation()));
        //     var shape = Global.sourceArea.getShape(event.getLocation());
        //     this.node.addChild(shape.node);
        // }.bind(this));
    },

    start () {

    },
    // update (dt) {},

    onClickCreateShape () {
        var shape = Global.shapeBuilder.createShape();
        this.node.addChild(shape.node);
    },
    // update (dt) {},

    onClickGetShape () {
        var shape = Global.sourceArea.getShape();
        this.node.addChild(shape.node);
    }
});
