# Node.js
- **[HTTP](./http.md)**
- **[HTTP Networking](./httpNetworking.md)**
- **[Package Management](./packageMangament.md)**
- **[Asynchronus Part-1](./asynchronus1.md)**
- **[Asynchronus Part-2](./asynchronus2.md)**
- **[Path](./path.md)**
- **[Module](./module.md)**
- **[File System](./fileSystem.md)**
- **[Process](./Process.md)**
- **[Enviroment](./enviroment.md)**
- **[Event Emitter](./EventEmitter.md)**
- **[Error-Handling](./ErrorHandling.md)**
- **[Streams](./streams.md)**
- **[Buffer](./buffer.md)**
- **[Todo](./todo.md)**
- **[InterView Questions](./interview.md)**
- **[Connect The Dot](./connectTheDot.md)**
- **[Root](/README.md)**
## Must know — cannot move forward without it
```javascript
// What Node.js actually is?
// Node.js ≠ JavaScript?
// V8 engine?
// Node runtime?
// Node.js is not inherently an HTTP server?
// Node's event-driven architecture?
// Single-threaded JavaScript execution
// Non-blocking I/O?
// Blocking vs non-blocking operations?
// Synchronous vs asynchronous operations?
```

## 1. What Node.js actually is?

Node.js is a runtime environment that allows JavaScript code to run outside a web browser. It's a runtime — a program whose entire job is to execute your JavaScript code and give it superpowers the browser never allowed.

A browser provides such an environment. When you write JavaScript inside Chrome, V8 executes the JavaScript .
```
Chrome
 ├── JavaScript engine → V8
 ├── Web APIs
 ├── DOM
 ├── Fetch
 ├── localStorage
 └── Browser environment
```

But Node.js takes a different approach :
```
Node.js
 ├── V8 JavaScript engine
 ├── Node APIs
 ├── Event loop
 ├── File system access
 ├── Networking
 ├── Timers
 ├── Process management
 └── Other system capabilities
```

So Node gives JavaScript a different environment to live in.And Node allows that JavaScript to interact with things that browser JavaScript normally cannot directly control.JavaScript itself doesn't magically know how to read a file from your computer. Node provides that capability.

## 2. Node.js ≠ JavaScript
#### javascript
Below are three different things.
```
JavaScript = language
Node.js    = runtime environment
V8         = JavaScript engine
```

 Javascript define things like below. The language specification defines what these things mean.
```
let
const
function
class
Promise
Array
Object
async
await
```
**`JavaScript`** = the language. Syntax, variables, functions, closures, prototypes, Promise, async/await as language keywords, etc. This is defined by a spec called **`ECMAScript`** .

#### V8
V8 is an implementation/engine that executes JavaScript. Chrome uses V8. Node.js also uses V8.

#### Node js
**`Node.js`** = a host environment that runs JavaScript and hands it extra tools that are not part of the language itself.

Example :
```
const fs = require("fs");
```

**`fs`** is not a fundamental javascript feature. Node provides is as well as :
```
const http = require("http");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
```

So the bottom line is **`JavaScript is the language. V8 executes JavaScript. Node provides an environment and system APIs around V8.`**

This is why you'll see errors like **`document is not defined`** if you try to run browser code in Node, and **`fs is not defined`** if you try to use Node's file system module in a browser. Same language, different available toolbox, because the language spec doesn't include I/O — every environment (browser, Node, Deno) has to supply its own.

## 3. what exactly is V8?
V8 is Google's open source JavaScript engine. It is primarily written in C++m originally built for chrome and **`implements`** JavaScript execution.

An **`"engine,"`** in this context, is the actual program that:

- **`Parses`** your JavaScript text into an internal representation
- **`Compiles`** it (V8 uses Just-In-Time compilation — it compiles to machine code at runtime, and even re-optimizes "hot" code paths that run frequently)
- **`Execute`** the resulting machine code
- **`Manages memory`** for it — allocating memory for variables/objects and garbage-collecting memory that's no longer used

