# Transaction + Concurreny

The goal is :

```
how do I make a real system correct under pressure?”
```

Things we will cover :

```
Concurrency
Race conditions
ACID
Transactions
Isolation levels
Atomic updates
Locks
Pessimistic concurrency
Optimistic concurrency
Deadlocks
Idempotency
Retries
Lost updates
Write skew / anomalies
Database constraints
Application-level vs DB-level correctness
SQL vs MongoDB differences
Real production patterns
How to decide which technique to use
A complete production example
```

### First: the mental model

Forget SQL/MongoDB for a moment. Imagine your database is a shared notebook . Two users are interacting with the same notebook:

```
Database
   │
   ├── User A
   │
   └── User B
```

Both can potentially read and modify the same data. The important question isn't:

```
"Can my code update the database?"
```

The real question is:

```
"What happens when multiple operations interact with the same data at the same time?"
```

That's `concurrency`.

### 1. What is concurrency?

Concurrency means:

```
Multiple operations are in progress during overlapping periods of time.

Concurrency is the ability of a system to manage multiple tasks by making progress on them during overlapping periods of time

Instead of waiting for one task to finish completely before starting the next, a concurrent system allows multiple operations to remain active and incomplete at the same time
```

The key to understanding concurrency is that tasks do not have to execute at the exact same instant to overlap. Concurrency is about structure and coordination, whereas parallelism is about simultaneous execution

- **`Interleaved(switching back and forth) Overlap (Single-Core CPU):`** If you have a single processor, it can only execute one instruction at a time. To achieve concurrency, the operating system uses time-slicing. It spends a few milliseconds on Task A, pauses it, switches to Task B, pauses it, and goes back to Task A. While only one task is running at any microsecond, both tasks are `"in progress"` across the broader time period.True Parallel Overlap

- **`True parallel overlap (Multi-Core CPU):`** If you have multiple processors, tasks can overlap both in their overall timeframe and at the exact same physical instant

Concurrency was born out of a need to reduce CPU idle time. Most tasks involve waiting for external inputs, such as reading data from a hard drive, fetching a website, or waiting for database queries.

**`The Lone Chef`**: A chef is cooking dinner alone. They start boiling water for pasta. While waiting for the water to boil, they chop vegetables. They are managing multiple tasks across the same hour (overlapping time), but they only have one pair of hands to do one physical action at a time.

**`Database Transactions:`** In databases, multiple users frequently attempt to edit the same records during overlapping periods. Databases use concurrency control (like locking or timestamps) to ensure these overlapping attempts don't overwrite or corrupt the data

They don't necessarily execute at literally the exact same CPU instant. For example:

```
Request A ────────────────>
Request B ────────────────>
```

Their execution overlaps. Imagine:

```
Stock = 1
```

Two users buy the product.

**Request A**

```
read stock → 1
```

**Request B**

```
read stock → 1
```

Then:

```
A: stock = 1 - 1
B: stock = 1 - 1
```

Both believe the product was available. That's where things become interesting.

### 2. Race condition

```
A race condition is an undesirable situation that occurs when a device or system attempts to perform two or more operations at the same time
```

A race condition occurs when:

```
The correctness of the result depends on the timing/interleaving of concurrent operations.
```

This is extremely important. Not every competitor operation produces a race condition. For example:

```
User A → GET /products
User B → GET /products
```

Both only read data.Here **`concurrency`** exists. But there's usually no race condition because neither is modifying `shared state`. So:

```
Concurrency
     ↓
multiple operations overlap
```

while:

```
Race condition
     ↓
concurrent operations
     +
shared state
     +
unsafe interaction
     ↓
result depends on timing
```

This connects directly to what we discussed before.

### 3. The classic race condition

Assumed:

```
products
----------------
id     stock
1      1
```

Two requests arrive:

```
A: buy product 1
B: buy product 1
```

Naive code:

```javascript
const product = await Product.findById(productId);

if (product.stock > 0) {
  product.stock -= 1;
  await product.save();
}
```

Looks perfectly reasonable. But imagine this execution:

```
A                         B
│                         │
├─ read stock = 1         │
│                         ├─ read stock = 1
│                         │
├─ stock = 0              │
│                         ├─ stock = 0
│                         │
├─ save                   │
│                         ├─ save
│                         │
└─ success                └─ success
```

The application may report:

```
2 successful purchases
```

while only:

```
1 item
```

existed. This is a **`lost business invariant`** .

### 4. Business invariant

This is a concept you absolutely need for production database design.

```
An invariant is something that must remain true.
```

For example:

```
stock >= 0
account balance >= 0
one seat cannot be booked twice
a driver cannot have two active rides
appointment slot cannot be booked twice
```

Database engineering is largely about protecting these invariants.

### 5. ACID

ACID stands for:

```
A → Atomicity
C → Consistency
I → Isolation
D → Durability
```

Think of ACID as properties that make a transaction reliable.

### 6. Atomicity

Atomicity means:

```
The transaction happens completely or doesn't happen at all.
```

or we can say :

