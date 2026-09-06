# Things that will covered :
- **[Basic](./basic.md)**
```
1. What problem is async programming solving?
2. Synchronous vs Asynchronous
3. Who actually does the asynchronous work?
4. Callback — the original async pattern
5. Why is it called a callback?
6. Asynchronous Callback
7. Callback is not itself asynchronous
8. Promise
9. Promise is not the result
10. Creating a Promise
11. Consuming a Promise
12. Promise Chaining
13. async/await
14. What problem does async solve?
15. What does await pause?
16. await using Restaurant analogy
17. JavaScript itself is single-threaded
18. try/catch with async/await
19. Without try/catch
20. Promise Concurrency
21. Promise.all()
22. Promise.allSettled()
23. Promise.race()
24. Promise.any()
25. Independent Operation vs Dependent Operation (Concurrency Concept)
26. Promise Concurrency Method Simulation
```

### 1. What problem is async programming solving?
Imagine your Node server receives:
```
GET /users
```
Your handler does:
```javascript
const users = await User.find();
res.json(users);
```
The database might take 50ms. The critical question is during those 50ms, what should Node do? If **`"wait"`** meant the entire Node process stops , that would be terrible. Imagine **`1,000`** requests arrive while one database query is waiting.

We don't want:
```
Request 1 → WAIT
Request 2 → WAIT
Request 3 → WAIT
...
```
Instead Node wants to do something more like:
```
Request 1
   ↓
start DB operation
   ↓
"I can't continue this function yet"
   ↓
Node handles other work
   ↓
Request 2
Request 3
Request 4
...
   ↓
DB finishes
   ↓
continue Request 1
```
### 2. Synchronous vs asynchronous
**Synchronous**
```javascript
console.log("A");
console.log("B");
console.log("C");
```
Execution:
```
A
↓
B
↓
C
```
**Asynchronous**
```javascript
console.log("A");

setTimeout(() => {
  console.log("B");
}, 1000);

console.log("C");
```
Output:
```
A
C
B
```
Why? Because setTimeout()doesn't mean “Stop everything for one second.” It means approximately "Arrange for this callback to become eligible to run after at least this delay." So Node can continue:
```
console.log A
    ↓
schedule timer
    ↓
console.log C
    ↓
...
timer becomes ready
    ↓
callback executes
    ↓
console.log B
```
### 3. Who actually does the asynchronous work?
Node consists of multiple pieces working together. A simplified picture:
```
Your JavaScript
     ↓
    V8
     ↓
 Node APIs
     ↓
 ┌─────────────────────┐
 │ OS / libuv / workers│
 │                     │
 │ network             │
 │ filesystem          │
 │ timers              │
 │ thread pool         │
 └─────────────────────┘
     ↓
completion
     ↓
callback / Promise continuation
     ↓
JavaScript runs again
```
For example, when Node starts an asynchronous filesystem operation, Node/libuv/OS machinery handles the waiting/work rather than your JavaScript execution sitting there doing nothing.The exact mechanism differs depending on the operation, but the important mental model is JavaScript execution doesn't continuously perform the waiting itself.
### 4. Callback — the original async pattern
Before Promises became common, Node relied heavily on callbacks. For example:
```javascript
fs.readFile("data.txt", "utf8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(data);
});
```
The important part is:
```javascript
(err, data) => {
   ...
}
```
That's a callback. A callback is simply A function you give to another piece of code so it can call that function later.
### 5. Why is it called a callback?
Callback means call it back later after doing something.
```javascript
function doSomething(callback) {
  // do something
  callback();
}
```
You give:
```
doSomething(() => {
  console.log("Finished!");
});
```
### 6. Asynchronous callback
```javascript
function doSomethingAsync(callback) {
  setTimeout(() => {
    callback();
  }, 1000);
}

doSomethingAsync(() => {
  console.log("Finished!");
});

console.log("Other work");
```
Output:
```
Other work
Finished!
```
### 7. Callback is not itself asynchronous
```javascript
function greet(callback) {
  callback();
}

greet(() => {
  console.log("Hello");
});
```
The callback is synchronous here. output immediately :
```
Hello
```
So:
```
Callback ≠ asynchronous.
```
A callback is merely a function passed somewhere to be invoked later or at some appropriate point. It can be used synchronously or asynchronously.
### 8. Promise
A Promise represents the eventual result of an asynchronous operation.
```
Promise
   │
   ├── pending
   │
   ├── fulfilled
   │
   └── rejected
```
Initially:
```
PENDING
```
Later:
```
          ┌── fulfilled → value
PENDING ──┤
          └── rejected → error
```
### 9. Promise is NOT the result
```javascript
const result = fetch("/users");
```
result is not the users. It's a Promise. The Promise says "I don't have the final value available to you yet, but I represent the future result."
```
fetch()
  ↓
Promise
  ↓
eventually
  ↓
Response
```
### 10. Creating a Promise
`
You can create one manually:
`
```javascript
const promise = new Promise((resolve, reject) => {
  // asynchronous operation
});
```
There are two important functions:
```
resolve()
reject()
```
Example:
```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Done!");
  }, 1000);
});
```
Initially:
```
Promise = pending
```
After roughly one second:
```
Promise = fulfilled
value = "Done!"
```
### 12. .then()— consuming a Promise
```
promise.then((value) => {
  console.log(value);
});
```
Meaning "When this Promise successfully fulfills, run this function with its value."And:
```javascript
promise.catch((error) => {
  console.log(error);
});
```
means "If this Promise rejects, run this function with the error"So:
```javascript
promise
  .then(...)
  .catch(...);
```
represents:
```
Promise
   │
   ├── success → then()
   │
   └── failure → catch()
```
### 13. The most important Promise idea: chaining
Assumed:
```javascript
getUser();
```
returns a Promise. Then:
```javascript
getUser()
  .then((user) => {
    return getOrders(user.id);
  })
  .then((orders) => {
    return getPayments(orders);
  })
  .catch((error) => {
    console.log(error);
  });
```
Now we can express:
```
getUser()
   ↓
user
   ↓
getOrders()
   ↓
orders
   ↓
getPayments()
   ↓
payments
```
### 14. async/await
async/await is mainly a cleaner way of working with Promises.
```javascript
getUser()
  .then((user) => {
    return getOrders(user.id);
  })
  .then((orders) => {
    return getPayments(orders);
  });
```
With async/await:
```javascript
async function getData() {
  const user = await getUser();
  const orders = await getOrders(user.id);
  const payments = await getPayments(orders);
  return payments;
}
```
This looks synchronous.But don't let that appearance fool you.
### 15. What does async this mean?
When you write:
```javascript
async function getData() {}
```
the function always returns a Promise .For example:
```javascript
async function getNumber() {
  return 10;
}
```
Calling:
```javascript
const result = getNumber();
```
doesn't give:
```
10
```
It gives:
```
Promise → fulfilled with 10
```
Conceptually:
```
getNumber()
```
is similar to:
```javascript
Promise.resolve(10);
```
### 16. What does this await actually mean?
```javascript
const user = await getUser();
```
Assumed:
```
getUser()
```
returns a Promise that hasn't completed. await essentially says:

