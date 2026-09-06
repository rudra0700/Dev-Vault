# Process
- **[Basic](./basic.md)**

Things that we will covered

```
1. What is exactly a "process"?
2. Start by inspecting process
3. process.pid
4. process.env
5. process.cwd()
6. process.exit()
7. Be careful with process.exit()
8. process.on()
9. Process signals
10. SIGTERM
11. Graceful shutdown
12. SIGKILL is different
13. process.exitCode
14. process.stdin
15. process.version
16. process.platform
17. process.arch
18. process.memoryUsage()
19. process.nextTick()
20. process.uptime()
21. Uncaught exceptions
22. Unhandled promise rejection
23. Starter backend example
```

### 1. what exactly is a "process"?

When you run:

```javascript
node server.js
```

your operating system starts a Node.js process.

```
Operating System
       │
       └── Node.js Process
              │
              ├── V8 JavaScript engine
              ├── Event Loop
              ├── libuv
              ├── Your application
              ├── Memory / Heap
              ├── Environment variables
              ├── stdin
              ├── stdout
              └── stderr
```

So:

```
process
```

is a Node.js global **`object`** that gives your JavaScript program information and control over the currently running Node process. You don't need:

```javascript
const process = require("process");
```

because **`process`** is available globally.

### 2. Start by inspecting process

```javascript
console.log(process);
```

You'll see a huge object. Don't try to memorize everything. Instead:

```javascript
console.log(process.version);
console.log(process.pid);
console.log(process.platform);
console.log(process.arch);
console.log(process.cwd());
console.log(process.argv);
console.log(process.env);
```

### 2. Does node js process and global object same?

No, **`process`** and **`global`** are not the same thing, but they are directly related.In Node.js, global is the top-level execution namespace (similar to window in web browsers).

process is a specific object containing information about the currently running Node.js application.

**`The Direct Relationship`** : The process object is actually a **`property`** attached to the **`global`** object. Because JavaScript handles object assignment by reference, typing process or global.process points to the exact same object in memory. You can verify this equality directly in your code

```javascript
console.log(global.process === process); // true
```

**Analogy** :
Think of global as the entire kitchen where everything is kept accessible. Think of process as the specific control panel on the oven that tells you the temperature and lets you shut it down.

### 3. process.pid

**PID = Process ID**

```javascript
console.log(process.pid);
```

Example:

```
4821
```

The operating system assigns your Node process an ID. Imagine:

```
OS
│
├── Chrome      PID 1200
├── VS Code     PID 3200
├── Node API    PID 4821
└── PostgreSQL  PID 6000
```

So:

```javascript
process.pid; // "What is the operating system ID of the Node process running me?"
```

For example:

```javascript
console.log(`Server running with PID: ${process.pid}`);
```

### 4. process.env

```javascript
console.log(process.env);
```

It contains the environment variables available to the process. For example:

````
PORT=5000
DATABASE_URL=mongodb://...
JWT_SECRET=abc123
``
Then:
```javascript
console.log(process.env.PORT);
console.log(process.env.DATABASE_URL);
````

Mental model:

```
Operating System
       │
       │ environment variables
       ▼
Node Process
       │
       ▼
process.env
```

Important:

```javscript
process.env.PORT // is a string
```

So:

```javascript
process.env.PORT === "5000";
```

not:

```javascript
process.env.PORT === 5000;
```

If you need a number:

```javascript
const port = Number(process.env.PORT);
```

To check enviroments variable without **`dotenv`** package, run this command :

```javascript
node --env-file=.env test.js
```

### 6. process.cwd()

```javascript
console.log(process.cwd());
```

**cwd = current working directory**

Suppose your project is:

```
my-api/
├── src/
│   └── server.js
├── package.json
└── .env
```

You execute:

```
cd my-api
node src/server.js
```

Then:

```javascript
process.cwd();
```

is:

```
.../my-api
```

Notice , It is the directory from which the process was started. It is not necessarily the directory containing **`server.js`**. That's an important distinction.

### 7. process.exit()

This terminates the Node process.

```
process.exit();
```

You can specify an exit code:

```
process.exit(0);
```

Convention:

```
0       → success
non-zero → failure
```

For example:

```javascript
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}
```

This means The application cannot start correctly, so terminate the process with a failure status. This pattern is useful for startup validation

### 8. Be careful with process.exit()

Don't casually do:

```
process.exit();
```

inside random application code. For example:

```javascript
app.get("/users", (req, res) => {
    if (...) {
        process.exit();
    }
});
```

That's generally terrible. Why? Because you're terminating the entire server process because of one request. Instead, let errors propagate appropriately and handle them at the right level.

Use process termination mainly for situations such as:

```
Application cannot safely continue
        ↓
log error
        ↓
terminate process
        ↓
process manager/container restarts it
```

### 9. process.on()

process is also an EventEmitter.

```
process.on(...)
```

allows your application to listen for process-level events. For example:

```javascript
process.on("exit", () => {
  console.log("Process is exiting");
});
```

Conceptually:

```
Node process
     │
     └── emits event
             │
             ▼
       process.on(...)
             │
             ▼
          callback
```

### 10. Process signals

Operating systems can send signals to processes. Common ones you'll encounter:

```
SIGINT
SIGTERM
SIGKILL
```

SIGINT Usually generated when you press:

```
Ctrl + C
```

For example:

```javascript
process.on("SIGINT", () => {
  console.log("Received SIGINT");
});
```

Typical development scenario:

```
You press Ctrl+C
       ↓
OS sends SIGINT
       ↓
Node process receives it
       ↓
process.on("SIGINT", callback)
       ↓
