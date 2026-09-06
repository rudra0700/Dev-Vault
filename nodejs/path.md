### What is exactly a path?

- **[Basic](./basic.md)**

Things that we will cover :

```
2. The BIG mental model
3. path.join()
4. join() also normalizes paths
5. path.resolve()
6. join()vs resolve()— understand this deeply
7. \_\_dirname + path.join() - common Node pattern
8. But modern Node ESM has a twist
10.path.dirname()
11.path.extname()
12. path.parse()— you should definitely learn this
13. path.format() — learn it alongside parse()
15.path.isAbsolute()
17.path.sep
20. One HUGE distinction: filesystem paths vs URLs
21. Real industry example: file uploads
```

A filesystem might look like:

```
my-app/
│
├── src/
│   ├── controllers/
│   ├── models/
│   └── routes/
│
├── uploads/
│   ├── images/
│   └── videos/
│
└── package.json
```

A path tells the operating system where something is located . It does not access files. pathcreates/manipulates the string representing the path .

For example:

```
uploads/images/cat.png
```

or on Windows:

```
uploads\images\cat.png
```

The problem is that operating systems can represent paths differently. That's one reason Node gives you:

```javascript
import path from "path";
```

### 2. The BIG mental model

There are basically three things you need to distinguish:

**A. Path string**

```javascript
"uploads/images/cat.png"; // Just a string.
```

**B. Path manipulation**

```javascript
path.join("uploads", "images", "cat.png"); // Node calculates a proper path string.
```

**C. Filesystem operation**

```javascript
// This actually interacts with the filesystem.
fs.readFile(...)
fs.writeFile(...)
fs.mkdir(...)
```

```
path
 ↓
construct / analyze path
 ↓
filesystem API
 ↓
actually access file
```

For example:

```javascript
const filePath = path.join("uploads", "images", "cat.png");
await fs.readFile(filePath);
```

```
path determines where and fs actually does something there .
```

### 3. path.join()

```javascript
path.join("uploads", "images", "cat.png");
```

Result:

```
uploads/images/cat.png
```

The major benefit is that **`join()`** intelligently combines path segments. Instead of:

```javascript
"uploads/" + "images/" + "cat.png";
```

you can do:

```javascript
path.join("uploads", "images", "cat.png");
```

But there's a deeper reason. Consider:

```javascript
const folder = "uploads/";
const filename = "/cat.png";
const result = folder + filename;
```

You may accidentally get:

```
uploads//cat.png
```

With:

```javascript
path.join(folder, filename); // you will get exact path
```

Node normalizes the separators.

### 4. join() also normalizes paths

```javascript
path.join("uploads", "images", "..", "cat.png");
```

**`..`** means : **`Go to the parent directory.`**

So:

```javascript
uploads/images/../cat.png
```

becomes:

```javascript
uploads / cat.png;
```

Similarly:

```javascript
path.join("a", "b", ".", "c");
```

becomes:

```
a/b/c
```

**`.`** means : **`current directory`**

So **`join()`** isn't simply concatenation. It's combine path segments + normalize the resulting path

### 5. path.resolve()

This is where beginners often get confused.

```javascript
path.resolve("uploads", "images", "cat.png");
```

Unlike **`join(),`** **`resolve()`** produces an absolute path. For example, if your current working directory is:

```
/home/rudra/my-app
```

then:

```javascript
path.resolve("uploads", "images", "cat.png");
```

might produce:

```
/home/rudra/my-app/uploads/images/cat.png
```

On windows it might look like:

```
C:\Users\Rudra\my-app\uploads\images\cat.png
```

So the mental model:

```
join()
    relative → usually stays relative
    absolute → can remain/produce absolute depending on inputs

resolve()
    → produces an absolute path
```

### 6. join()vs resolve()— understand this deeply

```javascript
path.join("a", "b", "c");
```

Result:

```
a/b/c
```

However

```
path.resolve("a", "b", "c");
```

Produce:

```
/current/working/directory/a/b/c
```

Why? Because **`resolve()`** asks:

```
"Starting from the current working directory, where exactly is this?"
```

Whereas **`join()`** asks:

```
“How should I combine these path pieces?”
```

### 7. \_\_dirname + path.join() - common Node pattern

In CommonJS Node:

```javascript
console.log(__dirname);
```

might give:

```
C:\projects\my-app\src
```

Then:

```javascript
const filePath = path.join(__dirname, "uploads", "avatar.png");
```

gives:

```
C:\projects\my-app\src\uploads\avatar.png
```

This pattern appears everywhere. For example:

```javascript
fs.readFile(path.join(__dirname, "data", "users.json"));
```

You're basically saying:

