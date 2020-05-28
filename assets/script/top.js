var Global = require('global')
var CreateDataManager = require('dataManager')

cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel: cc.Label,
        scoreHistoryLabel: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.top = this;
        this.dataManager = CreateDataManager();
        this.scoreNum = this.scoreHistoryNum = 0;
    },

    start () {
        this.dataManager.load();
        this.loadHistoryScore();
    },

    onClickSetting () {
        this.showSettingModel();
    },

    addScore (score) {
        this.scoreNum += score;
        this.scoreLabel.string = this.scoreNum + '';

        if (this.scoreNum > this.scoreHistoryNum) {
            this.updateScoreHistory();
        }
    },

    updateScoreHistory () {
        this.scoreHistoryNum = this.scoreNum;
        this.scoreHistoryLabel.string = this.scoreHistoryNum + '';

        this.dataManager.updateScore(this.scoreHistoryNum);
    },

    loadHistoryScore () {
        this.scoreHistoryNum = this.dataManager.getScore();
        this.scoreHistoryLabel.string = this.scoreHistoryNum + '';
    },

    showSettingModel () {
        Global.setting.show();
    },

    getScore () {
        return this.scoreNum;
    },

    destroyAll () {
        this.scoreNum = 0;
        this.scoreLabel.string = this.scoreNum + '';
    }

    // update (dt) {},
});
