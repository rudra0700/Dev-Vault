# Things that covered below :
- **[Basic](./basic.md)**
```
Call stack
Why is it call stack
Synchronus execution
Asynchronus execution
Callback
Callback does not mean automatically asynchronus
Event loop
Task/Microtask
Microtask vs Macrotask
Timers
I/O callbacks
```
### 1. Call Stack

The call stack is where JavaScript keeps track of functions that are currently executing.

```javascript
function one() {
  console.log("one");
}

function two() {
  console.log("two");
}
one();
two();
```

Initially call stack remain **`empty`**. Then:

```
one();
```

JavaScript puts **`one()`** onto the stack:

```javascript
┌───────────────┐
│ one() │ ← executing
└───────────────┘
// console.log("one")executes.
```

Then one() finishes:

```
┌───────────────┐
│ empty │
└───────────────┘
```

Then:

two();

```
┌───────────────┐
│ two() │ ← executing
└───────────────┘
```

Then it finishes.

### 2. Why is it called a "stack"?

**LIFO — Last In, First Out**

```javascript
function a() {
  b();
}

function b() {
  c();
}

function c() {
  console.log("hello");
}

a();
```

```
Execution:

a()
 ↓
b()
 ↓
c()
```

Stack becomes:

```
┌───────────────┐
│     c()       │ ← top
├───────────────┤
│     b()       │
├───────────────┤
│     a()       │
└───────────────┘
```

### 2. Synchronous execution

If JavaScript is doing normal synchronous work:

```javascript
console.log("A");
console.log("B");
console.log("C");
```

There is no waiting.

```
A
↓
B
↓
C
```

The call stack handles them one after another. The important rule:

**`JavaScript executes one piece of JavaScript at a time on the main JavaScript thread`**.

So this:

```javascript
console.log("A");

someVeryLongFunction();

console.log("B");
```

means:

```
A
 ↓
long function
 ↓
B
```

B cannot execute until the long function leaves the stack. This is why a blocking operation can make Node appear "frozen."

### 3. Then what is an asynchronous operation?

```javascript
console.log("A");

setTimeout(() => {
  console.log("B");
}, 2000);

console.log("C");
```

Execution will be :

```
A
C
B
```

Why?

Because the timer operation doesn't simply sit on the call stack for two seconds. The JavaScript code registers an asynchronous operation .

```
JavaScript
    │
    │ setTimeout(...)
    ▼
Node.js timer system
    │
    │ wait
    │
    ▼
timer expires
    │
    ▼
callback becomes eligible
    │
    ▼
event loop
    │
    ▼
call stack
```

Meanwhile JavaScript is free to continue.

### 4. Callback

A callback is simply a function that is given to another piece of code so that it can be called later.

```javascript
setTimeout(() => {
  console.log("Hello");
}, 2000);
```

below function is a callback function :

```javascript
() => {
  console.log("Hello");
};
```

### 5. Callback does NOT automatically mean asynchronous

```javascript
function execute(callback) {
  callback();
}

execute(() => {
  console.log("Hello");
});
```

This callback is synchronous.

```
execute()
   │
   ▼
callback()
   │
   ▼
console.log()
```

But this is asynchronus because Node's timer mechanism determines when the callback can run.

```javascript
setTimeout(() => {
  console.log("Hello");
}, 1000);
```

Callback and asynchronous are two different concepts. A callback can be synchronous or asynchronous.

### 6. Event Loop

Imagine the JavaScript stack becomes empty:

```
CALL STACK

┌───────────────┐
│    empty      │
└───────────────┘
```

But asynchronous work may have completed. For example:

```javascript
setTimeout(() => {
  console.log("Hello");
}, 1000);
```

After the timer expires, Node needs to determine , "When can I execute this callback?" That's where the event loop comes in. Very simplified:

```
               ┌───────────────┐
               │   CALL STACK  │
               └───────┬───────┘
                       │
                       ▼
                 EVENT LOOP
                       │
                       ▼
              ready callbacks?
                       │
                       ▼
                put callback
                onto stack
```

The event loop repeatedly coordinates between:

```
JavaScript execution +
Node's asynchronous systems +
callbacks waiting to execute
```

### 7. Tasks / Macrotasks

Some asynchronous callbacks are handled as tasks (often informally called macrotasks ).

In Node include work associated with:

```
timers
I/O callbacks
certain event-loop phases
```

For example:

```
setTimeout(() => {
  console.log("timer");
}, 0);
```

Even though you wrote:

```javascript
0;
```

it does not mean "Run immediately. It means approximately , "Do not run this callback before this minimum timer threshold; once eligible, Node can schedule it."

### 9. Macrotask vs Microtask
To differentiate easily, think of Macrotasks as completely new, independent operations scheduled by the environment, while Microtasks are urgent, minor cleanups or immediate continuations of the script you are currently running.

The rules of the event loop dictate that all microtasks must be completely cleared before the browser or Node.js is allowed to move on to the next single macrotask.

**The Microtask Queue (High Priority)**

Callbacks here execute immediately after the currently running synchronous code finishes, cutting in line ahead of any waiting macrotasks.Only one task runs per loop iteration. A recursive microtask will freeze your application/page.

- **`Promise.then() / .catch() / .finally()`** – The standard way microtasks are generated.

- await **`(Async/Await)`** – Anything written after an await statement is implicitly wrapped inside a Promise .then() microtask.

- **`queueMicrotask(() => {})`** – An explicit API built into modern browsers and Node.js to manually throw a vanilla function directly into the microtask queue.

