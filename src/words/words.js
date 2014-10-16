/* Enhancement module for 42 WORDS
 * 
 * NEXT STEPS:
 * 
 * Zweifacher/dreifacher Wortwert, zweifacher,zweifacher,dreifacher,fünffacher,zehnfacher Buchstabenwert
 * Tutorial, Tiles order
 * 
 * 
 * + FEHLER
 * 
 * 
 * + GAMEPLAY
 * 
 * + WORTSCHATZ
 * - show wortschatz
 * 
 * + INTERNATIONALIZATION
 * 
 * + IPHONE
 * 
 * 
 * + STABILIZATION
 * 
 * 
 * 
 */

// $42.LETTER_NAMES and $42.LETTERS must have corresponding elements 
$42.LETTER_NAMES = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","ae","oe","ue","6","ao","1","3"];
$42.LETTERS =      ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","Ä" ,"Ö" ,"Ü" ,"Õ","Å" ,"1","3"];
$42.MARKER_SET = 1;
$42.MARKER_OPT = 2;
$42.MARKER_SEL = 3;
$42.START_MARKER_X_OFFSET = -18;
$42.START_MARKER_Y_OFFSET = $42.BS/2;
$42.MARKER_X_OFFSET = $42.BS/2;
$42.MARKER_Y_OFFSET = -25;
$42.UNSELECTED_BOX_OPACITY = 100;
$42.NEEDED_LETTERS_PROBABILITY = 0.15; // additional probability that a needed
										// letter will be selected
$42.MAX_WORDS_BLOWN = 3;
$42.WORD_FRAME_WIDTH = 4;
$42.WORD_FRAME_MOVE_TIME = 0.8;
$42.SCORE_ROW_MULTIPLYER = 0.25;
$42.SCORE_WORD_MULTIPLYER = 7;
$42.SCORE_COLOR_DIMM = cc.color(160,120,55);
$42.SCORE_COLOR_BRIGHT = cc.color(240,170,70);
$42.SCORE_COLOR_WHITE = cc.color(255,255,255);
$42.POINTS_TO_ADD_CYCLES = 3;
$42.POINTS_TO_ADD_BLOW_UP = -1;
$42.LEVELS_TO_BLOW_CYCLES = 30;
$42.NEXT_PROFILE_LETTERS = 5;
$42.NEXT_PROFILE_LETTER_CNT = 3;
$42.PLUS1_BUTTON_X = 130;
$42.PLUS1_BUTTON_Y = 1200;
$42.PLUS1_BUTTON_COST = 1000;
$42.PLUS1_BUTTON_TOPROW = 10;
$42.PLUS1_BUTTON_OPACITY = 170;
$42.PLUS3_BUTTON_X = 490;
$42.PLUS3_BUTTON_Y = 1200;
$42.PLUS3_BUTTON_COST = 10000;
$42.PLUS3_BUTTON_OPACITY = 170;
$42.SCOREBAR_LETTERS_PER_ROW = 8;
$42.SCOREBAR_LETTERS_PER_COL = 2;
$42.SCOREBAR_LETTERS_PADDING = 16;
$42.SCOREBAR_LETTERS_SCALE = 0.45;
$42.SCOREBAR_ROLLING_LAYER_DELAY = 3.0;
$42.MAX_MULTIPLIERS = 5;
$42.MAX_PLAYING_TIME = 45;

$42.MULTIPLIER = [[2,"letter"],[3,"letter"],[2,"word"],[5,"letter"],[10,"letter"],[3,"word"],[20,"letter"]];

