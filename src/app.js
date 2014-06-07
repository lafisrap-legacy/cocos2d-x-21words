var TAG_SPRITE_MANAGER = 1,
	BOXES_PER_COL = 23,
	BOXES_PER_ROW = 10,
	BOXES_X_OFFSET = 20,
	BOXES_Y_OFFSET = 32,
	SNAP_SPEED = 1,
	FALLING_SPEED = 1.0,
	BS = 32, // pixel
	LETTER_NAMES = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","ae","oe","ue","ss"],
	TILE_BOXES = [
	              [{x:-1.5*BS,y: 0.0*BS},{x:-0.5*BS,y: 0.0*BS},{x: 0.5*BS,y: 0.0*BS},{x: 1.5*BS,y: 0.0*BS}],
	              [{x:-0.5*BS,y:-0.5*BS},{x:-0.5*BS,y: 0.5*BS},{x: 0.5*BS,y:-0.5*BS},{x: 0.5*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x:-1.0*BS,y:-0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x: 1.0*BS,y:-0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 0.0*BS,y:-0.5*BS},{x: 1.0*BS,y:-0.5*BS}],
	              [{x:-1.0*BS,y:-0.5*BS},{x: 0.0*BS,y:-0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS},{x: 0.0*BS,y:-0.5*BS}],
	              ];

