////////////////////////////////////////////////////////////////////
// words.js contains the basic code for the 42words game, built upon the plain vanilla tetris app
//
//
//  Level 1:  3 given words, length 4              
//  Level 2:  4 given words, length 5-6            
//  Level 3:  5 given words, length 7-9           
//  Level 4:  5 prefixed words, length 5+         
//  Level 5:  5 prefixed words, length 6+       
//  Level 6:  5 prefixed words, value 10+      
//  Level 7:  5 free words, length 4+     
//  Level 8:  5 free words, value 10+
//  Level 9:  4 free words, value 12, 15, 20, 25
//  Level 10: 1 free word, value 42 
//
//  PLAN
//
//  Level system
//  - define levels
//      - number of words
//      - conditions per word
//          - min value
//          - min length
//          - max length
//      - given/prefix/free
//
//  Select given words:
//
//      Make pool by searching all 50000+ words for words of
//
//      1. Group system
//          - verbs
//          - nouns
//          - adjectives
//          - names
//          - cities
//
//
//  - In given mode word should just fly away without asking
//  - score bar 
//
//  GIVEN
//  - make selectFreeWord behave like 
//
//  PREFIXED
//  - new letters should reflect the selection words
//  - if no word is possible, deselect it
//  - autoselect if no word is selected
//  - prefixed words are not deleted from list 
//  - Small text: "min/max. 6 Buchstaben", "Wortwert min. 10 Punkte"
//  
//  FREE
//  - as always
//
// GOT WORD!
//
// - More animations
// - pimp word
//
//
//
// $42.LETTER_NAMES and $42.LETTERS must have corresponding elements 
$42.LETTER_NAMES = ["space","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","ae","oe","ue","6","ao"];
$42.LETTERS =      [" ","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","Ä" ,"Ö" ,"Ü" ,"Õ","Å"];
$42.MARKER_SET = 1;                         // Marker under a letter is set, meaning that the letter is obligatory
$42.MARKER_OPT = 2;                         // Letter can be chosen (?)
$42.MARKER_SEL = 3;                         // Letter was chosen (!)
$42.START_MARKER_X_OFFSET = -18;            // X offset of start marker on screen
$42.START_MARKER_Y_OFFSET = $42.BS/2;       // Y offset 
$42.MARKER_X_OFFSET = $42.BS/2;             // X offset of markers under letters
$42.MARKER_Y_OFFSET = -25;                  // Y offset
$42.UNSELECTED_BOX_OPACITY = 150;           // Opacity of an unselected box (not part of a chosen word)
$42.GIVEN_WORDS_OPACITY = 70;               // Opacity of word displayed on the background
$42.NEEDED_LETTERS_PROBABILITY = 0.15;      // additional probability that a needed letter appear (needed for the currently possible words)
$42.MAX_WORDS_BLOWN = 1;                    // How many words are blown up after a row is deleted
$42.WORD_FRAME_WIDTH = 4;                   // Weight of the frame of a completed word 
$42.WORD_FRAME_MOVE_TIME = 0.8;             // Animation time of a completed word
$42.SCORE_COLOR_DIMM = cc.color(160,120,55);    // Score color when not bright
$42.SCORE_COLOR_BRIGHT = cc.color(240,170,70);  // same for bright
$42.SCORE_COLOR_WHITE = cc.color(255,255,255);  // same for white
$42.NEXT_PROFILE_LETTERS = 5;               // Number of next new letter candidates
$42.NEXT_PROFILE_LETTER_CNT = 3;            // A new letter after n words
$42.SCOREBAR_LETTERS_PER_ROW = 8;           // Show n small letters in the score bar per row
$42.SCOREBAR_LETTERS_PER_COL = 2;           // Show max n columns
$42.SCOREBAR_LETTERS_PADDING = 20;          // Padding of small letters
$42.SCOREBAR_LETTERS_SCALE = 0.45;          // Size difference to real normal letters
$42.SCOREBAR_ROLLING_LAYER_DELAY = 3.0;     // Seconds till the next score bar roll
$42.MAX_MULTIPLIERS = 5;                    // Maximum number of multipliers
$42.MAX_PLAYING_TIME = 45;                  // Normal length of a full game in minutes
$42.WORD_MULTIPLIER_CYPHERPUNKS = 3;        // Multiplier for Cypherpunk words

// Order of multipliers
$42.MULTIPLIER = [[2,"letter"],[2,"letter"],[2,"letter"],[3,"letter"],[2,"word"],[3,"letter"],[5,"letter"],[3,"word"],[3,"letter"],[5,"letter"],[10,"letter"]];

