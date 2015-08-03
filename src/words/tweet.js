////////////////////////////////////////////////////////////////////
// tweet.js contains the code for the tweet at the end of one round, input and sending
//

$42.TWEET_TEXT_WIDTH = 640;
$42.TWEET_TEXT_HEIGHT = 800;
$42.TWEET_TEXT_POS = cc.p(0, 1136-$42.TWEET_TEXT_HEIGHT);
$42.TWEET_TEXT_COLOR = cc.color(255,255,240,50);
$42.TWEET_TEXT_PADDING = 30;
$42.TWEET_TEXT_LINEHEIGHT = 65;
$42.TWEET_TEXT_SPACE_WIDTH = 15;
$42.TWEET_SHORTIES_WIDTH = 640;
$42.TWEET_SHORTIES_HEIGHT = 160;
$42.TWEET_SHORTIES_POS = cc.p(0, 1136-$42.TWEET_TEXT_HEIGHT-$42.TWEET_SHORTIES_HEIGHT);
$42.TWEET_SHORTIES_COLOR = cc.color(240,240,255,100);
$42.TWEET_SHORTIES_LINEHEIGHT = 65;
$42.TWEET_SHORTIES_SPACE_WIDTH = 40;
$42.TWEET_SHORTIES_PADDING = 20;