var _42_MODULE = function(_42Layer) {

	var ml = _42Layer,
		nextTile = null;
	
	// go through box array and look for prefixes
	var setSelections = function( dontSelectWord ) {
		var s = [],
			sw = ml.selectedWord,
			nsw = null;

		for( var i=0 ; i<$42.BOXES_PER_COL ; i++) {
			// dim all boxes in a row
			for( var j=0 ; j<$42.BOXES_PER_ROW ; j++ ) {
				var box = ml.boxes[i][j];				
				if( box && box.sprite ) box.sprite.setOpacity($42.UNSELECTED_BOX_OPACITY);				
			}
			// check all boxes for word starts (prefixes)
			for( var j=0 ; j<$42.BOXES_PER_ROW-2 ; j++ ) {
				var box = ml.boxes[i][j];				
				if(!box) continue;
				
				var oldPrefix = box.words && box.words[0] && box.words[0].word.substring(0,3) || null;
				box.words = null;
				checkForPrefixes({row:i,col:j}, function(brc, words) {
					box.words = words;
					// don't show selections in the row of the selected word
					if( sw && sw.brc.row === i ) return;
					
					var newPrefix = words[0].word.substring(0,3);

					// let a newly found sprite blink
					for( var k=0 ; k<3 ; k++ ) {
						var box1 = ml.boxes[brc.row][brc.col+k];
						if( box1.sprite ) box1.sprite.setOpacity(255);
						if( newPrefix != oldPrefix ) {
							box1.sprite.runAction(cc.blink(0.5,3));
						}
					}
					
					// fill the selection
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
		
		ml.selections = s;
	};
	
	// look for words at a specified position
	var checkForPrefixes = function(brc, cb) {

		var prefix = (ml.boxes[brc.row][brc.col]   && ml.boxes[brc.row][brc.col].userData || " ")+
					 (ml.boxes[brc.row][brc.col+1] && ml.boxes[brc.row][brc.col+1].userData || " ")+
					 (ml.boxes[brc.row][brc.col+2] && ml.boxes[brc.row][brc.col+2].userData || " "),
			words = [];
		
		// copy word object
		for( var i=0 ; $42.words[prefix] && i<$42.words[prefix].length ; i++ ) {
			words.push({
				word: $42.words[prefix][i].word,
				value: $42.words[prefix][i].value,
				profile: $42.words[prefix][i].profile,
			});
		}

		if( !(ml.boxes[brc.row][brc.col] && ml.boxes[brc.row][brc.col].words) && words.length && cb ) {

			for( var i=words.length-1 ; i>=0 ; i-- ) {
// if( brc.col + words[i].word.length > $42.BOXES_PER_ROW || words[i].value >
// $42.maxWordValue ) {
				if( brc.col + words[i].word.length > $42.BOXES_PER_ROW || $42.wordProfile < ($42.wordProfile | words[i].profile) ) {
					words.splice(i,1);
				}
			}
			
			if( words.length > 0 ) {
				cb(brc,words);
			}
		}
	};
	
	// update selected word
	var updateSelectedWord = function(options) {
		var sw = ml.selectedWord;
		
		if( !sw || ml.wordIsBeingSelected ) return false;
		
		// Define sprites and show word start sprite
		var setMarkerFrame = [],
			optMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker1"),
			selMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker3");
		
		setMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker0");
		
		if( !sw.startMarker ) {
			sw.startMarker = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("marker2"),cc.rect(0,0,$42.BS,$42.BS));
			sw.startMarker.retain();
	        /* retain */ tmpRetain[sw.startMarker.__instanceId] = { name: "words: sw.startMarker", line: 186 };	
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
		// so all selected markers and start with all words anew
		if( curWords.length === 0 ) {
			curWords = sw.words.slice();
			for( var i=3 ; i<sw.markers.length ; i++ ) if( sw.markers[i] === $42.MARKER_SEL || sw.markers[i] === $42.MARKER_SET ) sw.markers[i] = null;
		}
		for( var i=sw.brc.col ; i<$42.BOXES_PER_ROW ; i++) {
			var col = i-sw.brc.col;
			// remove old sprite
			if( sw.sprites[col] ) {
				sw.sprites[col].release();
				delete tmpRetain[sw.sprites[col].__instanceId];
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
				sw.sprites[col].retain();
		        /* retain */ tmpRetain[sw.sprites[col].__instanceId] = { name: "words: sw.sprites["+col+"]", line: 252 };	
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
		
		// look if all marked letters form a complete word
		for( var i=0 ; i<curWords.length ; i++ ) {
			var word = curWords[i].word;
			for( var j=0 ; j<word.length ; j++ ) {
				if( !ml.boxes[sw.brc.row][j+sw.brc.col] || 
					word[j] !== ml.boxes[sw.brc.row][j+sw.brc.col].userData ) 
						break;
			}
			if( j === word.length ) {
				// delete word from global word list
				var ret = deleteWordFromList(word);
				cc.assert(ret,"42words, updateSelectedWord: "+word+" is not in the list!");
				// also delete if from selected word list
				sw.words.splice(i,1);
				if( !sw.words.length ) ml.unselectWord();
				
				ml.wordIsBeingSelected = true;
				showFullWordAndAsk( sw.brc , word , options && options.rowsDeleted || 0 , function( takeWord ) {	
					ml.wordIsBeingSelected = false;
					if( takeWord ) {

						// delete complete row
						var row = sw.brc.row;

						// calculate word value
						for( var wordMul=1,value=0,k=0 ; k<word.length ; k++ ) {
							var val = $42.letterValues[word[k]].value,
								m = ml.multipliers;
							
							for( var l=0 ; l<m.length ; l++ ) {
								if( m[l].brc.row === sw.brc.row && m[l].brc.col === sw.brc.col+k ) {
									if( m[l].word ) wordMul = m[l].mul;
									else {
										val *= m[l].mul;
									}
									// release and delete it
									m[l].sprite.retain();
							        /* retain */ tmpRetain[m[l].sprite.__instanceId] = { name: "multiplier", line: 299 };	
									ml.removeChild(m[l].sprite);
									m.splice(l,1);
									break;
								}
							}
							
							value += val;
						}
						
						// put word into treasure
						var ls = cc.sys.localStorage,
							w = { 
								word: word,
								value: value * wordMul
							};
						$42.wordTreasure.push(w);
						$42.wordTreasureWords++;
						ls.setItem("wordTreasureWords",$42.wordTreasureWords);
						$42.wordTreasureValue += w.value;
						
						var wtl = $42.wordTreasure.length;
						if( $42.wordTreasureValue > $42.maxPoints ) {
							$42.maxPoints = $42.wordTreasureValue;
							moveRollingLayer(1,$42.SCOREBAR_ROLLING_LAYER_DELAY);
							
							var highlight = "maxPoints";
							ls.setItem("maxPoints",$42.maxPoints);
						}
						if( !$42.wordTreasureBestWord || $42.wordTreasureBestWord.value < w.value ){							
							$42.wordTreasureBestWord = w;
							moveRollingLayer(1,$42.SCOREBAR_ROLLING_LAYER_DELAY);
							var highlight = "bestWord";
							if( wtl >= 7 ) setNextProfileLetter();
						} 
						if( $42.wordTreasure.length >= 42 ) youWonTheGame();

						ml.unselectWord();
						ml.checkForAndRemoveCompleteRows(row);

						// add new profile letters and multipliers
						if( !(wtl%3) ) {
							if( wtl >=  9 ) setNextProfileLetter();
							if( wtl >= 21 ) setNextMultiplier();
						}
						
						cc.log("42words, updateSelectedWord, takeWord = true: setSelection()");
						setSelections();
						drawScoreBar(highlight);
					} else {
						ml.checkForAndRemoveCompleteRows();
						cc.log("42words, updateSelectedWord, takeWord = false: setSelection()");
						ml.unselectWord();
						setSelections();
						moveSelectedWord(sw.brc);
					}
				});

				return true; // a word was found
			}
		}
		
		return false;
	};
	
	var youWonTheGame = function() {
		
		var self = this;
	       
        ml.pause();
        ml.unscheduleUpdate();

		blowLevelAndWordValue({allwords:true}, function() {
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
            	    $42.t.won_word_value+": "+$42.wordTreasureValue+($42.wordTreasureValue === $42.maxPoints?" ("+$42.t.won_highscore+")":""),
            	    $42.t.won_word_treasure+": "+$42.wordTreasureWords,
            	    $42.t.won_time+": "+(ml.timeCounter/3600>>>0)+":"+("0"+(ml.timeCounter/60>>>0)%60).substr(-2,2)+" "+$42.t.won_minutes
            	],menuItems), 1
            );
			var ls = cc.sys.localStorage;
            $42.bestTime = ml.timeCounter;
            ls.setItem("bestTime",$42.bestTime);
		});		
	};
	
	var blowLevelAndWordValue = function(blow,cb) {
		
		var text = [];
		
// if( levelAndValue.level ) text =
// [{t:$42.t.new_level_level,scale:5,color:cc.color(0,128,0)} ,
// {t:levelAndValue.level,scale:10,color:cc.color(0,160,0)}];
// if( levelAndValue.value ) text =
// text.concat([{t:$42.t.new_level_value,scale:5,color:cc.color(128,128,0)} ,
// {t:levelAndValue.value,scale:10,color:cc.color(128,128,0)}]);
		if( blow.allwords ) {
			var wt = $42.wordTreasure;
			for( var i=0 ; i<42 /* wt.length */ ; i++ ) 
				text = text.concat([{t:(i+1)+" "+wt[0].word , scale:3 , color : cc.color(160 - ((i*7)%80), 0 + ((i*4)%40) , 0 + ((i*9)%100))}]);
		}
		
		if( blow.info ) {
			var lines = blow.info;
			for( var i=0 ; i<lines.length ; i++ ) text = text.concat([{t:lines[i],scale:2,color:cc.color(0,0,128)}]);			
		}
		
		for( var i=0 ; i<text.length ; i++ ) {
			var label = cc.LabelTTF.create(text[i].t, "res/fonts/American Typewriter.ttf", 160);
			label.setPosition(ml.size.width/2,ml.size.height/2);
			label.setScale(0,0);
			label.setColor(text[i].color);
			label.retain();
	        /* retain */ tmpRetain[label.__instanceId] = { name: "blow up word", line: 416 };	
			ml.addChild(label, 5);
			label.i = i;
			label.setRotation(8.57*i*2);
			label.runAction(
				cc.sequence(
					cc.delayTime(i * 0.44),
					cc.spawn(
						cc.scaleTo(3, text[i].scale),
						cc.fadeTo(3,0),
						cc.rotateBy(3,45,30)
					),
					cc.callFunc(function() {
				        this.release();
						delete tmpRetain[this.__instanceId];					        							
						ml.removeChild(this);
						if( cb && this.i === text.length-1 ) cb();
					}, label)
				)
			);
		}		
	};
	
	var deleteWordFromList = function(word) {
		var prefix = word.substr(0,3);
		// delete word from full word list
		var words = $42.words[prefix];
		for( var i=0 ; i<words.length ; i++ ) {
			if( words[i].word === word ) {
				words.splice(i,1);
				if( !words.length ) delete $42.words[word.substr(0,3)];
				return true;
			}
		}
		return false;
	};
	
	var showFullWordAndAsk = function( brc , word , rowsDeleted , cb ) {
		var width = word.length * $42.BS,
			height = $42.BS,
			x = $42.BOXES_X_OFFSET + brc.col * $42.BS + width/2,
			y = $42.BOXES_Y_OFFSET + brc.row * $42.BS + height/2;
		
		// create yellow frame sprite
		var wordFrameFrame  = cc.spriteFrameCache.getSpriteFrame("wordframe");
		
		var	wordFrameSprite = cc.Sprite.create(wordFrameFrame),
			rect = wordFrameSprite.getTextureRect();
		wordFrameSprite.retain();
        /* retain */ tmpRetain[wordFrameSprite.__instanceId] = { name: "words: wordFrameSprite", line: 446 };	
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
			sprite.retain();
	        /* retain */ tmpRetain[sprite.__instanceId] = { name: "words: sprite "+i, line: 461 };	
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
					sprite.retain();
			        /* retain */ tmpRetain[sprite.__instanceId] = { name: "multiplier "+j, line: 480 };	
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
	   					resume = function(menuLayer,takeWord) {
					        ml.resume();
					        ml.scheduleUpdate();
					        
					        // release and remove sprites
							s = sprite.getChildren();
					        for( var i=0 ; i<s.length ; i++ ) {
						        s[i].release();
								delete tmpRetain[s[i].__instanceId];					        	
					        }
					        sprite.release();
							delete tmpRetain[sprite.__instanceId];

							// remove sprites and layer
				            ml.getParent().removeChild(menuLayer);
					        sprite.removeAllChildren(true);
					        ml.getParent().removeChild(sprite);
					        
					        cb( takeWord );					        
	   					},
	   					menuItems = [{
	    					label: $42.t.take_word_yes, 
	    					cb: function(sender) {
	    						var self = this;
					            menuLayer.removeAllChildren();
	    						
// showWordTreasure(word, sprite, function() {
		    						resume(self,true);	    							
// });
	    			        }
	    				},{
	    					label: $42.t.take_word_no, 
	    					cb: function(sender) {
	    						resume(this,false);
	    			        }
	    				}];
	   				
	   				var menuLayer = new _42MenuLayer($42.t.take_word_question,menuItems); 
    	            ml.getParent().addChild( menuLayer , 2);

    	            if( ml.hookResumeAskForWord ) ml.hookResumeAskForWord( resume , menuLayer );
    	            
    				sprite = cc.Sprite.create(this.getTexture(),this.getTextureRect());
    				var children = this.getChildren(),
    					childSprites = [];
    				for( var i=0 ; i<children.length ; i++ ) {
    					childSprites[i] = cc.Sprite.create(children[i].getTexture(),children[i].getTextureRect());
    					childSprites[i].retain();
    			        /* retain */ tmpRetain[childSprites[i].__instanceId] = { name: "words: childSprites["+i+"] ", line: 548 };	
    					childSprites[i].setPosition(children[i].getPosition());
    					childSprites[i].setColor(children[i].getColor());
    					childSprites[i].setScale(children[i].getScale());

        				sprite.addChild(childSprites[i],2);    					
    				}
    				sprite.setPosition(this.getPosition());
    				sprite.retain();
			        /* retain */ tmpRetain[sprite.__instanceId] = { name: "words: sprite", line: 554 };	
    				sprite.setScale(0.95,0.95);
    				ml.getParent().addChild(sprite,2);
    				
    				// display value of word
    				var pos = childSprites[0].getPosition();
    				for( var i=0,sum=0,wordMul=1 ; i<word.length ; i++ ) {
        				var value = $42.letterValues[word[i]].value,
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
        				valueSprite.retain();
    			        /* retain */ tmpRetain[valueSprite.__instanceId] = { name: "words: value "+i, line: 565 };	
    			        valueSprite.setColor(cc.color(200,160,0));
    			        sprite.addChild(valueSprite, 5);	    					
    				}
    				var value = cc.LabelTTF.create($42.t.take_word_wordvalue+": "+sum*wordMul, "Arial", 48);
					value.setPosition(sprite.getTextureRect().width/2 , pos.y + $42.BS * 2 + 10);
					value.retain();
			        /* retain */ tmpRetain[value.__instanceId] = { name: "words: value ", line: 572 };	
					value.setColor(cc.color(200,160,0));
					sprite.addChild(value, 5);	
					
					// release and remove word sprite that is not visible any
					// more
			        var s = wordFrameSprite.getChildren();
			        for( var i=0 ; i<s.length ; i++ ) {
				        s[i].release();
						delete tmpRetain[s[i].__instanceId];					        	
			        }
			        wordFrameSprite.release();
					delete tmpRetain[wordFrameSprite.__instanceId];
			        wordFrameSprite.removeAllChildren(true);
			        ml.removeChild(wordFrameSprite);	  

        	        ml.pause();
        	        ml.unscheduleUpdate();

				}, wordFrameSprite)
			)
		));

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
		
		cc.log("42words, selectBestWord: Calling updateSelectedWord()");
		updateSelectedWord();
		
	};
	
	var moveSelectedWord = function(brc) {
		var sw = ml.selectedWord;
		
		if( sw ) {
			ml.boxes[sw.brc.row][sw.brc.col].markers = sw.markers;
			
			// delete old sprites
			if( sw.startMarker ) {
				sw.startMarker.release();
				delete tmpRetain[sw.startMarker.__instanceId];

				ml.removeChild( sw.startMarker );				
			}
			for( var i=0 ; i<sw.sprites.length ; i++ ) if( sw.sprites[i]  ) {
				sw.sprites[i].release();
				delete tmpRetain[sw.sprites[i].__instanceId];
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
				
				cc.log("42words, moveSelectedWord: calling updateSelectedWord()");
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
	        word.retain();
	        /* retain */ tmpRetain[word.__instanceId] = { name: "words", line: 669 };	
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
				this.release();
				delete tmpRetain[this.__instanceId];

	        	ml.removeChild(this);
	        },word)));
		}
	};
		
	var drawText = function(text,pos,size,color,parent,retain) {
		
		var label = cc.LabelBMFont.create( text , "res/fonts/amtype"+size+".fnt" , cc.LabelAutomaticWidth, cc.TEXT_ALIGNMENT_LEFT, cc.p(0, 0) );
		label.setPosition(pos);
		if( retain ) {
			label.retain();
	        /* retain */ tmpRetain[label.__instanceId] = { name: "label "+text, line: 769 };
		}
		label.setColor(color);
		parent.addChild(label, 5);	
		
		return label;
	};
	
	var drawWordSprite = function(word,pos,wordSprite,scale,parent,retain) {
		cc.assert(word !== undefined,"42words, drawWordSprite: No word to draw as a sprite.")
		
		if( !wordSprite ) {
			var wordFrameFrame  = cc.spriteFrameCache.getSpriteFrame("wordframe"),
				wordFrameSprite = cc.Sprite.create(wordFrameFrame),
				rect = wordFrameSprite.getTextureRect();
			if( retain ) {
				wordFrameSprite.retain();
		        /* retain */ tmpRetain[wordFrameSprite.__instanceId] = { name: "wordFrameSprite "+word, line: 782 };	
			}
			rect.width = word.length? word.length * $42.BS + $42.WORD_FRAME_WIDTH * 2 : 80;
			rect.height = word.length? $42.BS + $42.WORD_FRAME_WIDTH * 2 : 8;
			wordFrameSprite.setTextureRect(rect);
			wordFrameSprite.setPosition(pos.x,pos.y);
			wordFrameSprite.setScale(scale);
			parent.addChild(wordFrameSprite,4);
		} else {
			var wordFrameSprite = wordSprite,
				rect = wordFrameSprite.getTextureRect();
			rect.width = word.length? word.length * $42.BS + $42.WORD_FRAME_WIDTH * 2 : 80;
			rect.height = word.length? $42.BS + $42.WORD_FRAME_WIDTH * 2 : 8;
			wordFrameSprite.setTextureRect(rect);

			// release and remove old letters
			var ch = wordFrameSprite.getChildren();
			for( var i=0; i<ch.length ; i++ ) {
				ch[i].release();
				delete tmpRetain[ch[i].__instanceId];
			}
			wordFrameSprite.removeAllChildren(true);
		}
		// add sprites of word
		for( var i=0 ; i<word.length ; i++) {
			
			var file = $42.LETTER_NAMES[$42.LETTERS.indexOf(word[i])],
				spriteFrame = cc.spriteFrameCache.getSpriteFrame(file),
				sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,$42.BS,$42.BS));
			sprite.setPosition($42.BS/2+i*$42.BS+$42.WORD_FRAME_WIDTH,$42.BS/2+$42.WORD_FRAME_WIDTH);
			if( retain ) {
				sprite.retain();
		        /* retain */ tmpRetain[sprite.__instanceId] = { name: "wordFrameSprite sprite "+word[i], line: 805 };	
			}
			wordFrameSprite.addChild( sprite );
		}		
		
		return wordFrameSprite;
	}

	var drawLetterBoxes = function(options) {
		// first delete old boxes if there some
		var wpl = $42.wordProfileLetters,
			dpl = $42.displayedProfileLetters,
			dplm = $42.displayedProfileLettersMini,
			boxes = options.boxesPerRow * options.boxesPerCol;
		
		for( var i=0 ; i<dpl.length ; i++ ) {
			var children = dpl[i].getChildren();
			children[0].release();			
			children[1].release();			
			dpl[i].release();
			delete tmpRetain[children[0].__instanceId];
			delete tmpRetain[children[1].__instanceId];
			delete tmpRetain[dpl[i].__instanceId];
			if( i==0 && wpl.length - dplm.length > boxes ) {
				cc.assert(dpl.length === boxes, "42words, drawLetterBoxes: Cannot take out box when display is not full.")
				dplm.push(dpl[0]);
				dpl[0].removeChild(children[1]);
				continue;
			}
			options.parent.removeChild(dpl[i]);
		}
		dpl = [];
		
		// fill display with letter boxes (two rows)
		for( var i=0 ; i<Math.min(boxes,wpl.length) ; i++ ) {
			// create sprite frame
			var letterFrameFrame  = cc.spriteFrameCache.getSpriteFrame("wordframe"),
				letterFrameSprite = cc.Sprite.create(letterFrameFrame),
				rect = letterFrameSprite.getTextureRect();
			letterFrameSprite.retain();
	        /* retain */ tmpRetain[letterFrameSprite.__instanceId] = { name: "letterFrameSprite (i="+i+": "+wpl[i+Math.max(0,wpl.length-boxes)]+")", line: 850 };	
			rect.width  = ($42.BS + $42.WORD_FRAME_WIDTH*2) * options.scale;
			rect.height = ($42.BS + $42.WORD_FRAME_WIDTH*2) * options.scale;
			letterFrameSprite.setTextureRect(rect);
			letterFrameSprite.setPosition(options.pos.x + ((i%options.boxesPerRow>>>0)*($42.BS+options.padding*4))*options.scale,
										  options.pos.y - ((i/options.boxesPerRow>>>0)*($42.BS+options.padding))*options.scale);
			options.parent.addChild(letterFrameSprite,4);
			dpl.push(letterFrameSprite);
			
			// draw letter
			var letter = wpl[i+Math.max(0,wpl.length-boxes)],
				file = $42.LETTER_NAMES[$42.LETTERS.indexOf(letter)],
				spriteFrame = cc.spriteFrameCache.getSpriteFrame(file),
				sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,$42.BS,$42.BS)),
				pos = cc.p(($42.BS/2+$42.WORD_FRAME_WIDTH)*options.scale,
						   ($42.BS/2+$42.WORD_FRAME_WIDTH)*options.scale);
			sprite.setPosition(pos);
			sprite.setScale(options.scale);
			sprite.retain();
	        /* retain */ tmpRetain[sprite.__instanceId] = { name: "letterFrameSprite sprite "+letter, line: 870 };	
			letterFrameSprite.addChild( sprite );
			
			// draw value
			var label = cc.LabelBMFont.create( $42.letterValues[letter].value , "res/fonts/amtype24.fnt" , cc.LabelAutomaticWidth, cc.TEXT_ALIGNMENT_LEFT, cc.p(0, 0) );
			label.setPosition(pos.x+30,pos.y);
			label.retain();
	        /* retain */ tmpRetain[label.__instanceId] = { name: "label "+$42.letterValues[letter].value , line: 878 };
			label.setColor(cc.color(255,255,255,255));
			letterFrameSprite.addChild(label, 5);	
		}		
		
		// move mini letter boxes
		for( var i=0 ; i<dplm.length ; i++ ) {
			var posX = options.pos.x + i*($42.BS+options.padding*2)/2*options.scale;
			var posY = options.pos.y + $42.BS/2*options.scale;	
			dplm[i].setPosition(options.pos.x - $42.BS/2*options.scale + i*($42.BS+options.padding*2)/2*options.scale,
		  			options.pos.y + $42.BS*options.scale);	
			dplm[i].setScale(0.5);
		}
		
		// let the last box blink when it changed
		while( $42.newWordProfileLetter ) {
			dpl[dpl.length-$42.newWordProfileLetter--].runAction(cc.sequence(cc.delayTime(options.delay),cc.blink(3.5,5)));
		}
			
		$42.displayedProfileLetters = dpl;
		
		return letterFrameSprite;
	}
	
	var drawScoreBar = function(highlight) {
		var sb = ml.scoreBar,
			wt = $42.wordTreasure,
			tv = $42.wordTreasureValue,
			bw = $42.wordTreasureBestWord,
			wpl = $42.wordProfileLetters,
			rl = $42.rollingLayer;
		
		if( !sb ) {
			
		    // create score bar
		    var sb = ml.scoreBar = new cc.LayerColor(cc.color(128,0,0,0),ml.size.width,$42.BOXES_Y_OFFSET),
				len = bw? bw.word.length : 0;

		    sb.setPosition(0,0);
		    sb.setOpacity(0);
			sb.retain();
	        /* retain */ tmpRetain[sb.__instanceId] = { name: "scorebar", line: 835 };	
			ml.addChild(sb, 5);
			
			// draw clipping rect with stencil and rolling layer
	        var clipper = cc.ClippingNode.create();
	        clipper.width = 640;
		    clipper.height = $42.BOXES_Y_OFFSET;
	        clipper.anchorX = 0.5;
	        clipper.anchorY = 0.5;
	        clipper.x = 320;
	        clipper.y = $42.BOXES_Y_OFFSET / 2;
	        // stencil
	        var stencil = cc.DrawNode.create(),
	        	rectangle = [
	        	    cc.p(0, 0),
	        	    cc.p(clipper.width, 0),
		            cc.p(clipper.width, clipper.height),
		            cc.p(0, clipper.height)
		        ],
		        white = cc.color(255, 255, 0, 0);
	        
	        stencil.drawPoly(rectangle, white, 1, white);
	        clipper.stencil = stencil;
	        sb.addChild(clipper);
	        // rolling layer
			rl = $42.rollingLayer = new cc.Layer();
			rl.setPosition(0,0);
			rl.retain();
	        /* retain */ tmpRetain[rl.__instanceId] = { name: "rolling layer", line: 865 };	
			clipper.addChild(rl, 5);

			drawLetterBoxes({
				pos : cc.p(
					20,
					wpl.length>$42.SCOREBAR_LETTERS_PER_ROW*$42.SCOREBAR_LETTERS_PER_COL? 56 : 68
				),
				scale : $42.SCOREBAR_LETTERS_SCALE,
				padding : $42.SCOREBAR_LETTERS_PADDING,
				boxesPerRow: $42.SCOREBAR_LETTERS_PER_ROW,
				boxesPerCol: $42.SCOREBAR_LETTERS_PER_COL,
				parent : rl
			});
			
			// draw points, right, front side
			ml.score_words_mini = drawText("(0 "+$42.t.scorebar_words[1]+")", cc.p(558,15) , 24 , $42.SCORE_COLOR_BRIGHT , rl , true);
			ml.score_points = drawText(tv.toString(), cc.p(558,60) , tv>=1000?56:72 , $42.SCORE_COLOR_BRIGHT , rl , true);

			// draw total words, left, back side
			ml.score_words_label = drawText($42.t.scorebar_words[1] , cc.p(50,111) , 24 , $42.SCORE_COLOR_DIMM , rl , true);
			ml.score_words = drawText(wt.length.toString(),cc.p(50,151) , 72 , $42.SCORE_COLOR_BRIGHT , rl , true);
			
			// draw highscore into clipper
			drawText($42.t.scorebar_highscore,cc.p(553,111),24,$42.SCORE_COLOR_DIMM,rl,false);			
			ml.highscore = drawText($42.maxPoints.toString(),cc.p(553,151),$42.maxPoints>=1000?56:72,$42.SCORE_COLOR_BRIGHT,rl,true);	
			
			// draw most valuable word
			ml.bestWordValue = drawText($42.t.scorebar_mvw,cc.p(300,111),24,$42.SCORE_COLOR_BRIGHT,rl,true);
			ml.bestWordSprite = drawWordSprite(bw? bw.word:"",cc.p(300,157),ml.bestWordSprite,0.60,rl,true);							
		} else {
			ml.score_words_label.setString($42.t.scorebar_words[wt.length===1?0:1]);
			ml.score_words.setString(wt.length);
			ml.score_points.setString(tv.toString());
			ml.score_words_mini.setString("("+wt.length+" "+$42.t.scorebar_words[wt.length===1?0:1]+")");

			ml.highscore.setString($42.maxPoints.toString());
			ml.bestWordValue.setString($42.t.scorebar_mvw+ (bw?": "+bw.value:""));
			ml.bestWordSprite = drawWordSprite(bw? bw.word:"",cc.p(300,157),ml.bestWordSprite,0.60,rl,true);

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
			case "maxPoints": 
				ml.highscore.runAction(cc.blink($42.SCOREBAR_ROLLING_LAYER_DELAY - 0.5,3));
				break;
			case "bestWord": 
				ml.bestWordSprite.runAction(cc.blink($42.SCOREBAR_ROLLING_LAYER_DELAY - 0.5,3));
				break;
			}
		}
	};

	var moveRollingLayer = function(stage, delay) {

		if( !ml.layerIsRolling ) {
			if( stage === ml.rollingLayerStage ) return;
			if( stage != undefined ) ml.rollingLayerStage = stage;
			else {
				ml.rollingLayerStage = 1-ml.rollingLayerStage;
			}
		
			ml.layerIsRolling = true;
			$42.rollingLayer.runAction(
				cc.EaseSineOut.create(
					cc.moveTo(1,cc.p(0,-ml.rollingLayerStage*$42.BOXES_Y_OFFSET))
				)
			);
			if( ml.rollingLayerDelay ) {
				$42.rollingLayer.stopAction(ml.rollingLayerDelay);
			}
			ml.rollingLayerDelay = $42.rollingLayer.runAction(
				cc.sequence( 
					cc.delayTime(delay || 1),
					cc.callFunc(function() {
						ml.layerIsRolling = false;
						ml.rollingLayerDelay = null;
					})
				)
			);
			
		}
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
			if( !$42.newWordProfileLetter ) $42.newWordProfileLetter = 0; 
			$42.newWordProfileLetter++;
			
			getNextProfileLetters();
		}
	};
	
	var getNextProfileCandidate = function() {
		if( ml.nextProfileLetterCnt === undefined ) ml.nextProfileLetterCnt = 0; 
		
		if( ++ml.nextProfileLetterCnt === $42.NEXT_PROFILE_LETTER_CNT ) {
			ml.nextProfileLetterCnt = 0;

			var npl = $42.nextProfileLetters;
			if( npl.length > 1 ) npl.splice(npl.length-1,1);
			cc.log("42words, getNextProfileCandidate: New next letter: "+npl[npl.length-1].letter);			
		}
	};
	
	var setNextMultiplier = function() {
		var m = ml.multipliers;
		
		if( m.length >= $42.MAX_MULTIPLIERS ) return;
		
		var mul = $42.MULTIPLIER[ml.nextMultiplier],
			sprite = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("multiplier"+mul[0]+mul[1]),cc.rect(0,0,$42.BS,$42.BS));
		sprite.retain();
        /* retain */ tmpRetain[sprite.__instanceId] = { name: "multiplier"+mul[0]+" "+mul[1], line: 1079 };	

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
		coin.retain();
		/* retain */ tmpRetain[coin.__instanceId] = { name: "coin", line: 741 };	
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
					this.release();
					delete tmpRetain[this.__instanceId];
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
        	wt = $42.wordTreasure = [];
        
        $42.wordTreasureValue = 0;
		$42.tutorialsDone = ls.getItem("tutorialsDone") || 0;
		
