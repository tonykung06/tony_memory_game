Ext.define('MemoryGame.view.Main', {
    extend: 'Ext.container.Container',
    requires: [
        'Ext.tab.Panel',
        'MemoryGame.view.GameBoard',
        'Ext.layout.container.Border',
        'Ext.layout.container.HBox',
        'MemoryGame.plugin.GridTooltip'
    ],
    xtype: 'app-main',
    layout: {
        type: 'border'
    },
    items: [{
        //the side panel on the right of the screen
        region: 'east',
        xtype: 'gridpanel',
        itemId: 'latest-score-ranking',
        title: 'Author: Kung Wai Kit, Tony',
        collapsible: true,
        flex: 2,
        store: 'HighScores',
        resizable: false,
        plugins: [{
            ptype: 'gridtooltip'
        }],
        columns: [{
            text: 'Name',
            dataIndex: 'name',
            menuDisabled: true,
            flex: 2
        }, {
            text: 'Email',
            dataIndex: 'email',
            menuDisabled: true,
            flex: 2
        }, {
            text: 'Score',
            dataIndex: 'score',
            menuDisabled: true,
            flex: 1
        }],
        bbar: {
            xtype: 'button',
            scale: 'large',
            ui: 'my',
            itemId: 'restart-btn',
            text: 'Restart'
        },
        dockedItems: [{
            xtype: 'toolbar',
            layout: {
                type: 'hbox',
                pack: 'center'
            },
            dock: 'top',
            items: [{
                xtype: 'image',
                src: 'resources/logo.png',
                cls: 'memorygame-logo'
            }]
        }]
    }, {
        //the main game board on the left
        xtype: 'container',
        cls: 'memorygame-gameboard-wrapper',
        layout: {
            type: 'hbox',
            pack: 'center'
        },
        region: 'center',
        flex: 5,
        items: [{
            xtype: 'app-gameboard',
            width: 320,
            height: 412
        }]
    }]
});