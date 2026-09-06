### 1. First: What is a file system?
- **[Basic](./basic.md)**

Things that covered below :
```
2. Why does Node.js need it fs?
3. The most important distinction
4. What does this fs.readFile()actually mean?
5. Why is it readFile() asynchronous?
6.readFile()
7. What if you don't specify "utf8"?
8. Error handling
9.writeFile()
10.appendFile()
11.unlink()
12.mkdir()
13. Absolute path vs relative path
14__dirname vs ESM
15. Why does Node have path?
16. Real-world example: saving user data
17. fs isn't only about text files
18. Async vs sync fs
19. But await doesn't make the whole Node process stop
```

Your computer has storage:

```
SSD / HDD
    ↓
Operating System
    ↓
File System
    ↓
Folders + Files
```

For example:

```
my-project/
│
├── package.json
├── server.js
├── users.json
│
└── uploads/
    ├── photo1.jpg
    └── photo2.jpg
```

The file system is the structure and rules the operating system uses to organize these files and directories. Node.js gives your program access to that system through:

```
fs
```

fs = File System

### 2. Why does Node.js need it fs?

Imagine you're building an application.You might need to:

```
read a configuration file
save uploaded files
create folders
store logs
delete temporary files
read HTML files
write JSON data
process images
stream large files
```

For example:

```
User uploads profile picture
            ↓
Express receives file
            ↓
Node.js
            ↓
fs
            ↓
uploads/profile.jpg
```

### 3. The most important distinction

There are two common ways of using fs .

**API Callback**

```javascript
import fs from "fs";
```

Example:

```javascript
fs.readFile("data.txt", "utf8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(data);
});
```

**Promise API**

```javascript
import fs from "fs/promises";
```

Example:

```javascript
const data = await fs.readFile("data.txt", "utf8");
console.log(data);
```

For modern Node.js development, you'll frequently prefer:

```javascript
fs / promises;
```

because it works naturally with:

```
async/await
```

### 4. What does this fs.readFile()actually mean?

Assumed:

```
project/
├── app.js
└── message.txt
```

message.txt contains:

```
Hello Rudra
```

You write:

```javascript
import fs from "fs/promises";
const data = await fs.readFile("./message.txt", "utf8");
console.log(data);
```

Conceptually:

```
JavaScript
   ↓
fs.readFile()
   ↓
Node.js
   ↓
Operating System
   ↓
Find message.txt
   ↓
Read bytes from storage
   ↓
Node receives bytes
   ↓
Convert bytes to UTF-8 text
   ↓
Promise resolves
   ↓
data
```

So:

```
const data = await fs.readFile(...)
```

does not mean JavaScript itself is reading the SSD. Node asks the operating system to perform the file operation.

### 5. Why is it readFile() asynchronous?

Imagine a file is huge:

```
movie.mp4
↓
5 GB
```

If Node completely blocked while waiting for storage:

```
Request A
   ↓
Read huge file
   ↓
EVERYTHING WAITS
```

That would be terrible for a server. Instead:

```
Node
 │
 ├── request A → read file
 │
 ├── request B → process
 │
 ├── request C → process
 │
 ├── request D → process
 │
 ↓
file operation finishes
 │
 ↓
Promise resolves
```

### 6.readFile()

```javascript
import fs from "fs/promises";
const data = await fs.readFile("./message.txt", "utf8");
console.log(data);
```

There are two important things here:

```javascript
"./message.txt";
// and
"utf8";
```

The first is the path .The second tells Node how to decode the bytes.

### 7. What if you don't specify "utf8"?

```javascript
const data = await fs.readFile("./message.txt");
console.log(data);
```

You might get something like:

```javascript
<Buffer 48 65 6c 6c 6f>
```

Why? Because files are ultimately stored as bytes . Node gives you a Buffer . When you say:

```
"utf8"
```

you're essentially saying:

```
"Interpret these bytes as UTF-8 text."
```

