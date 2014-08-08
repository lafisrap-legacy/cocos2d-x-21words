/*
 * Murbiks Module
 * 
 * Tutorials
 * 
 * 
 * 
 * 
 * */

var MURBIKS_MODULE = function(layer) {
	var ml = layer,
		lg = null,
		curProgram = null,
		curProgramCnt = null,
		mostafa = null,
		anims = {},
		blueButton = null;

	/*
	 * Program 1
	 * 
	 * Turning a tile, moving it, let it fall and choosing it.
	 * 
	 */
	turning_moving_falling_choosing = function(cb) {
		
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
        	
        var buttonAction = blueButton.runAction(cc.bezierTo(2.5, bezierButton));
	};
	
	
	/* 
	 * Service programs
	 */
	
	startTileProgram = function(program) {
	    // start program
	    curProgram = program;
	    curProgramCnt = 0;
	};
	
	initAnimation = function() {

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
