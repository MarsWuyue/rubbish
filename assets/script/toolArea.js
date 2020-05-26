var Global = require('global')

cc.Class({
    extends: cc.Component,

    properties: {
        singleHammerLabel: cc.Label,
        blockHammerLabel: cc.Label,
        lineHammerLabel: cc.Label,
        crossHammerLabel: cc.Label,
        singleHammer: cc.Node,
        blockHammer: cc.Node,
        lineHammer: cc.Node,
        crossHammer: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.toolArea = this;
        this.cleanTools = new Array();
        this.scoreTools = new Array();
    },

    start () {
        var config = Global.config.getTools();
        var cleanToolsConfig = config.cleanTools;
        var scoreToolsConfig = config.scoreTools;

        this.cleanTools.push({ 
            label: this.singleHammerLabel, value: 0, hammer: this.singleHammer, type: 'single', 
            threshold: cleanToolsConfig[0].threshold, max: cleanToolsConfig[0].max });
        this.cleanTools.push({ 
            label: this.lineHammerLabel, value: 0, hammer: this.lineHammer, type: 'line', 
            threshold: cleanToolsConfig[1].threshold, max: cleanToolsConfig[1].max });
        
        this.scoreTools.push({ 
            label: this.blockHammerLabel, value: 0, hammer: this.blockHammer, type: 'block',  
            threshold: scoreToolsConfig[0].threshold, max: scoreToolsConfig[0].max });
            
        this.scoreTools.push({ 
            label: this.crossHammerLabel, value: 0, hammer: this.crossHammer, type: 'cross',  
            threshold: scoreToolsConfig[1].threshold, max: scoreToolsConfig[1].max });
    },

    // update (dt) {},

    addTool (clearCount, oldScore, score) {
        if (clearCount == 0) return;

        this.addCleanHammerIndex(clearCount);
        this.addScoreHammerIndex (oldScore, score);
    },

    addCleanHammerIndex (clearCount) {
        for (let i = 0; i < this.cleanTools.length; i++) {
            if (clearCount == this.cleanTools[i].threshold) {
                this.addHammer(this.cleanTools[i]);
            }
        }
    },

    addScoreHammerIndex (oldScore, score) {
        for (let i = 0; i < this.scoreTools.length; i++) {
            var threshold = this.scoreTools[i].threshold;
            if (Math.floor(score / threshold) > Math.floor(oldScore / threshold)) {
                this.addHammer(this.scoreTools[i]);
            }
        }
    },

    subHammer (type, hammerIndex) {
        var hammer;
        if (type == "clean") {
            hammer = this.cleanTools[hammerIndex];
        } else if (type == "score") {
            hammer = this.scoreTools[hammerIndex];
        }
        if (hammer.value > 0) {
            hammer.value--;
            hammer.label.string = hammer.value +'';

            if (hammer.value == 0) {
                hammer.hammer.parent.opacity = 150;
            }
        }
    },

    addHammer (hammer) {
        if (hammer.value < hammer.max) {
            hammer.value++;
            hammer.label.string = hammer.value +'';

            hammer.hammer.parent.opacity = 255;
        }
    },

    isInside (worldPos) {
        var pos = this.node.convertToNodeSpaceAR(worldPos);
        return pos.x >= 0 && pos.x <= this.node.width
            && pos.y <= -20 && pos.y >= -this.node.height;
    },

    getHammer (worldPos) {
        var pos = this.node.convertToNodeSpaceAR(worldPos);
        var index = Math.floor(pos.x / (this.node.width / 4));
        var hammer;
        if (index > 1) {
            index = index - this.cleanTools.length;
            hammer = this.scoreTools[index];
            hammer.bigType = "score";
        } else {
            hammer = this.cleanTools[index];
            hammer.bigType = "clean";
        }
        hammer.sourceIndex = index;
        hammer.data = new Object();
        // hammer.data.count = this.toolsConfig.length;
        hammer.data.height = 70;
        hammer.data.width = 70;
        hammer.data.type = hammer.type;
        hammer.data.enabled = hammer.value > 0;
        return hammer;
    },

    destroyAll () {
        for (let i = 0; i < this.tools.length; i++) {
            this.tools[i].value = 0;
            this.tools[i].label.string = '0';
            this.tools[i].hammer.parent.opacity = 150;
        }
    },

    getHammers () {
        var hammers = new Array();

        for (let i = 0; i < this.cleanTools.length; i++) {
            hammers.push(this.cleanTools[i]);
        }

        for (let i = 0; i < this.scoreTools.length; i++) {
            hammers.push(this.scoreTools[i]);
        }

        return hammers;
    }
});