"This async function cannot continue past this point until this Promise settles. Suspend this function's continuation, and let the surrounding JavaScript system continue processing other work."

This is MUCH better than saying **`"Node waits."`**. Because Node does not stop globally.
### 18. await What pauses?
```javascript
async function foo() {
  console.log("1");

  await something();

  console.log("2");
}

foo();

console.log("3");
```
await does not pause :
```
Node.js
Event loop
entire application
all requests
CPU
```
It pauses:
```
the continuation of this async function
```
### 19. Imagine a restaurant (await analogy)
You order food:
```
You → order food
```
The kitchen needs time. Do you freeze the entire restaurant?
```
No.
```
You sit and wait. Meanwhile:
```
Customer A → eating
Customer B → ordering
Customer C → paying
Kitchen → cooking
Waiter → serving
```
Similarly:
```
const food = await cookFood();
```
conceptually means:
```
"My function needs this result before it can continue."
```
Not “Freeze the entire Node server.”
### 20. But JavaScript itself is still single-threaded
Node's JavaScript execution is generally:
```
one main JavaScript thread
```
So how can it handle many things? Because asynchronous operations allow JavaScript to:
```
start work
↓
not continuously execute while waiting
↓
return control
↓
handle other callbacks/tasks
↓
come back later
```
This is why Node is particularly good at workloads involving lots of:
```
HTTP requests
database I/O
filesystem I/O
network I/O
```
### 21. try/catch with async/await
```javascript
async function getUser() {
  try {
    const user = await User.findById(id);

    return user;
  } catch (error) {
    console.log(error);
  }
}
```
Why does this catch work? Because if the Promise awaited here rejects:
```javascript
await User.findById(id);
```
the **`await`** expression throws/rejects into the async function's control flow, and **`try/catch`** can catch it.
### 22. Without try/catch
You can also let the rejection propagate:
```javascript
async function getUser() {
  const user = await User.findById(id);

  return user;
}
```
If the database Promise rejects, **`getUser()`** itself returns a rejected Promise.
Then the caller can handle it:
```javascript
try {
  const user = await getUser();
} catch (error) {
  ...
}
```
This gives us an important principle . Errors can propagate through Promise chains until something handles them.
### Promise concurrency
**What is concurrency?**
```
Concurrency is dealing with multiple tasks during overlapping periods of time.
```
Imagine you're a waiter in a restaurant. You have three customers:
```
Customer A → wants food
Customer B → wants food
Customer C → wants food
```
You take A's order and send it to the kitchen. While the kitchen is preparing A's food, you don't stand there doing nothing . You go:
```
A → kitchen
        ↓
      waiting

Meanwhile...

B → take order
C → take order
```
That's concurrency .You are managing multiple tasks whose work overlaps in time. It does not necessarily mean the tasks are literally executing at the exact same instant.

