Ext.define('MemoryGame.controller.Main', {
    extend: 'Ext.app.Controller',
    uses: [
        'MemoryGame.util.Resource',
        'Ext.form.Panel',
        'Ext.form.field.Text'
    ],
    models: [
        'HighScore@MemoryGame.model'
    ],
    stores: [
        'HighScores@MemoryGame.store'
    ],
    views: [
        'Main@MemoryGame.view'
    ],
    refs: [{
        ref: 'scoreTable',
        selector: '#latest-score-ranking'
    }, {
        ref: 'gameBoard',
        selector: 'app-gameboard'
    }],
    init: function () {
        var me = this;
        me.control({
            'app-main': {
                afterrender: {
                    fn: function (mainContainer, eOpts) {
                        //placeholder
                    },
                    single: true
                }
            },
            '#latest-score-ranking': {
                afterrender: function (viewCmp, eOpts) {
                    var store = viewCmp.getStore();
                    store.load(); //initial data load
                }
            },
            '#restart-btn': {
                click: {
                    fn: function (btnCmp) {
                        me.getGameBoard().fireEvent('restart');
                    }
                }
            }
        });
    }
});