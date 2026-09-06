# Module
- **[Basic](./basic.md)**
### Things that covered below :

```
module.exports
require()
Name aliasing
exports
ES modules
import
export
CommonJS vs ESM
package.json
type: "module"
```

A module is just a separate JavaScript file with its own scope. Importing a module means: "give me the value that this other file decided to expose."

#### 1. module.exports :

```javascript
// to see the module(file) details
console.log(module);
```

you will likely see this :

```javascript
{
  id: '.',
  path: 'C:\\web development\\Project testing\\learn-node',
  exports: {},
  filename: 'C:\\web development\\Project testing\\learn-node\\file.js',
  loaded: false,
  children: [],
  paths: [
    'C:\\web development\\Project testing\\learn-node\\node_modules',
    'C:\\web development\\Project testing\\node_modules',
    'C:\\web development\\node_modules',
    'C:\\node_modules'
  ],
  [Symbol(kIsMainSymbol)]: true,
  [Symbol(kIsCachedByESMLoader)]: false,
  [Symbol(kIsExecuting)]: true
}
```

here module is an object and there is a property called **`exports`** which is also an object. This **`exports`** object is might replace to anything what you send from the module. Like if you send like this :

```javascript
module.exports = 10; // It means "I want this value to be available outside this module."
```

now this module object will look like below :

```javascript
{
  id: '.',
  path: 'C:\\web development\\Project testing\\learn-node',
  exports: 10,
  ...,
  ...,
  ...,
}

// if you send function, probably you can see like this :
{
  id: '.',
  path: 'C:\\web development\\Project testing\\learn-node',
  exports: [Function : add]
  ...,
  ...,
  ...,
}
```

You can also send multiple things at once using object :

```javascript
const a = 10;
const add = (a, b) => a + b;
module.exports = {
  a,
  add,
};
```

Then it will like :

```javascript
{
  id: '.',
  path: 'C:\\web development\\Project testing\\learn-node',
   exports: { a: 10, add: [Function: add] },
  ...,
  ...,
  ...,
}
```

#### 1. require()

Don't think **`require()`** imports the file. Think **`require("./math")`** asks Node's **`CommonJS module system`** to load **`math.js`** and give me whatever that module exported.

"If you want to access this data from another file , you can access like :

```javascript
// commonjs module
const data = require("/file.js");

// It will give you the result you export from another file . if you console.log(data), you will see like this :

{ a: 10, add: [Function: add] }
```

you can also destructure the object like this :

```javascript
const { a, add } = require("./file.js");
```

#### Name aliasing :

we can also do name aliasing like below :

```javascript
const { a: a2, add: add3 } = require("./file.js");
```

**`NOTE`** : When name collision is happend , aliasing is the only solution, because you cant change the built-in module variables name.

Now think about a scenario. You made a calculator and that calculator folder has more that hundred utility file. Now if you want to use like 10 utility functin from them, the code base would be like in other file :

```javascript
// This is vervose.
const { add } = require("./calculator");
const { subtract } = require("./calculator");
const { division } = require("./calculator");
const { multiple } = require("./calculator");
const { otherUtility } = require("./calculator");
const { otherUtility } = require("./calculator");
const { otherUtility } = require("./calculator");
const { otherUtility } = require("./calculator");

console.log(add);
```

instead , create a **`index.js`** file and export all the utility file there and require only necessity data from **`index.js`** file

### Why do modules exist at all?

This is the bigger architectural reason. Imagine a huge application with:

```text
server.js
database.js
auth.js
user.js
product.js
payment.js
email.js
logger.js
```

Without modules, everything could potentially pollute one giant global namespace.

Each module can have private implementation details. For example:

```javascript
// payment.js

const SECRET_KEY = "...";

function validatePayment() {
  // ...
}

function chargeCustomer() {
  // ...
}

module.exports = {
  chargeCustomer,
};
```

Another file gets:

```javascript
const { chargeCustomer } = require("./payment");
```

It doesn't need to know the internal implementation. That's one of the fundamental ideas behind modular software:

```text
Hide implementation. Expose an interface.
```

#### ES modules :

The idea is same as commonJS but with different systax.

```javascript
import
export
```

#### Export :

```javascript
// math.js
export function add(a, b) {
  return a + b;
}
```

#### Import:

```javascript
import { add } from "/math.js";
```

#### Named Export :

```javascript
// math.js

export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// Have to access like this :
import { add, subtract } from "./math.js";
```

#### Default export :

```javascript
export default function add(a, b) {
  return a + b;
}

// Can access using two of them
import add from "./math.js";
import ADD from "./math.js"; // Default export let you renaming the variable name independently
```

#### CommonJS vs ESM

You should NOT think "CommonJS is one totally different concept and ESM is another. Think are two different module systems that solve the same fundamental problem.

#### package.json :

In the physical world, a package is a box containing a finished product, complete with instructions on how to use it, what parts are inside, and who made it.

In Node.js, a package is exactly the same thing, just digital. It is a folder containing JavaScript code (like a reusable library) that someone else wrote and bundled up so you can easily drop it into your project.

The package.json file is the identity card and manifest of your application.

Instead of forcing you to manually download and track dozens of external code libraries, package.json keeps a written list of them. If you share your project with a teammate, you don't send them gigabytes of downloaded code. You just send them your tiny package.json file. They type npm install, and Node looks at the list and downloads everything automatically.

It holds critical project data, including:

- The name and version of your application.
- The dependencies (the list of external packages your project needs to run).
- Scripts (shortcuts for long terminal commads)

#### type : "module" : 

Assumed you have folder like this :

```
project/
│
├── package.json
├── app.js
└── math.js
```

Without:
```javascript
{
  "type": "module"
}
```

Node interpreters:
```
.js → CommonJS
```

So:
```
const math = require("./math");
```

With:
```javascript
{
  "type": "module"
}
```

Node interpreters:
```
.js → ESM
```

So:
```
import math from "./math.js";
```

You can also explicitly use extensions:
```
.cjs → CommonJS
.mjs → ESM
```
