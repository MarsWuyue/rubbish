var Global = require('global')

cc.Class({
    extends: cc.Component,

    properties: {
        rowCount: {
            default: 10,
            type: cc.Integer
        },
        colCount: {
            default: 10,
            type: cc.Integer
        },
        placedElement: cc.Prefab,
        placedBlock: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        Global.placedArea = this;

        this.placedMap = new Array();
        this.clearEndActions = new Array();
        this.oldScore = 0;
    },

    start () {
        this.singleBlockSize = Global.config.getsingleBlockSize();
        this.spaceX = this.singleBlockSize.width / 2;
        this.spaceY = this.singleBlockSize.height / 2;

        this.loadPlacedBlocks();
    },

    loadPlacedBlocks () {
        for (let i = 0; i < this.rowCount; i++) {
            var rowMap = new Array();
            for (let j = 0; j < this.colCount; j++) {
                var placedBlock = this.createPlacedBlock(this.singleBlockSize.width, this.singleBlockSize.height, i, j);
                this.node.addChild(placedBlock);
                var child = this.createChild(placedBlock);
                placedBlock.addChild(child);
                child.active = false;
                rowMap[j] = placedBlock;
            }
            this.placedMap[i] = rowMap;
        }
    },

    createPlacedBlock (width, height, rowIndex, colIndex) {
        var placedBlock = cc.instantiate(this.placedBlock);
        placedBlock.width = width;
        placedBlock.height = height;
        placedBlock.x = colIndex * width;
        placedBlock.y = -rowIndex * height;
        return placedBlock;
    },

    createChild (placedBlock) {
        var margin = 3;
        var child = cc.instantiate(this.placedElement);
        child.width = placedBlock.width - margin * 2;
        child.height = placedBlock.height - margin * 2;
        child.x = margin;
        child.y = -margin;

        return child;
    },

    place (pos, data) {
        this.oldScore = Global.top.getScore();

        pos = this.node.convertToNodeSpaceAR(pos);
        var width = data.width;
        var height = data.height;

        if (!this.validateArea(pos, width, height)) return false;

        pos = this.resetPosition(pos, width, height);

        var placedPosition = this.getPlacedPosition(data.center, pos, data.checklist);

        if (!this.validateSpace(placedPosition)) return false;

        this.placeElement(placedPosition);

        this.clearFulled(placedPosition);

        return true;
    },

    validateArea (pos, width, height) {
        return pos.x - width / 2 * this.singleBlockSize.width >= - this.spaceX
            && pos.x + width / 2 * this.singleBlockSize.width <= this.spaceX + this.node.width
            && pos.y + height / 2 * this.singleBlockSize.height <= this.spaceY
            && pos.y - height / 2 * this.singleBlockSize.height >= -this.spaceY - this.node.height;
    },

    resetPosition (pos, width, height) {
        pos.x = this.resetPositionX (pos.x, width);
        pos.y = this.resetPositionY (pos.y, height);

        return pos;
    },

    resetPositionX (x, width) {
        var posXCount = 0;
        if (width % 2 == 0) {
            var remainderX = x % this.singleBlockSize.width;
            if (remainderX >= this.singleBlockSize.width / 2) {
                posXCount = Math.ceil(x / this.singleBlockSize.width) ;
            } else {
                posXCount = Math.floor(x / this.singleBlockSize.width);
            }
        } else {
            posXCount = Math.floor(x / this.singleBlockSize.width) + 1/2;
        }

        return posXCount * this.singleBlockSize.width;
    },

    resetPositionY (y, height) {
        var posYCount = 0;
        if (height % 2 == 0) {
            var remainderY = y % this.singleBlockSize.height;
            if (remainderY <= -this.singleBlockSize.height / 2) {
                posYCount = Math.floor(y / this.singleBlockSize.height);
            } else {
                posYCount = Math.ceil(y / this.singleBlockSize.height);
            }
        } else {
            posYCount = Math.ceil(y / this.singleBlockSize.height) - 1/2;
        }

        return posYCount * this.singleBlockSize.height;
    },

    getOffset (sourcePos, currentPos) {
        return {
            col: (currentPos.x - sourcePos.x * this.singleBlockSize.width) / this.singleBlockSize.width,
            row: (sourcePos.y * this.singleBlockSize.height - currentPos.y) / this.singleBlockSize.height
        }
    },

    validateSpace (placedPosition) {
        var rows = placedPosition.rows;
        var cols = placedPosition.cols;
        for (let i = 0; i < rows.length; i++) {
            if (this.placedMap[rows[i]][cols[i]].children[0].active)
            {
                return false;
            }
        }
        return true;
    },

    placeElement (placedPosition) {
        var rows = placedPosition.rows;
        var cols = placedPosition.cols;
        for (let i = 0; i < rows.length; i++) {
            this.placedMap[rows[i]][cols[i]].children[0].active = true;
            Global.top.addScore(1);
        }
    },

    getPlacedPosition (center, pos, checklist) {
        var rows = new Array();
        var cols = new Array();

        var offset = this.getOffset(center, pos);
        for (let i = 0; i < checklist.length; i++) {
            var checkPos = checklist[i];
            var row = checkPos.row + offset.row;
            var col = checkPos.col + offset.col;
            rows.push(row);
            cols.push(col);
        }
        return {
            rows: rows,
            cols: cols
        };
    },

    clearFulled (placedPosition) {
        var clearIndex = this.getNeedToClearPositions(placedPosition.rows, placedPosition.cols);

        for (let i = 0; i < clearIndex.rows.length; i++) {
            this.clearRow(clearIndex.rows[i]);
        }

        for (let i = 0; i < clearIndex.cols.length; i++) {
            this.clearCol(clearIndex.cols[i]);
        }
        
        this.doEndActions(clearIndex.rows, clearIndex.cols, this.oldScore, Global.top.getScore());
    },

    doEndActions (rows, cols, oldScore, score) {
        for (let i = 0; i < this.clearEndActions.length; i++) {
            this.clearEndActions[i](rows, cols, oldScore, score);
        }
    },

    getNeedToClearPositions (rows, cols) { 
        var clearRows = new Array();
        var clearCols = new Array();
        for (let i = 0; i < rows.length; i++) {
            if (this.isRowFull(rows[i]) && !array_contain(clearRows, rows[i])) {
                clearRows.push(rows[i])
            }
            if (this.isColFull(cols[i]) && !array_contain(clearCols, cols[i])) {
                clearCols.push(cols[i])
            }
        }

        return {
            rows: clearRows,
            cols: clearCols
        };
    },

    isRowFull (rowIndex) {
        for (let i = 0; i < this.colCount; i++) {
            if (!this.placedMap[rowIndex][i].children[0].active)
            {
                return false;
            }
        }
        return true;
    },

    clearRow (rowIndex) {
        for (let i = 0; i < this.colCount; i++) {
            if (this.placedMap[rowIndex][i].children[0].active == true) {
                this.placedMap[rowIndex][i].children[0].active = false;
                Global.top.addScore(1);
            }
        }
    },

    isColFull (colIndex) {
        for (let i = 0; i < this.colCount; i++) {
            if (!this.placedMap[i][colIndex].children[0].active)
            {
                return false;
            }
        }
        return true;
    },

    clearCol (colIndex) {
        for (let i = 0; i < this.colCount; i++) {
            if (this.placedMap[i][colIndex].children[0].active == true) {
                this.placedMap[i][colIndex].children[0].active = false;
                Global.top.addScore(1);
            }
        }
    },

    canPlaced (checklist) {
        for (let i = 0; i < this.rowCount; i++) {
            for (let j = 0; j < this.colCount; j++) {
                if (this.placedMap[i][j].children[0].active
                    || i < checklist[0].row
                    || j < checklist[0].col) {
                        continue;
                    }
                var offsetRow = i - checklist[0].row;
                var offsetCol = j - checklist[0].col;
                var canPlaced = true;
                for (let k = 1; k < checklist.length; k++) {
                    var row = checklist[k].row + offsetRow;
                    var col = checklist[k].col + offsetCol;
                    
                    if (row >= this.rowCount
                        || col >= this.colCount
                        || this.placedMap[row][col].children[0].active) {
                        canPlaced = false;
                        break;
                    };
                }

                if (canPlaced) return true;
            }
        }
        return false;
    },

    destroyAll () {
        for (let i = 0; i < this.rowCount; i++) {
            for (let j = 0; j < this.colCount; j++) {
                this.placedMap[i][j].children[0].active = false;
            }
        }
    },

    registerClearEndActions(action) {
        this.clearEndActions.push(action);
    },

    toolClean (worldPos, hammer) {
        var pos = this.node.convertToNodeSpaceAR(worldPos);
        var height = hammer.height;
        var width = hammer.width;
        pos.x += width / 2;
        pos.y -= height / 2;
        if (!this.validateHammerArea(pos, width, height)) return false;
        var cleanCenter = this.getHammerPos(pos, hammer);
        
        return this.cleanShapes(cleanCenter, hammer.type);
    },

    getHammerPos (pos, hammer) {
        return {
            col : Math.floor(pos.x / this.singleBlockSize.width),
            row : Math.floor(Math.abs(pos.y) / this.singleBlockSize.height)
        }
    },

    validateHammerArea (pos) {
        return pos.x >= 0
            && pos.x <= this.node.width
            && pos.y <= 0
            && pos.y  >= - this.node.height;
    },

    cleanShapes (center, type) {

        if (this.placedMap[center.row][center.col].children[0].active == false) return false;

        switch (type) {
            case "single" :
                this.cleanSingle(center.row, center.col);
                break;
            case "block" :
                this.cleanBlock(center.row, center.col);
                break;
            case "line" :
                this.cleanLine(center.row, center.col);
                break;
            case "cross" :
                this.cleanCross(center.row, center.col);
                break;
        }
        return true;
    },

    cleanSingle (row, col) {
        if (row >= 0 && row < this.rowCount && col >= 0 && col < this.colCount
            && this.placedMap[row][col].children[0].active == true) {
            this.placedMap[row][col].children[0].active = false;
            Global.top.addScore(1);
        }
    },

    cleanBlock (row, col) {
        this.cleanSingle(row, col);
        this.cleanSingle(row, col - 1);
        this.cleanSingle(row, col + 1);

        this.cleanSingle(row - 1, col);
        this.cleanSingle(row - 1, col - 1);
        this.cleanSingle(row - 1, col + 1);

        this.cleanSingle(row + 1, col);
        this.cleanSingle(row + 1, col - 1);
        this.cleanSingle(row + 1, col + 1);
    },

    cleanLine (row, col) {
        var hOrv = randomNum(0, 1);
        if (hOrv == 0) {
            this.clearRow (row);
        } else {
            this.clearCol (col);
        }
    },

    cleanCross (row, col) {
        this.clearRow (row);
        this.clearCol (col);
    },
});
