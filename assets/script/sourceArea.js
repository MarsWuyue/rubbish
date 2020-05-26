var Global = require('global')
cc.Class({
    extends: cc.Component,

    properties: {
        blockNum: {
            default: 3,
            type: cc.Integer
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.sourceArea = this;
        this.shapes = new Array();
        this.loadArea();
    },

    start () {

    },

    // update (dt) {},

    loadArea () {
        cc.loader.loadRes("prefab/block", function (err, prefab) {
            var width = this.node.width / this.blockNum;
            var height = this.node.height;
            for (let i = 0; i < this.blockNum; i++) {
                var sourceBlock = cc.instantiate(prefab);
                sourceBlock.width = width;
                sourceBlock.height = height;
                sourceBlock.x = i * width;
                this.node.addChild(sourceBlock);
                this.addShape(sourceBlock, i);
            }
        }.bind(this));
    },

    addShape (parent, i) {
        var shape = Global.shapeBuilder.createShape();
        shape.sourceIndex = i;
        shape.node.x = this.node.width / this.blockNum / 2;
        shape.node.y = -this.node.height / 2;
        this.shapes[i] = shape;
        shape.node.scale = 0.5;
        parent.addChild(shape.node);
    },

    isInside (worldPos) {
        var pos = this.node.convertToNodeSpaceAR(worldPos);
        return pos.x >= 0 && pos.x <= this.node.width
            && pos.y <= 0 && pos.y >= -this.node.height;
    },

    getShape (worldPos) {
        var pos = this.node.convertToNodeSpaceAR(worldPos);
        var index = Math.floor(pos.x / (this.node.width / this.blockNum));
        return this.shapes[index];
    },

    hideShape (index) {
        if (index < 0 || index >= this.blockNum) return;
        this.shapes[index].node.active = false;
    },

    showShape (index) {
        if (index < 0 || index >= this.blockNum) return;
        this.shapes[index].node.active = true;
    },

    destroyShape (index) {
        if (index < 0 || index >= this.blockNum || this.shapes[index] == null) return;
        this.shapes[index].node.removeFromParent();
        this.shapes[index].node = null;
        this.shapes[index] = null;

        if (this.isNeedRefresh()) {
            this.refreshShapes();
        }
    },

    isNeedRefresh () {
        for (let i = 0; i < this.shapes.length; i++) {
            if (this.shapes[i] != null) {
                return false;
            }
        }

        return true;
    },

    refreshShapes () {
        for (let i = 0; i < this.node.children.length; i++) {
            this.addShape(this.node.children[i], i);
        }
    },
    
    getShapes () {
        return this.shapes;
    },

    clearShapes () {
        for (let i = 0; i < this.shapes.length; i++) {
            if (this.shapes[i] != null) {
                this.shapes[i].node.removeFromParent();
                this.shapes[i].node = null;
                this.shapes[i] = null;
            }
        }
    },

    destroyAll () {
        this.clearShapes();
    }
});
