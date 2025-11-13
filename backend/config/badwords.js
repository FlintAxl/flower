// Custom bad words configuration
// Add your local language bad words here

const customBadWords = [
    // Filipino/Tagalog bad words
    'gago', 'putang', 'tanga', 'bobo', 'ulol', 'peste', 'leche',
    'bwisit', 'hinayupak', 'kingina', 'tangina', 'punyeta',
    'burat', 'puke', 'tarantado', 'hayop', 'animal', 'walang hiya',
    
    // Add more words from your local language here
    // 'word1', 'word2', 'word3',
    
    // You can also add variations or misspellings
    'g4go', 't4nga', 'b0bo', // leetspeak variations
    'gag0', 'tang4', 'b0b0', // number substitutions
];

// Words that might be used to bypass filters
const bypassWords = [
    // Common bypass attempts
    'g-a-g-o', 'g.a.g.o', 'g a g o',
    't-a-n-g-a', 't.a.n.g.a', 't a n g a',
];

module.exports = {
    customBadWords,
    bypassWords,
    // Combine all custom words
    getAllCustomWords: () => [...customBadWords, ...bypassWords]
};
