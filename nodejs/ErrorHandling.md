# Things we will covered

- **[Basic](./basic.md)**
```
1. Basic mental model
2. What is exactly an error?
3. throw - how an error is created and sent?
4. throw does not have to throw an error
5. try...catch — error boundary
6. Why does catch(error) receive the error?
7. Error propagation — THE important concept
8. What happens if nobody catches it?
9. Call stack — understand this before going further
10. try/catch only catches certain errors
11. Promises changed error handling
12. throw inside an async function
13. async/await makes Promise errors look synchronous
14. The most common Node backend pattern
15. Expected vs unexpected errors
16. Custom Error classes
17. Why instanceof matters
18. Promise rejection
19. .catch() is basically the Promise error handler
20. await + try/catch
21. Multiple async operations
22. finally
23. unhandledRejection
24. uncaughtRejection
25. Don't confuse these with HTTP errors
26. Express adds another error-handling layer
27. Never blindly send error.message to clients
28. Logging is part of error handling
29. Don't swallow errors
30. Error handling is really about recovery
31. Retry — but don't blindly retry everything
32. Graceful shutdown connects here
33. Final Mental model diagram
```

### Basic mental model

```
Something goes wrong
       ↓
An error is created
       ↓
Error is thrown / Promise rejects
       ↓
Does someone handle it?
       ↓
 ┌───────────────┐
 │               │
 YES             NO
 │               │
Handle it     uncaughtException /
              unhandledRejection
                    ↓
              process-level problem
```

But there is an important distinction between **`synchronous`** errors and **`asynchronous`** errors .

### 1. What exactly is an error?

In JavaScript, an error is essentially an **`object`** representing something that went wrong. For example:

```javascript
const error = new Error("Database connection failed");
console.log(error);
```

An **`Error`** object contains useful information such as:

```javascript
error.name;
error.message;
error.stack;
```

For example:

```javascript
const error = new Error("Something went wrong");

console.log(error.name);
console.log(error.message);
console.log(error.stack);
```

You might see:

```
Error
Something went wrong

Error: Something went wrong
    at ...
    at ...
    at ...
```

```javascript
error.name; //What type of error?
```

```javascript
error.message; //What happened?
```

```javascript
error.stack; //Where did it happen?
```

```
Error
├── name
├── message
└── stack
```

### 2. throw — How an error is created and sent?

```javascript
throw new Error("Something went wrong");
```

**`throw`** means:

```
Stop normal execution here and send this error upward looking for a handler.
```

Example:

```javascript
console.log("1");
throw new Error("Boom!");
console.log("2");
```

Output:

```
1
Error: Boom!
2 never executes.
```

```
throw
  ↓
interrupt normal execution
  ↓
search for an error handler
```

### 3. throw doesn't have to throw an Error

JavaScript technically allows:

```javascript
throw "Something went wrong";
throw 123;
throw { message: "Failed" };
```

But don't do this in normal Node.js application code. Prefer:

```javascript
throw new Error("Something went wrong");
```

because you get:

```
name
message
stack
```

and the ecosystem expects proper Error objects.

### 4. try...catch — error boundary

```javascript
try {
  throw new Error("Something went wrong");
} catch (error) {
  console.log("Error caught!");
  console.log(error.message);
}
```

Output:

```
Error caught!
Something went wrong
```

Think of it like this:

```
try
 ↓
run dangerous code
 ↓
error happens
 ↓
catch
 ↓
handle error
```

### 5. Why does catch(error) receive the error?

Because when this happens:

```javascript
throw new Error("Database failed");
```

JavaScript looks for a matching catch.

```javascript
try {
  throw new Error("Database failed");
} catch (error) {
  console.log(error);
}
```

The object you threw:

```javascript
new Error("Database failed");
```

becomes:

```
error
```

inside catch . So conceptually:

```javascript
throw new Error("Boom");
```

becomes:

```javascript
catch (error) {
    // error === the Error object
}
```

### 6. Error propagation — THE important concept

```javascript
function database() {
  throw new Error("Database failed");
}

function service() {
  database();
}

function controller() {
  service();
}

try {
  controller();
} catch (error) {
  console.log("Caught:", error.message);
}
```

What happened?

```
controller()
    ↓
service()
    ↓
database()
    ↓
throw Error
    ↓
service has no catch
    ↓
controller has no catch
    ↓
try/catch catches it
```

This is called **`error propagation`** . An error can travel upward through the call stack until something handles it.

### 7. What happens if nobody catches it?

```javascript
function test() {
  throw new Error("Boom");
}

test();
console.log("Hello");
```

