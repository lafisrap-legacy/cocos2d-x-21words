/*
 * Enhancement module for Mupris
 * 
 * NEXT STEPS:
 * - Fehler selected Word too far down 
 * - Show all possibilities if word is selected (animation)
 * - 50% of all letters are letters needed
 * - show whole word ...
 * 
 * 
 * - sel/opt/set-Problem: sel macht anderes sel zu set (MARTINA)
 * - 
 */

var	LETTER_NAMES = ["a.png","b.png","c.png","d.png","e.png","f.png","g.png","h.png","i.png","j.png","k.png","l.png","m.png","n.png","o.png","p.png","q.png","r.png","s.png","t.png","u.png","v.png","w.png","x.png","y.png","z.png","ae.png","oe.png","ue.png"],
	LETTERS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","Ä","Ö","Ü"],
	LETTER_VALUES = {"A":1,"B":3,"C":4,"D":1,"E":1,"F":4,"G":2,"H":2,"I":1,"J":6,"K":4,"L":2,"M":3,"N":1,"O":2,"P":4,"Q":10,"R":1,"S":1,"T":1,"U":1,"V":6,"W":3,"X":8,"Y":10,"Z":3,"Ä":6,"Ö":8,"Ü":6},
	LETTER_OCCURANCES = [5,2,2,4,15,2,3,4,6,1,2,3,4,9,3,1,1,6,7,6,6,1,1,1,1,1,1,1,1],
	STAGE_COLORS = [{r:255,g:0,b:0},{r:0,g:255,b:0},{r:0,g:0,b:255},{r:255,g:0,b:255}],
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
	MAX_LETTERS_BLOWN = 20;