// ml.hookStartProgram( 2 , false );
// ml.hookStartProgram( 0 , true );
		if( ml.hookStartProgram && $42.tutorialsDone < 1 ) ml.hookStartProgram( 0 , true );	
		else if( ml.hookStartProgram ) ml.hookStartProgram( 2 , false );

		ml.levelsToBlow = [];
		ml.add1and3s = [];
		ml.totalPoints = 0;
		ml.rollingLayerStage = 0;
		ml.nextMultiplier = 0;
		ml.multipliers = [];
		ml.dontAutoSelectWord = false;
		ml.timeCounter = 0;
		ml.nextTimeoutWarning = 0;
		
		for( var i=1,bw=0 ; i<wt.length ; i++ ) if( wt[i].value > wt[bw].value ) bw = i;
		$42.wordTreasureBestWord = wt[bw] || null;
// $42.maxWordValue = $42.wordTreasureBestWord? $42.wordTreasureBestWord.value :
// 4;

		// prepare for which letters can be used (word profile), and what
		// letters will be next
		$42.wordProfile = (1<<0) + (1<<1) + (1<<2) + (1<<3) + (1<<4) + (1<<5) + (1<<6); // start
																						// profile
																						// with
																						// first
																						// 7
																						// letters
		$42.wordProfileLetters = [];
		$42.displayedProfileLetters = [];
		$42.displayedProfileLettersMini = [];
		for( var i=0 ; i<7 ; i++ ) $42.wordProfileLetters.push($42.letterOrder[i]);
		getNextProfileLetters();
		
		// remove all words that are already in the treasure
		for( var i=0 ; i<wt.length ; i++) {
			var prefix = wt[i].word.substr(0,3);
				words = $42.words[prefix];
			for( var j=words? words.length-1 : 0 ; words && j>=0 ; j-- ) {
				if( words[j].word === wt[i].word ) {
					words.splice(j,1);
					if( words.length === 0 ) {
						delete $42.words[prefix];
					}
					break;
				}				
			}
		}
		
		// draw two plus buttons
        var item = cc.MenuItemImage.create(cc.spriteFrameCache.getSpriteFrame("plus1"), cc.spriteFrameCache.getSpriteFrame("plus1highlit"), function() {
            	ml.add1and3s.push("1");        		
        } , ml);
        item.setOpacity($42.PLUS1_BUTTON_OPACITY);
        ml.plus1Button = cc.Menu.create( item );
        ml.plus1Button.x = $42.PLUS1_BUTTON_X;
        ml.plus1Button.y = $42.PLUS1_BUTTON_Y;
        ml.plus1Button.retain();
        /* retain */ tmpRetain[ml.plus1Button.__instanceId] = { name: "plus1Button", line: 1010 };	
        ml.addChild(ml.plus1Button,10);

        var item = cc.MenuItemImage.create(cc.spriteFrameCache.getSpriteFrame("plus3"), cc.spriteFrameCache.getSpriteFrame("plus3highlit"), function() {
        	ml.add1and3s.push("3");        		
        } , ml);
        item.setOpacity($42.PLUS3_BUTTON_OPACITY);
        ml.plus3Button = cc.Menu.create( item );
        ml.plus3Button.x = $42.PLUS3_BUTTON_X;
        ml.plus3Button.y = $42.PLUS3_BUTTON_Y;
        ml.plus3Button.retain();
        /* retain */ tmpRetain[ml.plus3Button.__instanceId] = { name: "plus3Button", line: 1025 };	
        ml.addChild(ml.plus3Button,10);
		
		drawScoreBar();
	};
	
	_42Layer.hookEndGame = function() {
		// deselect word
		this.unselectWord();

		// delete scorebar
		var releaseChildren = function(sprite) {
			if( sprite ) {
				var ch = sprite.getChildren();
				for( var i=0 ; i<ch.length ; i++ ) {
					ch[i].release();
					delete tmpRetain[ch[i].__instanceId];
				}			
			}
		};
		
		var releaseSprite = function(sprite) {
			sprite.release();
			delete tmpRetain[sprite.__instanceId];
		};
		
		var sb = this.scoreBar,
			rl = $42.rollingLayer,
			dpl = $42.displayedProfileLetters;
		releaseChildren( ml.bestWordSprite );
		releaseSprite( ml.bestWordSprite );
		for( var i=0 ; i<dpl.length ; i++ ) {
			releaseChildren( dpl[i] );
			releaseSprite( dpl[i] );
		}
		releaseSprite(ml.highscore);
		releaseSprite(ml.bestWordValue);
		releaseSprite(ml.score_words_mini);
		releaseSprite(ml.score_points);
		releaseSprite(ml.score_words_label);
		releaseSprite(ml.score_words);
		releaseSprite(rl);
		releaseSprite(sb);

		sb.removeAllChildren(true);
		
		// release plus1 and plus3
		ml.plus1Button.release();
		delete tmpRetain[ml.plus1Button.__instanceId];
		ml.plus3Button.release();
		delete tmpRetain[ml.plus3Button.__instanceId];
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
		
		if( ml.hookGetProgrammedTile ) nextTile = ml.hookGetProgrammedTile();
		
		return nextTile? 								nextTile.tile : 
			   ml.add1and3s && ml.add1and3s.length? 	(ml.add1and3s.splice(0,1)[0] === "1"? 7 : 8) :
					   									ml.getRandomValue($42.TILE_OCCURANCES);
	};

	/*
	 * hookSetTileImages
	 * 
	 * Called while building a tile to set the images of the tile boxes
	 * 
	 * Param: tileBoxes: metrics of the boxes
	 * 
	 */
	_42Layer.hookSetTileImages = function(tileBoxes, newTile, p, userData) {

		var tileSprite = cc.Sprite.create(res.letters_png,cc.rect(0,0,0,0));
				
		tileSprite.retain();
        tmpRetain[tileSprite.__instanceId] = { name: "words: tileSprite", line: 997 };
		tileSprite.setPosition(p);
		ml.addChild(tileSprite,2);

		// is to be replaced for cypherpunk mode
// if( nextTile === null && tileBoxes.length === 3 ) {
// cc.assert($42.maxWordValue >= 4 && $42.maxWordValue <= 42 &&
// $42.prefixValues[$42.maxWordValue], "42 Words, _42Layer.hookSetTileImages:
// Wrong $42.maxWordValue or no prefixes.")
// var prefs = $42.prefixValues[$42.maxWordValue];
// nextTile = {
// "tile": 8,
// "letters": prefs[Math.floor(Math.random()*prefs.length)]
// }
// }
		
        // add single boxes with letters to the tile
        for( var i=0 ; i<tileBoxes.length ; i++) {
        	
        	var sw = ml.selectedWord;
        	if( nextTile !== null ) {
        		var val = $42.LETTERS.indexOf(nextTile.letters[i]);
        	} else {
	         	var len = sw && sw.missingLetters && sw.missingLetters.length || 0,
         			prob = len <= 3? $42.NEEDED_LETTERS_PROBABILITY / (5-len) : $42.NEEDED_LETTERS_PROBABILITY; 
        		while( true ) {
	         		val = (Math.random()>prob || !sw || !len)?  
	         					Math.floor(this.getRandomValue($42.letterOccurences)):
	        					$42.LETTERS.indexOf(sw.missingLetters[Math.floor(Math.random()*sw.missingLetters.length)]);        			
	         					
	         		// no double letters
	        	    for( k=0,double=0 ; k<i ; k++ ) 
	        	    	if( userData[k] === $42.LETTERS[val] ) double++;
	        	    if( double > 1 ) continue;
	        	    
	         		if( $42.letterValues[$42.LETTERS[val]].value <= $42.maxWordValue - 3 ) break;		
	         		if( $42.wordProfileLetters.indexOf($42.LETTERS[val]) > -1 ) break;	
	         		
	         		cc.log("42words, hookSetTileImages: Got a not allowed letter: "+$42.LETTERS[val]+" for box "+i+". Skipping it ...");
        		}
        	}
       					
    		var	spriteFrame = cc.spriteFrameCache.getSpriteFrame($42.LETTER_NAMES[val]),
    			sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,$42.BS,$42.BS));
    		
    		cc.assert(sprite, "42words, hookSetTileImages: sprite must not be null. (var = "+val+", name="+$42.LETTER_NAMES[val]+" )");
    		if( !sprite ) cc.log("42words, hookSetTileImages: sprite must not be null. (var = "+val+", name="+$42.LETTER_NAMES[val]+" )");
    		sprite.retain();
	        tmpRetain[sprite.__instanceId] = { name: "words: sprite", line: 1038 };
        	sprite.setPosition(cc.p(tileBoxes[i].x,tileBoxes[i].y));
        	sprite.setRotation(-$42.INITIAL_TILE_ROTATION);
        	userData[i] = $42.LETTERS[val];
        	
	        tileSprite.addChild(sprite);
        }

        // tile was used, so delete it
        nextTile = null;
        
        return tileSprite;
	};	
	
	_42Layer.hookTileFixed = function( brcs ) {
		
		ml.lastBrcs = brcs;
		
		for( i=0 ; i<brcs.length ; i++ ) if( brcs[i].row > $42.PLUS1_BUTTON_TOPROW ) break;
		if( !ml.plus1ButtonVisible && i < brcs.length && ml.totalPoints >= $42.PLUS1_BUTTON_COST ) {
			ml.plus1ButtonVisible = true;
			ml.plus1Button.runAction(cc.EaseSineIn.create(cc.moveBy(0.75,cc.p(0, -100))));
		} else if( ml.plus1ButtonVisible && (i === brcs.length || ml.totalPoints <= $42.PLUS1_BUTTON_COST) ) {
			ml.plus1ButtonVisible = false;
			ml.plus1Button.runAction(cc.EaseSineOut.create(cc.moveBy(0.75,cc.p(0, 100))));					
		}
		
		setSelections();
		return updateSelectedWord();
	};	

	_42Layer.hookTileFixedAfterRowsDeleted = function( ) {

		if( !ml.selectedWord && !ml.dontAutoSelectWord ) selectBestWord();

		var ls = cc.sys.localStorage;
		
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
		} else if( tapPos.y < $42.BOXES_Y_OFFSET ) {
			moveRollingLayer(undefined,3);
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
		
		var minutes = ++ml.timeCounter / 3600,
			warning = $42.t.timeout_warning[ml.nextTimeoutWarning];
		
		if( warning && minutes > $42.MAX_PLAYING_TIME - warning.time ) {
			blowLevelAndWordValue({info:[warning.text]});
			ml.nextTimeoutWarning++;
		}
		
		if( !ml.timeIsUp && minutes > $42.MAX_PLAYING_TIME ) {
			ml.timeIsUp = true;
	        ml.pause();
	        ml.unscheduleUpdate();
			blowLevelAndWordValue({info:$42.t.timeout_text}, function() {
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
	            	    $42.t.timeout_message,
	            	    $42.t.won_word_value+": "+$42.wordTreasureValue+($42.wordTreasureValue === $42.maxPoints?" ("+$42.t.won_highscore+")":""),
	            	    $42.t.won_word_treasure+": "+$42.wordTreasureWords
	            	],menuItems), 1
	            );
			});
		}
		
		if( ml.hookMurbiksUpdate ) ml.hookMurbiksUpdate(dt);
					
		if( !ml.layerIsRolling && ml.rollingLayerStage != 0 ) moveRollingLayer(0);
		
		// tutorial 2 starts >= 750
		if( ml.totalPoints >= 750 && !ml.wordIsBeingSelected && ml.hookStartProgram && $42.tutorialsDone < 2 ) {
			$42.tutorialsDone = 2;
			ml.hookStartProgram( 1 , true );	
		}
		
