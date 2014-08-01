	/*
 * Enhancement module for Mupris
 * 
 * NEXT STEPS:
 * 
 * + FEHLER
 * - Buchstabe V erscheint bei Wortwert 4
 * 
 * + GAMEPLAY
 * - buy:
 * 		single box tile for > 1000 coins
 * 		if spare money is there, than icon appears
 * - present fitting tiles for tileValues, if no possible tile is there
 * - new score bar
 * 		- left side score with next level score
 * 		- rolling 1: Level
 * 
 * + WORTSCHATZ
 * - show wortschatz
 * 
 * + INTERNATIONALIZATION
 * - english words
 * - mulitligual programs
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

$MU.LETTER_NAMES = ["a.png","b.png","c.png","d.png","e.png","f.png","g.png","h.png","i.png","j.png","k.png","l.png","m.png","n.png","o.png","p.png","q.png","r.png","s.png","t.png","u.png","v.png","w.png","x.png","y.png","z.png","ae.png","oe.png","ue.png","6.png"],
$MU.LETTERS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","Ä","Ö","Ü","Õ"],
$MU.LEVEL_SCORE = [0,   500,  1000,  1500,  2000,  3000,  4000,  5000,  6000,  8000, 10000,
                      12000, 14000, 16000, 18000, 20000, 25000, 30000, 35000, 40000, 50000,
                      60000, 70000, 80000, 90000,100000,110000,120000,130000,140000,150000,
                     160000,180000,200000,220000,240000,260000,280000,300000,320000,350000,
                     400000,500000
                   ];
$MU.MARKER_SET = 1;
$MU.MARKER_OPT = 2;
$MU.MARKER_SEL = 3;
$MU.START_MARKER_X_OFFSET = -18;
$MU.START_MARKER_Y_OFFSET = $MU.BS/2;
$MU.MARKER_X_OFFSET = $MU.BS/2;
$MU.MARKER_Y_OFFSET = -30;
$MU.UNSELECTED_BOX_OPACITY = 128;
$MU.NEEDED_LETTERS_PROBABILITY = 0.5;
$MU.MAX_LETTERS_BLOWN = 20;
$MU.WORD_FRAME_WIDTH = 8;
$MU.WORD_FRAME_MOVE_TIME = 0.8;
$MU.SCORE_ROW_MULTIPLYER = 0.1;
$MU.SCORE_WORD_MULTIPLYER = 15;
$MU.SCORE_COLOR_DIMM = cc.color(160,120,55);
$MU.SCORE_COLOR_BRIGHT = cc.color(240,170,70);
$MU.TILES_PROGRAMS = [[
      { tile: 0, letters: "ANNA" },
   ]
];

var MUPRIS_MODULE = function(muprisLayer) {

	var mg = MUPRIS_GLOBALS,
		ml = muprisLayer;
	
	// go through box array and look for prefixes
	var setSelections = function( dontSelectWord ) {
		var s = [],
			sw = ml.selectedWord,
			nsw = null;

		for( var i=0 ; i<$MU.BOXES_PER_COL ; i++) {
			// dim all boxes in a row
			for( var j=0 ; j<$MU.BOXES_PER_ROW ; j++ ) {
				var box = ml.boxes[i][j];				
				if( box && box.sprite ) box.sprite.setOpacity($MU.UNSELECTED_BOX_OPACITY);				
			}
			// check all boxes for word starts (prefixes)
			for( var j=0 ; j<$MU.BOXES_PER_ROW-2 ; j++ ) {
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
						width: $MU.BS * 3,
						height: $MU.BS,
						words: words,
						pos: {
							x: $MU.BOXES_X_OFFSET + brc.col * $MU.BS,
							y: $MU.BOXES_Y_OFFSET + brc.row * $MU.BS,
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
		cc.log("Mupris, setSelections: calling updateSelectedWord()");
		//return updateSelectedWord();
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

			for( var i=words.length-1 ; i>=0 ; i-- ) {
				if( brc.col + words[i].word.length > $MU.BOXES_PER_ROW || words[i].value > mg.maxWordValue ) {
					words.splice(i,1);
				}
			}
			
			if( words.length > 0 ) {
				cb(brc,words);
			}
		}
	};
	
	// update selected word
	var updateSelectedWord = function() {
		var sw = ml.selectedWord,
		batch = ml.getChildByTag($MU.TAG_SPRITE_MANAGER);
		
		if( !sw ) return false;
		
		// Define sprites and show word start sprite
		var setMarkerFrame = [],
			optMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker1.png"),
			selMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker3.png");
		
		setMarkerFrame[0] = cc.spriteFrameCache.getSpriteFrame("marker0-0.png");
		setMarkerFrame[1] = cc.spriteFrameCache.getSpriteFrame("marker0-1.png");
		
		if( !sw.startMarker ) {
			sw.startMarker = cc.Sprite.create(cc.spriteFrameCache.getSpriteFrame("marker2.png"),cc.rect(0,0,$MU.BS,$MU.BS));
			sw.startMarker.retain();			
			sw.startMarker.setPosition(cc.p($MU.BOXES_X_OFFSET + sw.brc.col * $MU.BS + $MU.START_MARKER_X_OFFSET,
											$MU.BOXES_Y_OFFSET + sw.brc.row * $MU.BS + $MU.START_MARKER_Y_OFFSET));
			batch.addChild(sw.startMarker,5);
		}
		var pos = sw.startMarker.getPosition(),
			row = Math.round(pos.y-$MU.BOXES_Y_OFFSET-$MU.START_MARKER_Y_OFFSET)/$MU.BS;
		if( row != sw.brc.row ) {
			var rows = row - sw.brc.row;
			sw.startMarker.runAction(cc.moveBy($MU.MOVE_SPEED*rows, cc.p(0,-$MU.BS*rows)));			
		}

		// Mark letters
		// First look for all words that are still possible, looking at the markers set
		var curWords = sw.words.slice(),
			missingLetters = "";
		for( var i=sw.brc.col ; i<$MU.BOXES_PER_ROW ; i++) {
			var col = i-sw.brc.col;
			if( sw.markers[col] === $MU.MARKER_SEL ) {
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
			for( var i=3 ; i<sw.markers.length ; i++ ) if( sw.markers[i] === $MU.MARKER_SEL || sw.markers[i] === $MU.MARKER_SET ) sw.markers[i] = null;
		}
		for( var i=sw.brc.col ; i<$MU.BOXES_PER_ROW ; i++) {
			var col = i-sw.brc.col;
			// remove old sprite
			if( sw.sprites[col] ) batch.removeChild( sw.sprites[col] );
			sw.sprites[col] = null;
			for( var j=curWords.length-1,hits=0 ; j>=0 ; j-- ) {
				// look if the letter in the box matches the letter in the word 
				if(ml.boxes[sw.brc.row][i] && curWords[j].word[col] === ml.boxes[sw.brc.row][i].userData ) hits++;
				else if( curWords[j].word[col] ) missingLetters += curWords[j].word[col];
			}
			if( sw.markers[col] === $MU.MARKER_SEL && hits > 0 ) {
				// if the user marked the letter, than show marker select sprite
				sw.sprites[col] = cc.Sprite.create(selMarkerFrame,cc.rect(0,0,$MU.BS,$MU.BS));
				ml.boxes[sw.brc.row][i].sprite.setOpacity(255);	
			} else if( sw.markers[col] === $MU.MARKER_SET || hits === curWords.length ) {
				// just set sprite opacity to full
				// letter in box matches with all words, draw sprite
				sw.markers[col] = $MU.MARKER_SET;
				sw.sprites[col] = cc.Sprite.create(
					setMarkerFrame[Math.floor(Math.random()*setMarkerFrame.length)],
					cc.rect(0,0,$MU.BS,$MU.BS)
				);
				ml.boxes[sw.brc.row][i].sprite.setOpacity(255);	
			} else if( hits === 0 ) {
				// letter in box matches with no word
				sw.markers[col] = null;
			} else {
				// letter in box matches with some words, draw marker option sprite
				sw.markers[col] = $MU.MARKER_OPT;
				sw.sprites[col] = cc.Sprite.create(optMarkerFrame,cc.rect(0,0,$MU.BS,$MU.BS));					
				ml.boxes[sw.brc.row][i].sprite.setOpacity($MU.UNSELECTED_BOX_OPACITY);	
			}
			
			if( hits > 0 ) {
				sw.sprites[col].retain();
				batch.addChild(sw.sprites[col],5);
				sw.sprites[col].setPosition(cc.p($MU.BOXES_X_OFFSET + i * $MU.BS + $MU.MARKER_X_OFFSET, 
						   						 $MU.BOXES_Y_OFFSET + sw.brc.row * $MU.BS + $MU.MARKER_Y_OFFSET));
			}	
			if( sw.sprites[col] ) {
				var pos = sw.sprites[col].getPosition(),
					row = Math.round(pos.y-$MU.BOXES_Y_OFFSET-$MU.MARKER_Y_OFFSET)/$MU.BS;
				if( row != sw.brc.row ) {
					var rows = row - sw.brc.row;
					sw.sprites[col].runAction(cc.moveBy($MU.MOVE_SPEED*rows, cc.p(0,-$MU.BS*rows)));			
				}
			}
		}
		
		sw.missingLetters = missingLetters;
		
		// look if all marked letters form a complete word, then make them green
		for( var i=0 ; i<curWords.length ; i++ ) {
			var word = curWords[i].word;
			for( var j=0 ; j<word.length ; j++ ) {
				if( !ml.boxes[sw.brc.row][j+sw.brc.col] || 
					word[j] !== ml.boxes[sw.brc.row][j+sw.brc.col].userData /*|| 
				   (sw.markers[j] !== $MU.MARKER_SET && sw.markers[j] !== $MU.MARKER_SEL)*/) 
						break;
			}
			if( j === word.length ) {
				// delete word anyway
				var ret = deleteWordFromList(word);
				cc.assert(ret,"Mupris, updateSelectedWord: "+word+" is not in the list!");

				showFullWordAndAsk( sw.brc , word , function( takeWord ) {					
					if( takeWord ) {
						// delete complete row
						var row = sw.brc.row;
						for( var j=0, value=0 ; j<word.length ; j++ ) {
							// calculate points and let them fly ...
							var v = mg.letterValues[word[j]],
								points = parseInt(v * mg.maxWordValue * 2 * ((sw.brc.row*$MU.SCORE_ROW_MULTIPLYER)+1) * (word.length-3));
							value += v;
							addPoints(points, cc.p($MU.BOXES_X_OFFSET + (sw.brc.col+j) * $MU.BS + $MU.BS/2, $MU.BOXES_Y_OFFSET + sw.brc.row * $MU.BS + $MU.BS), true);							
						}
						// put word into treasure
						var ls = cc.sys.localStorage,
							w = {
								word: word,
								value: value
							};
						mg.wordTreasure.push(w);
						if( !ml.wordTreasureBestWord || ml.wordTreasureBestWord.value < w.value ) {
							ml.wordTreasureBestWord = w;
						}
						unselectWord();
						ml.checkForAndRemoveCompleteRows(row);
						setSelections();
						drawScoreBar(true);

						ls.setItem("wordTreasure" , JSON.stringify(mg.wordTreasure));
					} else {
						ml.checkForAndRemoveCompleteRows();
						setSelections();
						moveSelectedWord(sw.brc);
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
		var batch = ml.getChildByTag($MU.TAG_SPRITE_MANAGER),
			width = word.length * $MU.BS,
			height = $MU.BS,
			x = $MU.BOXES_X_OFFSET + brc.col * $MU.BS + width/2,
			y = $MU.BOXES_Y_OFFSET + brc.row * $MU.BS + height/2;
		
		// create yellow frame sprite
		var wordFrameFrame  = cc.spriteFrameCache.getSpriteFrame("wordframe.png");
		
		var	wordFrameSprite = cc.Sprite.create(wordFrameFrame),
			rect = wordFrameSprite.getTextureRect();
		wordFrameSprite.retain();
		rect.width = width + $MU.WORD_FRAME_WIDTH * 2;
		rect.height = height + $MU.WORD_FRAME_WIDTH * 2;
		wordFrameSprite.setTextureRect(rect);
		wordFrameSprite.setPosition(x,y);
		batch.addChild(wordFrameSprite,15);
		
		// add sprites of word
		for( var i=0 ; i<word.length ; i++) {
			cc.assert( ml.boxes[brc.row][brc.col+i].sprite , "Mupris, showFullword: Sprite is missing in box at position "+brc.row+"/"+brc.col );
			
			var orgSprite = ml.boxes[brc.row][brc.col+i].sprite,
				sprite = cc.Sprite.create(orgSprite.getTexture(),orgSprite.getTextureRect());
			sprite.setPosition($MU.BS/2+i*$MU.BS+$MU.WORD_FRAME_WIDTH,$MU.BS/2+$MU.WORD_FRAME_WIDTH);
			sprite.retain();
			wordFrameSprite.addChild( sprite );
		}
		
		// move, rotate and scale word
		var bezier = [
		      cc.p(x,y),
              cc.p(x<ml.size.width/2?ml.size.width:0,ml.size.height/2),
              cc.p(ml.size.width/2,ml.size.height-300)];

		wordFrameSprite.runAction(cc.EaseSineIn.create(cc.bezierTo($MU.WORD_FRAME_MOVE_TIME,bezier)));
		//wordFrameSprite.runAction(cc.rotateBy($MU.WORD_FRAME_MOVE_TIME,-360));
		wordFrameSprite.runAction(cc.EaseSineIn.create(
			cc.sequence(
				cc.EaseSineOut.create(
					cc.scaleTo($MU.WORD_FRAME_MOVE_TIME/2,1.5)
				),
				cc.EaseSineIn.create(
					cc.scaleTo($MU.WORD_FRAME_MOVE_TIME/2,0.95)
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
        				value.setPosition(pos.x , pos.y + $MU.BS + 10);
        				value.retain();
        				value.setColor(cc.color(200,160,0));
        				sprite.addChild(value, 5);	    					
    				}
    				var value = cc.LabelTTF.create(mg.t.take_word_wordvalue+": "+sum, "Arial", 48);
					value.setPosition(sprite.getTextureRect().width/2 , pos.y + $MU.BS * 2 + 10);
					value.retain();
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
		if( sw ) unselectWord();
		
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
		
		cc.assert(nsw, "Mupris, selectBestWord: No word to select.");

		ml.selectedWord = nsw;		
		var x = $MU.BOXES_X_OFFSET + nsw.brc.col*$MU.BS + 1.5*$MU.BS,
			y = $MU.BOXES_Y_OFFSET + nsw.brc.row*$MU.BS + 1.5*$MU.BS;
		
		blowWords(cc.p(x,y),nsw.words);
		
		updateSelectedWord();
		
	};
	
	var moveSelectedWord = function(brc) {
		var sw = ml.selectedWord;
		
		if( sw ) {
			ml.boxes[sw.brc.row][sw.brc.col].markers = sw.markers;
			
			// delete old sprites
			var batch = ml.getChildByTag($MU.TAG_SPRITE_MANAGER);
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
				
				cc.log("Mupris, moveSelectedWord: calling updateSelectedWord()");
				updateSelectedWord();

			} else {
				ml.selectedWord = null;
			}
		} else {
			ml.selectedWord = null;
		}		
	};
	
	var unselectWord = function() {
		moveSelectedWord(null);
	}
	
	var blowWords = function(pos, words) {

		var angle = Math.random() * 360,
			offset = (words.length < $MU.MAX_LETTERS_BLOWN)? 0:
				Math.floor(Math.random()*words.length);
		for( var i=0 ; i<Math.min(words.length,$MU.MAX_LETTERS_BLOWN) ; i++ ) {
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
		
		var label = cc.LabelBMFont.create( text , "res/fonts/amtype"+size+".fnt" , cc.LabelAutomaticWidth, cc.TEXT_ALIGNMENT_LEFT, cc.p(0, 0) );
		label.setPosition(pos);
		label.retain();
		label.setColor(color);
		parent.addChild(label, 5);	
		
		return label;
	};
	
	var drawWordSprite = function(word,pos,wordSprite,scale,parent) {
		// create yellow frame sprite
		if( !wordSprite ) {
			var wordFrameFrame  = cc.spriteFrameCache.getSpriteFrame("wordframe.png"),
				wordFrameSprite = cc.Sprite.create(wordFrameFrame),
				rect = wordFrameSprite.getTextureRect();
			wordFrameSprite.retain();
			rect.width = word.length? word.length * $MU.BS + $MU.WORD_FRAME_WIDTH * 2 : 80;
			rect.height = word.length? $MU.BS + $MU.WORD_FRAME_WIDTH * 2 : 8;
			wordFrameSprite.setTextureRect(rect);
			wordFrameSprite.setPosition(pos.x,pos.y);
			wordFrameSprite.setScale(scale || 0.3);
			parent.addChild(wordFrameSprite,4);
		} else {
			var wordFrameSprite = wordSprite,
				rect = wordFrameSprite.getTextureRect();
			rect.width = word.length? word.length * $MU.BS + $MU.WORD_FRAME_WIDTH * 2 : 80;
			rect.height = word.length? $MU.BS + $MU.WORD_FRAME_WIDTH * 2 : 8;
			wordFrameSprite.setTextureRect(rect);
			wordFrameSprite.removeAllChildren(true);
		}
		// add sprites of word
		for( var i=0 ; i<word.length ; i++) {
			
			var file = $MU.LETTER_NAMES[$MU.LETTERS.indexOf(word[i])],
				spriteFrame = cc.spriteFrameCache.getSpriteFrame(file),
				sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,$MU.BS,$MU.BS));
			sprite.setPosition($MU.BS/2+i*$MU.BS+$MU.WORD_FRAME_WIDTH,$MU.BS/2+$MU.WORD_FRAME_WIDTH);
			sprite.retain();
			wordFrameSprite.addChild( sprite );
		}		
		
		return wordFrameSprite;
	}
	
	var drawScoreBar = function(newSprite) {
		var sb = ml.scoreBar;
		if( !sb ) {
			
		    // draw score bar
		    var sb = ml.scoreBar = new cc.LayerColor(cc.color(128,0,0,0),ml.size.width,$MU.BOXES_Y_OFFSET);
		    sb.setPosition(0,0);
		    sb.setOpacity(0);
			sb.retain();
			ml.addChild(sb, 5);
			
			// draw total points
			ml.score = drawText(ml.totalPoints.toString(),cc.p(105,40),72,$MU.SCORE_COLOR_BRIGHT,sb);
			ml.nextScore = drawText("+ "+$MU.LEVEL_SCORE[ml.currentLevel].toString(),cc.p(105,80),24,$MU.SCORE_COLOR_DIMM,sb);
			
			// draw clipping rect
	        var clipper = cc.ClippingNode.create();
	        clipper.width = 440;
		    clipper.height = $MU.BOXES_Y_OFFSET;
	        clipper.anchorX = 0.5;
	        clipper.anchorY = 0.5;
	        clipper.x = 420;
	        clipper.y = $MU.BOXES_Y_OFFSET / 2;

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
				bw = ml.wordTreasureBestWord,
				len = bw? bw.word.length : 0;

			// draw the level and the level label
			drawText(mg.t.score_bar_level,cc.p(405,82),24,$MU.SCORE_COLOR_DIMM,rl);		
			sb.currentLevel = drawText(ml.currentLevel,cc.p(400,45),84,$MU.SCORE_COLOR_BRIGHT,rl);		

			// draw the word sprite and the number of letters
			sb.wordIconText = drawText(mg.t.score_bar_no_word,cc.p(185,75),24,$MU.SCORE_COLOR_BRIGHT,rl);		
			sb.wordIconSprite = drawWordSprite("",cc.p(185,35),sb.wordIconSprite,0.47,rl);							

			// draw highscore into clipper
			drawText(mg.t.score_bar_highscore,cc.p(100,171),24,$MU.SCORE_COLOR_DIMM,rl);			
			ml.highscore = drawText(mg.maxPoints.toString(),cc.p(100,130),48,$MU.SCORE_COLOR_BRIGHT,rl);	
			
			// draw most valuable word
			ml.bestWordValue = drawText(mg.t.score_bar_mvw+": "+(bw? bw.value:""),cc.p(300,171),24,$MU.SCORE_COLOR_DIMM,rl);
			ml.bestWordSprite = drawWordSprite(bw? bw.word:"",cc.p(300,130),ml.bestWordSprite,0.38,rl);							
		} else {
			var wt = mg.wordTreasure,
				bw = ml.wordTreasureBestWord;

			ml.score.setString(ml.totalPoints.toString());
			ml.nextScore.setString("+ "+$MU.LEVEL_SCORE[ml.currentLevel].toString());

			ml.highscore.setString(mg.maxPoints.toString());
			ml.bestWordValue.setString(mg.t.score_bar_mvw+": "+(bw? bw.value:""));
			sb.currentLevel.setString(ml.currentLevel);
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
				sb.wordIconText.setString(max?mg.t.score_bar_wordvalue+": "+max:mg.t.score_bar_no_word);
//				sb.wordIconSprite = drawWordSprite(word,cc.p(185,35),sb.wordIconSprite,0.47,sb);
//				ml.bestWordSprite = drawWordSprite(bw? bw.word:"",cc.p(300,130),ml.bestWordSprite,0.37,rl);
				sb.wordIconSprite = drawWordSprite("CYPHERPUNK",cc.p(185,35),sb.wordIconSprite,0.47,sb);
				ml.bestWordSprite = drawWordSprite("CYPHERPUNK",cc.p(300,130),ml.bestWordSprite,0.37,rl);
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
		
			cc.log("Mupris, moveRollingLayer: Starting rolling ...")
			ml.layerIsRolling = true;
			ml.rollingLayer.runAction(
				cc.EaseSineOut.create(
					cc.moveTo(1,cc.p(0,-ml.rollingLayerStage*$MU.BOXES_Y_OFFSET))
				)
			);
			if( ml.rollingLayerDelay ) {
				cc.log("Mupris, moveRollingLayer: Killing old delay ...")
				ml.rollingLayer.stopAction(ml.rollingLayerDelay);
			}
			cc.log("Mupris, moveRollingLayer: Starting delay ...")
			ml.rollingLayerDelay = ml.rollingLayer.runAction(
				cc.sequence( 
					cc.delayTime(delay || 1),
					cc.callFunc(function() {
						cc.log("Mupris, moveRollingLayer: ... ending delay.")
						ml.layerIsRolling = false;
						ml.rollingLayerDelay = null;
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
		if( ++curProgramCnt >= $MU.TILES_PROGRAMS[curProgram].length ) {
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
	    muprisLayer.addChild(lettersImages, 2, $MU.TAG_SPRITE_MANAGER);
	};
	
	muprisLayer.hookStartGame = function() {
	    startProgram(0);
	    
        // global data init
        var ls = cc.sys.localStorage,
        	json = ls.getItem("wordTreasure") || [],
        	wt = mg.wordTreasure = json.length? JSON.parse(json) : [];
        	
		mg.maxPoints = ls.getItem("maxPoints") || 0;
		mg.maxWordValue = ls.getItem("maxWordValue") || 10;
		
		// points array
		ml.pointsToAdd = [];
		ml.totalPoints = 223432;
		ml.rollingLayerStage = 0;
		ml.currentLevel = 42;
		ml.dontAutoSelectWord = false;
		
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
		
//        var label1 = cc.LabelBMFont.create("Test", "res/fonts/testxxx.fnt");
//        label1.x = 100;
//        label1.y = 100;
//        ml.addChild(label1,100);

		drawScoreBar();
	};
	
	muprisLayer.hookEndGame = function() {
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
		if( curProgram !== null ) return $MU.TILES_PROGRAMS[curProgram][curProgramCnt].tile;
		else return ml.getRandomValue($MU.TILE_OCCURANCES);
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
			batch = this.getChildByTag($MU.TAG_SPRITE_MANAGER);
				
		tileSprite.retain();
		tileSprite.setPosition(p);
		batch.addChild(tileSprite);

        // add single boxes with letters to the tile
        for( var i=0 ; i<tileBoxes.length ; i++) {
        	
        	var sw = ml.selectedWord;
        	if( curProgram !== null ) {
        		var val = $MU.LETTERS.indexOf($MU.TILES_PROGRAMS[curProgram][curProgramCnt].letters[i]);
        	} else {
	         	var len = sw && sw.missingLetters.length,
         			prob = len <= 3? $MU.NEEDED_LETTERS_PROBABILITY / (5-len) : $MU.NEEDED_LETTERS_PROBABILITY; 
        		for( var j=0 ; j<5 ; j++ ) {
	         		val = (Math.random()>prob || !sw || !len)?  
	         					Math.floor(this.getRandomValue(mg.letterOccurences)):
	        					$MU.LETTERS.indexOf(sw.missingLetters[Math.floor(Math.random()*sw.missingLetters.length)]);        			
	         					
	        	    for( k=0 ; k<i ; k++ ) 
	        	    	if( userData[k] === $MU.LETTERS[val] ) 
	        	    		break;
	        	    if( k < i ) continue;
	         		if( mg.letterValues[$MU.LETTERS[val]] <= mg.maxWordValue - 3 ) break;
        		}
        	}
       					
    		var	spriteFrame = cc.spriteFrameCache.getSpriteFrame($MU.LETTER_NAMES[val]),
    			sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,$MU.BS,$MU.BS));
    	
    		sprite.retain();
        	sprite.setPosition(cc.p(tileBoxes[i].x,tileBoxes[i].y));
        	userData[i] = $MU.LETTERS[val];
	        tileSprite.addChild(sprite);
        }
        
        if( curProgram !== null ) incCurrentProgram();
        
        return tileSprite;
	};	
	
	muprisLayer.hookTileFixed = function( brcs ) {
		
		ml.lastBrcs = brcs;
		
		setSelections();
		return updateSelectedWord();
	};	

	muprisLayer.hookTileFixedAfterRowsDeleted = function( ) {

		if( !ml.selectedWord && !ml.dontAutoSelectWord ) selectBestWord();

		drawScoreBar(true);

		var ls = cc.sys.localStorage;
		ls.setItem("maxPoints",mg.maxPoints);
	}

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
				sw.markers[brc.col-sw.brc.col] === $MU.MARKER_SET || 
				sw.markers[brc.col-sw.brc.col] === $MU.MARKER_SEL || 
				newBox && sw.markers[brc.col-sw.brc.col] === $MU.MARKER_OPT
			)
		) return false;

		// Score
		var value = box && parseInt((mg.letterValues[box.userData] || 0) * ((brc.row*$MU.SCORE_ROW_MULTIPLYER) + 1));
		if( value ) addPoints(value * 2, cc.p($MU.BOXES_X_OFFSET + brc.col * $MU.BS + $MU.BS/2, $MU.BOXES_Y_OFFSET + brc.row * $MU.BS + $MU.BS));
		
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
		setSelections();
		updateSelectedWord();
		drawScoreBar(true);
	};
	
	muprisLayer.hookOnTap = function(tapPos) {
		var sw = ml.selectedWord;
		if( sw ) {
			var swPos = { 
					x: $MU.BOXES_X_OFFSET + sw.brc.col * $MU.BS,
					y: $MU.BOXES_Y_OFFSET + sw.brc.row * $MU.BS
			};			
		} 
		
		// check if selected word is hit
		if( sw && tapPos.x >= swPos.x && tapPos.y >= swPos.y - $MU.BS && tapPos.y <= swPos.y + $MU.BS ) {
			var col = Math.floor((tapPos.x - swPos.x)/$MU.BS),
				marker = sw.markers[col];
			if( marker === $MU.MARKER_OPT || marker === $MU.MARKER_SEL ) {
				cc.assert(ml.boxes[sw.brc.row][sw.brc.col+col].sprite, "Mupris, hookOnTap: There must be a sprite at position "+sw.brc.row+"/"+(sw.brc.col+col)+".");
				if( marker === $MU.MARKER_OPT ) {
					sw.markers[col] = $MU.MARKER_SEL;
					ml.boxes[sw.brc.row][sw.brc.col+col].sprite.setOpacity(255);	
				} else {
					sw.markers[col] = $MU.MARKER_OPT;					
					ml.boxes[sw.brc.row][sw.brc.col+col].sprite.setOpacity($MU.UNSELECTED_BOX_OPACITY);	
				}
				cc.log("Mupris, hookOnTap: calling updateSelectedWord()");
				updateSelectedWord();
			} else {
				unselectWord();
				setSelections();
				ml.dontAutoSelectWord = true;
			}
		} else if( tapPos.y < $MU.BOXES_Y_OFFSET ) {
			moveRollingLayer(undefined,3);
		} else {
			for( var i=ml.selections.length-1 ; i>=0 ; i--) {
				var s = ml.selections[i];

				if( s && tapPos.x >= s.pos.x && tapPos.x <= s.pos.x+s.width && tapPos.y >= s.pos.y && tapPos.y <= s.pos.y+s.height ) {
					moveSelectedWord(s.brc);
					ml.dontAutoSelectWord = false;
					setSelections();
					
					var x = $MU.BOXES_X_OFFSET + s.brc.col*$MU.BS + 1.5*$MU.BS,
					y = $MU.BOXES_Y_OFFSET + s.brc.row*$MU.BS + 1.5*$MU.BS;
				
					blowWords(cc.p(x,y),s.words);
				}
			}
		}
	};
	
	muprisLayer.hookOnLongTap = function(tapPos) {
		var sw = ml.selectedWord;
		if( sw ) {
			var swPos = { 
					x: $MU.BOXES_X_OFFSET + sw.brc.col * $MU.BS,
					y: $MU.BOXES_Y_OFFSET + sw.brc.row * $MU.BS
			};			
		} 
		
		// check if selected word is hit
		if( sw && tapPos.x >= swPos.x && tapPos.y >= swPos.y && tapPos.y <= swPos.y + $MU.BS*2 ) {
			blowWords(tapPos,ml.boxes[sw.brc.row][sw.brc.col].words);
		}
	};
	
	muprisLayer.hookUpdate = function(dt) {
		if( !ml.pointsToAddCnt && ml.pointsToAdd.length ) {
			ml.pointsToAddCnt = 3;
			ml.totalPoints += parseInt(ml.pointsToAdd.splice(0,1));
			
			moveRollingLayer(1,3);

			// highscore?
			mg.maxPoints = Math.max(ml.totalPoints , mg.maxPoints);

			drawScoreBar();

			// next level?
			cc.log("ml.totalPoints = "+ml.totalPoints+", ml.currentLevel = "+ml.currentLevel+", ml.wordTreasureBestWord = "+ml.wordTreasureBestWord+", ml.currentLeve = "+ml.currentLevel);
			if( ml.totalPoints >= $MU.LEVEL_SCORE[ml.currentLevel] ) {
				var ls = cc.sys.localStorage;

				ml.currentLevel++;
				mg.maxWordValue = Math.max( ml.wordTreasureBestWord.value , ml.currentLevel );
				ls.setItem("maxWordValue" , JSON.stringify(mg.maxWordValue));

				drawScoreBar(true);

				// if its level 42: YOU WON THE GAME!
				// ......
				
				var text = [{t:mg.t.new_level_level,scale:5,color:cc.color(0,128,0)} , 
				            {t:ml.currentLevel,scale:10,color:cc.color(0,160,0)}];
				if( mg.maxWordValue > ml.wordTreasureBestWord.value ) text = text.concat(
					[{t:mg.t.new_level_value,scale:5,color:cc.color(128,128,0)} , 
			         {t:mg.maxWordValue,scale:10,color:cc.color(128,128,0)}]
				);
				for( var i=0 ; i<text.length ; i++ ) {
					label = cc.LabelTTF.create(text[i].t, "res/fonts/American Typewriter.ttf", 160);
					label.setPosition(ml.size.width/2,ml.size.height/2);
					label.setScale(0.1,0.1);
					label.setColor(text[i].color);
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
		} else {
			moveRollingLayer(0);
		}
	};
	
	
	var loadLanguagePack = function( pack ) {
		
		cc.log("Mupris, loadLanguagePack: STARTING LOADING ...");
		var filename = i18n_language_packs[pack];
		cc.loader.loadJson("res/i18n/"+filename, function(err, json) {
			if( !err ) {
				cc.log("Mupris, loadLanguagePack: ... LOADED LANGUAGE PACK, GOING ON ...");
				var lg = mg.languagePack = json;
				mg.t = lg.apptext;
				
				cc.loader.loadJson("res/words/"+lg.wordlist+".words.json", function(err, json) {
					if( !err ) {
						cc.log("Mupris, loadLanguagePack: ... LOADED WORDS, GOING ON ...");
						mg.words = json;

						cc.loader.loadJson("res/words/"+lg.wordlist+".letters.json", function(err, json) {
							if( !err ) {
								cc.log("Mupris, loadLanguagePack: ... LOADED LETTERS!");
								var lv = mg.letterValues = json,
									l = $MU.LETTERS;
								// get the most common
								var max=0;
								for( letter in lv ) {
									max=Math.max(max,lv[letter]);
								}

								mg.letterOccurences = [];
								for( var i=0 ; i<l.length ; i++ ) {
									var occ = lv[l[i]] && parseInt(1/lv[l[i]]*max);
									mg.letterOccurences[i] = occ || 0; 
								}
							} else {
								throw err;
							}
						});
						
						// check if word file is compatible
						for( var prefix in json ) {
							var words = json[prefix];
							cc.assert(words && words[0].word, "Mupris, json loader: Prefix "+prefix+" has no words.");
							for( var j=0 ; j<words.length ; j++ ) {
								cc.assert(words[j].word.length >=4 && words[j].word.length <= $MU.BOXES_PER_ROW, 
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