```
An atomic operation ensures that a multi-step process (read, modify,write) behaves like a single, unbreakable step. To the rest of the system, the operation has either completely finished or not started at all—it can never be seen in a half-done state.
```

Suppose transferring money:

```
Alice → Bob
$100
```

There are two operations:

```
1. subtract $100 from Alice
2. add $100 to Bob
```

Without a transaction:

```
Alice: -100
        ↓
server crashes
        ↓
Bob: never receives money
```

`Money disappeared`. With a `transaction`:

```
BEGIN

Alice -= 100
Bob += 100

COMMIT
```

Either:

```
both happen
```

or:

```
neither happens
```

If something fails:

```
ROLLBACK
```

### 7. Consistency

Consistency means:

```
A transaction should move the database from one valid state to another valid state, preserving defined constraints/invariants.

consistency guarantees that data will never break the rules.
It guarantees that the final state of that update makes logical sense and doesn't break your system's rules.
```

If a transaction attempts to write data that violates these rules, the database engine will roll back the entire transaction, and the database reverts to its original, valid state.

**What "Consistency" Guarantees?**

Database consistency relies on two main pillars to protect data integrity:

- **`Enforcing Schema Rules`**: The database guarantees that data must obey all structural rules, including `Data Types (e.g., preventing text in an integer column), Unique Constraints (e.g., preventing duplicate usernames), and Foreign Keys (e.g., preventing an order from referencing a user ID that doesn't exist)`.

- **`Preserving Application Logic`**: The database ensures that system-wide truths—called invariants—are never broken. For example, in a banking app, a transfer transaction must ensure that the total money across both accounts remains identical before and after the transfer.

Assumed:

```
balance >= 0
```

Before:

```
Alice = $500
```

A transaction attempt:

```
Alice -= $700
```

That should not create:

```
Alice = -$200
```

if the application's/database's business rules prohibit it. Consistency is often misunderstood. ACID "Consistency" does not mean:

```
“Everybody immediately sees the newest data.”
```

That's closer to `visibility/isolation` concerns.

```
Consistency means maintaining the system's defined correctness rules.
```

Consistency can slightly be differenct things depending on context :

**in ACID (Database transaction)**

```
Data strictly follows all schema rules, constraints, and invariants before and after a transaction.
```

**CAP Theorm**

```
Every reader sees the exact same data at the same time, across multiple server nodes
```

### 8. Isolation

Isolation means:

```
Isolation determines how and when the changes made by one operation become visible to other concurrent operations.

It guarantees that even if thousands of transactions are executing concurrently at the exact same millisecond, they will not interfere with each other.

The ultimate goal of isolation is to make concurrent transactions behave as if they were running one after another in a single line (serially), rather than simultaneously.
```

**What Isolation Guarantees**

Isolation protects your data from three classic concurrency anomalies:

- `Dirty Reads (Guaranteed protection against reading uncommitted data):`
  - _The Problem :_ Transaction A changes a value, but hasn't finalized `(COMMIT)` it yet. Transaction B reads that new value. Suddenly, Transaction A encounters an error and rolls back. Transaction B has now read `"dirty"` data that technically never existed.

  - _The Isolation Guarantee:_ A proper isolation level ensures Transaction B can only see data that has been permanently committed.

- `Non-Repeatable Reads (Guaranteed protection against data changing mid-transaction):`
  - _The Problem:_ Transaction A reads a row (e.g., a product price is $10). While Transaction A is still running, Transaction B updates that price to $15 and commits. Transaction A reads the exact same row again, but now sees $15. The data mysteriously changed mid-flight.
  - _The Isolation Guarantee:_ It ensures that once a transaction reads a piece of data, that data stays identical for the entire lifespan of that transaction.

- `Phantom Reads (Guaranteed protection against new data appearing mid-transaction):`
  - _The Problem:_ Transaction A queries a range (e.g., "Count all users in California"—result is 10). While Transaction A is still running, Transaction B inserts a brand new user in California and commits. Transaction A runs the exact same query again, and suddenly the count is 11. New "phantom" data appeared.

  - _The Isolation Guarantee:_ Highest isolation levels freeze the entire range of data being queried so no new records can slip in.

**Difference between Non-repeatable reads vs Phantom reads**

```
Non-Repeatable Read is about an existing row changing its data.

Phantom Read is about new rows appearing or disappearing entirely.

Why Databases Treat Them Differently?

The reason they have different names is because databases have to use different locking mechanisms to fix them.

To fix Non-Repeatable Reads: The database just needs to lock the specific rows you already read so nobody can modify them.

To fix Phantom Reads: Locking existing rows isn't enough because a user can still insert a new row into the empty spaces between them. The database has to lock the entire range (called a Range Lock or Gap Lock) to prevent anyone from inserting anything new into that territory until you are done.

```

**Why is it called Non-repeatable**

