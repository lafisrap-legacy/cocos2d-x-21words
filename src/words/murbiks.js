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
$42.HAND_CONTACT_SIZE = 40;
$42.HAND_CONTACT_COLOR = cc.color(0,0,70);
$42.HAND_CONTACT_TIME = 0.3;


var MURBIKS_MODULE = function(layer) {
	var ml = layer,
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
		hookResumeMenuLayer = null;
	
	/*
	 * Program 1
	 * 
	 * Turning a tile, moving it, let it fall and choosing it.
	 * 
	 */
	var turning_moving_falling_choosing = function() {
		
		startTileProgram(lg.tiles.turning_moving_falling_choosing);

		timer = animCnt = 0;
		animPrograms = [{
		    	time: 0,
		    	anim: function() {
		    		var words = lg.tiles_needed.turning_moving_falling_choosing;
		    		for( var i=0 ; i<words.length ; i++ ) insertWordIfNotIn(words[i].word , words[i].value);
	    			$42.maxWordValue = 4;

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
		            pressFingerTo(0.643 , cc.p(290,650));		    		
		    	}
		    },{
		    	time: 9.5,
		    	anim: function() {
		    		moveHandTo(0.5 , cc.p(270,420));		    		
		    	}
		    },{
		    	time: 10.0,
		    	anim: function() {
		    		pressFingerTo(0.643 , cc.p(280,670));		    		
		    	}
		    },{
		    	time: 11.0,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		tilePos.y -= 20;
		    		
		    		moveHandTo(0.8 , tilePos);		    		
		    	}
		    },{
		    	time: 11.8,
		    	anim: function() {
		    		var handPos = getHandPosition();
		    		
		    		handPos.x = handPos.x < 320? 530 : 110;
		    		
		    		pressFingerTo(1.5 , handPos);		    		
		    	}
		    },{
		    	time: 13.3,
		    	anim: function() {
		    		var handPos = getHandPosition();
		    		
		    		handPos.x = handPos.x < 320? 530 : 110;
		    		
		    		pressFingerTo(1.5 , handPos);		    		
		    	}
		    },{
		    	time: 14.8,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(192,300));		    		
		    	}
		    },{
		    	time: 15.9,
		    	anim: function() {
		    		moveHandTo(0.6 , cc.p(-100,0));		    		
		    	}
		    },{
		    	time: 16.0,
		    	anim: function() {
		            showSpeechBubble(6.0 , $42.t.mostafa_basic02 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 17.5,
		    	anim: function() {
		    		jumpHandTo(cc.p(0,0));
		    		moveHandTo(2.0 , cc.p(280,500), cc.p(280,300));		    		
		    	}
		    },{
		    	time: 19.5,
		    	anim: function() {
		            pressFingerTo(0.643 , cc.p(290,650));		    		
		    	}
		    },{
		    	time: 20.2,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		tilePos.y -= 20;
		    		
		    		moveHandTo(1.1 , tilePos);		    		
		    	}
		    },{
		    	time: 21.4,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(224,400));		    		
		    	}
		    },{
		    	time: 22.4,
		    	anim: function() {
		    		moveHandTo(0.8 , cc.p(-200,0));		    		
		    	}
		    },{
		    	time: 22.5,
		    	anim: function() {
		            showSpeechBubble(6.0 , $42.t.mostafa_basic03 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 23.0,
		    	anim: function() {
		    		jumpHandTo(cc.p(0,0));
		    		moveHandTo(2.0 , cc.p(280,500), cc.p(280,300));	
		    	}
		    },{
		    	time: 25.0,
		    	anim: function() {
		            pressFingerTo(0.643 , cc.p(290,650));		    		
		    	}
		    },{
		    	time: 25.7,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		tilePos.y -= 20;
		    		
		    		moveHandTo(1.1 , tilePos);		    		
		    	}
		    },{
		    	time: 26.8,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(384,400));		    		
		    	}
		    },{
		    	time: 27.9,
		    	anim: function() {
		    		moveHandTo(0.8 , cc.p(-200,0));		    		
		    	}
		    },{
		    	time: 30.0,
		    	anim: function() {
		            showSpeechBubble(8.0 , $42.t.mostafa_basic04 , mostafa.getPosition(), 350);		    		
		    	}
		    },{
		    	time: 31.0,
		    	anim: function() {
		    		moveHandTo(2.2 , cc.p(170,970) , cc.p(300,500));		    		
		    	}
		    },{
		    	time: 38.0,
		    	anim: function() {
		            showSpeechBubble(5.0 , $42.t.mostafa_basic05 , mostafa.getPosition(), 350);		    		
		    	}
		    },{
		    	time: 41.0,
		    	anim: function() {
		    		moveHandTo(0.8 , cc.p(340,640));		    		
		    	}
		    },{
		    	time: 42.0,
		    	anim: function() {
		    		pressFingerTo(0.4 , cc.p(330,640));
		    		hookResumeAskForWord(hookResumeMenuLayer , true);
		    	}
		    },{
		    	time: 43.0,
		    	anim: function() {
		    		moveHandTo(0.8 , cc.p(-200,0));		    		
		    	}
		    },{
		    	time: 44.1,
		    	anim: function() {
		            showSpeechBubble(4.0 , $42.t.mostafa_basic06 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 45.1,
		    	anim: function() {
		    		moveMostafaAndButton(3.0, [
           			    cc.p(500,180),
        	            cc.p(350,500),
        	            cc.p(800,1000)
        		    ]);		
		    	}
		    }
		];
	};
	
	/*
	 * Program 2
	 * 
	 * Selecting a tile, selecting single letters, deleting unwanted letters.
	 * 
	 */
	var selecting_deleting = function() {
		
		timer = animCnt = 0;
		animPrograms = [{
		    	time: 0,
		    	anim: function() {
		    		var words = lg.tiles_needed.selecting_deleting;
		    		for( var i=0 ; i<words.length ; i++ ) insertWordIfNotIn(words[i].word , words[i].value);
	    			
	    			mostafa.setPosition(cc.p(800,1000));
	    			blueButton.setPosition(cc.p(800,895));

	    			showMostafaAndButton(3.0);		    		
		    	}
			},{
		    	time: 3.0,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		moveHandTo(1.1 , tilePos);		    		
		    	}
		    },{
		    	time: 4.1,
		    	anim: function() {
		    		startTileProgram(lg.tiles.selecting_deleting);
		    		pressFingerTo(1.0 , cc.p(240,400));		    		
		    	}
		    },{
		    	time: 5.2,
		    	anim: function() {
		    		moveHandTo(1.1 , cc.p(-200,0));	
		    	}
		    },{
		    	time: 5.5,
		    	anim: function() {
		    		mostafaFlyingToMiddle(5.5);	
		    	}
		    },{
		    	time: 7.0,
		    	anim: function() {
		            showSpeechBubble(3.0 , $42.t.mostafa_advanced01 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 8.6,
		    	anim: function() {
		    		ml.unselectWord();
		    		for( var i=0 ; i<$42.BOXES_PER_COL ; i++ ) ml.deleteRow(i,true);
		    	}		    	
		    },{
		    	time: 9.0,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		moveHandTo(1.1 , tilePos);		    		
		    	}
		    },{
		    	time: 10.1,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(128,400));		    		
		    	}
		    },{
		    	time: 11.2,
		    	anim: function() {
		    		moveHandTo(1.1 , cc.p(-200,0));	
		    	}
		    },{
		    	time: 13.0,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		moveHandTo(1.1 , tilePos);		    		
		    	}
		    },{
		    	time: 14.1,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(192,400));		    		
		    	}
		    },{
		    	time: 15.2,
		    	anim: function() {
		    		moveHandTo(1.1 , cc.p(-200,0));	
		    	}
		    },{
		    	time: 16.3,
		    	anim: function() {
		            showSpeechBubble(7.0 , $42.t.mostafa_advanced02 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 17.4,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,2);
		    		
		    		moveHandTo(1.1 , boxPos);		    		
		    	}
		    },{
		    	time: 18.8,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,2);
		    		
		    		pressFingerTo(0.6 , boxPos);		    		
		    	}
		    },{
		    	time: 19.6,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,2);
		    		
		    		boxPos.x -= 100;
		    		boxPos.y -= 30;
		    		
		    		moveHandTo(0.5 , boxPos);		    		
		    	}
		    },{
		    	time: 20.4,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,2);
		    		
		    		moveHandTo(1.1 , boxPos);		    		
		    	}
		    },{
		    	time: 21.8,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,2);
		    		
		    		pressFingerTo(0.3 , boxPos);		    		
		    	}
		    },{
		    	time: 22.2,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,2);
		    		
		    		boxPos.x -= 100;
		    		boxPos.y -= 30;
		    		
		    		moveHandTo(0.5 , boxPos);		    		
		    	}
		    },{
		    	time: 25.0,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		moveHandTo(1.1 , tilePos);		    		
		    	}
		    },{
		    	time: 26.1,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(288,400));		    		
		    	}
		    },{
		    	time: 27.2,
		    	anim: function() {
		    		moveHandTo(1.1 , cc.p(-200,0));	
		    	}
		    },{
		    	time: 27.3,
		    	anim: function() {
		            showSpeechBubble(7.0 , $42.t.mostafa_advanced03 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 28.5,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,4);
		    		
		    		boxPos.y -= $42.BS;
		    		
		    		moveHandTo(0.5 , boxPos);		    		
		    	}
		    },{
		    	time: 34.3,
		    	anim: function() {
		            showSpeechBubble(7.0 , $42.t.mostafa_advanced04 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 35.5,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,5);

		    		boxPos.y -= 40;
		    		
		    		moveHandTo(0.5 , boxPos);		    		
		    	}
		    },{
		    	time: 36.5,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,5);
		    		
		    		boxPos.y -= 40;
		    		
		    		pressFingerTo(0.2 , boxPos);		    		
		    	}
		    },{
		    	time: 37.0,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,5);
		    		
		    		boxPos.x -= 100;
		    		boxPos.y -= 30;
		    		
		    		moveHandTo(0.5 , boxPos);		    		
		    	}
		    },{
		    	time: 40.0,
		    	anim: function() {
		    		moveHandTo(0.4 , cc.p(320,300));		    		
		    	}
		    },{
		    	time: 40.4,
		    	anim: function() {
		    		pressFingerTo(0.2 , cc.p(320,500));		    		
		    	}
		    },{
		    	time: 41.0,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		moveHandTo(0.5 , tilePos);		    		
		    	}
		    },{
		    	time: 41.5,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(0,100));		    		
		    	}
		    },{
		    	time: 42.6,
		    	anim: function() {
		    		moveHandTo(1.1 , cc.p(-200,0));	
		    	}
		    },{
		    	time: 43.3,
		    	anim: function() {
		            showSpeechBubble(7.0 , $42.t.mostafa_advanced05 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 43.4,
		    	anim: function() {
		    		var boxPos = getBoxPosition(2,3);

		    		hand.setRotation(85);
		    		moveHandTo(0.5 , boxPos);		    		
		    	}
		    },{
		    	time: 50.3,
		    	anim: function() {
		            showSpeechBubble(4.0 , $42.t.mostafa_advanced06 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 51.3,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		moveHandTo(1.1 , tilePos);		    		
		    		hand.runAction(cc.rotateTo(2.5,$42.HAND_ROTATION));
		    	}
		    },{
		    	time: 52.4,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(544,100));		    		
		    	}
		    },{
		    	time: 53.5,
		    	anim: function() {
		    		moveHandTo(1.1 , cc.p(-200,0));	
		    	}
		    },{
		    	time: 54.0,
		    	anim: function() {
		            showSpeechBubble(6.0 , $42.t.mostafa_advanced07 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 55.0,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		moveHandTo(1.7 , tilePos);		    		
		    		hand.runAction(cc.rotateTo(1.7,105));
		    	}
		    },{
		    	time: 56.8,
		    	anim: function() {
		    		pressFingerTo(10.0 , cc.p(480,300));		    		
		    	}
		    },{
		    	time: 60.0,
		    	anim: function() {
		            showSpeechBubble(6.0 , $42.t.mostafa_advanced08 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 66.9,
		    	anim: function() {
		    		moveHandTo(2.5 , cc.p(-200,0));
		    		hand.runAction(cc.rotateTo(2.5,$42.HAND_ROTATION));
		    	}
		    },{
		    	time: 71.0,
		    	anim: function() {
		    		moveHandTo(0.8 , cc.p(340,640));		    		
		    	}
		    },{
		    	time: 72.1,
		    	anim: function() {
		    		pressFingerTo(0.4 , cc.p(340,640));
		    		hookResumeAskForWord(hookResumeMenuLayer , true);
		    	}
		    },{
		    	time: 72.6,
		    	anim: function() {
		    		moveHandTo(0.8 , cc.p(-200,0));		    		
		    	}
		    },{
		    	time: 74.2,
		    	anim: function() {
		            showSpeechBubble(4.0 , $42.t.mostafa_advanced09 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 75.3,
		    	anim: function() {
		    		moveMostafaAndButton(3.0, [
           			    cc.p(500,180),
        	            cc.p(350,500),
        	            cc.p(800,1000)
        		    ]);		
		    	}
		    },{
		    	time: 80.7,
		    	anim: function() {
		    		mostafaFlyingToMiddle(6.0, [
					    cc.p(0,0),
			            cc.p(200,520),
			            cc.p(320,320)
				    ],[
						cc.p(320,320),
			            cc.p(200,415),
			            cc.p(1000,300)
					] )	
		    	}
		    },{
		    	time: 82.7,
		    	anim: function() {
		            showSpeechBubble(6.0 , $42.t.mostafa_advanced10 , mostafa.getPosition());		    		
		    	}
		    }
		];
	};
	
	var test = function(cb) {
		startTileProgram(lg.tiles.test);
	};

	var test1 = function(cb) {
		startTileProgram(lg.tiles.test1);
	};
	
	var test2 = function(cb) {
		startTileProgram(lg.tiles.test2);
	};
	
	var test3 = function(cb) {
		startTileProgram(lg.tiles.test3);
	};
	
	var test4 = function(cb) {
		startTileProgram(lg.tiles.test4);
	};
	
	var test5 = function(cb) {
		startTileProgram(lg.tiles.test5);
	};
	
	var test6 = function(cb) {
		startTileProgram(lg.tiles.test6);
	};
	
	
	/* 
	 * Service programs
	 */
	
	var endProgram = function(emergency) {

		if( emergency ) {
			stopTileProgram();
			hideSpeechBubble();
			moveMostafaAndButton(2.0, [
	  			cc.p(500,180),
		            cc.p(350,500),
		            cc.p(800,1000)
			    ]);
			moveHandTo(0.8 , cc.p(-300,-300));
			fingerIsPressed = false;
			if( fingerPos ) {
				ml._touchListener.onTouchesEnded(undefined, undefined, fingerPos);
				fingerPos = null;
			}
			animCnt = null;			
		}
		var ls = cc.sys.localStorage;
		$42.tutorialsDone = curProgram + 1;
		ls.setItem("tutorialsDone",$42.tutorialsDone); 

		// resume touch events
		if( stopEvents ) ml.initListeners();
	};
	
	var showMostafaAndButton = function(time, cb) {
		
		// menu functions
    	var animAction = mostafa.runAction(cc.repeatForever(anims.mostafa_fly)),
			bezierMostafa = [
			    cc.p(0,0),
	            cc.p(200,520),
	            cc.p(500,180)
		    ],
			bezierButton = [
				cc.p(0,-105),
	            cc.p(200,415),
	            cc.p(500,75)
			];
		animAction.retain();
		menuText.setString($42.t.murbiks_tutorial);
			
	    mostafa.runAction(
	        	cc.sequence(
	        		cc.bezierTo(time, bezierMostafa),
	        		cc.callFunc(function() {
	        			mul.stopAction(animAction);
	        			animAction = mostafa.runAction(anims.mostafa_land);
	        			animAction.retain();
	        		})
	    		)
	    	); 
	    	
	    blueButton.runAction(cc.sequence(cc.bezierTo(time, bezierButton),cc.callFunc(function() {
	    	menuText.setString($42.t.murbiks_skip_tutorial);
	    })));
	};
	
	var moveMostafaAndButton = function( time, bezier ) {

		var animAction = mostafa.runAction(cc.repeatForever(anims.mostafa_fly)),
			bezierMostafa = bezier,
			bezierButton = [
				cc.p(bezier[0].x,bezier[0].y-105),
				cc.p(bezier[1].x,bezier[1].y-105),
				cc.p(bezier[2].x,bezier[2].y-105),
			];
		animAction.retain();
			
	    mostafa.runAction(
	        	cc.sequence(
	        		cc.bezierTo(time, bezierMostafa),
	        		cc.callFunc(function() {
	        			mul.stopAction(animAction);
	        			animAction = mostafa.runAction(anims.mostafa_land);
	        			animAction.retain();
	        		})
	    		)
	    	); 
	    	
	    blueButton.runAction(cc.bezierTo(time, bezierButton));		
	};
	
	var mostafaFlyingToMiddle = function(time, bezierIn , bezierOut) {
		var animAction = mostafa.runAction(cc.repeatForever(anims.mostafa_fly)),
			bezierMostafaIn = bezierIn || [
				cc.p(500,180),
				cc.p(650,300),
				cc.p(ml.size.width/2,ml.size.height/2)
			];
			bezierMostafaOut = bezierOut || [
			    cc.p(ml.size.width/2,ml.size.height/2),
	   			cc.p(350,400),
	   			cc.p(500,180)
	   		];
		animAction.retain();
			
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
        			animAction.retain();
        		})
    		)
    	); 		
	};

	var showSpeechBubble = function(time, text, pos, bubbleY) {
		
		var bubbleX = ml.size.width/2;
		if( !bubbleY ) bubbleY = ml.size.height/2;
		if( mul.getChildByTag( $42.SPEECH_BUBBLE_TAG ) ) mul.removeChild(speechBubble);
		if( mul.getChildByTag( $42.SPEECH_BUBBLE_LINE_TAG ) ) mul.removeChild(speechBubbleLine);
		if( mul.getChildByTag( $42.SPEECH_BUBBLE_CLOUD_TAG ) ) mul.removeChild(speechBubbleCloud);
		
    	speechBubble.setString(text);
		speechBubble.setPosition(bubbleX , bubbleY);
		speechBubbleCloud.setPosition(bubbleX , bubbleY);
		speechBubbleCloud.setScaleY((speechBubble.getContentSize().height+2*$42.SPEECH_BUBBLE_FONTSIZE) / $42.SPEECH_BUBBLE_HEIGHT);

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
		
		speechBubbleCloud.runAction(
			cc.sequence(
				cc.fadeTo(0.3,$42.SPEECH_BUBBLE_OPACITY),
				cc.delayTime(0.5),
				cc.callFunc( function() {
			        mul.removeChild(speechBubbleLine);
				}),
				cc.delayTime((time || 3)-(0.3+0.9+0.3+0.5)),
				cc.fadeOut(0.9),
				cc.delayTime(0.3),
				cc.callFunc( function() {
					mul.removeChild(speechBubbleCloud);
					mul.removeChild(speechBubble);
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

	var getTilePosition = function() {
		return ml.tiles[ml.tiles.length-1].sprite.getPosition();
	};
	
	var getBoxPosition = function(row,col) {
		return ml.boxes[row][col].sprite.getPosition();
	};
	
	var getHandPosition = function() {
		var fo = getFingerOffset(),
			hp = hand.getPosition();

		return cc.p(hp.x + fo.x, hp.y + fo.y);
	};
	
	var insertWordIfNotIn = function(word, value, freq) {
		var prefix = word.substr(0,3);
		// delete word from full word list
		var words = $42.words[prefix];
		for( var i=0 ; i<words.length && words[i].word !== word ; i++ );
		if( i === words.length ) words.push({"word":word,"value":value,"frequency":freq || 0});
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
		mul.retain();
		
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
    	mul.addChild(mostafa, 5);
    	
    	// load blue button items
		blueButton = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("bluebutton"),cc.rect(0,0,250,70));
		blueButton.x =  0;
		blueButton.y =  -105;
		blueButton.retain();
		menuText = cc.MenuItemFont.create(" ", function() {
			endProgram(true);
		} , mul);
		menuText.retain();
		var menuBox = cc.Menu.create(menuText);
		menuBox.x = 125;
		menuBox.y = 35;		
		menuBox.setColor(cc.color(0,0,40,255));
		blueButton.addChild(menuBox,5);
		mul.addChild(blueButton,10);
		
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
		hand.setPosition(cc.p(-300,-300));
		hand.retain();
		finger = cc.Node.create();
		finger.setPosition(260,620);
		finger.retain();
		hand.addChild(finger,-1,$42.FINGER_TAG);
		mul.addChild(hand, 5, $42.HAND_TAG);
		
		for( var i=0 ; i<3 ; i++ ) {
			contactRings[i] = cc.DrawNode.create();
			contactRings[i].clear();
			contactRings[i].setScale(0);
			contactRings[i].drawCircle(cc.p(0,0), $42.HAND_CONTACT_SIZE, 0, 100, false, 2, $42.HAND_CONTACT_COLOR);
			finger.addChild(contactRings[i]);
			contactRings[i].retain();
		}
		
		mul.update = update;
		mul.scheduleUpdate();
	};
	
	var exitAnimation = function() {

		// Create layer for tutorial
		mul.release();
		mul.unscheduleUpdate();
		ml.getParent().removeChild(mul);
	};
	
 
	/*
	 * All programs
	 */
	var programs = [
        turning_moving_falling_choosing,		// 0
        selecting_deleting,
        test1,
        test2,
        test3,
        test4,
        test5,
        test6,
        undefined,
        undefined,
        test
    ];

	ml.hookStartProgram = function(program, stopEvs) {
		cc.assert(typeof programs[program] === "function" , "42words, startProgramm: Invalid program number.");
		
		lg = $42.languagePack;

		var scene = ml.getParent();
		if( !scene.getChildByTag($42.MURBIKS_LAYER_TAG )) scene.addChild(mul,3,$42.MURBIKS_LAYER_TAG);

		// No touch events
		if( stopEvs ) ml.stopListeners();
		
		stopEvents = stopEvs;
		curProgram = program;
		
		programs[program]();
	};
	
	ml.hookGetProgrammedTile = function() {
		if( !curTileProgram || curTileProgramCnt >= curTileProgram.length ) {
			curTileProgram = null;
			curTileProgramCnt = null;
			return null;
		}
		
		return curTileProgram[curTileProgramCnt++];
	};
	
	ml.hookResumeAskForWord = function(cb , menuLayer ) {
		hookResumeAskForWord = cb;
		hookResumeMenuLayer = menuLayer;
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

	    		cc.log("42words, update ("+timer+"): onTouchesBegan to "+fingerPos.x+" / "+fingerPos.y);
    			ml._touchListener.onTouchesBegan(undefined, undefined, fingerPos);
    		} else {
    			fingerPos = pos;
    			
    			ml._touchListener.onTouchesMoved(undefined, undefined, fingerPos);
    		}
    	} else {
    		if( fingerPos ) {
	    		cc.log("42words, update ("+timer+"): onTouchesEnded to "+fingerPos.x+" / "+fingerPos.y);
    			ml._touchListener.onTouchesEnded(undefined, undefined, fingerPos);
    			fingerPos = null;
    		}
    	};

	};
	
	initAnimation();
},
$MM = MURBIKS_MODULE;