V8 is the thing that actually understands JavaScript syntax and turns it into instructions your CPU can run. Without V8 (or an engine like it — Firefox has SpiderMonkey, Safari has JavaScriptCore), JavaScript is just text with no way to execute.

**`So: V8 runs pure JavaScript. Node wraps V8 and injects extra APIs ( fs, http, process, etc.) that aren't part of V8 or JavaScript itself — they're Node's addition.`**

This is also why V8's speed improvements benefit Node directly — every time Chrome ships a faster V8, Node (once it upgrades its bundled V8 version) gets faster too

**`Node.js`** embeds V8 inside itself. When you run **`node app.js`**, here's what happens at a high level:

```
node app.js
   │
   ├─► Node.js reads your file
   ├─► Hands the JS code to V8
   ├─► V8 parses + compiles + executes it
   └─► Whenever your code calls a Node-specific API (fs, http, etc.),
       V8 hands control back to Node's C++ layer, which does the actual
       work (often via libuv — see below) and returns a result to V8.
```     
Suppose you write:
```javascript
const a = 10;
const b = 20;
console.log(a + b);
```

Something needs to understand:
```javascript
const
=
+
console.log()
```
and turn that into operations your computer can execute. That's the job of the JavaScript engine. V8 does much more **`internally—parsing, interpreting, compiling, optimization, garbage collection`**, etc.—but don't confuse V8 with Node.

## 4. The Node Runtime (the full picture)
**`"Node runtime"`** refers to everything bundled together that makes **`node`** work, not just V8. It's made of layers. 
This is where Node becomes interesting.

Imagine V8 by itself as:

**`"I know how to execute JavaScript. But your application needs things likev:"`**

```
Read a file
Open a network connection
Create a TCP server
Talk to DNS
Create timers
Access environment variables
Spawn processes
Interact with the operating system
```
V8 isn't intended to be your complete operating-system interface. Node builds an environment around it.
```
┌─────────────────────────────────────────┐
│         Your JavaScript Code             │
├─────────────────────────────────────────┤
│   Node.js APIs (fs, http, path, process)│  ← C++ bindings, written on top of...
├─────────────────────────────────────────┤
│   V8 Engine        │   libuv             │
│   (executes JS)     │  (event loop, async │
│                     │   I/O, thread pool) │
├─────────────────────────────────────────┤
│              Operating System            │
└─────────────────────────────────────────┘
```

## 5. Node.js is NOT inherently an HTTP server

Node.js is a general-purpose JavaScript runtime environment, meaning it does not automatically act as a web server until you write code to build one. Node is providing the **`HTTP/networking`** APIs. But Node itself isn't inherently "an HTTP server."

You can use node.js for :
```
HTTP server
WebSocket server
TCP server
CLI applications
Background workers
File processing
Scripts
Build tools
Automation
Talking to hardware (via serial ports, etc.)
Database applications
```

```javascript
// This is a complete, valid Node.js program.
// It does not start a server, does not listen on a port,
// and is still 100% legitimate "Node.js."
const fs = require('fs');
const data = fs.readFileSync('notes.txt', 'utf-8');
console.log(data.toUpperCase());
```
When you do want an HTTP server, Node gives you the raw tool
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Hello from Node');
});