```
It is called "non-repeatable" because if you were to repeat the read, you would get a different result. The name describes the failure of the system to keep data stable.

In real-world programming, a transaction often has to read the same row multiple times because it is performing complex, multi-step business logic. Here are three highly practical scenarios where a transaction reads the same row twice:

Scenario 1: The "Double-Check" Before a Sale

Imagine an e-commerce backend handling a ticket sale for a concert

Read #1 (The Check): The code queries the database to see if a specific seat is available: SELECT status FROM seats WHERE id = 10;. The database says "AVAILABLE".

The Logic Step: The application takes a few milliseconds to calculate tax, apply a discount code, and validate the user's credit card.

Read #2 (The Update Guard): Before finally locking it in, the system reads the row again or attempts to update it based on the assumption it is still available. If another transaction changed the status to "SOLD" during those few milliseconds, the second read returns "SOLD".

The original read could not be cleanly "repeated" to yield the same result, breaking the application's logic mid-flight.

Scenario 2: Generating Reports and Invoices

Imagine a system generating a monthly financial invoice for a business client.

Read #1: The reporting tool reads a customer’s profile row to get their current address and tax rate to start building the invoice header.

The Logic Step: The tool loops through thousands of the customer's purchase records, calculating sums and line items (which takes a few seconds).

Read #2: Right before finalizing the invoice, the tool reads the customer’s profile row again to print the final summary block at the bottom of the page.

If a support agent updated the customer's address or tax tier halfway through that loop, the top of the invoice will show one address/tax rate, and the bottom will show a completely different one.

Scenario 3: Multi-Screen Wizards (Workflows)

Think of a multi-step approval process in an enterprise application (like a loan approval).

Step 1 (Screen 1): A manager opens a loan application. The system reads the applicant's credit score row from the database to display it on the screen.

Step 2 (Screen 2): The manager clicks "Next Page" to review employment history. The system queries the database again for the applicant's details to render the next tab.

If an automated background process updates the credit score row between Screen 1 and Screen 2, the manager will see conflicting information as they click through the wizard

You don't intentionally write code saying "let's read this twice for fun.

"It happens because complex software takes time to execute, and during that time window, your code assumes the world has stood still. Isolation levels are the database's way of promising you: "Go ahead and take your time. I will make sure nobody changes this data until you are completely finished."
```

**A Real-World Analogy : The fitting rooms**

Imagine a clothing store with fitting rooms:

- `No Isolation (Read Uncommitted):` There are no doors on the fitting rooms. Anyone walking by can see you half-dressed (Dirty Read).

- `Low Isolation (Read Committed):` There is a curtain. People can only see you when you fully step out with your final outfit chosen.

- `Highest Isolation (Serializable):` You lock the main door to the entire fitting room area. No one else can even enter the hallway or try on clothes until you completely finish and leave the building.
  Imagine:

```
Transaction A
Transaction B
```

Both are executing. Should `A` be able to see `B's` unfinished changes? Should `B` be able to modify something `A` is currently using? These questions are handled by `isolation`. We'll go deep into this shortly.

### 9. Durability

Durability means:

```
Once a transaction is committed, its result should survive failures. In short "Once committed, always committed."
```

For example:

```
COMMIT
```

then:

```
server crashes
database process restarts
machine reboots
```

The committed transaction should still exist. Databases achieve this using mechanisms such as:

```
write-ahead logging
transaction logs
durable storage
recovery procedures
```

Exact implementation differs by database.

**How Postgres Auto-Implements It?**

```

When you send a write query to Postgres, it goes through a strict sequence before telling your application "Success":

Postgres writes the changes to its temporary memory cache (RAM) for speed.

Simultaneously, it appends a sequential record of that transaction to the WAL (Write-Ahead Log) file on your physical storage drive.

Postgres triggers an operation called fsync(), which forces the operating system to physically flush those log bytes onto the underlying disk tracks or flash cells.

Once the disk confirms the write, Postgres returns a successful COMMIT message to your application.

If the power cuts out a millisecond later, Postgres will read that WAL file upon reboot and completely restore your data.
```

**A Practical Example: The Bank Deposit**

Imagine you walk up to an ATM and deposit `$1,000` in cash.

- The ATM processes the cash and sends a transaction to the bank's database server.

- The database updates your balance from $500 to $1,500.

- The server sends a success message back to the ATM.

- The ATM screen flashes: "Transaction Successful" and prints your receipt.

**`The Crash:`** One millisecond after that message appears on the screen, a lightning strike hits the bank's data center, causing a total blackout. The database server instantly loses power and shuts down hard.

- **`Without Durability`**: The database might have only held your new $1,500 balance in its temporary volatile memory (RAM). When the power cut out, the RAM cleared. When the server boots back up, your $1,000 deposit is gone forever.

- **`With Durability`**: Because the database promised the transaction was committed, it guaranteed that the data was written to a non-volatile medium (like an SSD or hard drive) before telling the ATM it succeeded. When the server reboots, it reads the disk, recovers the data, and your balance is safely at $1,500.

**How Databases Achieve Durability**