**what is parallelism?**

```
Parallelism is multiple pieces of work are physically executing at the same time.
```
Now imagine the restaurant has three waiters :
```
Waiter 1 → Customer A
Waiter 2 → Customer B
Waiter 3 → Customer C
```
They can literally perform work at the same time. That's parallelism . Usually this requires multiple CPU cores/processors or multiple workers capable of simultaneous execution.

**Analogy**
You're studying and doing laundry.
```
You:

Start washing machine
        ↓
while machine runs
        ↓
study
        ↓
check washing machine
```

That's concurrency. You're not washing clothes and studying with the same hands at the exact same moment . But your activities overlap.

**Promise.all()**

```javascript
Promise.all([promise1, promise2, promise3]);
```

Mental model:

```
"I need ALL of these to succeed. If any one fails, I consider the whole operation failed."
```

```javascript
const userPromise = fetchUser();
const postsPromise = fetchPosts();
const ordersPromise = fetchOrders();

const [user, posts, orders] = await Promise.all([
  userPromise,
  postsPromise,
  ordersPromise,
]);
```

They run concurrently.

```
userPromise   ────────────────✓
postsPromise  ───────✓
ordersPromise ───────────✓

               ↓
        Promise.all()
               ↓
       [user, posts, orders]
```

Notice something important , Result order is preserved Even if:

```
orders → finishes first
posts  → finishes second
user   → finishes last
```

you still get:

```
[user, posts, orders]
```

because the output corresponds to the input order, not completion order.

**When should you use Promise.all()?**

`Situation 1 — Independent data is required`

For example, your dashboard needs:

```
user
orders
notifications
```

None depends on the others.

```javascript
const [user, orders, notifications] = await Promise.all([
  getUser(),
  getOrders(),
  getNotifications(),
]);
```

Instead of:

```javascript
const user = await getUser();
const orders = await getOrders();
const notifications = await getNotifications();
```

which unnecessarily waits sequentially.

`Situation 2 — All operations are required`

```javascript
await Promise.all([saveUser(), saveProfile(), savePreferences()]);
```

If any operation fails, you want the overall operation to be considered unsuccessful.

**Promise.allSettled()**
Now imagine:

```
Task A → success
Task B → ERROR
Task C → success
```

You don't want the whole thing to fail. You want to know what happened to every task. That's:

```javascript
Promise.allSettled();
```

