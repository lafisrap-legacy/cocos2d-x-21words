////////////////////////////////////////////////////////////////////
// tweet.js contains the code for the tweet at the end of one round, input and sending
//

$42.TWEET_TEXT_WIDTH = 640;
$42.TWEET_TEXT_HEIGHT = 800;
$42.TWEET_TEXT_POS = cc.p(0, 1136-$42.TWEET_TEXT_HEIGHT);
$42.TWEET_TEXT_COLOR = cc.color(255,255,240,50);
$42.TWEET_TEXT_PADDING = 30;
$42.TWEET_TEXT_LINEHEIGHT = 65;
$42.TWEET_TEXT_SPACE_WIDTH = 15;
$42.TWEET_SHORTIES_WIDTH = 640;
$42.TWEET_SHORTIES_HEIGHT = 160;
$42.TWEET_SHORTIES_POS = cc.p(0, 1136-$42.TWEET_TEXT_HEIGHT-$42.TWEET_SHORTIES_HEIGHT);
$42.TWEET_SHORTIES_COLOR = cc.color(240,240,255,100);
$42.TWEET_SHORTIES_LINEHEIGHT = 65;
$42.TWEET_SHORTIES_SPACE_WIDTH = 15;
$42.TWEET_SHORTIES_PADDING = 15;

var TWEET_MODULE = function(layer) {
	var ml = layer,
        tLayer = null,      // tweet layer
        txLayer = null,     // text layer
        shLayer = null,     // shorties layer
        mvLayer = null,     // movable layer
        menu = null,    // menu
        movableWords = [],
        selectableWords = [],
        shortiesWidth = null,
        shortiesXPos = null,
        tmp = 0;

    ml.hookTweet = function(cb) {
        init();
    };

    var init = function() {

        tLayer = new cc.Layer();
        ml.addChild(tLayer, 10);
        _42_retain(tLayer, "Tweet layer");

        ////////////////////////////////////
        // init text layer
        txlLayer = new cc.LayerColor($42.TWEET_TEXT_COLOR, $42.TWEET_TEXT_WIDTH, $42.TWEET_TEXT_HEIGHT);
        txlLayer.setPosition($42.TWEET_TEXT_POS);
        tLayer.addChild(txlLayer);
        _42_retain(txlLayer, "Tweet text layer");
        putWordsIntoTextLayer();

        ////////////////////////////////////
        // init shorties layer
        shLayer = new cc.LayerColor($42.TWEET_SHORTIES_COLOR, $42.TWEET_SHORTIES_WIDTH, $42.TWEET_SHORTIES_HEIGHT);
        tLayer.addChild(shLayer);
        shLayer.setPosition($42.TWEET_SHORTIES_POS);
        _42_retain(shLayer, "Tweet shorties layer");
        putWordsIntoShortiesLayer();
    };

    var putWordsIntoTextLayer = function() {
        var wt = $42.wordTreasure,
            padding = $42.TWEET_TEXT_PADDING,
            textWidth = $42.TWEET_TEXT_WIDTH - padding * 2,
            textHeight = $42.TWEET_TEXT_HEIGHT;
        
        for( var i=0,x=0,y=0 ; i<wt.length ; i++ ) {

			var label = cc.LabelTTF.create(wt[i].word, _42_getFontName(res.exo_regular_ttf) , 44),
                size = label.getContentSize();
            
            if( x + size.width > textWidth ) {
                x = 0;
                y += $42.TWEET_TEXT_LINEHEIGHT;
            }

			label.setPosition(cc.p(padding + x + size.width/2, textHeight - padding - y - size.height/2));
			label.setColor(cc.color(0,0,0));
			_42_retain(label, "moveable word");	
			txlLayer.addChild(label, 5);
            label.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.delayTime(Math.random()*84+84),
                        cc.EaseSineIn.create(
                            cc.scaleTo(1,0.9)
                        ),
                        cc.EaseSineOut.create(
                            cc.scaleTo(1,1)
                        )
                    )
                )
            );

            movableWords.push({
                word: wt[i].word,
                label: label
            });

            x += size.width + $42.TWEET_TEXT_SPACE_WIDTH;
        }
    };

    putWordsIntoShortiesLayer = function() {
        var sh = $42.shorties,
            padding = $42.TWEET_TEXT_PADDING;

        ////////////////////////////////////
        // init moving shorties layer
        mvLayer = new cc.LayerColor(cc.color(0,0,0,0), 0, $42.TWEET_SHORTIES_HEIGHT);
        shLayer.addChild(mvLayer);
        mvLayer.setPosition(shortiesXPos, 0);
        _42_retain(mvLayer, "Tweet shorties moving layer");
        
        for( var i=0 ; i<sh.length ; i++ ) {

			var label = cc.LabelTTF.create(sh[i], _42_getFontName(res.exo_regular_ttf) , 44),
                size = label.getContentSize();
            
            selectableWords.push({
                word: sh[i],
                label: label
            });

            mvLayer.addChild(label);
        }

        shortiesWidth = distributeShorties();
        shortiesXPos = 0;
        mvLayer.changeWidth(shortiesWidth);
    };

    distributeShorties = function() {
        var sw = selectableWords,
            padding = $42.TWEET_TEXT_PADDING;
       
        ///////////////////////////////
        // Sort shorties
        sw.sort(function(a,b) { return a.word < b.word? -1:1; });

        ///////////////////////////////
        // Determine positions
        // First: get total width
        for( var i=0,tWidth=0 ; i<sw.length ; i++ ) tWidth += sw[i].label.getContentSize().width + $42.TWEET_SHORTIES_SPACE_WIDTH;
        // Second: distribute shorties
        for( var i=0,x=0,y=0 ; i<sw.length ; i++ ) {
            var width = sw[i].label.getContentSize().width;
            if( y === 0 && x + width/2 > tWidth/2 ) {
                var half1 = x,
                    half2 = tWidth-x;
                tWidth = Math.max(half1, half2);
                x = 0;
                y = $42.TWEET_SHORTIES_LINEHEIGHT;
            }
            sw[i].label.setPosition(cc.p(x+width/2,$42.TWEET_SHORTIES_HEIGHT - $42.TWEET_SHORTIES_PADDING - $42.TWEET_SHORTIES_LINEHEIGHT/2 - y));

            x += width + $42.TWEET_SHORTIES_SPACE_WIDTH;
        }
        // Third: Align them to center and set final position
        var align1 = tWidth-half1,
            align2 = tWidth-half2;
        for( var i=0 ; i<sw.length ; i++ ) {
            var pos   = sw[i].label.getPosition();

            pos.x += (pos.x<=half1? align1:align2) + $42.TWEET_SHORTIES_PADDING;

            sw[i].label.setPosition(pos);
        }

        return tWidth;
    };
};    
