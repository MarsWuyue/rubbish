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
    },

    start () {

    },

    createShape () {
        var type = randomNum(0, 11);
        if (type > 8) {
            if (type % 2 == 0) {
                type = 8;
            } else {
                type = 7;
            }
        }
        var rotation = randomNum(0, 3);
        var shape = cc.instantiate(this.m_shapes[type]);
        shape.rotation = this.m_rotations[rotation];
        shape.active = true;
        var node = new Object();
        node.node = shape;
        node.position = this.m_data.json.shapes[type].positions[rotation];
        return node;
    }

    // update (dt) {},
});
