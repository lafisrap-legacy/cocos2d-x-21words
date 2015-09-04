$42.MUSIC_VOLUME_GRANULARITY = 10;

////////////////////////////////////////////////
// Music for easy title
$42.MUSIC_TITLE_EASY = {
    intro: res.title_easy_intro_mp3,
    introLength:    11.376000,
    loop:  res.title_easy_loop_mp3,
    loopLength:     38.124000,
    fadeOutDelay:   0,
    fadeOutTime:    5000
}

////////////////////////////////////////////////
// Music for level 1
$42.MUSIC_RED_HILLS = {
    background: {
        intro:          null,
        loop:           null
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
    swipe:          { 
        audio: [res.red_hills_swipe_1_mp3, res.red_hills_swipe_2_mp3, res.red_hills_swipe_3_mp3],
        intervalTime: 450
    },
    rotate:         { 
        audio: [res.red_hills_rotate_1_mp3, res.red_hills_rotate_2_mp3, res.red_hills_rotate_3_mp3],
        minInterval: 000 
    },
    fixTile:        { audio: res.red_hills_fix_tile_1_mp3 }, 
    selection:      { audio: res.red_hills_selection_mp3 },
    fullWord:       { audio: res.red_hills_full_word_mp3 },
    lastWord:       { audio: res.red_hills_last_word_mp3 },
    deleteRow:      { audio: res.red_hills_delete_row_mp3 }
};


////////////////////////////////////////////////
// Music for level 2
$42.MUSIC_FLAMES = {
    background: {
        intro:          null,
        loop:           res.flames_loop_mp3,
        loopLength:     82.625306,
        loopTimes:      24,
        loopMeasure:    4
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
    swipe:          { 
        audio: [res.flames_swipe_1_mp3, res.flames_swipe_2_mp3, res.flames_swipe_3_mp3], 
        intervalTime: 450
    },
    rotate:         { 
        audio: [res.flames_rotate_1_mp3, res.flames_rotate_2_mp3, res.flames_rotate_3_mp3],
        minInterval: 0 
    },
    fixTile:        { audio: res.flames_fix_tile_1_mp3 }, 
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
        loopMeasure:    4
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
    swipe:          { 
        audio: res.blue_mountains_swipe_mp3,
        dontStop: true
    },
    rotate:         { 
        audio: [res.blue_mountains_rotate_1_mp3, res.blue_mountains_rotate_2_mp3, res.blue_mountains_rotate_3_mp3],
        minInterval: 000 
    },
    fixTile:        { 
        audio: [res.blue_mountains_fix_tile_1_mp3, res.blue_mountains_fix_tile_1_mp3, res.blue_mountains_fix_tile_2_mp3], 
        playOnBeat:    true,
        maxDelay:       0.00,
        shift:          -0.05,
    }, 
    selection:      { audio: res.blue_mountains_selection_mp3 },
    fullWord:       { audio: res.blue_mountains_full_word_mp3 },
    lastWord:       { audio: res.blue_mountains_last_word_mp3 },
    deleteRow:      { audio: res.blue_mountains_delete_row_mp3 }
};

var _MUSIC_MODULE = function(layer) {
    var musicPlaying = null;

    layer.playEffect = function playEffect(effect) {
        var mp = musicPlaying,
            time = new Date().getTime();

        if( effect.minInterval ) {
            if( time - (effect.lastPlay || 0) < effect.minInterval ) return;
        }

        cc.log("Now ("+time+") playing effect: "+effect.audio);
        
        cc.audioEngine.setEffectsVolume($42.EFFECTS_VOLUME);
        if( typeof effect.audio === "string" ) effect.audio = [effect.audio];
        if( effect.audioSlot === undefined ) effect.audioSlot = 0;
        else effect.audioSlot = ++effect.audioSlot%effect.audio.length;

        var as = effect.audioSlot;
        if( effect.playOnBeat && mp ) {
            var span = time - mp.startTime,
                beat = Math.floor(span/mp.beatLength),
                offset = Math.min( span - beat * mp.beatLength - (effect.shift || 0)*mp.beatLength, mp.beatLength);

            cc.log("Beat offset: "+(offset/mp.beatLength)+"ms");
            if( effect.maxDelay && effect.maxDelay > offset/mp.beatLength ) {
                effect.id = cc.audioEngine.playEffect(effect.audio[as]);
            } else {
                setTimeout(function() {
                    effect.id = cc.audioEngine.playEffect(effect.audio[as]);
                }, (mp.beatLength - offset)%mp.beatLength);
                cc.log("Waiting for: "+(mp.beatLength-offset)+"ms");
            }
        } else if( effect.intervalTime && !effect.interval ) {
            effect.id = cc.audioEngine.playEffect(effect.audio[as]);
            effect.interval = setInterval(function() {
                if( effect.intervalIsEnding ) {
                    cc.log("Ending interval of "+effect.audio[as]);
                    clearInterval(effect.interval);
                    effect.interval = null;
                    effect.intervalIsEnding = false;
                } else {
                    cc.log("Playing in interval: "+effect.audio[as]);
                    playEffect(effect);
                }
            }, effect.intervalTime);
        } else {
            effect.id = cc.audioEngine.playEffect(effect.audio[as]);
        }
        
        effect.lastPlay = time;
    };

    layer.stopEffect = function(effect) {
        cc.log("Now stopping effect "+effect.audio);
        if( effect.interval ) {
            if( !effect.intervalIsEnding ) {
                effect.intervalIsEnding = true;
                if( effect.end ) {
                    var span = new Date().getTime() - effect.lastPlay;
                    setTimeout(function() {
                        cc.log("Playing end of interval: "+effect.end);
                        layer.playEffect({audio: effect.end});
                    }, effect.endDelay-span || 0 );
                }
            }
        } else if(!effect.dontStop ) {
            cc.audioEngine.stopEffect(effect.id);
            effect.id = null;
        }
    };

    layer.callFuncOnNextBeat = function(cb, mp, granularity, cnt) {
        var mp = mp || musicPlaying,
            time = new Date().getTime();
        if( mp ) {
            var frame  = mp.loopLength? mp.loopLength*1000 / mp.loopTimes / mp.loopMeasure * granularity : 0;
            
            if( frame ) {
                var span = time - (mp.startTime || time),
                    frames = Math.floor(span/frame),
                    offset = span - frames * frame;

                cc.log("Waiting for next beat for "+(frame * (cnt || 1) - offset)+" ms. ("+offset+", "+frames+", "+frame+")");
                setTimeout(cb, frame * (cnt || 1) - offset);
            } else {
                cb();
            }
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
            shift = effect.shift*mp.beatLength + (effect.shift<0? mp.beatLength : 0);

        setTimeout( function() {
            setInterval(function() {
                cc.audioEngine.playEffect(effect.audio[as]);
            }, mp.beatLength);
        }, shift);
    };

    layer.playBackgroundMusic = function(mp, afterNBeats) {
        var time = new Date().getTime();

        cc.log("Playing background music of '"+mp.intro+"' and '"+mp.loop+"'.");
        if( mp.intro ) {
            mp.startTime   = new Date().getTime(); 
            cc.assert(mp.introLength && mp.introTimes && mp.introMeasure, "");
            mp.beatLength = mp.loopLength? mp.loopLength*1000 / mp.loopTimes / mp.loopMeasure : 0;
            cc.audioEngine.playMusic(mp.intro, false);
            cc.audioEngine.setMusicVolume($42.MUSIC_VOLUME);

            musicPlaying = mp;
        }

        if( mp.loop ) {
            mp.timeout = setTimeout(function() {
                mp.startTime   = new Date().getTime();
                mp.beatLength = mp.loopLength*1000 / mp.loopTimes / mp.loopMeasure;
                cc.audioEngine.playMusic(mp.loop, true);
                
            }, (mp.introLength || 0)*1000 );

            musicPlaying = mp;
        }
    };

    layer.stopBackgroundMusic = function(time) {
        var mp = musicPlaying;

        if( mp ) {
            if( time ) layer.fadeOutBackgroundMusic(time);
            else cc.audioEngine.stopMusic();
        
            if( mp.timeout ) clearTimeout(mp.timeout);
            mp.timeout = null;
            mp.startTime = null;
            musicPlaying = null;
        }
    };

    var fadeBackgroundMusic = function(time, direction, dontStop) {
        var volume = cc.audioEngine.getMusicVolume(),
            vg = $42.MUSIC_VOLUME_GRANULARITY,
            steps = Math.ceil(time / vg),
            step = volume / steps * direction;

        cc.assert(direction === -1 || direction === 1, "Fade direction must be either 1 or -1.");

        var interval = setInterval(function() {
            volume += step;
            if( direction === -1 && volume < 0 || direction === 1 && volume > $42.MUSIC_VOLUME ) {
                if( !dontStop ) cc.audioEngine.stopMusic();
                clearInterval(interval);
            } else {
                cc.audioEngine.setMusicVolume(volume);
            }
        }, $42.MUSIC_VOLUME_GRANULARITY);
    };

    layer.fadeOutBackgroundMusic = function(time, dontStop) {
        fadeBackgroundMusic(time, -1, dontStop);
    };

    layer.fadeInBackgroundMusic = function(time, dontStop) {
        fadeBackgroundMusic(time, 1, dontStop);
    }
}

