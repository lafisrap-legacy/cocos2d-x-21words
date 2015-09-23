/*
 * Murbiks Module
 * 
 * Tutorials
 * Mostafa (Mosquito)
 * 
 * */
$42.MURBIKS_LAYER_TAG = 103;                            // sprite tag for layer
$42.SPEECH_BUBBLE_WIDTH = 540;                          // speech bubble 
$42.SPEECH_BUBBLE_HEIGHT = 450;                         //
$42.SPEECH_BUBBLE_COLOR = cc.color(0,0,70);             //
$42.SPEECH_BUBBLE_FONTSIZE = 48;                        //
$42.SPEECH_BUBBLE_OPACITY = 230;                        //
$42.SPEECH_BUBBLE_LINE_COLOR = cc.color(170,170,185);   //
$42.SPEECH_BUBBLE_TAG = 201;                            //
$42.SPEECH_BUBBLE_LINE_TAG = 202;                       //
$42.SPEECH_BUBBLE_CLOUD_TAG = 203;                      //
$42.SPEECH_BUBBLE_BUTTON_TAG = 204;                     //
$42.HAND_TAG = 205;                                     // hand
$42.HAND_ROTATION = -60;                                //
$42.TILE1_TAG = 206;                                    // tiles
$42.TILE2_TAG = 207;                                    //
$42.TILE3_TAG = 208;                                    //
$42.TILE4_TAG = 209;                                    //
$42.TILE5_TAG = 210;                                    //
$42.MARKER_TAG = 211;                                   // markers (211-220)
$42.WORDFRAME_TAG = 221;                                // wordframe
$42.STORY_BACKGROUND_POS = cc.p(320,832);               // background
$42.STORY_BACKGROUND_OPACITY = 90;                      //
$42.STORY_BACKGROUND_SPEED = 1.33;                      // animation speed
$42.STORY_MENU_FONT_SIZE = 48;                          // menu
$42.STORY_MENU_PADDING = 20;                            //
$42.STORY_MENU_TAG = 222;                               //
$42.STORY_SCALE_PRESS_FINGER = 0.9;                     // scale to show finger pressed

