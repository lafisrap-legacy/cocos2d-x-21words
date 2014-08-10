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
$42.HAND_TAG = 101;
$42.FINGER_TAG = 102;
$42.HAND_ROTATION = 60;
$42.HAND_FINGER_OFFSET = 2;
$42.HAND_CONTACT_SIZE = 40;
$42.HAND_CONTACT_COLOR = cc.color(0,0,70);
$42.HAND_CONTACT_TIME = 1.1;


var MURBIKS_MODULE = function(layer) {
	var ml = layer,
		lg = null,
		curProgram = null,
		curProgramCnt = null,
		mostafa = null,
		anims = {},
		blueButton = null,
		hand = null,
		speechBubbleCloud = null,
		speechBubbleLine = null,
		speechBubble = null,
		timer = null,
		animCnt = null,
		animPrograms = null;

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
		    	time: 6.0,
		    	anim: function() {
		            showSpeechBubble(8.0 , $42.t.mostafa_basic01 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 7.5,
		    	anim: function() {
		    		pressFingerTo(2.0 , cc.p(400,800), cc.p(-200,400));		    		
		    	}
		    },{
		    	time: 10.0,
		    	anim: function() {
		            pressFingerTo(2.0 , cc.p(100,400), cc.p(-200,400));		    		
		    	}
		    },{
		    	time: 12.5,
		    	anim: function() {
		    		pressFingerTo(2.0 , cc.p(0,1152), cc.p(640,800));		    		
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
	        		})
	    		)
	    	); 
	    	
	    blueButton.runAction(cc.bezierTo(time, bezierButton));
	};

	var showSpeechBubble = function(time, text, pos) {
		
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
		
        ml.addChild(speechBubbleLine,5);
		ml.addChild(speechBubbleCloud,5);
		ml.addChild(speechBubble,5);
		
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
	
	var moveHandTo = function(time, pos, bezierPoint, contact) {
		
		var curPos = hand.getPosition(),
			finger = hand.getChildByTag($42.FINGER_TAG),
			fo = cc.p(
				hand.convertToWorldSpace(finger.getPosition()).x - ml.convertToWorldSpace(hand.getPosition()).x,
				hand.convertToWorldSpace(finger.getPosition()).y - ml.convertToWorldSpace(hand.getPosition()).y
			),
			bezierHand = bezierPoint? [
				cc.p(curPos.x - fo.x,curPos.y - fo.y),
	            cc.p(bezierPoint.x - fo.x, bezierPoint.y - fo.y),
	            cc.p(pos.x - fo.x,pos.y - fo.y)
            ] : null;
		
		if( !ml.getChildByTag($42.HAND_TAG) ) ml.addChild(hand, 5, $42.HAND_TAG);
		
	    if( bezierPoint ) hand.runAction(cc.bezierTo(time, bezierHand));
	    else hand.runAction(cc.moveTo(time, cc.p(pos.x- fo.x, pos.y - fo.y)));
	    
	    if( contact ) {
	    	var contacts = finger.getChildren();
	    	for( var i=0 ; i<contacts.length ; i++ ) {
	    		contacts[i].runAction(
	    			cc.sequence(
	    				cc.delayTime($42.HAND_CONTACT_TIME/contacts.length*i),
	    				cc.callFunc(function() {
	    		    		this.contactAction = this.runAction(
	    			    			cc.sequence(
	    			    				cc.repeatForever(
	    				    				cc.sequence(
	    					    				cc.scaleTo($42.HAND_CONTACT_TIME, 1.7),
	    					    				cc.scaleTo(0, 0)
	    					    			)
	    					    		)
	    						    )
	    			    		);	    					
	    				}, contacts[i])
	    			)
	    		)
	    	}

	    	// stop circles after the movement
	    	hand.runAction(
	    		cc.sequence(
    				cc.delayTime(time),
    				cc.callFunc( function() {
    			    	for( var i=0 ; i<contacts.length ; i++ ) {
    			    		contacts[i].setScale(0);
    			    		contacts[i].stopAction(contacts[i].contactAction);
    			    	}
    				})
	    		)
	    	)
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
			var contact = cc.DrawNode.create();
			contact.retain();
			contact.clear();
			contact.setScale(0);
			contact.drawCircle(cc.p(0,0), $42.HAND_CONTACT_SIZE, 0, 100, false, 2, $42.HAND_CONTACT_COLOR);
			finger.addChild(contact);
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
	};
	
	initAnimation();
},
$MM = MURBIKS_MODULE;
