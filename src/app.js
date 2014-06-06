var TAG_SPRITE_MANAGER = 1,
	TILE_SIZE = 32, // pixel
	LETTER_NAMES = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","ae","oe","ue","ss"];

var MutrixLayer = cc.Layer.extend({
    sprite:null,
    ctor:function () {
        this._super();

        var size = this.size = cc.director.getWinSize();

        this.startAnimation();
        this.loadImages();
        this.buildTile(cc.p(size.width/2, size.height/2));

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

	buildTile: function(p) {

		// create sprite for tile and set is size 0, we only use its position and rotation
		var tileSprite = cc.Sprite.create(res.letters_png,cc.rect(0,0,0,0)),
			batch = this.getChildByTag(TAG_SPRITE_MANAGER);
		
        //tileSprite.opacity = 0;
        tileSprite.setPosition(p);
        batch.addChild(tileSprite);
        
        for( var i=0 ; i<4 ; i++) {
        	
        	var letter = LETTER_NAMES[parseInt(Math.random()*LETTER_NAMES.length)],
        		spriteFrame = cc.spriteFrameCache.getSpriteFrame(letter+".png"),
        		sprite = cc.Sprite.create(spriteFrame,cc.rect(0,0,TILE_SIZE,TILE_SIZE));
        	
        	sprite.setPosition(cc.p(36*i,36*i));
	        tileSprite.addChild(sprite);
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