/*
 * // show plus 3 button if score is high enough if( !ml.plus3ButtonVisible &&
 * $42.wordTreasureBestWord && ($42.wordTreasureBestWord.value >= 40 ||
 * ml.totalPoints >= $42.LEVEL_SCORE[bw.value+2]) ) { ml.plus3ButtonVisible =
 * true; ml.plus3Button.runAction(cc.EaseSineIn.create(cc.moveBy(0.75,cc.p(0,
 * -100)))); } else if( ml.plus3ButtonVisible && $42.wordTreasureBestWord &&
 * ml.totalPoints <= $42.LEVEL_SCORE[$42.wordTreasureBestWord.value+2] ) {
 * ml.plus3ButtonVisible = false;
 * ml.plus3Button.runAction(cc.EaseSineOut.create(cc.moveBy(0.75,cc.p(0,
 * 100)))); }
 */
		
// if( !ml.levelsToBlowCnt && ml.levelsToBlow && ml.levelsToBlow.length ) {
// ml.levelsToBlowCnt = $42.LEVELS_TO_BLOW_CYCLES;
//			
// blowLevelAndWordValue(ml.levelsToBlow.splice(0,1)[0]);
//			
// } else if( ml.levelsToBlowCnt ) {
// ml.levelsToBlowCnt--;
// } else {
// }
	};
	
	// call tutorial module if available
	if( typeof MURBIKS_MODULE === 'function' ) MURBIKS_MODULE(ml);
};

