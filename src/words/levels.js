$42.LEVEL_TYPE_GIVEN    = 1;
$42.LEVEL_TYPE_PREFIX   = 2;
$42.LEVEL_TYPE_FREE     = 3;
$42.LEVEL_MIN_PREFIX_CANDIDATES = 5;
$42.LEVEL_DEVS = {
    easy: [{                        // Easy Level 1
        type: $42.LEVEL_TYPE_GIVEN,
        words: 3,
        minValue:   0,        // min word value that is shown
        minDemand:  0,        // min word value that is enough for winning
        maxValue:   0,
        minLength:  4,
        maxLength:  4,
        newLetters: 1,
        prefGroups: null,
        wordFreq: 1.0
    },{                             // Level 2
        type: $42.LEVEL_TYPE_GIVEN,
        words: 3,
        minValue:   0,
        minDemand:  0,
        maxValue:   0,
        minLength:  5,
        maxLength:  5,
        newLetters: 1,
        prefGroups: null,
        wordFreq: 1.0
    },{                             // Level 3
        type: $42.LEVEL_TYPE_GIVEN,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  6,
        maxLength:  6,
        newLetters: 1,
        prefGroups: null,
        wordFreq: 1.0
    },{                             // Level 4
        type: $42.LEVEL_TYPE_GIVEN,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  6,
        maxLength:  6,
        newLetters: 1,
        prefGroups: null,
        wordFreq: 1.0
    },{                             // Level 5
        type: $42.LEVEL_TYPE_GIVEN,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  7,
        maxLength:  7,
        newLetters: 1,
        prefGroups: null,
        wordFreq: 1.0
    },{                             // Level 6
        type: $42.LEVEL_TYPE_PREFIX,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  4,
        maxLength:  4,
        newLetters: 1,
        prefGroups: null,
        wordFreq: 1.0
    },{                             // Level 7
        type: $42.LEVEL_TYPE_PREFIX,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  5,
        maxLength:  5,
        newLetters: 1,
        prefGroups: null,
        wordFreq: 1.0
    }],

    intermediate: [{                // Intermediate Level 1
        type: $42.LEVEL_TYPE_GIVEN,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  8,
        maxLength:  8,
        newLetters: 2,
        wordFreq: 1.0,
        neededLettersProb: 0.3
    },{                             // Level 2
        type: $42.LEVEL_TYPE_GIVEN,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  9,
        maxLength: 10,
        newLetters: 2,
        wordFreq: 1.3,
        fillInRate: 0.5,
        neededLettersProb: 0.25
    },{                             // Level 3
        type: $42.LEVEL_TYPE_PREFIX,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  6,
        maxLength:  0,
        newLetters: 2,
        wordFreq: 1.0,
        fillInRate: 1,
        neededLettersProb: 0.5
    },{                             // Level 4
        type: $42.LEVEL_TYPE_PREFIX,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  7,
        maxLength:  0,
        wordFreq: 1.3,
        fillInRate: 1,
        newLetters: 2,
    },{                             // Level 5
        type: $42.LEVEL_TYPE_PREFIX,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  8,
        maxLength:  0,
        wordFreq: 1.6,
        fillInRate: 1,
        newLetters: 2,
    },{                             // Level 6
        type: $42.LEVEL_TYPE_PREFIX,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  9,
        maxLength:  0,
        wordFreq: 2.0,
        fillInRate: 1,
        newLetters: 2,
    },{                             // Level 7
        type: $42.LEVEL_TYPE_PREFIX,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength: 10,
        maxLength:  0,
        wordFreq: 2.0,
        fillInRate: 1,
        newLetters: 2,
    }],
    expert: [{                             // Level 1
        type: $42.LEVEL_TYPE_FREE,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  0,
        maxLength:  0,
        newLetters: 3,
    },{                             // Level 2
        type: $42.LEVEL_TYPE_FREE,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  0,
        maxLength:  0,
        newLetters: 3,
    },{                             // Level 3
        type: $42.LEVEL_TYPE_FREE,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  0,
        maxLength:  0,
        newLetters: 3,
    },{                             // Level 4
        type: $42.LEVEL_TYPE_FREE,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  0,
        maxLength:  0,
        newLetters: 3,
    },{                             // Level 5
        type: $42.LEVEL_TYPE_FREE,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  0,
        maxLength:  0,
        newLetters: 3,
    },{                             // Level 6
        type: $42.LEVEL_TYPE_FREE,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  0,
        maxLength:  0,
        newLetters: 3,
    },{                             // Level 7
        type: $42.LEVEL_TYPE_FREE,
        words: 3,
        minValue:   0,
        minDemand:  0,
        minLength:  0,
        maxLength:  0,
        newLetters: 3,
    }],
};