```
fs.readFile(path) -> Buffer
```

```
fs.readFile(path, "utf8") -> String
```

### 8. Error handling

File operations can fail. For example:

```javascript
import fs from "fs/promises";

try {
  const data = await fs.readFile("./message.txt", "utf8");
  console.log(data);
} catch (error) {
  console.log("Failed to read file:", error);
}
```

Possible reasons:

```
file doesn't exist
↓
permission denied
↓
invalid path
↓
directory instead of file
↓
I/O error
```

This is why:

```
try/catch
```

matters here.

### 9.writeFile()

Now suppose you want to create:

```
message.txt
```

You can do:

```javascript
import fs from "fs/promises";

await fs.writeFile("./message.txt", "Hello Node.js");
console.log("File written");
```

If the file doesn't exist:

```
message.txt
```

file will be created. And if it already exists, its contents are normally replaced . For example:

Before:

```
Hello
```

Run:

```javascript
await fs.writeFile("./message.txt", "Goodbye");
```

After:

```
Goodbye
```

So remember writeFile()is generally write/replace , not append.

### 10.appendFile()

If you want to add content to the existing file:

```javascript
await fs.appendFile("./message.txt", "\nNew line");
```

Assumed:

```
Hello
```

becomes:

```
Hello
New line
```

This is useful for things like simple logs:

```javascript
await fs.appendFile("./server.log", `Server started at ${new Date()}\n`);
```

Each execution adds another line.

### 11.unlink()

unlink() removes a file.

```javascript
await fs.unlink("./message.txt");
```

Conceptually:

```
message.txt
     ↓
   DELETE
```

Important:

```javascript
fs.unlink();
```

is for files only. It isn't your general "delete anything" function.

### 12.mkdir()

mkdir= make directory

```javascript
await fs.mkdir("./uploads");
```

Creates:

```
project/
└── uploads/
```

You can also create nested directories.

```javascript
await fs.mkdir("./uploads/images", {
  recursive: true,
});
```

This is useful because:

```
uploads/
└── images/
```

can be created even if uploads doesn't already exist.

### 13. Absolute path vs relative path

An absolute path gives the complete address of a file from the root directory. A relative path gives the location based on your current working folder. Absolute paths work anywhere, while relative paths change depending on where you stan

### 16.process.cwd()

You can see Node's current working directory:

```javascript
console.log(process.cwd());
```

For example:

```
C:\Projects\my-app
```

### 14\_\_dirname vs ESM

If you're using CommonJS:

```javascript
console.log(__dirname);
```

gives the directory of the current module. But if you're using modern ES modules:

```javascript
import ...
```

**`__dirname`** is not directly available. You can create an equivalent using:

```javascript
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

The important conceptual distinction is:

```
process.cwd()
      ↓
where Node was launched from

__dirname
      ↓
where the current module/file exists
```

These are not necessarily the same location .

### 15. Why does Node have path?

Because manually building paths is dangerous and platform-dependent.
For example:

Windows:

```
C:\Users\Rudra\project\data.txt
```

Linux/macOS:

```
/home/rudra/project/data.txt
```

Node provides:

```javascript
import path from "path";
```

Then:

```javascript
const filePath = path.join("uploads", "images", "photo.jpg");

console.log(filePath);
```

Node creates the appropriate path for the operating system. So a good mental model is:

```
fs
 ↓
actually perform file operation

path
 ↓
help construct/manage file paths
```

They work together constantly.

### 16. Real-world example: saving user data

Imagine a simple backend. A user submits:

```javascript
{
    "name": "Rudra",
    "age": 28
}
```

You could theoretically save it to:

```
data/users.json
```

Something like:

```javascript
import fs from "fs/promises";

const user = {
  name: "Rudra",
  age: 28,
};

await fs.writeFile("./data/user.json", JSON.stringify(user, null, 2));
```

Now:

```
data/
└── user.json
```

contains JSON. Notice the pipeline:

```
JavaScript object
      ↓
