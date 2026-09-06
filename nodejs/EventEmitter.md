# EventEmitter
- **[Basic](./basic.md)**

Things that we will cover

```
1. First understand the concept of an Event
2. Who creates an event?
3. Event name
4. Listener
5. on()
6. emit()
7. on() vs emit()
8. EventEmitter
9. The basic lifecycle
10. Multiple listeners
11. Multiple listeners
12. Passing data with an event
13. once()
14. Removing listeners
15. Why the function reference matters
16. eventNames(), listenerCount(), listeners()
17. The special "error"event
18. EventEmitter is synchronous
19. EventEmitter ≠ Event Loop
20. EventEmitter ≠ browser events
21. EventEmitter in real Node APIs
22. Streams + EventEmitter
23. Custom application events
24. But EventEmitter is NOT a message queue
25. Memory leaks and listener accumulation
26. this Inside listeners
27. Listener execution order
```

### 1. First understand the concept of an Event

An event is simply:

```
Something happened that other code may care about.
```

Examples:

```
User registered
Payment completed
File finished reading
Database connection established
HTTP request received
Socket connected
Error occurred
```

An event itself isn't necessarily an object or special thing Conceptually:

```
Something happened
       ↓
"Tell interested code about it"
       ↓
Event
```

For example:

```javascript
"userCreated"; // an event name
```

### 2. Who creates an event?

There are two broad situations.

```
External system creates something that Node receives
```

For example:

```
Browser
   ↓
HTTP request
   ↓
Node HTTP server
```

The browser sends the HTTP request. Node receives it. Your request handler is running. Here, the browser/network activity is the external source of the event , while Node's internals detect/dispatch the relevant activity.

```
Your application creates an application-level event
```

For example:

```javascript
emitter.emit("userCreated");
```

Here your code explicitly emits the event . So don't think:

```
"Node events always come from EventEmitter."
```

Instead:

```
Event
├── External/system activity
│      └── Node/runtime/framework reacts to it
│
└── Application event
       └── Your code calls emit()
```

### 3. Event name

An event usually has a name:

```
"userCreated"
"paymentCompleted"
"error"
```

The name allows listeners to identify which event they're interested in.

### 4. Listener

A listener is code waiting for a particular event.

```javascript
emitter.on("userCreated", () => {
  console.log("User created");
});
```

Think:

```
Event:
"userCreated"

Listener:
"This function wants to know whenever
"userCreated" happens."
```

The callback function is therefore called a listener .

### 5.on()

```javascript
emitter.on("userCreated", callback);
```

means approximately:

```
Register callback as a listener for "userCreated" event.
```

Important:

```
on()does NOT execute the callback immediately.
```

It registers it.

```
on()
 ↓
"Remember this listener."
```

### 6.emit()

```javascript
emitter.emit("userCreated");
```

means:

```
Tell the EventEmitter that "userCreated" event has happened.
```

Then the EventEmitter looks for listeners registered for that event. Conceptually:

```
emit("userCreated")
       ↓
Find listeners for "userCreated"
       ↓
Call them
```

### 7. on() vs emit()

```javascript
emitter.on("userCreated", listener); // I am interested in this event.
```

```javascript
emitter.emit("userCreated"); // This event has happened.
```

```
on  → listen/register interest
emit → announce/trigger the event
```

### 8. EventEmitter

EventEmitter is a Node.js **`class`** provided by the eventsmodule.

```javascript
import { EventEmitter } from "node:events";
const emitter = new EventEmitter();
```

The object:

```
emitter
```

can maintain event listeners and notify them when events are emitted.

### 9. The basic lifecycle

```
                  EventEmitter
                       │
          ┌────────────┴────────────┐
          │                         │
      register                    emit
       listener                    event
          │                         │
          ↓                         ↓
       on(...)              find matching listeners
                                    │
                                    ↓
                              execute callbacks
```

Example:

