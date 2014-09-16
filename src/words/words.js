/* Enhancement module for 42 WORDS
 * 
 * NEXT STEPS:
 * 
 * + FEHLER
 * 
 * FEHLER AM ENDE -- MENU WIRD NICHT GEÖFFNET
 * 
 * + GAMEPLAY
 * 
 * + WORTSCHATZ
 * - show wortschatz
 * 
 * + INTERNATIONALIZATION
 * - english words
 * - multilingual programs
 * 
 * + IPHONE
 * 
 * 
 * + STABILIZATION
 * - load images and words before game start ...
 * - retain ...
 * 
 * 
 * + SPHINX-MODE
 * Diamonds:
 * 
 * White:
 * Blue:
 * Red:
 * Purple:
 * Pink:
 * Green:
 * 
 */

// $42.LETTER_NAMES and $42.LETTERS must have corresponding elements 
$42.LETTER_NAMES = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","ae","oe","ue","6","ao","1","3"],
$42.LETTERS =      ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","Ä" ,"Ö" ,"Ü" ,"Õ","Å" ,"1","3"],
$42.LEVEL_SCORE = [ undefined, undefined, undefined, undefined,  500,  1000,  2000,  4000,  6000,  8000, 10000,
                      12000, 15000, 20000, 25000, 30000, 35000, 40000, 50000, 60000, 70000,
                      80000, 90000,100000,110000,125000,140000,155000,170000,185000,200000,
                     220000,240000,260000,280000,300000,320000,340000,360000,380000,400000,
                     425000,450000,10000000,100000000
                   ];
