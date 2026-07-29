Chome devtool is unavoidable tools for a developer. Look at it very carefully.

Turn on the devtools using shortcut : **`ctrl + shift + i`**

#### And this is all of only console tab:

```javascript
console.log(document);
console.log("john doe");
console.group("group1");
console.groupEnd("group1");
console.time("finishedForLoop");
console.timeEnd("finishedForLoop");
console.error("finishedForLoop");
console.warning("finishedForLoop");
//assert is helpful for debugging without any testing tool.
console.assert(a > b, {message: "A is not greater than B"}, {a: a, b : b});
console.table();
console.dir();
```

### Source Tab

If something is coming via http request from server, server automatically set its necessary file and folder into source tab inside chrome devtools. You can also drag and drop your own file and folder and edit them without any code editor. 
