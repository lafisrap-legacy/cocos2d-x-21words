/*
 * BUGS
 * 
 * Tile placement
 * 
 */ 


var MUPRIS_GLOBALS = { 
	t : { 
			"reached_top_continue" : "WEITER SPIELEN",
			"reached_top_end_game"	: "SPIEL BEENDEN"
	},
	TAG_SPRITE_MANAGER : 1,
	TAG_GAME_LAYER : 3,
	BS : 64, // pixel
	BOXES_PER_COL : 22,
	GAME_OVER_COL : 16,
	BOXES_PER_ROW : 10,
	BOXES_X_OFFSET : 0,
	BOXES_Y_OFFSET : 96,
	SNAP_SPEED : 10.0, // pixel per 1/60
	LONG_TAP_TIME : 300, // milliseconds
	FALLING_SPEED : 0.33, // pixel per 1/60
	MOVE_SPEED : 0.09, // seconds
	TOUCH_THRESHOLD : 6, // pixel
	KEY_LEFT_CODE : 37,
	KEY_UP_CODE : 38,
	KEY_RIGHT_CODE : 39,
	KEY_DOWN_CODE : 40,
	TILE_BOXES : [
	    [{x:-1.5*64,y: 0.0*64},{x:-0.5*64,y: 0.0*64},{x: 0.5*64,y: 0.0*64},{x: 1.5*64,y: 0.0*64}],
		[{x:-0.5*64,y:-0.5*64},{x:-0.5*64,y: 0.5*64},{x: 0.5*64,y:-0.5*64},{x: 0.5*64,y: 0.5*64}],
		[{x:-1.0*64,y: 0.5*64},{x:-1.0*64,y:-0.5*64},{x: 0.0*64,y: 0.5*64},{x: 1.0*64,y: 0.5*64}],
		[{x:-1.0*64,y: 0.5*64},{x: 1.0*64,y:-0.5*64},{x: 0.0*64,y: 0.5*64},{x: 1.0*64,y: 0.5*64}],
		[{x:-1.0*64,y: 0.5*64},{x: 0.0*64,y: 0.5*64},{x: 0.0*64,y:-0.5*64},{x: 1.0*64,y:-0.5*64}],
		[{x:-1.0*64,y:-0.5*64},{x: 0.0*64,y:-0.5*64},{x: 0.0*64,y: 0.5*64},{x: 1.0*64,y: 0.5*64}],
		[{x:-1.0*64,y: 0.5*64},{x: 0.0*64,y: 0.5*64},{x: 1.0*64,y: 0.5*64},{x: 0.0*64,y:-0.5*64}],
  		[{x:0,y:0}],
		[{x:-1*64,y:-1*64},{x:-1*64,y: 0*64},{x: -1*64,y:1*64},{x: 0*64,y: -1*64},{x:0*64,y:0*64},{x:0*64,y: 1*64},{x: 1*64,y:-1*64},{x: 1*64,y: 0*64},{x: 1*64,y: 1*64}],
	],
	TILE_OCCURANCES : [10,5,7,7,2,2,7,2,0]
};
var $MU = MUPRIS_GLOBALS;

