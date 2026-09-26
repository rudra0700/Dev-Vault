## includes() method

```
// includes() is both an array method and a string method.
```

Comparison Table for `includes()` Method:

| Feature               |             Array.includes()              |                    String.includes() |
| :-------------------- | :---------------------------------------: | -----------------------------------: |
| checks for            |        a complete, individual item        |   a sequence of character(substring) |
| string matching?      |    Yes `(===)`. Data types must match.    | `Yes`. It is strictly case-sensitive |
| Optional 2nd argument | `fromIndex` (where to start searching). 2 | `Position`(where to start searching) |

```js
// 1. check the number is present in the array or not
const numbers = [10, 20, 30, 40];

console.log(numbers.includes(20)); // true
console.log(numbers.includes(99)); // false
console.log(numbers.includes("20")); // false

// Note: The array method uses strict equality (===) for comparison. This means data types must match exactly; checking a number array for a string version of that number (e.g., numbers.includes("20")) will return false
```

```js
// 2. check the individual string is present in the array or not
const fruits = ["apple", "banana", "orange"];

console.log(fruits.includes("banana")); // true
console.log(fruits.includes("grape")); // false
```

```js
// 3. check if a string contains specific sequence of character
const sentence = "The quick brown fox jumps over the lazy dog.";

console.log(sentence.includes("fox")); // true
console.log(sentence.includes("Fox")); // false (because of the capital 'F')
```

```js
// 4. Searching for an number inside a string (it will work)
const priceText = "The total cost is 50 dollars.";

console.log(priceText.includes("50")); // true (50 is implicitly coerced to "50")
```

```js
// 5. Calling the method directly on a number (it will not work)
const number = 100;
console.log(number.includes(100)); // typeError

// In JavaScript, Numbers do not have an includes() method. If you attempt to call .includes() directly on a number variable, the engine will throw a TypeError
// TypeError: number.includes is not a function
```

```js
// 6.  To Fix the error you gotta convert the number into string first
const number = 100;

console.log(number.toString().includes(1)); // true
```

```js
// 7. Write a function that return "true" if the given role is "admin"

function containAdmin(role) {
  // return role.includes("admin");
  return role === "admin"; // if you need exact-value(if you need exactly admin)
}

// TEST CASE

containsAdminRole("admin"); // true
containsAdminRole("user"); // false
containsAdminRole("ADMIN"); // false
containsAdminRole("Admin"); // false
containsAdminRole("superadmin"); // false

// CONSTRAINT --->

// You must use includes() methods.
// Think carefully about case sensitivity .
// "superadmin"should not be considered the "admin"role.
// Don't use regular expressions.
```

```js
// 8. Write a function that only allowed specific extensiton name

const allowedExtensions = ["jpg", "png", "pdf", "docx"];

function isAllowedFile(fileName) {
  // this line will break if your fileName is like "my.photo.png"
  // const extractExtension = fileName.split(".")[1];

  const extractExtension = fileName.split(".").pop().toLowerCase();
  return allowedExtensions.includes(extractExtension);
}

const test = isAllowedFile("script.js");
console.log(test);

// TEST CASE

isAllowedFile("profile.jpg"); // true
isAllowedFile("resume.pdf"); // true
isAllowedFile("photo.png"); // true
isAllowedFile("script.js"); // false
isAllowedFile("myjpgfile.txt"); // false
isAllowedFile("document.pdf.exe"); // false
isAllowedFile("photo"); // false
isAllowedFile("photo."); // false
isAllowedFile(".png"); // true if your requirements only extract the extansion name not check the valid fileName and extension must have together

// CONSTRAINTS-->

// You must useincludes() .
// Don't use regex.
// Don't simply check whether the entire filename contains "jpg"or "pdf".
// Consider what part of the filename actually represents the extension.
// Your solution should work for extensions with different lengths, such as "js", "jpeg", "html", "docx".

// And if you want also fileName and allowed extension must have together, follow this approach

const allowedExtensions = ["jpg", "png", "pdf", "docx"];

function isAllowedFile(fileName) {
  const parts = fileName.split(".");
  const extension = parts.pop().toLowerCase(); // pop() returns string, not array.
  const name = parts.join("."); // join() method does not work on stand alone strings. It is strictly an array method. But it always return array as a result

  return name.length > 0 && allowedExtensions.includes(extension);
}

const test = isAllowedFile("photo");
console.log(test);
```

```js
// 9. Check permission for action in database
const userPermissions = ["read:user", "update:user", "delete:post"];

function canPerformAction(userPermissions, requiredPermission) {
  return userPermissions.includes(requiredPermission);
}

const test = canPerformAction(userPermissions, "read");
console.log(test);
```

That's a very important JavaScript distinction:

```
String.includes()
       ↓
substring exists?

Array.includes()
       ↓
exact element exists?
```

```js
const elements = ["Fire", "Air", "Water"];

// 1. Pass nothing -> returns comma-separated string
console.log(elements.join()); // "Fire,Air,Water"

// 2. Pass an empty string -> returns characters smashed together
console.log(elements.join("")); // "FireAirWater"

// 3. Pass a custom string -> returns characters separated by your string
console.log(elements.join(" - ")); // "Fire - Air - Water"
```

```js
console.log([].join("-")); // "" (Empty string)
console.log(["apple"].join("-")); // "apple"
```
