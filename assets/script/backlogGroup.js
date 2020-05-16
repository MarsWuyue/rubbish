cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad () {
        window.g_backlogGroup = this;
        this.m_shapes = [];
        this.node.on('touchstart', this.touchStart, this);
        this.node.on('touchmove', this.touchMove, this);
        this.node.on('touchend', this.touchEnd, this);
        this.node.on('touchcancel', this.touchCancel, this);
    },

    start () {
        this.createShape();
    },

    createShape () {
        for (let i = 0; i < this.node.children.length; i++) {
            var shape = g_shapeBuilder.createShape();
            shape.node.scale = 0;
            this.node.children[i].addChild(shape.node);
            shape.node.runAction(cc.scaleTo(0.3, 0.5));
            this.m_shapes[i] = shape;
        }
    },

    getCurrentShap(pos) {
        if (pos.y > 0 || pos.y < -213 || pos.x < 0 || pos.x > 640) return null;
        this.m_currentIndex = Math.floor(pos.x / 213);
        return this.m_shapes[this.m_currentIndex];
    },

    clearMoveShape () {
        if (this.m_moveShap != null) {
            this.m_moveShap.node.removeFromParent();
            this.m_moveShap = null;
        }
    },

    clearCurrentShape () {
        var currentShape = this.m_shapes[this.m_currentIndex];

        if (currentShape != null) {
            currentShape.node.removeFromParent();
            this.m_shapes[this.m_currentIndex] = null;
        }
    },

    createNewShapes () {
        if (this.m_shapes[0] == null &&
            this.m_shapes[1] == null &&
            this.m_shapes[2] == null) {
            this.createShape()
        }
    },

    touchStart (event) {
        this.clearMoveShape();
        var pos = this.node.convertToNodeSpaceAR(event.getLocation());
        var currentShape = this.getCurrentShap(pos);
        if (currentShape == null) return;
        this.m_moveShap = new Object();
        this.m_moveShap.position = currentShape.position;
        this.m_moveShap.node = cc.instantiate(currentShape.node);
        this.m_moveShap.node.x = pos.x;
        this.m_moveShap.node.y = pos.y + this.m_moveShap.position.height / 2 * 64 + 64;
        // this.m_moveShap.node.setPosition(pos);
        this.m_moveShap.node.scale = 1;
        this.node.addChild(this.m_moveShap.node);
        currentShape.node.active = false;
    },

    touchMove (event) {
        if (this.m_moveShap == null) return;

        var pos = event.getLocation();
        pos = this.node.convertToNodeSpaceAR(pos);
        this.m_moveShap.node.x = pos.x;
        this.m_moveShap.node.y = pos.y + this.m_moveShap.position.height / 2 * 64 + 64;
    },

    touchEnd (event) {
        if (this.m_moveShap == null) return;
        var pos = this.m_moveShap.node.getPosition();
        pos = this.node.convertToWorldSpaceAR(pos);
        if (g_blockGroup.setShape(pos, this.m_moveShap.node.children[0], this.m_moveShap.node.rotation, this.m_moveShap.position)) {
            this.clearMoveShape();
            this.clearCurrentShape();
            this.createNewShapes();
        } else {
            this.showCurrentShape();
            this.clearMoveShape();
        }

        if (!this.checkCanContinue()) {
            g_failed.show();
        }
    },

    checkCanContinue () {
        for (let i = 0; i < this.m_shapes.length; i++) {
            if (this.m_shapes[i] == null) continue;
            if (g_blockGroup.canPut(this.m_shapes[i].position.checklist)) return true;
        }
        return false;
    },

    touchCancel (event) {
        this.showCurrentShape();
        this.clearMoveShape();
    },
    showCurrentShape() {
        var currentShape = this.m_shapes[this.m_currentIndex];
        if (currentShape != null) {
            currentShape.node.active = true;
        }
    },

    destroyAll () {
        if (this.m_shapes != null) {
            for (let i = 0; i < this.m_shapes.length; i++) {
                if (this.m_shapes[i] != null) {
                    this.m_shapes[i].node.removeFromParent();
                    this.m_shapes[i].node.destroy();
                    this.m_shapes[i].node = null;
                    this.m_shapes[i] = null;
                }
            }
        }
        this.m_currentIndex = null;
        
        if (this.m_moveShap != null) {
            this.m_moveShap.node.removeFromParent();
            this.m_moveShap.node.destroy();
            this.m_moveShap.node = null;
            this.m_moveShap = null;
        }
    }
    // update (dt) {},
});
