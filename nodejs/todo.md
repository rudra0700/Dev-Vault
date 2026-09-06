## 16. Debugging Node
- **[Basic](./basic.md)**

Very important.

Know how to use:
```
node app.js
```
and:
```
node --inspect
```
Understand:
```
console logging
stack traces
error messages
breakpoints
debugger
reading stack traces
```

```
Error
 ↓
Message
 ↓
Stack trace
 ↓
Your code
 ↓
Root cause
```

This connects directly with your goal of becoming a problem solver .
```

🟡 Level 2 — You should know these

After Level 1, learn these.

17. Node's built-in modules

Know the purpose of:

fs
path
http
https
url
os
events
crypto
stream
util
zlib

You don't need to memorize their APIs.

Think:

"I know this module exists and I know when I'd look it up."

That's enough.
```
```
19. Child processes

Understand conceptually:

child_process

and:

Node process
    ↓
starts another OS process

Know the purpose of:

exec()
spawn()

Don't go deep yet.

```
```
20. Worker threads

Know why they exist .

Node is excellent for I/O-heavy applications.

But CPU-heavy JavaScript can block the main thread.

That's where:

Worker Threads

can help.

Understand the problem before learning the API.
```

```
21. Cluster / multiple processes

Understand the basic idea:

CPU
 ├── Node process
 ├── Node process
 ├── Node process
 └── Node process

You don't need to build your production architecture around clusterright now.

Just understand why multiple processes/workers may be used.
```
```
22. Graceful shutdown

Understand:

SIGTERM
SIGINT

And the idea:

Server receives shutdown signal
        ↓
Stop accepting new requests
        ↓
Finish existing work
        ↓
Close DB connections
        ↓
Exit

This becomes important when deploying applications.
```

```
🔵 Level 3 — Learn when the project demands it

Don't block your development journey on these.

Learn them when you encounter the problem:

advanced streams
custom stream implementations
TCP servers
UDP
DNS
TLS
HTTP/2
HTTP/3
WebSockets
worker thread communication
advanced clustering
V8 internals
Node C++ addons
native addons
AsyncLocalStorage
AsyncResource
diagnostics channels
Node performance hooks
advanced memory management
garbage collection internals
Node source code

These are valuable , but they aren't prerequisites for becoming a productive Node backend developer.
```

```
⚪ Level 4 — Don't worry about these now

This is where many developers waste months.

You don't need to say:

"I can't build production Node applications until I understand V8 internals."

No.

You can learn them later.

Don't make these prerequisites:

V8 internals
C++ Node bindings
libuv internals
advanced TCP
advanced TLS
HTTP/2 internals
HTTP/3 internals
Node source code
custom native addons
advanced garbage collection

They are interesting, but not your current bottleneck .
```

API client abstraction
```
Level 4 — KNOW THE CONCEPT, DON’T GET STUCK

Understand the existence of:

HTTP/1.1
HTTP/2
HTTP/3

QUIC

connection pooling

keep-alive

TLS handshake

certificates

proxies

load balancers

SSRF

CORS
```


```
🟢 KNOW WHEN NEEDED

Don't spend days here:

Buffer.allocUnsafe()
Buffer.concat()
Buffer.compare()
Buffer.equals()
Buffer.swap16()
Buffer.swap32()
Buffer.swap64()
readUInt*
writeUInt*
readInt*
writeInt*
readFloat*
writeFloat*
```