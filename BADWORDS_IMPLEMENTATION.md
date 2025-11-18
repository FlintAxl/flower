# Bad Words Filter Implementation

This document explains how the profanity/bad words filtering system is implemented in this application.

## Overview

The application uses a **bad words filter** to automatically detect and sanitize inappropriate language in user-generated content, specifically in **product reviews**. The system uses the `bad-words` npm package combined with custom word lists for local language support.

---

## Library Used

**Package:** `bad-words` (version 3.0.4)  
**Repository:** https://github.com/web-mech/badwords  
**License:** MIT

The `bad-words` library provides:
- Pre-built English profanity filter
- Ability to add custom words
- Text cleaning functionality (replaces bad words with asterisks)
- Case-insensitive matching
- Word boundary detection

---

## How It Works

### 1. **Initialization**

The filter is initialized in `backend/controllers/product.js`:

```javascript
const Filter = require('bad-words');
const { getAllCustomWords } = require('../config/badwords');

// Initialize bad words filter
const filter = new Filter();

// Add custom bad words from configuration file
const customWords = getAllCustomWords();
filter.addWords(...customWords);
```

### 2. **Filtering Process**

The `filterBadWords()` helper function processes text:

```javascript
const filterBadWords = (text) => {
    try {
        // Clean the text and replace bad words with asterisks
        const cleanedText = filter.clean(text);
        
        // Log if bad words were found (for monitoring purposes)
        if (cleanedText !== text) {
            console.log('Bad words filtered from review comment');
        }
        
        return cleanedText;
    } catch (error) {
        console.error('Error filtering bad words:', error);
        return text; // Return original text if filtering fails
    }
};
```

### 3. **How Words Are Detected**

The `bad-words` library:
- **Does NOT hash** words - it uses pattern matching
- Performs **case-insensitive** matching
- Detects words at **word boundaries** (not within other words)
- Replaces detected words with asterisks (`****`)

**Example:**
- Input: `"This product is gago!"`
- Output: `"This product is ****!"`

### 4. **Custom Word Lists**

Custom words are stored in `backend/config/badwords.js`:

```javascript
const customBadWords = [
    // Filipino/Tagalog bad words
    'gago', 'putang', 'tanga', 'bobo', 'ulol', 'peste', 'leche',
    'bwisit', 'hinayupak', 'kingina', 'tangina', 'punyeta',
    'burat', 'puke', 'tarantado', 'hayop', 'animal', 'walang hiya',
    
    // Leetspeak variations (to catch bypass attempts)
    'g4go', 't4nga', 'b0bo', 'gag0', 'tang4', 'b0b0',
];

const bypassWords = [
    // Common bypass attempts with separators
    'g-a-g-o', 'g.a.g.o', 'g a g o',
    't-a-n-g-a', 't.a.n.g.a', 't a n g a',
];
```

---

## Where It's Used

The bad words filter is currently applied to:

### 1. **Product Reviews - Creating Reviews**
**File:** `backend/controllers/product.js`  
**Function:** `createProductReview`

```javascript
// Filter bad words from comment
const filteredComment = filterBadWords(comment);

const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment: filteredComment,  // Filtered comment is saved
    createdAt: new Date()
};
```

### 2. **Product Reviews - Updating Reviews**
**File:** `backend/controllers/product.js`  
**Function:** `updateProductReview`

```javascript
// Filter bad words from comment
const filteredComment = filterBadWords(comment);

// Update the existing review
product.reviews[reviewIndex].comment = filteredComment;
```

---

## How to Add Custom Bad Words

### Step 1: Edit the Configuration File

Open `backend/config/badwords.js` and add words to the appropriate array:

```javascript
const customBadWords = [
    // Existing words...
    'gago', 'putang', 'tanga',
    
    // Add your new words here
    'your-bad-word-1',
    'your-bad-word-2',
    'your-bad-word-3',
];

const bypassWords = [
    // Existing bypass attempts...
    
    // Add bypass variations here
    'y-o-u-r-w-o-r-d',  // With dashes
    'y.o.u.r.w.o.r.d',  // With dots
    'y o u r w o r d',  // With spaces
];
```

### Step 2: Include Variations

To catch bypass attempts, add variations:

```javascript
// Original word
'badword',

// Leetspeak variations (numbers/letters)
'b4dw0rd', 'b4dword', 'badw0rd',

// Separator variations
'b-a-d-w-o-r-d',  // Dashes
'b.a.d.w.o.r.d',  // Dots
'b a d w o r d',  // Spaces

// Case variations (usually handled automatically, but you can add if needed)
'BadWord', 'BADWORD', 'bAdWoRd',
```

### Step 3: Restart the Server

After adding words, restart your backend server:

```bash
# If using nodemon (development)
npm run dev

# Or restart manually
npm start
```

