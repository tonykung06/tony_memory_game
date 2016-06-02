Ext.define('MemoryGame.controller.GameBoard', {
    extend: 'Ext.app.Controller',
    refs: [{
        ref: 'mainContainer',
        selector: 'app-main'
    }, {
        ref: 'gameBoardContainer',
        selector: 'app-gameboard'
    }, {
        ref: 'scoreTable',
        selector: '#latest-score-ranking'
    }],
    uses: [
        'Ext.window.MessageBox'
    ],
    
    //-------state variables----------
    activeCards: [],            //what cards are active and flipped up
    cards: null,                //the pool of cards where cards are picked randomly for showing up
    score: 0,                   //the latest score for CURRENT USER
    currentScoreRecord: null,   //the data store record for CURRENT USER
    lastCardXY: null,           //XY position of the last card activated
    processingCards: false,     //true to tell it is in the course of flipping/animating the cards
    //-------END state variables------
    
    init: function () {
        var me = this;
        me.control({
            'app-gameboard image': {
                afterrender: {
                    fn: function (img) {
                        var nextImage,
                            prevImage,
                            i;

                        img.getEl().set({
                            tabindex: 1
                        });
                        img.getEl().on('keydown', me.imageKeydownHandler, me);
                    }
                }
            },
            'app-gameboard': {
                afterrender: function () {
                    me.populateCards();
                },
                afterlayout: {
                    fn: function (gameBoardCtr, eOpts) {
                        //event delegation for optimizing performance
                        gameBoardCtr.getEl().on('click', me.handleCardClick,
                            me, {
                                delegate: '.board-game-card',
                            });
                    },
                    single: true
                },
                restart: function () {
                    me.resetGameBoard();
                    Ext.Msg.alert('Restart the game', 'The game has been reset.');
                }
            }
        });
    },
    /**
     *  @private
     *  @method imageKeydownHandler
     *  @param {Ext.EventObject} eventObj
     *  @param {HTMLElement} targetDomEl
     *
     *  handle the keydown event on the cards
     *
     *  @return undefined
     */
    imageKeydownHandler: function (eventObj, targetDomEl) {
        var key = eventObj.getKey(),
            me = this,
            img = Ext.getCmp(targetDomEl.id);

        if (key === Ext.EventObject.RIGHT) {
            nextImage = img.nextSibling('image');
            nextImage && nextImage.getEl().focus();
        } else if (key === Ext.EventObject.LEFT) {
            prevImage = img.previousSibling('image');
            prevImage && prevImage.getEl().focus();
        } else if (key === Ext.EventObject.UP) {
            prevImage = img.previousSibling('image');
            for (i = 0; i < 3 && prevImage; i++) {
                prevImage = prevImage.previousSibling('image');
            }
            prevImage && prevImage.getEl().focus();
        } else if (key === Ext.EventObject.DOWN) {
            nextImage = img.nextSibling('image');
            for (i = 0; i < 3 && nextImage; i++) {
                nextImage = nextImage.nextSibling('image');
            }
            nextImage && nextImage.getEl().focus();
        } else if (key === Ext.EventObject.ENTER) {
            me.lastCardXY = img.getXY();
            img.getEl().dom.click();
        }
    },
    
    /**
     *  @private
     *  @method handleCardClick
     *  @param {Ext.EventObject} evtObj
     *  @param {HTMLElement} targetDom
     *
     *  handle the click event on the cards
     *
     *  @return undefined
     */
    handleCardClick: function (evtObj, targetDom) {
        var me = this,
            originalImageSrc = targetDom.src,
            resourceUtil = MemoryGame.util.Resource,
            targetDomEl = Ext.get(targetDom),
            cb;

        if (me.isProcessingCards()) {
            return;
        }

        if (resourceUtil.isBackgroundImage(originalImageSrc)) {
            me.flipCardUp(targetDomEl);
            me.activateCard(targetDomEl);
        } else if (resourceUtil.isColourImage(originalImageSrc)) {
            me.flipCardDown(targetDomEl);
            me.inactivateCard(targetDomEl);
        } else if (resourceUtil.isTransparentImage(originalImageSrc)) {
            return;
        } else {
            //<debug>
            Ext.Error.raise('what is this image path: ' + originalImageSrc);
            //</debug>  

            return;
        }

        //add/deduct score
        if (me.isReachMaxCountOfActiveCards()) {
            me.startProcessCards();
            me.updateScore();
            if (me.isWin()) {
                cb = function () {
                    me.removeActiveCards();
                    me.inactivateAllCards();
                    if (me.isGameFinished()) {
                        me.completeGame();
                    }
                    me.finishProcessCards();
                };
                me.animateScoreIncrement(evtObj.getXY(), cb);
            } else {
                cb = function () {
                    Ext.Array.forEach(me.activeCards, function (item) {
                        me.flipCardDown(item);
                    });
                    me.inactivateAllCards();
                    me.finishProcessCards();
                };
                me.animateScoreDecrement(evtObj.getXY(), cb);
            }
        }
    },
    
    /**
     *  @private
     *  @method resetGameBoard
     *
     *  reset the game states
     *
     *  @return undefined
     */
    resetGameBoard: function () {
        this.activeCards = [];
        this.cards = null;
        this.lastCardXY = null;
        this.score = 0;
        this.processingCards = false;
        this.populateCards();

        if (this.currentScoreRecord) {
            this.getScoreTable().getSelectionModel().deselect(this.currentScoreRecord);
            this.getScoreTable().getStore().remove(this.currentScoreRecord);
            this.currentScoreRecord = null;
        }

        var gameCards = this.getGameBoardContainer().query('image');
        Ext.Array.forEach(gameCards, function (card) {
            var domEl = card.getEl();
            domEl.removeCls('transparent-card');
            domEl.dom.src = MemoryGame.util.Resource.getBackgroundImage();
            domEl.set({
                "data-gameboardcolorimage": null
            });
        });
    },
    
    /**
     *  @private
     *  @method isProcessingCards
     *
     *  Tells if the active cards are being processed (animating/fliping)
     *
     *  @return {Boolean} True if the active cards are being procssed
     */
    isProcessingCards: function () {
        return this.processingCards;
    },
    startProcessCards: function () {
        this.processingCards = true;
    },
    finishProcessCards: function () {
        this.processingCards = false;
    },
    
    /**
     *  @private
     *  @method animateScoreDecrement
     *  @param {Array} xy
     *  @param {Function} cb
     *
     *  Show and hide the score box with animation on the UI.
     *
     *  @return undefined
     */
    animateScoreDecrement: function (xy, cb) {
        this.animateScoreUpdate(xy, '-1', cb);
    },
    animateScoreIncrement: function (xy, cb) {
        this.animateScoreUpdate(xy, '+1', cb);
    },
    animateScoreUpdate: function (xy, score, cb) {
        var me = this,
            scoreDeductAnimatedCmp = Ext.create('Ext.Component', {
                floating: true,
                cls: 'memorygame-gameboard-score-box',
                html: score,
            });

        if (xy[0] === 0 && xy[1] === 0) {
            xy = this.lastCardXY;
            xy[0] += 30;
            xy[1] += 40;
        }
        Ext.create('Ext.fx.Anim', {
            target: scoreDeductAnimatedCmp,
            duration: 300,
            keyframes: {
                '0%': {
                    opacity: 0
                },
                '50%': {
                    opacity: 1
                },
                '100%': {
                    opacity: 0
                }
            },
            listeners: {
                afteranimate: function (anim) {
                    scoreDeductAnimatedCmp.destroy();
                    //                    me.getGameBoardContainer().unmask();
                    cb();
                }
            }
        });
        //        me.getGameBoardContainer().mask();
        scoreDeductAnimatedCmp.showAt(xy);
    },
    
    /**
     *  @private
     *  @method isGameFinished
     *
     *  Tells if the game is done.
     *
     *  @return {Boolean} True to signify that the game is finished.
     */
    isGameFinished: function () {
        return this.getGameBoardContainer().query('image{hasCls("transparent-card")}').length === 16;
    },
    
    /**
     *  @private
     *  @method completeGame
     *
     *  Do processing on game complete.
     *
     *  @return undefined
     */
    completeGame: function () {
        var me = this;
        Ext.create('Ext.window.Window', {
            title: 'Submit the game result',
            height: 280,
            width: 300,
            layout: 'fit',
            closable: false,
            listeners: {
                beforeshow: function () {
                    me.getMainContainer().getEl().mask();
                },
                beforedestroy: function () {
                    me.getMainContainer().getEl().unmask();
                }
            },
            items: {
                xtype: 'form',
                layout: 'form',
                border: false,
                bodyPadding: 10,
                bbar: [{
                    xtype: 'button',
                    item: 'user_info_save_btn',
                    text: 'Save',
                    formBind: true,
                    flex: 1,
                    listeners: {
                        click: function (btnCmp, eventObj) {
                            var form = btnCmp.up('form'),
                                formValues = form.getValues(),
                                scoreTableStore = me.getScoreTable().getStore();

                            me.currentScoreRecord.set(formValues);
                            scoreTableStore.sync({
                                success: function (batchOperation) {
                                    btnCmp.up('window').close();
                                }
                            });
                        }
                    }
                }, {
                    xtype: 'button',
                    item: 'user_info_save_btn',
                    text: 'Restart',
                    flex: 1,
                    listeners: {
                        click: function (btnCmp, eventObj) {
                            btnCmp.up('window').close();
                            me.getGameBoardContainer().fireEvent('restart');
                        }
                    }
                }],
                fieldDefaults: {
                    labelAlign: 'top'
                },
                items: [{
                    xtype: 'displayfield',
                    fieldLabel: 'Score',
                    name: 'score',
                    value: me.score
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'Name',
                    allowOnlyWhitespace: false,
                    name: 'name'
                }, {
                    xtype: 'textfield',
                    fieldLabel: 'Email Address',
                    allowOnlyWhitespace: false,
                    name: 'email',
                    vtype: 'email'
                }]
            }
        }).show();
    },
    
    /**
     *  @private
     *  @method populateCards
     *
     *  generate the cards
     *
     *  @return undefined
     */
    populateCards: function () {
        var i, j;
        this.cards = [];
        for (i = 0; i < 2; i++) {
            for (j = 1; j < 9; j++) {
                this.cards.push(j);
            }
        }
    },
    
    /**
     *  @private
     *  @method populateCards
     *
     *  Randomly pick a card.
     *
     *  @return {String} Full path to the card image
     */
    pickACardImagePath: function () {
        var cardIndex = Ext.Number.randomInt(0, this.cards.length - 1),
            cardImageFile = 'colour' + Ext.Array.splice(this.cards, cardIndex, 1)[0] + '.gif';

        return MemoryGame.util.Resource.getImageFullPath(cardImageFile);
    },
    
    /**
     *  @private
     *  @method isPreviouslyFliped
     *  @param {Ext.dom.Element} domEl
     *
     *  Tells if domEl card was previously flipped over.
     *
     *  @return {Boolean} True to tell it was flipped over before.
     */
    isPreviouslyFliped: function (domEl) {
        return MemoryGame.util.Resource.isColourImage(domEl.getAttribute('data-gameboardcolorimage'))
    },
    
    /**
     *  @private
     *  @method flipCardUp
     *
     *  Flip the domEl card up.
     *
     *  @return undefined
     */
    flipCardUp: function (domEl) {
        var me = this;
        if (this.isPreviouslyFliped(domEl)) {
            this.flipToPreviousCard(domEl);
        } else {
            domEl.dom.src = me.pickACardImagePath();
        }
        domEl.setStyle('opacity', '1');
    },
    flipCardDown: function (domEl) {
        domEl.set({
            "data-gameboardcolorimage": domEl.dom.src
        });
        domEl.dom.src = MemoryGame.util.Resource.getBackgroundImage();
        domEl.setStyle('opacity', '');
    },
    
    /**
     *  @private
     *  @method flipToPreviousCard
     *
     *  Since this card was previously flipped over, we just want to restore to that card.
     *
     *  @return undefined
     */
    flipToPreviousCard: function (domEl) {
        var dom = domEl.dom;
        dom.src = domEl.getAttribute('data-gameboardcolorimage');
        domEl.set({
            "data-gameboardcolorimage": null
        });
    },
    
    /**
     *  @private
     *  @method isReachMaxCountOfActiveCards
     *
     *  Tells if that is the end of this round
     *
     *  @return {Boolean} True if that is the end of this round
     */
    isReachMaxCountOfActiveCards: function () {
        return this.activeCards.length >= 2;
    },
    
    /**
     *  @private
     *  @method isReachMaxCountOfActiveCards
     *  @param {Ext.dom.Element} cardDomObj
     *
     *  Mark the card active.
     *
     *  @return undefined
     */
    activateCard: function (cardDomObj) {
        //<debug>
        if (this.activeCards.length >= 2) {
            Ext.Error.raise('Why there are more than two cards active at a time?');
        }
        //</debug>

        this.activeCards.push(cardDomObj);
    },
    inactivateCard: function (card) {
        Ext.Array.remove(this.activeCards, card);
    },
    removeActiveCards: function () {
        var me = this;
        Ext.Array.forEach(me.activeCards, function (item) {
            var dom = item.dom;
            item.addCls('transparent-card');
            dom.src = MemoryGame.util.Resource.getTransparentImage();
            item.set({
                "data-gameboardcolorimage": null
            });
        });
    },
    inactivateAllCards: function () {
        this.activeCards = [];
    },
    updateScore: function () {
        var me = this;
        if (me.isWin()) {
            me.score++;
        } else {
            me.score--;
        }
        me.updateOrCreateRecord();
    },
    
    /**
     *  @private
     *  @method updateOrCreateRecord
     *
     *  Update the data store record with the latest score or create a new data store record if there's none for the CURRENT USER.
     *
     *  @return undefined
     */
    updateOrCreateRecord: function () {
        var me = this,
            scoreGrid = this.getScoreTable(),
            scoreStore = scoreGrid.getStore(),
            selModel = scoreGrid.getSelectionModel(),
            currentScoreRecord = me.currentScoreRecord;

        if (currentScoreRecord) {
            currentScoreRecord.set('score', me.score);
        } else {
            me.currentScoreRecord = currentScoreRecord = scoreStore.add({
                name: 'CURRENT USER',
                email: 'N/A',
                score: me.score
            })[0];
            selModel.select([currentScoreRecord]);
        }
        scoreStore.sort();
    },
    
    /**
     *  @private
     *  @method isWin
     *
     *  Tells if the user wins or loses this round..
     *
     *  @return {Boolean} True to tell the user he/shw wins this round
     */
    isWin: function () {
        var card1 = this.activeCards[0].dom.src,
            card2 = this.activeCards[1].dom.src;

        return card1 === card2;
    }
});