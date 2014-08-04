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
		anims = {};

	/*
	 * Program 1
	 * 
	 * Turning a tile, moving it, let it fall and choosing it.
	 * 
	 */
	turning_moving_falling_choosing = function(cb) {
		startTileProgram(lg.tiles.turning_moving_falling_choosing);
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
        var murbiksImages  = cc.SpriteBatchNode.create(cc.textureCache.addImage(res.murbiks_png));
		ml.addChild(murbiksImages);

		var loadFrames = function(name,cnt) {
			var frames = [];
	    	for (var i = 1; i <= cnt; i++) {
	        	str = name + (i < 10 ? ("0" + i) : i) + ".png";
	        	frames.push(cc.spriteFrameCache.getSpriteFrame(str));        	
	    	}
	    	var anim = cc.Animation.create(frames, 0.06);
	    	anims[name] = cc.animate(anim);
		}

		loadFrames("mostafa_fly",9);
		loadFrames("mostafa_land",7);
		
        mostafa = cc.Sprite.create(res.murbiks_single_png);        
        mostafa.attr({
        	x: 0,
        	y: 0,
        	scale: 1.5,
        	rotation: 0
    	});
        mostafa.retain();
    	ml.addChild(mostafa, 5);

    	var animAction = mostafa.runAction(cc.repeatForever(anims["mostafa_fly"]));
        var moveAction = mostafa.runAction(cc.sequence(cc.moveTo(2.5, cc.p(500,500)),cc.callFunc(function() {
        	ml.stopAction(animAction);
        	animAction = mostafa.runAction(anims["mostafa_land"]);
        })));
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