- **`MutationObserver`** – Browser API used to look for changes in the DOM tree (e.g., modifying an element's class).

- **`process.nextTick() (Node.js Specific)`** – Node's own internal ultra-high priority queue. It actually executes even faster than standard Promise microtasks, running at the immediate end of the current phase of the event loop.

**The Macrotask Queue (Standard Priority)**

The event loop executes exactly one macrotask from this queue, pauses to check and clear the entire microtask queue, handles UI updates/rendering, and then proceeds to the next macrotask.

- **`setTimeout(() => {}, delay) / setInterval()`** – Timer-based events.

- **`setImmediate(() => {}) (Node.js Specific)`** – Explicitly schedules a callback to run during the check phase of Node's loop, right after I/O events.

- **`UI Events / User Interactions`** – Browser events triggered by user actions, such as click, scroll, mousemove, or text inputs.

- **`Network Events (Old-school)`** – Legacy asynchronous network callbacks like XMLHttpRequest.onload or WebSocket event listeners.

- **`File and Hardware I/O`** – System-level operations, such as Node's fs.readFile() or fs.writeFile().

- **`MessageChannel / postMessage()`** – Used for cross-window or Web Worker communication.


 fetch itself is a macrotask is misinformed! Because fetch is built entirely on Promises under the hood, its callbacks (.then, .catch, or the code following an await) are handled strictly inside the microtask queue.
 
 However, the confusion usually happens because people mix up the JavaScript engine's Event Loop with the Browser's background networking.
 
 To clarify why people get confused, the entire lifecycle of a fetch request can be broken down into three stages:
 
  **1. The Call (Synchronous)**: 

 When you call fetch('https://example.com'), it runs synchronously on the main Call Stack. Its only job here is to initialize the request and immediately return a Promise in a pending state. It then pops off the stack.
 
 **2. The Network Request (Browser Web API)**
 
 The actual downloading of data does not happen in JavaScript. JavaScript is single-threaded, so it hands the network I/O over to the Browser's Web API (the browser's C++ network thread). This background network downloading is not a macrotask or a microtask—it runs entirely outside the JavaScript event loop engine.
 
 **3. The Response Resolution (Microtask Queue)**
 
 - As soon as the browser thread finishes downloading the data, it triggers the internal mechanics to resolve or reject the Promise.
 
 - According to the official ECMAScript specification, resolving a promise immediately schedules its .then() or .catch() callbacks into the Microtask Queue.
 
 - The Event Loop will drain the entire microtask queue before moving on to any macrotasks (like setTimeout)

### 10. Timers

Node provides:

```javascript
setTimeout();
setInterval();
```

Example

```
setTimeout(() => {
  console.log("Hello");
}, 1000);
```

**`The key misconception`** : 1000 ms doesn't mean callback executes exactly at 1000ms. It means roughly callback cannot be executed before the timer's threshold, and actual execution depends on when the event loop gets to it.

For example:

```javascript
setTimeout(() => {
  console.log("timer");
}, 0);

while (true) {
  // blocking work
}
```

The timer cannot execute because the JavaScript thread never becomes available.

```
timer expired
      ≠
callback immediately executes
```

Instead:

```
timer becomes eligible
        ↓
event loop gets opportunity
        ↓
callback executes
```

### 11. I/O callbacks

I/O means:
```
Input/Output
```
```
reading a file
writing a file
network communication
database communication
socket communication
```
For example:
```javascript
const fs = require("fs");

fs.readFile("data.txt", "utf8", (err, data) => {
  console.log(data);
});
```

The callback:
```javascript
(err, data) => {
  console.log(data);
}
```
doesn't execute while **`readFile()`** is waiting for the file operation.

Conceptually:
```
JavaScript
   │
   │ fs.readFile()
   ▼
Node/libuv
   │
   │ perform I/O
   │
   ▼
operation completes
   │
   ▼
callback becomes ready
   │
   ▼
event loop
   │
   ▼
JavaScript callback executes
```

### Mental model

- **`Call stack`** : Where JavaScript is executing right now.

- **`Callback`** : A function intended to be invoked later or by another function/system.

- **`Asynchronous operation`** : Work whose completion does not require JavaScript to sit on the call stack waiting.

- **`Event loop`** : The mechanism that coordinates when eligible asynchronous callbacks can get back into JavaScript execution.

- **`Task/macrotask`** : A category of deferred work associated with event-loop scheduling.

- **`Microtask`** : Higher-priority deferred JavaScript work, such as Promise reactions.

- **`Promise callback`** : The callback attached to a Promise, scheduled as a microtask when its Promise reaction is ready.

- **`process.nextTick()`** : Node's special next-tick mechanism, processed with higher priority than ordinary Promise microtasks.

- **`Timer`** :  A scheduling mechanism that makes a callback eligible after a time threshold.

- **`I/O callback`** : A callback associated with completion of an asynchronous I/O operation.

### Wave 1 — Foundation
1. Call Stack
2. Synchronous execution
3. Execution context
4. Function invocation
5. Stack frames
6. Stack overflow

### Wave 2 — Why asynchronous programming exists
1. Blocking vs non-blocking
2. Asynchronous operations
3. OS
4. Node APIs
5. libuv
6. Thread pool
7. I/O
8. Callback

### Wave 3 — Event loop
1. What the event loop actually is
2. Event-loop phases
3. Timers
4. Pending callbacks
5. Poll
6. Check
7. Close callbacks
8. When callbacks become eligible

### Wave 4 — Microtask world
1. Microtasks
2. Promise reactions
3. .then()
4. .catch()
5. .finally()
6. queueMicrotask()
7. process.nextTick()
8. Priority/order

### Wave 5 — Mastery
```javascript
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

process.nextTick(() => console.log("D"));

setImmediate(() => console.log("E"));

fs.readFile("file.txt", () => {
  console.log("F");
});
```