```javascript
import { EventEmitter } from "node:events";
const emitter = new EventEmitter();

emitter.on("userCreated", () => {
  console.log("Send welcome email");
});

emitter.emit("userCreated");
```

Flow:

```
1. EventEmitter created

2. listener registered

3. emit("userCreated")

4. EventEmitter finds listener

5. callback executes

6. "Send welcome email"
```

### 10. Multiple listeners

An event can have multiple listeners.

```javascript
emitter.on("userCreated", () => {
  console.log("Send welcome email");
});

emitter.on("userCreated", () => {
  console.log("Create notification");
});

emitter.on("userCreated", () => {
  console.log("Update analytics");
});

emitter.emit("userCreated");
```

Conceptually:

```
"userCreated"
     │
     ├── listener 1
     ├── listener 2
     └── listener 3
```

When the event is emitted, all matching listeners are called.

### 11. Passing data with an event

Events become much more useful when you pass information.

```javascript
emitter.on("userCreated", (user) => {
  console.log(user);
});

emitter.emit("userCreated", {
  id: 101,
  name: "Rudra",
});
```

Flow:

```
emit()
  │
  │ user object
  ↓
listener(user)
```

You can pass multiple arguments too:

```javascript
emitter.emit("userCreated", user, timestamp);
```

Listener:

```javascript
emitter.on("userCreated", (user, timestamp) => {
  console.log(user);
  console.log(timestamp);
});
```

### 12.once()

Sometimes you want a listener to run only once .

```javascript
emitter.once("connected", () => {
  console.log("Connected!");
});
```

Then:

```javascript
emitter.emit("connected");
emitter.emit("connected");
emitter.emit("connected");
```

The listener executes only on the first broadcast.

```
Conceptually:

emit → listener runs
       ↓
listener removed
```

Know the difference between on() and once() :

```javascript
on();
once();
```

### 13. Removing listeners

You should also understand listener removal.

```javascript
function handleUserCreated(user) {
  console.log(user);
}

emitter.on("userCreated", handleUserCreated);
```

Later:

```javascript
emitter.off("userCreated", handleUserCreated);
```

This removes that listener. You'll also encounter:

```javascript
emitter.removeListener(...)
```

**`off()`** is the modern alias for removing a listener.

### 14. Why the function reference matters

This doesn't work :

```javascript
emitter.on("userCreated", () => {
  console.log("Created");
});

emitter.off("userCreated", () => {
  console.log("Created");
});
```

Why? Because these are two different function objects. You need:

```javascript
function handler() {
  console.log("Created");
}

emitter.on("userCreated", handler);
emitter.off("userCreated", handler);
```

This becomes important when managing listeners in real applications.

### 15. eventNames(), listenerCount(), listeners()

For debugging and understanding EventEmitter, know these:

```javascript
emitter.eventNames(); // Get all registered event names.
emitter.listenerCount("userCreated"); // Get the total number of listeners for an event.
emitter.listeners("userCreated"); // Get the listeners have been registered for that event.
```

### 16. The special "error"event

EventEmitters have special behavior for:

```
"error"
```

Example:

```javascript
emitter.on("error", (err) => {
  console.error(err);
});
```

Then:

```javascript
emitter.emit("error", new Error("Something went wrong"));
```

You should understand why handling "error" events matters. This is one of those EventEmitter concepts that can become important in production Node applications.

### 17. EventEmitter is synchronous

Consider:

```javascript
emitter.on("test", () => {
  console.log("Listener");
});
console.log("Before");
emitter.emit("test");
console.log("After");
```

Output:

```
Before
Listener
After
```

Why? Because **`emit()`** calls the listeners synchronously .This is extremely important:

```
emit()
  ↓
listener executes immediately
  ↓
emit() returns
```

EventEmitter itself does not automatically make your listener asynchronous .

### 18. EventEmitter ≠ Event Loop

They're related to Node's architecture, but they are not the same thing . EventEmitter a mechanism for:

