/*
 * BUGS
 * 
 * Tile placement
 * 
 * 1) correct rotation
 * 		tile doesn't rotate at the borders
 * 		rotating tiles multiple
 * 2) don't fix tiles while dragging
 */ 


var TAG_SPRITE_MANAGER = 1,
	TAG_MENU_LAYER = 2,
	TAG_GAME_LAYER = 3,
	BS = 64, // pixel
	BOXES_PER_COL = 22,
	GAME_OVER_COL = 16,
	BOXES_PER_ROW = 10,
	BOXES_X_OFFSET = 0,
	BOXES_Y_OFFSET = 64,
	SNAP_SPEED = 10.0, // pixel per 1/60
	FALLING_SPEED = 0.33, // pixel per 1/60
	MOVE_SPEED = 0.09, // seconds
    TOUCH_THRESHOLD = 6, // pixel
	KEY_LEFT_CODE = 37,
	KEY_UP_CODE = 38,
	KEY_RIGHT_CODE = 39,
	KEY_DOWN_CODE = 40,
	LETTER_NAMES = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","ae","oe","ue"],
	LETTER_VALUES = {"A":1,"B":3,"C":4,"D":1,"E":1,"F":4,"G":2,"H":2,"I":1,"J":6,"K":4,"L":2,"M":3,"N":1,"O":2,"P":4,"Q":10,"R":1,"S":1,"T":1,"U":1,"V":6,"W":3,"X":8,"Y":10,"Z":3,"Ä":6,"Ö":8,"Ü":6},
	LETTER_OCCURANCES = [5,2,2,4,15,2,3,4,6,1,2,3,4,9,3,1,1,6,7,6,6,1,1,1,1,1,1,1,1],
	TILE_BOXES = [
	              [{x:-1.5*BS,y: 0.0*BS},{x:-0.5*BS,y: 0.0*BS},{x: 0.5*BS,y: 0.0*BS},{x: 1.5*BS,y: 0.0*BS}],
	              [{x:-0.5*BS,y:-0.5*BS},{x:-0.5*BS,y: 0.5*BS},{x: 0.5*BS,y:-0.5*BS},{x: 0.5*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x:-1.0*BS,y:-0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x: 1.0*BS,y:-0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 0.0*BS,y:-0.5*BS},{x: 1.0*BS,y:-0.5*BS}],
	              [{x:-1.0*BS,y:-0.5*BS},{x: 0.0*BS,y:-0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS}],
	              [{x:-1.0*BS,y: 0.5*BS},{x: 0.0*BS,y: 0.5*BS},{x: 1.0*BS,y: 0.5*BS},{x: 0.0*BS,y:-0.5*BS}],
	              ],
	TILE_OCCURANCES = [10,5,7,7,2,2,7];