your callback executes
```

### 11. SIGTERM

This is particularly important in production.

```javascript
process.on("SIGTERM", () => {
  console.log("Received SIGTERM");
});
```

SIGTERM basically means:

```
"Please terminate this process."
```

You'll commonly encounter this in environments such as:

```
Docker
Kubernetes
cloud platforms
process managers
deployment systems
```

This is why you often see:

```
process.on("SIGTERM", ...)
```

in production Node applications.

### 12. Graceful shutdown

Now connect everything. Suppose your API is running:

```
Node Process
     │
     ├── HTTP server
     ├── MongoDB connection
     ├── Redis connection
     └── other resources
```

A shutdown request arrives. If you simply kill the process immediately:

```
KILL
 ↓
Node dies
```

you could interrupt active work. Instead:

```
SIGTERM
   ↓
Node receives signal
   ↓
Stop accepting new requests
   ↓
Wait for active requests
   ↓
Close database connections
   ↓
Close Redis
   ↓
Close other resources
   ↓
Exit
```

That's graceful shutdown. A simplified example:

```javascript
const server = app.listen(PORT);

process.on("SIGTERM", async () => {
  console.log("SIGTERM received");

  server.close(async () => {
    console.log("HTTP server closed");

    await mongoose.connection.close();

    console.log("Database connection closed");

    process.exit(0);
  });
});
```

The exact shutdown implementation depends on the libraries/resources your application uses, but the concept is extremely important.

### 13. SIGKILL is different

You should know this distinction.

```javascript
SIGTERM; // Please terminate gracefully.
```

Your application can listen for it:

```
process.on("SIGTERM", ...)
```

However :

```javascript
SIGKILL; // Terminate Immediately
```

You cannot catch it with:

```
process.on("SIGKILL", ...)
```

So:

```
SIGTERM → graceful shutdown possible
SIGKILL → immediate termination
```

That's why graceful shutdown must happen when you receive a catchable termination signal.

### 14. process.exitCode

Instead of:

```
process.exit(1);
```

you can sometimes do:

```
process.exitCode = 1;
```

This tells Node:

```
When the process eventually exits, use exit code 1.
```

This can be preferable when you don't want to terminate immediately Example:

```
process.exitCode = 1;
```

versus:

```
process.exit(1);
```

The first sets the eventual status; the second explicitly terminates now.

### 15. process.stdin

Your process has standard streams:

```
stdin
stdout
stderr
```

**stdin**

Input coming into your process.

```javascript
process.stdin;
```

**stdout**

Normal output :

```
process.stdout
```

**stderr**

Error output :

```
process.stderr
```

For example :

```
process.stdout.write("Hello\n");
```

and:

```
process.stderr.write("Something went wrong\n");
```

You normally use:

```javascript
console.log();
console.error();
```

instead of directly manipulating these streams, but understanding the underlying model is useful.

### 16. process.version

```javascript
console.log(process.version); //v24.x.x
```

```
It tells you the Node.js version running your application.
```

Useful for diagnostics:

```javascript
console.log({
  nodeVersion: process.version,
  pid: process.pid,
  platform: process.platform,
});
```

### 17. process.platform

```javascript
console.log(process.platform);
```

Examples:

```
win32
linux
darwin
```

This tells you the operating-system platform. You may occasionally need platform-specific behavior.

### 18. process.arch

```javascript
console.log(process.arch);
```

For example:

```
x64
arm64
```

```
This tells you the CPU architecture Node is running on.
```

### 19. process.memoryUsage()

```javascript
console.log(process.memoryUsage());
```

You might see:

```
{
  rss: ...,
  heapTotal: ...,
  heapUsed: ...,
  external: ...,
  arrayBuffers: ...
}
```

The important concepts are:

```
heapUsed
heapTotal
rss
```

This becomes useful when diagnosing:

```
memory leaks
high memory usage
OOM problems
production performance
```

### 20. process.uptime()

```javascript
console.log(process.uptime());
```

Returns approximately how many seconds the Node process has been running. Example:

```javascript
console.log(`Uptime: ${process.uptime()} seconds`);
```

Useful for diagnostics/monitoring.

### 22. process.nextTick()

```javascript
process.nextTick(() => {
  console.log("next tick");
});
```

It schedules a callback to run after the current operation completes, before the event loop proceeds to later phases. Don't confuse:

```
process.nextTick()
```

with:

```
setTimeout()
```

or:

```
setImmediate()
```

They're different scheduling mechanisms.

### 23. Uncaught exceptions

```javascript
process.on("uncaughtException", (err) => {
  console.error(err);
});
```

This catches an exception that escaped normal error handling. But don't treat this as a normal application error handler. A serious uncaught exception can leave your application in an unsafe/unknown state.

A common production philosophy is:

```
uncaught exception
       ↓
log it
       ↓
shutdown gracefully
       ↓
let supervisor/container restart process
```

rather than:

```
uncaught exception
       ↓
"everything is fine"
       ↓
continue forever
```

### 24. Unhandled promise rejection

```javascript
process.on("unhandledRejection", (reason) => {
  console.error(reason);
});
```

This concerns rejected Promises that don't have appropriate rejection handling. For example, conceptually:

```javascript
Promise.reject(new Error("Database failed"));
```

without handling the rejection. Again, in production, don't simply use this event to hide problems. You want proper Promise error handling throughout your application.

### Starter backend example

```javascript
const server = app.listen(process.env.PORT, () => {
  console.log(`
    Server started
    PID: ${process.pid}
    Port: ${process.env.PORT}
    Environment: ${process.env.NODE_ENV}
    `);
});

async function shutdown(signal) {
  console.log(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log("HTTP server closed");

    try {
      await mongoose.connection.close();

      console.log("Database connection closed");
      process.exitCode = 0;
    } catch (error) {
      console.error("Shutdown failed:", error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
```
