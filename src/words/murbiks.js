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
		curProgramCnt = null;

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
	
	
	// ... integrate program

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
	

},
$MM = MURBIKS_MODULE;