RAM is fast but volatile `(loses data without power)`. Disks `(SSDs/HDDs)` are durable but slow. To stay fast while guaranteeing durability, almost all modern databases use a technique called a `Write-Ahead Log (WAL)` or transaction log:

- **`Write to Log First`**: When you commit a transaction, the database immediately appends the action (e.g., "Add $1,000 to Account X") to a simple **`text-like log file`** on the disk. Appending to a log is incredibly fast.

- **`Confirm to User`**: Once the log entry is safely written to the `disk`, the `database` tells you, "Success!"

- **`Lazy Update to Database`**: Later on, when the CPU has a `spare` moment, it actually goes into the `main database files` and updates the official records.

If the power cuts out during step 3, it doesn't matter. When the database turns back on, it checks the **`Write-Ahead Log`**, sees that your transaction was successfully committed but not yet applied to the main files, and `"replays"` the action to fix the database.

### 10. What is a transaction?

A transaction is:

```
A group of database operations treated as one logical unit of work.
```

For example:

```
Create order
Decrease inventory
Create payment record
Create order items
```

Instead of thinking:

```
operation 1
operation 2
operation 3
operation 4
```

we think:

```
ONE BUSINESS OPERATION
```

```
BEGIN TRANSACTION

1
2
3
4

COMMIT
```

If something fails:

```
ROLLBACK
```

### 11. Transaction boundaries

This is a very important production skill. Don't automatically put your entire API request `inside a transaction`. Instead, ask:

```
What must succeed or fail together?
```

For example:

```
Create order
+
reserve inventory
```

probably belong to the same transactional unit if your business rules require them to remain synchronized.

But:

```
send email
```

usually should not be held inside a `DB transaction`. Why?

```
Because external operations can be slow/unreliable.
```

Bad:

```
BEGIN

create order
update stock

send email
wait 3 seconds

COMMIT
```

You're holding transactional resources while waiting for an external system.

Better architecture:

```
BEGIN
  create order
  update inventory
COMMIT
```

then:

```
publish event / queue email
```

We'll later connect this to `outbox pattern` .

### 12. Isolation levels

This is one of the most important topics. Databases don't simply have:

```
isolated
```

or :

```
not isolated
```

They provide different isolation guarantees. The standard levels are commonly described as:

```
READ UNCOMMITTED
READ COMMITTED
REPEATABLE READ
SERIALIZABLE
```

Different databases implement these differently, so always check the specific DB's documentation.

### 13. Dirty read (READ UNCOMMITTED)

Imagine:

```
Transaction A
Transaction B
```

`A` changes:

```
balance = $100
```

but hasn't `committed`.

`B` reads:

```
$100
```

Then A rolls back. Actual database state:

```
balance = $0
```

`B` saw something that never actually existed as committed state.
That's a:

```
Dirty read
```

### 14. Read committed

Under `READ COMMITTED`, a transaction generally sees only committed data. So:

```
A:
UPDATE balance = 100
not committed

B:
SELECT balance
```

`B` won't normally see `A's` uncommitted value. This is a common `default isolation` level in systems such as PostgreSQL. But another issue remains.

### 15. Non-repeatable read

```
A Non-Repeatable Read occurs when a transaction reads the exact same row of data twice, but gets different values each time because another transaction modified and committed that data in between the two reads.
```

Suppose transaction A reads:

```
stock = 10
```

Then transaction B changes it:

```
stock = 5
COMMIT
```

A reads again:

```
stock = 5
```

Same transaction. Same query. Different result. That's a: `Non-repeatable read`

### 16. Repeatable read

A Repeatable Read isolation level guarantees that once a transaction reads a row of data, it will see the exact same values for that row throughout its entire lifespan—even if another transaction modifies and saves (commits) updates to that row in the background.

Conceptually:

```
Transaction A

read → 10

Transaction B
changes → 5
commits
```

```
Transaction A
read → still sees its transaction's appropriate snapshot
```

The exact behavior and anomalies allowed depend on the database implementation. This is why you shouldn't memorize isolation levels purely as interview definitions. Understand the actual database you're using.

### 17. Phantom read

Assumed:

```sql
SELECT *
FROM orders
WHERE total > 100;
```

returns:

```
5 rows
```

Another transaction inserts:

```
order = $500
```

Then your first transaction runs the same query again and gets:

```
6 rows
```

A new row "appeared." That's a: `Phantom read`

### 18. Serializable

Serializable is conceptually the strongest standard isolation level.
It aims to make concurrent transactions behave as though they were executed serially. Conceptually:

```
A then B
```

or:

```
B then A
```

rather than allowing problematic interleavings. But there is a cost. More concurrency control can mean:

```
more waiting
more conflicts
more transaction aborts/retries
less throughput
```

Therefore:

```
Don't blindly use SERIALIZABLE everywhere.
```

Choose isolation based on the business invariant and workload.

### 20. Lost update

**`A Lost Update`** is a highly destructive database anomaly that happens when two separate transactions simultaneously read the exact same data, calculate a new value based on what they read, and write their updates back to the database.

Because they are running concurrently, the transaction that finishes last completely overwrites and erases (nullifies) the update made by the transaction that finished first.

The database doesn't throw any errors, yet your data becomes silently corrupted.

**code example :**

```javascript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// ========================================================
// TRANSACTION 1: Alice buys 2 keyboards
// ========================================================
async function alicePurchase() {
  await prisma.$transaction(async (tx) => {
    // 1. Alice's transaction reads the stock (Currently 10)
    const product = await tx.product.findUnique({ where: { id: 1 } });

    // ⏳ SYSTEM DELAY: Processing Alice's credit card...
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 3. Calculates new stock: 10 - 2 = 8. Writes it back.
    await tx.product.update({
      where: { id: 1 },
      data: { stock: product.stock - 2 },
    });
  });
  console.log("Alice's purchase of 2 items complete.");
}

