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
		scoreBarDirty;
	
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
		    	time: 2.6,
		    	anim: function() {
		            showSpeechBubble(undefined , $42.t.mostafa_basic01 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 2.7,
		    	anim: function() {
		    		jumpHandTo(cc.p(0,0));
		    		moveHandTo(1.5 , cc.p(280,500), cc.p(280,300));		    		
		    	}
		    },{
		    	time: 4.8,
		    	anim: function() {
		            pressFingerTo(0.743 , cc.p(290,650));		    		
		    	}
		    },{
		    	time: 5.8,
		    	anim: function() {
		    		moveHandTo(0.5 , cc.p(270,420));		    		
		    	}
		    },{
		    	time: 6.4,
		    	anim: function() {
		    		pressFingerTo(0.643 , cc.p(280,670));		    		
		    	}
		    },{
		    	time: 7.2,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		tilePos.y -= 20;
		    		
		    		moveHandTo(0.8 , tilePos);		    		
		    	}
		    },{
		    	time: 7.7,
		    	anim: function() {
		            showSpeechBubble(undefined , $42.t.mostafa_basic02 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 7.8,
		    	anim: function() {
		    		var handPos = getHandPosition();
		    		
		    		handPos.x = handPos.x < 320? 530 : 110;
		    		
		    		pressFingerTo(1.5 , handPos);		    		
		    	}
		    },{
		    	time: 9.3,
		    	anim: function() {
		    		var handPos = getHandPosition();
		    		
		    		handPos.x = handPos.x < 320? 530 : 110;
		    		
		    		pressFingerTo(1.5 , handPos);		    		
		    	}
		    },{
		    	time: 10.8,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(192,300));		    		
		    	}
		    },{
		    	time: 13.1,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		tilePos.y -= 20;
		    		
		    		moveHandTo(1.1 , tilePos);		    		
		    	}
		    },{
		    	time: 14.3,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(224,400));		    		
		    	}
		    },{
		    	time: 15.4,
		    	anim: function() {
		    		moveHandTo(0.8 , cc.p(-200,0));		    		
		    	}
		    },{
		    	time: 16.3,
		    	anim: function() {
		            showSpeechBubble(undefined , $42.t.mostafa_basic03 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 17.4,
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
		    	time: 20.3,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		tilePos.y -= 20;
		    		
		    		moveHandTo(1.1 , tilePos);		    		
		    	}
		    },{
		    	time: 21.4,
		    	anim: function() {
		            showSpeechBubble(undefined , $42.t.mostafa_basic04 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 21.5,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(384,400));		    		
		    	}
		    },{
		    	time: 22.6,
		    	anim: function() {
		    		moveHandTo(0.8 , cc.p(-200,0));		    		
		    	}
		    },{
		    	time: 25.0,
		    	anim: function() {
		            showSpeechBubble(undefined , $42.t.mostafa_basic05 , mostafa.getPosition(), 350);		    		
		    	}
		    },{
		    	time: 25.1,
		    	anim: function() {
		    		moveHandTo(0.8 , cc.p(340,640));		    		
		    	}
		    },{
		    	time: 26.1,
		    	anim: function() {
		    		pressFingerTo(0.4 , cc.p(330,640));
		    		hookResumeAskForWord(hookResumeMenuLayer , true);
		    	}
		    },{
		    	time: 29.0,
		    	anim: function() {
		    		moveHandTo(2.2 , cc.p(80,60) , cc.p(150,200));		    		
		    	}
		    },{
		    	time: 31.0,
		    	anim: function() {
		            showSpeechBubble(undefined , $42.t.mostafa_basic06 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 31.1,
		    	anim: function() {
		    		moveHandTo(0.8 , cc.p(-200,0));		    		
		    	}
		    },{
		    	time: 32.1,
		    	anim: function() {
		            showSpeechBubble(4.0 , $42.t.mostafa_basic07 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 32.2,
		    	anim: function() {
		    		moveMostafaAndButton(3.0, [
           			    cc.p(500,180),
        	            cc.p(350,500),
        	            cc.p(800,1000)
        		    ]);		
		    	}
		    },{
		    	time: 37.2,
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
		    	time: 39.2,
		    	anim: function() {
		    		ml.unselectWord();
		    		for( var i=0 ; i<$42.BOXES_PER_COL ; i++ ) ml.deleteRow(i,true);
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
	    			
	    			ml.unselectWord();
//	    			setSelections();
	    			ml.dontAutoSelectWord = true;
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
		            setTimeout(function() {
			    		ml.unselectWord();
			    		for( var i=0 ; i<$42.BOXES_PER_COL ; i++ ) ml.deleteRow(i,true);		            	
		            },1500);
		    	}
		    },{
		    	time: 7.0,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		moveHandTo(1.1 , tilePos);		    		
		    	}
		    },{
		    	time: 8.1,
		    	anim: function() {
	    			ml.dontAutoSelectWord = false;

		    		pressFingerTo(1.0 , cc.p(128,400));		    		
		    	}
		    },{
		    	time: 9.2,
		    	anim: function() {
		    		moveHandTo(1.1 , cc.p(-200,0));	
		    	}
		    },{
		    	time: 11.0,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		moveHandTo(1.1 , tilePos);		    		
		    	}
		    },{
		    	time: 12.1,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(192,400));		    		
		    	}
		    },{
		    	time: 13.2,
		    	anim: function() {
		    		moveHandTo(1.1 , cc.p(-200,0));	
		    	}
		    },{
		    	time: 14.3,
		    	anim: function() {
		            showSpeechBubble(undefined , $42.t.mostafa_advanced02 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 14.4,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,1);
		    		
		    		moveHandTo(1.1 , boxPos);		    		
		    	}
		    },{
		    	time: 15.8,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,1);
		    		
		    		pressFingerTo(0.3 , boxPos);		    		
		    	}
		    },{
		    	time: 16.6,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,1);
		    		
		    		boxPos.x -= 100;
		    		boxPos.y -= 30;
		    		
		    		moveHandTo(0.5 , boxPos);		    		
		    	}
		    },{
		    	time: 17.4,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,1);
		    		
		    		moveHandTo(1.1 , boxPos);		    		
		    	}
		    },{
		    	time: 18.8,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,1);
		    		
		    		pressFingerTo(0.3 , boxPos);		    		
		    	}
		    },{
		    	time: 19.2,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,1);
		    		
		    		boxPos.x -= 100;
		    		boxPos.y -= 30;
		    		
		    		moveHandTo(0.5 , boxPos);		    		
		    	}
		    },{
		    	time: 22.0,
		    	anim: function() {
		    		moveHandTo(0.5 , cc.p(270,420));		    		
		    	}
		    },{
		    	time: 22.5,
		    	anim: function() {
		    		pressFingerTo(0.643 , cc.p(280,670));		    		
		    	}
		    },{
		    	time: 24.0,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		moveHandTo(1.1 , tilePos);		    		
		    	}
		    },{
		    	time: 25.1,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(288,400));		    		
		    	}
		    },{
		    	time: 26.2,
		    	anim: function() {
		    		moveHandTo(1.1 , cc.p(-200,0));	
		    	}
		    },{
		    	time: 27.5,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,4);
		    		
		    		boxPos.y -= $42.BS;
		    		
		    		moveHandTo(0.5 , boxPos);		    		
		    	}
		    },{
		    	time: 27.6,
		    	anim: function() {
		            showSpeechBubble(undefined , $42.t.mostafa_advanced03 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 27.7,
		    	anim: function() {
		            showSpeechBubble(undefined , $42.t.mostafa_advanced04 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 27.8,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,5);

		    		boxPos.y -= 40;
		    		
		    		moveHandTo(0.5 , boxPos);		    		
		    	}
		    },{
		    	time: 28.5,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,5);
		    		
		    		boxPos.y -= 40;
		    		
		    		pressFingerTo(0.2 , boxPos);		    		
		    	}
		    },{
		    	time: 29.0,
		    	anim: function() {
		    		var boxPos = getBoxPosition(1,5);
		    		
		    		boxPos.x -= 100;
		    		boxPos.y -= 30;
		    		
		    		moveHandTo(0.5 , boxPos);		    		
		    	}
		    },{
		    	time: 32.0,
		    	anim: function() {
		    		moveHandTo(0.4 , cc.p(320,300));		    		
		    	}
		    },{
		    	time: 32.4,
		    	anim: function() {
		    		pressFingerTo(0.2 , cc.p(320,500));		    		
		    	}
		    },{
		    	time: 33.0,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		moveHandTo(0.5 , tilePos);		    		
		    	}
		    },{
		    	time: 33.5,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(0,100));		    		
		    	}
		    },{
		    	time: 34.6,
		    	anim: function() {
		    		moveHandTo(1.1 , cc.p(-200,0));	
		    	}
		    },{
		    	time: 35.4,
		    	anim: function() {
		    		var boxPos = getBoxPosition(2,3);

		    		hand.setRotation(85);
		    		moveHandTo(0.5 , boxPos);		    		
		    	}
		    },{
		    	time: 35.9,
		    	anim: function() {
		            showSpeechBubble(undefined , $42.t.mostafa_advanced05 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 36,
		    	anim: function() {
		            showSpeechBubble(3.0 , $42.t.mostafa_advanced06 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 36.1,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		moveHandTo(1.1 , tilePos);		    		
		    		hand.runAction(cc.rotateTo(2.5,$42.HAND_ROTATION));
		    	}
		    },{
		    	time: 37.4,
		    	anim: function() {
		    		pressFingerTo(1.0 , cc.p(576,100));		    		
		    	}
		    },{
		    	time: 38.5,
		    	anim: function() {
		    		moveHandTo(1.1 , cc.p(-200,0));	
		    		hand.runAction(cc.rotateTo(1.1,125));
		    	}
		    },{
		    	time: 39.9,
		    	anim: function() {
		            showSpeechBubble(undefined , $42.t.mostafa_advanced07 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 40.0,
		    	anim: function() {
		    		var tilePos = getTilePosition();
		    		
		    		moveHandTo(1.7 , tilePos);		    		
		    	}
		    },{
		    	time: 41.8,
		    	anim: function() {
		    		pressFingerTo(8.0 , cc.p(448,300));		    		
		    	}
		    },{
		    	time: 49.8,
		    	anim: function() {
		            showSpeechBubble(undefined , $42.t.mostafa_advanced08 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 49.9,
		    	anim: function() {
		    		moveHandTo(2.5 , cc.p(-200,0));
		    		hand.runAction(cc.rotateTo(2.5,$42.HAND_ROTATION));
		    	}
		    },{
		    	time: 53.0,
		    	anim: function() {
		    		moveHandTo(0.8 , cc.p(340,640));		    		
		    	}
		    },{
		    	time: 54.1,
		    	anim: function() {
		    		pressFingerTo(0.4 , cc.p(340,640));
		    		hookResumeAskForWord(hookResumeMenuLayer , true);
		    	}
		    },{
		    	time: 54.6,
		    	anim: function() {
		    		moveHandTo(0.8 , cc.p(-200,0));		    		
		    	}
		    },{
		    	time: 55.2,
		    	anim: function() {
		            showSpeechBubble(3.0 , $42.t.mostafa_advanced09 , mostafa.getPosition());		    		
		    	}
		    },{
		    	time: 55.3,
		    	anim: function() {
		    		moveMostafaAndButton(3.0, [
           			    cc.p(500,180),
        	            cc.p(350,500),
        	            cc.p(800,1000)
        		    ]);		
		    	}
		    },{
		    	time: 60.7,
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
		    	time: 62.7,
		    	anim: function() {
		            showSpeechBubble(6.0 , $42.t.mostafa_advanced10 , mostafa.getPosition());	
		    		ml.timeCounter = 0;
		            setTimeout(function() {
			    		ml.unselectWord();
			    		for( var i=0 ; i<$42.BOXES_PER_COL ; i++ ) ml.deleteRow(i,true);		            	
		            },6000);
		            $42.wordTreasureBestWord = null;
		            $42.wordTreasureValue = 0;
		            $42.wordTreasure = [];
		    		ml.totalPoints = 0;
		    		scoreBarDirty = true;		    	}
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
		_42_retain(animAction,"mostafa animAction 1");
			
	    mostafa.runAction(
	        	cc.sequence(
	        		cc.bezierTo(time, bezierMostafa),
	        		cc.callFunc(function() {
	        			mul.stopAction(animAction);
	        			animAction = mostafa.runAction(anims.mostafa_land);
	        			 _42_retain(animAction, "mostafa animAction 2");
	        		})
	    		)
	    	); 
	    	
	    blueButton.runAction(cc.sequence(cc.bezierTo(time, bezierButton)));
	};
	
	var moveMostafaAndButton = function( time, bezier ) {

		var animAction = mostafa.runAction(cc.repeatForever(anims.mostafa_fly)),
			bezierMostafa = bezier,
			bezierButton = [
				cc.p(bezier[0].x,bezier[0].y-105),
				cc.p(bezier[1].x,bezier[1].y-105),
				cc.p(bezier[2].x,bezier[2].y-105),
			];
		 _42_retain(animAction, "mostafa animAction 3");
			
	    mostafa.runAction(
	        	cc.sequence(
	        		cc.bezierTo(time, bezierMostafa),
	        		cc.callFunc(function() {
	        			mul.stopAction(animAction);
	        			animAction = mostafa.runAction(anims.mostafa_land);
	        			 _42_retain(animAction, "mostafa animAction 4");
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
		
		var bubbleX = ml.size.width/2;
		if( !bubbleY ) bubbleY = ml.size.height/2;
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
        
        $42.msg2.setString("x: "+bubbleX+", y: "+bubbleY+", content size: "+speechBubble.getContentSize().height);
		
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
			speechBubble.runAction(cc.sequence(cc.delayTime(time-0.9),cc.callFunc(function() { removeSpeechBubble(0.9); })))
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
		_42_retain(mul, "Tutorial layer");
		
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
		
		for( var i=0 ; i<3 ; i++ ) {
			contactRings[i] = cc.DrawNode.create();
			contactRings[i].clear();
			contactRings[i].setScale(0);
			contactRings[i].drawCircle(cc.p(0,0), $42.HAND_CONTACT_SIZE, 0, 100, false, 2, $42.HAND_CONTACT_COLOR);
			finger.addChild(contactRings[i]);
			_42_retain(contactRings[i], "contactRing "+i);
		}
		
		mul.update = update;
		mul.scheduleUpdate();
	};
	
	var exitAnimation = function() {

		// Create layer for tutorial
		_42_release(mul);
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
	

    // tmp ..................
    ml.wordsForTiles = {
        index: 0,
        words: [
            "EISTEE",
            "EISEN",
            "ERINNERN",
            "INSERAT",
            "INTERNET",
            "IRRSINN",
            "NIERE",
            "RASIEREN",
            "RATTEN",
            "REISEN",
            "SANIEREN"
        ]
    };

	ml.hookGetProgrammedTile = function() {
		if( curTileProgram && curTileProgramCnt < curTileProgram.length ) {
		    return curTileProgram[curTileProgramCnt++];
        }

		curTileProgram = null;
		curTileProgramCnt = null;
        
        ////////////////////////////////
        // Fit in words from wordsForTiles list
        var wft = ml.wordsForTiles;

        if( wft.index === undefined ) wft.index = 0;
        if( wft.words.length > 0 ) {
            var word = wft.words[0].toUpperCase(),
                directions = [{x: $42.BS, y:0}, {x:0, y:$42.BS}, {x:-$42.BS, y:0}, {x:0, y:-$42.BS}];
            
            var getFittingTile = function(word, index) {
                var tb = $42.TILE_BOXES,
                    fittingTiles = [],
                    brc;

                if( !(brc = isWordPossible(word, index) )) return null;
                
                brc = {row: brc.row, col: brc.col+index};
                for( var i=0 ; i<tb.length ; i++ ) {
                    var t = {
                            boxes: tb[i],
                            rotatedBoxes: null,
                            rotation: 0
                        };
                    for( r=0 ; r<360 ; r+=90 ) {
                        t.rotation = r;
                        ml.rotateBoxes(t);

                        var rb = t.rotatedBoxes;
                        for( var j=0 ; j<rb.length ; j++ ) {
                            var clear = true,
                                grounded = false,
                                groundedAt = [];
                            for( var k=0 ; k<rb.length ; k++ ) {
                                var rowOff = (rb[k].y - rb[j].y) / $42.BS,
                                    colOff = (rb[k].x - rb[j].x) / $42.BS;

                                if( brc.row + rowOff < 0 || brc.row + rowOff >= $42.BOXES_PER_COL ||
                                    brc.col + colOff < 0 || brc.col + colOff >= $42.BOXES_PER_ROW ) {
                                    clear = false;
                                    break;
                                } 

                                var box = ml.boxes[brc.row + rowOff][brc.col + colOff];

                                if( box && box.userData ) {
                                    clear = false;
                                    break;
                                }
                                var row = brc.row + rowOff,
                                    col = brc.col + colOff;

                                if( row === 0 || (ml.boxes[row-1][col] && ml.boxes[row-1][col].userData) ) {
                                    grounded = true;
                                    groundedAt.push({
                                        row: row? row-1:0,
                                        col: col,
                                        box: row? ml.boxes[row-1][col].userData:null
                                    });
                                }
                            }

                            if( clear && grounded ) {
                                fittingTiles.push({
                                    tile:       i,
                                    boxIndex:   j,
                                    dir:        r/90,
                                    groundedAt: groundedAt
                                });
                            } 
                        }
                    }
                }

                if( fittingTiles.length ) return fittingTiles[Math.floor(Math.random()*fittingTiles.length)];
                else return null;
            };

            var isWordPossible = function(word, index) {
                for( var i=$42.BOXES_PER_COL-1 ; i>=0 ; i-- ) {
                    var wi = 0;
                    for( var j=0 ; j<$42.BOXES_PER_ROW ; j++ ) {
                        if( ml.boxes[i][j] && ml.boxes[i][j].userData === word[wi] ) {
                            if( wi === 0 ) var brc = {
                                row: i,
                                col: j
                            }
                            if( ++wi === index ) {
                                for( var k=1 ; k<=word.length-index ; k++ ) 
                                    if( j+k >= $42.BOXES_PER_ROW || (ml.boxes[i][j+k] && ml.boxes[i][j+k].userData) ) break;

                                if( k <= word.length-index ) { 
                                    brc = null;
                                    wi = 0;
                                    continue;
                                } 

                                return brc;
                            }
                        }
                    }
                }
    
                return false;
            };

            if( wft.index > 0 ) {
                var fittingTile = getFittingTile(word, wft.index);
                if( !fittingTile ) {
                    wft.index = 0;
                    wft.words.splice(0,1);
                    return ml.hookGetProgrammedTile();
                }
            }

            var tile = { 
                    tile: fittingTile? fittingTile.tile : Math.floor(Math.random()*7),
                    letters: []
                },
                tileBoxes = $42.TILE_BOXES[tile.tile],
                boxIndex = fittingTile? fittingTile.boxIndex : Math.floor(Math.random()*tileBoxes.length),
                dir = fittingTile? fittingTile.dir : Math.floor(Math.random()*4),
                direction = directions[dir],
                dirFixed = !!fittingTile;
            
            tile.letters[boxIndex] = word[wft.index++];

            var cnt = 1,
                index = wft.index;

            while( wft.index < word.length && cnt < 2 ) {
                var found = true;
                wft.index = index;

                while( wft.index < word.length && found === true ) {
                    var box = tileBoxes[boxIndex],
                        nextX = box.x + direction.x,
                        nextY = box.y + direction.y;

                    found = false;
                    for( var i=0 ; i<tileBoxes.length ; i++ ) {
                        if( !tile.letters[i] && tileBoxes[i].x === nextX && tileBoxes[i].y === nextY ) {
                            tile.letters[i] = word[wft.index++];
                            boxIndex = i;
                            found = true;
                            cnt++;
                            break;
                        }
                    }
                }
                if( dirFixed ) break;

                direction = directions[++dir%directions.length];
            }

            // Look if word is complete and delete it then ...
            cc.assert( wft.index <= word.length, "ml.hookGetProgrammedTile: index out of range.");
            if( wft.index === word.length ) {
                wft.index = 0;
                wft.words.splice(0,1);
            }
            for( var i=0 ; i<tileBoxes.length ; i++ ) if( !tile.letters[i] ) tile.letters[i] = " ";
            return tile;
        } 

		return null;
	};
	
	ml.hookResumeAskForWord = function(cb , menuLayer ) {
		hookResumeAskForWord = cb;
		hookResumeMenuLayer = menuLayer;
	};
	
	ml.hookDrawScoreBar = function() {
		var tmp = scoreBarDirty;
		scoreBarDirty = false;
		return tmp;
	}
	
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
	
	initAnimation();
},
$MM = MURBIKS_MODULE;
