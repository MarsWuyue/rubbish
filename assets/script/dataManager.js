function createDataManager () {
    var obj = new Object();

    obj.userData = {}

    obj.load = function() {
        var str = cc.sys.localStorage.getItem('userData');
        if (str == null || str == '') {
            obj.userData = {
                "score": 0
            };
            return;
        }
        obj.userData = JSON.parse(str);
    }

    obj.save = function () {
        var str = JSON.stringify(obj.userData);
        cc.sys.localStorage.setItem('userData', str);
    }

    obj.updateScore = function (score) {
        obj.userData.score = score;
        obj.save();
    }

    obj.getScore = function () {
        if (obj.userData.score == null) {
            obj.userData.score = 0;
        }
        return obj.userData.score;
    }

    return obj;
}
module.exports = createDataManager;