var MuprisGameLayer = cc.Layer.extend({
    sprite:null,
    
    tiles: [],
	boxes: [],
	selections: [],
	
    touchStartPoint: null,
    touchCurrentPoint: null,
    touchLastPoint: null,
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
			this.addChild(tilesImages, 10, TAG_SPRITE_MANAGER);			
		}
	},
	
	initBoxSpace: function() {
        var size = this.size;
        
	    // initialize boxes arrays
	    for( var i=0 ; i<BOXES_PER_COL ; i++ ) {
		    for( var j=0 ; j<BOXES_PER_ROW ; j++ ) {
		    	if( !this.boxes[i] ) this.boxes[i] = []; 
		    	this.boxes[i][j] = null;		    	
		    }		    	
	    }

	    // draw grid
	    this.drawNode = cc.DrawNode.create();
        this.addChild(this.drawNode,0);
        this.drawNode.clear();
/*        for( var i=0 ; i<=BOXES_PER_ROW ; i++ ) {
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
        }*/
        this.drawNode.drawPoly([cc.p(0,0),cc.p(size.width,0),cc.p(size.width,BS),cc.p(0,BS)],
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
	            },
	            	
	            onTouchesMoved: function(touches, event) {
	            	var touch = touches[0];
	                var loc = touch.getLocation(),
	                	start = self.touchStartPoint;
	
	                self.touchDistance = {
	            			x: Math.abs(loc.x - start.x),
	            			y: Math.abs(loc.y - start.y)
	            	}
	                
	                // check for left
	                if( loc.x < start.x - TOUCH_THRESHOLD) {
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
	                if( loc.x > start.x + TOUCH_THRESHOLD ) {
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
	                if( loc.y < start.y - TOUCH_THRESHOLD * 3 ) {
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
	                if( loc.y > start.y + TOUCH_THRESHOLD ) {
	                	// if direction changed while swiping right, set new base point
	                	if( loc.y < self.touchLastPoint.y ) {
	                		self.touchStartPoint = {
	                        		x: loc.x,
	                        		y: loc.y
	                        };
	                		self.isSwipeUp = false;
	                	} else {
	                    	self.isSwipeUp = true;                		
	                	}
	                }
	                
	                self.touchLastPoint = {
	                		x: loc.x,
	                		y: loc.y
	                };
	            },
	            	
	            onTouchesEnded: function(touches, event){
	            	//cc.log("onTouchesEnded!");
	
	            	var touch = touches[0],
	            		loc = touch.getLocation()
	            		size = self.size;
	                
	                self.touchStartPoint = null;
	                
	                if(!self.isSwipeUp && !self.isSwipeLeft && !self.isSwipeRight && !self.isSwipeDown) {
	                	self.isTap = true;
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
       	
/*       TEST SUITE CODE
  		if( 'keyboard' in cc.sys.capabilities ) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed:function(key, event) {
                    cc.log("Key down:" + key);
                },
                onKeyReleased:function(key, event) {
                    cc.log("Key up:" + key);
                }
            }, this);
        } else {
            cc.log("KEYBOARD Not supported");
        }*/

	    if( 'keyboard' in cc.sys.capabilities ) {
	        this._keyboardListener = cc.EventListener.create({
	            event: cc.EventListener.KEYBOARD,
	            onKeyPressed:function(key, event) {
	            	switch(key) {
	            	case KEY_LEFT_CODE:
	            		self.isSwipeLeft = true;
	            		break;
	            	case KEY_RIGHT_CODE:
	            		self.isSwipeRight = true;
	            		break;
	            	case KEY_UP_CODE:
	            		self.isSwipeUp = true;
	            		break;
	            	case KEY_DOWN_CODE:
	            		self.isSwipeDown = true;
	            		break;
	            	}
	            },
	            onKeyReleased:function(key, event) {
	            	switch(key) {
	            	case KEY_LEFT_CODE:
	            		self.isSwipeLeft = false;
	            		break;
	            	case KEY_RIGHT_CODE:
	            		self.isSwipeRight = false;
	            		break;
	            	case KEY_UP_CODE:
	            		self.isSwipeUp = false;
	            		break;
	            	case KEY_DOWN_CODE:
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
		var newTile = this.getRandomValue(TILE_OCCURANCES),
			tileBoxes = TILE_BOXES[newTile],
			userData = {};
		
		//tileBoxes = TILE_BOXES[Math.floor(Math.random()*1)+0];
		
		// set tile sprite to a column
		p.x = Math.round(p.x/BS)*BS+(32-(Math.abs(tileBoxes[0].x)%BS));
		cc.assert(p.x%(BS/2) === 0, "Mupris, buildTile: Tile is not aligned to column.");

		if( this.hookSetTileImages ) {
			var tileSprite = this.hookSetTileImages(tileBoxes, newTile, p, userData);
		}
		else {
			// create sprite for tile and set is size 0, we only use its position and rotation
			var tileSprite = cc.Sprite.create(res.tiles_png,cc.rect(0,0,0,0)),
				batch = this.getChildByTag(TAG_SPRITE_MANAGER);
			
			tileSprite.retain();
	        tileSprite.setPosition(p);
	        batch.addChild(tileSprite);

	        // add single boxes with letters to the tile
	        for( var i=0 ; i<tileBoxes.length ; i++) {
	        	
	    		spriteFrame = cc.spriteFrameCache.getSpriteFrame(newTile+".png"),
	    		sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,BS,BS));

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
        	fallingSpeed: FALLING_SPEED,
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
    	
    	var self = this,
			size = this.size;

    	/*
    	 * get current row / col of a box
    	 */
    	var getRowCol = function(box, lp) {
    		return {
    			col: Math.round((lp.x + box.x - BOXES_X_OFFSET - BS/2) / BS),
    			row: Math.round((lp.y + box.y - BOXES_Y_OFFSET - BS) / BS),
    		}
    	};
    	
    	/*
    	 * check if a collision happened
    	 */
    	var checkForBottom = function(t, lp) {
    		var b = t.rotatedBoxes;
    		
    		for( var i=0 ; i<b.length ; i++ ) {
    			var bx = lp.x + b[i].x,
    				by = lp.y + b[i].y,
    				brc = getRowCol(b[i], lp);
    			    	
    			// check for bottom or fixed boxes
    			if( by - BS/2 <= BOXES_Y_OFFSET || 
    				(brc.row < BOXES_PER_COL && self.boxes[brc.row][brc.col]) ) {

    				// align y to box border
    				lp.y = Math.round((lp.y - BOXES_Y_OFFSET)/(BS/2))*(BS/2) + BOXES_Y_OFFSET;
    				
    				// fix tile
    				if( !t.isDragged ) {
    					
    					return fixTile(t, lp);
    				}
    			}
    		}

    		return false;
    	};
    	
    	var moveHorizontalyAndCheckForBarrier = function(t, lp, tp) {
    		var b = t.rotatedBoxes,
    			op = t.offsetToStartPoint,
    			offset = 32-(Math.abs(t.rotatedBoxes[0].x) % BS),
    			dir = Math.sign(tp.x-lp.x+op.x);
    		
			// limit horizontal movement to little less than one box per cycle
			lp.x = (Math.abs(tp.x - lp.x + op.x) < BS)? tp.x + op.x : lp.x + (BS-1) * dir;
			
			if( Math.abs(op.x) > 0 ) op.x = Math.sign(op.x) * Math.max(Math.abs(op.x) - SNAP_SPEED, 0);

			var newX = null;
    		for( var i=0 ; i<t.boxes.length ; i++) {
    			
        		var brc = getRowCol(b[i], { x: lp.x-BS/2, y: lp.y} );
    			// check for left and right border
    			if( dir === -1 ) {
    				if (lp.x + t.rotatedBoxes[i].x - BS/2 - BOXES_X_OFFSET < 0 ) {
    					var x = -t.rotatedBoxes[i].x + BS/2 + BOXES_X_OFFSET;
    					newX = (newX === null)? x : Math.max(newX , -t.rotatedBoxes[i].x + BS/2 + BOXES_X_OFFSET);
    				}
    				
    				if( self.boxes[brc.row][brc.col] ) {
    					var x = (brc.col+1) * BS - t.rotatedBoxes[i].x + BS/2 + BOXES_X_OFFSET;
    					newX = (newX === null)? x : Math.max(newX , brc.col * BS - t.rotatedBoxes[i].x - BS/2 + BOXES_X_OFFSET);
    				}
    			} else {
    				if (lp.x + t.rotatedBoxes[i].x + BS/2 - BOXES_X_OFFSET >= BOXES_PER_ROW * BS ) {
    					var x = BOXES_PER_ROW * BS - t.rotatedBoxes[i].x - BS/2 + BOXES_X_OFFSET;
    					newX = (newX === null)? x : Math.min(newX , BOXES_PER_ROW * BS - t.rotatedBoxes[i].x - BS/2 + BOXES_X_OFFSET);
    				}

    				if( self.boxes[brc.row][brc.col+1] ) {
    					var x = brc.col * BS - t.rotatedBoxes[i].x + BS/2 + BOXES_X_OFFSET;
    					newX = (newX === null)? x : Math.min(newX , brc.col * BS - t.rotatedBoxes[i].x + BS/2 + BOXES_X_OFFSET);
    				}

    			}
    		}
    		
    		if( newX ) {
    			lp.x = newX;
    		}
    		
    		return true;
    	};
    	
		var alignToColumn = function(t, lp, doneFn) {
			var tileOffset = BS/2 - Math.abs(t.rotatedBoxes[0].x%BS),
				offset = (lp.x-BOXES_X_OFFSET-tileOffset)%BS;
				
			offset = offset < BS/2? -offset : BS - offset;
			
			if( t.isRotating && t.rotation%180 ) offset = -offset;
				
			var targetX = lp.x + offset;
			
			if( offset ) {
				t.isAligning = true;
				t.sprite.runAction(cc.sequence( 
					cc.moveBy(MOVE_SPEED,cc.p(offset,0)),
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
								cc.moveBy(MOVE_SPEED*2,cc.p(shiftTile,0)),
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
						cc.rotateTo(MOVE_SPEED*2,t.rotation),
						cc.callFunc(function() {
							t.isRotating = false;
						})));
				for( var i=0 ; i<t.sprite.children.length ; i++ ) {
					t.sprite.children[i].runAction(cc.rotateTo(MOVE_SPEED*2,(360-t.rotation)%360));					
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
        		minOffset = Math.min(minOffset, lp.x + b[i].x - BOXES_X_OFFSET - BS/2);
        		maxOffset = Math.max(maxOffset, lp.x + b[i].x - BOXES_X_OFFSET + BS/2);
        		
        		// check if other tiles are at the play
        		if( brc.row < 0 || self.boxes[brc.row][brc.col] ) return "collision";
    		}
    		
    		if( minOffset < 0 || maxOffset > BOXES_PER_ROW * BS ) {
    			var offset = minOffset? minOffset : maxOffset - BOXES_PER_ROW * BS,
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
    		var batch = self.getChildByTag(TAG_SPRITE_MANAGER),
    			b = t.rotatedBoxes,
    			newBrcs = [],
    			ret = "ok";
    		
    		// check if a tile is too high
    		for( var i=0 ; i<b.length ; i++ ) {
				var brc = getRowCol(b[i], lp);
				if( brc.row >= GAME_OVER_COL ) {
					ret = "gameover";
				}
				if( brc.row < 0 || self.boxes[brc.row][brc.col] != null ) {
					// if a box is occupied already, move tile one up 
					return fixTile(t, {x:lp.x,y:lp.y+BS});
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
        			
        			newSprite.setPosition(BOXES_X_OFFSET + brc.col*BS + BS/2 , BOXES_Y_OFFSET + brc.row*BS + BS/2);
        	        batch.addChild(newSprite);

            		self.boxes[brc.row][brc.col] = {
            			sprite: newSprite,
            			userData: t.userData && typeof t.userData === "object" && t.userData[i] || t.userData
            		};     					
        		}    			
    		}
    		
    		if( self.hookTileFixed ) self.hookTileFixed(newBrcs);

    		checkForAndRemoveCompleteRows();

    		batch.removeChild(t.sprite);
       		delete t;
    		
    		return ret;
    	};
    	
    	var checkForAndRemoveCompleteRows = function() {
    		
    		// always check all rows (for now)
    		var rowsDeleted = [];
    		for( var i=0 ; i<BOXES_PER_COL ; i++ ) {
    			for( j=0 ; j<BOXES_PER_ROW ; j++ ) {
    				if(!self.boxes[i][j]) break;
    			}
    			if(j === BOXES_PER_ROW) {
    				deleteRow(i);
    				rowsDeleted.push(i);
    			}
    		}
    		
    		// move rows above deleted rows down
    		if( rowsDeleted.length ) {
    			var r = 0,
					rows = 1,
					row = rowsDeleted[r],
					nextRow = rowsDeleted[++r] || null;

    			for( var i=row ; i<BOXES_PER_COL ; i++ ) {
    				
					while( i+rows == nextRow) {
						nextRow = rowsDeleted[++r] || null;
						rows++;
					}

					for( var j=0 ; j<BOXES_PER_ROW ; j++ ) {
						
						var sprite = (self.boxes[i+rows] && self.boxes[i+rows][j] && self.boxes[i+rows][j].sprite) || null;
						if( sprite ) {
							sprite.runAction(cc.moveBy(MOVE_SPEED*rows, cc.p(0,-BS*rows)));
						}
						
						self.boxes[i][j] = (self.boxes[i+rows] && self.boxes[i+rows][j]) || null;
					}					
				}
    		}
    	};
    	
       	var deleteRow = function(row) {

        	var batch = self.getChildByTag(TAG_SPRITE_MANAGER);

        	// delete row ... 
        	for( var i=0 ; i<BOXES_PER_ROW ; i++ ) {
		    	if( !self.hookDeleteBox || self.hookDeleteBox({row:row,col:i}) ) {
		    		
	        		// destroy sprite and box        		
	            	batch.removeChild(self.boxes[row][i].sprite);
	            	self.boxes[row][i].sprite = null;
			    	self.boxes[row][i] = null;		    			    		
		    	}
    		}        	
    	};

    	// if there is no tile flying, build a new one
        var tilesFlying = self.tiles.filter(function(value) { return value !== undefined }).length;
        if( !tilesFlying ) {
            self.buildTile(cc.p(Math.random()*(BOXES_PER_ROW-4)*BS+BOXES_X_OFFSET+2*BS, size.height-BS));        	
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
    	    		if( self.isSwipeUp && !(self.isSwipeLeft || self.isSwipeRight) ) {
        				
        				t.isRotating = true;
        				t.fallingSpeed = FALLING_SPEED;
        				
        				rotateTile(t , lp);
    	    		}    				
    			}
    			
    			if( isSwipe() &&
	    			sp.x < lp.x + BS*2 && sp.x > lp.x - BS*2 &&
	    			sp.y < lp.y + BS*2 && sp.y > lp.y - BS*2	) { // move the tile if the touch is in range
	  
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
        			
	    	    		if(tp.y < lp.y - BS*2 && !t.isRotating) {
	    	    			t.fallingSpeed = Math.min(FALLING_SPEED * 36, lp.y - BS*2 - tp.y);
	    	    		} else {
	    	    			t.fallingSpeed = FALLING_SPEED;
	    	    		}
    				}    	    		
    			}
    		}
    		
    		if( self.isTap ) {
    			self.isTap = false;
    			t.fallingSpeed = FALLING_SPEED;
    		}
    		
	    	
    		// let tile fall down
    		lp.y -= t.fallingSpeed;
    		
    		var ret;
    		if( ret = checkForBottom(t, lp) ) {
    			// tile landed ...
    			delete self.tiles[tile];

    			if( ret == "gameover" ) {
    	            this.getParent().addChild(
    	            	new MuprisMenuLayer(new cc.Color(40,0,0,160),size.width,size.height),
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
    
    ctor:function (color, width, height) {
        this._super(color, width, height);

        var size = this.size = cc.director.getWinSize(),
        	self = this;            
            
        this.initMenu(color, width, height);
        
        return true;
    },

	initMenu: function(color, width, height) {
		
        var size = this.size,
        	self = this;

        var item1 = cc.MenuItemFont.create("RESUME", function(sender) {
        	var gameLayer = this.getParent().getChildByTag(TAG_GAME_LAYER);
	        gameLayer.resume();
	        gameLayer.scheduleUpdate();

            this.getParent().removeChild(this);
        }, this);
        
        var item2 = cc.MenuItemFont.create("RESTART", function(sender) {
        	cc.director.runScene(new MuprisScene());
        }, this);

        item1.setFontSize(48);
        item2.setFontSize(48);

        var menu = cc.Menu.create(item1, item2);
        menu.x = size.width/2;
        menu.y = 480;
        this.addChild(menu, 1);       
        menu.alignItemsVertically();
	}
});

var MuprisScene = cc.Scene.extend({
	menuLayer: null,
	
	getMenuLayer: function() {
		return this.menuLayer;
	},
	
    onEnter:function () {
        this._super();
        
        this.menuLayer = new MuprisMenuLayer();
        
        this.addChild(new MuprisGameLayer(), 1, TAG_GAME_LAYER);
    }
});



