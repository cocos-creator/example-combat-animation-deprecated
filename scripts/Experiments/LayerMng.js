var LayerMng = Fire.Class({
    extends: Fire.Behavior,
    properties: {
        layers: {
            default: [],
            type: [cc.Node]
        }
    },
    onLoad: function() {
        for (var i = 0; i < this.layers.length; ++i) {
            var entry = this.layers[i];
            var layer = new cc.Layer();
            layer.setName(entry.getName() + '_bake');
            var order = entry.getOrderOfArrival();
            entry.removeFromParent(false);
            Fire.engine.getCurrentSceneN().addChild(layer, 0);
            layer.setOrderOfArrival(order);
            layer.addChild(entry);
            layer.bake();
        }
    }
});