There is no **`catch`**. Node cannot find an error handler. So the exception(error) reaches the process level. Typically you'll get something like:

```
Error: Boom
    at test (...)
    ...
```

and the Node process terminates.

```
throw
  ↓
current function
  ↓
caller
  ↓
caller
  ↓
caller
  ↓
no handler
  ↓
process
  ↓
process terminates
```

This is an uncaught exception(error) .

### 8. Call stack — understand this before going further

```javascript
function A() {
  B();
}

function B() {
  C();
}

function C() {
  throw new Error("Boom");
}

A();
```

The call stack is approximately:

```
C()
B()
A()
main
```

When C() throws:

```
C()
 ↓
look for catch
 ↓
B()
 ↓
look for catch
 ↓
A()
 ↓
look for catch
 ↓
main
 ↓
no catch
 ↓
uncaught exception
```

This is why **`error.stack`** it is so useful. It tells you where the error originated and how execution got there

### 9. try/catch only catches certain errors

**`try/catch`** naturally handles synchronous exceptions. Example:

```javascript
try {
  JSON.parse("invalid json");
} catch (error) {
  console.log("Caught!");
}
```

It Works. But this surprises beginners:

```javascript
try {
  setTimeout(() => {
    throw new Error("Boom");
  }, 1000);
} catch (error) {
  console.log("Caught!");
}
```

The **`catch`** doesn't catch it. Why? Because the **`setTimeout callback`** runs later.

```
try starts
   ↓
setTimeout registers callback
   ↓
try finishes
   ↓
catch is no longer active
   ↓
1 second later
   ↓
callback executes
   ↓
throw
```

So the throw happened outside that original synchronous try. This leads us to asynchronous error handling.

### 10. Promises changed error handling

```javascript
Promise.reject(new Error("Something failed"));
```

A Promise rejection is not the same thing as a **`synchronous`** throw . It represents:

```
Promise
   ↓
operation failed
   ↓
Promise becomes rejected
```

You handle it with:

```javascript
.catch()
```

Example:

```javascript
Promise.reject(new Error("Database failed")).catch((error) => {
  console.log(error.message);
});
```

### 11. throw inside an async function

```javascript
async function getUser() {
  throw new Error("User not found");
}
```

Calling:

```
getUser();
```

does not synchronously throw the error to the caller. Instead:

```
getUser()
   ↓
async function
   ↓
throw
   ↓
returned Promise becomes rejected
```

So:

```javascript
getUser().catch((error) => {
  console.log(error.message);
});
```

handles it. This is one of the most important Node concepts:

```
An error thrown inside a async function becomes a rejected Promise.
```

### 12. async/await makes Promise errors look synchronous

```javascript
async function main() {
  try {
    await getUser();
  } catch (error) {
    console.log(error.message);
  }
}
```

if

```javascript
async function getUser() {
  throw new Error("User not found");
}
```

```
getUser()
   ↓
Promise rejected
   ↓
await observes rejection
   ↓
control jumps to catch
```

So **`async/await`** gives us a very clean error-handling model.

### 13. The most common Node backend pattern

We write this constantly:

```javascript
async function createUser() {
  try {
    const user = await saveUser();

    return user;
  } catch (error) {
    console.error(error);

    throw error;
  }
}
```

Notice something important. We caught the error but then :

```javascript
throw error;
```

Why? Because sometimes the current layer isn't the right layer to make the final decision.

### 15. Expected vs unexpected errors

**Expected application error** :

Something that can legitimately happen during normal operation. For example:

```
User doesn't exist
Email already registered
Invalid input
Unauthorized request
Insufficient permission
Product out of stock
```

These aren't necessarily bugs. Your application should handle them Example

```javascript
if (!user) {
  throw new Error("User not found");
}
```

Then your HTTP layer might produce:

```
404 Not Found
```

**Unexpected programming error** :

Something that indicates your program has a bug or an environment failure. Examples:

```
Cannot read properties of undefined
Unexpected database corruption
Broken invariant
Programming bug
Unexpected library failure
```

For example:

```javascript
const user = undefined;
console.log(user.name);
```

This produces a **`TypeError`**. That's probably not something you should calmly convert into:

```
404 User not found
```

It may indicate a programming bug. This gives us two categories

```
                 ERROR
                   │
          ┌────────┴────────┐
          │                 │
       Expected         Unexpected
       application       programming
          │                 │
       Handle              Log
          │              monitor
       Respond              │
                            ↓
                     possibly restart
```

### 18. Custom Error classes

Instead of throwing generic errors everywhere:

```javascript
throw new Error("User not found");
```

you can create specific errors.

```javascript
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
  }
}
```