var MutrixLayer = cc.Layer.extend({
    sprite:null,
    
    tiles: [],
	boxes: [],
    
    ctor:function () {
        this._super();

        var size = this.size = cc.director.getWinSize();

        this.startAnimation();
        this.loadImages();
        this.initBlockSpace();

	    this.scheduleUpdate();	
        return true;
    },

	startAnimation: function() {
		
        var size = this.size,
        	closeItem = cc.MenuItemImage.create(
            res.CloseNormal_png,
            res.CloseSelected_png,
            function () {
                cc.log("Menu is clicked!");
            }, this);
        closeItem.attr({
            x: size.width - 20,
            y: 20,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var menu = cc.Menu.create(closeItem);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu, 1);
        var helloLabel = cc.LabelTTF.create("MUTRIX -- Tetris & Letters", "Arial", 19);
        helloLabel.x = size.width / 2;
        helloLabel.y = 0;
        this.addChild(helloLabel, 5);

        this.sprite = cc.Sprite.create(res.HelloWorld_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2,
            scale: 0.5,
            rotation: 180
        });
        this.addChild(this.sprite, 0);

        var rotateToA = cc.RotateTo.create(2, 0);
        var scaleToA = cc.ScaleTo.create(2, 6, 6);
        var tintToA = cc.TintTo.create(4, 30, 30, 70);

        this.sprite.runAction(tintToA);
        this.sprite.runAction(cc.Sequence.create(rotateToA, scaleToA));
        helloLabel.runAction(cc.Spawn.create(cc.MoveBy.create(2.5, cc.p(0, size.height - 40)),cc.TintTo.create(2.5,255,125,0)));
	},
	
	loadImages: function() {
		// Load sprite frames to frame cache, add texture node
        cc.spriteFrameCache.addSpriteFrames(res.letters_plist);
        var lettersTexture = cc.textureCache.addImage(res.letters_png),
        	lettersImages  = cc.SpriteBatchNode.create(lettersTexture);
		this.addChild(lettersImages, 0, TAG_SPRITE_MANAGER);
	},
	
	initBlockSpace: function() {
	    // initialize boxes arrays
	    for( var i=0 ; i<BOXES_PER_COL ; i++ ) {
		    for( var j=0 ; j<BOXES_PER_ROW ; j++ ) {
		    	if( !this.boxes[i] ) this.boxes[i] = []; 
		    	this.boxes[i][j] = null;		    	
		    }		    	
	    }
	    
	    this.drawNode = cc.DrawNode.create();
        this.addChild(this.drawNode,100);
        this.drawNode.clear();
        for( var i=0 ; i<=BOXES_PER_ROW ; i++ ) {
            this.drawNode.drawSegment(cc.p(BOXES_X_OFFSET+i*BS,BOXES_Y_OFFSET), 
            						  cc.p(BOXES_X_OFFSET+i*BS,BOXES_Y_OFFSET+BOXES_PER_COL*BS),
            						  1,
            						  cc.color(255,100,100,60));         	
        }
        for( var i=0 ; i<=BOXES_PER_COL ; i++ ) {
            this.drawNode.drawSegment(cc.p(BOXES_X_OFFSET,BOXES_Y_OFFSET+i*BS), 
            						  cc.p(BOXES_X_OFFSET+BOXES_PER_ROW*BS,BOXES_Y_OFFSET+i*BS),
            						  1,
            						  cc.color(255,100,100,30));         	
        }
	},

	buildTile: function(p) {
		
		// select a random tile type
		var tileBoxes = TILE_BOXES[Math.floor(Math.random()*TILE_BOXES.length)];
		
		tileBoxes = TILE_BOXES[Math.floor(Math.random()*2)+5];

		// create sprite for tile and set is size 0, we only use its position and rotation
		var tileSprite = cc.Sprite.create(res.letters_png,cc.rect(0,0,0,0)),
			batch = this.getChildByTag(TAG_SPRITE_MANAGER);
        tileSprite.setPosition(p);
        batch.addChild(tileSprite);

        // add single boxes with letters to the tile
        for( var i=0 ; i<tileBoxes.length ; i++) {
        	
        	var letter = LETTER_NAMES[Math.floor(Math.random()*LETTER_NAMES.length)],
        		spriteFrame = cc.spriteFrameCache.getSpriteFrame(letter+".png"),
        		sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,BS,BS));
        	
        	sprite.setPosition(cc.p(tileBoxes[i].x,tileBoxes[i].y));
	        tileSprite.addChild(sprite);
        }
        
        // build a tile object
        this.tiles.push({
        	boxes: tileBoxes,
        	sprite: tileSprite,
        	rotation: 90,
        });
        
        tileSprite.setRotation(90);
	},
	
    update: function(dt) {
    	
    	var self = this,
			size = this.size;
    	/*
    	 * rotate the metrics of a tile (0,90,180,270)
    	 */
    	var rotateBoxes = function(t) {
    		var r = t.rotation % 360,
    			rb = []; // rotated boxes
    		
    		for( var i=0 ; i<t.boxes.length ; i++ ) {
    			switch(r) {
    			case 0:
    				// 0 degree: no change
    				rb.push({
    					x: t.boxes[i].x,
						y: t.boxes[i].y
    				});
    				break;
    			case 90:
    				// 90 degree: exchange x and y coordinates
    				rb.push({
    					x: t.boxes[i].y,
						y: -t.boxes[i].x
    				});
    				break;
    			case 180:
    				// 180 degree: negate x and y (= rotate)
    				rb.push({
    					x: -t.boxes[i].x,
						y: -t.boxes[i].y
    				});
    				break;
    			case 270:
    				// 90 degree: exchange x and y coordinates and negate
    				rb.push({
    					x: -t.boxes[i].y,
						y: t.boxes[i].x
    				});
    				break;
    			}
    		}
    		t.rotatedBoxes = rb;
    	};
    	
    	/*
    	 * snap tile to column
    	 */
    	var snapToColumn = function(t, lp) {
    		
    		var boxPos = t.rotatedBoxes[0];
    			closest = Math.round((lp.x+boxPos.x+BS/2-BOXES_X_OFFSET)/BS)*BS+BOXES_X_OFFSET-boxPos.x-BS/2;    		

    		if( lp.x != closest ) {
    			if(Math.abs(closest-lp.x) >= SNAP_SPEED) lp.x += SNAP_SPEED * Math.sign(closest - lp.x);
    			else lp.x = closest;
    			t.sprite.setPosition(lp);
    		}
    	};
    	
    	/*
    	 * check if a collision happened
    	 */
    	var checkForCollision = function(t, lp) {
    		var b = t.rotatedBoxes;
    		for( var i=0 ; i<b.length ; i++ ) {
    			var bx = lp.x + b[i].x,
    				by = lp.y + b[i].y,
    				bRow = Math.floor((bx - BS/2 - BOXES_X_OFFSET) / BS),
        			bCol = Math.floor((by - BS/2 - BOXES_Y_OFFSET) / BS);
    			
    			//console.log("Checking box "+i+": bRow="+bRow+", bCol="+bCol);
    			// check for bottom or fixed boxes
    			if( by - BS/2 <= BOXES_Y_OFFSET || (bCol < BOXES_PER_COL && self.boxes[bCol][bRow]) ) {
    				// align y to box border
    				lp.y = Math.round((lp.y - BOXES_Y_OFFSET)/(BS/2))*(BS/2) + BOXES_Y_OFFSET;
    				
    				// fix tile
    				fixTile(t, lp);
    				return true;
    			}
    			
    		}
    		
    		return false;
    	};
    	
    	/*
    	 * Tile gets fixed on the ground
    	 */
    	var fixTile = function(t, lp) {
    		var batch = self.getChildByTag(TAG_SPRITE_MANAGER),
    			b = t.rotatedBoxes;
    		
    		for( var i=0 ; i<b.length ; i++) {
        		// create a new sprite from the old child sprites
    			var sprite = t.sprite.children[i],
    				worldPos = t.sprite.convertToWorldSpace(sprite.getPosition()),
    				newSprite = cc.Sprite.create(sprite.getTexture(), sprite.getTextureRect());

    			newSprite.setPosition(worldPos);
    	        batch.addChild(newSprite);
    			
    			// Insert into boxes array
    			var bRow = Math.floor((lp.x + b[i].x - BS/2 - BOXES_X_OFFSET) / BS),
    				bCol = Math.floor((lp.y + b[i].y - BS/2 - BOXES_Y_OFFSET) / BS);
    			
    			console.log("Fixing box "+i+": bRow="+bRow+", bCol="+bCol+"(from lp.y="+lp.y+", b["+i+"].y="+b[i].y);

    			self.boxes[bCol][bRow] = newSprite; 			
    		}
    		
    		batch.removeChild(t.sprite);
    		delete t;
    	};
    	
    	// if there is no tile flying, build a new one
        var tilesFlying = self.tiles.filter(function(value) { return value !== undefined }).length;
        if( !tilesFlying ) {
            self.buildTile(cc.p(size.width/2, size.height));        	
        }

    	/*
    	 * Main loop to move tiles
    	 */
    	for( tile in self.tiles ) {
    		var t = self.tiles[tile],
    			rt = rotateBoxes(t),
    			lp = t.sprite.getPosition();
    		
    		snapToColumn(t, lp);
		
    		
    		// let tile fall down
    		lp.y -= FALLING_SPEED;
    		
    		if( checkForCollision(t, lp) ) {
    			// tile landed ...
    			delete self.tiles[tile];
    		} else {
        		
        		t.sprite.setPosition(lp);    			
    		};
    	}
    }
});

var MutrixScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MutrixLayer();
        this.addChild(layer);
    }
});