The server will log on startup:
```
Loaded X custom bad words from local language
```

---

## Testing the Filter

### Method 1: Using the Test Endpoint

There's a test endpoint available (if enabled in routes):

```javascript
// POST /api/v1/product/test-badword-filter
{
    "text": "This product is gago and tanga!"
}

// Response:
{
    "success": true,
    "originalText": "This product is gago and tanga!",
    "filteredText": "This product is **** and ****!",
    "wasFiltered": true
}
```

### Method 2: Manual Testing

1. Create or update a product review with bad words
2. Check the saved review - bad words should be replaced with asterisks
3. Check server logs for: `"Bad words filtered from review comment"`

### Method 3: Direct Function Testing

You can test the filter function directly in Node.js:

```javascript
const Filter = require('bad-words');
const { getAllCustomWords } = require('./config/badwords');

const filter = new Filter();
filter.addWords(...getAllCustomWords());

const testText = "This is a test with gago and tanga words";
const cleaned = filter.clean(testText);

console.log('Original:', testText);
console.log('Cleaned:', cleaned);
// Output: "This is a test with **** and **** words"
```

---

## Important Notes

### ⚠️ **Words Are NOT Hashed**

The system does **NOT** hash bad words. Instead:
- Words are stored in **plain text** in the configuration file
- The filter uses **pattern matching** to detect words
- Detected words are **replaced with asterisks** (`****`)

### 🔒 **Security Considerations**

1. **Server-Side Only**: Filtering happens on the backend, not the frontend
2. **Not Perfect**: Some bypass attempts may still work (e.g., Unicode characters, misspellings)
3. **No Encryption**: The word list is stored in plain text (acceptable for this use case)
4. **Logging**: Bad word detection is logged for monitoring

### 📝 **Limitations**

- **Word Boundaries**: The filter only matches complete words
  - ✅ Matches: `"This is gago"` → `"This is ****"`
  - ❌ Won't match: `"gagometer"` (word within another word)

- **Case Insensitive**: Automatically handles case variations
  - `"GAGO"`, `"gago"`, `"Gago"` all match

- **Separators**: Some separator bypasses may not be caught
  - Consider adding common variations to `bypassWords` array

### 🎯 **Best Practices**

1. **Regular Updates**: Periodically review and update the word list
2. **Monitor Logs**: Check server logs for filtered content
3. **User Feedback**: Allow users to report inappropriate content
4. **Multiple Layers**: Combine with other moderation tools if needed

---

## File Structure

```
backend/
├── config/
│   └── badwords.js          # Custom word lists configuration
├── controllers/
│   └── product.js          # Filter implementation and usage
└── package.json            # Dependencies (bad-words library)
```

---

## Example Usage Flow

1. **User submits review:**
   ```javascript
   {
       rating: 5,
       comment: "This product is amazing! But the seller is gago."
   }
   ```

2. **Backend processes:**
   ```javascript
   const filteredComment = filterBadWords(comment);
   // filteredComment = "This product is amazing! But the seller is ****."
   ```

3. **Review saved:**
   ```javascript
   {
       rating: 5,
       comment: "This product is amazing! But the seller is ****."
   }
   ```

4. **User sees:**
   - The filtered version with asterisks
   - No indication that filtering occurred (seamless)

---

## Troubleshooting

### Words Not Being Filtered

1. **Check spelling**: Ensure words in config match exactly (case doesn't matter)
2. **Check word boundaries**: The word must be a complete word, not part of another
3. **Restart server**: Changes require server restart
4. **Check logs**: Look for the initialization message on server start

### Too Many Words Filtered

1. **Remove words**: Edit `badwords.js` and remove false positives
2. **Use `removeWords()`**: The Filter class has a `removeWords()` method to remove default English words if needed

### Performance Issues

- The filter is lightweight and shouldn't cause performance issues
- If filtering many reviews at once, consider batch processing

---

## Future Enhancements

Potential improvements:
- [ ] Add admin interface to manage word lists
- [ ] Implement machine learning for better detection
- [ ] Add support for multiple languages
- [ ] Create word list import/export functionality
- [ ] Add regex patterns for complex bypass attempts
- [ ] Implement word list versioning

---

## References

- **bad-words library**: https://github.com/web-mech/badwords
- **npm package**: https://www.npmjs.com/package/bad-words
- **Documentation**: Check the library's GitHub for advanced features

---

## Summary

- ✅ **Library**: `bad-words` npm package
- ✅ **Storage**: Plain text in `backend/config/badwords.js`
- ✅ **Method**: Pattern matching (NOT hashing)
- ✅ **Replacement**: Bad words → `****` (asterisks)
- ✅ **Usage**: Product review comments
- ✅ **Customizable**: Easy to add local language words
- ✅ **Server-side**: Filtering happens on backend only

