/**
 *  @class MemoryGame.store.HighScores
 */
Ext.define('MemoryGame.store.HighScores', {
    extend: 'Ext.data.Store',
    uses: [
        'Ext.JSON'
    ],
    model: 'MemoryGame.model.HighScore',
    sorters: [{
        property: 'score',
        direction: 'DESC'
    }]
});