Example:

```javascript
const results = await Promise.allSettled([
  fetchUser(),
  fetchPosts(),
  fetchNotifications(),
]);
```

Result looks conceptually like:

```
[
  {
    status: "fulfilled",
    value: user
  },
  {
    status: "rejected",
    reason: error
  },
  {
    status: "fulfilled",
    value: notifications
  }
]
```

The important difference:

```
Promise.all()

one rejection
     ↓
whole Promise rejects
```

while:

```
Promise.allSettled()

one rejection
     ↓
keep waiting
     ↓
tell me everyone's result
```

**When should you use allSettled()?**

Use it when:

```
Every operation is independent and you care about the outcome of each one, even if some fail.
```

Suppose an admin dashboard loads:

```
users
orders
analytics
notifications
reviews
```

Maybe analytics fails. You don't necessarily want to throw away everything else.

```javascript
const results = await Promise.allSettled([
  loadUsers(),
  loadOrders(),
  loadAnalytics(),
  loadNotifications(),
  loadReviews(),
]);
```

Then you can inspect each result.

**Promise.race()**

```
"Whichever promise settles first determines the result."
```

And here's a very important word **`Settles`**. A promise can:

```
FULFILLED
REJECTED
```

Both are settled. So race() doesn't mean:

```
"First successful promise."
```

```
It means, "First promise to finish, whether success or failure."
```

```javascript
Promise.race([promise1, promise2, promise3]);
```

**Analogy of promsie.race()**
Imagine you call:

```
Taxi A → arrives in 10 minutes
Taxi B → arrives in 5 minutes
Taxi C → arrives in 8 minutes
```

You're asking ,"Which event happens first?" That's race.

**But race() does NOT cancel losers**.

```javascript
Promise.race([slowRequest(), fastRequest()]);
```

Suppose:

```
fastRequest → ✓
slowRequest → still running
```

race() returns the fast result. But:

```
slowRequest
```

may still continue.

```
race() chooses the winner; it doesn't automatically kill the losers.
```

**Promise.any()**

```javascript
Promise.any([promise1, promise2, promise3]);
```

Mental model:

```
"Give me the first successful result."
```

This is different from race().Suppose:

```
A → rejects
B → rejects
C → succeeds
```

Then:

```javascript
Promise.any([A, B, C]);
```

```
returns C.
```

**race() vs any()**

```
race()
First SETTLED promise wins.
```

That means:

```
success → winner
failure → winner
```

```
any()
First FULFILLED promise wins.
```

That means:

```
failure → ignore
failure → ignore
success → winner
```

Example:

```
A ───✗
B ───────✗
C ─────────────✓
```

With:

```
Promise.race([A, B, C])
A wins because A settled first → rejection.
```

With:

```
Promise.any([A, B, C])
C wins because C is the first successful promise.

```

**What if Promise.any() has no successful promise?**

Suppose:

```
A → reject
B → reject
C → reject
```

Then:

```javascript
await Promise.any([A, B, C]);
```

rejects with:

```
AggregateError
```

This error contains information about the rejection reasons.

```javascript
try {
  await Promise.any([serviceA(), serviceB(), serviceC()]);
} catch (error) {
  // All failed
}
```

**The biggest misconception: "Promise methods create concurrency"**

Not exactly. Look at this:

```javascript
await Promise.all([fetchUser(), fetchPosts(), fetchOrders()]);
```

The below function calls:

```javascript
fetchUser();
fetchPosts();
fetchOrders();
```

are evaluated before **`Promise.all()`** receives the array. So
This is why this is concurrent.

```
fetchUser()  → starts
fetchPosts() → starts
fetchOrders() → starts
             ↓
       Promise.all()
             ↓
           waits
```

But below call is sequential :

```javascript
await fetchUser();
await fetchPosts();
await fetchOrders();
```

Because

```
fetchUser
   ↓
wait
   ↓
fetchPosts
   ↓
wait
   ↓
fetchOrders
```

**`ADVANCE (LEARN LATER)`** : Promise.all() doesn't make CPU work parallel

**concurrency begins when async work begins**

