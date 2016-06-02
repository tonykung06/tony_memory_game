/**
 *  @class MemoryGame.model.HighScore
 *  TODO: better pass fields from backend to this class, pros: more configurable
 */
Ext.define('MemoryGame.model.HighScore', {
    extend: 'Ext.data.Model',
    idProperty: '_id',
    fields: [
        '_id',
        'name',
        'email',
        'score'
    ],
    proxy: {
        type: 'rest',
        idParam: '_id',
        url: '/api/highscores',
        reader: {
            type: 'json'
        },
        api: {
            create: '/api/highscores',
            read: '/api/highscores',
            update: '/api/highscores',
            destroy: '/api/highscores'
        }
    }
});