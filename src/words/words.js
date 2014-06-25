/*
 * Enhancement module for Mupris
 * 
 */

var	LETTER_VALUES = {"A":1,"B":3,"C":4,"D":1,"E":1,"F":4,"G":2,"H":2,"I":1,"J":6,"K":4,"L":2,"M":3,"N":1,"O":2,"P":4,"Q":10,"R":1,"S":1,"T":1,"U":1,"V":6,"W":3,"X":8,"Y":10,"Z":3,"Ä":6,"Ö":8,"Ü":6},
	LETTER_OCCURANCES = [5,2,2,4,15,2,3,4,6,1,2,3,4,9,3,1,1,6,7,6,6,1,1,1,1,1,1,1,1],
	STAGE_COLORS = [{r:255,g:0,b:0},{r:0,g:255,b:0},{r:0,g:0,b:255},{r:255,g:0,b:255}];

var MUPRIS_MODULE = function(muprisLayer) {

	var ml = muprisLayer;
	/*
	 * Initializations
	 * 
	 */
	
	// go through box array and look for prefixes
	var checkForPrefixes = function(brc, cb) {

		cc.log("checkForPrefixes at "+brc.row+"/"+brc.col+". ml.words is "+ml.words.length+" long.");
		for( var i=Math.max(0,brc.col-2) ; i<Math.min(BOXES_PER_ROW-2,brc.col) ; i++) {
			var prefix = (ml.boxes[brc.row][i]   && ml.boxes[brc.row][i].userData || " ")+
						 (ml.boxes[brc.row][i+1] && ml.boxes[brc.row][i+1].userData || " ")+
						 (ml.boxes[brc.row][i+2] && ml.boxes[brc.row][i+2].userData || " "),
				words = ml.words[prefix];
			
			if( words && cb ) {
				cc.log("checkForPrefixes: Found "+words.length+" words at "+brc.row+"/"+i);
				cb({row:brc.row,col:i}, words);
			}
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
	    muprisLayer.addChild(lettersImages, 0, TAG_SPRITE_MANAGER);
	};

	/*
	 * hookSetTileImages
	 * 
	 * Called while building a tile to set the images of the tile boxes
	 * 
	 * Param: tileBoxes: metrics of the boxes 
	 * 
	 */
	muprisLayer.hookSetTileImages = function(tileBoxes, newTile, p) {

		var tileSprite = cc.Sprite.create(res.letters_png,cc.rect(0,0,0,0)),
			batch = this.getChildByTag(TAG_SPRITE_MANAGER);
				
		tileSprite.retain();
		tileSprite.setPosition(p);
		batch.addChild(tileSprite);

        // add single boxes with letters to the tile
        for( var i=0 ; i<tileBoxes.length ; i++) {
        	
        	var letter = LETTER_NAMES[Math.floor(this.getRandomValue(LETTER_OCCURANCES))],
    		spriteFrame = cc.spriteFrameCache.getSpriteFrame(letter+".png"),
    		sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,BS,BS));
    	
    		sprite.retain();
        	sprite.setPosition(cc.p(tileBoxes[i].x,tileBoxes[i].y));
        	sprite.userData = letter.toUpperCase();
	        tileSprite.addChild(sprite);
        }
        
        return tileSprite;
	};	
	
	muprisLayer.hookTileFixed = function( brcs ) {
		
		for( var i=0 ; i<brcs.length ; i++ ) {
			var brc = brcs[i];
			cc.log("Looking for words at position "+brc.row+"/"+brc.col);
			checkForPrefixes(brc, function(brc, words) {
				var sprite = muprisLayer.boxes[brc.row][brc.col];
				if( !sprite.words ) {
					sprite.words = words;
					sprite.layer = new MuprisTileLayer(words, brc);
					muprisLayer.addChild(sprite.layer);
					muprisLayer.selections.push({
						brc: brc,
						width: sprite.layer.width,
						height: sprite.layer.height,
						pos: sprite.layer.getPosition()
					});
					
					for( var i=0 ; i<words.length ; i++ ) cc.log("Retrieved word "+words[i].word+" at position "+brc.row+"/"+brc.col);
				}
			});
		}					
	};	
	
	
	// read json file with words
	cc.log("Loading res/words/dewords.words.json ...");
	cc.loader.loadJson("res/words/dewords.words.json", function(err, text) {
		if( !err ) {
			cc.log("Loaded!");
			muprisLayer.words = text;			
		}
	});
};


var MuprisTileLayer = cc.LayerColor.extend({
	
	words: null,
	pos: null,
	brc: null,
	status: null, // 0: unselected, 1: selected
	stage: null, // 0: three letters, 1: complete word, 2: best word, 3: record word
	
	ctor:function (words, brc) {
		this._super(new cc.color(255,0,0,255), 3 * BS, BS);
		   
		this.words = words;
		this.brc = brc;
		this.status = 0;
		this.stage = 0;
		this.setShape();
		
		return true;
	},
	
	setShape: function() {
		
		var c = STAGE_COLORS[this.stage],
			o = (this.status === 0)? 100:200,
			brc = this.brc;
		
		this.setColor(new cc.color(c.r,c.g,c.b,o));
		this.setPosition(BOXES_X_OFFSET + brc.col * BS, BOXES_Y_OFFSET + brc.row * BS );
	},
	
	select: function() {
		
		this.setShape();
	},
	
	deselect: function() {
		
		this.setShape();
	}
});
