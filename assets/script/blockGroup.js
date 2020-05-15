var dataManager = require('dataManager')
cc.Class({
    extends: cc.Component,

    properties: {
        m_imageAtlas: cc.SpriteAtlas,
        m_score: cc.Label,
        m_scoreHistory: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        window.g_blockGroup = this;
        this.m_blockMap = new Array();
        this.m_scoreNum = 0;
        this.dataManager = dataManager();
        this.init();
        this.loadBlockGroup();
    },

    start () {
        this.dataManager.load();
        this.m_scoreHistory.string = '' + this.dataManager.getScore();
    },

    init () {
        for (let i = 0; i < 10; i++) {
            this.m_blockMap[i] = new Array();
            for (let j = 0; j < 10; j++) {
                this.m_blockMap[i][j] = null;
            }
        }
    },

    loadBlockGroup () {
        var scale = (640 / 10) / 68;
        var weight = 68 * scale;
        for (let i = 0; i < 10; i++) {
            var y = i * weight;
            for (let j = 0; j < 10; j++) {
                var x = j * weight;
                var block = new cc.Node;
                this.node.addChild(block);
                block.anchorX = 0;
                block.anchorY = 1;
                block.x = x;
                block.y = -y;
                block.scale = scale;
                var sprite = block.addComponent(cc.Sprite);
                var frame = this.m_imageAtlas.getSpriteFrame('11');
                sprite.spriteFrame = frame;
            }
        }
    },

    isNotInAvalibleArea(pos, position) {
        return !(pos.x - 64 * position.width / 2 >= -1 * 64 / 2
            && pos.x + 64 * position.width / 2 <= 640 + 64 / 2
            && pos.y + 64 * position.height / 2 <= 0 + 64 / 2
            && pos.y - 64 * position.height / 2 >= -640 - 64 / 2);
    },

    checkPosition (pos, position) {
        pos = this.node.convertToNodeSpaceAR(pos);

        if (this.isNotInAvalibleArea(pos, position)) return false;

        this.resetPosition(pos, position);

        var y = Math.abs(pos.x - position.center.x) / 64;
        var x = Math.abs(pos.y - position.center.y) / 64;
        this.m_checklist = [];
        for (let i = 0; i < position.checklist.length; i++) {
            var x_index = position.checklist[i].x + x;
            var y_index = position.checklist[i].y + y;
            this.m_checklist[i] = {x : x_index, y : y_index};
            if (this.m_blockMap[x_index][y_index] != null) {
                return false;
            }
        }
        return true;
    },

    setShape (pos, node, rotation, position){
        if (this.checkPosition(pos, position)) {
            this.setMapFlag(node, rotation);
            this.clearUp();
            return true;
        }
        return false;
    },

    setMapFlag (node, rotation) {
        for (let i = 0; i < this.m_checklist.length; i++) {
            if (this.m_checklist[i] != null) {
                var child = cc.instantiate(node);
                child.y = -this.m_checklist[i].x * 64 - 32;
                child.x = this.m_checklist[i].y * 64 + 32;
                child.rotation = rotation;
                child.width = 56;
                child.height = 56;
                this.m_blockMap[this.m_checklist[i].x][this.m_checklist[i].y] = child;
                this.node.addChild(child);
                this.updateScore();
                this.m_checklist[i] = null;
            }
        }
    },
    
    resetPosition (pos, position) {

        if (position.width % 2 == 0) {
            var remainderX = pos.x % 64;
            if (remainderX >= 32) {
                pos.x = Math.ceil(pos.x / 64) * 64;
            } else {
                pos.x = Math.floor(pos.x / 64) * 64;
            }
        } else {
            pos.x = Math.floor(pos.x / 64) * 64 + 32;
        }

        if (position.height % 2 == 0) {
            var remainderY = pos.y % 64;
            if (remainderY <= -32) {
                pos.y = Math.floor(pos.y / 64) * 64;
            } else {
                pos.y = Math.ceil(pos.y / 64) * 64;
            }
        } else {
            pos.y = Math.ceil(pos.y / 64) * 64 - 32;
        }
    },

    clearUp () {
        var rows = new Array();
        var cols = new Array();
        for (let i = 0; i < 10; i++) {
            var isFull = true;
            for (let j = 0; j < 10; j++) {
                if (this.m_blockMap[i][j] == null) {
                    var isFull = false;
                    break;
                }
            }
            if (isFull) {
                rows.push(i);
            }
        }

        for (let i = 0; i < 10; i++) {
            var isFull = true;
            for (let j = 0; j < 10; j++) {
                if (this.m_blockMap[j][i] == null) {
                    var isFull = false;
                    break;
                }
            }
            if (isFull) {
                cols.push(i);
            }
        }
        while (rows.length > 0) {
            var row = rows.pop();
            for (let i = 0; i < 10; i++) {
                var node = this.m_blockMap[row][i];
                if (node != null) {
                    var finished = cc.callFunc(function(target, row) {
                        for (let j = 0; j < 10; j++) {
                            this.removeShap(row, j);
                        }
                    }, this, row);
                    this.cleanUpAction(node, finished, i, true);
                }
            }
        }

        while (cols.length > 0) {
            var col = cols.pop();
            for (let i = 0; i <10; i++) {
                var node = this.m_blockMap[i][col];
                if (node != null) {
                    var finished = cc.callFunc(function(target, col) {
                        for (let j = 0; j < 10; j++) {
                            this.removeShap(j, col);
                        }
                    }, this, col);
                    this.cleanUpAction(node, finished, i, false);
                }
            }
        }
    },

    cleanUpAction (node, finished, index, isRow) {
        var time = 0.3;
        var fadeTo = cc.fadeTo(time - time / 10 * index, 0);
        var moveTo;
        var delay;
        if (isRow) {
            delay = cc.delayTime(time / 10 * index);
            moveTo = cc.moveBy(time, cc.v2(0, -200));
        } else {
            delay = cc.delayTime(time / 10 * (9 - index));
            moveTo = cc.moveBy(time, cc.v2(200, 0));
        }
        var spawn = cc.sequence(delay, cc.spawn(fadeTo, moveTo));
        if (index == 0) {
            spawn = cc.sequence(spawn, finished);
        }
        node.runAction(spawn);
    },

    removeShap (row, col) {
        var node = this.m_blockMap[row][col];
        if (node != null) {
            this.updateScore();
            node.removeFromParent();
            this.m_blockMap[row][col] = null;
            node = null;
        }
    },

    canPut (checklist) {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.m_blockMap[i][j] != null) continue;
                var x_index = Math.abs(checklist[0].x - i);
                var y_index = Math.abs(j - checklist[0].y);
                var failed = false;
                for (let checkIndex = 1; checkIndex < checklist.length; checkIndex++) {
                    var x = checklist[checkIndex].x + x_index;
                    var y = checklist[checkIndex].y + y_index;
                    if (x < 0 || y < 0 || x >= 10 || y >= 10
                        || this.m_blockMap[x][y] != null) {
                        failed = true;
                        break;
                    }
                }
                if (!failed) {
                    return true;
                }
            }
        }
        return false;
    },

    destroyAll () {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.m_blockMap[i][j] != null) {
                    if (this.m_blockMap[i][j] == null) continue;
                    this.m_blockMap[i][j].removeFromParent();
                    this.m_blockMap[i][j].destroy();
                    this.m_blockMap[i][j] = null;
                }
            }
        }
        if (this.m_checklist != null) {
            for (let i = 0; i < this.m_checklist.lenght; i++) {
                this.m_checklist[i] = null;
            }
        }
        this.m_score.string = '0';
        this.m_scoreNum = 0;
    },
    updateScore () {
        this.m_scoreNum += 1;
        this.m_score.string = '' + this.m_scoreNum;
        var scoreHistoryNum = this.dataManager.getScore();
        if (this.m_scoreNum > scoreHistoryNum) {
            this.dataManager.updateScore(this.m_scoreNum);
            this.m_scoreHistory.string = '' + this.m_scoreNum;
        }
    }
    // update (dt) {},
});
