/*
 * Murbiks Module
 * 
 * Tutorials
 * 
 * 
 * 
 * 
 * */
$42.MURBIKS_LAYER_TAG = 103;
$42.SPEECH_BUBBLE_WIDTH = 540;
$42.SPEECH_BUBBLE_HEIGHT = 450;
$42.SPEECH_BUBBLE_COLOR = cc.color(0,0,70);
$42.SPEECH_BUBBLE_FONTSIZE = 48;
$42.SPEECH_BUBBLE_OPACITY = 230;
$42.SPEECH_BUBBLE_LINE_COLOR = cc.color(170,170,185);
$42.SPEECH_BUBBLE_TAG = 201;
$42.SPEECH_BUBBLE_LINE_TAG = 202;
$42.SPEECH_BUBBLE_CLOUD_TAG = 203;
$42.SPEECH_BUBBLE_BUTTON_TAG = 204;
$42.HAND_TAG = 205;
$42.HAND_ROTATION = -60;
$42.HAND_CONTACT_SIZE = 40;
$42.HAND_CONTACT_COLOR = cc.color(0,0,70);
$42.HAND_CONTACT_TIME = 0.3;
$42.HAND_CONTACT_TIME = 0.3;
$42.TILE1_TAG = 206;
$42.TILE2_TAG = 207;
$42.TILE3_TAG = 208;
$42.TILE4_TAG = 209;
$42.TILE5_TAG = 210;
$42.MARKER_TAG = 211; // -220
$42.WORDFRAME_TAG = 221;
$42.BUBBLE_BUTTON_SCALE = 0.7;
$42.STORY_BACKGROUND_POS = cc.p(320,832);
$42.STORY_BACKGROUND_OPACITY = 90;
$42.STORY_BACKGROUND_SPEED = 1.33;
$42.STORY_MENU_FONT_SIZE = 48;
$42.STORY_MENU_PADDING = 20;
$42.STORY_MENU_TAG = 222;
$42.STORY_SCALE_PRESS_FINGER = 0.9;