var MuprisGameLayer = cc.Layer.extend({
    sprite:null,
    
    tiles: [],
	boxes: [],
	selections: [],
	
    touchStartPoint: null,
    touchStartTime: null,
    touchCurrentPoint: null,
    touchLastPoint: null,
    touchStartTime: null,
    touchDistance: null,
    isSwipeUp: false,
    isSwipeLeft: false,
    isSwipeRight: false,
    isSwipeDown: false,    
    isTap: false,
    
    ctor:function () {
        this._super();

        var size = this.size = cc.director.getWinSize();
        
        if( typeof MUPRIS_MODULE !== 'undefined' ) MUPRIS_MODULE(this);

        this.startAnimation();
        this.initBoxSpace();
        this.loadImages();
        
	    this.tiles = [];
        return true;
    },

    onEnter: function() {
    	var self = this;
		this._super();

		this.initListeners();
		
		setTimeout(function() {
		    self.scheduleUpdate();	
		    if( self.hookStartGame ) self.hookStartGame();
		},5000);
    },
    
    onExit: function() {
		this._super();

	    this.stopListeners();
	    this.unscheduleUpdate();	    	
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

        var background = cc.Sprite.create(res.background_png);
        background.attr({
            x: size.width / 2,
            y: size.height / 2,
            scale: 1,
            rotation: 0
        });
        this.addChild(background, 0);
        var title = cc.Sprite.create(res.title_png);
        title.attr({
            x: size.width / 2,
            y: size.height / 2,
            scale: 1.5,
            rotation: 0,
        });
        this.addChild(title, 0);

        var sequenceA = cc.fadeIn(3);
        var sequenceB = cc.Spawn.create(cc.rotateTo(2,0),cc.scaleTo(2,10,10),cc.fadeOut(2));
        title.setOpacity(0);
        title.runAction(cc.sequence(sequenceA,sequenceB));
	},
	
	loadImages: function() {

		// lets module load images ...
		if( this.hookLoadImages ) this.hookLoadImages();
		else {
			// ... or load default
	        cc.spriteFrameCache.addSpriteFrames(res.tiles_plist);
	        var tilesTexture = cc.textureCache.addImage(res.tiles_png),
	        	tilesImages  = cc.SpriteBatchNode.create(tilesTexture,200);
			this.addChild(tilesImages, 10, $MU.TAG_SPRITE_MANAGER);			
		}
	},
	
	initBoxSpace: function() {
        var size = this.size;
        
	    // initialize boxes arrays
	    for( var i=0 ; i<$MU.BOXES_PER_COL ; i++ ) {
		    for( var j=0 ; j<$MU.BOXES_PER_ROW ; j++ ) {
		    	if( !this.boxes[i] ) this.boxes[i] = []; 
		    	this.boxes[i][j] = null;		    	
		    }		    	
	    }

	    // draw grid
	    this.drawNode = cc.DrawNode.create();
        this.addChild(this.drawNode,1);
        this.drawNode.clear();
 /*       for( var i=0 ; i<=$MU.BOXES_PER_ROW ; i++ ) {
            this.drawNode.drawSegment(cc.p($MU.BOXES_X_OFFSET+i*$MU.BS,$MU.BOXES_Y_OFFSET), 
            						  cc.p($MU.BOXES_X_OFFSET+i*$MU.BS,$MU.BOXES_Y_OFFSET+$MU.BOXES_PER_COL*$MU.BS),
            						  1,
            						  cc.color(255,100,100,60));         	
        }
        for( var i=0 ; i<=$MU.BOXES_PER_COL ; i++ ) {
            this.drawNode.drawSegment(cc.p($MU.BOXES_X_OFFSET,$MU.BOXES_Y_OFFSET+i*$MU.BS), 
            						  cc.p($MU.BOXES_X_OFFSET+$MU.BOXES_PER_ROW*$MU.BS,$MU.BOXES_Y_OFFSET+i*$MU.BS),
            						  1,
            						  cc.color(255,100,100,30));         	
        }*/
        this.drawNode.drawPoly([cc.p(0,0),cc.p(size.width,0),cc.p(size.width,$MU.BOXES_Y_OFFSET ),cc.p(0,$MU.BOXES_Y_OFFSET )],
        						new cc.Color(0,0,0,255), 
        						1, 
        						new cc.Color(0,0,0,255));
        
	},
	
    initListeners: function() {
       	var self = this;
	
	/*
	 * TOUCH EVENTS
	 */ 
       	
       	if( true || 'touches' in cc.sys.capabilities ) { // touches work on mac but return false
	    	this._touchListener = cc.EventListener.create({
	            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
	            onTouchesBegan: function(touches, event) {
	            	
	            	var touch = touches[0];
	                var loc = touch.getLocation();
	                
	                self.touchStartPoint = {
	                	x: loc.x,
	                	y: loc.y
	                };
	                
	                self.touchLastPoint = {
	                    	x: loc.x,
	                    	y: loc.y
	                };	
	                
	                self.touchStartTime = new Date().getTime();
	            },
	            	
	            onTouchesMoved: function(touches, event) {
	            	var touch = touches[0];
	                var loc = touch.getLocation(),
	                	start = self.touchStartPoint;
	
	                if( !loc || !start ) {
		                self.isSwipeUp = self.isSwipeLeft = self.isSwipeRight = self.isSwipeDown = false;	                			                
	                	return;
	                }
	                
	                self.touchDistance = {
	            			x: Math.abs(loc.x - start.x),
	            			y: Math.abs(loc.y - start.y)
	            	};
	                
	                // check for left
	                if( loc.x < start.x - $MU.TOUCH_THRESHOLD) {
	                	// if direction changed while swiping left, set new base point
	                	if( loc.x > self.touchLastPoint.x ) {
	                		start = self.touchStartPoint = {
	                        		x: loc.x,
	                        		y: loc.y
	                        };
	                		self.isSwipeLeft = false;
	                	} else {
	                    	self.isSwipeLeft = true;                		
	                	}
	                }
	                
	                // check for right
	                if( loc.x > start.x + $MU.TOUCH_THRESHOLD ) {
	                	// if direction changed while swiping right, set new base point
	                	if( loc.x < self.touchLastPoint.x ) {
	                		self.touchStartPoint = {
	                        		x: loc.x,
	                        		y: loc.y
	                        };
	                		self.isSwipeRight = false;
	                	} else {
	                    	self.isSwipeRight = true;                		
	                	}
	                }
	
	                // check for down
	                if( loc.y < start.y - $MU.TOUCH_THRESHOLD * 3 ) {
	                	// if direction changed while swiping down, set new base point
	                	if( loc.y > self.touchLastPoint.y ) {
	                		self.touchStartPoint = {
	                        		x: loc.x,
	                        		y: loc.y
	                        };
	                		self.isSwipeDown = false;
	                	} else {
	                    	self.isSwipeDown = true;                		
	                	}
	                }
	
	                // check for up
	                if( loc.y > start.y + $MU.TOUCH_THRESHOLD ) {
                    	self.isSwipeUp = true;                		
	                }
	                
	                self.touchLastPoint = {
	                		x: loc.x,
	                		y: loc.y
	                };
	            },
	            	
	            onTouchesEnded: function(touches, event){
	            	//cc.log("onTouchesEnded!");
	
	            	var touch = touches[0],
	            		loc = touch.getLocation();
	                
	                self.touchStartPoint = null;
	                
	                if(!self.isSwipeUp && !self.isSwipeLeft && !self.isSwipeRight && !self.isSwipeDown) {
	                	if( new Date().getTime() - self.touchStartTime > $MU.LONG_TAP_TIME ) {
	    	                if( self.hookOnLongTap ) self.hookOnLongTap(loc);
	                	} else {
		                	self.isTap = true;
		                	if( self.hookOnTap ) self.hookOnTap(loc);
	                	}
	                } else {
		                self.isSwipeUp = self.isSwipeLeft = self.isSwipeRight = self.isSwipeDown = false;	                			                
	                }
	            }
	        });
		    	
	    	cc.eventManager.addListener(this._touchListener, this);
	    } else {
	        cc.log("TOUCH_ALL_AT_ONCE is not supported");
	    }
       
		/*
		 * KEYBOARD EVENTS
		 */ 
       	
	    if( false || 'keyboard' in cc.sys.capabilities ) {
	        this._keyboardListener = cc.EventListener.create({
	            event: cc.EventListener.KEYBOARD,
	            onKeyPressed:function(key, event) {
	            	var tile = self.tiles[self.tiles.length-1],
	            		sprite = tile && tile.sprite;
	            	if( !sprite ) return;
	            	var pos = sprite.getPosition();
	            	switch(key) {
	            	case 'a':
	            	case $MU.KEY_LEFT_CODE:
	            		self.touchStartPoint = { 
	            			x: pos.x,
	            			y: pos.y
	            		};
	        			self.touchLastPoint = {
	            			x: pos.x - $MU.BS,
	            			y: pos.y
	            		};
	            		self.isSwipeLeft = true;
	            		break;
	            	case 's':
	            	case $MU.KEY_RIGHT_CODE:
	            		self.touchStartPoint = { 
	            			x: pos.x,
	            			y: pos.y
	            		};
	        			self.touchLastPoint = {
	            			x: pos.x + $MU.BS,
	            			y: pos.y
	            		};
	            		self.isSwipeRight = true;
	            		break;
	            	case $MU.KEY_UP_CODE:
	            		self.isSwipeUp = true;
	            		break;
	            	case $MU.KEY_DOWN_CODE:
	            		self.isSwipeDown = true;
	            		break;
	            	}
	            },
	            onKeyReleased:function(key, event) {
	            	switch(key) {
	            	case $MU.KEY_LEFT_CODE:
		                self.touchStartPoint = null;
	            		self.isSwipeLeft = false;
	            		break;
	            	case $MU.KEY_RIGHT_CODE:
		                self.touchStartPoint = null;
	            		self.isSwipeRight = false;
	            		break;
	            	case $MU.KEY_UP_CODE:
	            		self.isSwipeUp = false;
	            		break;
	            	case $MU.KEY_DOWN_CODE:
	            		self.isSwipeDown = false;
	            		break;
	                }
	            }
	        }, this);
	        cc.eventManager.addListener(this._keyboardListener, this);
	    } else {
	         cc.log("KEYBOARD is not supported");
	    }
    },
    
    stopListeners: function() {
        cc.eventManager.removeListener(this._touchListener, this);
        cc.eventManager.removeListener(this._keyboardListener, this);
    },

	buildTile: function(p) {
		
		// select a random tile type
		var self = this,
			newTile = self.hookSetTile? self.hookSetTile() : this.getRandomValue($MU.TILE_OCCURANCES),
			tileBoxes = $MU.TILE_BOXES[newTile],
			userData = {};
		
		// set tile sprite to a column
		p.x = Math.round(p.x/$MU.BS)*$MU.BS+(32-(Math.abs(tileBoxes[0].x)%$MU.BS));
		cc.assert(p.x%($MU.BS/2) === 0, "Mupris, buildTile: Tile is not aligned to column.");

		if( this.hookSetTileImages ) {
			var tileSprite = this.hookSetTileImages(tileBoxes, newTile, p, userData);
		}
		else {
			// create sprite for tile and set is size 0, we only use its position and rotation
			var tileSprite = cc.Sprite.create(res.tiles_png,cc.rect(0,0,0,0)),
				batch = this.getChildByTag($MU.TAG_SPRITE_MANAGER);
			
			tileSprite.retain();
	        tileSprite.setPosition(p);
	        batch.addChild(tileSprite);

	        // add single boxes with letters to the tile
	        for( var i=0 ; i<tileBoxes.length ; i++) {
	        	
	    		spriteFrame = cc.spriteFrameCache.getSpriteFrame(newTile+".png"),
	    		sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,$MU.BS,$MU.BS));

	    		sprite.retain();
	        	sprite.setPosition(cc.p(tileBoxes[i].x,tileBoxes[i].y));
		        tileSprite.addChild(sprite);
	        }			
		}
        
        // build a tile object
        this.tiles.push({
        	boxes: tileBoxes,
        	sprite: tileSprite,
        	rotation: 0,
        	direction: 0,  // 0, -1, 1 
        	isRotating : false,
        	action: null,
        	fallingSpeed: $MU.FALLING_SPEED,
        	userData: userData
        });
        
        tileSprite.setRotation(0);
		rt = this.rotateBoxes(this.tiles[this.tiles.length-1]);
		
		//tileSprite.children[0].runAction(cc.tintTo(1,0,0,0));
	},
	
	getRandomValue: function(occs, sum) {
		
		if( !sum ) for( var i=0, sum=0 ; i<occs.length ; i++ ) sum += occs[i];
		
		var rnd = Math.round(Math.random()*sum),
			r = 0, i = 0;
		while(r <= rnd) {
			if( r+occs[i] >= rnd ) break;
			
			r+=occs[i++];
		}		
		return i;
	},
	
	rotateBoxes: function(t) {
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
	},
	
    update: function(dt) {
    	
    	var mg = MUPRIS_GLOBALS,
    		self = this,
			size = this.size;

    	/*
    	 * get current row / col of a box
    	 */
    	var getRowCol = function(box, lp) {
    		return {
    			col: Math.round((lp.x + box.x - $MU.BOXES_X_OFFSET - $MU.BS/2) / $MU.BS),
    			row: Math.round((lp.y + box.y - $MU.BOXES_Y_OFFSET - $MU.BS) / $MU.BS),
    		}
    	};
    	
    	/*
    	 * check if a collision happened
    	 */
    	var checkForBottom = function(t, lp) {
    		var b = t.rotatedBoxes; // usually four boxes of a tile
    		
    		// check all boxes
    		for( var i=0 ; i<b.length ; i++ ) {
    			var bx = lp.x + b[i].x,		// x pos of box
    				by = lp.y + b[i].y,		// y pos of box
    				brc1 = getRowCol(b[i], { x: lp.x + $MU.BS/2 - 5, y: lp.y}),
					brc2 = getRowCol(b[i], { x: lp.x - $MU.BS/2 + 5, y: lp.y});
    			if( by - $MU.BS/2 <= $MU.BOXES_Y_OFFSET ||    // bottom reached? 
    				(brc1.row < $MU.BOXES_PER_COL && (self.boxes[brc1.row][brc1.col] || self.boxes[brc2.row][brc2.col])) ) { // is there a fixed box under the moving box?

    				// align y to box border
    				lp.y = Math.round((lp.y - $MU.BOXES_Y_OFFSET)/($MU.BS/2))*($MU.BS/2) + $MU.BOXES_Y_OFFSET;
    				
    				// fix tile
    				if( !t.isDragged && !t.isRotating ) {
    					
    					return fixTile(t, lp);
    				}
    			}
    		}

    		return false;
    	};
    	
    	var moveHorizontalyAndCheckForBarrier = function(t, lp, tp) {
    		var b = t.rotatedBoxes,					// usually four tile boxes
    			op = t.offsetToStartPoint, 			// distance of user finger to sprite center when grabbing a tile 
    			offset = 32-(Math.abs(t.rotatedBoxes[0].x) % $MU.BS),
    			dir = Math.sign(tp.x-lp.x+op.x);  	// direction, left = -1
    		
			// limit horizontal movement to little less than one box per cycle
			lp.x = (Math.abs(tp.x - lp.x + op.x) < $MU.BS)? tp.x + op.x : lp.x + ($MU.BS-1) * dir;
			
			// move tile to center of user finger in snap speed
			if( Math.abs(op.x) > 0 ) op.x = Math.sign(op.x) * Math.max(Math.abs(op.x) - $MU.SNAP_SPEED, 0);

			var newX = null;
			// check all (four) boxes
    		for( var i=0 ; i<t.boxes.length ; i++) {
    			
        		var brc1 = getRowCol(b[i], { x: lp.x-$MU.BS/2, y: lp.y+$MU.BS-1} );
        		var brc2 = getRowCol(b[i], { x: lp.x-$MU.BS/2, y: lp.y+1} );
    			// check for left and right border
    			if( dir === -1 ) {
    				// left border?
    				if (lp.x + t.rotatedBoxes[i].x - $MU.BS/2 - $MU.BOXES_X_OFFSET < 0 ) {
    					var x = -t.rotatedBoxes[i].x + $MU.BS/2 + $MU.BOXES_X_OFFSET;
    					// take the tile that is the most left
    					newX = (newX === null)? x : Math.max(newX , x);
    				}
    				
    				// box on the left side?
    				if( self.boxes[brc1.row][brc1.col] || self.boxes[brc2.row][brc2.col] ) {
        				if( i==0 ) cc.log("MUPRIS, moveHorizontalyAndCheckForBarrier: Correcting box!");
    					var x = (brc1.col+1) * $MU.BS - t.rotatedBoxes[i].x + $MU.BS/2 + $MU.BOXES_X_OFFSET;
    					newX = (newX === null)? x : Math.max(newX , brc1.col * $MU.BS - t.rotatedBoxes[i].x - $MU.BS/2 + $MU.BOXES_X_OFFSET);
    				}
    			} else {
    				if (lp.x + t.rotatedBoxes[i].x + $MU.BS/2 - $MU.BOXES_X_OFFSET >= $MU.BOXES_PER_ROW * $MU.BS ) {
    					var x = $MU.BOXES_PER_ROW * $MU.BS - t.rotatedBoxes[i].x - $MU.BS/2 + $MU.BOXES_X_OFFSET;
    					newX = (newX === null)? x : Math.min(newX , $MU.BOXES_PER_ROW * $MU.BS - t.rotatedBoxes[i].x - $MU.BS/2 + $MU.BOXES_X_OFFSET);
    				}

    				if( self.boxes[brc1.row][brc1.col+1] || self.boxes[brc2.row][brc2.col+1]  ) {
    					var x = brc1.col * $MU.BS - t.rotatedBoxes[i].x + $MU.BS/2 + $MU.BOXES_X_OFFSET;
    					newX = (newX === null)? x : Math.min(newX , brc1.col * $MU.BS - t.rotatedBoxes[i].x + $MU.BS/2 + $MU.BOXES_X_OFFSET);
    				}
    			}
    		}
    		
    		if( newX ) {
    			lp.x = newX;
    		}
    		
    		return true;
    	};
    	
		var alignToColumn = function(t, lp, doneFn) {
			var tileOffset = $MU.BS/2 - Math.abs(t.rotatedBoxes[0].x%$MU.BS),
				offset = (lp.x-$MU.BOXES_X_OFFSET-tileOffset)%$MU.BS;
				
			offset = offset < $MU.BS/2? -offset : $MU.BS - offset;
			
			if( t.isRotating && t.rotation%180 ) offset = -offset;
				
			var targetX = lp.x + offset;
			
			if( offset ) {
				t.isAligning = true;
				t.sprite.runAction(cc.sequence( 
					cc.moveBy($MU.MOVE_SPEED,cc.p(offset,0)),
					cc.callFunc(function() {
		    			var lp = t.sprite.getPosition();
		    			t.sprite.setPosition(targetX, lp.y);
		    			t.isAligning = false;
		    			if( doneFn && typeof doneFn === "function" ) doneFn();
					}, self)
				));						
			} else {
				if( doneFn && typeof doneFn === "function" ) doneFn();
			}
		};
    	
    	var rotateTile = function rotate(t,lp) {
			var oldRotation = t.rotation;
			t.rotation = (t.rotation + 90)%360;
			self.rotateBoxes(t);
	
			// shift Tile if it needs to be align to column after rotation
			var check = checkRotation(t, lp);
			
			if( check != "collision" ) {
				// shift tile, if it would not fit into playground after rotation
				var shiftTile = -(parseInt(check) || 0);
				
				if(shiftTile != 0) {
					var targetX = lp.x + shiftTile;
					t.direction = Math.sign(shiftTile);
					if( t.direction ) {
						t.isAligning = true;
						t.sprite.runAction(cc.sequence( 
								cc.moveBy($MU.MOVE_SPEED*2,cc.p(shiftTile,0)),
								cc.callFunc(function() {
					    			var lp = t.sprite.getPosition();
					    			t.sprite.setPosition(targetX, lp.y);
					    			t.direction = 0;
									t.isAligning = false;
								}, self)
						));						
					}
				} else {
					alignToColumn(t, lp);
				}
				
				t.sprite.runAction(cc.sequence( 
						cc.rotateTo($MU.MOVE_SPEED*2,t.rotation),
						cc.callFunc(function() {
							t.isRotating = false;
						})));
				for( var i=0 ; i<t.sprite.children.length ; i++ ) {
					t.sprite.children[i].runAction(cc.rotateTo($MU.MOVE_SPEED*2,(360-t.rotation)%360));					
				}					
				
				return true;
			} else {
				t.isRotating = false;
				t.rotation = oldRotation;
				self.rotateBoxes(t);  
				
				return false;
			}
    		
    	};
    	
    	var checkRotation = function(t, lp) {
    		
    		var b = t.rotatedBoxes,
    			minOffset = 0,
    			maxOffset = 0;
    		
    		// check if tile could be in the new position
    		for( var i=0 ; i<b.length ; i++) {
        		var brc = getRowCol(b[i], lp);
        		
        		// record left and right extremes
        		minOffset = Math.min(minOffset, lp.x + b[i].x - $MU.BOXES_X_OFFSET - $MU.BS/2);
        		maxOffset = Math.max(maxOffset, lp.x + b[i].x - $MU.BOXES_X_OFFSET + $MU.BS/2);
        		
        		// check if other tiles are at the play
        		if( brc.row < 0 || self.boxes[brc.row][brc.col] ) return "collision";
    		}
    		
    		if( minOffset < 0 || maxOffset > $MU.BOXES_PER_ROW * $MU.BS ) {
    			var offset = minOffset? minOffset : maxOffset - $MU.BOXES_PER_ROW * $MU.BS,
    				newLp = {
    					x: lp.x - offset,
    					y: lp.y
        			};
    				
    			if( checkRotation(t , newLp) === "ok" ) return offset;
    			else return "collision";
    		} 
    			
    		return "ok";
    	};
    	
    	/*
    	 * Tile gets fixed on the ground
    	 */
    	var fixTile = function fixTile(t, lp) {
    		var batch = self.getChildByTag($MU.TAG_SPRITE_MANAGER),
    			b = t.rotatedBoxes,
    			newBrcs = [],
    			ret = "ok";
    		
    		// check if a tile is too high
    		for( var i=0 ; i<b.length ; i++ ) {
				var brc = getRowCol(b[i], lp);
				if( brc.row >= $MU.GAME_OVER_COL ) {
					ret = "gameover";
				}
				if( brc.row < 0 || self.boxes[brc.row][brc.col] != null ) {
					// if a box is occupied already, move tile one up 
					return fixTile(t, {x:lp.x,y:lp.y+$MU.BS});
				}
    		}
    		
    		// fix single boxes of batch sprite
    		if( ret !== "gameover" ) {
        		for( var i=0 ; i<b.length ; i++) {
            		// create a new sprite from the old child sprite
        			var sprite = t.sprite.children[i],
        				newSprite = cc.Sprite.create(sprite.getTexture(), sprite.getTextureRect());

        			newSprite.retain();
        			// Insert into boxes array
    				var brc = getRowCol(b[i], lp);
    				newBrcs.push(brc);
        			
        			newSprite.setPosition($MU.BOXES_X_OFFSET + brc.col*$MU.BS + $MU.BS/2 , $MU.BOXES_Y_OFFSET + brc.row*$MU.BS + $MU.BS/2);
        	        batch.addChild(newSprite);

            		self.boxes[brc.row][brc.col] = {
            			sprite: newSprite,
            			userData: t.userData && typeof t.userData === "object" && t.userData[i] || t.userData
            		};     					
        		}    			
    		}
    		
    		var tileRet = false;
    		if( self.hookTileFixed ) tileRet = self.hookTileFixed(newBrcs);
    		// let function save newBrcs to check if potential tile is being deleted ...
    		if( !tileRet ) self.checkForAndRemoveCompleteRows();

    		batch.removeChild(t.sprite);
       		delete t;
    		
    		return ret;
    	};
    	
    	self.checkForAndRemoveCompleteRows = function(rowToDelete) {
    		
    		// always check all rows (for now)
    		var rowsDeleted = [];
    		for( var i=0 ; i<$MU.BOXES_PER_COL ; i++ ) {
    			for( j=0 ; j<$MU.BOXES_PER_ROW ; j++ ) {
    				if(!self.boxes[i][j]) break;
    			}
    			if(j === $MU.BOXES_PER_ROW || rowToDelete === i) {
    				deleteRow(i);
    				rowsDeleted.push(i);
    			}
    		}
    		
    		// move rows above deleted rows down
    		if( rowsDeleted.length ) {
    			for( var i=0 ; i<$MU.BOXES_PER_ROW ; i++ ) {
    				// don't delete a box when it wasn't actually deleted (though it's row was)  
    				var rd = [];
    				for( var j=0 ; j<rowsDeleted.length ; j++) {
    					if( self.boxes[rowsDeleted[j]][i] === null ) rd.push(rowsDeleted[j]);
    				}
    				
	    			var r = 0,
					rows = 1,
					row = rd[0],
					nextRow = rd[++r] || null;

	    			if( rd.length > 0 ) {
		    			for( var j=row ; j<$MU.BOXES_PER_COL ; j++ ) {

	    					while( j+rows == nextRow ) {
	    						nextRow = rd[++r] || null;
	    						rows++;
	    					}

							var sprite = (self.boxes[j+rows] && self.boxes[j+rows][i] && self.boxes[j+rows][i].sprite) || null;
							if( sprite ) {
								sprite.runAction(cc.moveBy($MU.MOVE_SPEED*rows, cc.p(0,-$MU.BS*rows)));
							}    						

							self.boxes[j][i] = (self.boxes[j+rows] && self.boxes[j+rows][i]) || null;    
							
							if( self.hookMoveBoxDown ) self.hookMoveBoxDown({row:j,col:i},{row:j+rows,col:i});
	    				}	   
	    			}
    			}
    			
    			if( self.hookAllBoxesMovedDown ) self.hookAllBoxesMovedDown();
    		}
    	};
    	
       	var deleteRow = function(row) {

        	var batch = self.getChildByTag($MU.TAG_SPRITE_MANAGER);

        	// delete row ... 
        	for( var i=0 ; i<$MU.BOXES_PER_ROW ; i++ ) {
		    	if( !self.hookDeleteBox || self.hookDeleteBox({row:row,col:i}) ) {
		    		
	        		// destroy sprite and box  
		    		if( self.boxes[row][i] ) {
		            	batch.removeChild(self.boxes[row][i].sprite);
		            	self.boxes[row][i].sprite = null;
				    	self.boxes[row][i] = null;		    			    				    			
		    		}
		    	}
    		}        	
    	};

    	// call hook
    	if( self.hookUpdate ) self.hookUpdate(dt);
    	
    	// if there is no tile flying, build a new one
        var tilesFlying = self.tiles.filter(function(value) { return value !== undefined }).length;
        if( !tilesFlying ) {
            self.buildTile(cc.p(Math.random()*($MU.BOXES_PER_ROW-4)*$MU.BS+$MU.BOXES_X_OFFSET+2*$MU.BS, size.height-$MU.BS));        	
        }
        
        var isSwipe = function() {
        	return self.isSwipeLeft || self.isSwipeRight || self.isSwipeUp || self.isSwipeDown;
        }

    	/*
    	 * Main loop to move tiles
    	 */
    	for( tile in self.tiles ) {
    		var t = self.tiles[tile],
    			lp = t.sprite.getPosition(),
    			sp = self.touchStartPoint,
    			tp = self.touchLastPoint;
    		
    		// align x with pixels
    		lp.x = Math.round(lp.x); // positions manipulated by MoveBy seem to be not precise

    		/*
    		 * Move tile left and right
    		 */
    		if( !t.isDragged && !t.isAligning ) {

    			if( !t.isRotating ) {
    	    		if( self.isSwipeUp ) {
        				
        				t.isRotating = true;
        				t.fallingSpeed = $MU.FALLING_SPEED;
        				
        				rotateTile(t , lp);
    	    		} else if( self.isSwipeDown ) {
    	    			t.fallingSpeed = $MU.FALLING_SPEED * 36;
    	    		}			
    			}
    			
    			if( isSwipe() && sp &&
	    			sp.x < lp.x + $MU.BS*2 && sp.x > lp.x - $MU.BS*2 &&
	    			sp.y < lp.y + $MU.BS*2 && sp.y > lp.y - $MU.BS*2	) { // move the tile if the touch is in range
	  
	    			t.isDragged = true;
	    			t.offsetToStartPoint = {
	    				x: lp.x - sp.x,
	    				y: lp.y - sp.y
	    			}
	    		} 
	    		
    		} else {

    			if( self.touchStartPoint == null ) {
    				// align to column
    				if( !t.isAligning ) {
    					
        				alignToColumn(t,lp,function() {
        					t.isDragged = false;    					
        				});	
    				}
    			} else {

    				if( !t.isAligning ) {
        	    		moveHorizontalyAndCheckForBarrier(t,lp,tp);    					
        			
	    	    		if(tp.y < lp.y - $MU.BS*2 && !t.isRotating) {
	    	    			t.fallingSpeed = Math.max( Math.min($MU.FALLING_SPEED * 36, lp.y - $MU.BS*2 - tp.y) , $MU.FALLING_SPEED);
	    	    		} else {
	    	    			t.fallingSpeed = $MU.FALLING_SPEED;
	    	    		}
    				}    	    		
    			}
    		}
    		
    		if( self.isTap ) {
    			self.isTap = false;
    			t.fallingSpeed = $MU.FALLING_SPEED;
    		}
    		
	    	
    		// let tile fall down
    		lp.y -= t.fallingSpeed;
    		
    		var ret;
    		if( ret = checkForBottom(t, lp) ) {
    			// tile landed ...
    			delete self.tiles[tile];

    			if( ret == "gameover" ) {
    				var menuItems = [{
    					label: mg.t.reached_top_continue, 
    					cb: function(sender) {
    			        	var gameLayer = this.getParent().getChildByTag($MU.TAG_GAME_LAYER);
    				        gameLayer.resume();
    				        gameLayer.scheduleUpdate();

    			            this.getParent().removeChild(this);
    			        }
    				},{
    					label: mg.t.reached_top_end_game, 
    					cb: function(sender) {
    						if( self.hookEndGame ) self.hookEndGame();
    			        	cc.director.runScene(new MuprisScene());
    			        }
    				}];
    	            this.getParent().addChild(
    	            	new MuprisMenuLayer("",menuItems),
    	            	2);
        	        this.pause();
        	        this.unscheduleUpdate();
    			}
    	        
    		} else {
        		
        		t.sprite.setPosition(lp);    			
    		};
    	}
    }
});