// ========================================================
// TRANSACTION 2: Bob buys 3 keyboards
// ========================================================
async function bobPurchase() {
  // Imagine this starts 1 second after Alice's transaction begins
  await prisma.$transaction(async (tx) => {
    // 2. Bob's transaction ALSO reads the stock.
    // Since Alice hasn't saved her update yet, Bob reads 10!
    const product = await tx.product.findUnique({ where: { id: 1 } });

    // 4. Calculates new stock: 10 - 3 = 7. Writes it back.
    await tx.product.update({
      where: { id: 1 },
      data: { stock: product.stock - 3 },
    });
  });
  console.log("Bob's purchase of 3 items complete.");
}
```

**solution :**
First, you add a version field (an integer that defaults to 1 or 0) to your database model.

```prisma
// prisma/schema.prisma
model Product {
  id      Int    @id @default(autoincrement())
  name    String
  stock   Int
  version Int    @default(1) // 👈 The magic column
}
```

The strategy is simple: When you update the row, you add a rule in your where clause stating: "Only update this row if the version in the database matches the version I read a moment ago." At the same time, you increment the version by 1.If someone else updated the row while your code was processing, the database version will have changed, the query will update 0 rows, and Prisma will throw a target error.

```javascript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function purchaseProductWithRetry(productId, quantityBought) {
  // We use a loop to retry if a conflict happens
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // 1. READ: Fetch the current data along with its version number
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product || product.stock < quantityBought) {
        throw new Error("Insufficient stock or product not found.");
      }

      // Calculate new values in memory
      const newStock = product.stock - quantityBought;
      const nextVersion = product.version + 1;

      // 2. WRITE: Update ONLY if the version hasn't changed out from under us
      const updatedProduct = await prisma.product.updateMany({
        where: {
          id: productId,
          version: product.version, // 👈 CRITICAL: Checks if version matches our read
        },
        data: {
          stock: newStock,
          version: nextVersion, // Increments the version for the next transaction
        },
      });

      // 3. VERIFY: updateMany returns count of rows changed.
      // If 0 rows changed, it means someone else beat us to it and altered the version!
      if (updatedProduct.count === 0) {
        throw new Error("VersionConflictException");
      }

      console.log(`🎉 Purchase successful! Remaining stock: ${newStock}`);
      return; // Break out of loop on success
    } catch (error) {
      if (error.message === "VersionConflictException") {
        console.warn(`⚠️ Conflict detected on attempt ${attempt}. Retrying...`);

        if (attempt === MAX_RETRIES) {
          throw new Error(
            "Transaction failed after maximum retries due to high concurrent traffic.",
          );
        }

        // Brief random delay before retrying (exponential backoff / jitter)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 100),
        );
      } else {
        // If it's a real error (like out of stock), don't retry, just crash out
        throw error;
      }
    }
  }
}
```

This is why:

```
read → modify → save
```

can be dangerous under concurrency.

### 21. Atomic update

Instead of:

```
READ
↓
calculate
↓
WRITE
```

sometimes you can express the entire state transition as one database operation. For example:

```
UPDATE products
SET stock = stock - 1
WHERE id = ?
  AND stock > 0;
```

This is powerful. Why? Because the database performs the condition and update as one operation under its concurrency mechanisms.

### 22. MongoDB equivalent

MongoDB supports atomic single-document updates. Conceptually:

```javascript
const result = await Product.updateOne(
  {
    _id: productId,
    stock: { $gt: 0 },
  },
  {
    $inc: { stock: -1 },
  },
);
```

Then:

```js
if (result.modifiedCount === 1) {
  // reservation succeeded
} else {
  // unavailable
}
```

This is an extremely useful production pattern.

### 23. Why atomic operations are powerful

Instead of:

```
Application
    ↓
READ
    ↓
Application thinks
    ↓
WRITE
```

you push the invariant into the database operation:

```
Database

