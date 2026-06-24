- **[Variables and string](#variable-and-strings)**
- **[Test writing](#test-writing)**

There are over `40` standard string methods natively available in JavaScript according to the official MDN Web Docs. 

## Extraction Method
Used to isolate, chop, or grab specific characters and pieces from a string:
- **`at(index):`** Returns the character at a given positive or negative index.

- **`charAt(index):`** Returns the character at a specific position.

- **`charCodeAt(index):`** Gives the UTF-16 code unit number of a character.

- **`codePointAt(index):`** Returns the full Unicode code point value of a character.

- **`slice(start, end):`** Cuts out a section of a string and returns it as a new string.

- **`substring(start, end):`** Similar to slice, but treats negative numbers as 0.

## Searching & Matching Methods
Used to locate where specific characters or phrases reside inside text:

- **`includes(searchString):`** Checks if a string contains a specific phrase, returning true or false.

- **`indexOf(searchString):`** Finds the starting index of the first occurrence of a phrase.

- **`lastIndexOf(searchString):`** Finds the starting index of the last occurrence of a phrase.

- **`startsWith(searchString):`** Checks if a string begins with specific characters.

- **`endsWith(searchString):`** Checks if a string finishes with specific characters.

- **`match(regex):`** Matches a regular expression against the string.

- **`matchAll(regex):`** Returns an iterator of all matches against a regular expression.

- **`search(regex):`** Searches for a match and returns the index position.

##  Modification & Formatting Methods
Used to clean up, alter, or transform the structure of text:

- **`replace(old, new):`** Replaces the first instance of a pattern with new text.

- **`replaceAll(old, new):`** Replaces every single occurrence of a pattern.

- **`toUpperCase():`** Converts all characters to uppercase.

- **`toLowerCase():`** Converts all characters to lowercase.

- **`trim():`** Strips whitespace out of both ends of a string.

- **`trimStart() / trimEnd():`** Cleans up whitespace from just the beginning or just the end.

- **`padStart(length, char) / padEnd(length, char):`** Pads the string with another character until it reaches a desired length.

- **`repeat(count):`** Multiplies and repeats the string a set number of times.

- **`concat(str1, str2...):`** Glues two or more strings together

## Conversion & Core Methods
 Used to split strings into items or evaluate their internal values:
 
 - **`split(separator):`** Tears a string apart at a specified delimiter and turns it into an Array.
 
 - **`localeCompare(compareStr):`** Compares strings for sorting based on specific language rules.
 
 - **`toString() / valueOf():`** Returns the primitive string value.
 
 - **`normalize():`** Returns the Unicode Normalization Form of the string
## What Is JavaScript, and How Does It Work with HTML and CSS?

<p>JavaScript is a powerful programming language that brings interactivity and dynamic behavior to websites.

While HTML and CSS are used to structure content and style elements on a page, JavaScript goes beyond those by enabling more complex functionality, such as handling user input, animating elements, and even building full web applications.

For example, when you click a button, submit a form, or hover over a menu, JavaScript determines how the page behaves.</p>

Here's an example of how these three work together:

#### **`index.html`**
```javascript
<!DOCTYPE html>
<html>
<head>
  <style>
    h1 {
      color: green;
    }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <button onclick="alert('Button clicked!')">Click me</button>
</body>
</html>
```
### Test writing