```javascript
const p1 = fetch("/a");
const p2 = fetch("/b");
const p3 = fetch("/c");
```

```javascript
const results = await Promise.all([p1, p2, p3]);
```

```
Think of it as:

          START
            │
     ┌──────┼──────┐
     ↓      ↓      ↓
    /a     /b     /c
     │      │      │
     └──────┼──────┘
            ↓
       Promise.all
            ↓
         results
```

The promises represent ongoing asynchronous operations. Promise.all() is the coordination point.

### Does await make things sequential?

Not necessarily.

This is concurrent

```javascript
const a = fetchA();
const b = fetchB();

const resultA = await a;
const resultB = await b;
```

This is sequential.

```
const resultA = await fetchA();
const resultB = await fetchB();
```

Why? Because in the second version, B doesn't even start until A finishes. That's the distinction you should burn into your brain:

```
Calling the async function starts the operation. await determines when your async function pauses for its result.
```

**rules for choosing the method**

When you see multiple async operations, ask these questions in order:

```javascript
// Question 1:
// Do these operations depend on each other? If yes:
await A();
await B();
// may be necessary. If no, consider concurrency.
```

```javascript
// Question 2:
// Do I need every operation to succeed? If yes:
Promise.all();
```

```javascript
// Question 3
// Do I need to know the result of every operation, even failures? If yes:
Promise.allSettled();
```

```javascript
// Question 4
// Do I want the first operation that settles, success or failure? If yes:
Promise.race();
```

```javascript
// Question 5
// Do I want the first successful operation? If yes:
Promise.any();
```

### What does "independent operations" mean?

In Promise context:

```text
Operation B is independent of operation A if B does not need A's result before B can start.
```

For example, imagine a dashboard:

```
GET /dashboard
```

```
Need:
├── user information
├── notifications
└── recent orders
```

Suppose you already know the userId . You can all start:

```javascript
getUser(userId);
getNotifications(userId);
getOrders(userId);
```

because:

```text
getUser()          ──────────────→
getNotifications() ────────→
getOrders()        ───────────→
```

None needs the result of another operation. That's independent .

### What is a dependent operation?

Suppose you don't know the user's ID. First you have to log in:

```javascript
const user = await login();
```

Only after logging in do you know:

```
user.id
```

Now you can fetch:

```
getOrders(user.id)
getNotifications(user.id)
```

So:

```
login()
  │
  │ produces user.id
  ↓
┌───────────────┬──────────────────┐
↓               ↓
getOrders()     getNotifications()

getOrders() depends on the result oflogin() .
```

Therefore this part must be sequential:

```javascript
const user = await login();

const [orders, notifications] = await Promise.all([
  getOrders(user.id),
  getNotifications(user.id),
]);
```

Notice something beautiful here , Sequential and concurrent code can exist together.

```
You don't ask "Should my whole application be concurrent?"
```

```
You should ask "Which operations depend on each other, and which don't?"
```

# Promise concurrency simulation :

### Promise.all()

You need:

```
User
Orders
Notifications
```

All three are required.

```javascript
function getUser() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: 101, name: "Rudra" });
    }, 2000);
  });
}

function getOrders() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(["Order #1", "Order #2"]);
    }, 3000);
  });
}

function getNotifications() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(["New message", "Payment received"]);
    }, 1000);
  });
}

async function dashboard() {
  console.time("dashboard");

  const [user, orders, notifications] = await Promise.all([
    getUser(),
    getOrders(),
    getNotifications(),
  ]);

  console.log("User:", user);
  console.log("Orders:", orders);
  console.log("Notifications:", notifications);

  console.timeEnd("dashboard");
}

dashboard();
```

What should happen? The timers are:

```
User          → 2 sec
Orders        → 3 sec
Notifications → 1 sec
```

If you did them sequentially:

```
2 + 3 + 1 = 6 seconds
```

With Promise.all():

```
User          ██████████ 2s
Orders        ███████████████ 3s
Notifications █████ 1s
                         ↓
                    all finished
```

```
Total ≈ 3 seconds .
```

That's concurrency.

### Promise.allSettled()

Imagine you want to send:

```
Email
SMS
Push notification
```

