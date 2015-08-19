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
$42.SPEECH_BUBBLE_WIDTH = 500;
$42.SPEECH_BUBBLE_HEIGHT = 450;
$42.SPEECH_BUBBLE_COLOR = cc.color(0,0,70);
$42.SPEECH_BUBBLE_FONTSIZE = 48;
$42.SPEECH_BUBBLE_OPACITY = 120;
$42.SPEECH_BUBBLE_LINE_COLOR = cc.color(170,170,185);
$42.SPEECH_BUBBLE_TAG = 201;
$42.SPEECH_BUBBLE_LINE_TAG = 202;
$42.SPEECH_BUBBLE_CLOUD_TAG = 203;
$42.SPEECH_BUBBLE_BUTTON_TAG = 204;
$42.HAND_TAG = 104;
$42.FINGER_TAG = 102;
$42.HAND_ROTATION = 60;
$42.HAND_CONTACT_SIZE = 40;
$42.HAND_CONTACT_COLOR = cc.color(0,0,70);
$42.HAND_CONTACT_TIME = 0.3;
$42.HAND_CONTACT_TIME = 0.3;
$42.BUBBLE_BUTTON_SCALE = 0.7;

var _MURBIKS_MODULE = function(parentLayer) {
	var pl = parentLayer,
		mul = null,
		lg = null,
		curTileProgram = null,
		curTileProgramCnt = null,
		mostafa = null,
		anims = {},
		blueButton = null,
		menuText = null,
		hand = null,
		contactRings = [],
		contactActions = [],
		speechBubbleCloud = null,
		speechBubbleButton = null,
		speechBubbleButtonImage = null,
		speechBubbleLine = null,
		speechBubble = null,
		timer = null,
		animCnt = null,
		animPrograms = null,
		stopEvents = false,
		curProgram = null,
		fingerIsPressed = false,
		fingerPos = null,
		hookResumeAskForWord = null,
		hookResumeMenuLayer = null,
        finalCallback = null;

    //////////////////////////////////////////////////////////////////////////////////////
    // Animation programs
    // (full list at end of this file)
    //
    var animMostafasGreeting = function(options) {
        mostafa.stopAllActions();    
		
        var animAction = mostafa.runAction(cc.repeatForever(anims.mostafa_fly)),
			bezier = options.bezier || [
				cc.p( 100, 568),
				cc.p( 500, 668),
				cc.p( 360, 480)
			];
	    _42_retain(animAction, "mostafa animAction fly");
		
        mostafa.setPosition(cc.p(50, 1400));    
	    mostafa.runAction(
            cc.sequence(
                cc.bezierTo(options.time, bezier),
                cc.callFunc(function() {
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
                })
            )
        ); 
    };

    var animMostafaFlyingAway = function(options) {
        mostafa.stopAllActions();    
		
        var animAction = mostafa.runAction(cc.repeatForever(anims.mostafa_fly)),
			bezier = options.bezier || [
				cc.p( 360, 480),
				cc.p( 500, 668),
				cc.p( 700, 700)
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
    //////////////////////////////////////////////////////////////////////////////////////
    // Service programs
    //
	pl.hookStartAnimation = function(program, options) {
		cc.assert(typeof programs[program] === "function" , "42words, startProgramm: Invalid program number.");
		
		lg = $42.languagePack;

		if( !pl.getChildByTag($42.MURBIKS_LAYER_TAG )) pl.addChild(mul,3,$42.MURBIKS_LAYER_TAG);

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
		speechBubbleButton.setOpacity(0);
		
        speechBubbleButton.x = bubbleX - 120;
        speechBubbleButton.y = bubbleY - 240 - speechBubble.getContentSize().height/2;
        
        //$42.msg2.setString("x: "+bubbleX+", y: "+bubbleY+", content size: "+speechBubble.getContentSize().height);
		
        mul.addChild(speechBubbleLine,5,$42.SPEECH_BUBBLE_LINE_TAG);
		mul.addChild(speechBubbleCloud,5,$42.SPEECH_BUBBLE_CLOUD_TAG);
		if( !time ) {
			mul.addChild(speechBubbleButton,5,$42.SPEECH_BUBBLE_BUTTON_TAG);
			speechBubbleButton.runAction(
				cc.repeatForever(
					cc.sequence(
						cc.blink(0.66,4),
						cc.delayTime(5)
					)
				)
			);
		}
		mul.addChild(speechBubble,5,$42.SPEECH_BUBBLE_TAG);

        ml.pause();
        ml.unscheduleUpdate();
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
		speechBubbleButton.runAction(cc.sequence(cc.delayTime(0.6),cc.fadeIn(1.0)));
		
		if( time ) {
			speechBubble.runAction(
                cc.sequence(
                    cc.delayTime(time-0.9),
                    cc.callFunc(
                        function() { 
                            removeSpeechBubble(0.9); 
                        }
                    )
                )
            )
		}
	};

	var removeSpeechBubble = function(time) {
		if( !time ) var time = 0.9;
    	speechBubbleCloud.runAction(
	    	cc.sequence(
	   			cc.fadeOut(time),
	   			cc.callFunc( function() {
	       	        ml.resume();
	       	        ml.scheduleUpdate();
        	        mul.resume();
	       	        mul.scheduleUpdate();
	       	        mul.removeChild(speechBubbleButton);			        
					mul.removeChild(speechBubbleCloud);
					mul.removeChild(speechBubble);			        
	    		})
	    	)
	    );
		speechBubble.runAction(cc.fadeOut(time));			
		speechBubbleButton.runAction(cc.fadeOut(time));			
	};

	var hideSpeechBubble = function() {

		speechBubbleCloud.stopAllActions();
		speechBubbleCloud.runAction(
			cc.sequence(
				cc.fadeOut(0.3),
				cc.callFunc( function() {
					mul.removeChild(speechBubbleCloud);
					mul.removeChild(speechBubble);
			        mul.removeChild(speechBubbleLine);
				})
			)
		);
		speechBubble.stopAllActions();
		speechBubble.runAction(cc.fadeOut(0.9));			
	};

	var getFingerOffset = function() {
		var finger = hand.getChildByTag($42.FINGER_TAG);
		return cc.p(
			hand.convertToWorldSpace(finger.getPosition()).x - mul.convertToWorldSpace(hand.getPosition()).x,
			hand.convertToWorldSpace(finger.getPosition()).y - mul.convertToWorldSpace(hand.getPosition()).y
		);
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
		fingerIsPressed = false;
    	for( var i=0 ; i<contactRings.length ; i++ ) {
    		contactRings[i].setScale(0);
    		contactRings[i].stopAllActions();
    	}
		
	    if( !contact ) {
		    if( bezierPoint ) hand.runAction(cc.EaseSineIn.create(cc.bezierTo(time, bezierHand)));
		    else hand.runAction(cc.EaseSineIn.create(cc.moveTo(time, cc.p(pos.x- fo.x, pos.y - fo.y))));
		    
	    } else {

	    	// we must now the lower finger position shortly to get the target position
	    	var fp = hand.convertToWorldSpace(finger.getPosition());
	    	hand.setScale(0.9);
			fo = getFingerOffset();
	    	hand.setScale(1.0);
	    	
	    	// move hand with finger pressed down
		    if( bezierPoint ) hand.runAction(
		    	cc.sequence(
		    		cc.spawn(
		    			cc.scaleTo(time*0.15 ,0.9),
		    			cc.moveTo(time*0.15, cc.p(fp.x-fo.x,fp.y-fo.y))
		    		),
		    		cc.callFunc(function() { fingerIsPressed = true; }),
		    		cc.EaseSineIn.create(
		    			cc.bezierTo(time*0.7 , bezierHand)
		    		),
		    		cc.callFunc(function() { fingerIsPressed = false; }),
		    		cc.scaleTo(time*0.15,1)    		
		    	)
		    );
		    else hand.runAction(
		    	cc.sequence(
		    		cc.spawn(
		    			cc.scaleTo(time*0.15 ,0.9),
		    			cc.moveTo(time*0.15, cc.p(fp.x-fo.x,fp.y-fo.y))
		    		),
		    		cc.callFunc(function() { fingerIsPressed = true; }),
		    		cc.EaseSineIn.create(
		    			cc.moveTo(time*0.7, cc.p(pos.x- fo.x, pos.y - fo.y))
		    		),
		    		cc.callFunc(function() { fingerIsPressed = false; }),
		    		cc.scaleTo(time*0.15,1)    				    		
		    	)
		    );
	    	
	    	for( var i=0 ; i<contactRings.length ; i++ ) {
	    		contactRings[i].runAction(
	    			cc.sequence(
	    				cc.scaleTo(0, 0.5),
	    				cc.delayTime($42.HAND_CONTACT_TIME/contactRings.length*i),
	    				cc.callFunc(function() {
	    		    		this.runAction(
			    				cc.repeatForever(
				    				cc.sequence(
					    				cc.scaleTo($42.HAND_CONTACT_TIME, 2.2),
					    				cc.scaleTo(0, 0.3)
					    			)
					    		)
				    		);	 
	    				}, contactRings[i])
	    			)
	    		);
	    	}

	    	// stop circles after the movement
	    	hand.runAction(
	    		cc.spawn(
		    		cc.sequence(
	    				cc.delayTime(time),
	    				cc.callFunc( function() {
	    			    	for( var i=0 ; i<contactRings.length ; i++ ) {
	    			    		contactRings[i].setScale(0);
	    			    		contactRings[i].stopAllActions();
	    			    	}
	    				})
		    		)
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

	var initAnimation = function() {

		// Create layer for tutorial
		mul = new cc.Layer();
		_42_retain(mul, "Tutorial layer");
		
		// Load sprite frames to frame cache, add texture node
        cc.spriteFrameCache.addSpriteFrames(res.murbiks_plist);

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
        mostafa.attr({
        	x: 0,
        	y: 0,
        	scale: 1.9,
        	rotation: 0
    	});
        _42_retain(mostafa, "Mostafa");
    	mul.addChild(mostafa, 5);
    	
    	// load blue button items
		blueButton = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("mostafabutton"),cc.rect(0,0,250,70));
		blueButton.x =  0;
		blueButton.y =  -105;
		_42_retain(blueButton, "Blue button");
		menuText = cc.MenuItemFont.create(" ", function() {
			endProgram(true);
		} , mul);
		_42_retain(menuText, "menuText");
		var menuBox = cc.Menu.create(menuText);
		menuBox.x = 125;
		menuBox.y = 35;		
		menuBox.setColor(cc.color(0,0,40,255));
		blueButton.addChild(menuBox,5);
		mul.addChild(blueButton,10);
		
		// speech bubble load cloud and text object
		speechBubbleCloud = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("wordcloud"),cc.rect(0,0,480,300));
		_42_retain(speechBubbleCloud, "speechBubbleCloud");
		speechBubble = cc.LabelTTF.create("", "LibreBaskerville-Regular", $42.SPEECH_BUBBLE_FONTSIZE, cc.size($42.SPEECH_BUBBLE_WIDTH,0),cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
		_42_retain(speechBubble, "speechBubble");
		speechBubble.setColor($42.SPEECH_BUBBLE_COLOR);
		speechBubbleLine = cc.DrawNode.create();
		_42_retain(speechBubbleLine, "speechBubbleLine");
		var sprite = cc.spriteFrameCache.getSpriteFrame("go_on_button");
		speechBubbleButtonImage = cc.MenuItemImage.create(sprite, sprite, removeSpeechBubble);
        speechBubbleButton = cc.Menu.create.apply(mul, [speechBubbleButtonImage] );
        speechBubbleButton.setOpacity(255);
        speechBubbleButton.setScale($42.BUBBLE_BUTTON_SCALE);
        _42_retain(speechBubbleButton, "speechBubbleButton");
        
		// load hand, finger and contact
		hand = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("hand"),cc.rect(0,0,364,640));
		hand.setRotation($42.HAND_ROTATION);
		hand.setPosition(cc.p(-300,-300));
		_42_retain(hand, "Hand");
		finger = cc.Node.create();
		finger.setPosition(260,620);
		_42_retain(finger, "Finger");
		hand.addChild(finger,-1,$42.FINGER_TAG);
		mul.addChild(hand, 5, $42.HAND_TAG);
		
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
		if( animCnt !== null ) {
			timer += dt;
			
			if( animPrograms[animCnt].time < timer ) animPrograms[animCnt++].anim();
			if( animCnt >= animPrograms.length ) {
				endProgram(false);
				animCnt = null;
			}
		}
		
		// Emulate touch events
    	if( fingerIsPressed ) {
			var pos = hand.convertToWorldSpace(finger.getPosition());
			
    		if( !fingerPos ) {
    			fingerPos = pos;

	    		//cc.log("42words, update ("+timer+"): onTouchesBegan to "+fingerPos.x+" / "+fingerPos.y);
    			ml._touchListener.onTouchesBegan(undefined, undefined, fingerPos);
    		} else {
    			fingerPos = pos;
    			
    			ml._touchListener.onTouchesMoved(undefined, undefined, fingerPos);
    		}
    	} else {
    		if( fingerPos ) {
	    		//cc.log("42words, update ("+timer+"): onTouchesEnded to "+fingerPos.x+" / "+fingerPos.y);
    			ml._touchListener.onTouchesEnded(undefined, undefined, fingerPos);
    			fingerPos = null;
    		}
    	};

	};
	
    var programs = {
        "Mostafas Greeting": animMostafasGreeting,
        "Mostafa flies away": animMostafaFlyingAway
    };

	initAnimation();
},
$MM = _MURBIKS_MODULE;
