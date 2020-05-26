var Global = require('global')

cc.Class({
    extends: cc.Component,

    properties: {
        space: {
            default: 100,
            type: cc.Integer
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.movedArea = this;
        this.touchEndActions = new Array();
        this.node.zIndex = 999;
        this.movingElement = null;
        this.currentType;
        cc.macro.ENABLE_MULTI_TOUCH = false;

        this.node.on('touchstart', this.touchStart, this);
        this.node.on('touchmove', this.touchMove, this);
        this.node.on('touchend', this.touchEnd, this);
        this.node.on('touchcancel', this.touchCancel, this);
    },

    start () {
        this.singleBlockSize = Global.config.getsingleBlockSize();
    },

    // update (dt) {},

    touchStart (event) {
        this.destroyMovingElement();

        var pos = event.getLocation();
        if (Global.sourceArea.isInside(pos)) {
            this.currentType = 'shape';
            this.movingElement = this.createMovingShape(pos);
            this.node.addChild(this.movingElement.node);

            Global.sourceArea.hideShape(this.movingElement.sourceIndex);

        } else if (Global.toolArea.isInside(pos)) {
            this.currentType = 'tool';
            this.movingElement = this.createMovingShape(pos);
            if (this.movingElement == null) return;
            this.node.addChild(this.movingElement.node);
            cc.log('tools');
        } else {
            cc.log('no');
        }
    },

    touchMove (event) {
        if (this.movingElement == null) return;
        var pos = event.getLocation();
        pos = this.node.convertToNodeSpaceAR(pos);
        this.movingElement.node.x = pos.x;
        if (this.currentType == 'shape') {
            this.movingElement.node.y = pos.y + this.movingElement.data.offsetY + this.space;
        } else if (this.currentType == 'tool') {
            this.movingElement.node.y = pos.y + this.space;
        }
    },

    touchEnd (event) {
        if (this.movingElement == null) return;

        if (this.currentType == 'shape') {
            this.processShape();
        } else if (this.currentType == 'tool') {
            this.processTool();
        }
        this.destroyMovingElement();
    },

    touchCancel (event) {
        if (this.movingElement == null) return;
        Global.sourceArea.showShape(this.movingElement.sourceIndex);
        this.destroyMovingElement();
    },

    destroyMovingElement () {
        if (this.movingElement != null) {
            this.movingElement.node.removeFromParent();
            this.movingElement.node = null;
            this.movingElement = null;
        }
    }, 

    createMovingShape (pos) {
        var movingNode = new Object();
        var obj = null;
        if (this.currentType == 'shape') {
            obj = Global.sourceArea.getShape(pos);
            movingNode.data = obj.data;
            movingNode.sourceIndex = obj.sourceIndex;
            movingNode.node = cc.instantiate(obj.node);
            movingNode.node.scale = 0.95;
            var singleWidth = Global.sourceArea.node.width / 3;
            movingNode.node.x = obj.sourceIndex * singleWidth + singleWidth / 2;
            pos = this.node.convertToNodeSpaceAR(pos);
            movingNode.data.offsetY = this.singleBlockSize.height * obj.data.height / 2;
            movingNode.node.y = pos.y + movingNode.data.offsetY + this.space;
        } else if (this.currentType == 'tool') {
            obj = Global.toolArea.getHammer(pos);
            if (!obj.data.enabled) {;
                this.movingElement = null;
                return;
            };
            movingNode.data = obj.data;
            movingNode.node = cc.instantiate(obj.hammer);
            movingNode.sourceIndex = obj.sourceIndex;
            movingNode.type = obj.bigType;
            movingNode.node.scale = 0.8;
            var singleWidth = Global.toolArea.node.width / obj.data.count;
            movingNode.node.x = obj.sourceIndex * singleWidth + singleWidth / 2;
            pos = this.node.convertToNodeSpaceAR(pos);
            movingNode.node.y = pos.y + this.space;
        }


        return movingNode;
    },

    processShape () {
        var pos = this.movingElement.node.getPosition();
        pos = this.node.convertToWorldSpaceAR(pos);
        if (Global.placedArea.place(pos, this.movingElement.data)) {
            Global.sourceArea.destroyShape(this.movingElement.sourceIndex);
            this.doTouchEndAction();
        } else {
            Global.sourceArea.showShape(this.movingElement.sourceIndex);
        }
    },

    registerTouchEndEvent (action) {
        this.touchEndActions.push(action);
    },

    doTouchEndAction () {
        for (let i = 0; i < this.touchEndActions.length; i++) {
            this.touchEndActions[i]();
        }
    },

    processTool () {
        var pos = this.movingElement.node.getPosition();
        pos = this.node.convertToWorldSpaceAR(pos);

        if (Global.placedArea.toolClean(pos, this.movingElement.data)) {
            Global.toolArea.subHammer(this.movingElement.type, this.movingElement.sourceIndex);
            this.doTouchEndAction();
        }
    }

});