//////////////////////////////////////////////////////////////////////////////////////////////////////
// The game plugin module 
//
var _42_MODULE = function(_42Layer) {

	var ml = _42Layer,          // ml is the standard shortcut for the game layer
		nextTile = null;
	
    /////////////////////////////////////////////
    // Internal function: go through box array and look for posible prefixes of words
    //
	var setSelections = function( dontSelectWord ) {
		var s = [],
			sw = ml.selectedWord,
			nsw = null;

        //////////////////////////////////
        // Look through all rows ...
		for( var i=0 ; i<$42.BOXES_PER_COL ; i++) {
            //////////////////////////
			// dim (deselect) all boxes in a row
			for( var j=0 ; j<$42.BOXES_PER_ROW ; j++ ) {
				var box = ml.boxes[i][j];				
				if( box && box.sprite ) box.sprite.setOpacity($42.UNSELECTED_BOX_OPACITY);				
			}

            //////////////////////////////
			// check all boxes in a row for word beginnings (prefixes)
			for( var j=0 ; j<$42.BOXES_PER_ROW-2 ; j++ ) {
				var box = ml.boxes[i][j];				
				if(!box) continue;
				
                //////////////////////////////
                // get current prefix of a box
				var oldPrefix = box.words && box.words[0] && box.words[0].word.substring(0,3) || null;
				box.words = null;

                //////////////////////////////
                // Check if a prefix starts a current box (checkForPrefixes callback return a list of all possible words)
				checkForPrefixes({row:i,col:j}, function(brc, words) {
					
                    box.words = words;
                    /////////////////////////////////////////
					// don't highlight possible selections in the row of the selected word
					if( sw && sw.brc.row === i ) return;

					var newPrefix = words[0].word.substring(0,3);

                    /////////////////////////////////
					// let a newly found sprite blink
					for( var k=0 ; k<3 ; k++ ) {
						var box1 = ml.boxes[brc.row][brc.col+k];
						if( box1.sprite ) box1.sprite.setOpacity(255);
						if( newPrefix != oldPrefix ) {
							box1.sprite.runAction(cc.blink(0.5,3));
						}
					}
					
                    /////////////////////////////////
					// fill the possible selection and put it on the list
					s.push({
						brc: brc,
						width: $42.BS * 3,
						height: $42.BS,
						words: words,
						pos: {
							x: $42.BOXES_X_OFFSET + brc.col * $42.BS,
							y: $42.BOXES_Y_OFFSET + brc.row * $42.BS,
						},
						box: [
					      	ml.boxes[brc.row][brc.col],
					      	ml.boxes[brc.row][brc.col+1],
					      	ml.boxes[brc.row][brc.col+2],
						]
					});
				});
			}
		}
		
        ////////////////////////
        // The result of the function is a list with possible selections (enlighted on the playground)
		ml.selections = s;
	};
	
    //////////////////////////////////////////////////////////////////
	// look for words at a specified position
    //
	var checkForPrefixes = function(brc, cb) {

		var prefix = (ml.boxes[brc.row][brc.col]   && ml.boxes[brc.row][brc.col].userData || " ")+
					 (ml.boxes[brc.row][brc.col+1] && ml.boxes[brc.row][brc.col+1].userData || " ")+
					 (ml.boxes[brc.row][brc.col+2] && ml.boxes[brc.row][brc.col+2].userData || " "),
			words = [];
		
		// copy word object
        var pref = ml.levelPool[prefix];
		for( var i=0 ; pref && i<pref.length ; i++ ) {
			words.push({
				word: pref[i].word,
				value: pref[i].value,
				group: pref[i].group,
				profile: pref[i].profile,
				deleted: pref[i].deleted
			});
		}

		if( !(ml.boxes[brc.row][brc.col] && ml.boxes[brc.row][brc.col].words) && words.length && cb ) {

			for( var i=words.length-1 ; i>=0 ; i-- ) {
				if( brc.col + words[i].word.length > $42.BOXES_PER_ROW || 
					words[i].deleted ||
					$42.wordProfile < ($42.wordProfile | words[i].profile) ) {
					words.splice(i,1);
				}
			}
			
			if( words.length > 0 ) {
				cb(brc,words);
			}
		}
	};

    ///////////////////////////////////////////////////////////////////    
	// update markers of selected word, look if a full word was found, process it ...
    //
	var updateSelectedWord = function(options) {
		var sw = ml.selectedWord;
		
		if( ml.wordIsBeingSelected ) return false;
        if( !sw ) {
            ml.pauseBuildingTiles = false;
            return false;
        }
		
		// Define sprites and show word start sprite
		var setMarkerFrame = [],
			optMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker1.png"),
			selMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker3.png");
		
		setMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker0.png");
		
		if( !sw.startMarker ) {
			sw.startMarker = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("marker2.png"),cc.rect(0,0,$42.BS,$42.BS));
			_42_retain(sw.startMarker, "words: sw.startMarker.png");	
			sw.startMarker.setPosition(cc.p($42.BOXES_X_OFFSET + sw.brc.col * $42.BS + $42.START_MARKER_X_OFFSET,
											$42.BOXES_Y_OFFSET + sw.brc.row * $42.BS + $42.START_MARKER_Y_OFFSET));
			ml.addChild(sw.startMarker,2);
		}
		var pos = sw.startMarker.getPosition(),
			row = Math.round(pos.y-$42.BOXES_Y_OFFSET-$42.START_MARKER_Y_OFFSET)/$42.BS;
		if( row != sw.brc.row ) {
			var rows = row - sw.brc.row;
			sw.startMarker.runAction(cc.moveBy($42.MOVE_SPEED*rows, cc.p(0,-$42.BS*rows)));			
		}

		// Mark letters
		// First look for all words that are still possible, looking at the
		// markers set
		var curWords = sw.words.slice(),
			missingLetters = "";
		for( var i=sw.brc.col ; i<$42.BOXES_PER_ROW ; i++) {
			var col = i-sw.brc.col;
			if( sw.markers[col] === $42.MARKER_SEL ) {
                cc.log("updateSelectedWord, col: "+col+", i: "+i+", row: "+sw.brc.row);
				var letter = ml.boxes[sw.brc.row][i].userData;
				// take out all words that don't match the letters where markers
				// are set
				for( var j=curWords.length-1 ; j>=0 ; j-- ) {
					if( curWords[j].word[col] != letter ) curWords.splice(j,1);
				}
			}
		}
		// if no words are found with currently selected markers, than the last
		// fitting word was removed
		// so all selected markers and start with all words a new
		if( curWords.length === 0 ) {
			curWords = sw.words.slice();
			for( var i=3 ; i<sw.markers.length ; i++ ) if( sw.markers[i] === $42.MARKER_SEL || sw.markers[i] === $42.MARKER_SET ) sw.markers[i] = null;
		}
		for( var i=sw.brc.col ; i<$42.BOXES_PER_ROW ; i++) {
			var col = i-sw.brc.col;
			// remove old sprite
			if( sw.sprites[col] ) {
				_42_release(sw.sprites[col]);
				ml.removeChild( sw.sprites[col] );
			}
			sw.sprites[col] = null;
			for( var j=curWords.length-1,hits=0 ; j>=0 ; j-- ) {
				// look if the letter in the box matches the letter in the word
				if(ml.boxes[sw.brc.row][i] && curWords[j].word[col] === ml.boxes[sw.brc.row][i].userData ) hits++;
				else if( curWords[j].word[col] ) missingLetters += curWords[j].word[col];
			}
			if( sw.markers[col] === $42.MARKER_SET || col <= 2) {
				// letter in box matches with all words, draw sprite
				sw.markers[col] = $42.MARKER_SET;
				sw.sprites[col] = cc.Sprite.create(setMarkerFrame,cc.rect(0,0,$42.BS,$42.BS));
				ml.boxes[sw.brc.row][i].sprite.setOpacity(255);	
			} else if( sw.markers[col] === $42.MARKER_SEL && hits > 0 || hits === curWords.length ) {
				// if the user marked the letter, than show marker select sprite
				sw.markers[col] = $42.MARKER_SEL;
				sw.sprites[col] = cc.Sprite.create(selMarkerFrame,cc.rect(0,0,$42.BS,$42.BS));
				ml.boxes[sw.brc.row][i].sprite.setOpacity(255);	
			} else if( hits === 0 ) {
				// letter in box matches with no word
				sw.markers[col] = null;
			} else {
				// letter in box matches with some words, draw marker option
				// sprite
				sw.markers[col] = $42.MARKER_OPT;
				sw.sprites[col] = cc.Sprite.create(optMarkerFrame,cc.rect(0,0,$42.BS,$42.BS));					
				ml.boxes[sw.brc.row][i].sprite.setOpacity($42.UNSELECTED_BOX_OPACITY);	
			}
			
			if( hits > 0 ) {
				_42_retain(sw.sprites[col],"words: sw.sprites["+col+"]");	
				ml.addChild(sw.sprites[col],5);
				sw.sprites[col].setPosition(cc.p($42.BOXES_X_OFFSET + i * $42.BS + $42.MARKER_X_OFFSET, 
						   						 $42.BOXES_Y_OFFSET + row * $42.BS + $42.MARKER_Y_OFFSET));
				if( row !== sw.brc.row ) {
					var rows = row - sw.brc.row;
					sw.sprites[col].runAction(cc.moveBy($42.MOVE_SPEED*rows, cc.p(0,-$42.BS*rows)));					
				}
			}	
		}
		
		sw.missingLetters = missingLetters;
		
        /////////////////////////////////////////////
		// look if all marked letters form a complete word
		for( var i=0 ; i<curWords.length ; i++ ) {
			var word = curWords[i].word,
				group = curWords[i].group;
			for( var j=0 ; j<word.length ; j++ ) {
				if( !ml.boxes[sw.brc.row][j+sw.brc.col] || 
					word[j] !== ml.boxes[sw.brc.row][j+sw.brc.col].userData ) 
						break;
			}

            ///////////////////////////////////////////////
            // Full word found?
			if( j === word.length ) {
                ////////////////////////////////////
                // FULL WORD FOUND!
				// First delete word from global word list and selected word list
				var ret = deleteWordFromList(word);
				cc.assert(ret,"42words, updateSelectedWord: "+word+" is not in the list!");	
				sw.words.splice(i,1);
				if( !sw.words.length ) ml.unselectWord();
				
                /////////////////////////////////////
                // Let the word fly ...
				ml.wordIsBeingSelected = true;
				showFullWordAndAsk( sw.brc , word , group, options && options.rowsDeleted || 0 , function( takeWord ) {	
					ml.wordIsBeingSelected = false;
                    ml.pauseBuildingTiles = false;
                    //////////////////////////////////
                    // Was the word taken, or ok pressed?
					if( takeWord ) {
                        /////////////////////////
						// calculate word value
						for( var wordMul=1,value=0,k=0 ; k<word.length ; k++ ) {
							var val = $42.letterValues[word[k]] && $42.letterValues[word[k]].value || 0,
								m = ml.multipliers;
							
							for( var l=0 ; l<m.length ; l++ ) {
								if( m[l].brc.row === sw.brc.row && m[l].brc.col === sw.brc.col+k ) {
									if( m[l].word ) wordMul = m[l].mul;
									else {
										val *= m[l].mul;
									}
									// release and delete it
									_42_release(m[l].sprite);
									ml.removeChild(m[l].sprite);
									m.splice(l,1);
									break;
								}
							}
							
							value += val;
						}

                        ////////////////////
                        // Remember the word
                        ml.levelWords.push({ 
                            word: word,
                            value: value
                        });

                        ////////////////////////////////////
                        // Check level conditions
                        if( checkLevelConditions(word, value) ) {
                            var level = $42.LEVEL_DEVS[$42.currentLevel-1],
						        ls = cc.sys.localStorage;
                            
                            if( ++$42.currentLevel > level.length+1 ) {
                                debugger;
                            }

							setNextProfileLetter();
							setNextProfileLetter();

                            $42.wordTreasure = $42.wordTreasure.concat(ml.levelWords);
                            ls.setItem("wordTreasure",JSON.stringify($42.wordTreasure));
                            ls.setItem("currentLevel",$42.currentLevel);
                            ls.setItem("wordProfile",$42.wordProfile);
                            
                            endLevel();
                            startNewLevel();
							
                            blowLevelAndWordValue({info:[$42.t.next_level,$42.currentLevel],color:cc.color(0,0,128)});
                        } 

                        var level = $42.LEVEL_DEVS[$42.currentLevel-1];
                        
                        ml.wordsForTilesCnt = level.wordFreq-1;
                        ml.fillWordsForTiles();
						ml.unselectWord();
						ml.checkForAndRemoveCompleteRows(sw.brc.row);
						setSelections();
						ml.drawScorebar(false);
					} else {
						ml.checkForAndRemoveCompleteRows();
						ml.unselectWord();
						setSelections();
						moveSelectedWord(sw.brc);
					}
				});

				return true; // a word was found
			}
		}
		
        ml.pauseBuildingTiles = false;
		
        return false; // no word was found
	};
	
    ////////////////////////////////////////////////////////////////////////////////////////
    // startNewLevel prepares for level set in $42.currentLevel 
    //
    //
    var startNewLevel = function() {

        var level = $42.LEVEL_DEVS[$42.currentLevel-1];

        //////////////////////////
        // Set globals ...
		ml.lettersForNextTile = [];
        ml.levelLabels = [];
        ml.levelPool = [];
        ml.levelWords = []; 
        ml.selections = [];
        ml.wordsForTilesCnt = level.wordFreq-1;

        ////////////////////////////
        // Introduce new background
        var background = cc.Sprite.create(res["background"+("0"+$42.currentLevel).slice(-2)+"_png"]);
        background.attr({
            x: cc.width / 2,
            y: cc.height / 2,
            scale: 1,
            rotation: 0
        });
        ml.addChild(background, 0, $42.TAG_BACKGROUND_SPRITE);
        _42_retain(background, "startAnimation: background");
        
        /////////////////////////////
        // Calculate pool of possible words
        var wp = $42.wordProfile,
            tmpPool = [],
            pool = [],
            prefixes = [];

        /////////////////////////////
        // filter conditions
        for( var i=0,prefGroups=0 ; level.prefGroups && i<level.prefGroups.length ; i++ ) prefGroups += (1 << parseInt(level.prefGroups[i]) >>> 0);
        for( var p in $42.words ) {
            var prefix = $42.words[p],
                levelWords = [];

            for( var i=0 ; prefix && i<prefix.length ; i++ ) {
                var word = prefix[i];

                if( level.minValue && word.value < level.minValue ) continue;
                if( level.minLength && word.word.length < level.minLength ) continue;
                if( level.maxLength && word.word.length > level.maxLength ) continue;
                if( (wp & word.profile) < word.profile ) continue; 
                if( prefGroups && (prefGroups & word.groups === 0)) continue; 

                levelWords.push(word);
            }

            if( levelWords.length ) { 
                tmpPool[p] = levelWords;

                // place prefixes in random order

 //               if( p === "ZIV" ) var ziv = p;
 //               else 
                    prefixes.splice(Math.floor(Math.random()*prefixes.length),0,p);

            }
        }

//        prefixes.splice(0,0,ziv);

        /////////////////////////////////
        // Look for specific words and prefixes 
        for( var i=0 ; i<level.words ; i++ ) {

            for( var j=0 ; j<prefixes.length ; j++ ) {
                var prefix = tmpPool[prefixes[j]],
                    cand = [];

                for( var k=0; k<prefix.length ; k++ ) {
                    var word = prefix[k];
                    
                    if( level.minValue && word.value < level.minValue ) continue;
                    if( level.minLength && word.word.length < level.minLength ) continue;
                    if( level.maxLength && word.word.length > level.maxLength ) continue;

                    cand.push(word);
                }

                switch(level.type) {
                    case $42.LEVEL_TYPE_GIVEN:
                        if( cand.length > 0 ) {
                            var word = cand[Math.floor(Math.random()*cand.length)],
                                text = word.word;
                            pool[prefixes[j]] = [word];
                        } else continue;
                        break;
                    case $42.LEVEL_TYPE_PREFIX:
                        if( cand.length >= $42.LEVEL_MIN_PREFIX_CANDIDATES ) {
                            var text = prefixes[j];
                            if( level.minLength ) text += " - - - - - - -".substr(0,(level.minLength-3)*2); 
                            if( level.minValue )  text += " - - - -";

                            pool[prefixes[j]] = prefix;
                        } else continue;
                        break;
                    case $42.LEVEL_TYPE_FREE:
                        if( !cand.length ) continue;

                        var text = "----?";
                        if( level.minLength ) text = "----------".substr(0,level.minLength)+"?"; 
                        if( level.minValue )  text += " ("+level.minValue+"+)";
                        break;
                }

                break;
            }

            cc.assert(j<prefixes.length, "startNewLevel: Not enough candidates found. Stopping in round "+i);
            prefixes.splice(j,1);

            /////////////////////////////////
            // Draw word on screen
			var label = ml.levelLabels[i] = cc.LabelTTF.create(text, _42_getFontName(res.exo_regular_ttf) , 72);
			label.setPosition(cc.width/2,cc.height*0.8-i*150);
			label.setColor(cc.color(0,0,0));
			label.setOpacity(0);
			_42_retain(label, "Level label ("+i+")");	
			background.addChild(label, 0);
            label.runAction(cc.fadeTo(5,$42.GIVEN_WORDS_OPACITY));

            //////////////////////////////////
            // Add condition
            if( level.type !== $42.LEVEL_TYPE_GIVEN && (level.minValue || level.minLength) ) { 
                if( level.minValue ) var cond = cc.LabelTTF.create($42.t.level_min_value.replace(/\%d/,level.minValue), _42_getFontName(res.exo_regular_ttf) , 36);
                else if( level.minLength ) var cond = cc.LabelTTF.create($42.t.level_min_length.replace(/\%d/,level.minLength), _42_getFontName(res.exo_regular_ttf) , 36);

                cond.setPosition(label.getContentSize().width/2, 0);
                cond.setColor(cc.color(0,0,0));
                cond.setOpacity(0);
                _42_retain(cond, "Level cond ("+i+")");	
                label.addChild(cond, 0);
                cond.runAction(cc.fadeTo(5,$42.GIVEN_WORDS_OPACITY+20));
            }
        }

        ml.levelPool = level.type===$42.LEVEL_TYPE_FREE? tmpPool : pool;

        ml.fillWordsForTiles();
    };

    ml.fillWordsForTiles = function() {

        var wordList = ml.levelPool,
            max = $42.LEVEL_DEVS[$42.currentLevel-1].words,
            prefixes = [],
            words = [];

        for( prefix in wordList ) prefixes.splice(Math.floor(Math.random()*prefixes.length),0,prefix);
        
        ml.wordsForTiles = {
            index: 0,
            words: words
        };
        
        for( var i=0 ; i<max ; i++ ) {
            var prefix = wordList[prefixes[i%prefixes.length]],
                word = prefix[Math.floor(Math.random()*prefix.length)];

            words.push(word.word);
        }
    };

    var endLevel = function() {
        /////////////////////////////
        // Remove all boxes, selection and background
        var background = ml.getChildByTag($42.TAG_BACKGROUND_SPRITE);
        if( background ) {
            ml.removeChild(background);
            _42_release(background);
        }

        ml.unselectWord();
		for( var i=0 ; i<$42.BOXES_PER_COL ; i++ ) ml.deleteRow(i,true);		 
    };

    var checkLevelConditions = function(word, value) {

        var ll = ml.levelLabels,
            lp = ml.levelPool,
            level = $42.LEVEL_DEVS[$42.currentLevel-1],
            prefix = lp[word.substr(0,3)];

        /////////////////////////////
        // Find word in level pool and remove it from there
        for( var i=0; i<prefix.length ; i++ ) if( prefix[i].word === word ) break;
        cc.assert( i<prefix.length, "Solved word was not found in level pool.");
        prefix.splice(i,1);
        if( prefix.length === 0 || level.type === $42.LEVEL_TYPE_PREFIX ) delete lp[word.substr(0,3)];

        //////////////////////////////
        // Find corresponding label
        var found = false;
        for( var i=0 ; i<ll.length ; i++ ) {
            switch( level.type ) {
                case $42.LEVEL_TYPE_GIVEN:
                    if( ll[i].getString() === word ) found = true;
                    break; 
                case $42.LEVEL_TYPE_PREFIX:
                    if( ll[i].getString().substr(0,3) === word.substr(0,3) &&
                        (!level.minLength || word.length >= level.minLength) &&
                        (!level.maxLength || word.length <= level.maxLength) &&
                        (!level.minValue  || value >= level.minValue )) found = true;
                    break; 
                case $42.LEVEL_TYPE_FREE:
                    if( (!level.minLength || word.length >= level.minLength) &&
                        (!level.maxLength || word.length <= level.maxLength) &&
                        (!level.minValue  || value >= level.minValue )) found = true;
                    break; 
            }

            if( found ) break;
        }

        cc.assert(found, "Found word is not in the pool!");

        var label = ll[i];
        label.runAction(
            cc.sequence(
                cc.fadeOut(2),
                cc.callFunc(function() {
                    label.getParent().removeChild(label);
                    _42_release(label);
                })
            )
        );

        ll.splice(i,1)
    
        for( var j=0 ; j<ll.length ; j++ ) {
            ll[j].runAction(
                cc.moveTo(2, cc.width/2 , cc.height*0.8-j*150)
            );
        }

        if( ll.length === 0 ) return true;
        else return false;
    };

    ////////////////////////////////////////////////////////////////////////////////////////
    // Game end
    // TODO: Word selection tool and the twitter send button
    //
	var youWonTheGame = function() {
		
		var self = this,
			ls = cc.sys.localStorage;
	       
        ml.pause();
        ml.unscheduleUpdate();

		showAllWordsFlyingIn(function() {
			var menuItems = [{
				label: $42.t.won_end_game, 
				cb: function(sender) {
					if( self.hookEndGame ) self.hookEndGame();
					/* must be tested */ ml.endGame();
		        	cc.director.runScene(new _42Scene());
		        }
			}];
            ml.getParent().addChild(
            	new _42MenuLayer([
            	    $42.t.won_congrats,
            	    $42.t.won_word_value+": "+$42.wordTreasureValue+($42.wordTreasureValue === $42.maxPoints?" ("+$42.t.won_highscore+")":"")
            	],menuItems), 1
            );
		});		
	};

    //////////////////////////////////////////////////////////////////////////7
    // Show word list at the end
    //
	var showAllWordsFlyingIn = function(cb) {
		var wt = $42.wordTreasure;
		
		for( var i=41 ; i>=0 /* wt.length */ ; i-- ) {
			var label = cc.LabelTTF.create(wt[i%wt.length].word, "SourceCodePro-Light" , 32);
			label.setPosition(ml.size.width/2,0);
			label.setColor(cc.color(0,0,0));
			label.setOpacity(50);
			_42_retain(label, "flying word");	
			ml.addChild(label, 5);
			label.i = i;
			label.runAction(
				cc.sequence(
					cc.delayTime(i * 0.48),
					cc.moveTo(2.2,ml.size.width/2,200),
					cc.spawn(
						cc.moveTo(2.6,ml.size.width/2,600),
						cc.EaseSineOut.create(
							cc.scaleTo(2.6,2.1)
						),
						cc.EaseSineIn.create(
							cc.fadeTo(2.6,255)
						),
						cc.tintTo(2.6,84,13,143)
					),
					cc.spawn(
							cc.moveTo(2.6,ml.size.width/2,1000),
							cc.EaseSineIn.create(
								cc.scaleTo(2.6,1)
							),
							cc.EaseSineOut.create(
								cc.fadeTo(2.6,50)
							)
						),
					cc.moveTo(2.2,ml.size.width/2,1200),
					cc.callFunc(function() {
				        _42_release(this);
						ml.removeChild(this);
						if( cb && this.i === 41 ) cb();
					}, label)
				)
			);
		}		
	};
	
    //////////////////////////////////////////////////////////////////////////////////////////
    // Blow the new level value in big letters 
    //
	var blowLevelAndWordValue = function(blow,cb) {
		
		var text = [];
		
		if( blow.allwords ) {
			var wt = $42.wordTreasure;
			for( var i=0 ; i<42 /* wt.length */ ; i++ ) 
				text = text.concat([{t:(i+1)+" "+wt[0].word , scale:3 , color : cc.color(160 - ((i*7)%80), 0 + ((i*4)%40) , 0 + ((i*9)%100))}]);
		}
		
		if( blow.info ) {
			var lines = blow.info;
			for( var i=0 ; i<lines.length ; i++ ) text = text.concat([{t:lines[i],scale: blow.scale? blow.scale 	: 2,color:blow.color?blow.color:cc.color(0,0,128)}]);			
		}
		
		for( var i=0 ; i<text.length ; i++ ) {
			var label = cc.LabelTTF.create(text[i].t, "res/fonts/American Typewriter.ttf", 160);
			label.setPosition(ml.size.width/2,ml.size.height/2);
			label.setScale(0,0);
			label.setColor(text[i].color);
			_42_retain(label, "blow up word");	
			ml.addChild(label, 5);
			label.i = i;
			label.setRotation(8.57*i*2);
			label.runAction(
				cc.sequence(
					cc.delayTime(i * 0.88),
					cc.spawn(
						cc.scaleTo(3, text[i].scale),
						cc.fadeTo(3,0),
						cc.rotateBy(3,45,30)
					),
					cc.callFunc(function() {
				        _42_release(this);
						ml.removeChild(this);
						if( cb && this.i === text.length-1 ) cb();
					}, label)
				)
			);
		}		
	};
	
	var deleteWordFromList = function(word) {
		var prefix = word.substr(0,3);

        ////////////////////////////
		// delete word from full word list
		var words = $42.words[prefix];
		for( var i=0 ; i<words.length ; i++ ) {
			if( words[i].word === word ) {
				words[i].deleted = true;
				return true;
			}
		}
		return false;
	};

	var showFullWordAndAsk = function( brc , word , group , rowsDeleted , cb ) {
		var width = word.length * $42.BS,
			height = $42.BS,
			x = $42.BOXES_X_OFFSET + brc.col * $42.BS + width/2,
			y = $42.BOXES_Y_OFFSET + brc.row * $42.BS + height/2;
		
		// create yellow frame sprite
		var wordFrameFrame  = cc.spriteFrameCache.getSpriteFrame("wordframe.png");
		
		var	wordFrameSprite = cc.Sprite.create(wordFrameFrame),
			rect = wordFrameSprite.getTextureRect();
		_42_retain(wordFrameSprite, "words: wordFrameSprite");	
		rect.width = width + $42.WORD_FRAME_WIDTH * 2;
		rect.height = height + $42.WORD_FRAME_WIDTH * 2;
		wordFrameSprite.setTextureRect(rect);
		wordFrameSprite.setPosition(x,y);
		ml.addChild(wordFrameSprite,15);
		
		// add sprites of word
		var multipliersInWord = [];
		for( var i=0 ; i<word.length ; i++) {
			cc.assert( ml.boxes[brc.row][brc.col+i].sprite , "42words, showFullword: Sprite is missing in box at position "+brc.row+"/"+brc.col );
			
			var orgSprite = ml.boxes[brc.row][brc.col+i].sprite,
				sprite = cc.Sprite.create(orgSprite.getTexture(),orgSprite.getTextureRect());
			sprite.setPosition($42.BS/2+i*$42.BS+$42.WORD_FRAME_WIDTH,$42.BS/2+$42.WORD_FRAME_WIDTH);
			_42_retain(sprite, "words: sprite "+i);	
			wordFrameSprite.addChild( sprite );
			
			// look for mulitpliers and add if there are
			var sw = ml.selectedWord,
				m = ml.multipliers;
			
			for( var j=0 ; j<m.length ; j++ ) {
				if( sw && sw.brc.row === m[j].brc.row && sw.brc.col+i === m[j].brc.col ) {
					var orgSprite = m[j].sprite,
						sprite = cc.Sprite.create(orgSprite.getTexture(),orgSprite.getTextureRect());
					sprite.setPosition($42.BS/2+i*$42.BS+$42.WORD_FRAME_WIDTH,$42.BS/2+$42.WORD_FRAME_WIDTH);
					sprite.setColor(cc.color(128,0,0,255));
					sprite.setScale(1.3,1.3);
					_42_retain(sprite, "multiplier "+j);	
					wordFrameSprite.addChild( sprite , 2 );
					
					multipliersInWord[i] = m[j];
				}				
			}
		}
		
		// move, rotate and scale word
		var bezier = [
		      cc.p(x,y),
              cc.p(x<ml.size.width/2?ml.size.width:0,ml.size.height/2),
              cc.p(ml.size.width/2,ml.size.height-300)];

		wordFrameSprite.runAction(
			cc.sequence(
				cc.delayTime($42.MOVE_SPEED*rowsDeleted),
				cc.EaseSineIn.create(
					cc.bezierTo($42.WORD_FRAME_MOVE_TIME,bezier)
				)
			)
		);
		wordFrameSprite.runAction(cc.EaseSineIn.create(
			cc.sequence(
				cc.delayTime($42.MOVE_SPEED*rowsDeleted),
				cc.EaseSineOut.create(
					cc.scaleTo($42.WORD_FRAME_MOVE_TIME/2,1.5)
				),
				cc.EaseSineIn.create(
					cc.scaleTo($42.WORD_FRAME_MOVE_TIME/2,0.95)
				),
				cc.callFunc(function() {
					
					// play sound
					cc.audioEngine.playEffect(res.pling_mp3);
					
	   				var sprite = null,
                        levelType = $42.LEVEL_DEVS[$42.currentLevel-1].type;
	   					resume = function(menuLayer,takeWord) {
					        ml.resume();
					        ml.scheduleUpdate();
					        
					        // release and remove sprites
							s = sprite.getChildren();
					        for( var i=0 ; i<s.length ; i++ ) {
						        if( s[i].__retainId ) _42_release(s[i]);
					        }
					        _42_release(sprite);

							// remove sprites and layer
				            ml.getParent().removeChild(menuLayer);
					        sprite.removeAllChildren(true);
					        ml.getParent().removeChild(sprite);

					        cb( takeWord );					        
	   					},
	   					menuItems = (levelType !== $42.LEVEL_TYPE_GIVEN? [{
	    					label: $42.t.take_word_yes, 
	    					cb: function(sender) {
					            //menuLayer.removeAllChildren();
	    						
	    						resume(this,true);	    							
	    			        }
	    				},{
	    					label: $42.t.take_word_no, 
	    					cb: function(sender) {
	    						resume(this,false);
	    			        }
	    				}] : [{
	    					label: $42.t.take_word_ok, 
	    					cb: function(sender) {
	    						resume(this,true);	    							
	    			        }
	    				}]);
	   				
	   				var menuLayer = new _42MenuLayer(levelType !== $42.LEVEL_TYPE_GIVEN? $42.t.take_word_question: $42.t.take_word_congrats[Math.floor(Math.random()*$42.t.take_word_congrats.length)],menuItems); 
    	            ml.getParent().addChild( menuLayer , 2);

    	            if( ml.hookResumeAskForWord ) ml.hookResumeAskForWord( resume , menuLayer );
    	            
    				sprite = cc.Sprite.create(this.getTexture(),this.getTextureRect());
    				var children = this.getChildren(),
    					childSprites = [];
    				for( var i=0 ; i<children.length ; i++ ) {
    					childSprites[i] = cc.Sprite.create(children[i].getTexture(),children[i].getTextureRect());
    					_42_retain(childSprites[i],"words: childSprites["+i+"] ");	
    					childSprites[i].setPosition(children[i].getPosition());
    					childSprites[i].setColor(children[i].getColor());
    					childSprites[i].setScale(children[i].getScale());

        				sprite.addChild(childSprites[i],2);    					
    				}
    				sprite.setPosition(this.getPosition());
    				_42_retain(sprite, "words: sprite");	
    				sprite.setScale(0.95,0.95);
    				ml.getParent().addChild(sprite,2);
    				
    				// display value of word
    				var pos = childSprites[0].getPosition();
    				for( var i=0,sum=0,wordMul=1 ; i<word.length ; i++ ) {
        				var value = $42.letterValues[word[i]] && $42.letterValues[word[i]].value || 0,
        					mul = multipliersInWord[i];
        				
        				if( mul ) {
        					if( mul.word ) wordMul = mul.mul;
        					else {
        						value *= mul.mul;
        					}
        				}
        				sum += value;

        				var valueSprite = cc.LabelTTF.create(value, "Arial", 32);
        				valueSprite.setPosition(pos.x + $42.BS*i , pos.y + $42.BS + 10);
        				_42_retain(valueSprite, "words: value "+i);	
    			        valueSprite.setColor(cc.color(200,160,0));
    			        sprite.addChild(valueSprite, 5);	    					
    				}
    				
    				if( wordMul > 1 ) {
        				showWordMultiplier(wordMul , cc.p(sprite.getTextureRect().width/2+220 , pos.y + $42.BS * 2 + 40), {r:207,g:10,b:10}, sprite);    					
    				}
    				
					// if it is a cypherpunk word ...
					if( group == 2 ) {
        				showWordMultiplier($42.WORD_MULTIPLIER_CYPHERPUNKS , cc.p(sprite.getTextureRect().width/2+120 , pos.y + $42.BS * 2 + 90), {r:43,g:255,b:17},  sprite);
						wordMul *= $42.WORD_MULTIPLIER_CYPHERPUNKS;
					};

    				var value = cc.LabelTTF.create($42.t.take_word_wordvalue+": "+sum*wordMul, "Arial", 48);
					value.setPosition(sprite.getTextureRect().width/2 , pos.y + $42.BS * 2 + 10);
					_42_retain(value,"words: value ("+sum+", "+wordMul+", "+value+")");	
					value.setColor(cc.color(200,160,0));
					sprite.addChild(value, 5);	
					
					// release and remove word sprite that is not visible anymore
			        var s = wordFrameSprite.getChildren();
			        for( var i=0 ; i<s.length ; i++ ) {
				        _42_release(s[i]);
			        }
			        _42_release(wordFrameSprite);
			        wordFrameSprite.removeAllChildren(true);
			        ml.removeChild(wordFrameSprite);	  

        	        ml.pause();
        	        ml.unscheduleUpdate();

				}, wordFrameSprite)
			)
		));

	};
	
	var showWordMultiplier = function( multiplier , pos , color , parent ) {
		var	sprite = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("multiplier"+multiplier+"word.png"),cc.rect(0,0,$42.BS,$42.BS));
		cc.assert(sprite,"42Words, showWordMultiplier: Couldn't load sprite ressource for multiplier "+multiplier);
		sprite.setScale(0.1,0.1);
		sprite.setPosition(pos);
		sprite.runAction(cc.sequence(
			cc.delayTime(Math.random()*0.33),
			cc.spawn(
				cc.tintTo(0.95,color.r,color.g,color.b),
				cc.scaleTo(0.95,1.2),
				cc.rotateTo(0.95,11)
			)
		));
    	parent.addChild(sprite, 5);
	};
	
	var showWordTreasure = function(word, sprite, cb) {
		
		var ch = sprite.getChildren();
		
		// show new word as sprite
		var newWord = cc.LabelTTF.create(word, "Arial", 72);
		newWord.setPosition(cc.p(ml.size.width/2,ml.size.height-300));
		newWord.setColor(cc.color(160,0,0,255));
		ml.getParent().addChild(newWord,1);

		// fade out sprite and word value text
		for( var i=0; i<ch.length ; i++ ) ch[i].runAction(cc.EaseSineOut.create(cc.fadeTo(1.3,0)));
		sprite.runAction(
			cc.sequence(
				cc.EaseSineOut.create(
					cc.fadeTo(1.3,0)
				),
				cc.callFunc(function() {
					// cb();
				})
			)
		);
	};
	
	var selectBestWord = function() {
		var s = ml.selections,
			sw = ml.selectedWord,
			nsw = null;

		if( !s.length ) return false;
		if( sw ) ml.unselectWord();
		
		for( var i=s.length-1 ; i>=0 ; i-- ) {
			var words = s[i].words;
			for( var j=0,max=0 ; j<words.length ; j++ ) max = Math.max(max,words[j].value);

			if( !nsw || max > nsw.maxValue ) {
				nsw = {
					brc: s[i].brc,
					words: words,
					markers: [],
					sprites: [],
					maxValue: max
				} 
			}
		}
		
		cc.assert(nsw, "42words, selectBestWord: No word to select.");

		ml.selectedWord = nsw;		
		var x = $42.BOXES_X_OFFSET + nsw.brc.col*$42.BS + 1.5*$42.BS,
			y = $42.BOXES_Y_OFFSET + nsw.brc.row*$42.BS + 1.5*$42.BS;
		
		updateSelectedWord();
	};

    var selectFreeWord = function() {
		var s = ml.selections,
			sw = ml.selectedWord,
			nsw = null;

		if( !s.length ) return false;
		if( sw ) ml.unselectWord();
       
		for( var i=s.length-1 ; i>=0 ; i-- ) {
			var words = s[i].words,
                brc = s[i].brc;

			for( var j=0,max=0 ; j<words.length ; j++ ) {
                var word = words[j].word,
                    max = Math.max(max, words[j].value);

                for( var k=word.length-1 ; k>=3 ; k-- ) {
                    var box = ml.boxes[brc.row][brc.col+k];
                    if( box && box.userData !== word[k] ) break;
                    if( !box ) var index = k;
                }
                if( k < 3 ) {
                    ////////////////////
                    // free space around?
                    for( var k=0, fs=0; k<6; k++ ) if( ml.boxes[brc.row+Math.floor(k/3)][brc.col+index+k%3] ) fs++;

                    if( fs <= 2 || !ml.boxes[brc.row+1][brc.col+index] ) break;
                }
            }
            if( j<words.length ) {
                ml.selectedWord = {
                    brc: brc,
                    words: words,
                    markers: [],
                    sprites: [],
                    maxValue: max
                } 
		        updateSelectedWord();
                return
            }
		}
    };

	var moveSelectedWord = function(brc) {
		var sw = ml.selectedWord;
		
		if( sw ) {
			ml.boxes[sw.brc.row][sw.brc.col].markers = sw.markers;
			
			// delete old sprites
			if( sw.startMarker ) {
				_42_release(sw.startMarker);

				ml.removeChild( sw.startMarker );				
			}
			for( var i=0 ; i<sw.sprites.length ; i++ ) if( sw.sprites[i]  ) {
				_42_release(sw.sprites[i]);
				ml.removeChild( sw.sprites[i] );
				sw.sprites[i] = null;
			}
		}
			
		// define a new one
		if( brc ) {
			// var words =
			// $42.words[ml.boxes[brc.row][brc.col].words[0].word.substr(0,3)];
			var box = ml.boxes[brc.row][brc.col],
				words = box.words,
				markers = box.markers;
			if( words ) {
				ml.selectedWord = {
						brc: brc,
						words: words,
						markers: markers || [],
						sprites: []
				};
				
				updateSelectedWord();

			} else {
				ml.selectedWord = null;
			}
		} else {
			ml.selectedWord = null;
		}		
		
		updateMultipliers();
	};
	
	ml.unselectWord = function() {
		moveSelectedWord(null);
	}
	
	var blowWords = function(pos, words) {

		var angle = Math.random() * 360;
		for( var i=0 ; i<Math.min(words.length,$42.MAX_WORDS_BLOWN) ; i++ ) {
			var word = cc.LabelTTF.create(words[i].word, "Arial", 38),
	        	x = pos.x + Math.sin(cc.degreesToRadians(angle))*100,
	        	y = pos.y + Math.cos(cc.degreesToRadians(angle))*100;
			
			word.setPosition(x,y);
	        word.setRotation(angle+90);
	        _42_retain(word, "blow word "+i);	
	        angle = (angle+79)%360;
	        ml.addChild(word, 5);
	        var x2 = Math.random()>0.5? -400 : ml.size.width + 400,
	        	y2 = Math.random()*ml.size.height,
	        	x1 = x2<0? ml.size.width:0,
	        	y1 = Math.random()*ml.size.height,
	        	bezier = [cc.p(word.x,word.y),
	                      cc.p(x1,y1),
	                      cc.p(x2,y2)],
	            rotateAction = cc.rotateBy(5,-720,-720),
	            bezierAction = cc.bezierTo(5-Math.random(),bezier),
	            fadeTime = Math.random()+1,
	            fadeAction = cc.sequence(
    				cc.spawn(
						cc.fadeTo((fadeTime-1)*2,255),
						cc.scaleTo((fadeTime-1)*2,1.1)
    				),
    				cc.spawn(
						cc.fadeTo(fadeTime,128),
						cc.scaleTo(fadeTime,0.4)
    				),
    				cc.spawn(
						cc.fadeTo(fadeTime,255),
						cc.scaleTo(fadeTime,1.2)
    				),
    				cc.spawn(
						cc.fadeTo(fadeTime,128),
						cc.scaleTo(fadeTime,0.6)
    				),
    				cc.spawn(
						cc.fadeTo(fadeTime,255),
						cc.scaleTo(fadeTime,1.1)
    				),
    				cc.spawn(
						cc.fadeTo(fadeTime,128),
						cc.scaleTo(fadeTime,0.5)
    				)
	            );
	        word.runAction(fadeAction);
	        word.runAction(rotateAction);
	        word.runAction(cc.sequence(bezierAction,cc.callFunc(function(){
				_42_release(this);

	        	ml.removeChild(this);
	        },word)));
		}
	};
		
	var drawLetterBoxes = function(options) {

        if( !$42.newWordProfileLetters && $42.displayedProfileLetters.length !== 0  ) return;

        ///////////////////////////////////
        // first delete old boxes if there some
        var wpl = $42.wordProfileLetters,
            dpl = $42.displayedProfileLetters,
            boxes = options.boxesPerRow * options.boxesPerCol,
		    rl = $42._rollingLayer;
        
        for( var i=0 ; i<dpl.length ; i++ ) {
            _42_release(dpl[i]);
            dpl[i].getParent().removeChild(dpl[i]);
        }
        dpl = [];
        
        ////////////////////////////////////////
        // fill display with letter boxes (two rows normal size, one row small size)
        for( var i=0 ; i<wpl.length ; i++ ) {
            var normalSizeStart = Math.max(wpl.length - boxes, 0);

            ///////////////////////////
            // create frame around letter
            var letterFrameFrame  = cc.spriteFrameCache.getSpriteFrame("wordframe.png"),
                letterFrameSprite = cc.Sprite.create(letterFrameFrame),
                rect = letterFrameSprite.getTextureRect();
            _42_retain(letterFrameSprite, "letterFrameSprite ("+i+")");	
            rect.width  = ($42.BS + $42.WORD_FRAME_WIDTH*2) * options.scale;
            rect.height = ($42.BS + $42.WORD_FRAME_WIDTH*2) * options.scale;
            letterFrameSprite.setTextureRect(rect);
            rl.addChild(letterFrameSprite,4);
            dpl.push(letterFrameSprite);
            
            ////////////////////////////
            // draw letter
            var letter = wpl[i],
                file = $42.LETTER_NAMES[$42.LETTERS.indexOf(letter)],
                spriteFrame = cc.spriteFrameCache.getSpriteFrame(file+".png"),
                sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,$42.BS,$42.BS)),
                pos = cc.p(($42.BS/2+$42.WORD_FRAME_WIDTH)*options.scale,
                           ($42.BS/2+$42.WORD_FRAME_WIDTH)*options.scale);
            
            cc.assert(spriteFrame,"42Words, drawLetterBoxes: Couldn't load sprite for letter '"+letter+"', file: "+file+", spriteFrame: "+spriteFrame);
            sprite.setPosition(pos);
            sprite.setScale(options.scale);
            letterFrameSprite.addChild( sprite );
            
            /////////////////////////////
            // Find position and scale (mini or normal letters)
            if( i<normalSizeStart ) {
                letterFrameSprite.setPosition(options.pos.x + i*($42.BS+options.padding*2)/2*options.scale,
                                              options.pos.y + $42.BS*options.scale);	
                letterFrameSprite.setScale(0.5);
            } else {
                letterFrameSprite.setPosition(options.pos.x + (((i-normalSizeStart)%options.boxesPerRow>>>0)*($42.BS+options.padding*4))*options.scale,
                                              options.pos.y - (((i-normalSizeStart)/options.boxesPerRow>>>0)*($42.BS+options.padding))*options.scale);

                /////////////////////////////
                // draw value
                var label = new cc.LabelBMFont( $42.letterValues[letter] && $42.letterValues[letter].value || "0" , "res/fonts/amtype24.fnt" , cc.LabelAutomaticWidth, cc.TEXT_ALIGNMENT_LEFT );
                label.setPosition(pos.x+30,pos.y);
                label.setColor(cc.color(255,255,255,255));
                letterFrameSprite.addChild(label, 5); 
            }
        }		
        
        // let the last box blink when it changed
        while( $42.newWordProfileLetters > 0 ) {
            dpl[dpl.length-$42.newWordProfileLetters--].runAction(cc.sequence(cc.delayTime(options.delay),cc.blink(3.5,5)));
        }

        $42.displayedProfileLetters = dpl;
	}
	
	var getNextProfileLetters = function() {
		
		var i=0,
			next = [],
			tmp = "";
		
		for( var letter in $42.letterOrder ) {
			if( $42.wordProfile < ($42.wordProfile | 1<<i) ) {
				next.push({letter:$42.letterOrder[letter],order:i});
				tmp += $42.letterOrder[letter]+",";
				if( next.length === $42.NEXT_PROFILE_LETTERS ) break;
			}
			i++;
		}

		$42.nextProfileLetters = next;
		cc.log("42words, getNextProfileLetters: "+tmp);
	};
	
	var setNextProfileLetter = function() {
		
		var npl = $42.nextProfileLetters,
			pl = npl.length && npl[npl.length-1] || null;
		
		if( pl ) {
			$42.wordProfile |= (1<<pl.order);	
			$42.wordProfileLetters.push($42.letterOrder[pl.order]);
			cc.log("42words, setNextProfileLetter: New letter: "+$42.letterOrder[pl.order]);
			if( !$42.newWordProfileLetters ) $42.newWordProfileLetters = 0; 
			$42.newWordProfileLetters++;
			getNextProfileLetters();

			ml.lettersForNextTile.push(pl.letter);
		}
	};
	
	var getNextProfileCandidate = function() {
		if( ml.nextProfileLetterCnt === undefined ) ml.nextProfileLetterCnt = 0; 
		
		if( ++ml.nextProfileLetterCnt === $42.NEXT_PROFILE_LETTER_CNT ) {
			ml.nextProfileLetterCnt = 0;

			var npl = $42.nextProfileLetters;
			if( npl.length > 1 ) npl.splice(npl.length-1,1);
			cc.log("42words, getNextProfileCandidate: New next letter: "+(npl[npl.length-1] && npl[npl.length-1].letter));			
		}
	};
	
	var setNextMultiplier = function() {
		var m = ml.multipliers;
		
		if( m.length >= $42.MAX_MULTIPLIERS ) return;
		
		var mul = $42.MULTIPLIER[ml.nextMultiplier],
			sprite = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("multiplier"+mul[0]+mul[1]+".png"),cc.rect(0,0,$42.BS,$42.BS));
		_42_retain(sprite, "multiplier"+mul[0]+" "+mul[1]);	

        // find a new position
        while( true ) {
    		var brc = { 
    			row : 3 + m.length/2 + Math.random()*4 >>> 0,
    			col : Math.random()*$42.BOXES_PER_ROW >>> 0
    		};
    		
    		for( var i=0 ; i<m.length ; i++ ) 
    			if( (m[i].brc.row === brc.row || m[i].brc.row === brc.row-1 || m[i].brc.row === brc.row+1 ) && 
    				 m[i].brc.col === brc.col ) break;
    		if( i === m.length) break;
        }
        
        // set position, color and show sprite
        sprite.setPosition($42.BOXES_X_OFFSET+$42.BS*brc.col+$42.BS/2,$42.BOXES_Y_OFFSET+$42.BS*brc.row+$42.BS/2);
        ml.addChild(sprite,20);
        m.push({
        	sprite: sprite,
        	brc: brc,
        	mul: mul[0],
        	word: mul[1]==="word"? true:false
        });
        
        // color it
        updateMultipliers();
        
        ml.nextMultiplier = ++ml.nextMultiplier%$42.MULTIPLIER.length;
	}
	
	var updateMultipliers = function() {
		var m = ml.multipliers,
		sw = ml.selectedWord;

		for( var i=0 ; i<m.length ; i++ ) {
			var brc = m[i].brc,
				sprite = m[i].sprite,
				marker = sw && sw.brc.row === brc.row && sw.markers[brc.col-sw.brc.col];
	
		    if( (marker === $42.MARKER_SEL || marker === $42.MARKER_SET) ) {
		    	if( !m[i].armed ) {
			    	sprite.runAction(cc.sequence(cc.tintTo(0.33,128,0,0),cc.blink(0.5,3)));
			    	m[i].armed = true;		    		
		    	}
		    }
		    else if( ml.boxes[brc.row][brc.col] ) {
		    	sprite.runAction(cc.tintTo(0.33,0,0,128));
		    	m[i].armed = false;
		    }
		    else {
		    	sprite.runAction(cc.tintTo(0.33,128,128,128));	
		    	m[i].armed = false;
		    }
		}
	};
	
	var blowMultiplier = function(value, pos) {
		var coin = cc.LabelTTF.create(value, "Arial", 40),
			time = 0.5;

		coin.setPosition(pos.x,pos.y);
		_42_retain(coin, "coin");	
		coin.setColor(cc.color(40,0,0));
		ml.addChild(coin, 5);
		coin.runAction(
			cc.sequence(
				cc.EaseSineOut.create(
			    	cc.spawn(
			    		cc.moveBy(time,cc.p((pos.x-ml.size.width/2)/4,300)),
			    		cc.scaleTo(time,2),
			    		cc.fadeTo(time,0)
			    	)
			    ),
			    cc.callFunc(function() {
					_42_release(this);
			    	ml.removeChild(this);
			    },coin)
			)
		);		
	}
		
	/*
	 * hookLoadImages
	 * 
	 * Called before default images for tiles are loaded
	 * 
	 */
	_42Layer.hookLoadImages = function() {
		cc.spriteFrameCache.addSpriteFrames(res.letters_plist);
	};
	
	_42Layer.hookStartGame = function() {
	    
        // global data init
        var ls = cc.sys.localStorage,
            wtJSON = ls.getItem("wordTreasure"),
        	wt = $42.wordTreasure = wtJSON? JSON.parse(wtJSON) : [],
            lv = $42.currentLevel = ls.getItem("currentLevel") || 1,
		    wp = $42.wordProfile = parseInt(ls.getItem("wordProfile")) || 0x7f, // 127 == first 7 letters in the letter order
            lo = $42.letterOrder;

		// remove all words that are already in the treasure
        for( var i=0 ; i<wt.length ; i++ ) {
            var prefix = wt[i].word.substr(0,3),
                index = $42.words[prefix].indexOf(wt[i].word);

            if( index > -1 ) $42.words[prefix][index].deleted = true;
            else cc.log("_42Layer.hookStartGame: Word '"+wt[i].word+"' not found in main word list. Did word list change?");
        }
				
		// prepare for which letters can be used (word profile), and what
		// letters will be next
		$42.wordProfileLetters = []; 
		for( var i=0 ; i<lo.length ; i++ ) if( (wp | 1<<i) === wp ) $42.wordProfileLetters.push(lo[i]); 
		$42.displayedProfileLetters = [];
		getNextProfileLetters();

		$42.tutorialsDone = ls.getItem("tutorialsDone") || 0;
		
// ml.hookStartProgram( 2 , false );
// ml.hookStartProgram( 0 , true );
//		if( ml.hookStartProgram && $42.tutorialsDone < 1 ) ml.hookStartProgram( 0 , true );	
//		else if( ml.hookStartProgram ) ml.hookStartProgram( 2 , false );
		// ml.hookStartProgram( 2 , false );
		
		ml.totalPoints = 0;
		ml.rollingLayerStage = 0;
		ml.nextMultiplier = 0;
		ml.multipliers = [];
		ml.dontAutoSelectWord = false;
	
        startNewLevel();    
	};
	
	_42Layer.hookEndGame = function() {
		// deselect word
		this.unselectWord();

		var releaseSprite = function(sprite) {
			if( !sprite ) debugger;
			_42_release(sprite);
		};
		
		var dpl = $42.displayedProfileLetters;
		releaseSprite( ml.bestWordSprite );
		for( var i=0 ; i<dpl.length ; i++ ) {
			releaseSprite( dpl[i] );
		}
		releaseSprite(ml.bestWordValue);
		releaseSprite(ml.score_words_mini);
		releaseSprite(ml.score_points);
		releaseSprite(ml.score_words_label);
		releaseSprite(ml.score_words);
	};

	/*
	 * hookSetTile
	 * 
	 * Called before building a tile to choose a tile
	 * 
	 * Param: none
	 * 
	 */
	_42Layer.hookSetTile = function() {
		
		if( ml.hookGetProgrammedTile ) this._nextTile = ml.hookGetProgrammedTile();
		
		if( !this._nextTile || this._nextTile.tile === undefined ) return ml.getRandomValue($42.TILE_OCCURANCES);
        else return this._nextTile.tile; 
	};

	/*
	 * hookSetTileImages
	 * 
	 * Called while building a tile to set the images of the tile boxes
	 * 
	 * Param: tileBoxes: metrics of the boxes
	 * 
	 */
	_42Layer.hookSetTileImages = function(tileBoxes, pos, userData) {

		var tileSprite = cc.Sprite.create(res.letters_png,cc.rect(0,0,0,0)),
            levelType = $42.LEVEL_DEVS[$42.currentLevel-1].type,
            sw = ml.selectedWord,
        	lnt = ml.lettersForNextTile,
            nt = this._nextTile;
				
		_42_retain(tileSprite, "words: tileSprite");
		tileSprite.setPosition(pos);
		ml.addChild(tileSprite,2);

        // add single boxes with letters to the tile
        for( var i=0 ; i<tileBoxes.length ; i++) {
        	
        	var ntLetter = nt && nt.letters[i] || null;

        	if( lnt && lnt.length > 0 ) {
        		var val = $42.LETTERS.indexOf(lnt.splice(0,1)[0]);
        	} else if( nt !== null && (levelType === $42.LEVEL_TYPE_GIVEN || ntLetter !== " " || Math.random()>0.5)) {
        		var val = $42.LETTERS.indexOf(ntLetter);
        	} else {
	         	var len = sw && sw.missingLetters && sw.missingLetters.length || 0,
         			prob = len <= 3? $42.NEEDED_LETTERS_PROBABILITY / (5-len) : $42.NEEDED_LETTERS_PROBABILITY; 
        		while( true ) {
	         		val = (Math.random()>prob || !sw || !len)?  
	         					Math.floor(this.getRandomValue($42.letterOccurences)):
	        					$42.LETTERS.indexOf(sw.missingLetters[Math.floor(Math.random()*sw.missingLetters.length)]);        			
	         					
	         		// no triple letters
	        	    for( k=0,double=0 ; k<i ; k++ ) 
	        	    	if( userData[k] === $42.LETTERS[val] ) double++;
	        	    if( double > 1 ) continue;
	        	    
                    cc.log("_42Layer.hookSetTileImages, val: "+val+", $42.LETTERS[val]: "+$42.LETTERS[val]+"$42.letterValues[$42.LETTERS[val]]: ", $42.letterValues[$42.LETTERS[val]]);
	         		if( $42.wordProfileLetters.indexOf($42.LETTERS[val]) > -1 ) break;	
	         		
	         		cc.log("42words, hookSetTileImages: Got a not allowed letter: "+$42.LETTERS[val]+" for box "+i+". Skipping it ...");
        		}
        	}
       					
    		var	spriteFrame = cc.spriteFrameCache.getSpriteFrame($42.LETTER_NAMES[val]+".png"),
    			sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,$42.BS,$42.BS));
    		
    		cc.assert(sprite, "42words, hookSetTileImages: sprite must not be null. (var = "+val+", name="+$42.LETTER_NAMES[val]+" )");
    		if( !sprite ) cc.log("42words, hookSetTileImages: sprite must not be null. (var = "+val+", name="+$42.LETTER_NAMES[val]+" )");
    		_42_retain(sprite, "words: sprite");
        	sprite.setPosition(cc.p(tileBoxes[i].x,tileBoxes[i].y));
        	sprite.setRotation(-$42.INITIAL_TILE_ROTATION);
        	userData[i] = $42.LETTERS[val];
        	
	        tileSprite.addChild(sprite);
        }

        // tile was used, so delete it
        this._nextTile = null;
        
        return tileSprite;
	};	
	
	_42Layer.hookTileFixed = function( brcs ) {
		
		ml.lastBrcs = brcs;
		
		setSelections(); // OPTIMIZATION: Only look in current lines
		return updateSelectedWord();
	};	

	_42Layer.hookTileFixedAfterRowsDeleted = function( ) {

        //////////////////////////////////
        // Move to a new selection that came with the last tile
        var moveToNewWord = function() {
            var s = ml.selections,
                level = $42.LEVEL_DEVS[$42.currentLevel-1];

            if( level.type === $42.LEVEL_TYPE_GIVEN ) {
                var brcs = ml.lastBrcs || [];
                for( var i=0 ; brcs && i<brcs.length ; i++ ) {
                    for( var j=0 ; s && j<s.length ; j++ ) {
                        var brc1 = brcs[i],
                            brc2 = s[j].brc;

                        if( brc1.row == brc2.row && (brc1.col == brc2.col || brc1.col == brc2.col+1 || brc1.col == brc2.col+2) ) {
                            moveSelectedWord(brc2);
                            return true;
                        }
                    }
                }
            }

            return false;
        }
		
		if( !moveToNewWord() && !ml.selectedWord && !ml.dontAutoSelectWord ) selectFreeWord(); // selectBestWord();

		updateMultipliers();
	}

	_42Layer.hookDeleteBox = function(brc) {
		var sw = ml.selectedWord,
			box = ml.boxes[brc.row][brc.col],
			s = ml.selections;

		var lb = ml.lastBrcs,
			newBox = false;
		if( lb ) {
			for( var i=0 ; i<lb.length ; i++) 
				if( lb[i].row === brc.row && lb[i].col === brc.col ) 
					break;
			if( i<lb.length ) newBox = true;
		}
		if( sw && sw.brc.row === brc.row && (
				sw.markers[brc.col-sw.brc.col] === $42.MARKER_SET || 
				sw.markers[brc.col-sw.brc.col] === $42.MARKER_SEL || 
				newBox && sw.markers[brc.col-sw.brc.col] === $42.MARKER_OPT
			)
		) return false;

		// 1 and 3 tiles
		if( box && (box.userData === "1" || box.userData === "3") ) {
			ml.add1and3s.push(box.userData);
		}
		
		// check if selection is deleted, and blow words if it is so
		for( var i=0 ; i<s.length ; i++ ) if( s[i].brc.row === brc.row && s[i].brc.col === brc.col ) break;			
		if( i<s.length )
			blowWords(cc.p($42.BOXES_X_OFFSET + (brc.col+1.5)*$42.BS, $42.BOXES_Y_OFFSET + (brc.row+0.5)*$42.BS),box.words);
		
		return true;
	};
	
	_42Layer.hookMoveBoxDown = function(to,from) {		
		// check if selected word has to move
		var sw = ml.selectedWord;
		if( sw && sw.brc.row === from.row && sw.brc.col === from.col ) {
			sw.brc.row = to.row;
			sw.brc.col = to.col;
		}
	};
	
	_42Layer.hookAllBoxesMovedDown = function(rowsDeleted) {
		setSelections();
		updateSelectedWord({ rowsDeleted: rowsDeleted});			

		// switch to next profile letter candidate
		getNextProfileCandidate();
	};
    
    _42Layer.hookInitScorebar = function() {
		var sb = $42._scoreBar,
			rl = $42._rollingLayer,
			wt = $42.wordTreasure || [],
            lw = ml.levelWords || [],
			wpl = $42.wordProfileLetters;

        ///////////////////////////////////
        // Add values of word treasure and level words
        for( var i=0,tv=0,bw=null ; i<wt.length ; i++ ) {
            tv += wt[i].value;
            if( !bw || bw.value <= wt[i].value ) bw = wt[i];
        }
        for( var i=0; i<lw.length ; i++ ) {
            tv += lw[i].value;
            if( !bw || bw.value <= lw[i].value ) bw = lw[i];
        }

        drawLetterBoxes({
            pos : cc.p(
                20,
                wpl.length>$42.SCOREBAR_LETTERS_PER_ROW*$42.SCOREBAR_LETTERS_PER_COL? 56 : 68
            ),
            scale : $42.SCOREBAR_LETTERS_SCALE,
            padding : $42.SCOREBAR_LETTERS_PADDING,
            boxesPerRow: $42.SCOREBAR_LETTERS_PER_ROW,
            boxesPerCol: $42.SCOREBAR_LETTERS_PER_COL
        });
        
        // draw points, left, back side
        ml.score_words_mini = ml.drawScorebarText("(0 "+$42.t.scorebar_words[1]+")", cc.p(50,111) , 24 , $42.SCORE_COLOR_BRIGHT );
        ml.score_points = ml.drawScorebarText(tv.toString(), cc.p(50,151) , tv>=1000?56:72 , $42.SCORE_COLOR_BRIGHT );

        // draw total words, right, front side
        ml.score_words_label = ml.drawScorebarText($42.t.scorebar_words[1] , cc.p(588,15) , 24 , $42.SCORE_COLOR_DIMM );
        ml.score_words = ml.drawScorebarText((wt.length+lw.length).toString(),cc.p(588,60) , 72 , $42.SCORE_COLOR_BRIGHT );
        
        // draw most valuable word
        ml.bestWordValue = ml.drawScorebarText($42.t.scorebar_mvw,cc.p(300,111),24,$42.SCORE_COLOR_BRIGHT);
        ml.bestWordSprite = ml.drawScorebarWord(bw? bw.word:"",cc.p(300,157),ml.bestWordSprite,0.60);	
    
        return true;
    };
	
	_42Layer.hookDrawScorebar = function(highlight) {
		var sb = ml._scoreBar,
			wt = $42.wordTreasure,
            lw = ml.levelWords,
			wpl = $42.wordProfileLetters,
			rl = $42.rollingLayer;
	
        ///////////////////////////////////
        // Add values of word treasure and level words
        for( var i=0,tv=0,bw=null ; i<wt.length ; i++ ) {
            tv += wt[i].value;
            if( !bw || bw.value <= wt[i].value ) bw = wt[i];
        }
        for( var i=0; i<lw.length ; i++ ) {
            tv += lw[i].value;
            if( !bw || bw.value <= lw[i].value ) bw = lw[i];
        }

        ml.score_words_label.setString($42.t.scorebar_words[wt.length===1?0:1]);
        ml.score_words.setString(wt.length+lw.length);
        ml.score_points.setString(tv.toString());
        ml.score_words_mini.setString("("+wt.length+" "+$42.t.scorebar_words[wt.length===1?0:1]+")");

        ml.bestWordValue.setString($42.t.scorebar_mvw+ (bw?": "+bw.value:""));
        ml.bestWordSprite = ml.drawScorebarWord(bw? bw.word:"",cc.p(300,157),ml.bestWordSprite,0.60);

        drawLetterBoxes({
            pos : cc.p(
                20,
                wpl.length>$42.SCOREBAR_LETTERS_PER_ROW*$42.SCOREBAR_LETTERS_PER_COL? 56 : 68
            ),
            scale : $42.SCOREBAR_LETTERS_SCALE,
            padding : $42.SCOREBAR_LETTERS_PADDING,
            boxesPerRow: $42.SCOREBAR_LETTERS_PER_ROW,
            boxesPerCol: $42.SCOREBAR_LETTERS_PER_COL,
            delay: highlight? $42.SCOREBAR_ROLLING_LAYER_DELAY-0.5 : 0,
            parent : rl
        });
        
        // highlight things
        switch(highlight) {
        case "bestWord": 
            ml.bestWordSprite.runAction(cc.blink($42.SCOREBAR_ROLLING_LAYER_DELAY - 0.5,3));
				break;
		}

        return true;
	};

	_42Layer.hookOnTap = function(tapPos) {
		var sw = ml.selectedWord;
		if( sw ) {
			var swPos = { 
					x: $42.BOXES_X_OFFSET + sw.brc.col * $42.BS,
					y: $42.BOXES_Y_OFFSET + sw.brc.row * $42.BS
			};			
		} 
		
		// check if selected word is hit
		if( sw && tapPos.x >= swPos.x && tapPos.y >= swPos.y - $42.BS/3 && tapPos.y <= swPos.y + $42.BS ) {
			var col = Math.floor((tapPos.x - swPos.x)/$42.BS),
				marker = sw.markers[col];
			if( marker === $42.MARKER_OPT || marker === $42.MARKER_SEL ) {
				cc.assert(ml.boxes[sw.brc.row][sw.brc.col+col].sprite, "42words, hookOnTap: There must be a sprite at position "+sw.brc.row+"/"+(sw.brc.col+col)+".");
				if( marker === $42.MARKER_OPT ) {
					sw.markers[col] = $42.MARKER_SEL;
					ml.boxes[sw.brc.row][sw.brc.col+col].sprite.setOpacity(255);	
				} else {
					sw.markers[col] = $42.MARKER_OPT;					
					ml.boxes[sw.brc.row][sw.brc.col+col].sprite.setOpacity($42.UNSELECTED_BOX_OPACITY);	
				}
				updateSelectedWord();
				updateMultipliers();
			} else {
				ml.unselectWord();
				setSelections();
				ml.dontAutoSelectWord = true;
			}
		} else {
			for( var i=ml.selections.length-1 ; i>=0 ; i--) {
				var s = ml.selections[i];

				if( s && tapPos.x >= s.pos.x && tapPos.x <= s.pos.x+s.width && tapPos.y >= s.pos.y && tapPos.y <= s.pos.y+s.height ) {
					moveSelectedWord(s.brc);
					ml.dontAutoSelectWord = false;
					setSelections();
					updateSelectedWord();
					
					var x = $42.BOXES_X_OFFSET + s.brc.col*$42.BS + 1.5*$42.BS,
					y = $42.BOXES_Y_OFFSET + s.brc.row*$42.BS + 1.5*$42.BS;
				}
			}
		}
	};
	
	_42Layer.hookOnLongTap = function(tapPos) {
	};
	
	_42Layer.hookUpdate = function(dt) {
		
		if( ml.hookMurbiksUpdate ) ml.hookMurbiksUpdate(dt);
						
		// tutorial 2 starts >= 750
		if( ml.totalPoints >= 750 && !ml.wordIsBeingSelected && ml.hookStartProgram && $42.tutorialsDone < 2 ) {
			$42.tutorialsDone = 2;
			ml.hookStartProgram( 1 , true );	
		}
	};
	
	// call tutorial module if available
	if( typeof MURBIKS_MODULE === 'function' ) MURBIKS_MODULE(ml);
};

