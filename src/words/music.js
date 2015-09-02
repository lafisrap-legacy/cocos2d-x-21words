$42.MUSIC_VOLUME_GRANULARITY = 10;

////////////////////////////////////////////////
// Music for level 1
$42.MUSIC_RED_HILLS = {
    background: {
        intro: res.red_hills_intro_mp3,
        introLength:    90.592653,
        introTimes:     24,
        introMeasure:   4,
        loop:  res.red_hills_loop_mp3,
        loopLength:     90.592653,
        loopTimes:      24,
        loopMeasure:    4,
        fadeOutDelay:   0.972,
        fadeOutTime:    0.460
    },
    levelWords:     { 
        audio: res.red_hills_level_words_mp3,
        delay: 1500,
    },
    levelNr:        { 
        audio: res.red_hills_level_nr_mp3, 
        delay: 4500
    },
    setTile:        { audio: res.red_hills_set_tile_mp3 },
    swipe:          { audio: [res.red_hills_swipe_1_mp3, res.red_hills_swipe_2_mp3, res.red_hills_swipe_3_mp3] },
    rotate:         { 
        audio: [res.red_hills_rotate_1_mp3, res.red_hills_rotate_2_mp3, res.red_hills_rotate_3_mp3],
        minInterval: 000 
    },
    fixTile:        { 
        audio: res.red_hills_fix_tile_1_mp3, 
        playOnCount:    true,
        maxDelay:       0.00,
        shift:          -0.05,
    }, 
    selection:      { audio: res.red_hills_selection_mp3 },
    fullWord:       { audio: res.red_hills_full_word_mp3 },
    lastWord:       { audio: res.red_hills_last_word_mp3 },
    deleteRow:      { audio: res.red_hills_delete_row_mp3 }
};


////////////////////////////////////////////////
// Music for level 2
$42.MUSIC_FLAMES = {
    background: {
        intro: res.flames_intro_mp3,
        introLength:    90.592653,
        introTimes:     24,
        introMeasure:   4,
        loop:  res.flames_loop_mp3,
        loopLength:     90.592653,
        loopTimes:      24,
        loopMeasure:    4,
        fadeOutDelay:   0.972,
        fadeOutTime:    0.460
    },
    levelWords:     { 
        audio: res.flames_level_words_mp3,
        delay: 1500,
    },
    levelNr:        { 
        audio: res.flames_level_nr_mp3, 
        delay: 4500
    },
    setTile:        { audio: res.flames_set_tile_mp3 },
    swipe:          { audio: res.flames_swipe_mp3 },
    rotate:         { 
        audio: [res.flames_rotate_1_mp3, res.flames_rotate_2_mp3, res.flames_rotate_3_mp3],
        minInterval: 000 
    },
    fixTile:        { 
        audio: res.flames_fix_tile_1_mp3, 
        playOnCount:    true,
        maxDelay:       0.00,
        shift:          -0.05,
    }, 
    selection:      { audio: res.flames_selection_mp3 },
    fullWord:       { audio: res.flames_full_word_mp3 },
    lastWord:       { audio: res.flames_last_word_mp3 },
    deleteRow:      { audio: res.flames_delete_row_mp3 }
};

////////////////////////////////////////////////
// Music for level 5
$42.MUSIC_BLUE_MOUNTAINS = {
    background: {
        intro: res.blue_mountains_intro_mp3,
        introLength:    90.592653,
        introTimes:     24,
        introMeasure:   4,
        loop:  res.blue_mountains_loop_mp3,
        loopLength:     90.592653,
        loopTimes:      24,
        loopMeasure:    4,
        fadeOutDelay:   0.972,
        fadeOutTime:    0.460
    },
    levelWords:     { 
        audio: res.blue_mountains_level_words_mp3,
        delay: 1500,
    },
    levelNr:        { 
        audio: res.blue_mountains_level_nr_mp3, 
        delay: 4500
    },
    setTile:        { audio: res.blue_mountains_set_tile_mp3 },
    swipe:          { audio: res.blue_mountains_swipe_mp3 },
    rotate:         { 
        audio: [res.blue_mountains_rotate_1_mp3, res.blue_mountains_rotate_2_mp3, res.blue_mountains_rotate_3_mp3],
        minInterval: 000 
    },
    fixTile:        { 
        audio: [res.blue_mountains_fix_tile_1_mp3, res.blue_mountains_fix_tile_1_mp3, res.blue_mountains_fix_tile_2_mp3], 
        playOnCount:    true,
        maxDelay:       0.00,
        shift:          -0.05,
    }, 
    selection:      { audio: res.blue_mountains_selection_mp3 },
    fullWord:       { audio: res.blue_mountains_full_word_mp3 },
    lastWord:       { audio: res.blue_mountains_last_word_mp3 },
    deleteRow:      { audio: res.blue_mountains_swipe_mp3 }
};