```
event → listener
```

Event Loop

```
A mechanism involved in coordinating asynchronous work and callbacks in Node.
```

So don't think:

```
EventEmitter = Event Loop
```

Instead:

```
Node.js
│
├── Event Loop
│
├── EventEmitter
│
├── Timers
│
├── I/O
│
└── Streams
```

They interact, but they're different concepts.

### 19. EventEmitter ≠ browser events

You may already know:

```javascript
button.addEventListener("click", handler);
```

The browser has an event system. Node has its own event-oriented APIs. Node's:

```
EventEmitter
```

is a general-purpose event system used throughout Node. So conceptually:

```
Browser
    ↓
DOM EventTarget
    ↓
click / input / submit
```

while:

```
Node
    ↓
EventEmitter
    ↓
custom Node/application events
```

The ideas are similar:

```
something happens
      ↓
listeners are notified
```

but the APIs and underlying implementations aren't identical.

### 20. EventEmitter in real Node APIs

You will encounter EventEmitter-like behavior in many Node APIs. For example:

```
HTTP
Streams
Sockets
File system related APIs
Child processes
Servers
Database/client libraries
```

For example, servers can expose events such as:

```javascript
server.on("error", ...)
```

Streams use events such as:

```javascript
stream.on("data", ...)
stream.on("end", ...)
stream.on("error", ...)
```

So learning EventEmitter isn't just learning one class. You're learning a pattern used throughout Node's ecosystem .

### 21. Streams + EventEmitter

A stream might emit:

```
data
end
error
close
```

Then you can listen:

```javascript
stream.on("data", (chunk) => {
  console.log(chunk);
});
```

This is one of the places where EventEmitter becomes extremely practical.

### 22. Custom application events

You can create your own event system. For example:

```javascript
import { EventEmitter } from "node:events";
export const userEvents = new EventEmitter();
```

Then:

```javascript
userEvents.on("userCreated", (user) => {
  console.log("Send welcome email");
});
```

And somewhere else:

```javascript
userEvents.emit("userCreated", user);
```

This creates loose communication between parts of your application.

### 23. But EventEmitter is NOT a message queue

Don't confuse:

```
EventEmitter
```

with:

```
Redis Pub/Sub
RabbitMQ
Kafka
Amazon SQS
```

```
An in-process EventEmitter lives inside your Node process.
```

For example:

```
Node Process
│
├── User Service
├── EventEmitter
├── Email Listener
└── Notification Listener
```

If that Node process dies, the in-memory EventEmitter and its listeners disappear.

A message broker is a different architecture:

```
Service A
    ↓
Message Broker
    ↓
Service B
```

That can provide persistence, delivery semantics, communication across processes/services, etc., depending on the system.

### 24. Memory leaks and listener accumulation

Suppose you repeatedly do:

```javascript
emitter.on("data", handler);
```

without removing listeners when appropriate.

You can accumulate listeners:

```
listener 1
listener 2
listener 3
listener 4
...
```

Node may warn about too many listeners. You should understand:

```javascript
emitter.setMaxListeners(...)
```

but don't use this simply to hide a listener leak . The real question is:

```
Why are listeners continually being added?
```

### 25. this Inside listeners

Traditional function listeners can have their thisrelated to the emitter:

```javascript
emitter.on("test", function () {
  console.log(this === emitter);
});
```

But arrow functions don't have their own this:

```javascript
emitter.on("test", () => {
  // `this` does not behave like the function above
});
```

You don't need to obsess over this now, but know it exists.

### 26. Listener execution order

If you register:

```javascript
emitter.on("test", () => {
  console.log("A");
});

emitter.on("test", () => {
  console.log("B");
});

emitter.on("test", () => {
  console.log("C");
});
```

then:

```javascript
emitter.emit("test");
```

normally invokes them in **`registration`** order:

```
A
B
C
```

This matters when multiple listeners exist.
