Ext.define('MemoryGame.util.Resource', {
    singleton: true,
    getImageFullPath: function (imageFile) {
        return 'resources/' + imageFile;
    },
    getBackgroundImage: function () {
        return MemoryGame.util.Resource.getImageFullPath('card_bg.gif');
    },
    getTransparentImage: function () {
        return MemoryGame.util.Resource.getImageFullPath('transparent.png');
    },
    isBackgroundImage: function (imageFile) {
        return String(imageFile).indexOf('card_bg') > -1;
    },
    isColourImage: function (imageFile) {
        return String(imageFile).indexOf('colour') > -1;
    },
    isTransparentImage: function (imageFile) {
        return String(imageFile).indexOf('transparent') > -1;
    }
});