```
Start from this module's directory, then go to data/users.json.
```

### 8. But modern Node ESM has a twist

If you're using:

```
import ...
```

you may not automatically have:

```
__dirname
```

available. Instead you commonly see:

```javascript
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

Now:

```javascript
const filePath = path.join(__dirname, "data", "users.json");
```

This is important because you're working with modern Node/ES modules.

### 9. path.basename()

This extracts the last part of a path.

```javascript
const filePath = "/uploads/images/cat.png";
console.log(path.basename(filePath));
```

Result:

```
cat.png
```

Think:

```
/uploads/images/cat.png
                  ↑
               basename
```

Very useful with uploaded files.

### 10. path.dirname()

Opposite idea.

```javascript
const filePath = "/uploads/images/cat.png";
console.log(path.dirname(filePath));
```

Result:

```javascript
/uploads/images
```

Think:

```
/uploads/images/cat.png
^^^^^^^^^^^^^^^^
     dirname
```

This becomes useful when you need the directory containing a file.

### 11. path.extname()

Gets the file extension.

```javascript
path.extname("cat.png");
```

Result:

```
.png
```

Examples:

```javascript
path.extname("video.mp4");
// ".mp4"

path.extname("document.pdf");
// ".pdf"

path.extname("image.jpeg");
// ".jpeg"
```

This is useful for things like:

```
file processing
upload validation
deciding how to handle files
generating output filenames
```

### 12. path.parse()— you should definitely learn this

```javascript
const result = path.parse("/uploads/images/cat.png");
console.log(result);
```

Conceptually:

```javascript
{
  root: "/",
  dir: "/uploads/images",
  base: "cat.png",
  ext: ".png",
  name: "cat"
}
```

This is basically:

```
Break a path into its components.
```

And this is extremely useful because you don't have to manually extract everything.

### 13. path.format() — learn it alongside parse()

**`parse():`**

```
path
 ↓
parts
```

**`format():`**

```
parts
 ↓
path
```

For example:

```javascript
const filePath = path.format({
  dir: "/uploads/images",
  name: "cat",
  ext: ".png",
});
console.log(filePath);
```

Result:

```
/uploads/images/cat.png
```

So:

```
parse()   → path → object
format()  → object → path
```

You don't need to use format()every day, but you should understand it.

### 15.path.isAbsolute()

It Checks whether a path is absolute.

```javascript
path.isAbsolute("/home/user/file.txt");
// true
```

While:

```javascript
path.isAbsolute("uploads/file.txt");
// false
```

On Windows:

```
path.isAbsolute("C:\\Users\\Rudra\\file.txt");
// true
```

Useful when your code can receive either relative or absolute paths.

### 17.path.sep

This tells you the platform's path separator.

On Linux/macOS:

```
path.sep
```

is:

```
/
```

On Windows:

```
\

```

So:

```javascript
console.log(path.sep);
```

can differ depending on OS. This is another reason blindly doing:

```
"folder/" + filename
```

isn't ideal for filesystem paths.

### 20. One HUGE distinction: filesystem paths vs URLs

This is important when working with modern Node. A filesystem path:

```
C:\projects\app\file.txt
```

is not the same concept as a URL:

```
file:///C:/projects/app/file.txt
```

Node also has:

```
URL
```

and:

```
fileURLToPath()
pathToFileURL()
```

For example:

```javascript
import { fileURLToPath } from "url";
const filename = fileURLToPath(import.meta.url);
```

This converts a file URL into a file system path.

### 21. Real industry example: file uploads

Assume your backend receives:

```
avatar.png
```

You want:

```
project/
└── uploads/
    └── avatar.png
```

You could construct:

```javascript
const filePath = path.join(process.cwd(), "uploads", "avatar.png");
```

Then pass that to file system code:

```javascript
await fs.writeFile(filePath, buffer);
```

Notice the separation:

```
path.join()
      ↓
construct location
      ↓
fs.writeFile()
      ↓
actually write file
```

## Practice set

```
path-playground/
│
├── app.js
├── data/
│   └── users.json
├── uploads/
│   ├── images/
│   │   └── cat.png
│   └── videos/
│       └── intro.mp4
└── src/
    └── utils/
        └── file.js
```

Then practice questions like:

```
1. What is the absolute path of users.json?

2. What is the filename of cat.png?

3. What directory contains cat.png?

4. What is the extension of intro.mp4?

5. Go from uploads/images to uploads/videos.

6. Build a path without manually writing "/" or "\".

7. Determine whether a path is absolute.

8. Convert a path into its components.

9. Reconstruct a path from components.

10. Understand the difference between cwd and __dirname.
```
