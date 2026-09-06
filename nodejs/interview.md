- **[Basic](./basic.md)**

"If Node.js runs JavaScript on one main thread, how can it handle thousands of requests?"

1. What is concurrency?

2. What is parallelism?

3. Why can Node handle many I/O operations
   without blocking the main JavaScript thread?

```
4. What is the difference between:

   await A();
   await B();

   and

   const a = A();
   const b = B();

   await Promise.all([a, b]);
```

5.  What happens when one Promise rejects inside Promise.all()?

6.  Does Promise.all() cancel the other Promises?

7.  Why does Promise.all() preserve input order?

8.  What does "settled" mean?

9.  What's the difference between race() and any()?

10. Why would you use allSettled()?

11. Does Promise.all() create CPU parallelism?

12. When should operations remain sequential
    even though concurrency is possible?

        What is a callback?

    Why is a callback not necessarily asynchronous?
    What problem does a Promise solve?
    What are the three Promise states?
    What does resolve() do?
    What does reject() do?
    Why does an async function always return a Promise?
    What exactly does await pause?
    Why doesn't await block the entire Node.js process?
    When should you use Promise.all() instead of sequential awaits?

13. Your 80/20 fschecklist

Before moving on, make sure you can explain these without memorizing documentation :

**Core**

```
□ What is the Node fs module?
□ Why does Node need fs?
□ What is a file?
□ What is a directory?
□ What is a file path?
□ What is a Buffer?
```

**Methods**

```
□ fs.readFile()
□ fs.writeFile()
□ fs.appendFile()
□ fs.unlink()
□ fs.mkdir()
```

**Promise API**

```
□ import fs from "fs/promises"
□ await fs.readFile()
□ await fs.writeFile()
□ await fs.appendFile()
□ await fs.unlink()
□ await fs.mkdir()
```

**Async behavior**

```
□ Why file operations are asynchronous
□ Why blocking I/O is undesirable in servers
□ What await actually pauses
□ Why try/catch works with awaited fs operations
```

**Paths**

```
□ relative path
□ absolute path
□ process.cwd()
□ path.join()
□ why paths differ across operating systems
□ __dirname vs process.cwd()
```

**Data**

```
□ Buffer vs string
□ UTF-8
□ JSON.stringify()
□ JSON.parse()
```

38. What you should actually master

For your 80/20 Node.js industry goal , don't try to memorize every error-related API.

Master these:

Level 1 — JavaScript foundation
Error
new Error()
throw
try
catch
finally
error.message
error.stack
Level 2 — Error propagation
call stack
throw propagation
rethrowing
error boundaries
Level 3 — Async errors
Promise rejection
.catch()
async/await
try/catch with await
finally
Promise.all()
Level 4 — Process node
uncaughtException
unhandledRejection
process.on()

Understand what they mean, but don't use them as your normal error-handling architecture .

Level 5 — Backend architecture
Controller
↓
Service
↓
Repository
↓
Database

Understand how errors travel through these layers.

Level 6 — Production thinking
Expected error
↓
handle

Unexpected error
↓
log
monitor
recover/restart when appropriate

And:

Don't expose internal errors
Don't swallow errors
Don't blindly retry
Don't use process-level handlers as normal control flow

```
🔴 Tier 1 — MUST KNOW
Why streams exist
Chunks
Buffer vs Stream
Readable Stream
Writable Stream
pipe()
Backpressure
pipeline()
Transform Stream
HTTP request/response as streams
File read/write streams
Stream error handling
```

```
🟡 Tier 2 — SHOULD KNOW

Duplex Stream
write()returningfalse
drain
highWaterMark
end/finish
Async iteration withfor await...of
Object mode
Stream composition
```

```
🟢 Tier 3 — LEARN WHEN NEEDED
Custom Readable implementation
Custom Writable implementation
Custom Duplex implementation
Custom Transform implementation
Advanced stream internals
Fine-grained performance tuning
Advanced buffering behavior
Implementing complicated stream protocols
```

You do not need Tier 3 to move into industry.


You should know these exist , but don't memorize them.

If you need to parse a binary protocol someday, look them up


Level 3 — IMPORTANT INDUSTRY
```
retry
exponential backoff
jitter

rate limiting
429
Retry-After

idempotency

request cancellation

streaming

logging
observability
```


```
You don't need to become a network engineer before getting a backend job.

 What Node.js actually is
 V8 + Node runtime
 CommonJS vs ESM
 npm + package.json
 HTTP request/response
 Node's httpmodule
 Event loop
 Async/await + Promises
 Non-blocking I/O
 fs
 path
 process+ environment variables
 EventEmitter
 Streams + Buffers
 Error handling
```