var _MURBIKS_MODULE = function(parentLayer) {
	var pl = parentLayer,
		mul = null, // murbics layer
		curTileProgram = null,
		curTileProgramCnt = null,
		curProgram = null,
		anims = {},
        finalCallback = null,
        activeTimeouts = [],
		
        mostafa = null,
		hand = null,
		speechBubbleCloud = null,
		speechBubbleLine = null,
		speechBubble = null,
        tile1 = null,
        tile2 = null,
        tile3 = null,
        tile4 = null,
        tile5 = null,
        wordframe = null,
        storyBackground = null;

    //////////////////////////////////////////////////////////////////////////////////////
    // Animation programs
    // (full list at end of this file)
    //
    var animMostafasGreeting = function(options) {
        stopActionsAndTimeouts();

        var chatWithPlayer = function() {
            var text = $42.t.mostafa.greeting,
                pos = mostafa.getPosition();

            for( var i=0 ; i<text.length ; i++ ) {
                activeTimeouts.push( setTimeout(function(i) {
                    showSpeechBubble(5, text[i], pos, 800); 
                }, 1+i*7500, i));
            }
            if( typeof options.cb === "function" ) options.cb();
        };

        mostafa.setPosition(cc.p(50, 1400));    
        mostafaFlyTo({
            time: options.time, 
            bezier: [
				cc.p( 100, 568),
				cc.p( 500, 668),
				cc.p( 360, 420)
			],
            cb: function() {
                activeTimeouts.push( setTimeout(chatWithPlayer,1000) );
            }
        });
    };

    var animMostafaFlyingAway = function(options) {
        stopActionsAndTimeouts();
        hideSpeechBubble();

        if( mostafa.getPosition().x > cc.width+70 ) mostafa.setPosition(cc.p(-70,cc.height/2));

        var animAction = mostafa.runAction(cc.repeatForever(anims.mostafa_fly)),
			bezier = options.bezier || [
				cc.p( 360, 480),
				cc.p( 500, 668),
				cc.p( 750, 700)
			];
	    _42_retain(animAction, "mostafa animAction fly");
	
	    mostafa.runAction(
            cc.sequence(
                cc.bezierTo(options.time, bezier),
                cc.callFunc(function() {
                    mul.stopAction(animAction);
                    _42_release(animAction);
                    if( typeof options.cb === "function" ) options.cb();
                })
            )
        ); 
    };

    var animStoryBasicConcepts = function(options) {
        stopActionsAndTimeouts();

        var sb = storyBackground;

        var page1 = function(time,cb) {
            var size = sb.getContentSize(),
                time0 = time,
                time1 = 1,
                time2 = 1.1,
                time3 = 0.2,
                time4 = 0.3,
                time5 = 0.7,
                time6 = 0.2,
                time7 = 0.7,
                time8 = 0.3,
                time9 = time2;
            
            tile1.setPosition(cc.p(size.width/2, size.height/2));
            if( !sb.getChildByTag($42.TILE1_TAG) ) sb.addChild(tile1,5,$42.TILE1_TAG);
            
            hand.setPosition(cc.p(size.width, size.height/4));
            hand.setOpacity(0);
            if( !sb.getChildByTag($42.HAND_TAG) ) sb.addChild(hand,10,$42.HAND_TAG);

            tile1.runAction(
                cc.sequence(
                    cc.delayTime(time0+time1+time2+time3+time4),
                    cc.moveBy(time5,cc.p(-200,0)),
                    cc.moveBy(time5*2,cc.p(400,0)),
                    cc.moveBy(time5,cc.p(-200,0)),
                    cc.delayTime(time6),
                    cc.moveBy(time7,cc.p( 100,-100)),
                    cc.moveBy(time7,cc.p(-150, -50))
                )
            );

            var tPos = tile1.getPosition();
            hand.runAction(
                cc.sequence(
                    cc.delayTime(time0),
                    cc.fadeIn(0),
                    cc.EaseSineOut.create(cc.moveTo(time1+time2,cc.p(tPos.x,tPos.y-50))),
                    cc.delayTime(time3),
                    cc.scaleTo(time4,$42.STORY_SCALE_PRESS_FINGER),
                    cc.moveBy(time5,cc.p(-200,0)),
                    cc.moveBy(time5*2,cc.p(400,0)),
                    cc.moveBy(time5,cc.p(-200,0)),
                    cc.delayTime(time6),
                    cc.moveBy(time7,cc.p( 100,-100)),
                    cc.moveBy(time7,cc.p(-150, -50)),
                    cc.scaleTo(time8,1),
                    cc.EaseSineIn.create(cc.moveTo(time9,cc.p(size.width*1.2,size.height/4))),
                    cc.callFunc(cb)
                )
            );    

            activeTimeouts.push( setTimeout(function() {
               showSpeechBubble(0, $42.t.mostafa.basic1, mostafa.getPosition(), 320); 
            }, time0 * 1000) );
        };

        var page2 = function(time, cb) {
            var size = sb.getContentSize(),
                time0 = 1,
                time1 = 1.1,
                time2 = 0.3,
                time3 = 0.6,
                time4 = 0.3;
            
            tile1.setPosition(cc.p(270,170));
            
            hand.setPosition(cc.p(size.width, size.height/4));
            hand.setOpacity(0);

            tile1.runAction(
                cc.sequence(
                    cc.delayTime(time0+time1+time2),
                    cc.rotateBy(time3,180),
                    cc.delayTime(time4+time2),
                    cc.rotateBy(time3,180)
                )
            );

            var tPos = tile1.getPosition();
            hand.runAction(
                cc.sequence(
                    cc.delayTime(time0),
                    cc.fadeIn(0),
                    cc.EaseSineOut.create(cc.moveTo(time1,cc.p(size.width/2,size.height/2))),
                    cc.scaleTo(time2,$42.STORY_SCALE_PRESS_FINGER),
                    cc.EaseSineOut.create(cc.moveTo(time3,cc.p(size.width/2,size.height*0.75))),
                    cc.spawn(
                        cc.scaleTo(time4,1),
                        cc.moveTo(time4, cc.p(size.width/2, size.height/2))
                    ),
                    cc.scaleTo(time2,$42.STORY_SCALE_PRESS_FINGER),
                    cc.EaseSineOut.create(cc.moveTo(time3,cc.p(size.width/2,size.height*0.75))),
                    cc.spawn(
                        cc.scaleTo(time4,1),
                        cc.moveTo(time4, cc.p(size.width/2, size.height/2))
                    ),
                    cc.EaseSineIn.create(cc.moveTo(time1,cc.p(size.width*1.2,size.height*0.25))),
                    cc.callFunc(cb)
                )
            );    

            activeTimeouts.push( setTimeout(function() {
               showSpeechBubble(0, $42.t.mostafa.basic2, mostafa.getPosition(), 320); 
            }, time0 * 1000) );
        };

        var page3 = function(time, cb) {
            var ml = $42.SCENE.mainLayer,
                size = sb.getContentSize(),
                time0 = 1,
                time1 = 4.1,
                time2 = 0.5,
                time3 = 0.3,
                time4 = 1.1;
            
            if( !sb.getChildByTag($42.TILE2_TAG) ) sb.addChild(tile2,5,$42.TILE2_TAG);
            if( !sb.getChildByTag($42.WORDFRAME_TAG) ) sb.addChild(wordframe,0,$42.WORDFRAME_TAG);
            
            tile1.setRotation(0);
            tile2.setPosition(cc.p(434, 640+64));
            
            var rect = wordframe.getTextureRect();
            rect.width = 268; rect.height = 68;
            wordframe.setTextureRect(rect);
            wordframe.setPosition(cc.p(303, 203));
            wordframe.setOpacity(0);
            
            hand.setPosition(cc.p(size.width, size.height/4));
            hand.setOpacity(0);

            tile2.runAction(
                cc.sequence(
                    cc.delayTime(time0),
                    cc.moveBy(time1+time2+time3, cc.p(0,-264)),
                    cc.moveBy(time4, cc.p(-65,-205))
                )
            );

            hand.runAction(
                cc.sequence(
                    cc.delayTime(time0+time1),
                    cc.fadeIn(0),
                    cc.callFunc(function() {
                        $42.SCENE.mainLayer.levelLabels[0].runAction(cc.blink(7,10));
                    }),
                    cc.EaseSineOut.create(cc.moveTo(time2, cc.p(434, 400))),
                    cc.scaleTo(time3,$42.STORY_SCALE_PRESS_FINGER),
                    cc.moveBy(time4, cc.p(-65,-205)),
                    cc.callFunc(function() {
                        wordframe.setOpacity(255);
                    }),
                    cc.scaleTo(time3,1),
                    cc.EaseSineIn.create(cc.moveTo(time2, cc.p(700, 320))),
                    cc.callFunc(cb)
                )
            );    

            activeTimeouts.push( setTimeout(function() {
               showSpeechBubble(0, $42.t.mostafa.basic3, mostafa.getPosition(), 350); 
            }, time0 * 1000) );
        };

        var pages = [page1, page2, page3]

        mostafa.setPosition(cc.p(750,576)); 
        mostafa.setFlippedX(true);
        mostafaFlyTo({
            time: options.time || 2,
            bezier: [
                cc.p(500,650),
                cc.p(200,200),
                cc.p(550,130) 
            ]
        });

        showConcepts(pages, function() {
            mostafaFlyTo({
                time: options.time || 2,
                bezier: [
                    cc.p(550,430), 
                    cc.p(500,650),
                    cc.p(-100,200)
                ]
            });
        
            if( typeof options.cb === "function" ) options.cb();
        });
    };

    var animStoryAdvancedConcepts = function(options) {
        stopActionsAndTimeouts();

        var sb = storyBackground,
            marker = [];

        var markersInit = [0,0,0,1,-1,1,1,1,1];
        var resetMarker = function(i,type) {
            sb.removeChild(marker[i]);
            marker[i] = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame(type || "marker"+markersInit[i]+".png"));
            marker[i].setPosition(cc.p(i*60+50, 104));
            marker[i].setScale(0.9375);
            sb.addChild(marker[i], 6, $42.MARKER_TAG+i);
        }

        var page1 = function(time,cb) {
            var size = sb.getContentSize(),
                time0 = time || 1,
                time1 = 4.5,
                time2 = 1.1,
                time3 = 0.3,
                time4 = 1.3,
                time5 = 1.1;
            
            tile3.setPosition(cc.p(290, 160));
            tile3.setScale(0.9375);
            if( !sb.getChildByTag($42.TILE3_TAG) ) sb.addChild(tile3,5,$42.TILE3_TAG);
            
            tile4.setPosition(cc.p(360, 750));
            tile4.setScale(0.9375);
            if( !sb.getChildByTag($42.TILE4_TAG) ) sb.addChild(tile4,5,$42.TILE4_TAG);
            
            hand.setPosition(cc.p(size.width, size.height/4));
            hand.setOpacity(0);
            if( !sb.getChildByTag($42.HAND_TAG) ) sb.addChild(hand,10,$42.HAND_TAG);

		    if( !sb.getChildByTag($42.MARKER_TAG) ) {
                var markersInit = [0,0,0,1,1,1,1,1,1];
                for( var i=0 ; i<9 ; i++ ) {
                    marker[i] = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("marker"+markersInit[i]+".png"));
                    marker[i].setPosition(cc.p(i*60+50, 104));
                    marker[i].setScale(0.9375);
                    sb.addChild(marker[i], 6, $42.MARKER_TAG+i);
                }
            }
            marker[3].setOpacity(0);
            marker[4].setOpacity(0);

            tile4.runAction(
                cc.sequence(
                    cc.delayTime(time0),
                    cc.moveBy(time1+time2+time3,cc.p(0,-250)),
                    cc.moveBy(time4,cc.p(-100,-280)),
                    cc.callFunc(function() {
                        marker[3].setOpacity(255)
                        //marker[4].setOpacity(255)
                    })
                )
            );

            hand.runAction(
                cc.sequence(
                    cc.delayTime(time0+time1),
                    cc.fadeIn(0),
                    cc.EaseSineOut.create(cc.moveTo(time2,cc.p(390,500))),
                    cc.scaleTo(time3,$42.STORY_SCALE_PRESS_FINGER),
                    cc.moveBy(time4,cc.p(-100,-280)),
                    cc.EaseSineIn.create(cc.moveTo(time2,cc.p(size.width*1.2,size.height/4))),
                    cc.callFunc(cb)
                )
            );    

            activeTimeouts.push( setTimeout(function() {
               showSpeechBubble(0, $42.t.mostafa.advanced1, mostafa.getPosition(), 350); 
            }, time0 * 1000) );
        };

        var page2 = function(time, cb) {
            var size = sb.getContentSize(),
                time0 = 1,
                time1 = 1.1,
                time2 = 0.3,
                time3 = 0.6,
                time4 = 0.3;
            
            for( var i=0 ; i<9 ; i++ ) resetMarker(i);

            tile4.setPosition(cc.p(260, 220));
            tile4.setScale(0.9375);
            
            hand.setPosition(cc.p(size.width, size.height/4));
            hand.setOpacity(0);

            hand.runAction(
                cc.sequence(
                    cc.delayTime(time0),
                    cc.fadeIn(0),
                    cc.EaseSineOut.create(cc.moveTo(time1,cc.p(230,100))),
                    cc.EaseSineOut.create(cc.scaleTo(time2,$42.STORY_SCALE_PRESS_FINGER)),
                    cc.callFunc(function() { resetMarker(3, "marker3.png"); }),
                    cc.EaseSineIn.create(cc.scaleTo(time2,1)),
                    cc.EaseSineOut.create(cc.moveBy(time3,cc.p(120,0))),
                    cc.EaseSineOut.create(cc.scaleTo(time2,$42.STORY_SCALE_PRESS_FINGER)),
                    cc.callFunc(function() { resetMarker(5, "marker3.png"); }),
                    cc.EaseSineIn.create(cc.scaleTo(time2,1)),
                    cc.EaseSineOut.create(cc.moveBy(time3,cc.p(60,0))),
                    cc.EaseSineOut.create(cc.scaleTo(time2,$42.STORY_SCALE_PRESS_FINGER)),
                    cc.callFunc(function() { resetMarker(6, "marker3.png"); }),
                    cc.EaseSineIn.create(cc.scaleTo(time2,1)),
                    cc.EaseSineOut.create(cc.moveBy(time3,cc.p(60,0))),
                    cc.EaseSineOut.create(cc.scaleTo(time2,$42.STORY_SCALE_PRESS_FINGER)),
                    cc.callFunc(function() { resetMarker(7, "marker3.png"); }),
                    cc.EaseSineIn.create(cc.scaleTo(time2,1)),
                    cc.EaseSineOut.create(cc.moveBy(time3,cc.p(60,0))),
                    cc.EaseSineOut.create(cc.scaleTo(time2,$42.STORY_SCALE_PRESS_FINGER)),
                    cc.callFunc(function() { resetMarker(8, "marker3.png"); }),
                    cc.EaseSineIn.create(cc.scaleTo(time2,1)),
                    cc.EaseSineIn.create(cc.moveTo(time1,cc.p(750,200))),
                    cc.callFunc(cb)
                )
            );    

            activeTimeouts.push( setTimeout(function() {
               showSpeechBubble(0, $42.t.mostafa.advanced2, mostafa.getPosition(), 350); 
            }, time0 * 1000) );
        };

        var page3 = function(time, cb) {
            var size = sb.getContentSize(),
                time0 = 1,
                time1 = 4.1,
                time2 = 0.5,
                time3 = 0.3,
                time4 = 1.1,
                time5 = 2.0;
            
            if( !sb.getChildByTag($42.TILE5_TAG) ) sb.addChild(tile5,5,$42.TILE5_TAG);
            if( !sb.getChildByTag($42.WORDFRAME_TAG) ) sb.addChild(wordframe,0,$42.WORDFRAME_TAG);
            
            resetMarker(3, "marker3.png");
            resetMarker(5, "marker3.png");
            resetMarker(6, "marker3.png");
            resetMarker(7, "marker3.png");
            resetMarker(8, "marker3.png");
            
            tile5.setPosition(cc.p(500, 750));
            tile5.setScale(0.9375);

            var reset = function(children) {
                    for( var i=0 ; i<children.length ; i++ ) {
                        children[i].setPosition(children[i]._orgPos);
                        children[i].setOpacity(255);
                    }
                };
            reset(tile4.getChildren());
            reset(tile5.getChildren());

            var rect = wordframe.getTextureRect();
            rect.width = 542; rect.height = 64;
            wordframe.setTextureRect(rect);
            wordframe.setPosition(cc.p(290,160));
            wordframe.setOpacity(0);
            
            hand.setPosition(cc.p(size.width, size.height/4));
            hand.setOpacity(0);

            tile5.runAction(
                cc.sequence(
                    cc.delayTime(time0),
                    cc.moveBy(time1+time2+time3, cc.p(0,-260)),
                    cc.moveTo(time4, cc.p(560,220))
                )
            );

            hand.runAction(
                cc.sequence(
                    cc.delayTime(time0+time1),
                    cc.fadeIn(0),
                    cc.EaseSineOut.create(cc.moveTo(time2, cc.p(500, 490))),
                    cc.scaleTo(time3,$42.STORY_SCALE_PRESS_FINGER),
                    cc.moveTo(time4, cc.p(560,220)),
                    cc.scaleTo(time3,1),
                    cc.callFunc(function() {
                        var ch4 = tile4.getChildren(),
                            ch5 = tile5.getChildren();
                        ch4[3].setOpacity(0);
                        ch5[3].setOpacity(0);
                        ch4[0].runAction(cc.moveBy(time2+time5, cc.p(0,-64)));
                        ch4[1].runAction(cc.moveBy(time2+time5, cc.p(0,-64)));
                        ch5[2].runAction(cc.moveBy(time2+time5, cc.p(0,-64)));
                    }),
                    cc.EaseSineIn.create(cc.moveTo(time2, cc.p(700, 320))),
                    cc.delayTime(time5),
                    cc.callFunc(function() {
                        wordframe.setOpacity(255);
                    }),
                    cc.callFunc(cb)
                )
            );    

            activeTimeouts.push( setTimeout(function() {
               showSpeechBubble(0, $42.t.mostafa.advanced3, mostafa.getPosition(), 350); 
            }, time0 * 1000) );
        };

        var pages = [page1, page2, page3]

        mostafa.setPosition(cc.p(750,576)); 
        mostafa.setFlippedX(true);
        mostafaFlyTo({
            time: options.time || 2,
            bezier: [
                cc.p(500,650),
                cc.p(200,200),
                cc.p(550,130) 
            ]
        });

        showConcepts(pages, function() {
            mostafa.setFlippedX(false);
            mostafaFlyTo({
                time: options.time || 2,
                bezier: [
                    cc.p(550,430), 
                    cc.p(500,650),
                    cc.p(-100,200)
                ]
            });
        
            if( typeof options.cb === "function" ) options.cb();
        });
    };

    //////////////////////////////////////////////////////////////////////////////////////
    // Service programs
    //
	pl.hookStartAnimation = function(program, options) {
		cc.assert(typeof programs[program] === "function" , "42words, startProgramm: Invalid program number.");
	
        if( !mul ) initAnimation();

		if( !pl.getChildByTag($42.MURBIKS_LAYER_TAG )) pl.addChild(mul,20,$42.MURBIKS_LAYER_TAG);

		curProgram = program;
        finalCallback = options.cb;

		programs[program](options);
	};
	
	pl.hookEndAnimation = function() {

		stopTileProgram();
		
        var ls = cc.sys.localStorage;
		$42.tutorialsDone = curProgram + 1;
		ls.setItem("tutorialsDone",$42.tutorialsDone); 

        if( typeof finalCallback === "function" ) cb(); 
	};

    var mostafaFlyTo = function(options) {
        mostafa.stopAllActions();    

        var animAction = mostafa.runAction(cc.repeatForever(anims.mostafa_fly)),
			bezier = options.bezier, 
            timeout = null;
	    _42_retain(animAction, "mostafa animAction fly");	

        var land = function() {
            mul.stopAction(animAction);
            _42_release(animAction);
            animAction = mostafa.runAction(
                cc.sequence(
                    anims.mostafa_land,
                    cc.callFunc(function() {
                        _42_release(animAction);
                        if( typeof options.cb === "function" ) options.cb();
                    })
                )
            );
            _42_retain(animAction, "mostafa animAction land");
        };

	    mostafa.runAction(
            cc.sequence(
                cc.bezierTo(options.time, options.bezier),
                cc.callFunc(land)
            )
        ); 
    };
	
	var mostafaFlyingToMiddle = function(time, bezierIn , bezierOut) {
		var animAction = mostafa.runAction(cc.repeatForever(anims.mostafa_fly)),
			bezierMostafaIn = bezierIn || [
				cc.p(500,180),
				cc.p(650,300),
				cc.p(cc.width/2,cc.height/2)
			];
			bezierMostafaOut = bezierOut || [
			    cc.p(cc.width/2,cc.height/2),
	   			cc.p(350,400),
	   			cc.p(500,180)
	   		];
		_42_retain(animAction,"mostafa animAction 5");
			
	    mostafa.runAction(
        	cc.sequence(
        		cc.flipX(true),
        		cc.bezierTo(2.0, bezierMostafaIn),
        		cc.moveBy(time-4.0, cc.p(0,50)),
        		cc.flipX(false),
        		cc.bezierTo(2.0, bezierMostafaOut),
        		cc.callFunc(function() {
        			mul.stopAction(animAction);
        			animAction = mostafa.runAction(anims.mostafa_land);
        			 _42_retain(animAction, "mostafa animAction 6");
        		})
    		)
    	); 		
	};
	
	var showSpeechBubble = function(time, text, pos, bubbleY) {
		
		var bubbleX = cc.width/2;
		if( !bubbleY ) bubbleY = cc.height/2;
		if( mul.getChildByTag( $42.SPEECH_BUBBLE_TAG ) ) mul.removeChild(speechBubble);
		if( mul.getChildByTag( $42.SPEECH_BUBBLE_LINE_TAG ) ) mul.removeChild(speechBubbleLine);
		if( mul.getChildByTag( $42.SPEECH_BUBBLE_CLOUD_TAG ) ) mul.removeChild(speechBubbleCloud);
		
    	speechBubble.setString(text);
		speechBubble.setPosition(bubbleX , bubbleY);
		speechBubbleCloud.setPosition(bubbleX , bubbleY);
		speechBubbleCloud.setScaleY((speechBubble.getContentSize().height+6*$42.SPEECH_BUBBLE_FONTSIZE) / $42.SPEECH_BUBBLE_HEIGHT);

		speechBubbleLine.clear();
		var xDist = bubbleX - pos.x,
			yDist = bubbleY - pos.y;
		
		speechBubbleLine.drawSegment(
			cc.p(pos.x + xDist/4, pos.y + yDist/4), 
            cc.p(bubbleX - xDist/2,bubbleY - yDist/2),
            2,
            $42.SPEECH_BUBBLE_LINE_COLOR
        );         	

		speechBubbleCloud.setOpacity(0);
		speechBubble.setOpacity(0);
		
        mul.addChild(speechBubbleLine,5,$42.SPEECH_BUBBLE_LINE_TAG);
		mul.addChild(speechBubbleCloud,5,$42.SPEECH_BUBBLE_CLOUD_TAG);
		mul.addChild(speechBubble,5,$42.SPEECH_BUBBLE_TAG);

        mul.pause();
        mul.unscheduleUpdate();

		speechBubbleCloud.runAction(
			cc.sequence(
				cc.fadeTo(0.3,$42.SPEECH_BUBBLE_OPACITY),
				cc.delayTime(0.5),
				cc.callFunc( function() {
			        mul.removeChild(speechBubbleLine);
				})
			)
		);
		speechBubble.runAction(cc.fadeIn(0.3));			
		
		if( time ) {
			speechBubble.runAction(
                cc.sequence(
                    cc.delayTime(time-0.9),
                    cc.callFunc(
                        function() { 
                            hideSpeechBubble(0.9); 
                        }
                    )
                )
            )
		}
	};

    var showConcepts = function(pages,cb) {

        var sb = storyBackground;

        mul.addChild(sb);
        sb.setPosition(cc.p(cc.width,cc.height));
        sb.setOpacity($42.STORY_BACKGROUND_OPACITY);
        sb.setScale(0);
        sb.runAction(
            cc.EaseQuinticActionOut.create(
                cc.spawn(
                    cc.scaleTo($42.STORY_BACKGROUND_SPEED*2, 1),
                    cc.moveTo($42.STORY_BACKGROUND_SPEED*2, $42.STORY_BACKGROUND_POS)
                )
            )
        );
        
        var ch = sb.getChildren();
        for( var i=0 ; i<ch.length ; i++ ) ch[i].setOpacity(255);

        var size = sb.getContentSize();
        
        var item1 = new cc.MenuItemFont($42.t.story_again, function() {
                stopActionsAndTimeouts();
                item1.setOpacity(0);
                item1.setEnabled(false);
                pages[page](0.3, function() {
                    item1.setOpacity(255);
                    item1.setEnabled(true);
                    //hideSpeechBubble();
                });
            }, mul),
            item2 = new cc.MenuItemFont($42.t.story_continue, function() {
                stopActionsAndTimeouts();
                page++;
                if( page < pages.length ) {
                    item1.setOpacity(0);
                    item1.setEnabled(false);
                    pages[page](0.3, function() {
                        item1.setOpacity(255);
                        item1.setEnabled(true);
                        //hideSpeechBubble();
                    });
                } else {
                    hideConcepts();
                    hideSpeechBubble();
                    if( typeof cb === "function" ) cb();
                }
                
            }, mul);

        item1.setFontName(_42_getFontName(res.exo_regular_ttf));
        item1.setFontSize($42.STORY_MENU_FONT_SIZE);
        item1.setPosition(cc.p(-size.width/2+item1.getContentSize().width/2+40,20));
        item2.setFontName(_42_getFontName(res.exo_regular_ttf));
        item2.setFontSize($42.STORY_MENU_FONT_SIZE);
        item2.setPosition(cc.p(size.width/2-item2.getContentSize().width/2-40,20));
        
        menu = new cc.Menu([item1, item2]);
        menu.setPosition(cc.p(size.width/2,40));
        sb.addChild(menu,0,$42.STORY_MENU_TAG);

        var page=0;
        item1.setOpacity(0);
        item1.setEnabled(false);
        pages[page]($42.STORY_BACKGROUND_SPEED*2, function() {
            item1.setOpacity(255);
            item1.setEnabled(true);
            hideSpeechBubble();
        });
    };

    var hideConcepts = function() {
        var sb = storyBackground;

        sb.runAction(
            cc.sequence(
                cc.EaseSineOut.create(
                    cc.fadeOut($42.STORY_BACKGROUND_SPEED)
                ),
                cc.callFunc(function() {
                    sb.removeAllChildren(true);
                    mul.removeChild(sb);
                })
            )
        );

        var ch = sb.getChildren();
        for( var i=0 ; i<ch.length ; i++ ) {
            ch[i].runAction(
                cc.sequence(
                    cc.EaseSineOut.create(
                        cc.fadeOut($42.STORY_BACKGROUND_SPEED)
                    )
                ) 
            );
        }

        setTimeout(function() {
            var ch = sb.getChildren();
            for( var i=0 ; i<ch.length ; i++ ) ch[i].setOpacity(255);
        },$42.STORY_BACKGROUND_SPEED*1000+1);
    };

	var hideSpeechBubble = function(time) {
		if( !time ) var time = 0.9;
    	speechBubbleCloud.runAction(
	    	cc.sequence(
	   			cc.fadeOut(time),
	   			cc.callFunc( function() {
        	        mul.resume();
	       	        mul.scheduleUpdate();
					mul.removeChild(speechBubbleCloud);
					mul.removeChild(speechBubbleLine);			        
					mul.removeChild(speechBubble);			        
	    		})
	    	)
	    );
		speechBubble.runAction(cc.fadeOut(time));			
	};

    var stopActionsAndTimeouts = function() {
        mostafa.stopAllActions();    
        speechBubble.stopAllActions();    
        speechBubbleCloud.stopAllActions();    
        speechBubbleLine.setOpacity(0);
        tile1.stopAllActions();
        tile2.stopAllActions();
        tile3.stopAllActions();
        tile4.stopAllActions();
        tile5.stopAllActions();
        hand.stopAllActions();
		clearActiveTimeouts();
    };

    var clearActiveTimeouts = function() {
        for( var i=0 ; i<activeTimeouts.length ; i++ ) clearTimeout(activeTimeouts[i]);
        activeTimeouts = [];
    };

	var jumpHandTo = function(pos) {
		
		var fo = getFingerOffset();

		hand.setPosition(cc.p( pos.x - fo.x , pos.y - fo.y) );
	};

	var moveHandTo = function(time, pos, bezierPoint, contact) {
		
		var curPos = hand.getPosition(),
			fo = getFingerOffset(),
			bezierHand = bezierPoint? [
				cc.p(curPos.x - fo.x,curPos.y - fo.y),
	            cc.p(bezierPoint.x - fo.x, bezierPoint.y - fo.y),
	            cc.p(pos.x - fo.x,pos.y - fo.y)
            ] : null;
		
		// stop everything, we have new orders ...
		hand.stopAllActions();
		
	    if( !contact ) {
		    if( bezierPoint ) hand.runAction(cc.EaseSineIn.create(cc.bezierTo(time, bezierHand)));
		    else hand.runAction(cc.EaseSineIn.create(cc.moveTo(time, cc.p(pos.x- fo.x, pos.y - fo.y))));
		    
	    } else {

		    if( bezierPoint ) hand.runAction(
		    	cc.sequence(
		    		cc.spawn(
		    			cc.scaleTo(time*0.15 ,0.9),
		    			cc.moveTo(time*0.15, cc.p(fp.x-fo.x,fp.y-fo.y))
		    		),
		    		cc.EaseSineIn.create(
		    			cc.bezierTo(time*0.7 , bezierHand)
		    		),
		    		cc.scaleTo(time*0.15,1)    		
		    	)
		    );
		    else hand.runAction(
		    	cc.sequence(
		    		cc.spawn(
		    			cc.scaleTo(time*0.15 ,0.9),
		    			cc.moveTo(time*0.15, cc.p(fp.x-fo.x,fp.y-fo.y))
		    		),
		    		cc.EaseSineIn.create(
		    			cc.moveTo(time*0.7, cc.p(pos.x- fo.x, pos.y - fo.y))
		    		),
		    		cc.scaleTo(time*0.15,1)    				    		
		    	)
		    );
	    }
	};
	
	var pressFingerTo = function(time, pos, bezierPoint) {
		moveHandTo( time, pos, bezierPoint, true );
	};
	
	var startTileProgram = function(program) {
	    // start program
	    curTileProgram = program;
	    curTileProgramCnt = 0;
	};

	var stopTileProgram = function() {
	    // start program
	    curTileProgram = null;
	    curTileProgramCnt = null;
	};

    var createTile = function(letters, boxes) {
        var tile = cc.Node.create();
    
        tile.setCascadeOpacityEnabled(true);
        for( var i=0 ; i<4 ; i++ ) {
            var index = $42.LETTERS.indexOf(letters[i]),
                name = $42.LETTER_NAMES[index],
                file = name+".png",
                frame = cc.spriteFrameCache.getSpriteFrame(file);

            cc.log("file: '"+file+"', name: '"+name+"', index: "+index+", frame: "+frame);

            var sprite = cc.Sprite.create(frame);    
            sprite.setPosition(boxes[i]);
            sprite._orgPos = boxes[i];
            tile.addChild(sprite);
        }
        
        return tile;
    };

	var initAnimation = function() {

		// Create layer for tutorial
		mul = new cc.Layer();
		_42_retain(mul, "Tutorial layer");
		
		// Load sprite frames to frame cache, add texture node

		var loadFrames = function(name,cnt) {
			var frames = [];
	    	for (var i = 1; i <= cnt; i++) {
	        	str = name + (i < 10 ? ("0" + i) : i) + ".png";
	        	frames.push(cc.spriteFrameCache.getSpriteFrame(str));        	
	    	}
	    	var anim = cc.Animation.create(frames, 0.06);
	    	anims[name] = cc.animate(anim);
	    	_42_retain(anims[name], "anim "+anims[name]);
		}

		loadFrames("mostafa_fly",9);
		loadFrames("mostafa_land",7);
		
        mostafa = cc.Sprite.create(res.murbiks_single_png);        
        mostafa.setScale(0.75);
        mostafa.attr({
        	x: 0,
        	y: 0,
        	scale: 1.9,
        	rotation: 0
    	});
        _42_retain(mostafa, "Mostafa");
    	mul.addChild(mostafa, 5);
    	
		// speech bubble load cloud and text object
		speechBubbleCloud = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("wordcloud.png"),cc.rect(0,0,480,300));
		_42_retain(speechBubbleCloud, "speechBubbleCloud");
		speechBubble = cc.LabelTTF.create("", _42_getFontName(res.exo_regular_ttf), $42.SPEECH_BUBBLE_FONTSIZE, cc.size($42.SPEECH_BUBBLE_WIDTH,0),cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
		_42_retain(speechBubble, "speechBubble");
		speechBubble.setColor($42.SPEECH_BUBBLE_COLOR);
		speechBubbleLine = cc.DrawNode.create();
		_42_retain(speechBubbleLine, "speechBubbleLine");
        
		// load hand
		hand = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("hand.png"));
		hand.setRotation($42.HAND_ROTATION);
		_42_retain(hand, "Hand");
        hand.setAnchorPoint(0.285, 0.94);

        // load tiles and story background
		tile1 = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("tile1.png"));
		tile2 = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("tile2.png"));
		tile3 = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("tile3.png"));
		tile4 = createTile(" AXT", [{x: 0.5*64,y: 1.0*64},{x: 0.5*64,y: 0.0*64},{x:-0.5*64,y:-1.0*64},{x: 0.5*64,y:-1.0*64}]); 
		tile5 = createTile("GD Q", [{x:-0.5*64,y: 1.0*64},{x:-0.5*64,y: 0.0*64},{x: 0.5*64,y: 0.0*64},{x: 0.5*64,y:-1.0*64}]); 
        wordframe = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("wordframe.png"));
        storyBackground = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("story_background.png"));
		_42_retain(tile1, "Story: Tile 1");
		_42_retain(tile2, "Story: Tile 2");
		_42_retain(tile3, "Story: Tile 3");
		_42_retain(tile4, "Story: Tile 4");
		_42_retain(tile5, "Story: Tile 5");
		_42_retain(wordframe, "Story: Wordframe");
        _42_retain(storyBackground, "Story: Background");
		
		mul.update = update;
		mul.scheduleUpdate();
	};
	
	var exitAnimation = function() {

		// Create layer for tutorial
		_42_release(mul);
		mul.unscheduleUpdate();
		pl.getParent().removeChild(mul);
	};	
 
	var update = function(dt) {
	};
	
    var programs = {
        "Mostafas Greeting": animMostafasGreeting,
        "Mostafa flies away": animMostafaFlyingAway,
        "Story Basic Concepts": animStoryBasicConcepts,
        "Story Advanced Concepts": animStoryAdvancedConcepts
    };

    cc.spriteFrameCache.addSpriteFrames(res.murbiks_plist);
};