$42.loadLanguagePack = function( pack ) {
	
	cc.log("42words, loadLanguagePack: STARTING LOADING ...");
	var filename = i18n_language_packs[pack];
	cc.loader.loadJson("res/i18n/"+filename, function(err, json) {
		if( !err ) {
			cc.log("42words, loadLanguagePack: ... LOADED LANGUAGE PACK, GOING ON ...");
			var lg = $42.languagePack = json;
			$42.t = lg.apptext;
			
			cc.loader.loadJson("res/words/"+lg.wordlist+".words.json", function(err, json) {
				if( !err ) {
					cc.log("42words, loadLanguagePack: ... LOADED WORDS, GOING ON ...");
					$42.words = json;

					cc.loader.loadJson("res/words/"+lg.wordlist+".letters.json", function(err, json) {
						if( !err ) {
							cc.log("42words, loadLanguagePack: ... LOADED LETTERS!");
							var lv = $42.letterValues = json,
								l = $42.LETTERS;
							// get the most common
							var max=0;
							for( letter in lv ) {
								max=Math.max(max,lv[letter].value);
							}

							$42.letterOccurences = [];
							$42.letterOrder = [];
							for( var i=0 ; i<l.length ; i++ ) {
								cc.log("42words, loadLanguagePack: letter: "+l[i]+" ...");
								var occ = lv[l[i]] && parseInt(1/lv[l[i]].value*max),
									order = lv[l[i]] && lv[l[i]].order;
								cc.log("42words, loadLanguagePack: ... order: "+order);
								$42.letterOccurences[i] = occ || 0; 
								if( order !== undefined ) $42.letterOrder[order] = l[i];
							}
						} else {
							throw err;
						}
					});
					
					cc.loader.loadJson("res/words/"+lg.wordlist+".prefixes.json", function(err, json) {
						if( !err ) {
							cc.log("42words, loadLanguagePack: ... LOADED PREFIX VALUES!");
							$42.prefixValues = json;
						} else {
							throw err;
						}
					});
					
					// check if word file is compatible
					for( var prefix in json ) {
						var words = json[prefix];
						cc.assert(words && words[0].word, "42words, json loader: Prefix "+prefix+" has no words.");
						for( var j=0 ; j<words.length ; j++ ) {
							cc.assert(words[j].word.length >=4 && words[j].word.length <= $42.BOXES_PER_ROW, 
									"42words, json loader: Word '"+words[j].word+"' has wrong length.");	
						}
					}
				} else {
					throw err;
				}
			});
		} else {
			throw err;
		}
	});
};


// read json file with words
if( !$42.languagePack ) {
	// GERMAN
	$42.loadLanguagePack(0);
	$42.TITLE_WORDS = "WORTE";
	$42.TITLE_WORDS_OFFSETS = [0,0,10,0,10];	
	$42.TITLE_START_GAME = "SPIEL STARTEN";
	$42.TITLE_SCORE = "Höchste Punktzahl";
	$42.TITLE_TREASURE = "Wortschatz";
	$42.TITLE_BEST_TIME = "Bestzeit";
	// ENGLISH
// $42.loadLanguagePack(1);
// $42.TITLE_WORDS = "WORDS";
// $42.TITLE_START_GAME = "START GAME";
// $42.TITLE_SCORE = "WORD VALUE";
	// ESTONIAN
// $42.loadLanguagePack(2);
// $42.TITLE_WORDS = "WORTE";
// $42.TITLE_START_GAME = "SPIEL STARTEN";
// $42.TITLE_SCORE = "WORTWERT";
	// SWEDISH
// $42.loadLanguagePack(3);
// $42.TITLE_WORDS = "ORDEN";
// $42.TITLE_START_GAME = "START";
// $42.TITLE_SCORE = "ORD VÄRDE";
}
