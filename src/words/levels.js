$42.LEVEL_TYPE_GIVEN    = 1;
$42.LEVEL_TYPE_PREFIX   = 2;
$42.LEVEL_TYPE_FREE     = 3;
$42.LEVEL_MIN_PREFIX_CANDIDATES = 5;
$42.LEVEL_DEVS = [{             // Level 1
    type: $42.LEVEL_TYPE_GIVEN,
    words: 3,
    minValue:   0,        // min word value that is shown
    minDemand:  0,        // min word value that is enough for winning
    maxValue:   0,
    minLength:  4,
    maxLength:  5,
    newLetters: 0,
    prefGroups: [8],
    wordFreq: 1.0
},{                             // Level 2
    type: $42.LEVEL_TYPE_GIVEN,
    words: 3,
    minValue:   0,
    minDemand:  0,
    maxValue:   0,
    minLength:  5,
    maxLength:  6,
    newLetters: 0,
    prefGroups: [8],
    wordFreq: 1.2
},{                             // Level 3
    type: $42.LEVEL_TYPE_GIVEN,
    words: 3,
    minValue:   0,
    minDemand:  0,
    minLength:  6,
    maxLength:  8,
    newLetters: 1,
    prefGroups: [8],
    wordFreq: 1.4
},{                             // Level 4
    type: $42.LEVEL_TYPE_PREFIX,
    words: 3,
    minValue:   0,
    minDemand:  0,
    minLength:  5,
    maxLength:  0,
    newLetters: 1,
    wordFreq: 1.0,
    fillInRate: 0.3,
    neededLettersProb: 0.4
},{                             // Level 5
    type: $42.LEVEL_TYPE_PREFIX,
    words: 3,
    minValue:   0,
    minDemand:  0,
    minLength:  6,
    maxLength:  7,
    newLetters: 1,
    wordFreq: 1.3,
    fillInRate: 0.5,
    neededLettersProb: 0.3
},{                             // Level 6
    type: $42.LEVEL_TYPE_PREFIX,
    words: 3,
    minValue:   10,
    minDemand:  10,
    minLength:  0,
    maxLength:  0,
    newLetters: 2,
    wordFreq: 1.6,
    fillInRate: 0.8,
    neededLettersProb: 0.25
},{                             // Level 7
    type: $42.LEVEL_TYPE_FREE,
    words: 3,
    minValue:   0,
    minDemand:  0,
    minLength:  4,
    maxLength:  0,
    newLetters: 2,
    neededLettersProb: 0.5
},{                             // Level 8
    type: $42.LEVEL_TYPE_FREE,
    words: 3,
    minValue:   0,
    minDemand:  0,
    minLength:  6,
    maxLength:  0,
    newLetters: 2,
},{                             // Level 9
    type: $42.LEVEL_TYPE_FREE,
    words: 3,
    minValue:   0,
    minDemand:  0,
    minLength:  8,
    maxLength:  0,
    newLetters: 2,
},{                             // Level 10
    type: $42.LEVEL_TYPE_FREE,
    words: 3,
    minValue:   10,
    minDemand:  10,
    minLength:  8,
    maxLength:  0,
    newLetters: 2,
},{                             // Level 11
    type: $42.LEVEL_TYPE_FREE,
    words: 3,
    minValue:   14,
    minDemand:  14,
    minLength:  8,
    maxLength:  0,
    newLetters: 2,
},{                             // Level 12
    type: $42.LEVEL_TYPE_FREE,
    words: 4,
    minValue:   18,
    minDemand:  18,
    minLength:  8,
    maxLength:  0,
    newLetters: 2,
},{                             // Level 13
    type: $42.LEVEL_TYPE_FREE,
    words: 4,
    minValue:   21,
    minDemand:  21,
    minLength:  0,
    maxLength:  0,
    newLetters: 2,
},{                             // Level 14
    type: $42.LEVEL_TYPE_FREE,
    words: 1,
    minValue:   14,
    minDemand:  42,
    minLength:  0,
    maxLength:  0,
}];