var MuprisMenuLayer = cc.LayerColor.extend({
    
    ctor:function (question, menuItems) {
        var size = this.size = cc.director.getWinSize(),
    	self = this;            
        
        this._super(new cc.Color(40,0,0,160),size.width,size.height);

        this.initMenu(question, menuItems);
        
        return true;
    },

	initMenu: function(question, menuItems) {
		
        var size = this.size,
        	self = this,
        	items = [];

        // Show question
		var q = cc.LabelTTF.create(question, "Arial", 36),
	    	x = size.width/2,
	    	y = size.height/2 + menuItems.length * 96;
	
		q.setPosition(x,y);
		q.retain();
		this.addChild(q, 1);
        
        // Show menu items
        for( var i=0 ; i<menuItems.length ; i++ ) {
            items[i] = cc.MenuItemFont.create(menuItems[i].label, menuItems[i].cb, this);
            items[i].setFontSize(48);        	
        }

        var menu = cc.Menu.create.apply(this, items);
        menu.x = size.width/2;
        menu.y = size.height/2;
        this.addChild(menu, 1);       

        menu.alignItemsVerticallyWithPadding(40);
	}
});

var MuprisScene = cc.Scene.extend({
	
    onEnter:function () {
        this._super();
        
        this.addChild(new MuprisGameLayer(), 1, $MU.TAG_GAME_LAYER);
    }
});