server.listen(3000);
```

**`A Engine, Not a Car`**: Node.js provides the engine (the V8 JavaScript engine) to execute JavaScript code on your computer. It does not come with a pre-built web server running in the background.

**`No Default Port`**: When you install Node.js, it does not listen for incoming internet traffic or web requests on its own.

**`Versatile Use`**: You can use Node.js to build command-line tools, run scripts, process files, or build desktop applications without ever handling an HTTP request.

## 7. Single-threaded JavaScript execution
Before know single threaded execution, we need to clear up some fundamentals .

### What is CPU core?
A CPU core is an individual execution unit inside your computer's main chip that reads and executes program instructions. Think of it as a tiny independent worker inside the main chip. Each **`core`** reads, calculates, and executes program instructions separately, allowing your computer to handle multiple tasks at the same time.
one core can only execute a limited stream of instructions at a time.

For example you have :
```
1 + 2
```
Eventually, after compilation/execution, the CPU receives machine instructions. A CPU core is what actually performs those instructions.

#### Single-Core vs. Multi-Core
- **`Single-Core (One Chef)`**: An older single-core processor has only one chef. If you give them multiple orders, they must switch back and forth very fast. They can only focus on one exact task at any microsecond.

- **`Multi-Core (Multiple Chefs)`**: A modern multi-core processor has two, four, or many chefs. Chef one can run your web browser while chef two plays a video game at the same time. This real teamwork allows your computer to handle heavy multitasking smoothl


### What is thread?
If a core is the chef, then a thread is the sequence of instructions the chef executes—think of it as a single, step-by-step recipe or ticket.

#### Core vs. Thread: The Technical Difference
- **`Core (The Hardware)`**: The actual physical engine built out of billions of microscopic transistors on the silicon chip.

- **`Thread (The Software)`**: The stream of data and instructions sent by your apps to be executed.

**`The Single-Threaded Core`** : One Chef, One Task In a basic setup, each chef has only one workspace and can focus on exactly one recipe at a time.The chef cuts vegetables for a soup **`(Thread 1)`**.If the soup needs to simmer for 10 minutes, the chef stands still and waits.The chef cannot start baking a cake **`(Thread 2)`** until the soup is completely finished.

**`The Multi-Threaded Core: One Chef, Two Tasks (Hyper-Threading)`** : Intel and AMD use technologies called Hyper-Threading or SMT (Simultaneous Multithreading). This tricks the computer into thinking one core is actually two. In our kitchen, this means one chef is assigned two recipes at the same time. The chef now has two prep stations directly in front of them. While the soup (Thread 1) is simmering and requires no active work, the chef immediately turns to the second station and starts mixing batter for a cake (Thread 2). The chef only has two hands (one physical CPU core). They cannot physically chop and mix at the exact same microsecond. However, by switching between the tasks during natural downtime, they finish both dishes much faster.

When you see a processor advertised as **`6 Cores / 12 Threads`**, it means you have 6 physical chefs, but each chef can juggle 2 recipes at once

A thread doesn't execute itself — it's the thing being executed. It's the ordered sequence of instructions, plus the program counter (where you are in that sequence) and registers (working values), that the core fetches and runs. Think of the core as a CD player and the thread as a CD: the player (core) does the actual work of spinning and reading, but the CD (thread) determines what gets played. Swap in a different disc (context switch) and the same player now plays something else.

### What is process?
A process is a running instance of a program , together with the resources and memory assigned to it.

When you double-click an icon to run an application (like Google Chrome, Spotify, or a Node.js script), the operating system creates a Process.

- A process is an isolated container that the computer sets aside for that specific program.
- It allocates dedicated memory space (RAM) and resources that no other program can touch.
- Think of a process as a complete restaurant building. It has its own kitchen, physical space, and inventory.

#### Program vs. Process vs. Thread vs. Core

```
 [ PROGRAM ]  -->  [ PROCESS ]  -->  [ THREADS ]  -->  [ CORES ]
 (The Cookbook)    (The Project)     (The Tasks)       (The Chefs)
 ```

 **`1. Program (The Cookbook)`** : 

 - **`What it is`**: A passive file sitting on your hard drive (like an .exe file).

 - `**Kitchen Analogy`** : The Cookbook sitting on a shelf. It is just text and instructions. It is not doing anything, taking up room on the counter, or consuming energy.

 #### 2. Process (The Cooking Project)
 
 - **`What it is`** : A program that has been opened and loaded into the computer's memory (RAM). It is active, alive, and has its own dedicated pool of memory.
 
 - **`Kitchen Analogy`** : The "Baking a Wedding Cake" Project. When you decide to make the cake, you pull the book off the shelf. You allocate a specific table, bring out the flour, sugar, and bowls, and claim that space. No other cooking project is allowed to mess with your ingredients.
 
 - **`Note`** : One program can create multiple processes. For example, every single tab you open in Google Chrome is a separate, isolated process so that if one tab crashes, the whole browser doesn't die.

 #### 3. Thread (The Individual Recipes) 
 
 - **`What`** it is: The actual units of execution inside a process. A process cannot do work without threads. Every process has at least one thread, but complex processes have many.
 
 - **`Kitchen Analogy`** : The Individual Recipes needed to finish the cake project.
   - Thread 1: Bake the sponge cake.
   - Thread 2: Whip the frosting.
   - Thread 3: Sculpt the sugar flowers.
   - All these threads work inside the same process, meaning they share the same kitchen table and ingredients.

#### 4. Core (The Chef)

- **`What it is`** : The physical hardware engine that does the actual math.

- **`Kitchen Analogy`** : The Physical Chef who reads the threads (recipes) of the process (project) and actually does the physical work.
 
#### concurrency vs parallelism
. A simple way to remember it, coined by programming pioneer **`Rob Pike`**, is that concurrency is **`dealing`** with lots of things at once, while parallelism is **`doing`** lots of things at once.

When people say node js is single threaded, they're mainly talking about JavaScript execution.

Imagine your javascript code  :
```javascript
console.log("A");
console.log("B");
console.log("C");
```

There is essentially **`one single main JavaScript execution thread`** processing these instructions.

```
JavaScript execution thread