IF stock > 0
THEN stock = stock - 1
```

That dramatically reduces the race window.

### 24. But atomic update isn't a transaction

Atomic operation:

```
one database operation
```

Transaction:

```
multiple operation treated as one logical unit
```

For example:

```
decrease stock
```

may only need an atomic update. But:

```
create order
decrease stock
create inventory reservation
create payment record
```

may require a transaction depending on your consistency requirements and architecture.

### 25. Locks

A lock is basically the database saying:

```
"Other transactions can't perform certain conflicting operations on this data right now."
```

Imagine:

```
Product stock = 1
```

Transaction `A` obtains a lock.

```
A → LOCK product
```

B tries to modify it:

```
B → WAIT
```

A finishes:

```
A → COMMIT
A → RELEASE
```

Then `B` can proceed.

### 26. Pessimistic locking

Pessimistic concurrency says:

```
Assume conflicts are likely, so protect the data before modifying it.
```

Conceptually:

```
BEGIN

SELECT product
FOR UPDATE

check stock
decrease stock
create order

COMMIT
```

Tea **`FOR UPDATE`** concept in SQL databases is a classic example.It says:

```
"I'm going to modify this row; protect it from conflicting concurrent modifications until my transaction completes."
```

### 27. When pessimistic locking makes sense

Good candidates include situations where:

```
conflicts are frequent
+
correctness is critical
+
waiting is acceptable
```

Examples:

```
bank account balance
inventory allocation
limited seats
critical resource allocation
```

But don't lock unnecessarily. Locks can reduce concurrency.

### 28. Optimistic concurrency

Optimistic concurrency says:

```
Assume conflicts are relatively rare; detect them when writing.
```

Imagine document version:

```
id = 123
stock = 10
version = 7
```

A reads:

```
version = 7
```

B reads:

```
version = 7
```

An update:

```
WHERE id = 123
AND version = 7
```

success:

```
version = 8
```

B tries:

```sql
WHERE id = 123
AND version = 7
```

No matching row. Therefore:

```
conflict detected
```

B can:

```
retry
```

or:

```
tell application conflict
```

### 29. Pessimistic vs. optimistic

Think:

**Pessimistic**

```
"Nobody touch this while I'm working."
```

**Optimistic**

```
"Go ahead, but I'll check whether somebody changed it."
```

Neither is universally better. The choice depends on:

```
conflict frequency
transaction duration
business consequences
latency requirements
database capabilities
```

### 30. Write skew

This is more subtle. Imagine two doctors are on call. Business rule:

```
At least one doctor must remain on call.
```

Initial state:

```
Alice = on_call
Bob   = on_call
```

Transaction A:

```
Alice sees Bob is on call
Alice removes herself
```

Transaction B:

```
Bob sees Alice is on call
Bob removes himself
```

Both individually appear valid. But together:

```
Alice = off
Bob   = off
```

Invariant broken. This is: `Write skew` This is why simply protecting individual rows isn't always enough. Sometimes you need:

```
stronger isolation
appropriate locking
redesign
database constraints
serialized access to the shared invariant
```

### 31. Database constraints

Never rely entirely on application code for critical invariants.For example:

```
email must be unique
```

Don't just do:

```
const exists = await User.findOne({ email });

if (!exists) {
   createUser();
}
```

Two requests can race. Instead enforce uniqueness at the database level. For SQL:

```sql
UNIQUE(email)
```

For MongoDB:

```
unique: true
```

with the appropriate unique index. Then even if:

```
Request A
Request B
```

race each other, the database protects the invariant.

### 32. Application validation vs database constraints

This distinction is crucial. Application validation. Good for:

```
friendly error messages
business validation
input validation
format checking
Database constraints
```

Good for:

```
data integrity
uniqueness
referential integrity
critical invariants
```

Production systems often use both .

### 33. Deadlocks

Now the scary-looking one. Imagine:

```
A deadlock happens when two or more transactions are waiting for each other to release locks, creating a permanent cycle of dependency where no one can move forward.
```

```
Transaction A
locks Row 1
waits for Row 2
```

while:

```
Transaction B
locks Row 2
waits for Row 1
```

Diagram:

```
A owns → Row 1
A waits → Row 2

B owns → Row 2
B waits → Row 1
```

Neither can proceed. That's a:

```
Deadlock
```

### 37. Idempotency

This is another `must-know production concept` .

```
Idempotency is a property of an operation where applying it multiple times has the exact same effect as applying it once, leaving the system in the same state.
```

```
"An idempotent operation can be executed multiple times without changing the result beyond the initial application."

(Alternative punchy version: "It means making the same call multiple times has the same effect as making it once.")
```

Suppose the client sends:

```
POST /payments
```

The server processes it. But the network dies before the client receives the response. The client doesn't know whether payment succeeded. So it retries:

```
POST /payments
```

Now you could accidentally create:

```
Payment #1
Payment #2
```

for one user action. That's where idempotency comes in.

### 38. Idempotency mental model

An operation is idempotent when:

```
Repeating the same logical request doesn't create additional unintended effects.
```

For payments, use an:

```
idempotency key
```

Example:

```
idempotency-key:
abc-123
```

Server stores:

```
abc-123 → payment result
```

If the same request comes again:

```
abc-123
```

The server recognizes it. Instead of creating another payment:

```
return previous result
```

### 39. Idempotency is not the same as transaction

Important. Transaction solves:

```
database atomicity/consistency
```

Idempotency solves:

```
duplicate logical requests
```

You often need both. For example:

```
POST payment
      ↓
