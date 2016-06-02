Ext.define('MemoryGame.Application', {
    name: 'MemoryGame',

    extend: 'Ext.app.Application',

    views: [
        // TODO: add views here
    ],

    controllers: [
        // TODO: add controllers here
        'Main',
        'GameBoard'
    ],

    stores: [
        // TODO: add stores here
    ],

    init: function (application) {
        //Ext.FocusManager.enable(true);
    }
});