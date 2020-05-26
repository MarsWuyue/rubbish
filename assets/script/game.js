var Global = require('global')

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.loader.loadResDir("prefab/gameUI", function (err, prefabs) {
            this.loadGameUI(prefabs);
            this.registerFailedAction();
            this.registerClearEndAction();
        }.bind(this));
    },

    start () {
    },
    // update (dt) {},

    loadGameUI (prefabs) {
        for (let i = 0; i < prefabs.length; i++) {
            var node = cc.instantiate(prefabs[i]);
            this.node.addChild(node);
        }
    },

    registerFailedAction () {
        Global.movedArea.registerTouchEndEvent(function (){
            var hammers = Global.toolArea.getHammers();
            for (let i = 0; i < hammers.length; i++) {
                if (hammers[i].value != 0) return;
            }

            var shapes = Global.sourceArea.getShapes();
            for (let i = 0; i < shapes.length; i++) {
                if (shapes[i] == null) continue;
                if (Global.placedArea.canPlaced(shapes[i].data.checklist)) {
                    return;
                }
            }
            Global.failed.show();
        });
    },

    registerClearEndAction () {
        Global.placedArea.registerClearEndActions(function (rows, cols, oldScore, score){
            var clearCount = rows.length + cols.length;
            Global.toolArea.addTool(clearCount, oldScore, score);
        });
    }
});