idempotency key
      ↓
database transaction
      ↓
payment created exactly once
```

### 40. Retry strategy

Production systems retry certain failures.

But:

```
Never blindly retry every error.
```

Retrying may make sense for:

```
deadlock
serialization failure
temporary network failure
transient database failure
```

Not necessarily:

```
validation error
unique constraint violation
authentication failure
business rule failure
```

And retries should generally use:

```
bounded attempts
+
backoff
+
jitter
```

rather than an infinite loop.

### 41. The transaction + retry pattern

Conceptually:

```js
for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
  try {
    await runTransaction();
    break;
  } catch (error) {
    if (!isRetryable(error) || attempt === MAX_RETRIES) {
      throw error;
    }

    await backoff(attempt);
  }
}
```

The exact implementation depends on the database driver/framework.

### 42. Critical distinction: retry the transaction, not random individual queries

Assumed:

```
BEGIN

operation A
operation B
operation C

COMMIT
```

If the transaction fails due to a retryable concurrency error, you generally retry the `whole transaction` , because the transaction's state/snapshot/locks are `no longer the same`. Don't randomly rerun:

```
operation B
```

inside a failed transaction.

### 43. Transactions and external services

Here's a production trap. Don't do:

```
BEGIN DB TRANSACTION

charge Stripe
send email
call another API
upload file

COMMIT
```

Why? Because your database transaction cannot atomically control those external systems. You now have a `distributed transaction problem.`

### 43. The outbox pattern

The Transactional Outbox Pattern is a `software design pattern` used to guarantee that a database update and a corresponding event notification `(like publishing a message to RabbitMQ, Kafka, or AWS SNS)` both happen successfully, or `neither happens at all`.

It solves the critical distributed systems problem of keeping your database and your message broker in perfect synchronization.

**The Problem It Solves (The Dual-Write Problem)**

Imagine you are building an e-commerce platform. When a user checks out, your application code needs to do two things:

- Save the new order to your Database `(orders table)`.
- Publish an OrderPlaced event to a Message Broker (Kafka/RabbitMQ) so the shipping service can start packing the box.

If you write this using standard application code, one of two disasters will eventually happen:

- **`Scenario A (DB first, then Broker)`**: You save the order to the database. Right before your code can send the message to Kafka, your server loses power or crashes.
  - _Result: The database has the order, but the shipping service never hears about it. The customer is charged, but their item never ships._

- **`Scenario B (Broker first, then DB):`** You send the message to Kafka first. Kafka acknowledges it. But when your code tries to save to the database, a database unique constraint fails, or the database crashes.
  - _Result: The shipping service ships the item, but your database has no record of the sale. You gave away a free item._

  Because a database transaction and a network call to a message broker cannot be grouped into a single atomic action, you have a `dual-write problem`.

  **How the Outbox Pattern Fixes It?**

  Instead of trying to talk to the database and the message broker at the same time, the Outbox pattern changes the workflow so you only write to the database during the business transaction:
  - You create a special table in your database named `outbox`.
  - Inside a single, `atomic ACID database transaction`, you save your order and insert a text description of the event message into the outbox table. Because database transactions are atomic, either both rows are saved or nothing is.
  - A separate, independent background worker process constantly polls that `outbox` table. It reads the unsent events, publishes them safely to Kafka/RabbitMQ, and marks them as `PROCESSED`.

  Even if the background worker crashes halfway through, it can simply reboot, look at the outbox, and resume publishing where it left off, achieving at-least-once delivery guarantees.

**code example:**

```
// prisma/schema.prisma

model Order {
  id        Int      @id @default(autoincrement())
  userId    Int
  amount    Float
  status    String
}

// 📦 THE OUTBOX TABLE
model Outbox {
  id          String   @id @default(uuid())
  aggregateType String // e.g., "Order"
  eventType   String   // e.g., "OrderPlaced"
  payload     String   // The actual event JSON data stringified
  processed   Boolean  @default(false)
  createdAt   DateTime @default(now())
}

```

```js
// 2. The Application Code (Creating the Order)javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createOrder(userId, amount) {
  try {
    // ⚡ ACID Transaction ensures BOTH records are written or NONE are
    await prisma.\$transaction(async (tx) => {

      // Step 1: Create the actual business record
      const order = await tx.order.create({
        data: { userId, amount, status: 'PENDING' }
      });

      // Step 2: Write the event notification into the same database outbox table
      await tx.outbox.create({
        data: {
          aggregateType: 'Order',
          eventType: 'OrderPlaced',
          payload: JSON.stringify({ orderId: order.id, userId, amount })
        }
      });

      console.log(`🎉 Order ${order.id} and Outbox record saved atomically.`);
    });
  } catch (error) {
    console.error("❌ Transaction failed! Everything rolled back automatically.", error);
  }
}
```

`3. The Relay Worker Code (Running in the background):` This script runs on a separate loop, a cron job, or via a Change Data Capture (CDC) tool like Debezium. Its only job is to move messages from the database table to the real world.

```js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Mock message broker publishing function
async function publishToMessageBroker(eventType, payload) {
  console.log(
    `📤 Sending to RabbitMQ/Kafka -> Event: ${eventType}, Data: ${payload}`,
  );
  // real broker connection logic goes here (e.g., amqplib, kafkajs)
}