A
↓
B
↓
C
```
It doesn't simultaneously execute on three JavaScript threads. It executes JavaScript sequentially on single/main thread.

That's why this matters:
```
while (true) {
}
```

You've created an infinite loop. The JavaScript thread is now occupied. It cannot get around to executing your other JavaScript callbacks. This is what people mean when they say Node's JavaScript execution is single-threaded.
```
Node.js Process
│
├── Main JS Thread
│       ↓
│      V8
│
├── Worker Thread
│
└── Worker Thread
```
```
        JavaScript
            ↓
     Main JS Thread
            ↓
           V8
```
```
❌ Node process contains only one thread
❌ Computer has only one CPU core
```

```
PROGRAM
   ↓
PROCESS
   ↓
THREAD
   ↓
CPU CORE
   ↓
CPU executes instructions
```

But there is one subtle correction . A thread isn't physically "inside" a CPU core. The OS schedules threads onto cores.

#### And WHY does the OS need this whole system?
Because computers need to run many things simultaneously.

Imagine you're running:

```
Chrome
VS Code
Spotify
Node.js
File Explorer
Discord
```

The OS might have:
```
Process
├── Chrome
├── VS Code
├── Spotify
├── Node.js
├── File Explorer
└── Discord
```

Each process can have multiple threads. The OS constantly schedules these threads onto available CPU cores.

When we say "JavaScript runs on a single thread", we are talking about the thread on which V8 executes JavaScript code . V8 is the engine that executes JavaScript on a thread . The host/runtime (Node.js, Chrome, etc.) integrates V8 into its own threading/runtime architecture.

People often say, "Node.js is single-threaded."That's an oversimplification. A better statement is, Node.js executes JavaScript on a main thread, but a Node.js process can contain/use multiple threads.

Conceptually:
```
Node.js Process
│
├── Main JS Thread
│      └── V8 → JavaScript
│
├── Worker Thread
│
├── Worker Thread
│
└── Worker Thread
```

## Blocking vs Non-Blocking
**`Blocking operation`** : the calling code stops and waits until the operation completes before moving to the next line. The thread is occupied/idle-waiting, doing nothing else, for the entire duration.

**`I/O = Input/Output:`** reading files, querying a database, making a network request, reading from a socket — anything where your program has to wait on something outside the CPU (a disk, a network, another process).

**`Non-blocking I/O means`**: when your code kicks off an I/O operation, it does not stop and wait for that operation to finish. It fires off the request, immediately continues running the next lines of code, and gets notified (via a callback/Promise) later when the I/O operation completes.

```javascript
console.log('A');