var MUPRIS_MODULE = function(muprisLayer) {

	var ml = muprisLayer;
	// go through box array and look for prefixes
	var setSelections = function( dontSelectWord ) {
		var s = [],
			sw = ml.selectedWord;
		
		for( var i=0 ; i<BOXES_PER_COL ; i++) {
			// dim all boxes in a row
			for( var j=0 ; j<BOXES_PER_ROW ; j++ ) {
				var box = ml.boxes[i][j];				
				if( box && box.sprite ) box.sprite.setOpacity(UNSELECTED_BOX_OPACITY);				
			}
			// don't show selections in the row of the selected word
			if( sw && sw.brc.row === i ) continue;
			// check all boxes for word starts (prefixes)
			for( var j=0 ; j<BOXES_PER_ROW-2 ; j++ ) {
				var box = ml.boxes[i][j];				
				if(!box) continue;
				
				var oldPrefix = box.words && box.words[0].word.substring(0,3);
				box.words = null;
				checkForPrefixes({row:i,col:j}, function(brc, words) {
					var newPrefix = words[0].word.substring(0,3);
					box.words = words;
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
						ml.selectedWord = {
							brc: brc,
							words: words,
							markers: [],
							sprites: []
						}
						
						var x = BOXES_X_OFFSET + brc.col*BS + 1.5*BS,
							y = BOXES_Y_OFFSET + brc.row*BS + 1.5*BS;
						
						blowWords(cc.p(x,y),words);
					}
						
					for( var i=0 ; i<words.length ; i++ ) cc.log("Retrieved word "+words[i].word+" at position "+brc.row+"/"+brc.col);
				});
			}
		}
		
		ml.selections = s;
		updateSelectedWord();
	};
	
	// look for words at a specified position
	var checkForPrefixes = function(brc, cb) {

		var prefix = (ml.boxes[brc.row][brc.col]   && ml.boxes[brc.row][brc.col].userData || " ")+
					 (ml.boxes[brc.row][brc.col+1] && ml.boxes[brc.row][brc.col+1].userData || " ")+
					 (ml.boxes[brc.row][brc.col+2] && ml.boxes[brc.row][brc.col+2].userData || " "),
			words = ml.words[prefix];

		if( !(ml.boxes[brc.row][brc.col] && ml.boxes[brc.row][brc.col].words) && words && cb ) {
			cc.log("checkForPrefixes: Found "+words.length+" words at "+brc.row+"/"+brc.col);
			
			var w = [];
			for( var i=0 ; i<words.length ; i++ ) w[i] = words[i].word; 
			for( var i=words.length-1 ; i>=0 ; i-- ) {
				if( brc.col + w[i].length > BOXES_PER_ROW ) {
					words.splice(i,1);
				}
			}
			
			if( words.length > 0 ) cb(brc,words);
		}
	};
	
	// update selected word
	var updateSelectedWord = function() {
		var sw = ml.selectedWord,
		batch = ml.getChildByTag(TAG_SPRITE_MANAGER);
		
		if( !sw ) return;
		
		// Define sprites and show word start sprite
		var setMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker0.png"),
			optMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker1.png"),
			selMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker3.png");
		
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
			if( sw.markers[col] === MARKER_SET || sw.markers[col] === MARKER_SEL ) {
				var letter = ml.boxes[sw.brc.row][i].userData;
				// take out all words that don't match the letters where markers are set
				for( var j=curWords.length-1 ; j>=0 ; j-- ) {
					if( curWords[j].word[col] != letter ) curWords.splice(j,1);
				}
			}
		}
		for( var i=sw.brc.col ; i<BOXES_PER_ROW ; i++) {
			var col = i-sw.brc.col;
			if( sw.markers[col] === MARKER_SET ) {
				// just set sprite opacity to full
				ml.boxes[sw.brc.row][i].sprite.setOpacity(255);	
				for( var j=0 ; j<curWords.length ; j++ ) {
					cc.assert(ml.boxes[sw.brc.row][i] && curWords[j].word[col] === ml.boxes[sw.brc.row][i].userData, "Mupris, updateSelectedWord: Marker set on a letter that is not correct." );
				}
			} else {
				// remove old sprite
				if( sw.sprites[col] ) batch.removeChild( sw.sprites[col] );
				sw.sprites[col] = null;
				for( var j=curWords.length-1,hits=0 ; j>=0 ; j-- ) {
					// look if the letter in the box matches the letter in the word 
					if(ml.boxes[sw.brc.row][i] && curWords[j].word[col] === ml.boxes[sw.brc.row][i].userData ) hits++;
					else if( curWords[j].word[col] ) missingLetters += curWords[j].word[col];
				}
				if( hits === 0 ) {
					// letter in box matches with no word
					sw.markers[col] = null;
				} else if( sw.markers[col] === MARKER_SEL ) {
					// if the user marked the letter, than show marker select sprite
					sw.sprites[col] = cc.Sprite.create(selMarkerFrame,cc.rect(0,0,BS,BS));
					ml.boxes[sw.brc.row][i].sprite.setOpacity(255);	
				} else if( hits === curWords.length ) {
					// letter in box matches with all words, draw sprite
					sw.markers[col] = MARKER_SET;
					sw.sprites[col] = cc.Sprite.create(setMarkerFrame,cc.rect(0,0,BS,BS));
					ml.boxes[sw.brc.row][i].sprite.setOpacity(255);	
				} else {
					// letter in box matches with some words, draw marker option sprite
					sw.markers[col] = MARKER_OPT;
					sw.sprites[col] = cc.Sprite.create(optMarkerFrame,cc.rect(0,0,BS,BS));					
					ml.boxes[sw.brc.row][i].sprite.setOpacity(UNSELECTED_BOX_OPACITY);	
				}
				
				if( hits > 0 ) {
					cc.assert(sw.sprites[col], "Mupris, updateSelectedWord: sprite is null.");
					
					sw.sprites[col].retain();
					batch.addChild(sw.sprites[col],5);
					sw.sprites[col].setPosition(cc.p(BOXES_X_OFFSET + i * BS + MARKER_X_OFFSET, 
							   						 BOXES_Y_OFFSET + sw.brc.row * BS + MARKER_Y_OFFSET));
				}	
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
	};
	
	var moveSelectedWord = function(brc) {
		var sw = ml.selectedWord;
		
		if( sw ) {
			var batch = ml.getChildByTag(TAG_SPRITE_MANAGER);
			
			// first delete old sprites
			if( sw.startMarker ) batch.removeChild( sw.startMarker );
			for( var i=0 ; i<sw.sprites.length ; i++ ) if( sw.sprites[i]  ) batch.removeChild( sw.sprites[i] );
		}
			
		// define a new one
		if( brc ) {
			ml.selectedWord = {
				brc: brc,
				words: ml.boxes[brc.row][brc.col].words,
				markers: [],
				sprites: []
			};				
		} else {
			ml.selectedWord = null;
		}
		
		updateSelectedWord();
	};
	
	
	var blowWords = function(pos, words) {

		var angle = Math.random() * 360,
			i = (words.length < MAX_LETTERS_BLOWN)? 0:
				Math.floor(Math.random()*(words.length-MAX_LETTERS_BLOWN));
		for( ; i<Math.min(words.length,MAX_LETTERS_BLOWN) ; i++ ) {
			var word = cc.LabelTTF.create(words[i].word, "Arial", 38),
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
	            rotateAction = cc.rotateBy(5,-1080,-1080),
	            bezierAction = cc.bezierTo(5-Math.random(),bezier),
	            fadeTime = Math.random()+1,
	            fadeAction = cc.sequence(
	            				cc.fadeTo((fadeTime-1)*2,255),
								cc.fadeTo(fadeTime,128),
								cc.fadeTo(fadeTime,255),
								cc.fadeTo(fadeTime,128),
								cc.fadeTo(fadeTime,255),
								cc.fadeTo(fadeTime,128)
	            			);
	        word.runAction(fadeAction);
	        word.runAction(rotateAction);
	        word.runAction(cc.sequence(bezierAction,cc.callFunc(function(){
	        	ml.removeChild(this);
	        },word)));
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
        	var val = (Math.random()>NEEDED_LETTERS_PROBABILITY || !sw || !sw.missingLetters.length)?  Math.floor(this.getRandomValue(LETTER_OCCURANCES)):
						  		     LETTERS.indexOf(sw.missingLetters[Math.floor(Math.random()*sw.missingLetters.length)]),
    			spriteFrame = cc.spriteFrameCache.getSpriteFrame(LETTER_NAMES[val]),
    			sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,BS,BS));
    	
    		sprite.retain();
        	sprite.setPosition(cc.p(tileBoxes[i].x,tileBoxes[i].y));
        	userData[i] = LETTERS[val];
	        tileSprite.addChild(sprite);
        }
        
        return tileSprite;
	};	
	
	muprisLayer.hookTileFixed = function( brcs ) {
		
		setSelections();
	};	
	
	muprisLayer.hookDeleteBox = function(brc) {
		var sw = ml.selectedWord,
			box = ml.boxes[brc.row][brc.col];
		
		if( sw && sw.brc.row === brc.row && (sw.markers[brc.col-sw.brc.col] === MARKER_SET || sw.markers[brc.col-sw.brc.col] === MARKER_SEL) ) return false;

		if( box.interval ) {
			clearInterval(box.interval);
			box.interval = null;
		}
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
	};
	
	muprisLayer.hookOnTap = function(tapPos, notBrc) {
		var sw = ml.selectedWord;
		if( sw ) {
			var swPos = { 
					x: BOXES_X_OFFSET + sw.brc.col * BS,
					y: BOXES_Y_OFFSET + sw.brc.row * BS
			};			
		} 
		
		// check if selected word is hit
		if( sw && tapPos.x >= swPos.x && tapPos.y >= swPos.y && tapPos.y <= swPos.y + BS*2 ) {
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
				moveSelectedWord(null);
				setSelections(true);
				ml.hookOnTap(tapPos, sw.brc);
			}
		} else {
			for( var i=0 ; i<ml.selections.length ; i++) {
				var s = ml.selections[i];

				if( notBrc && notBrc.col === s.brc.col && notBrc.row === s.brc.row ) continue;
				
				if( tapPos.x >= s.pos.x && tapPos.x <= s.pos.x+s.width && tapPos.y >= s.pos.y && tapPos.y <= s.pos.y+s.height ) {
					moveSelectedWord(s.brc);
					setSelections();
					blowWords(cc.p(s.pos.x,s.pos.y),s.box[0].words);
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
			blowWords(tapPos,sw.words);
		}
	};
	
	// read json file with words
	cc.loader.loadJson("res/words/dewords.words.json", function(err, text) {
		if( !err ) {
			muprisLayer.words = text;
		}
	});
	
};