var _MUSIC_MODULE = function(layer) {
    var musicPlaying = null;

    layer.playEffect = function(effect) {
        var mp = musicPlaying,
            time = new Date().getTime();

        if( effect.minInterval ) {
            if( time - (effect.lastPlay || 0) < effect.minInterval ) return;
            effect.lastPlay = time;
        }

        cc.audioEngine.setEffectsVolume($42.EFFECTS_VOLUME);
        if( typeof effect.audio === "string" ) effect.audio = [effect.audio];
        if( effect.audioSlot === undefined ) effect.audioSlot = 0;
        else effect.audioSlot = ++effect.audioSlot%effect.audio.length;

        var as = effect.audioSlot;
        if( effect.playOnCount && mp ) {
            var span = time - mp.startTime,
                count = Math.floor(span/mp.countLength),
                offset = Math.min( span - count * mp.countLength - (effect.shift || 0)*mp.countLength, mp.countLength);

            cc.log("Count offset: "+(offset/mp.countLength)+"ms");
            if( effect.maxDelay && effect.maxDelay > offset/mp.countLength ) {
                cc.audioEngine.playEffect(effect.audio[as]);
            } else {
                setTimeout(function() {
                    cc.audioEngine.playEffect(effect.audio[as]);
                }, (mp.countLength - offset)%mp.countLength);
                cc.log("Waiting for: "+(mp.countLength-offset)+"ms");
            }
        } else {
            cc.audioEngine.playEffect(effect.audio[as]);
        }
    };

    layer.callFuncOnNextCount = function(cb, mp, cnt) {
        var mp = mp || musicPlaying,
            time = new Date().getTime();
        if( mp ) {
            var span = time - (mp.startTime || time),
                count = Math.floor(span/mp.countLength),
                offset = span - count * mp.countLength;

            setTimeout(cb, mp.countLength * (cnt || 1) - offset);
        }
    };

    layer.playInCount = function(effect) {
        var mp = musicPlaying;

        cc.audioEngine.setEffectsVolume($42.EFFECTS_VOLUME);
        if( typeof effect.audio === "string" ) effect.audio = [effect.audio];
        if( effect.audioSlot === undefined ) effect.audioSlot = 0;
        else effect.audioSlot = ++effect.audioSlot%effect.audio.length;

        var as = effect.audioSlot, 
            span = new Date().getTime() - mp.startTime,
            shift = effect.shift*mp.countLength + (effect.shift<0? mp.countLength : 0);

        setTimeout( function() {
            setInterval(function() {
                cc.audioEngine.playEffect(effect.audio[as]);
            }, mp.countLength);
        }, shift);
    };

    layer.playBackgroundMusic = function(bMusic) {
        var time = new Date().getTime();

        bMusic.startTime   = new Date().getTime();
        bMusic.countLength = bMusic.introLength*1000 / bMusic.introTimes / bMusic.introMeasure;
        cc.audioEngine.playMusic(bMusic.intro, false);
        cc.audioEngine.setMusicVolume($42.MUSIC_VOLUME);

        bMusic.timeout = setTimeout(function() {
            bMusic.startTime   = new Date().getTime();
            bMusic.countLength = bMusic.loopLength*1000 / bMusic.loopTimes / bMusic.loopMeasure;
            cc.audioEngine.playMusic(bMusic.loop, true);
            
        }, bMusic.introLength*1000);

        musicPlaying = bMusic;
    };

    layer.stopBackgroundMusic = function(time) {
        var mp = musicPlaying,
            stopMusic = function() {
                if( mp.timeout ) clearTimeout(mp.timeout);
                cc.audioEngine.stopMusic();
                musicPlaying = null;
            };

        if( mp && time ) {
            var volume = cc.audioEngine.getMusicVolume(),
                vg = $42.MUSIC_VOLUME_GRANULARITY,
                steps = Math.ceil(time * 1000 / vg),
                step = volume / steps;

            var interval = setInterval(function() {
                volume -= step;
                if( volume < 0 ) {
                    stopMusic();
                    clearInterval(interval);
                } else {
                    cc.audioEngine.setMusicVolume(volume);
                }
            }, $42.MUSIC_VOLUME_GRANULARITY);
        } else if( mp ) stopMusic();
    };
}

