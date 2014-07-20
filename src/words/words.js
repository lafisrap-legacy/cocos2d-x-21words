	/*
 * Enhancement module for Mupris
 * 
 * NEXT STEPS:
 * 
 * - finish score!!!!!
 * 
 * + WORTSCHATZ
 * - delete english words, unknown words, beginning with length 4?
 * - animate best word and number of words into scoreBar
 * - show wortschatz
 * 
 * + INTERNATIONALIZATION
 * - JSON file with strings
 * - english words
 * - english text
 * - mulitligual programs
 * 
 * + IPHONE
 * 
 * 
 * + STABILIZATION
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

var	LETTER_NAMES = ["a.png","b.png","c.png","d.png","e.png","f.png","g.png","h.png","i.png","j.png","k.png","l.png","m.png","n.png","o.png","p.png","q.png","r.png","s.png","t.png","u.png","v.png","w.png","x.png","y.png","z.png","ae.png","oe.png","ue.png","o.png"],
	LETTERS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","Ä","Ö","Ü","Õ"],
	LETTER_VALUES = {"A":1,"B":3,"C":4,"D":1,"E":1,"F":4,"G":2,"H":2,"I":1,"J":6,"K":4,"L":2,"M":3,"N":1,"O":2,"P":4,"Q":10,"R":1,"S":1,"T":1,"U":1,"V":6,"W":3,"X":8,"Y":10,"Z":3,"Ä":6,"Ö":8,"Ü":6},
	LETTER_OCCURANCES = [5,2,2,4,15,2,3,4,6,1,2,3,4,9,3,1,1,6,7,6,6,1,1,1,1,1,1,1,1,1],
	LEVEL_SCORES = [undefined, 0, 100, 200, 500, 1000, 2000, 3000];
//	LEVEL_SCORES = [undefined, 0, 1000, 5000, 10000, 25000, 50000, 100000];
	TINT_SPEED = 1.0,
	MARKER_SET = 1,
	MARKER_OPT = 2,
	MARKER_SEL = 3,
	START_MARKER_X_OFFSET = -18,
	START_MARKER_Y_OFFSET = BS/2,
	MARKER_X_OFFSET = BS/2,
	MARKER_Y_OFFSET = -20,
	UNSELECTED_BOX_OPACITY = 128,
	NEEDED_LETTERS_PROBABILITY = 0.5
	MAX_LETTERS_BLOWN = 20,
	WORD_FRAME_WIDTH = 8,
	WORD_FRAME_MOVE_TIME = 0.8,
	SCORE_COLOR_DIMM = cc.color(160,120,55),
	SCORE_COLOR_BRIGHT = cc.color(240,170,70),
	TILES_PROGRAMS = [[
	      { tile: 0, letters: "SAYN" },
	      { tile: 0, letters: "ERPU" },
	      { tile: 2, letters: "NKKL" },
	      { tile: 3, letters: "CUPS" },
	   ]
	];

var MUPRIS_MODULE = function(muprisLayer) {

	var mg = MUPRIS_GLOBALS,
		ml = muprisLayer,
		curProgram = null,
		curProgramCnt = null,
		language_name;
	
	// go through box array and look for prefixes
	var setSelections = function( dontSelectWord ) {
		var s = [],
			sw = ml.selectedWord;

		//ml.wordCandidates = [];

		for( var i=0 ; i<BOXES_PER_COL ; i++) {
			// dim all boxes in a row
			for( var j=0 ; j<BOXES_PER_ROW ; j++ ) {
				var box = ml.boxes[i][j];				
				if( box && box.sprite ) box.sprite.setOpacity(UNSELECTED_BOX_OPACITY);				
			}
			// check all boxes for word starts (prefixes)
			for( var j=0 ; j<BOXES_PER_ROW-2 ; j++ ) {
				var box = ml.boxes[i][j];				
				if(!box) continue;
				
				var oldPrefix = box.words && box.words[0].word.substring(0,3);
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
						width: BS * 3,
						height: BS,
						words: words,
						pos: {
							x: BOXES_X_OFFSET + brc.col * BS,
							y: BOXES_Y_OFFSET + brc.row * BS,
						},
						box: [
					      	ml.boxes[brc.row][brc.col],
					      	ml.boxes[brc.row][brc.col+1],
					      	ml.boxes[brc.row][brc.col+2],
						]
					});
					
					// if no word is currently selected, choose the first ...
					if( !dontSelectWord && !ml.selectedWord ) {
						sw = ml.selectedWord = {
							brc: brc,
							words: words,
							markers: [],
							sprites: []
						}
						
						var x = BOXES_X_OFFSET + brc.col*BS + 1.5*BS,
							y = BOXES_Y_OFFSET + brc.row*BS + 1.5*BS;
						
						blowWords(cc.p(x,y),words);
					}
				});
			}
		}
		
		ml.selections = s;
		return updateSelectedWord();
	};
	
	// look for words at a specified position
	var checkForPrefixes = function(brc, cb) {

		var prefix = (ml.boxes[brc.row][brc.col]   && ml.boxes[brc.row][brc.col].userData || " ")+
					 (ml.boxes[brc.row][brc.col+1] && ml.boxes[brc.row][brc.col+1].userData || " ")+
					 (ml.boxes[brc.row][brc.col+2] && ml.boxes[brc.row][brc.col+2].userData || " "),
			words = [];
		
		// copy word object
		for( var i=0 ; mg.words[prefix] && i<mg.words[prefix].length ; i++ ) {
			words.push({
				word: mg.words[prefix][i].word,
				value: mg.words[prefix][i].value,
			});
		}

		if( !(ml.boxes[brc.row][brc.col] && ml.boxes[brc.row][brc.col].words) && words.length && cb ) {
			
			var w = [], len = words.length;
			for( var i=0 ; i<words.length ; i++ ) w[i] = words[i].word; 
			for( var i=words.length-1 ; i>=0 ; i-- ) {
				if( brc.col + w[i].length > BOXES_PER_ROW || w[i].length > ml.maxWordLength ) {
					words.splice(i,1);
				}
			}
			
			if( words.length > 0 ) {
				cc.log("checkForPrefixes: Found "+words.length+" words at "+brc.row+"/"+brc.col+".");
				cb(brc,words);
			}
		}
	};
	
	// update selected word
	var updateSelectedWord = function() {
		var sw = ml.selectedWord,
		batch = ml.getChildByTag(TAG_SPRITE_MANAGER);
		
		if( !sw ) return false;
		
		// Define sprites and show word start sprite
		var setMarkerFrame = [],
			optMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker1.png"),
			selMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker3.png");
		
		setMarkerFrame[0] = cc.spriteFrameCache.getSpriteFrame("marker0-0.png");
		setMarkerFrame[1] = cc.spriteFrameCache.getSpriteFrame("marker0-1.png");
		
		if( !sw.startMarker ) {
			sw.startMarker = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("marker2.png"),cc.rect(0,0,BS,BS));
			sw.startMarker.retain();			
			sw.startMarker.setPosition(cc.p(BOXES_X_OFFSET + sw.brc.col * BS + START_MARKER_X_OFFSET,
											BOXES_Y_OFFSET + sw.brc.row * BS + START_MARKER_Y_OFFSET));
			batch.addChild(sw.startMarker,5);
		}
		var pos = sw.startMarker.getPosition(),
			row = Math.round(pos.y-BOXES_Y_OFFSET-START_MARKER_Y_OFFSET)/BS;
		if( row != sw.brc.row ) {
			var rows = row - sw.brc.row;
			sw.startMarker.runAction(cc.moveBy(MOVE_SPEED*rows, cc.p(0,-BS*rows)));			
		}

		// Mark letters
		// First look for all words that are still possible, looking at the markers set
		var curWords = sw.words.slice(),
			missingLetters = "";
		for( var i=sw.brc.col ; i<BOXES_PER_ROW ; i++) {
			var col = i-sw.brc.col;
			if( sw.markers[col] === MARKER_SEL ) {
				var letter = ml.boxes[sw.brc.row][i].userData;
				// take out all words that don't match the letters where markers are set
				for( var j=curWords.length-1 ; j>=0 ; j-- ) {
					if( curWords[j].word[col] != letter ) curWords.splice(j,1);
				}
			}
		}
		// if no words are found with currently selected markers, than the last fitting word was removed
		// so delete all selected markers and start with all words anew
		if( curWords.length === 0 ) {
			curWords = sw.words.slice();
			for( var i=3 ; i<sw.markers.length ; i++ ) if( sw.markers[i] === MARKER_SEL || sw.markers[i] === MARKER_SET ) sw.markers[i] = null;
		}
		for( var i=sw.brc.col ; i<BOXES_PER_ROW ; i++) {
			var col = i-sw.brc.col;
			// remove old sprite
			if( sw.sprites[col] ) batch.removeChild( sw.sprites[col] );
			sw.sprites[col] = null;
			for( var j=curWords.length-1,hits=0 ; j>=0 ; j-- ) {
				// look if the letter in the box matches the letter in the word 
				if(ml.boxes[sw.brc.row][i] && curWords[j].word[col] === ml.boxes[sw.brc.row][i].userData ) hits++;
				else if( curWords[j].word[col] ) missingLetters += curWords[j].word[col];
			}
			if( sw.markers[col] === MARKER_SEL && hits > 0 ) {
				// if the user marked the letter, than show marker select sprite
				sw.sprites[col] = cc.Sprite.create(selMarkerFrame,cc.rect(0,0,BS,BS));
				ml.boxes[sw.brc.row][i].sprite.setOpacity(255);	
			} else if( sw.markers[col] === MARKER_SET || hits === curWords.length ) {
				// just set sprite opacity to full
				// letter in box matches with all words, draw sprite
				sw.markers[col] = MARKER_SET;
				sw.sprites[col] = cc.Sprite.create(
					setMarkerFrame[Math.floor(Math.random()*setMarkerFrame.length)],
					cc.rect(0,0,BS,BS)
				);
				ml.boxes[sw.brc.row][i].sprite.setOpacity(255);	
			} else if( hits === 0 ) {
				// letter in box matches with no word
				sw.markers[col] = null;
			} else {
				// letter in box matches with some words, draw marker option sprite
				sw.markers[col] = MARKER_OPT;
				sw.sprites[col] = cc.Sprite.create(optMarkerFrame,cc.rect(0,0,BS,BS));					
				ml.boxes[sw.brc.row][i].sprite.setOpacity(UNSELECTED_BOX_OPACITY);	
			}
			
			if( hits > 0 ) {
				sw.sprites[col].retain();
				batch.addChild(sw.sprites[col],5);
				sw.sprites[col].setPosition(cc.p(BOXES_X_OFFSET + i * BS + MARKER_X_OFFSET, 
						   						 BOXES_Y_OFFSET + sw.brc.row * BS + MARKER_Y_OFFSET));
			}	
			if( sw.sprites[col] ) {
				var pos = sw.sprites[col].getPosition(),
					row = Math.round(pos.y-BOXES_Y_OFFSET-MARKER_Y_OFFSET)/BS;
				if( row != sw.brc.row ) {
					var rows = row - sw.brc.row;
					sw.sprites[col].runAction(cc.moveBy(MOVE_SPEED*rows, cc.p(0,-BS*rows)));			
				}
			}
		}
		
		sw.missingLetters = missingLetters;
		
		// look if all marked letters form a complete word, then make them green
		for( var i=0 ; i<curWords.length ; i++ ) {
			var word = curWords[i].word;
			for( var j=0 ; j<word.length ; j++ ) {
				if( !ml.boxes[sw.brc.row][j+sw.brc.col] || 
					word[j] !== ml.boxes[sw.brc.row][j+sw.brc.col].userData || 
				   (sw.markers[j] !== MARKER_SET && sw.markers[j] !== MARKER_SEL)) 
						break;
			}
			if( j === word.length ) {
				// delete word anyway
				var ret = deleteWordFromList(word);					
				cc.assert(ret,"Mupris, updateSelectedWord: No word to delete!");
				unselectWord();

				showFullWordAndAsk( sw.brc , word , function( takeWord ) {					
					if( takeWord ) {
						// delete complete row
						var row = sw.brc.row;
						for( var j=0, value=0 ; j<word.length ; j++ ) {
							// calculate points and let them fly ...
							var v = mg.letterValues[word[j]],
								points = v * 10 * (sw.brc.row+1) * (word.length-3);
							value += v;
							addPoints(points, cc.p(BOXES_X_OFFSET + (sw.brc.col+j) * BS + BS/2, BOXES_Y_OFFSET + sw.brc.row * BS + BS), true);							
						}
						// put word into treasure
						var ls = cc.sys.localStorage,
							w = {
								word: word,
								value: value
							};
						mg.wordTreasure.push(w);
						moveRollingLayer(2);
						if( !ml.wordTreasureBestWord || ml.wordTreasureBestWord.value < w.value ) {
							ml.wordTreasureBestWord = w;
						}
						ml.checkForAndRemoveCompleteRows(row);
						setSelections(true);
						drawScoreBar(true);
					} else {
						setSelections(true);
						moveSelectedWord(sw.brc);
						ml.checkForAndRemoveCompleteRows();
					}
				});
				return true; // a word was found
			}
		}
		
		return false;
	};
	
	var deleteWordFromList = function(word) {
		var prefix = word.substr(0,3);
		// delete word from full word list
		var words = mg.words[prefix];
		for( var i=0 ; i<words.length ; i++ ) {
			if( words[i].word === word ) {
				words.splice(i,1);
				if( !words.length ) delete mg.words[word.substr(0,3)];
				return true;
			}
		}
		return false;
	};
	
	var showFullWordAndAsk = function( brc , word , cb ) {
		var batch = ml.getChildByTag(TAG_SPRITE_MANAGER),
			width = word.length * BS,
			height = BS,
			x = BOXES_X_OFFSET + brc.col * BS + width/2,
			y = BOXES_Y_OFFSET + brc.row * BS + height/2;
		
		// create yellow frame sprite
		var wordFrameFrame  = cc.spriteFrameCache.getSpriteFrame("wordframe.png");
		
		var	wordFrameSprite = cc.Sprite.create(wordFrameFrame),
			rect = wordFrameSprite.getTextureRect();
		wordFrameSprite.retain();
		rect.width = width + WORD_FRAME_WIDTH * 2;
		rect.height = height + WORD_FRAME_WIDTH * 2;
		wordFrameSprite.setTextureRect(rect);
		wordFrameSprite.setPosition(x,y);
		batch.addChild(wordFrameSprite,15);
		
		// add sprites of word
		for( var i=0 ; i<word.length ; i++) {
			cc.assert( ml.boxes[brc.row][brc.col+i].sprite , "Mupris, showFullword: Sprite is missing in box at position "+brc.row+"/"+brc.col );
			
			var orgSprite = ml.boxes[brc.row][brc.col+i].sprite,
				sprite = cc.Sprite.create(orgSprite.getTexture(),orgSprite.getTextureRect());
			sprite.setPosition(BS/2+i*BS+WORD_FRAME_WIDTH,BS/2+WORD_FRAME_WIDTH);
			sprite.retain();
			wordFrameSprite.addChild( sprite );
		}
		
		// move, rotate and scale word
		var bezier = [
		      cc.p(x,y),
              cc.p(x<ml.size.width/2?ml.size.width:0,ml.size.height/2),
              cc.p(ml.size.width/2,ml.size.height-300)];

		wordFrameSprite.runAction(cc.EaseSineIn.create(cc.bezierTo(WORD_FRAME_MOVE_TIME,bezier)));
		//wordFrameSprite.runAction(cc.rotateBy(WORD_FRAME_MOVE_TIME,-360));
		wordFrameSprite.runAction(cc.EaseSineIn.create(
			cc.sequence(
				cc.EaseSineOut.create(
					cc.scaleTo(WORD_FRAME_MOVE_TIME/2,1.5)
				),
				cc.EaseSineIn.create(
					cc.scaleTo(WORD_FRAME_MOVE_TIME/2,0.95)
				),
				cc.callFunc(function() {
	   				var sprite = null,
	   					resume = function(menuLayer) {
					        ml.resume();
					        ml.scheduleUpdate();
				            ml.getParent().removeChild(menuLayer);
					        sprite.removeAllChildren(true);
					        ml.getParent().removeChild(sprite);
					        wordFrameSprite.removeAllChildren(true);
					        batch.removeChild(wordFrameSprite);	   						
	   					},
	   					menuItems = [{
    					label: mg.t.take_word_yes, 
    					cb: function(sender) {
    						resume(this);
    						cb(true);
    			        }
    				},{
    					label: mg.t.take_word_no, 
    					cb: function(sender) {
    						resume(this);
    						cb(false);
    			        }
    				}];
    	            ml.getParent().addChild(
    	            	new MuprisMenuLayer(mg.t.take_word_question,menuItems),
    	            	2);
    	            
    				sprite = cc.Sprite.create(this.getTexture(),this.getTextureRect());
    				var children = this.getChildren(),
    					childSprites = [];
    				for( var i=0 ; i<children.length ; i++ ) {
    					childSprites[i] = cc.Sprite.create(children[i].getTexture(),children[i].getTextureRect());
    					childSprites[i].retain();
    					childSprites[i].setPosition(children[i].getPosition());
        				sprite.addChild(childSprites[i],2);    					
    				}
    				sprite.setPosition(this.getPosition());
    				sprite.retain();
    				sprite.setScale(0.95,0.95);
    				ml.getParent().addChild(sprite,2);
    				
    				// display value of word
    				for( var i=0,sum=0 ; i<word.length ; i++ ) {
        				var value = cc.LabelTTF.create(mg.letterValues[word[i]], "Arial", 32),
        					pos = childSprites[i].getPosition();
        				sum += mg.letterValues[word[i]];
        				value.setPosition(pos.x , pos.y + BS + 10);
        				value.retain();
        				value.setColor(cc.color(200,160,0));
        				sprite.addChild(value, 5);	    					
    				}
    				var value = cc.LabelTTF.create(mg.t.take_word_wordvalue+": "+sum, "Arial", 48);
					value.setPosition(sprite.getTextureRect().width/2 , pos.y + BS * 2 + 10);
					value.retain();
					value.setColor(cc.color(200,160,0));
					sprite.addChild(value, 5);	    					

        	        ml.pause();
        	        ml.unscheduleUpdate();

				}, wordFrameSprite)
			)
		));

	};
	
	var moveSelectedWord = function(brc) {
		var sw = ml.selectedWord;
		
		if( sw ) {
			ml.boxes[sw.brc.row][sw.brc.col].markers = sw.markers;
			
			// delete old sprites
			var batch = ml.getChildByTag(TAG_SPRITE_MANAGER);
			if( sw.startMarker ) batch.removeChild( sw.startMarker );
			for( var i=0 ; i<sw.sprites.length ; i++ ) if( sw.sprites[i]  ) batch.removeChild( sw.sprites[i] );
		}
			
		// define a new one
		if( brc ) {
			//var words = mg.words[ml.boxes[brc.row][brc.col].words[0].word.substr(0,3)];
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
			} else {
				ml.selectedWord = null;
			}
		} else {
			ml.selectedWord = null;
		}
		
		updateSelectedWord();
	};
	
	var unselectWord = function() {
		moveSelectedWord(null);
	}
	
	var blowWords = function(pos, words) {

		var angle = Math.random() * 360,
			offset = (words.length < MAX_LETTERS_BLOWN)? 0:
				Math.floor(Math.random()*words.length);
		for( var i=0 ; i<Math.min(words.length,MAX_LETTERS_BLOWN) ; i++ ) {
			var word = cc.LabelTTF.create(words[(i+offset)%words.length].word, "Arial", 38),
	        	x = pos.x + Math.sin(cc.degreesToRadians(angle))*100,
	        	y = pos.y + Math.cos(cc.degreesToRadians(angle))*100;
			
			word.setPosition(x,y);
	        word.setRotation(angle+90);
	        word.retain();
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
	        	ml.removeChild(this);
	        },word)));
		}
	};
	
	var addPoints = function( value , pos, big) {
		var coin = cc.LabelTTF.create(value, "Arial", big? 40 : 20),
			time = big? Math.random()+0.5 : Math.random()/2+1;
	
		coin.setPosition(pos.x,pos.y);
	    coin.retain();
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
			    	ml.removeChild(this);
			    },coin)
			)
	    );
	    
	    ml.pointsToAdd.push(value);	    
	};
	
	var drawText = function(text,pos,size,color,parent) {
		var label = cc.LabelTTF.create(text, "res/fonts/American Typewriter.ttf", size);
		label.setPosition(pos);
		label.retain();
		label.setColor(color);
		parent.addChild(label, 5);	
		
		return label;
	};
	
	var drawWordSprite = function(word,pos,wordSprite,parent) {
		// create yellow frame sprite
		if( !wordSprite ) {
			var wordFrameFrame  = cc.spriteFrameCache.getSpriteFrame("wordframe.png"),
				wordFrameSprite = cc.Sprite.create(wordFrameFrame),
				rect = wordFrameSprite.getTextureRect();
			wordFrameSprite.retain();
			rect.width = word.length? word.length * BS + WORD_FRAME_WIDTH * 2 : 80;
			rect.height = word.length? BS + WORD_FRAME_WIDTH * 2 : 8;
			wordFrameSprite.setTextureRect(rect);
			wordFrameSprite.setPosition(pos.x,pos.y);
			wordFrameSprite.setScale(0.3);
			parent.addChild(wordFrameSprite,4);
		} else {
			var wordFrameSprite = wordSprite,
				rect = wordFrameSprite.getTextureRect();
			rect.width = word.length? word.length * BS + WORD_FRAME_WIDTH * 2 : 80;
			rect.height = word.length? BS + WORD_FRAME_WIDTH * 2 : 8;
			wordFrameSprite.setTextureRect(rect);
			wordFrameSprite.removeAllChildren(true);
		}
		// add sprites of word
		for( var i=0 ; i<word.length ; i++) {
			
			var file = LETTER_NAMES[LETTERS.indexOf(word[i])],
				spriteFrame = cc.spriteFrameCache.getSpriteFrame(file),
				sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,BS,BS));
			sprite.setPosition(BS/2+i*BS+WORD_FRAME_WIDTH,BS/2+WORD_FRAME_WIDTH);
			sprite.retain();
			wordFrameSprite.addChild( sprite );
		}		
		
		return wordFrameSprite;
	}
	
	var drawScoreBar = function(newSprite) {
		var sb = ml.scoreBar;
		if( !sb ) {
			
		    // draw score bar
		    var sb = ml.scoreBar = new cc.LayerColor(cc.color(128,0,0,0),ml.size.width,BOXES_Y_OFFSET);
		    sb.setPosition(0,0);
		    sb.setOpacity(0);
			sb.retain();
			ml.addChild(sb, 5);
			
			// draw total point
			ml.score = drawText(ml.totalPoints.toString(),cc.p(ml.size.width/2,50),84,SCORE_COLOR_BRIGHT,sb);
	
			
			// draw clipping rect
	        var clipper = cc.ClippingNode.create();
	        clipper.tag = 101;
	        clipper.width = 200;
		    clipper.height = BOXES_Y_OFFSET;
	        clipper.anchorX = 0.5;
	        clipper.anchorY = 0.5;
	        clipper.x = 540;
	        clipper.y = BOXES_Y_OFFSET / 2;
//	        clipper.runAction(cc.RepeatForever.create(cc.RotateBy.create(1, 45)));

	        var stencil = cc.DrawNode.create();
	        var rectangle = [cc.p(0, 0),cc.p(clipper.width, 0),
	            cc.p(clipper.width, clipper.height),
	            cc.p(0, clipper.height)];

	        var white = cc.color(255, 255, 0, 0);
	        stencil.drawPoly(rectangle, white, 1, white);
	        clipper.stencil = stencil;
	        sb.addChild(clipper);

			var rl = ml.rollingLayer = new cc.Layer();
			rl.setPosition(0,0);
			rl.retain();
			clipper.addChild(rl, 5);
			
			// prepare values for display
			var wt = mg.wordTreasure,
				bw = ml.wordTreasureBestWord, // = { word: "CYPHERPUNK", value: 32 },
				len = bw? bw.word.length : 0;
			for( var i=0,value=0 ; i<wt.length ; i++ ) value += wt[i].value;
			
			// draw highscore into clipper
			drawText(mg.t.score_bar_highscore,cc.p(100,75),28,SCORE_COLOR_DIMM,rl);			
			ml.highscore1 = drawText(mg.maxPoints.toString(),cc.p(100,35),42,SCORE_COLOR_BRIGHT,rl);	
			drawText(mg.t.score_bar_highscore,cc.p(100,363),28,SCORE_COLOR_DIMM,rl);			
			ml.highscore2 = drawText(mg.maxPoints.toString(),cc.p(100,323),42,SCORE_COLOR_BRIGHT,rl);	
			
			// draw number of words in treasure into clipper
			drawText(mg.t.score_bar_treasure,cc.p(100,160),28,SCORE_COLOR_DIMM,rl);
			ml.wordCnt = drawText(wt.length.toString(),cc.p(100,130),28,SCORE_COLOR_BRIGHT,rl);			

			// draw most valuable word
			drawText(mg.t.score_bar_mvw1,cc.p(100,272),24,SCORE_COLOR_DIMM,rl);
			ml.bestWordValue = drawText(mg.t.score_bar_mvw2+": "+(bw? bw.value:""),cc.p(100,244),24,SCORE_COLOR_DIMM,rl);
			ml.bestWordSprite = drawWordSprite(bw? bw.word:"",cc.p(100,214),ml.bestWordSprite,rl);							
		
			// draw the word sprite and the number of letters
			sb.wordIconSprite = drawWordSprite("PUNK",cc.p(60+ml.maxWordLength*10,20),sb.wordIconSprite,sb);							
			
			// draw the level and the level label
			drawText(mg.t.score_bar_level,cc.p(35,80),28,SCORE_COLOR_DIMM,sb);		
			sb.currentLevel = drawText(ml.currentLevel,cc.p(30,40),84,SCORE_COLOR_BRIGHT,sb);		

		} else {
			var wt = mg.wordTreasure,
				bw = ml.wordTreasureBestWord;

			ml.score.setString(ml.totalPoints.toString());
			ml.highscore1.setString(mg.maxPoints.toString());
			ml.highscore2.setString(mg.maxPoints.toString());
			ml.wordCnt.setString(wt.length);
			ml.bestWordValue.setString(mg.t.score_bar_mvw2+": "+(bw? bw.value:""));
			sb.currentLevel.setString(ml.currentLevel);
			if( newSprite ) {
				var wc = [],
					s = ml.selections;
				
				for( var i=0 ; i<s.length ; i++) {
					for( var j=0 ; j<s[i].words.length ; j++ ) {
						if( s[i].words[j].word.length === ml.maxWordLength ) wc.push(s[i].words[j].word);
					}
				}
				sb.wordIconSprite = drawWordSprite(
					wc.length?wc[parseInt(Math.random()*wc.length)]:"CYPHERPUNK".substr(-ml.maxWordLength,ml.maxWordLength),
						cc.p(60+ml.maxWordLength*10,20),
						sb.wordIconSprite,
						sb);
				if( !ml.wordIconSpriteIsBlinking && wc.length ) {
					ml.wordIconSpriteIsBlinking = true;
					sb.wordIconSprite.runAction(cc.sequence(cc.blink(5,25),cc.callFunc(function() {
						ml.wordIconSpriteIsBlinking = false;
					})));
				}
				
				ml.bestWordSprite = drawWordSprite(bw? bw.word:"",cc.p(100,214),ml.bestWordSprite,rl);
			}
		}
	};

	var moveRollingLayer = function(stage) {

		if( stage != undefined ) ml.rollingLayerStage = stage;
		else if( ++ml.rollingLayerStage > 3 ) {
			ml.rollingLayer.setPosition(0,0);
			ml.rollingLayerStage = 1;
		}
		
		if( !ml.layerIsRolling ) {
			ml.layerIsRolling = true;
			ml.rollingLayer.runAction(
				cc.sequence(
					cc.EaseSineOut.create(
						cc.moveTo(1,cc.p(0,-ml.rollingLayerStage*BOXES_Y_OFFSET))
					),
					cc.callFunc(function() {
						ml.layerIsRolling = false;
					})
				)
			);			
		}
	}
	
	var startProgram = function(program) {
	    // start program
	    curProgram = program;
	    curProgramCnt = 0;
	};
	
	var incCurrentProgram = function() {
		if( ++curProgramCnt >= TILES_PROGRAMS[curProgram].length ) {
			curProgram = null;
			curProgramCnt = null;
		}
	};
	
	/*
	 * hookLoadImages
	 * 
	 * Called before default images for tiles are loaded
	 * 
	 */
	muprisLayer.hookLoadImages = function() {
		cc.spriteFrameCache.addSpriteFrames(res.letters_plist);
	    var lettersTexture = cc.textureCache.addImage(res.letters_png),
	    	lettersImages  = cc.SpriteBatchNode.create(lettersTexture,200);
	    muprisLayer.addChild(lettersImages, 2, TAG_SPRITE_MANAGER);
	};
	
	muprisLayer.hookStartGame = function() {
	    startProgram(0);
	    
        // global data init
        var ls = cc.sys.localStorage,
        	json = ls.getItem("wordTreasure") || [],
        	wt = mg.wordTreasure = json.length? JSON.parse(json) : [];
        	
		mg.maxPoints = ls.getItem("maxPoints") || 0;
		
		// points array
		ml.pointsToAdd = [];
		ml.totalPoints = 0;
		ml.rollingLayerStage = 0;
		ml.currentLevel = 1;
		ml.maxWordLength = 4;
		
		for( var i=1,bw=0 ; i<wt.length ; i++ ) if( wt[i].value > wt[bw].value ) bw = i;
		ml.wordTreasureBestWord = wt[bw] || null;
		
		// remove all words that are already in the treasure
		for( var i=0 ; i<wt.length ; i++) {
			var prefix = wt[i].word.substr(0,3);
				words = mg.words[prefix];
			for( var j=words? words.length-1 : 0 ; words && j>=0 ; j-- ) {
				if( words[j].word === wt[i].word ) {
					words.splice(j,1);
					if( words.length === 0 ) {
						delete mg.words[prefix];
					}
					break;
				}				
			}
		}
		
		drawScoreBar();
	};
	
	muprisLayer.hookEndGame = function() {
        var ls = cc.sys.localStorage;

		ls.setItem("wordTreasure" , JSON.stringify(mg.wordTreasure));
		ls.setItem("maxPoints",mg.maxPoints);
	};

	/*
	 * hookSetTile
	 * 
	 * Called before building a tile to choose a tile
	 * 
	 * Param: none 
	 * 
	 */
	muprisLayer.hookSetTile = function() {
		moveRollingLayer();
		
		if( curProgram !== null ) return TILES_PROGRAMS[curProgram][curProgramCnt].tile;
		else return ml.getRandomValue(TILE_OCCURANCES);
	};

	/*
	 * hookSetTileImages
	 * 
	 * Called while building a tile to set the images of the tile boxes
	 * 
	 * Param: tileBoxes: metrics of the boxes 
	 * 
	 */
	muprisLayer.hookSetTileImages = function(tileBoxes, newTile, p, userData) {

		var tileSprite = cc.Sprite.create(res.letters_png,cc.rect(0,0,0,0)),
			batch = this.getChildByTag(TAG_SPRITE_MANAGER);
				
		tileSprite.retain();
		tileSprite.setPosition(p);
		batch.addChild(tileSprite);

        // add single boxes with letters to the tile
        for( var i=0 ; i<tileBoxes.length ; i++) {
        	
        	var sw = ml.selectedWord;
        	if( curProgram !== null ) {
        		var val = LETTERS.indexOf(TILES_PROGRAMS[curProgram][curProgramCnt].letters[i]);
        	} else {
	         	var len = sw && sw.missingLetters.length;
	         		prob = len <= 3? NEEDED_LETTERS_PROBABILITY / (5-len) : NEEDED_LETTERS_PROBABILITY; 
	         		val = (Math.random()>prob || !sw || !len)?  
	        					Math.floor(this.getRandomValue(LETTER_OCCURANCES)):
	        					LETTERS.indexOf(sw.missingLetters[Math.floor(Math.random()*sw.missingLetters.length)]);
        	}
       					
    		var	spriteFrame = cc.spriteFrameCache.getSpriteFrame(LETTER_NAMES[val]),
    			sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,BS,BS));
    	
    		sprite.retain();
        	sprite.setPosition(cc.p(tileBoxes[i].x,tileBoxes[i].y));
        	userData[i] = LETTERS[val];
	        tileSprite.addChild(sprite);
        }
        
        if( curProgram !== null ) incCurrentProgram();
        
        return tileSprite;
	};	
	
	muprisLayer.hookTileFixed = function( brcs ) {
		
		ml.lastBrcs = brcs;
		
		// selections are set before deleting, so if autoSelect is enabled you cannot delete a selection
		
		var ret = setSelections(ml.dontAutoSelectWord? true : false);
		// when first first is found turn off auto select
		if( ret ) ml.dontAutoSelectWord = true;
		return ret;
	};	
	
	muprisLayer.hookDeleteBox = function(brc) {
		var sw = ml.selectedWord,
			box = ml.boxes[brc.row][brc.col];

		var lb = ml.lastBrcs,
			newBox = false;
		if( lb ) {
			for( var i=0 ; i<lb.length ; i++) 
				if( lb[i].row === brc.row && lb[i].col === brc.col ) 
					break;
			if( i<lb.length ) newBox = true;
		}
		if( sw && sw.brc.row === brc.row && (
				sw.markers[brc.col-sw.brc.col] === MARKER_SET || 
				sw.markers[brc.col-sw.brc.col] === MARKER_SEL || 
				newBox && sw.markers[brc.col-sw.brc.col] === MARKER_OPT
			)
		) return false;

		// Score
		var value = box && (mg.letterValues[box.userData] || 0) * (brc.row + 1);
		if( value ) addPoints(value, cc.p(BOXES_X_OFFSET + brc.col * BS + BS/2, BOXES_Y_OFFSET + brc.row * BS + BS));
		
		return true;
	};
	
	muprisLayer.hookMoveBoxDown = function(to,from) {		
		// check if selected word has to move
		var sw = ml.selectedWord;
		if( sw && sw.brc.row === from.row && sw.brc.col === from.col ) {
			sw.brc.row = to.row;
			sw.brc.col = to.col;
		}
		// check if one of the other selections have to be moved
		var s = ml.selections;
		for( var i=0 ; i<s.length ; i++) {
			if( s[i].brc.row === from.row && s[i].brc.col === from.col ) {
				s[i].brc.row = to.row;
				s[i].brc.col = to.col;
			}
		}
	};
	
	muprisLayer.hookAllBoxesMovedDown = function() {
		setSelections(true);
	};
	
	muprisLayer.hookOnTap = function(tapPos) {
		var sw = ml.selectedWord;
		if( sw ) {
			var swPos = { 
					x: BOXES_X_OFFSET + sw.brc.col * BS,
					y: BOXES_Y_OFFSET + sw.brc.row * BS
			};			
		} 
		
		// check if selected word is hit
		if( sw && tapPos.x >= swPos.x && tapPos.y >= swPos.y - BS && tapPos.y <= swPos.y + BS ) {
			var col = Math.floor((tapPos.x - swPos.x)/BS),
				marker = sw.markers[col];
			if( marker === MARKER_OPT || marker === MARKER_SEL ) {
				cc.assert(ml.boxes[sw.brc.row][sw.brc.col+col].sprite, "Mupris, hookOnTap: There must be a sprite at position "+sw.brc.row+"/"+(sw.brc.col+col)+".");
				if( marker === MARKER_OPT ) {
					sw.markers[col] = MARKER_SEL;
					ml.boxes[sw.brc.row][sw.brc.col+col].sprite.setOpacity(255);	
				} else {
					sw.markers[col] = MARKER_OPT;					
					ml.boxes[sw.brc.row][sw.brc.col+col].sprite.setOpacity(UNSELECTED_BOX_OPACITY);	
				}
				updateSelectedWord();
			} else {
				unselectWord();
				setSelections(true);
			}
		} else {
			for( var i=0 ; i<ml.selections.length ; i++) {
				var s = ml.selections[i];

				if( tapPos.x >= s.pos.x && tapPos.x <= s.pos.x+s.width && tapPos.y >= s.pos.y && tapPos.y <= s.pos.y+s.height ) {
					moveSelectedWord(s.brc);
					setSelections(true);
					if( s.box[0].words ) blowWords(cc.p(s.pos.x,s.pos.y),s.box[0].words);
				}
			}
		}
		

	};
	
	muprisLayer.hookOnLongTap = function(tapPos) {
		var sw = ml.selectedWord;
		if( sw ) {
			var swPos = { 
					x: BOXES_X_OFFSET + sw.brc.col * BS,
					y: BOXES_Y_OFFSET + sw.brc.row * BS
			};			
		} 
		
		// check if selected word is hit
		if( sw && tapPos.x >= swPos.x && tapPos.y >= swPos.y && tapPos.y <= swPos.y + BS*2 ) {
			cc.log("MUPRIS, hookOnLongTap: Blowing "+ml.boxes[sw.brc.row][sw.brc.col].words.length+" words.");
			blowWords(tapPos,ml.boxes[sw.brc.row][sw.brc.col].words);
		}
	};
	
	muprisLayer.hookUpdate = function(dt) {
		if( !ml.pointsToAddCnt && ml.pointsToAdd.length ) {
			ml.pointsToAddCnt = 3;
			ml.totalPoints += parseInt(ml.pointsToAdd.splice(0,1));
			
			// highscore?
			if( ml.totalPoints > mg.maxPoints ) {
				mg.maxPoints = ml.totalPoints;
				
				moveRollingLayer(0);
			}

			drawScoreBar();

			// next level?
			if( ml.totalPoints >= LEVEL_SCORES[ml.currentLevel+1] && ml.currentLevel < 7 ) {
				ml.currentLevel++;
				ml.maxWordLength++;
				drawScoreBar(true);

				var text = [{t:mg.t.new_level_level,scale:5} , {t:ml.currentLevel,scale:10}];
				for( var i=0 ; i<2 ; i++ ) {
					label = cc.LabelTTF.create(text[i].t, "res/fonts/American Typewriter.ttf", 160);
					label.setPosition(ml.size.width/2,ml.size.height/2);
					label.setScale(0.1,0.1);
					label.setColor(cc.color(0,128,0));
					ml.addChild(label, 5);
					label.runAction(
						cc.sequence(
							cc.delayTime(i/2),
							cc.spawn(
								cc.scaleTo(2, text[i].scale),
								cc.fadeTo(2,0)
							),
							cc.callFunc(function() {
								ml.removeChild(this);
							}, label)
						)
					);
				}
			}
		} else if( ml.pointsToAddCnt ) {
			ml.pointsToAddCnt--;
		}
	};
	
	
	var loadLanguagePack = function( pack ) {
		
		var filename = i18n_language_packs[pack];
		cc.loader.loadJson("res/i18n/"+filename, function(err, json) {
			if( !err ) {
				var lg = mg.languagePack = json;
				mg.t = lg.apptext;
				
				cc.loader.loadJson("res/words/"+lg.wordlist+".words.json", function(err, json) {
					if( !err ) {
						mg.words = json;

						cc.loader.loadJson("res/words/"+lg.wordlist+".letters.json", function(err, json) {
							if( !err ) {
								mg.letterValues = json;

							} else {
								throw err;
							}
						});
						
						// check if word file is compatible
						for( var prefix in json ) {
							var words = json[prefix];
							cc.assert(words && words[0].word, "Mupris, json loader: Prefix "+prefix+" has no words.");
							for( var j=0 ; j<words.length ; j++ ) {
								cc.assert(words[j].word.length >=4 && words[j].word.length <= BOXES_PER_ROW, 
										"Mupris, json loader: Word '"+words[j].word+"' has wrong length.");	
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
	if( !mg.languagePack ) {
		loadLanguagePack(2);
	}
}