fs.readFile('file.txt', 'utf-8', (err, data) => {
  console.log('C'); // happens later, whenever the OS finishes the read
});

console.log('B');

// Output order: A, B, C  — NOT A, C, B
```

- Your single JS thread calls **`fs.readFile`** and registers a callback.
Node hands the actual disk-reading work off to libuv (which may use the OS's async I/O facilities, or its background thread pool).
Your JS thread is now free and immediately moves to the next line — it was never blocked.

- When the disk read finishes (potentially milliseconds or seconds later), libuv tells the event loop "this is done," and the event loop calls your callback — slotting it in whenever the main thread is next free.

### Why this matters at scale?

Imagine a server handling 10,000 simultaneous connections, each waiting on a database query. A blocking model would need 10,000 threads (one per connection) sitting idle, waiting — expensive in memory and context-switching. Node's non-blocking model lets a single thread fire off all 10,000 queries, stay free the whole time, and just react to each result as it comes in. This is the core reason Node is popular for I/O-heavy servers (APIs, chat apps, streaming) — it isn't that Node is "faster" at computing, it's that it wastes zero thread-time waiting.
## Synchronus vs Asynchronus
```
Synchronous
= wait for completion before continuing

Asynchronous
= don't wait for completion before continuing
```

- **`Synchronous`** = operations happen in the exact order they're written , each one completing before the next begins. This is how most code "reads" by default — line 1 fully finishes, then line 2 starts.

- **`Asynchronous`** = operations can be started in written order, but complete out of order relative to the surrounding code — later code can run before an earlier-started async operation finishes.

```javascript
// SYNCHRONOUS — reads exactly top to bottom, in order, no surprises
function add(a, b) { return a + b; }
console.log('1');
console.log(add(2, 3));
console.log('3');
// Output: 1, 5, 3 — in the exact order written


// ASYNCHRONOUS — order of execution ≠ order written
console.log('1');
setTimeout(() => console.log('2 (but appears out of order!)'), 0);
console.log('3');
// Output: 1, 3, 2 — even with a 0ms delay!
```

**`Every blocking operation is synchronous by nature. Every non-blocking operation is asynchronous by nature. That's why the terms get used almost interchangeably in casual conversation — but strictly:`**

- Blocking/non-blocking describes what happens to the thread (does it wait or not).
- Synchronous/asynchronous describes what happens to code ordering (does it run in written order or not).


## 6. Node's Event-Driven Architecture
```
Browser → Node server → OS/network → event loop → callback → database → event → response
```

**`Node.js`** : 
A runtime environment that lets JavaScript execute outside the browser and provides APIs for interacting with the operating system/network.

**`JavaScript`** :A programming language.

**`V8`** : A JavaScript engine that executes JavaScript.

**`Node runtime`** : The environment surrounding V8 that gives JavaScript access to system capabilities and asynchronous infrastructure.

**`Event-driven`** : The application responds to events/completions by executing associated handlers.

**`Single-threaded JavaScript`** : Your JavaScript code is primarily executed by one main thread, so one piece of JavaScript execution runs at a time.

**`Blocking`** : The current execution cannot continue because it is waiting for an operation.

**`Non-blocking`** : The current execution can continue without waiting for the operation to complete.

**`Synchronous`** : The operation's completion is coordinated before the next step proceeds.

**`Asynchronous`** : The operation can be started and its completion handled later, allowing other work to proceed meanwhile.

When we request something on server , a **`client-server`** architecture is created , This is also called **`request-response`** model.