var TWEET_MODULE = function(layer) {
	var ml = layer,
        tLayer = null,      // tweet layer
        txLayer = null,     // text layer
        shLayer = null,     // shorties layer
        mvLayer = null,     // movable layer
        menu = null,    // menu
        movableWords = [],
        selectableWords = [],
        shortiesWidth = null,
        shortiesXPos = null,
        touchListener = null,
        touchStartPoint = null,
        touchLastPoint = null,
        touchStartPoint = null,
        touchStartTime = null,
        touchStartPoint = null,
        touchMovingLabel = null,
        touchMovingOffset = null,
        touchMovingVisible = false,
        touchShortiesXPos = null,
        touchShortiesLastX = null,
        touchShortiesSpeed = null,
        touchRubberBand = null,

        tmp = 0;

    ml.hookTweet = function(cb) {
        init();
    };

    var init = function() {

        tLayer = new cc.Layer();
        ml.addChild(tLayer, 10);
        _42_retain(tLayer, "Tweet layer");

        ////////////////////////////////////
        // init text layer
        txLayer = new cc.LayerColor($42.TWEET_TEXT_COLOR, $42.TWEET_TEXT_WIDTH, $42.TWEET_TEXT_HEIGHT);
        txLayer.setPosition($42.TWEET_TEXT_POS);
        tLayer.addChild(txLayer);
        _42_retain(txLayer, "Tweet text layer");
        putWordsIntoTextLayer();

        ////////////////////////////////////
        // init shorties layer
        shLayer = new cc.LayerColor($42.TWEET_SHORTIES_COLOR, $42.TWEET_SHORTIES_WIDTH, $42.TWEET_SHORTIES_HEIGHT);
        tLayer.addChild(shLayer);
        shLayer.setPosition($42.TWEET_SHORTIES_POS);
        _42_retain(shLayer, "Tweet shorties layer");
        putWordsIntoShortiesLayer();

        /////////////////////////////////////
        // Scheduler
        tLayer.update = update;

        initListeners();
        tLayer.scheduleUpdate();
    };

    var exit = function() {
        stopListeners();
        tLayer.unscheduleUpdate();
    };

    var putWordsIntoTextLayer = function() {
        var wt = $42.wordTreasure,
            padding = $42.TWEET_TEXT_PADDING,
            textWidth = $42.TWEET_TEXT_WIDTH - padding * 2,
            textHeight = $42.TWEET_TEXT_HEIGHT;
        
        for( var i=0,x=0,y=0 ; i<wt.length ; i++ ) {

			var label = cc.LabelTTF.create(wt[i].word, _42_getFontName(res.exo_regular_ttf) , 44),
                size = label.getContentSize();
            
            if( x + size.width > textWidth ) {
                x = 0;
                y += $42.TWEET_TEXT_LINEHEIGHT;
            }

			label.setPosition(cc.p(padding + x + size.width/2, textHeight - padding - y - size.height/2));
			label.setColor(cc.color(0,0,0));
			_42_retain(label, "moveable word");	
			txLayer.addChild(label, 5);
            label.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.delayTime(Math.random()*84+84),
                        cc.EaseSineIn.create(
                            cc.scaleTo(1,0.9)
                        ),
                        cc.EaseSineOut.create(
                            cc.scaleTo(1,1)
                        )
                    )
                )
            );

            movableWords.push(label);{
                word: wt[i].word,
                label: label
            });

            x += size.width + $42.TWEET_TEXT_SPACE_WIDTH;
        }
    };

    putWordsIntoShortiesLayer = function() {
        var sh = $42.shorties,
            padding = $42.TWEET_TEXT_PADDING;

        ////////////////////////////////////
        // init moving shorties layer
        mvLayer = new cc.LayerColor(cc.color(0,0,0,0), 0, $42.TWEET_SHORTIES_HEIGHT);
        shLayer.addChild(mvLayer);
        mvLayer.setPosition(shortiesXPos, 0);
        mvLayer.setOpacity(0);
        _42_retain(mvLayer, "Tweet shorties moving layer");
        
        for( var i=0 ; i<sh.length ; i++ ) {

			var label = cc.LabelTTF.create(sh[i], _42_getFontName(res.exo_regular_ttf) , 44),
                size = label.getContentSize();
            
            selectableWords.push({
                word: sh[i],
                label: label
            });

            mvLayer.addChild(label);
        }

        shortiesWidth = distributeShorties();
        shortiesXPos = 0;
        mvLayer.changeWidth(shortiesWidth);
    };

    distributeShorties = function() {
        var sw = selectableWords,
            padding = $42.TWEET_TEXT_PADDING;
       
        ///////////////////////////////
        // Sort shorties
        sw.sort(function(a,b) { return a.word < b.word? -1:1; });

        ///////////////////////////////
        // Determine positions
        // First: get total width
        for( var i=0,tWidth=0 ; i<sw.length ; i++ ) tWidth += sw[i].label.getContentSize().width + $42.TWEET_SHORTIES_SPACE_WIDTH;
        // Second: distribute shorties
        yOffset = $42.TWEET_SHORTIES_HEIGHT - $42.TWEET_SHORTIES_PADDING - $42.TWEET_SHORTIES_LINEHEIGHT/2;
        for( var i=0,x=0,y=0 ; i<sw.length ; i++ ) {
            var width = sw[i].label.getContentSize().width;
            if( y === 0 && x + width/2 > tWidth/2 ) {
                var half1 = x,
                    half2 = tWidth-x;
                tWidth = Math.max(half1, half2);
                x = 0;
                y = $42.TWEET_SHORTIES_LINEHEIGHT;
            }
            sw[i].label.setPosition(cc.p(x+width/2,yOffset - y));

            x += width + $42.TWEET_SHORTIES_SPACE_WIDTH;
        }
        // Third: Align them to center and set final position
        var align1 = tWidth-half1,
            align2 = tWidth-half2;
        for( var i=0 ; i<sw.length ; i++ ) {
            var pos   = sw[i].label.getPosition();

            pos.x += (pos.y===yOffset? align1:align2) + $42.TWEET_SHORTIES_PADDING;

            sw[i].label.setPosition(pos);
        }

        return tWidth;
    };
    
    /////////////////////////////////////////////////////////////////////////////
    // initListeners works on the touch and keyboard inputs
    initListeners = function() {
	
        touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesBegan: function(touches, event) {

                ///////////////////////////////////
                // Get position and time
                var touch = touches[0],
                    loc = touch.getLocation();	            		
                
                touchStartPoint = {
                    x: loc.x,
                    y: loc.y
                };
                touchLastPoint = {
                    x: loc.x,
                    y: loc.y
                };	
                touchStartTime = new Date().getTime();
                
                var getLabel = function(box, words, layer, cb) {

                    if( cc.rectContainsPoint(box, loc) ) {

                        for( var i=0,found=false ; i<words.length ; i++ ) {
                            var box = words[i].label.getBoundingBox(),
                                pos = layer.convertToWorldSpace(words[i].label.getPosition());

                            box = {
                                width: box.width,
                                height: box.height,
                                x: pos.x - box.width/2,
                                y: pos.y - box.height/2
                            };
                            if( cc.rectContainsPoint(box, loc) ) {
                                found = true;
                                break;
                            }
                        }

                        if( found ) {
                            touchMovingLabel = cc.LabelTTF.create(words[i].word, _42_getFontName(res.exo_regular_ttf) , 44);
                            touchMovingOffset = {
                                x: pos.x - loc.x,
                                y: pos.y - loc.y
                            }
                            touchMovingLabel.setPosition(pos);
                            tLayer.addChild(touchMovingLabel,10);
                            _42_retain(touchMovingLabel,"moving label");

                            touchMovingLabel.runAction(cc.scaleTo(0.16,1.5));
                            touchMovingVisible = true;

                            if( typeof cb === "function" ) cb(true);
                        } else {
                            if( typeof cb === "function" ) cb(false);
                        }
                    }
                };

                getLabel(shLayer.getBoundingBox(), selectableWords, mvLayer, function(newWord) { 
                        touchShortiesXPos = shortiesXPos;
                });
                getLabel(txLayer.getBoundingBox(), movableWords, txLayer, function(newWord) {

                });

                if( cc.rectContainsPoint(txLayer.getBoundingBox(), loc) ) {
                    
                }
            },
                
            onTouchesMoved: function(touches, event, pos) {
                
                var touch = touches[0],
                    loc = touch.getLocation(),
                    offset = {
                        x: loc.x - touchStartPoint.x,
                        y: loc.y - touchStartPoint.y
                    };
                
                    touchLastPoint = {
                    x: loc.x,
                    y: loc.y
                };

                if( touchShortiesXPos !== null && Math.abs(offset.x) > Math.abs(offset.y) && Math.abs(offset.x) > 6 && cc.rectContainsPoint(shLayer.getBoundingBox(), loc) ) {
                    var rightBorder = $42.TWEET_SHORTIES_WIDTH - shortiesWidth - $42.TWEET_SHORTIES_PADDING;
                    shortiesXPos = touchShortiesXPos + offset.x;
                    if( shortiesXPos > 0 ) {
                        touchRubberBand = Math.sqrt(shortiesXPos)*3;
                        shortiesXPos = 0;
                    } else if( shortiesXPos < rightBorder ) {
                        touchRubberBand = -Math.sqrt(rightBorder-shortiesXPos)*3;
                        shortiesXPos = rightBorder;
                    } else {
                        touchRubberBand = 0;
                    }

                    mvLayer.setPosition(shortiesXPos+touchRubberBand, 0);

                    if( touchMovingVisible ) {
                        touchMovingVisible = false;
                        touchMovingLabel.runAction(cc.fadeOut(0.16));
                    }
                } else if( touchMovingLabel ) {
                    if( !touchMovingVisible ) {
                        touchMovingVisible = true;
                        touchMovingLabel.runAction(cc.fadeIn(0.16));
                    }

                    touchMovingLabel.setPosition(cc.p(loc.x + touchMovingOffset.x, loc.y + touchMovingOffset.y));
                }
            },
                
            onTouchesEnded: function(touches, event, pos){

                var touch = touches[0],
                    loc = touch.getLocation();	            		

                if( touchShortiesXPos !== null ) {
                    touchShortiesXPos = null;

                    mvLayer.setPosition(shortiesXPos, 0);
                }
                
                if( touchMovingLabel ) {
                    touchMovingLabel.runAction(
                        cc.sequence(
                            cc.fadeOut(0.16),
                            cc.callFunc(function() {
                                tLayer.removeChild(touchMovingLabel);
                                _42_release(touchMovingLabel);
                                touchMovingLabel = null;
                            })
                        )
                    );
                }
            }
        });
            
        cc.eventManager.addListener(touchListener, tLayer);
    }; 

    var stopListeners = function() {
        cc.eventManager.stopListener(touchListener); 
    };
   
    var updateCnt = 0; 
    var update = function(dt) {
        if( touchShortiesXPos !== null ) {
            touchShortiesSpeed = touchShortiesSpeed*0.8 + (shortiesXPos - touchShortiesLastX)*0.2;
            touchShortiesLastX = shortiesXPos;
        } else if( touchShortiesSpeed ) {
            var rightBorder = $42.TWEET_SHORTIES_WIDTH - shortiesWidth - $42.TWEET_SHORTIES_PADDING;
            
            shortiesXPos += touchShortiesSpeed;

            if( shortiesXPos > 0 ) {
                shortiesXPos = 0;
                touchShortiesSpeed = 0;
            }
            else if( shortiesXPos < rightBorder ) {
                shortiesXPos = rightBorder;
                touchShortiesSpeed = 0;
            } else {
                touchShortiesSpeed *= 0.99;
                if( Math.abs(touchShortiesSpeed) < 0.5 ) touchShortiesSpeed = 0;
            }

            mvLayer.setPosition(shortiesXPos, 0);
        }
    };
};    