Maybe SMS fails. But you still want to know what happened with the other two.

```javascript
function sendEmail() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Email sent");
    }, 1000);
  });
}

function sendSMS() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("SMS provider is unavailable"));
    }, 1500);
  });
}

function sendPushNotification() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Push notification sent");
    }, 500);
  });
}

async function sendNotifications() {
  const results = await Promise.allSettled([
    sendEmail(),
    sendSMS(),
    sendPushNotification(),
  ]);

  console.log(results);
}

sendNotifications();
```

You'll get something conceptually like:

```javascript
[
  {
    status: "fulfilled",
    value: "Email sent"
  },
  {
    status: "rejected",
    reason: Error(...)
  },
  {
    status: "fulfilled",
    value: "Push notification sent"
  }
]
```

The important thing:

```
Email  → success
SMS    → failure
Push   → success
```

allSettled() says:

```
"I don't care if some failed. Wait until EVERY operation has finished and tell me the outcome of each."
```

### Promise.race()

Real-world pattern: API request timeout Let's make a fake API:

```javascript
function slowAPI() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("API response received");
    }, 5000);
  });
}

function timeout() {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Request took too long"));
    }, 2000);
  });
}

async function getData() {
  try {
    const result = await Promise.race([slowAPI(), timeout()]);

    console.log(result);
  } catch (error) {
    console.log(error.message);
  }
}

getData();
```

What's happening?

```
slowAPI() ───────────────────────── 5s
timeout()  ────────✗ 2s
                     ↓
                 race winner
```

So after about 2 seconds:

```
Request took too long
```

The key , race()doesn't care whether the first promise succeeds or fails. It cares about:

```
Who settles first?
```

### Promise.any()

**Real-world pattern: backup services**

Imagine your application can get weather information from three providers:

```
Weather API A
Weather API B
Weather API C
```

You don't care which provider answers. You just want:

```
the first successful response.
```

```javascript
function weatherAPI_A() {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("API A failed"));
    }, 1000);
  });
}

function weatherAPI_B() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Weather data from API B");
    }, 3000);
  });
}

function weatherAPI_C() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Weather data from API C");
    }, 2000);
  });
}

async function getWeather() {
  try {
    const result = await Promise.any([
      weatherAPI_A(),
      weatherAPI_B(),
      weatherAPI_C(),
    ]);

    console.log(result);
  } catch (error) {
    console.log("All APIs failed");
  }
}

getWeather();
```

Timeline:

```
API A ───✗ 1s

API C ─────────✓ 2s
                 ↓
              WINNER

API B ───────────────✓ 3s
```

Result:

```
Weather data from API C
```

Even though A failed first, that's okay. That's the fundamental difference:

```
race() → first settled
any()  → first successful
```

### Dependent vs independent pattern

```
Step 1:
Authenticate user

       ↓

Step 2:
Need user.id

       ↓
┌──────────────┬────────────────┬─────────────────┐
↓              ↓                ↓
Orders      Notifications    Recommendations
```

```javascript
function authenticate() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 101,
        name: "Rudra",
      });
    }, 1000);
  });
}

function getOrders(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Orders for user ${userId}`);
    }, 2000);
  });
}

function getNotifications(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Notifications for user ${userId}`);
    }, 1500);
  });
}

function getRecommendations(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Recommendations for user ${userId}`);
    }, 1000);
  });
}

async function dashboard() {
  // DEPENDENCY
  const user = await authenticate();

  console.log("Authenticated:", user);

  // These are now INDEPENDENT
  const [orders, notifications, recommendations] = await Promise.all([
    getOrders(user.id),
    getNotifications(user.id),
    getRecommendations(user.id),
  ]);

  console.log(orders);
  console.log(notifications);
  console.log(recommendations);
}

dashboard();
```

First:

```
authenticate()
↓
user.id
```

This is Sequential because there's a dependency. Then:

```

               user.id
                  ↓
       ┌──────────┼──────────┐
       ↓          ↓          ↓
    orders   notifications recommendations
       │          │          │
       └──────────┼──────────┘
                  ↓
            Promise.all()
```

Competitor because they're independent.
