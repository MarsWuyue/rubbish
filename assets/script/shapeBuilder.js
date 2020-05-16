cc.Class({
    extends: cc.Component,

    properties: {
        m_shapeAtlas: cc.SpriteAtlas,
        m_shapes: [cc.Prefab],
        m_data: cc.JsonAsset
    },

    onLoad () {
        window.g_shapeBuilder = this;
        this.m_rotations = [0, 270, 180, 90];
        this.m_typeProbability = [5, 5, 10, 15, 15, 10, 15, 15, 10];
        this.m_calcProbability = new Array();
    },

    start () {
        for (let i = 0; i < this.m_typeProbability.length; i++) {
            if (i == 0) {
                this.m_calcProbability.push(this.m_typeProbability[i]);
            } else {
                this.m_calcProbability.push(this.m_calcProbability[i - 1] + this.m_typeProbability[i])
            }
        }
    },

    createShape () {
        var type = this.createTypeByProbability();
        var rotation = randomNum(0, 3);
        var shape = cc.instantiate(this.m_shapes[type]);
        shape.rotation = this.m_rotations[rotation];
        shape.active = true;
        var node = new Object();
        node.node = shape;
        node.position = this.m_data.json.shapes[type].positions[rotation];
        return node;
    },

    createTypeByProbability () {
        var random = randomNum(0, 100);
        cc.log(random);
        for (let i = 0; i < this.m_calcProbability.length; i++) {
            if (random <= this.m_calcProbability[i]) {
                return i;
            }
        }
        return 0;
    }

    // update (dt) {},
});