////////////////////////////////////////////////////////////////////////////////////////
// Murbiks module: Included by main game scene
//
var _MURBIKS_MODULE = function(parentLayer) {
    ////////////////////////////////////////////////////
    // Module variables
    //
	var pl = parentLayer,                   // = game scene
		mul = null,                         // murbiks layer
        level = null,                       // level information
		curProgram = null,                  // id for running animation
		anims = {},                         // predefined animations 
        finalCallback = null,               // callback called after end of animation
        activeTimeouts = [],                // list of all timeouts
		
        mostafa = null,                     // mostafa sprite
		hand = null,                        // hand
		speechBubbleCloud = null,           // cloud
		speechBubbleLine = null,            // line
		speechBubble = null,                // bubble
        tile1 = null,                       // tiles
        tile2 = null,
        tile3 = null,
        tile4 = null,
        tile5 = null,
        wordframe = null,                   // wordframe
        storyBackground = null;             // background

    //////////////////////////////////////////////////////////////////////////////////////
    // Animation programs
    // (full list at end of this file)
    //
    // 1) Greeting on title screen
    var animMostafasGreeting = function(options) {
        stopActionsAndTimeouts();

        ////////////////////////////
        // Say hello!
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

        ///////////////////////////////////
        // Let mostafa fly in
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

    ////////////////////////////////////
    // 2) Flying away
    var animMostafaFlyingAway = function(options) {
        stopActionsAndTimeouts();
        hideSpeechBubble();

        ///////////////////////////////////////
        // Move him to the left side
        if( mostafa.getPosition().x > cc.width+70 ) mostafa.setPosition(cc.p(-70,cc.height/2));

        //////////////////////////////////////
        // Prepare animation
        var animAction = mostafa.runAction(cc.repeatForever(anims.mostafa_fly)),
			bezier = options.bezier || [
				cc.p( 360, 480),
				cc.p( 500, 668),
				cc.p( 750, 700)
			];
	    _42_retain(animAction, "mostafa animAction fly");
	
        //////////////////////////////////////
        // Play Mostafa sound
        $42.SCENE.playEffect({ audio: res.mostafa_out_mp3 });
        
        ///////////////////////////////////////
        // Let him fly
        mostafa.setFlippedX(false);
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

    ////////////////////////////////////////////////////////
    // 3) Story animation - basic concepts 
    var animStoryBasicConcepts = function(options) {
        ///////////////////////////////
        // Everything stops
        stopActionsAndTimeouts();

        var sb = storyBackground;

        ///////////////////////////////////////////////////////////////////////////////
        // Page 1 Definition
        var page1 = function(time,cb, repeat) {
            ///////////////////////////////////
            // Definining time delays
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
            
            //////////////////////////////////////
            // Put first tile and hand in place
            tile1.setPosition(cc.p(size.width/2, size.height/2));
            if( !sb.getChildByTag($42.TILE1_TAG) ) sb.addChild(tile1,5,$42.TILE1_TAG);
            
            hand.setPosition(cc.p(size.width, size.height/4));
            hand.setOpacity(0);
            if( !sb.getChildByTag($42.HAND_TAG) ) sb.addChild(hand,10,$42.HAND_TAG);

            /////////////////////////////////////
            // Tile 1 animation
            tile1.runAction(
                cc.sequence(
                    cc.delayTime(time0+time1+time2+time3+time4),
                    cc.callFunc(function() { $42.SCENE.playEffect(level.music.swipe); }),
                    cc.moveBy(time5,cc.p(-200,0)),
                    cc.moveBy(time5*2,cc.p(400,0)),
                    cc.moveBy(time5,cc.p(-200,0)),
                    cc.delayTime(time6),
                    cc.moveBy(time7,cc.p( 100,-100)),
                    cc.moveBy(time7,cc.p(-150, -50)),
                    cc.callFunc(function() { $42.SCENE.stopEffect(level.music.swipe); })
                )
            );

            //////////////////////////////////////
            // Hand animation
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

            if( !repeat ) showSpeechBubble(0, $42.t.mostafa.basic1, mostafa.getPosition(), 320); 
        };

        ///////////////////////////////////////////////////////////////////////////////
        // Page 2 Definition
        var page2 = function(time, cb, repeat) {
            /////////////////////////////
            // Defining time delays
            var size = sb.getContentSize(),
                time0 = 1,
                time1 = 1.1,
                time2 = 0.3,
                time3 = 0.6,
                time4 = 0.3;
            
            /////////////////////////////
            // Setting first tile and hand in position
            tile1.setPosition(cc.p(270,170));
            
            hand.setPosition(cc.p(size.width, size.height/4));
            hand.setOpacity(0);

            ///////////////////////////////
            // Animate first tile (rotate)
            tile1.runAction(
                cc.sequence(
                    cc.delayTime(time0+time1+time2),
                    cc.callFunc(function() { $42.SCENE.playEffect(level.music.rotate); }),
                    cc.rotateBy(time3,180),
                    cc.callFunc(function() { $42.SCENE.stopEffect(level.music.rotate); }),
                    cc.delayTime(time4+time2),
                    cc.callFunc(function() { $42.SCENE.playEffect(level.music.rotate); }),
                    cc.rotateBy(time3,180),
                    cc.callFunc(function() { $42.SCENE.stopEffect(level.music.rotate); })
                )
            );

            ////////////////////////////////
            // Animate hand
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

            //////////////////////////
            // Show speech bubble only the first time
            if( !repeat ) showSpeechBubble(0, $42.t.mostafa.basic2, mostafa.getPosition(), 320); 
        };

        ///////////////////////////////////////////////////////////////////////////////
        // Page 3 Definition
        var page3 = function(time, cb, repeat) {
            var ml = $42.SCENE.mainLayer,
                size = sb.getContentSize(),
                time0 = 1,
                time1 = 4.1,
                time2 = 0.5,
                time3 = 0.3,
                time4 = 1.1;
            
            ////////////////////////////////
            // Putting tiles and hand in place
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

            ////////////////////////////////////
            // Animate second tile
            tile2.runAction(
                cc.sequence(
                    cc.delayTime(time0),
                    cc.moveBy(time1+time2+time3, cc.p(0,-264)),
                    cc.callFunc(function() { $42.SCENE.playEffect(level.music.swipe); }),
                    cc.moveBy(time4, cc.p(-65,-205)),
                    cc.callFunc(function() { $42.SCENE.stopEffect(level.music.swipe); })
                )
            );

            ////////////////////////////////////
            // Animate hand
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
                        $42.SCENE.playEffect(level.music.fullWord);
                    }),
                    cc.scaleTo(time3,1),
                    cc.EaseSineIn.create(cc.moveTo(time2, cc.p(700, 320))),
                    cc.callFunc(cb)
                )
            );    

           if( !repeat ) showSpeechBubble(0, $42.t.mostafa.basic3, mostafa.getPosition(), 350); 
        };

        //////////////////////////////////
        // Three pages of basic concepts ...
        var pages = [page1, page2, page3]

        //////////////////////////////////
        // Let Mostafa fly in
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

        //////////////////////////////////
        // Animate pages and show menu
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

    ////////////////////////////////////////////////////////
    // 4) Story animation - advanced concepts 
    var animStoryAdvancedConcepts = function(options) { 
        //////////////////////////////
        // Stop everything
        stopActionsAndTimeouts();

        var sb = storyBackground,
            marker = [];

        /////////////////////////////////
        // Set markers to a start position (in case user pressed "go on" early)
        var markersInit = [0,0,0,1,-1,1,1,1,1];
        var resetMarker = function(i,type) {
            //////////////////////
            // Delete old sprites if there are any
            if( marker[i] ) sb.removeChild(marker[i]);

            if( markersInit[i] === -1 ) return;

            cc.log( "resetMarker: "+(type || "marker"+markersInit[i]+".png"))

            //////////////////////
            // Make new ones
            marker[i] = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame(type || "marker"+markersInit[i]+".png"));
            marker[i].setPosition(cc.p(i*60+50, 104));
            marker[i].setScale(0.9375);
            sb.addChild(marker[i], 6, $42.MARKER_TAG+i);
        }

        ///////////////////////////////////////////////////////////////////////////////
        // Page 1 Definition
        var page1 = function(time,cb, repeat) {
            /////////////////////////////////
            // Animation Timing 
            var size = sb.getContentSize(),
                time0 = time || 1,
                time1 = 4.5,
                time2 = 1.1,
                time3 = 0.3,
                time4 = 1.3,
                time5 = 1.1;
            
            //////////////////////
            // Bring two tiles and hand in position and set markers
            tile3.setPosition(cc.p(290, 160));
            tile3.setScale(0.9375);
            if( !sb.getChildByTag($42.TILE3_TAG) ) sb.addChild(tile3,5,$42.TILE3_TAG);
            
            tile4.setPosition(cc.p(360, 750));
            tile4.setScale(0.9375);
            if( !sb.getChildByTag($42.TILE4_TAG) ) sb.addChild(tile4,5,$42.TILE4_TAG);
            
            hand.setPosition(cc.p(size.width, size.height/4));
            hand.setOpacity(0);
            if( !sb.getChildByTag($42.HAND_TAG) ) sb.addChild(hand,10,$42.HAND_TAG);

		    if( !sb.getChildByTag($42.MARKER_TAG) ) for( var i=0 ; i<9 ; i++ ) resetMarker(i);
            marker[3].setOpacity(0);

            //////////////////////////
            // Move tile
            tile4.runAction(
                cc.sequence(
                    cc.delayTime(time0),
                    cc.moveBy(time1+time2+time3,cc.p(0,-250)),
                    cc.callFunc(function() { $42.SCENE.playEffect(level.music.swipe); }),
                    cc.moveBy(time4,cc.p(-100,-280)),
                    cc.callFunc(function() {
                        marker[3].setOpacity(255)
                        //marker[4].setOpacity(255)
                        $42.SCENE.stopEffect(level.music.swipe);
                        $42.SCENE.playEffect(level.music.fixTile);
                    })
                )
            );

            ///////////////////////////
            // Move hand
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

            if( !repeat ) showSpeechBubble(0, $42.t.mostafa.advanced1, mostafa.getPosition(), 350); 
        };

        ///////////////////////////////////////////////////////////////////////////////
        // Page 2 Definition
        var page2 = function(time, cb, repeat) {
            /////////////////////////
            // Animation timing
            var size = sb.getContentSize(),
                time0 = 1,
                time1 = 1.1,
                time2 = 0.3,
                time3 = 0.6,
                time4 = 0.3;
            
            //////////////////////////
            // Set markers in start position
            for( var i=0 ; i<9 ; i++ ) resetMarker(i);

            //////////////////////////
            // Set tile and hand in position 
            tile4.setPosition(cc.p(260, 220));
            tile4.setScale(0.9375);
        
            hand.setPosition(cc.p(size.width, size.height/4));
            hand.setOpacity(0);

            //////////////////////////////
            // Move hand
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

           if( !repeat ) showSpeechBubble(0, $42.t.mostafa.advanced2, mostafa.getPosition(), 350); 
        };

        ///////////////////////////////////////////////////////////////////////////////
        // Page 3 Definition
        var page3 = function(time, cb, repeat) {
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
                    cc.callFunc(function() { $42.SCENE.playEffect(level.music.swipe); }),
                    cc.moveTo(time4, cc.p(560,220)),
                    cc.callFunc(function() { $42.SCENE.stopEffect(level.music.swipe); }),
                    cc.callFunc(function() { $42.SCENE.playEffect(level.music.deleteRow); })
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
                        $42.SCENE.playEffect(level.music.fullWord);
                    }),
                    cc.callFunc(cb)
                )
            );    

           if( !repeat ) showSpeechBubble(0, $42.t.mostafa.advanced3, mostafa.getPosition(), 350); 
        };

        var mostafaFliesTo = function(x,y) {
            mostafaFlyTo({
                time: options.time || 2,
                bezier: [
                    cc.p(500,250),
                    cc.p(200,500),
                    cc.p(x,y) 
                ]
            });
        };
        
        mostafa.setPosition(cc.p(750,576)); 
        mostafa.setFlippedX(false);
        mostafaFliesTo(550,130);

        var pages = [page1, page2, page3];

        showConcepts(pages, function() {

            var mostafaReturns = function() {
                mostafa.setFlippedX(false);
                mostafaFliesTo(222,130);
                setTimeout(function() {
                    showSpeechBubble(3, $42.t.mostafa.advanced4a, mostafa.getPosition(), 350); 
                }, 2000);
                setTimeout(function() {
                    showSpeechBubble(8, $42.t.mostafa.advanced4b, mostafa.getPosition(), 350);
                }, 5000);
                setTimeout(function() {
                    if( typeof options.cb === "function" ) options.cb();
                    mostafaFliesTo(-100,200); 
                }, 13000);
            }

            mostafa.setFlippedX(true);
            mostafaFlyTo({
                time: options.time || 2,
                bezier: [
                    cc.p(550,430), 
                    cc.p(500,650),
                    cc.p(-100,200)
                ],
                cb: mostafaReturns
            }); 
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
        level = options.level;

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

        var dest = options.bezier[2];
        if( dest.x < 0 || dest.x > cc.width || dest.y < 0 || dest.y > cc.height ) {
            $42.SCENE.playEffect({ audio: res.mostafa_out_mp3 });
        } else {
            $42.SCENE.playEffect({ audio: res.mostafa_in_mp3 });
        }
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

        
        $42.SCENE.playEffect({ audio: res.speech_bubble_mp3 });
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
                $42.SCENE.playEffect({ audio: res.tutorial_again_mp3 });
                pages[page](0.3, function() {
                    item1.setOpacity(255);
                    item1.setEnabled(true);
                    //hideSpeechBubble();
                }, true);
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
        if( level ) $42.SCENE.stopEffect(level.music.swipe);
        if( level ) $42.SCENE.stopEffect(level.music.rotate);
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
	
    var createTile = function(letters, boxes) {
        var tile = cc.Node.create();
    
        tile.setCascadeOpacityEnabled(true);
        for( var i=0 ; i<4 ; i++ ) {
            var index = $42.LETTERS.indexOf(letters[i]),
                name = $42.LETTER_NAMES[index],
                file = name+".png",
                frame = cc.spriteFrameCache.getSpriteFrame(file);

            var sprite = new cc.Sprite(frame);    
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
		
        mostafa = new cc.Sprite(res.murbiks_single_png);        
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
        var frame = cc.spriteFrameCache.getSpriteFrame("wordcloud.png");
        cc.log("Frame: "+frame);
		speechBubbleCloud = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("wordcloud.png"));
		_42_retain(speechBubbleCloud, "speechBubbleCloud");
		speechBubble = cc.LabelTTF.create("", _42_getFontName(res.exo_regular_ttf), $42.SPEECH_BUBBLE_FONTSIZE, cc.size($42.SPEECH_BUBBLE_WIDTH,0),cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
		_42_retain(speechBubble, "speechBubble");
		speechBubble.setColor($42.SPEECH_BUBBLE_COLOR);
		speechBubbleLine = cc.DrawNode.create();
		_42_retain(speechBubbleLine, "speechBubbleLine");
        
		// load hand
		hand = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("hand.png"));
		hand.setRotation($42.HAND_ROTATION);
		_42_retain(hand, "Hand");
        hand.setAnchorPoint(0.285, 0.94);

        // load tiles and story background
		tile1 = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("tile1.png"));
		tile2 = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("tile2.png"));
		tile3 = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("tile3.png"));
		tile4 = createTile(" AXT", [{x: 0.5*64,y: 1.0*64},{x: 0.5*64,y: 0.0*64},{x:-0.5*64,y:-1.0*64},{x: 0.5*64,y:-1.0*64}]); 
		tile5 = createTile("GD Q", [{x:-0.5*64,y: 1.0*64},{x:-0.5*64,y: 0.0*64},{x: 0.5*64,y: 0.0*64},{x: 0.5*64,y:-1.0*64}]); 
        wordframe = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("wordframe.png"));
        storyBackground = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("story_background.png"));
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
