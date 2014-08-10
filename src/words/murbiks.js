/*
 * Murbiks Module
 * 
 * Tutorials
 * 
 * 
 * 
 * 
 * */

$42.SPEECH_BUBBLE_WIDTH = 600;
$42.SPEECH_BUBBLE_HEIGHT = 450;
$42.SPEECH_BUBBLE_COLOR = cc.color(0,0,70);
$42.SPEECH_BUBBLE_FONTSIZE = 48;
$42.SPEECH_BUBBLE_OPACITY = 120;
$42.SPEECH_BUBBLE_LINE_COLOR = cc.color(170,170,185);
$42.SPEECH_BUBBLE_TAG = 101;
$42.SPEECH_BUBBLE_LINE_TAG = 102;
$42.SPEECH_BUBBLE_CLOUD_TAG = 103;
$42.HAND_TAG = 104;
$42.FINGER_TAG = 102;
$42.HAND_ROTATION = 60;
$42.HAND_FINGER_OFFSET = 2;
$42.HAND_CONTACT_SIZE = 40;
$42.HAND_CONTACT_COLOR = cc.color(0,0,70);
$42.HAND_CONTACT_TIME = 0.3;


var MURBIKS_MODULE = function(layer) {
	var ml = layer,
		lg = null,
		curProgram = null,
		curProgramCnt = null,
		mostafa = null,
		anims = {},
		blueButton = null,
		hand = null,
		contacts = [],
		contactActions = [],
		speechBubbleCloud = null,
		speechBubbleLine = null,
		speechBubble = null,
		timer = null,
		animCnt = null,
		animPrograms = null,
		fingerIsPressed = false,
		fingerPos = null;

	/*
	 * Program 1
	 * 
	 * Turning a tile, moving it, let it fall and choosing it.
	 * 
	 */
	var turning_moving_falling_choosing = function(cb) {
		
		startTileProgram(lg.tiles.turning_moving_falling_choosing);
		
		timer = animCnt = 0;
		animPrograms = [{
		    	time: 0,
		    	anim: function() {
		    		showMostafaAndButton(2.0);		    		
		    	}
		    },{
		    	time: 2.5,
		    	anim: function() {
		            showSpeechBubble(3.0 , $42.t.mostafa_hi , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 5.0,
		    	anim: function() {
		            showSpeechBubble(8.0 , $42.t.mostafa_basic01 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 6.5,
		    	anim: function() {
		    		jumpHandTo(cc.p(0,0));
		    		moveHandTo(2.0 , cc.p(280,500), cc.p(280,300));		    		
		    	}
		    },{
		    	time: 8.5,
		    	anim: function() {
		            pressFingerTo(0.4 , cc.p(290,650));		    		
		    	}
		    },{
		    	time: 9.5,
		    	anim: function() {
		    		moveHandTo(0.5 , cc.p(270,520));		    		
		    	}
		    },{
		    	time: 10.0,
		    	anim: function() {
		    		pressFingerTo(0.4 , cc.p(280,670));		    		
		    	}
		    },{
		    	time: 11.0,
		    	anim: function() {
		    		var tilePos = getTilePosition(),
		    			handPos = getHandPosition();
		    		
		    		tilePos.y -= 40;
		    		
		    		moveHandTo(0.8 , tilePos);		    		
		    	}
		    },{
		    	time: 11.8,
		    	anim: function() {
		    		var tilePos = getTilePosition(),
		    			handPos = getHandPosition();
		    		
		    		handPos.x = handPos.x < 320? 530 : 110;
		    		
		    		pressFingerTo(1.5 , handPos);		    		
		    	}
		    },{
		    	time: 13.3,
		    	anim: function() {
		    		var tilePos = getTilePosition(),
		    			handPos = getHandPosition();
		    		
		    		handPos.x = handPos.x < 320? 530 : 110;
		    		
		    		pressFingerTo(1.5 , handPos);		    		
		    	}
		    },{
		    	time: 14.8,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(200,300));		    		
		    	}
		    },{
		    	time: 15.9,
		    	anim: function() {
		    		moveHandTo(0.8 , cc.p(-200,0));		    		
		    	}
		    },{
		    	time: 20.5,
		    	anim: function() {
		            showSpeechBubble(3.0 , $42.t.mostafa_basic02 , mostafa.getPosition());		    		
		    	}
		    } 
		];
	};
	
	
	/* 
	 * Service programs
	 */
	
	var showMostafaAndButton = function(time) {
		
		// menu functions
		var clickOnSkip = function() {
			cc.log("Skip tutorial!");
		};
		
    	var animAction = mostafa.runAction(cc.repeatForever(anims.mostafa_fly)),
			menuText = cc.MenuItemFont.create($42.t.murbiks_skip_tutorial, clickOnSkip , ml),
			menuBox = cc.Menu.create(menuText),
			bezierMostafa = [
			    cc.p(0,0),
	            cc.p(200,520),
	            cc.p(500,180)
		    ],
			bezierButton = [
				cc.p(0,-145),
	            cc.p(200,415),
	            cc.p(500,75)
			];
		menuBox.retain();
		animAction.retain();
		blueButton.x = 0;
		blueButton.y = 0;
		menuBox.x = 125;
		menuBox.y = 35;		
		menuBox.setColor(cc.color(0,0,40,255));
		blueButton.addChild(menuBox,5);
		ml.addChild(blueButton,10);
			
	    mostafa.runAction(
	        	cc.sequence(
	        		cc.bezierTo(time, bezierMostafa),
	        		cc.callFunc(function() {
	        			ml.stopAction(animAction);
	        			animAction = mostafa.runAction(anims.mostafa_land);
	        			animAction.retain();
	        		})
	    		)
	    	); 
	    	
	    blueButton.runAction(cc.bezierTo(time, bezierButton));
	};

	var showSpeechBubble = function(time, text, pos) {
		
		if( ml.getChildByTag( $42.SPEECH_BUBBLE_TAG ) ) ml.removeChild(speechBubble);
		if( ml.getChildByTag( $42.SPEECH_BUBBLE_LINE_TAG ) ) ml.removeChild(speechBubbleLine);
		if( ml.getChildByTag( $42.SPEECH_BUBBLE_CLOUD_TAG ) ) ml.removeChild(speechBubbleCloud);
		
    	speechBubble.setString(text);
		speechBubble.setPosition(ml.size.width/2 , ml.size.height/2);
		speechBubbleCloud.setPosition(ml.size.width/2 , ml.size.height/2);
		speechBubbleCloud.setScaleY((speechBubble.getContentSize().height+2*$42.SPEECH_BUBBLE_FONTSIZE) / $42.SPEECH_BUBBLE_HEIGHT);

		speechBubbleLine.clear();
		var xDist = ml.size.width/2 - pos.x,
			yDist = ml.size.height/2 - pos.y;
		
		speechBubbleLine.drawSegment(
			cc.p(pos.x + xDist/4, pos.y + yDist/4), 
            cc.p(ml.size.width/2 - xDist/2,ml.size.height/2 - yDist/2),
            2,
            $42.SPEECH_BUBBLE_LINE_COLOR
        );         	

		speechBubbleCloud.setOpacity(0);
		speechBubble.setOpacity(0);
		
        ml.addChild(speechBubbleLine,5,$42.SPEECH_BUBBLE_LINE_TAG);
		ml.addChild(speechBubbleCloud,5,$42.SPEECH_BUBBLE_CLOUD_TAG);
		ml.addChild(speechBubble,5,$42.SPEECH_BUBBLE_TAG);
		
		speechBubbleCloud.runAction(
			cc.sequence(
				cc.fadeTo(0.3,$42.SPEECH_BUBBLE_OPACITY),
				cc.delayTime((time || 3)-(0.3+0.9+0.3)),
				cc.callFunc( function() {
			        ml.removeChild(speechBubbleLine);
				}),
				cc.fadeOut(0.9),
				cc.delayTime(0.3),
				cc.callFunc( function() {
					ml.removeChild(speechBubbleCloud);
					ml.removeChild(speechBubble);
				})
			)
		);
		speechBubble.runAction(
			cc.sequence(
				cc.fadeIn(0.3),
				cc.delayTime((time || 3)-(0.3+0.9+0.3)),
				cc.fadeOut(0.9)
			)
		);			
	};
	
	var getTilePosition = function() {
		return ml.tiles[ml.tiles.length-1].sprite.getPosition();
	};
	
	var getHandPosition = function() {
		var fo = getFingerOffset(),
			hp = hand.getPosition();

		return cc.p(hp.x + fo.x, hp.y + fo.y);
	};
	
	var getFingerOffset = function() {
		var finger = hand.getChildByTag($42.FINGER_TAG);
		return cc.p(
			hand.convertToWorldSpace(finger.getPosition()).x - ml.convertToWorldSpace(hand.getPosition()).x,
			hand.convertToWorldSpace(finger.getPosition()).y - ml.convertToWorldSpace(hand.getPosition()).y
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
		
		if( !ml.getChildByTag($42.HAND_TAG) ) ml.addChild(hand, 5, $42.HAND_TAG);
		
		// stop everything, we have new orders ...
		hand.stopAllActions();
    	for( var i=0 ; i<contacts.length ; i++ ) {
    		contacts[i].setScale(0);
    		contacts[i].stopAllActions();
    	}
		
	    if( !contact ) {
		    if( bezierPoint ) hand.runAction(cc.EaseSineIn.create(cc.bezierTo(time, bezierHand)));
		    else hand.runAction(cc.EaseSineIn.create(cc.moveTo(time, cc.p(pos.x- fo.x, pos.y - fo.y))));
		    
	    } else {
	    	
	    	fingerIsPressed = true;
		    if( bezierPoint ) hand.runAction(
		    	cc.sequence(
		    		cc.scaleTo(time*0.15 ,0.9),
		    		cc.EaseSineIn.create(
		    			cc.bezierTo(time*0.7 , bezierHand)
		    		),
		    		cc.scaleTo(time*0.15,1)    		
		    	)
		    );
		    else hand.runAction(
		    	cc.sequence(
		    		cc.scaleTo(time*0.15,0.9),
		    		cc.EaseSineIn.create(
		    			cc.moveTo(time*0.7, cc.p(pos.x- fo.x, pos.y - fo.y))
		    		),
		    		cc.scaleTo(time*0.15,1)    				    		
		    	)
		    );
	    	
	    	for( var i=0 ; i<contacts.length ; i++ ) {
	    		contacts[i].runAction(
	    			cc.sequence(
	    				cc.scaleTo(0, 0.5),
	    				cc.delayTime($42.HAND_CONTACT_TIME/contacts.length*i),
	    				cc.callFunc(function() {
	    		    		this.runAction(
			    				cc.repeatForever(
				    				cc.sequence(
					    				cc.scaleTo($42.HAND_CONTACT_TIME, 3),
					    				cc.scaleTo(0, 0.3)
					    			)
					    		)
				    		);	 
	    				}, contacts[i])
	    			)
	    		);
	    	}

	    	// stop circles after the movement
	    	hand.runAction(
	    		cc.spawn(
		    		cc.sequence(
	    				cc.delayTime(time),
	    				cc.callFunc( function() {
	    			    	for( var i=0 ; i<contacts.length ; i++ ) {
	    			    		contacts[i].setScale(0);
	    			    		contacts[i].stopAllActions();
	    			    	}
    				    	fingerIsPressed = false;
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
	    curProgram = program;
	    curProgramCnt = 0;
	};
	
	var initAnimation = function() {

		// Load sprite frames to frame cache, add texture node
        cc.spriteFrameCache.addSpriteFrames(res.murbiks_plist);

		var loadFrames = function(name,cnt) {
			var frames = [];
	    	for (var i = 1; i <= cnt; i++) {
	        	str = name + (i < 10 ? ("0" + i) : i);
	        	frames.push(cc.spriteFrameCache.getSpriteFrame(str));        	
	    	}
	    	var anim = cc.Animation.create(frames, 0.06);
	    	anims[name] = cc.animate(anim);
	    	anims[name].retain();
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
        mostafa.retain();
    	ml.addChild(mostafa, 5);
    	
    	// load menu items
		blueButton = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("bluebutton"),cc.rect(0,0,250,70));
		blueButton.retain();
		
		// speech bubble load cloud and text object
		speechBubbleCloud = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("wordcloud"),cc.rect(0,0,480,300));
		speechBubbleCloud.retain();
		speechBubble = cc.LabelTTF.create("", "Arial", $42.SPEECH_BUBBLE_FONTSIZE, cc.size($42.SPEECH_BUBBLE_WIDTH,0),cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
		speechBubble.retain();
		speechBubble.setColor($42.SPEECH_BUBBLE_COLOR);
		speechBubbleLine = cc.DrawNode.create();
		speechBubbleLine.retain();
		
		// load hand, finger and contact
		hand = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("hand"),cc.rect(0,0,364,640));
		hand.setRotation($42.HAND_ROTATION);
		hand.retain();
		finger = cc.Node.create();
		finger.setPosition(260,620);
		finger.retain();
		hand.addChild(finger,-1,$42.FINGER_TAG);
		
		for( var i=0 ; i<3 ; i++ ) {
			contacts[i] = cc.DrawNode.create();
			contacts[i].clear();
			contacts[i].setScale(0);
			contacts[i].drawCircle(cc.p(0,0), $42.HAND_CONTACT_SIZE, 0, 100, false, 3, $42.HAND_CONTACT_COLOR);
			finger.addChild(contacts[i]);
			contacts[i].retain();
		}
	};
	
 
	/*
	 * All programs
	 */
	var programs = [
        turning_moving_falling_choosing,		// 0
    ];

	ml.hookStartProgram = function(program, stopEvents) {
		cc.assert(typeof programs[program] === "function" , "42words, startProgramm: Invalid program number.");
		
		lg = $42.languagePack;

		// No touch events
		if( stopEvents ) ml.stopListeners();
		programs[program](function() {
			// resume touch events
			if( stopEvents ) ml.initListeners();
		});
	};
	
	ml.hookGetProgrammedTile = function() {
		if( !curProgram || curProgramCnt >= curProgram.length ) {
			curProgram = null;
			curProgramCnt = null;
			return null;
		}
		
		return curProgram[curProgramCnt++];
	};
	
	ml.hookMurbiksUpdate = function(dt) {
		if( animCnt !== null ) {
			timer += dt;
			
			if( animPrograms[animCnt].time < timer ) animPrograms[animCnt++].anim();
			if( animCnt >= animPrograms.length ) animCnt = null;
		}
		
		// Emulate touch events
    	if( fingerIsPressed ) {
			var fo = getFingerOffset(),
				pos = hand.getPosition();
				pos.x += fo.x; pos.y += fo.y;
			
    		if( !fingerPos ) {
    			fingerPos = pos;

    			ml._touchListener.onTouchesBegan(undefined, undefined, fingerPos);
    		} else {
    			fingerPos = pos;
    			
    			ml._touchListener.onTouchesMoved(undefined, undefined, fingerPos);
    		}
    	} else {
    		if( fingerPos ) {
    			
    			ml._touchListener.onTouchesEnded(undefined, undefined, cc.p(0,0));
    			fingerPos = null;
    		}
    	};

	};
	
	initAnimation();
},
$MM = MURBIKS_MODULE;