$42.MARKER_SET = 1;
$42.MARKER_OPT = 2;
$42.MARKER_SEL = 3;
$42.START_MARKER_X_OFFSET = -18;
$42.START_MARKER_Y_OFFSET = $42.BS/2;
$42.MARKER_X_OFFSET = $42.BS/2;
$42.MARKER_Y_OFFSET = -25;
$42.UNSELECTED_BOX_OPACITY = 100;
$42.NEEDED_LETTERS_PROBABILITY = 0.5;
$42.MAX_LETTERS_BLOWN = 20;
$42.WORD_FRAME_WIDTH = 8;
$42.WORD_FRAME_MOVE_TIME = 0.8;
$42.SCORE_ROW_MULTIPLYER = 0.25;
$42.SCORE_WORD_MULTIPLYER = 7;
$42.SCORE_COLOR_DIMM = cc.color(160,120,55);
$42.SCORE_COLOR_BRIGHT = cc.color(240,170,70);
$42.POINTS_TO_ADD_CYCLES = 3;
$42.POINTS_TO_ADD_BLOW_UP = -1;
$42.LEVELS_TO_BLOW_CYCLES = 30;
$42.PLUS1_BUTTON_X = 130;
$42.PLUS1_BUTTON_Y = 1200;
$42.PLUS1_BUTTON_COST = 1000;
$42.PLUS1_BUTTON_TOPROW = 10;
$42.PLUS1_BUTTON_OPACITY = 170;
$42.PLUS3_BUTTON_X = 490;
$42.PLUS3_BUTTON_Y = 1200;
$42.PLUS3_BUTTON_COST = 10000;
$42.PLUS3_BUTTON_OPACITY = 170;


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
					//ml.wordCandidates = ml.wordCandidates.concat(words);
					box.words = words;
					// don't show selections in the row of the selected word
					if( sw && sw.brc.row === i ) return;
					
					var newPrefix = words[0].word.substring(0,3);

					for( var k=0 ; k<3 ; k++ ) {
						var box1 = ml.boxes[brc.row][brc.col+k];
						if( box1.sprite ) box1.sprite.setOpacity(255);
						if( newPrefix != oldPrefix ) {
							box1.sprite.runAction(cc.blink(0.5,3));
						}
					}
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
			});
		}

		if( !(ml.boxes[brc.row][brc.col] && ml.boxes[brc.row][brc.col].words) && words.length && cb ) {

			for( var i=words.length-1 ; i>=0 ; i-- ) {
				if( brc.col + words[i].word.length > $42.BOXES_PER_ROW || words[i].value > $42.maxWordValue ) {
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
		
		setMarkerFrame[0] = cc.spriteFrameCache.getSpriteFrame("marker0-0");
		setMarkerFrame[1] = cc.spriteFrameCache.getSpriteFrame("marker0-1");
		
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
		// First look for all words that are still possible, looking at the markers set
		var curWords = sw.words.slice(),
			missingLetters = "";
		for( var i=sw.brc.col ; i<$42.BOXES_PER_ROW ; i++) {
			var col = i-sw.brc.col;
			if( sw.markers[col] === $42.MARKER_SEL ) {
				var letter = ml.boxes[sw.brc.row][i].userData;
				// take out all words that don't match the letters where markers are set
				for( var j=curWords.length-1 ; j>=0 ; j-- ) {
					if( curWords[j].word[col] != letter ) curWords.splice(j,1);
				}
			}
		}
		// if no words are found with currently selected markers, than the last fitting word was removed
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
				sw.sprites[col] = cc.Sprite.create(
					setMarkerFrame[Math.floor(Math.random()*setMarkerFrame.length)],
					cc.rect(0,0,$42.BS,$42.BS)
				);
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
				// letter in box matches with some words, draw marker option sprite
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
						for( var j=0, value=0 ; j<word.length ; j++ ) {
							// calculate points and let them fly ...
							var v = $42.letterValues[word[j]],
								points = parseInt(v * $42.maxWordValue * $42.SCORE_WORD_MULTIPLYER * ((sw.brc.row*$42.SCORE_ROW_MULTIPLYER)+1));
							value += v;
							addPoints(points, cc.p($42.BOXES_X_OFFSET + (sw.brc.col+j) * $42.BS + $42.BS/2, $42.BOXES_Y_OFFSET + sw.brc.row * $42.BS + $42.BS), true);							
						}
						// put word into treasure
						var ls = cc.sys.localStorage,
							w = {
								word: word,
								value: value
							};
						$42.wordTreasure.push(w);
						if( !$42.wordTreasureBestWord || $42.wordTreasureBestWord.value < w.value ) {
							$42.wordTreasureBestWord = w;
							
							if( ml.totalPoints >= $42.LEVEL_SCORE[w.value] ) {

								if( $42.maxWordValue <= 42 ) {
									$42.maxWordValue++;
									ml.levelsToBlow.push({ level: null, value: $42.maxWordValue});
								} else if( !$42.youWonTheGame ) {
									youWonTheGame();
								}
								
								drawScoreBar(true);
							} else {
								// show that there are not enough points after all points are counted 
								ml.pointsToAdd.push( $42.POINTS_TO_ADD_BLOW_UP ); 
							}
						}
						ml.unselectWord();
						ml.checkForAndRemoveCompleteRows(row);
						
						cc.log("42words, updateSelectedWord, takeWord = true: setSelection()");
						setSelections();
						drawScoreBar(true);

						ls.setItem("wordTreasure" , JSON.stringify($42.wordTreasure));
					} else {
						ml.checkForAndRemoveCompleteRows();
						cc.log("42words, updateSelectedWord, takeWord = false: setSelection()");
						ml.unselectWord();
						setSelections();
						moveSelectedWord(sw.brc);
						drawScoreBar(true);
					}
				});

				return true; // a word was found
			}
		}
		
		return false;
	};
	
	var youWonTheGame = function() {
		
		blowLevelAndWordValue({win:true}, function() {
			var menuItems = [{
				label: $42.t.won_continue, 
				cb: function(sender) {
			        ml.resume();
			        ml.scheduleUpdate();

			        /* must be tested */ this.exitMenu();
		            this.getParent().removeChild(this);
		        }
			},{
				label: $42.t.won_end_game, 
				cb: function(sender) {
					if( self.hookEndGame ) self.hookEndGame();
					/* must be tested */ ml.endGame();
		        	cc.director.runScene(new _42Scene());
		        }
			}];
            ml.getParent().addChild(
            	new _42MenuLayer("Du hast gewonnen!",menuItems),
            	2);
	        ml.pause();
	        ml.unscheduleUpdate();
		});		
	};
	
	var blowLevelAndWordValue = function(levelAndValue,cb) {
		
		var text = [];
		
		if( levelAndValue.level ) text = [{t:$42.t.new_level_level,scale:5,color:cc.color(0,128,0)} , 
		                        {t:levelAndValue.level,scale:10,color:cc.color(0,160,0)}];
		if( levelAndValue.value ) text = text.concat([{t:$42.t.new_level_value,scale:5,color:cc.color(128,128,0)} , 
		                                        {t:levelAndValue.value,scale:10,color:cc.color(128,128,0)}]);
		if( levelAndValue.win ) {
			var t = $42.t.new_level_win;
			for( var i=0 ; i<t.length ; i++ ) text = text.concat([{t:t.substr(i,1),scale:11,color:cc.color(200+(55/t.length*i),200+(55/t.length*i),30)}])
		}
		
		if( levelAndValue.info ) {
			var lines = levelAndValue.info;
			for( var i=0 ; i<lines.length ; i++ ) text = text.concat([{t:lines[i],scale:2,color:cc.color(0,0,128)}]);			
		}
		
		for( var i=0 ; i<text.length ; i++ ) {
			var label = cc.LabelTTF.create(text[i].t, "res/fonts/American Typewriter.ttf", 160);
			label.setPosition(ml.size.width/2,ml.size.height/2);
			label.setScale(0.1,0.1);
			label.setColor(text[i].color);
			ml.addChild(label, 5);
			label.i = i;
			label.runAction(
				cc.sequence(
					cc.delayTime(i/2),
					cc.spawn(
						cc.scaleTo(2, text[i].scale),
						cc.fadeTo(2,0)
					),
					cc.callFunc(function() {
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
		for( var i=0 ; i<word.length ; i++) {
			cc.assert( ml.boxes[brc.row][brc.col+i].sprite , "42words, showFullword: Sprite is missing in box at position "+brc.row+"/"+brc.col );
			
			var orgSprite = ml.boxes[brc.row][brc.col+i].sprite,
				sprite = cc.Sprite.create(orgSprite.getTexture(),orgSprite.getTextureRect());
			sprite.setPosition($42.BS/2+i*$42.BS+$42.WORD_FRAME_WIDTH,$42.BS/2+$42.WORD_FRAME_WIDTH);
			sprite.retain();
	        /* retain */ tmpRetain[sprite.__instanceId] = { name: "words: sprite "+i, line: 461 };	
			wordFrameSprite.addChild( sprite );
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
					        
					        // release sprites, first of animated word ...
					        var s = wordFrameSprite.getChildren();
					        for( var i=0 ; i<s.length ; i++ ) {
						        s[i].release();
								delete tmpRetain[s[i].__instanceId];					        	
					        }
					        wordFrameSprite.release();
							delete tmpRetain[wordFrameSprite.__instanceId];
							// ... then of its duplication 
							s = sprite.getChildren();
					        for( var i=0 ; i<s.length ; i++ ) {
						        s[i].release();
								delete tmpRetain[s[i].__instanceId];					        	
					        }
					        sprite.release();
							delete tmpRetain[sprite.__instanceId];

							// remove sprites and layer
					        var temp1 = ml.getParent();
				            var temp2 = ml.getParent().removeChild(menuLayer);
					        sprite.removeAllChildren(true);
					        ml.getParent().removeChild(sprite);
					        wordFrameSprite.removeAllChildren(true);
					        ml.removeChild(wordFrameSprite);	  
					        
					        cb( takeWord );					        
	   					},
	   					menuItems = [{
	    					label: $42.t.take_word_yes, 
	    					cb: function(sender) {
	    						resume(this,true);
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
        				sprite.addChild(childSprites[i],2);    					
    				}
    				sprite.setPosition(this.getPosition());
    				sprite.retain();
			        /* retain */ tmpRetain[sprite.__instanceId] = { name: "words: sprite", line: 554 };	
    				sprite.setScale(0.95,0.95);
    				ml.getParent().addChild(sprite,2);
    				
    				// display value of word
    				for( var i=0,sum=0 ; i<word.length ; i++ ) {
        				var value = cc.LabelTTF.create($42.letterValues[word[i]], "Arial", 32),
        					pos = childSprites[i].getPosition();
        				sum += $42.letterValues[word[i]];
        				value.setPosition(pos.x , pos.y + $42.BS + 10);
        				value.retain();
    			        /* retain */ tmpRetain[value.__instanceId] = { name: "words: value "+i, line: 565 };	
        				value.setColor(cc.color(200,160,0));
        				sprite.addChild(value, 5);	    					
    				}
    				var value = cc.LabelTTF.create($42.t.take_word_wordvalue+": "+sum, "Arial", 48);
					value.setPosition(sprite.getTextureRect().width/2 , pos.y + $42.BS * 2 + 10);
					value.retain();
			        /* retain */ tmpRetain[value.__instanceId] = { name: "words: value ", line: 572 };	
					value.setColor(cc.color(200,160,0));
					sprite.addChild(value, 5);	    					

        	        ml.pause();
        	        ml.unscheduleUpdate();

				}, wordFrameSprite)
			)
		));

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
		
//		blowWords(cc.p(x,y),nsw.words);
		
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
			//var words = $42.words[ml.boxes[brc.row][brc.col].words[0].word.substr(0,3)];
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
	};
	
	ml.unselectWord = function() {
		moveSelectedWord(null);
	}
	
	var blowWords = function(pos, words) {

		var angle = Math.random() * 360,
			offset = (words.length < $42.MAX_LETTERS_BLOWN)? 0:
				Math.floor(Math.random()*words.length);
		for( var i=0 ; i<Math.min(words.length,$42.MAX_LETTERS_BLOWN) ; i++ ) {
			var word = cc.LabelTTF.create(words[(i+offset)%words.length].word, "Arial", 38),
	        	x = pos.x + Math.sin(cc.degreesToRadians(angle))*100,
	        	y = pos.y + Math.cos(cc.degreesToRadians(angle))*100;
			
			word.setPosition(x,y);
	        word.setRotation(angle+90);
	        word.retain();
	        /* retain */ tmpRetain[word.__instanceId] = { name: "words", line: 684 };	
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
	
	var addPoints = function( value , pos, big) {
		var coin = cc.LabelTTF.create(value, "Arial", big? 40 : 20),
			time = big? Math.random()+0.5 : Math.random()/2+1;
	
		coin.setPosition(pos.x,pos.y);
	    coin.retain();
        /* retain */ tmpRetain[coin.__instanceId] = { name: "coin", line: 741 };	
	    coin.setColor(big? cc.color(40,0,0) : cc.color(0,0,0));
	    ml.addChild(coin, 5);
	    coin.runAction(
	    	cc.sequence(
				cc.EaseSineOut.create(
			    	cc.spawn(
			    		cc.moveBy(time,cc.p((pos.x-ml.size.width/2)/4,big? 500 : 250)),
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
	    
	    ml.pointsToAdd.push(value);	    
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
		// create yellow frame sprite
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
			wordFrameSprite.setScale(scale || 0.3);
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
	
	var drawScoreBar = function(newSprite) {
		var sb = ml.scoreBar,
			wt = $42.wordTreasure,
			bw = $42.wordTreasureBestWord,
			mw = $42.maxWordValue,
			ls = $42.LEVEL_SCORE[mw] || $42.LEVEL_SCORE[4];
		
		if( !sb ) {
			
		    // draw score bar
		    var sb = ml.scoreBar = new cc.LayerColor(cc.color(128,0,0,0),ml.size.width,$42.BOXES_Y_OFFSET),
				len = bw? bw.word.length : 0;

		    sb.setPosition(0,0);
		    sb.setOpacity(0);
			sb.retain();
	        /* retain */ tmpRetain[sb.__instanceId] = { name: "scorebar", line: 835 };	
			ml.addChild(sb, 5);
			
			// draw total points
			ml.score = drawText(ml.totalPoints.toString(),cc.p(110,40),56,$42.SCORE_COLOR_BRIGHT,sb,true);
			ml.nextScore = drawText("^ "+ls.toString(),cc.p(105,80),24,$42.SCORE_COLOR_DIMM,sb,true);
			
			// draw clipping rect
	        var clipper = cc.ClippingNode.create();
	        clipper.width = 440;
		    clipper.height = $42.BOXES_Y_OFFSET;
	        clipper.anchorX = 0.5;
	        clipper.anchorY = 0.5;
	        clipper.x = 420;
	        clipper.y = $42.BOXES_Y_OFFSET / 2;

	        var stencil = cc.DrawNode.create();
	        var rectangle = [cc.p(0, 0),cc.p(clipper.width, 0),
	            cc.p(clipper.width, clipper.height),
	            cc.p(0, clipper.height)];

	        var white = cc.color(255, 255, 0, 0);
	        stencil.drawPoly(rectangle, white, 1, white);
	        clipper.stencil = stencil;
	        sb.addChild(clipper);

			var rl = $42.rollingLayer = new cc.Layer();
			rl.setPosition(0,0);
			rl.retain();
	        /* retain */ tmpRetain[rl.__instanceId] = { name: "rolling layer", line: 865 };	
			clipper.addChild(rl, 5);
			
			// draw the word value and the word value label
			sb.currentLevelLabel = drawText(bw? $42.t.score_bar_wordvalue : "",cc.p(380,82),24,$42.SCORE_COLOR_DIMM,rl,true);		
			sb.currentLevel = drawText(bw? bw.value : "",cc.p(394,45),72,$42.SCORE_COLOR_BRIGHT,rl,true);		

			// draw the word sprite and the number of letters
			sb.wordIconText = drawText($42.t.score_bar_no_word+(mw?" ("+$42.t.score_bar_max+" "+mw+")":""),cc.p(185,75),24,$42.SCORE_COLOR_BRIGHT,rl,true);		
			sb.wordIconSprite = drawWordSprite("",cc.p(185,35),sb.wordIconSprite,0.47,rl,true);							

			// draw highscore into clipper
			drawText($42.t.score_bar_highscore,cc.p(100,171),24,$42.SCORE_COLOR_DIMM,rl,false);			
			ml.highscore = drawText($42.maxPoints.toString(),cc.p(100,130),36,$42.SCORE_COLOR_BRIGHT,rl,true);	
			
			// draw most valuable word
			ml.bestWordValue = drawText($42.t.score_bar_mvw,cc.p(300,171),24,$42.SCORE_COLOR_DIMM,rl,true);
			ml.bestWordSprite = drawWordSprite(bw? bw.word:"",cc.p(300,130),ml.bestWordSprite,0.38,rl,true);							
		} else {
			ml.score.setString(ml.totalPoints.toString());
			ml.nextScore.setString("^ "+ls.toString());

			ml.highscore.setString($42.maxPoints.toString());
			sb.currentLevelLabel.setString(bw? $42.t.score_bar_wordvalue : "");		
			sb.currentLevel.setString(bw? bw.value : "");
			if( newSprite ) {
				var wc = [],
					s = ml.selections,
					sw = ml.selectedWord;
				
				for( i=0,max=0,word="" ; sw && i<sw.words.length ; i++ ) {
					if( sw.words[i].value > max ) {
						max = sw.words[i].value;
						word = sw.words[i].word;
					}
				}
				for( var i=s.length-1 ; i>=0 ; i--) {
					for( var j=0 ; j<s[i].words.length ; j++ ) {
						if( s[i].words[j].value > max ) {
							max = s[i].words[j].value;
							word = s[i].words[j].word;
						}
					}
				}
				sb.wordIconText.setString((max?max:$42.t.score_bar_no_word)+(mw?" ("+$42.t.score_bar_max+" "+mw+")":""));
				sb.wordIconSprite = drawWordSprite(word,cc.p(185,35),sb.wordIconSprite,0.47,sb,true);
				ml.bestWordSprite = drawWordSprite(bw? bw.word:"",cc.p(300,130),ml.bestWordSprite,0.37,rl,true);
//				sb.wordIconSprite = drawWordSprite("CYPHERPUNK",cc.p(185,35),sb.wordIconSprite,0.47,sb,true);
//				ml.bestWordSprite = drawWordSprite("CYPHERPUNK",cc.p(300,130),ml.bestWordSprite,0.37,rl,true);
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
        	json = ls.getItem("wordTreasure") || [],
        	wt = $42.wordTreasure = json.length? JSON.parse(json) : [];
        	
		$42.maxPoints = ls.getItem("maxPoints") || 0;
		$42.tutorialsDone = ls.getItem("tutorialsDone") || 0;
		
//		ml.hookStartProgram( 2 , false );
//		ml.hookStartProgram( 0 , true );
		if( ml.hookStartProgram && $42.tutorialsDone < 1 ) ml.hookStartProgram( 0 , true );	
//		else if( ml.hookStartProgram ) ml.hookStartProgram( 10 , false );

		// points array
		ml.pointsToAdd = [];
		ml.levelsToBlow = [];
		ml.add1and3s = [];
		ml.totalPoints = 0;
		ml.rollingLayerStage = 0;
		ml.dontAutoSelectWord = false;
		
		for( var i=1,bw=0 ; i<wt.length ; i++ ) if( wt[i].value > wt[bw].value ) bw = i;
		$42.wordTreasureBestWord = wt[bw] || null;
		$42.maxWordValue = 20; $42.wordTreasureBestWord? $42.wordTreasureBestWord.value : 4;
		
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
        	if( ml.totalPoints >= $42.PLUS1_BUTTON_COST ) {
            	for( var i=0 ; i<10 ; i++ ) ml.pointsToAdd.push(-$42.PLUS1_BUTTON_COST/10);
            	ml.add1and3s.push("1");        		
        	}        	        	
        } , ml);
        item.setOpacity($42.PLUS1_BUTTON_OPACITY);
        ml.plus1Button = cc.Menu.create( item );
        ml.plus1Button.x = $42.PLUS1_BUTTON_X;
        ml.plus1Button.y = $42.PLUS1_BUTTON_Y;
        ml.plus1Button.retain();
        /* retain */ tmpRetain[ml.plus1Button.__instanceId] = { name: "plus1Button", line: 1010 };	
        ml.addChild(ml.plus1Button,10);

        var item = cc.MenuItemImage.create(cc.spriteFrameCache.getSpriteFrame("plus3"), cc.spriteFrameCache.getSpriteFrame("plus3highlit"), function() {
        	if( $42.wordTreasureBestWord && ml.totalPoints >= $42.PLUS3_BUTTON_COST ) {
            	for( var i=0 ; i<10 ; i++ ) ml.pointsToAdd.push(-$42.PLUS3_BUTTON_COST/10);
            	ml.add1and3s.push("3");        		
        	}
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
			rl = $42.rollingLayer;
		releaseChildren( ml.bestWordSprite );
		releaseChildren( sb.wordIconSprite );
		releaseSprite( ml.bestWordSprite );
		releaseSprite( sb.wordIconSprite );
		releaseSprite(ml.score);
		releaseSprite(ml.nextScore);
		releaseSprite(sb.currentLevelLabel);
		releaseSprite(sb.currentLevel);
		releaseSprite(sb.wordIconText);
		releaseSprite(ml.highscore);
		releaseSprite(ml.bestWordValue);
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

		if( nextTile === null && tileBoxes.length === 3 ) {
			cc.assert($42.maxWordValue >= 4 && $42.maxWordValue <= 42 && $42.prefixValues[$42.maxWordValue], "42 Words, _42Layer.hookSetTileImages: Wrong $42.maxWordValue or no prefixes.")
			var prefs = $42.prefixValues[$42.maxWordValue];
			nextTile = {
				"tile": 8, 
				"letters": prefs[Math.floor(Math.random()*prefs.length)]
			}
		} 
		
        // add single boxes with letters to the tile
        for( var i=0 ; i<tileBoxes.length ; i++) {
        	
        	var sw = ml.selectedWord;
        	if( nextTile !== null ) {
        		var val = $42.LETTERS.indexOf(nextTile.letters[i]);
        	} else {
	         	var len = sw && sw.missingLetters && sw.missingLetters.length || 0,
         			prob = len <= 3? $42.NEEDED_LETTERS_PROBABILITY / (5-len) : $42.NEEDED_LETTERS_PROBABILITY; 
        		for( var j=0 ; j<5 ; j++ ) {
	         		val = (Math.random()>prob || !sw || !len)?  
	         					Math.floor(this.getRandomValue($42.letterOccurences)):
	        					$42.LETTERS.indexOf(sw.missingLetters[Math.floor(Math.random()*sw.missingLetters.length)]);        			
	         					
	        	    for( k=0 ; k<i ; k++ ) 
	        	    	if( userData[k] === $42.LETTERS[val] ) 
	        	    		break;
	        	    if( k < i ) continue;
	         		if( $42.letterValues[$42.LETTERS[val]] <= $42.maxWordValue - 3 ) break;
        		}
        	}
       					
    		var	spriteFrame = cc.spriteFrameCache.getSpriteFrame($42.LETTER_NAMES[val]),
    			sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,$42.BS,$42.BS));
    		
    		cc.assert(sprite, "42words, hookSetTileImages: sprite must not be null. (var = "+val+", name="+$42.LETTER_NAMES[val]+" )");
    		if( !sprite ) cc.log(sprite, "42words, hookSetTileImages: sprite must not be null. (var = "+val+", name="+$42.LETTER_NAMES[val]+" )");
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

		drawScoreBar(true);

		var ls = cc.sys.localStorage;
		ls.setItem("maxPoints",$42.maxPoints);
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

		// Score
		var value = box && parseInt(($42.letterValues[box.userData] || 0) * ((brc.row*$42.SCORE_ROW_MULTIPLYER) + 1));
		if( value ) addPoints(value * 2, cc.p($42.BOXES_X_OFFSET + brc.col * $42.BS + $42.BS/2, $42.BOXES_Y_OFFSET + brc.row * $42.BS + $42.BS));
		
		// 1 and 3 tiles
		if( box && (box.userData === "1" || box.userData === "3") ) {
			ml.add1and3s.push(box.userData);
		}
		
		// check if selection is deleted
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

		drawScoreBar(true);
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
				cc.log("42words, hookOnTap: calling updateSelectedWord()");
				updateSelectedWord();
			} else {
//				blowWords(tapPos,ml.boxes[sw.brc.row][sw.brc.col].words);
			}
		} else if( tapPos.y < $42.BOXES_Y_OFFSET ) {
			moveRollingLayer(undefined,3);
		} else {
			for( var i=ml.selections.length-1 ; i>=0 ; i--) {
				var s = ml.selections[i];

				if( s && tapPos.x >= s.pos.x && tapPos.x <= s.pos.x+s.width && tapPos.y >= s.pos.y && tapPos.y <= s.pos.y+s.height ) {
					moveSelectedWord(s.brc);
					ml.dontAutoSelectWord = false;
					cc.log("42words, hookOnTap, selections: setSelection()");
					setSelections();
					cc.log("42words, hookOnTap, selections: Calling updateSelectedWord()");
					updateSelectedWord();
					
					var x = $42.BOXES_X_OFFSET + s.brc.col*$42.BS + 1.5*$42.BS,
					y = $42.BOXES_Y_OFFSET + s.brc.row*$42.BS + 1.5*$42.BS;
				
//					blowWords(cc.p(x,y),s.words);
				}
			}
		}
	};
	
	_42Layer.hookOnLongTap = function(tapPos) {
		var sw = ml.selectedWord;
		if( sw ) {
			var swPos = { 
					x: $42.BOXES_X_OFFSET + sw.brc.col * $42.BS,
					y: $42.BOXES_Y_OFFSET + sw.brc.row * $42.BS
			};			
		} 
		
		// check if selected word is hit
		if( sw && tapPos.x >= swPos.x && tapPos.y >= swPos.y - $42.BS && tapPos.y <= swPos.y + $42.BS ) {
			ml.unselectWord();
			setSelections();
			ml.dontAutoSelectWord = true;
		}
	};
	
	_42Layer.hookUpdate = function(dt) {
		
		if( ml.hookMurbiksUpdate ) ml.hookMurbiksUpdate(dt);
		
		if( !ml.pointsToAddCnt && ml.pointsToAdd && ml.pointsToAdd.length ) {
			var bw = $42.wordTreasureBestWord;

			ml.pointsToAddCnt = $42.POINTS_TO_ADD_CYCLES;

			var pta = ml.pointsToAdd.splice(0,1)[0];
			if( pta === $42.POINTS_TO_ADD_BLOW_UP ) {
				if( ml.totalPoints < $42.LEVEL_SCORE[bw.value] ) {
					var text = $42.t.new_level_next.slice();
					cc.assert(text.length === 3,"42Words, _42Layer.hookUpdate: I need 3 words for t.new_level_next");
					text[2] += " "+$42.LEVEL_SCORE[bw.value];
					ml.levelsToBlow.push({ info: text });					
				}
			} else {
				ml.totalPoints += parseInt(pta);				
			}
			
			moveRollingLayer(1,3);

			// highscore?
			$42.maxPoints = Math.max(ml.totalPoints , $42.maxPoints);

			drawScoreBar();
			
			// next word value if 
			if( bw && ml.totalPoints >= $42.LEVEL_SCORE[bw.value] && bw.value === $42.maxWordValue ) {
				if( $42.maxWordValue < 42 ) {
					$42.maxWordValue++;
					ml.levelsToBlow.push({ level: null, value: $42.maxWordValue});
					setSelections();
					drawScoreBar(true);
				} else if( !$42.youWonTheGame ) {
					$42.youWonTheGame = true;
					youWonTheGame();
				}
			}
			
			// tutorial 2 starts >= 750
			if( ml.totalPoints >= 750 && !ml.wordIsBeingSelected && ml.hookStartProgram && $42.tutorialsDone < 2 ) {
				$42.tutorialsDone = 2;
				ml.hookStartProgram( 1 , true );	
			}
			
			// show plus 3 button if score is high enough 
			if( !ml.plus3ButtonVisible && $42.wordTreasureBestWord && 
					($42.wordTreasureBestWord.value >= 40 ||
					ml.totalPoints >= $42.LEVEL_SCORE[bw.value+2])
			) {
				ml.plus3ButtonVisible = true;
				ml.plus3Button.runAction(cc.EaseSineIn.create(cc.moveBy(0.75,cc.p(0, -100))));
			} else if( ml.plus3ButtonVisible && $42.wordTreasureBestWord &&  
					 ml.totalPoints <= $42.LEVEL_SCORE[$42.wordTreasureBestWord.value+2]
			) {
				ml.plus3ButtonVisible = false;
				ml.plus3Button.runAction(cc.EaseSineOut.create(cc.moveBy(0.75,cc.p(0, 100))));					
			}
		} else if( ml.pointsToAddCnt ) {
			ml.pointsToAddCnt--;
		} else {
			moveRollingLayer(0);
		}
		
		if( !ml.levelsToBlowCnt && ml.levelsToBlow && ml.levelsToBlow.length ) {
			ml.levelsToBlowCnt = $42.LEVELS_TO_BLOW_CYCLES;
			
			blowLevelAndWordValue(ml.levelsToBlow.splice(0,1)[0]);
			
		} else if( ml.levelsToBlowCnt ) {
			ml.levelsToBlowCnt--;
		} else {
		}
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
								max=Math.max(max,lv[letter]);
							}

							$42.letterOccurences = [];
							for( var i=0 ; i<l.length ; i++ ) {
								var occ = lv[l[i]] && parseInt(1/lv[l[i]]*max);
								$42.letterOccurences[i] = occ || 0; 
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
	$42.TITLE_START_GAME = "SPIEL STARTEN";
	$42.TITLE_SCORE = "Wortwert";
	// ENGLISH
//	$42.loadLanguagePack(1);
//	$42.TITLE_WORDS = "WORDS";
//	$42.TITLE_START_GAME = "START GAME";
//	$42.TITLE_SCORE = "WORD VALUE";
	// ESTONIAN
//	$42.loadLanguagePack(2);
//	$42.TITLE_WORDS = "WORTE";
//	$42.TITLE_START_GAME = "SPIEL STARTEN";
//	$42.TITLE_SCORE = "WORTWERT";
	// SWEDISH
//	$42.loadLanguagePack(3);
//	$42.TITLE_WORDS = "ORDEN";
//	$42.TITLE_START_GAME = "START";
//	$42.TITLE_SCORE = "ORD VÄRDE";
}