async function relayOutboxEvents() {
  // 1. Fetch unprocessed outbox events
  const pendingEvents = await prisma.outbox.findMany({
    where: { processed: false },
    take: 10,
    orderBy: { createdAt: "asc" },
  });

  for (const event of pendingEvents) {
    try {
      // 2. Publish to the real external message broker
      await publishToMessageBroker(event.eventType, event.payload);

      // 3. Mark as processed so it isn't picked up again
      await prisma.outbox.update({
        where: { id: event.id },
        data: { processed: true },
      });
    } catch (brokerError) {
      console.error(
        `Failed to relay event ${event.id}, will retry on next cycle.`,
        brokerError,
      );
      // We break or skip so it retries on the next poll interval
      break;
    }
  }
}

// Poll the database outbox every 2 seconds
setInterval(relayOutboxEvents, 2000);
```

### 45. A complete inventory example

Let's design this properly. Requirement:

```
Product has 1 remaining stock. Two users attempt to purchase simultaneously. Only one should successfully reserve it.
```

**Poor implementation**

```js
const product = await Product.findById(productId);

if (product.stock <= 0) {
  throw new Error("Out of stock");
}

product.stock -= 1;

await product.save();

await Order.create({
  userId,
  productId,
});
```

Race window:

```
READ
  ↓
CHECK
  ↓
MODIFY
  ↓
WRITE
```

### 46. ​​Better approach: atomic reservation

Conceptually:

```js
const result = await Product.updateOne(
  {
    _id: productId,
    stock: { $gt: 0 },
  },
  {
    $inc: { stock: -1 },
  },
);
```

Then:

```js
if (result.modifiedCount !== 1) {
  throw new Error("Out of stock");
}
```

This protects the inventory decrement itself. But now we have another question:

```
What if stock was successfully decremented but creating the order fails?
```

Now:

```
stock - decremented
order ❌
```

That's an inconsistent business state. This is where a `transaction` may be appropriate.

### 47. Transactional inventory flow

Conceptually:

```
BEGIN

1. reserve inventory
2. create order
3. create order items
4. create reservation record

COMMIT
```

If:

```
step 3 fails
```

then:

```
ROLLBACK
```

and inventory returns to its previous transactional state.

### 48. But don’t overuse transactions

This is another production-level judgment. Don't think:

```
"Transactions are safer, therefore every operation should use one."
```

`No`. Transactions have costs:

```
locks
memory
connection usage
restraint
reduced throughput
potential deadlock
longer-running transactions can hurt the system
```

Use a transaction when multiple operations must satisfy a single atomic business operation.

### 49. Database-level concurrency tools

Depending on the database:

```
PostgreSQL
```

You may use:

```
transactions
MVCC
row locks
FOR UPDATE
FOR SHARE
isolation levels
unique constraints
foreign keys
advisory locks
MongoDB
```

You may use:

```
atomic single-document updates
document-level concurrency mechanisms
transactions
unique indexes
optimistic concurrency patterns
```

The exact semantics differ. Never transfer SQL concurrency assumptions directly to MongoDB or vice versa.

### 50. MVCC

Another major concept. MVCC means:

```
Multi-Version Concurrency Control
```

Instead of making every reader wait for every writer, databases can maintain multiple versions/snapshots of data. Conceptually:

```
Version 1
Version 2
Version 3
```

A transaction may read an appropriate snapshot while another transaction writes a newer version. This is one reason modern databases can support substantial concurrent workloads without simply locking everything. PostgreSQL relies heavily on MVCC.

### 51. The bigger mental model

Now connect everything:

```
                 CONCURRENCY
                     │
          ┌──────────┴──────────┐
          │                     │
       Reads                  Writes
          │                     │
          │               shared state
          │                     │
          └──────────┬──────────┘
                     ↓
               Race condition
                     ↓
              Data anomalies
                     ↓
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
   Atomicity      Isolation     Constraints
       │             │             │
   Transactions     Locks       DB rules
       │             │             │
       └─────────────┼─────────────┘
                     ↓
              Correct system

```

### 56. The hierarchy I want you to remember

When designing concurrent systems, think roughly in this order:

```
1. Database constraints
        ↓
2. Atomic operations
        ↓
3. Transactions
        ↓
4. Optimistic concurrency / version checks
        ↓
5. Pessimistic locks
        ↓
6. Stronger isolation
        ↓
7. Idempotency + retries
```

This isn't a universal mandatory sequence. These tools solve different problems and are often combined. For example:

```
UNIQUE constraint
+
transaction
+
idempotency key
+
retry
```

can all coexist.
