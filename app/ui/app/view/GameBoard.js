Ext.define('MemoryGame.view.GameBoard', {
    extend: 'Ext.container.Container',
    requires: [
        'Ext.layout.container.Table'
    ],
    uses: [
        'MemoryGame.util.Resource'
    ],
    xtype: 'app-gameboard',
    layout: {
        type: 'table',
        columns: 4
    },
    constructor: function (cfg) {
        cfg.items = this.generateImgSlots();
        this.callParent(arguments);
    },
    initComponent: function () {
        this.callParent(arguments);
    },
    /**
     *  @private
     *  @method
     *
     *  Generates a batch of card image components for the game board, 16 in this case
     *  @return {Array} An array of image components
    **/
    generateImgSlots: function () {
        var items = [],
            i;

        for (i = 0; i < 16; i++) {
            items.push({
                xtype: 'image',
                itemId: 'card-' + i,
                cls: 'board-game-card',
                src: MemoryGame.util.Resource.getBackgroundImage()
            });
        }

        return items;
    }
});