```
                    YOUR CODE
                       │
                       ▼
              ┌─────────────────┐
              │       V8        │
              │ JavaScript      │
              │    execution    │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │    Node.js      │
              │    Runtime      │
              │                 │
              │ fs / net / http │
              │ timers / crypto │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Async I/O       │
              │ libuv / OS      │
              └────────┬────────┘
                       │
                 operation happens
                       │
                       ▼
                  COMPLETION
                       │
                       ▼
              ┌─────────────────┐
              │   Event Loop    │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │       V8        │
              │ callback runs   │
              └─────────────────┘
```

Look at the url :
```javascript
https://web.programminghero.com/success

// https - Protocole
// web.programminghero.com - Domain name
// success - Resource
```

But the **`web.programminghero.com`** is not the real address of the website. Behind the scene an **`ip address`** is set at the top of this domain name and ip address is lived on **`DNS server`**

We cant remember all of our contact number. So that we set a nickname for specific number. We can consider domain name as nickname and real phone number is ip address.

When we request to **`web.programminghero.com`**, from our **`browser`**, our request at first go to the **`DNS`** server to check if there is any **`ip address`** available for this domain name. If found DNS server handover this ip address to the **`client(browser)`** again and browser sent request to the actual programminghero server. An ip address is actually server address. Server only recognize ip address not a domain name.

We will get ip address from DNS server like this :
```javascript
193.59.192:443

// So the https://web.programminghero.com/success will be - protocol:193.59.192:443/success

// 443 - Port number
```

When we sent an request to the server, its an http request. After request a connection has established which is called 

```javascript
TCP/IP socket connection

// Its an protocole for talk to each other, server and client
```

Then we get **`http response`**

Http request is  **`method`** base. That means you must say what you want with request. It can be
- GET
- POST
- PUT
- DELETE
- PATCH

This is called **`http method`**. Not only can get, you can also manipulate data in server using http method.

The request flow  is :

```javascript
// Request --> DNS server --> Get the ip address --> Back to the browser --> Again request with ip address to the server using http methods, http headers, request body(if needed to post something) --> Get response by server with statusCode,  response header and response body
```

There is 3 kind of website : 
- Static website
- Dynamic website
- Dynamic website with api

#### Static website : 
Server pre made some static file and when we request , we get the pre made file. Actually all files is static file until it returns to the browser.


#### Dynamic website : 
Dynamic website is when we request , server forward this request to database server and after getting dynamic data from database, server use dynamic page using template engine **`(old method)`** and sent that dynamic page. This is also called SSR (server side rendering),

#### Dynamic website with api : 
Dynamic website with api is server does not create anything. Its just get the data(json, yml) from database and sent to the client and our browser will get only the raw json data. After getting the json data, browser create the dynamic page with this dynamic json data. This is called CSR (client side rendering).

#### Benifits of using Api for website.
The main benefit is cross device support. If you use api for making website , every individual client like browser, desktop, mobile will support this because server sent only data , not pre made anything. After getting the data, every individual device as their compatibility will make the website using that api data.

Node js is a runtime where javascript code run . Node js is build upon v8 engine + libuv library (contain event loop and thrad pool). V8 engine parse the js code into machine code using callstack and heap and libuv perform the the asyncrhonus task like I/O operation, accessing file system.

The main question is why javascript single handedly cant run on server directly compared to c++ , python , c , java. Why we need an extra runtime for running javascript?

Because main javascript for the very first time was only built for interaction with browser content like button, links etc. Its only built for browser only. So javascript can only access to browser mechanism like accessing dom, window object. It cant access the file system , operating system, network other language like C++  and java.

Thats where node js comes into the picture. Its
- single threaded, event-driven and works non-blocking I/O
- perfect for data intensive, streaming application

The cons is 
- Cant handle highly cpu intensive task

but you can do this things also node js worker threads(threads pool).

#### Event driven architecture :
```
Event emitter(browser) --> Event listener(node http module) --> callback(a response against the event)
```

#### Process and threads
process needs resources like ram, cpu, gpu and all resources controlled by Operating System

Server mainly handle two kind of task. One is **`I/O intensive task`** and CPU **`intensive task`**

#### Single thread vs Multi thread server