JSON.stringify()
      ↓
String
      ↓
fs.writeFile()
      ↓
File
```

```
When reading:

File
 ↓
fs.readFile()
 ↓
String
 ↓
JSON.parse()
 ↓
JavaScript object
```

### 17. fs isn't only about text files

This is another important misconception. A file can be:

```
.txt
.json
.html
.jpg
.png
.pdf
.mp4
.zip
.exe
```

At the storage level, they're all ultimately bytes .For example:

```javascript
const data = await fs.readFile("./photo.jpg");
console.log(data);
```

You get a:

```
Buffer
```

You generally do not do:

```javascript
await fs.readFile("./photo.jpg", "utf8");
```

because an image isn't UTF-8 text

### 18. Async vs sync fs

Node also has synchronous methods:

```javascript
fs.readFileSync();
fs.writeFileSync();
```

Example:

```javascript
import fs from "fs";
const data = fs.readFileSync("./data.txt", "utf8");
console.log(data);
```

This blocks other code execution. Conceptually:

```
Node
 ↓
read file
 ↓
WAIT
 ↓
file finished
 ↓
continue
```

Whereas:

```javascript
await fs.readFile(...)
```

fits into Node's asynchronous model. For server-side application code, you should generally favor the async Promise APIs.

### 19. But await doesn't make the whole Node process stop

Consider:

```javascript
async function loadData() {
  const data = await fs.readFile("./data.txt", "utf8");

  console.log(data);
}
```

await means stop this async function pauses until the operation completes. It doesn't mean:

```
STOP NODE
STOP ALL REQUESTS
STOP EVENT LOOP
```

Instead, Node can continue doing other work while the file operation is pending.

## Practice code snippet

Create:

```
fs-practice/
│
└── app.js
```

Install nothing.

Put this in app.js:

```javascript
import fs from "fs/promises";

async function main() {
  try {
    // 1. Create directory
    await fs.mkdir("./data", {
      recursive: true,
    });

    // 2. Create/write file
    await fs.writeFile("./data/message.txt", "Hello Node.js");

    // 3. Read file
    const data = await fs.readFile("./data/message.txt", "utf8");

    console.log("Initial content:");
    console.log(data);

    // 4. Append
    await fs.appendFile("./data/message.txt", "\nLearning File System");

    // 5. Read again
    const updatedData = await fs.readFile("./data/message.txt", "utf8");

    console.log("\nUpdated content:");
    console.log(updatedData);
  } catch (error) {
    console.error(error);
  }
}

main();
```

Run:

```javascript
node app.js
```

You should end up with:

```
fs-practice/
│
├── app.js
│
└── data/
    └── message.txt
```

And:

```
Hello Node.js
Learning File System
```

### Mental model

Don't memorize:

```
readFile
writeFile
appendFile
unlink
mkdir
```

as isolated functions. Think in terms of file-system operations :

```

                FILE SYSTEM
                     │
        ┌────────────┼────────────┐
        │            │            │
      FILE        DIRECTORY      PATH
        │            │            │
   ┌────┼────┐       │       ┌────┼────┐
   │    │    │       │       │    │    │
 read write delete  create   join resolve ...
   │    │    │       │
   ↓    ↓    ↓       ↓
readFile writeFile unlink mkdir
```

Then the Promise version gives you:

```
fs/promises
      ↓
Promise
      ↓
async/await
      ↓
try/catch
```

When you write:

```javascript
const data = await fs.readFile("./users.json", "utf8");
```

You should mentally see:

```
Your async function
       │
       │ calls
       ▼
fs.readFile()
       │
       │ asks Node to perform I/O
       ▼
Operating System
       │
       │ reads file
       ▼
File system / storage
       │
       │ result
       ▼
Node receives data
       │
       ▼
Promise settles
       │
       ▼
await resumes your async function
       │
       ▼
data
```
