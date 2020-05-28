var Global = require('global')

cc.Class({
    extends: cc.Component,

    properties: {
        shapePool: [cc.Prefab]
    },

    onLoad () {
        Global.shapeBuilder = this;
        
        this.calcProbability = new Array();
        this.maxProbability = 0;
    },

    start () {
        this.shapesData = Global.config.getShapes();
        this.rotations = Global.config.getRotations();
        this.initializeCalcProbability();
    },

    initializeCalcProbability () {
        for (let i = 0; i < this.shapesData.length; i++) {
            this.maxProbability += this.shapesData[i].probability;
            if (i == 0) {
                this.calcProbability.push(this.shapesData[i].probability);
            } else {
                this.calcProbability.push(this.calcProbability[i - 1] + this.shapesData[i].probability)
            }
        }
    },

    createShape () {
        var type = 8; //this.createTypeByProbability();
        var rotation = this.randomNum(0, this.rotations.length - 1);
        var shape = new Object();
        shape.data = this.shapesData[type].positions[rotation];
        shape.node = this.createNode(type, rotation, shape.data);
        return shape;
    },

    createNode (type, rotation) {
        var node = cc.instantiate(this.shapePool[type]);
        node.rotation = this.rotations[rotation];
        node.active = true;
        return node;
    },

    createTypeByProbability () {
        var random = this.randomNum(0, this.maxProbability);
        for (let i = 0; i < this.calcProbability.length; i++) {
            if (random <= this.calcProbability[i]) {
                return i;
            }
        }
        return 0;
    },

    randomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // update (dt) {},
});