Then:

```javascript
throw new NotFoundError("User not found");
```

Now you can distinguish:

```javascript
try {
  // ...
} catch (error) {
  if (error instanceof NotFoundError) {
    // handle as 404
  }
}
```

### 19. Why instanceof matters

Suppose:

```javascript
class ValidationError extends Error {}
class NotFoundError extends Error {}
```

Then:

```javascript
const error = new NotFoundError("User not found");
```

You can ask:

```javascript
error instanceof NotFoundError;
```

Result:

```
true
```

And:

```javascript
error instanceof Error;
```

also gives:

```
true
```

because:

```
NotFoundError
      ↓
     Error
```

So custom errors let you create an error hierarchy.

### 20. Promise rejection

A Promise has states:

```
pending
   │
   ├── fulfilled
   │
   └── rejected
```

If something goes wrong:

```javascript
const promise = Promise.reject(new Error("Something failed"));
```

the Promise becomes:

```
rejected
```

Then:

```javascript
promise.catch((error) => {
  console.log(error.message);
});
```

handles the rejection.

### 21. .catch() is basically the Promise error handler

For example:

```javascript
fetchSomething()
  .then((data) => {
    return processData(data);
  })
  .catch((error) => {
    console.error(error);
  });
```

If any Promise in that chain rejects:

```
fetchSomething()
↓
then()
↓
processData()
↓
catch()
```

the rejection can propagate to the **`.catch()`**. That's one reason Promise chains are powerful.

### 22. await + try/catch

Modern Node applications commonly use:

```javascript
try {
  const user = await getUser();
  const orders = await getOrders(user.id);

  return orders;
} catch (error) {
  console.error(error);
}
```

This is usually easier to read than:

```javascript
getUser()
  .then((user) => getOrders(user.id))
  .then((orders) => {
    // ...
  })
  .catch((error) => {
    // ...
  });
```

Both are Promise-based. **`async/await`** is syntax built around Promises.

### 23. Multiple async operations

Be careful with this:

```javascript
const user = await getUser();
const orders = await getOrders();
const products = await getProducts();
```

If these operations are independent, they execute sequentially. If one fails:

```
getUser
  ↓
getOrders
  ↓
getProducts
```

and the later operations might never run. Sometimes that's correct Sometimes you want concurrency:

```javascript
const [users, products] = await Promise.all([getUsers(), getProducts()]);
```

If one rejects, **`Promise.all()`** rejects. So your error handling needs to understand Promise concurrency too.

### 24. finally

There is another important part:

```javascript
try {
  // operation
} catch (error) {
  // handle error
} finally {
  // cleanup
}
```

finally runs whether the operation succeeds or fails. Example:

```javascript
const connection = openConnection();

try {
  await doSomething(connection);
} catch (error) {
  console.error(error);
} finally {
  await connection.close();
}
```

Mental model:

```
try
 │
 ├── success ──→ finally
 │
 └── error ───→ catch ──→ finally
```

Typical use:

```
close connection
release resource
remove temporary state
cleanup
```

### 25. uncaughtException

Node exposes:

```javascript
process.on("uncaughtException", handler);
```

Example:

```javascript
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});
```

This means:

```
An exception reached the Node process without being caught normally.
```

But here's the critical production lesson:

```
Don't treat uncaughtExceptionas your normal application error handler.
```

Don't build your application around:

```javascript
process.on("uncaughtException", ...)
```

as though it makes the process safe. An uncaught exception can leave your application in an unreliable state. The safer philosophy is:

```
unexpected fatal error
        ↓
log it
        ↓
stop accepting new work
        ↓
clean up what you reasonably can
        ↓
exit
        ↓
process manager/container restarts it
```

### 26. unhandledRejection

```javascript
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
```

This concerns a Promise that becomes rejected without an appropriate rejection handler. Example:

```javascript
Promise.reject(new Error("Database failed"));
```

without:

```javascript
.catch(...)
```

or without an appropriate **`await/ try...catch`** handling path Conceptually:

```
Promise rejects
      ↓
No handler
      ↓
unhandled rejection
      ↓
process-level problem
```

The important engineering lesson is:

```
Don't allow Promise rejections to go unhandled.
```

### 27. uncaughtException vs unhandledRejection

**uncaughtException** : An exception was thrown and nobody caught it.

```javascript
throw new Error("Boom");
```

**unhandledRejection** : A Promise rejected and nobody handled the rejection.

```javascript
Promise.reject(new Error("Boom"));
```

Think:

```
throw
 ↓
uncaughtException
```

versus:

```
Promise rejection
 ↓
unhandledRejection
```

