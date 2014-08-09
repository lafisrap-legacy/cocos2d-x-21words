/*
 * Murbiks Module
 * 
 * Tutorials
 * 
 * 
 * 
 * 
 * */

$42.SPEECH_BUBBLE_WIDTH = 480;
$42.SPEECH_BUBBLE_HEIGHT = 300;
$42.SPEECH_BUBBLE_COLOR = cc.color(0,0,70);
$42.SPEECH_BUBBLE_FONTSIZE = 36;
$42.SPEECH_BUBBLE_LINE_COLOR = cc.color(110,110,150);

var MURBIKS_MODULE = function(layer) {
	var ml = layer,
		lg = null,
		curProgram = null,
		curProgramCnt = null,
		mostafa = null,
		anims = {},
		blueButton = null,
		speechBubbleCloud = null,
		speechBubbleLine = null,
		speechBubble = null;

	/*
	 * Program 1
	 * 
	 * Turning a tile, moving it, let it fall and choosing it.
	 * 
	 */
	var turning_moving_falling_choosing = function(cb) {
		
		// menu functions
		var clickOnSkip = function() {
			cc.log("Skip tutorial!");
		};
		
		startTileProgram(lg.tiles.turning_moving_falling_choosing);
		
		// let Mostafa fly in
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
			
        var mostafaAction = mostafa.runAction(
	        	cc.sequence(
	        		cc.bezierTo(2.5, bezierMostafa),
	        		cc.callFunc(function() {
	        			ml.stopAction(animAction);
	        			animAction = mostafa.runAction(anims.mostafa_land);
	        		})
        		)
        	); 
        	
        var buttonAction = blueButton.runAction(cc.sequence(cc.bezierTo(2.5, bezierButton),cc.callFunc(function() {
        	showSpeechBubble($42.t.mostafa_hi , mostafa.getPosition());
        }, this)));
        
        
	};
	
	
	/* 
	 * Service programs
	 */
	
	var startTileProgram = function(program) {
	    // start program
	    curProgram = program;
	    curProgramCnt = 0;
	};
	
	var showSpeechBubble = function(text, pos) {
		
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

        ml.addChild(speechBubbleLine,5);
		ml.addChild(speechBubbleCloud,5);
		ml.addChild(speechBubble,5);
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
		speechBubbleCloud.setOpacity(80);
		speechBubble = cc.LabelTTF.create("", "Arial", $42.SPEECH_BUBBLE_FONTSIZE, cc.size($42.SPEECH_BUBBLE_WIDTH,0),cc.TEXT_ALIGNMENT_CENTER, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
		speechBubble.retain();
		speechBubble.setColor($42.SPEECH_BUBBLE_COLOR);
		speechBubbleLine = cc.DrawNode.create();
		speechBubbleLine.retain();
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
	
	initAnimation();
},
$MM = MURBIKS_MODULE;