### 28. Don't confuse these with HTTP errors

Suppose your API receives:

```
GET /users/999999
```

and user doesn't exist. That's an **`application-level situation`** . You might return:

```
404 Not Found
```

This doesn't mean Node experienced a fatal runtime exception Similarly:

```
401 Unauthorized
403 Forbidden
400 Bad Request
409 Conflict
422 Unprocessable Content
```

are HTTP/application semantics. They're not automatically Node runtime errors.

### 29. Express adds another error-handling layer

You might have:

```javascript
app.get("/users/:id", async (req, res) => {
  const user = await getUser(req.params.id);

  if (!user) {
    throw new Error("User not found");
  }

  res.json(user);
});
```

You generally don't want every controller to manually do:

```javascript
try {
    ...
} catch (error) {
    res.status(...).json(...);
}
```

everywhere. Instead, you can centralize HTTP error handling with Express error middleware:

```javascript
app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    message: "Internal server error",
  });
});
```

Notice the special signature:

```javascript
(error, req, res, next);
```

The first argument tells Express:

```
"This is error-handling middleware."
```

### 31. Never blindly send error.message to clients

Avoid:

```javascript
res.status(500).json({
  message: error.message,
});
```

for every error. Why? Because unexpected errors can contain internal information. For example:

```
Database connection string
File paths
Internal implementation details
SQL/database information
Stack traces
Library internals
```

Instead, distinguish:

```
Known safe application error
        ↓
send meaningful client message

Unexpected internal error
        ↓
generic client message
+
detailed server-side logging
```

Example:

```javascript
res.status(500).json({
  message: "Internal server error",
});
```

while the server logs the actual error.

### 32. Logging is part of error handling

Bad:

```javascript
catch (error) {
    console.log("error");
}
```

Better:

```javascript
catch (error) {
    console.error(error);
}
```

Even better in production:

```
timestamp
request ID
user/request context
error name
error message
stack
service/module
environment
```

You want to answer:

```
What happened, when did it happen, and where did it happen?
```

### 33. Don't swallow errors

```javascript
try {
  await saveUser();
} catch (error) {
  console.log(error);
}
```

and then the function simply continues. You might have accidentally converted:

```
operation failed
```

into:

```
application pretends everything is okay
```

Sometimes that's correct, but often it's a bug. If the current layer cannot recover:

```javascript
catch (error) {
    console.error(error);
    throw error;
}
```

Let the appropriate higher-level layer handle it.

### 34. Error handling is really about recovery

Don't think:

```
"How do I catch every error?"
```

Think:

```
"What should the application do when this operation fails?"
```

For example:

**Invalid input**

```
reject request
↓
400/422
```

**User doesn't exist**

```
return 404
```

**Unauthorized**

```javascript
return 401;
```

\**Permission denied*8

```javascript
return 403;
```

**Duplicate resource**

```javascript
return 409;
```

**Database temporarily unavailable**

```
log
↓
possibly retry
↓
if still failing
↓
return 500/503
```

**Programming bug**

```
log
↓
monitor
↓
potentially restart
```

That is real error handling .

### 35. Retry — but don't blindly retry everything

Assumed Database temporarily unavailable

```
A retry might make sense.
```

However Invalid email address

```
Retrying won't help.
```

So:

```
Transient error
     ↓
possibly retry

Permanent/application error
     ↓
don't retry
```

This becomes important with databases, APIs, queues, and distributed systems.

### 36. Graceful shutdown connects here

Suppose an unexpected fatal problem occurs. You don't want:

```
ERROR
↓
immediately kill everything
```

A production system may do:

```
Fatal problem
    ↓
stop accepting new work
    ↓
finish ongoing safe operations
    ↓
close DB connections
    ↓
close servers
    ↓
exit
    ↓
process manager restarts
```

This connects directly to what you learned about:

```
process
SIGTERM
SIGINT
```

So your Node knowledge is beginning to connect:

```
Error handling
      ↓
Process
      ↓
Signals
      ↓
Graceful shutdown
```

### Mental model diagram

```
                    ERROR
                      │
             ┌────────┴────────┐
             │                 │
          SYNC              ASYNC
             │                 │
          throw             Promise
             │              rejection
             │                 │
          try/catch       catch / await
             │                 │
             └────────┬────────┘
                      │
                 Application
                    layer
                      │
              ┌───────┴────────┐
              │                │
           Expected        Unexpected
              │                │
            Handle         Log/monitor
              │                │
          HTTP response    potentially
                           terminate/restart
```

And underneath everything:

```
Node process
     │
     ├── uncaughtException
     │
     └── unhandledRejection
```
