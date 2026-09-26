# Production Database Design

### Part 1 — Database Constraints

First we need to understand:

```
What rules should the database itself guarantee?
```

Imagine your application receives:

```
Create user:
email = "rudra@example.com"
```

Your application checks:

```javascript
const existingUser = await User.findOne({ email });

if (existingUser) {
  throw new Error("Email already exists");
}
```

Looks fine. But imagine two requests arriving almost simultaneously with same email and different name. :

```
Request A                 Request B

check email               check email
      ↓                         ↓
not found                  not found
      ↓                         ↓
insert                     insert
```

Now you have duplicates. Because the concern is duplicate email. That's why:

```
Application validation and database constraints are not the same thing.
```

Application validation gives a good user experience. Database constraints provide data integrity .

### 1. Primary Key

Every important entity needs a stable identity.

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100)
);
```

The primary key guarantees:

```
unique
+
not null
```

Conceptually:

```
User
----------------
id        ← identity
name
email
```

Questions we need to understand:

- natural key vs surrogate key
- UUID vs. Integer IDs
- composite primary keys
- why primary keys are indexed
- changing primary keys
- using business values ​​as primary keys
- distributed-system considerations

For example:

```
email
```

is usually not a good primary key even though it is unique. Why? Because:

```
email = business attribute
id    = identity
```

Those are different concepts.

### 2. Foreign Key

Foreign keys protect relationships. Assumed:

```
users
-----
id

orders
------
id
user_id
```

We say:

```
orders.user_id → users.id
```

The database can enforce:

```sql
FOREIGN KEY (user_id)
REFERENCES users(id)
```

Now you cannot accidentally create:

```
order
user_id = 999999
```

when user `999999` doesn't exist. This leads to a very important production concept:

```
Referential integrity
```

The database shouldn't allow relationships that don't make sense.

### 3. What happens when the parent is deleted?

Assumed:

```
User
  ↓
Orders
```

User gets deleted. What happens to their orders? Possible policies:

```
CASCADE
RESTRICT
NO ACTION
SET NULL
```

For example:

```
ON DELETE CASCADE
```

means:

```
delete user
      ↓
delete dependent records
```

But `CASCADE` is not automatically good . For financial/business data:

```
User
 ↓
Order
 ↓
Payment
```

You probably don't want:

```
delete user
→ delete order
→ delete payment
→ destroy business history
```

Instead, you may use:

```
soft deletion
```

or

```
restrict deletion.
```

So we need to learn:

```
Relationship lifecycle design.
```

### 4. UNIQUE

Business uniqueness should usually be protected by the database.Example:

```
email UNIQUE
```

But uniqueness is more interesting than it looks. Consider:

```
users
----------------
email
deleted_at
```

Assumed:

```
rudra@example.com
deleted_at = 2026-09-01
```

Can another user register the same email? That depends on the `business rule`. You might need:

```
UNIQUE(email)
```

or a conditional/partial unique index such as:

```sql
UNIQUE(email) WHERE deleted_at IS NULL
```

depending on the database. This teaches an important lesson:

```
Constraints encode business rules, not merely technical rules.
```

### 5. NOT NULL

Ask:

```
Can this field meaningfully exist without a value?
```

For example:

```
orders.user_id
orders.created_at
orders.total_amount
```

probably shouldn't be nullable. And:

```
users.middle_name
users.avatar_url
```

might be nullable. Don't blindly make everything:

```
NOT NULL
```

or everything `nullable`. The question is:

```
Is absence itself a valid business state?
```

That's the thinking we want.

### 6. CHECK Constraints

Assumed:

```
order.status
```

should only be:

```
pending
confirmed
shipped
delivered
cancelled
```

The database can enforce valid values.

Likewise:

```
quantity > 0
price >= 0
discount >= 0
```

Example:

```sql
CHECK (quantity > 0)
```

This protects against bugs such as:

```
quantity = -50
```

### 7. DEFAULT

Defaults represent `database-level assumptions` . For example:

```
created_at = current timestamp
status = pending
is_active = true
```

But we'll distinguish:

```
database default
```

from:

```
application-generated value
```

because they have different implications. For example, timestamps are often excellent candidates for database defaults.

### Part 2 — Business Invariants

```
An invariant is something that should always remain true .
```

Example:

```
An order must belong to an existing user.
A product price cannot be negative.
A user's email must be unique.
Order quantity must be greater than zero.
A booking cannot have two customers occupying the same unique seat.
```

Now we ask:

```
Which invariants should the database enforce?
```

**Example**

Imagine a booking system. Business rule:

```
One seat cannot be booked twice for the same show.
```

Bad approach:

```
Application checks:
"Is seat A1 available?"
      ↓
yes
      ↓
create booking
```

Two simultaneous requests can both see:

```
available
```

Instead, create a database constraint such as a composite uniqueness rule:

```sql
UNIQUE(show_id, seat_id)
```

Now the database itself guarantees:

```
one show + one seat = one booking
```

That's production thinking.

### Part 3 — Constraints vs Application Validation

We need to clearly separate these.

**Application validation**

Good for:

```
email format
password strength
friendly error messages
request shape
UI validation
```

**Database constraints**

Good for:

```
uniqueness
referential integrity
required fields
valid ranges
business invariants
```

The ideal architecture is:

```
Client
   ↓
API validation
   ↓
Business logic
   ↓
Database constraints
```

Not:

```
Client
   ↓
"Hopefully nobody sends bad data"
   ↓
Database
```

### Part 4 — Indexes

Now we enter the second major pillar. The fundamental question is:

```
How will the application find the data?
```

Assumed:

```
orders
----------------
id
user_id
status
created_at
total
```

And application frequently asks:

```
GET /users/123/orders
```

Query:

```sql
SELECT *
FROM orders
WHERE user_id = 123;
```

If the table has:

```
10 rows
```

Who cares? But if it has:

```
100 million rows
```

we need to think about how the database finds those rows. That's where indexes come in.

### Part 5 — What an Index Actually Is

Read about `sequential scan and index lookup` later. Test it like this :

```sql
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';
```

```
If the table has 10 rows, the output will say Seq Scan (Sequential Scan), proving it ignored your index. If you dump 10,000 dummy rows into that same table and run the exact same query, the output will change to Index Scan.
```

Don't memorize:

```
"Index makes queries faster."
```

Understand the mental model. Without an appropriate index, the database may need to inspect many rows:

```
orders

1
2
3
4
5
6
7
...
100,000,000
```

With an index:

```
index on user_id

user_1 → rows 17, 82, 901
user_2 → rows 4, 73
user_123 → rows 9, 41, 82
...
```

The database has a structure that makes locating relevant records much more efficient. Most relational databases commonly use B-tree-family indexes , though database engines support other index types too.

### Part 6 — Index Is Not Free

This is critical.

An index gives you:

```
faster reads
```

but costs:

```
storage
+
insert overhead
+
update overhead
+
delete overhead
+
maintenance
```

Every time you modify `indexed data`, indexes may need updating. So:

```
Never create indexes simply because a column exists.
```

Create them because you have a `query/access pattern` that benefits from them—or because a constraint requires one.

### Practical Example: The Index Behind the Scenes

Let’s look at a small sample of a Users table stored in physical memory, and how the database builds an index for it.

**1. The Original Table (Unsorted in Storage)**

In physical storage, rows are usually saved in the order they were created. They are identified by a physical address or pointer called a RowID (like a street address).

| RowId(pointer) | id  |  name   |             email |
| :------------- | :-: | :-----: | ----------------: |
| 0x01A          |  1  | Charlie | charlie@gmail.com |
| 0x02B          |  2  |  Alex   |    alex@gmail.com |
| 0x03C          |  3  |  Diana  |   diana@gmail.com |
| 0x04D          |  4  |  Blake  |   Blake@gmail.com |

If you search for `alex@email.com`, the system reads `row 1 (0x01A)`, misses, then reads `row 2 (0x02B)`, and finally finds it. In a massive table, it keeps reading to the very end just in case someone else has that email too.

**2. The Index Created on the email Column**

When you run **`CREATE INDEX idx_users_email ON users(email);`**, the database creates a separate hidden table. It pulls the emails, sorts them alphabetically, and attaches their RowID pointers:

| Email(sorted key) | RowId (pointed to physical row) |
| :---------------- | :------------------------------ |
| alex@gmail.com    | 0x02B                           |
| blake@gmail.com   | 0x04D                           |
| charlie@gmail.com | 0x01A                           |
| diana@gmail.com   | 0x03C                           |

**3. How the Database Uses It**

When you query **`WHERE email = 'alex@email.com':`**

The database looks at the sorted index. Because it is sorted alphabetically, it uses an optimized search algorithm (like binary search) to instantly jump straight to alex@email.com on the very first try.

It sees the pointer `0x02B`.

It bypasses everything else, goes straight to disk address 0x02B, and retrieves Alex's complete row.

### Practical Example: The Orders Index

When a column can have duplicate values `(like a user_id in an orders table),` the database handles it beautifully.

The index is still perfectly sorted by `user_id`, but instead of pointing to just one physical row, the index `groups` all the matching physical row pointers `(RowIDs)` together under that single ID.

**1. The Index Structure Behind the Scenes**

When you create an index on the **`user_id`** column, the database extracts the `IDs`, **`sorts them numerically`**, and maps them to their **`RowIDs`** like this:

| IndexedKey(user_id) | RowId pointers (physical location on disk) |
| :------------------ | :----------------------------------------- |
| user_1              | 0x09, 0x41, 0x82                           |
| user_2              | 0x04, 0x73                                 |
| user_3              | 0x04, 0x73                                 |
| user_123            | 0x09, 0x41, 0x82                           |

_`(Notice that the user_id column is cleanly ordered: 1, 2, 123. This is what allows the "jumping" behavior).`_

**How the Database Engine Searches**

If you run a query to find all orders for `user_2`:

```sql
SELECT * FROM orders WHERE user_id = 'user_2';
```

The database engine executes the search in `two lightning-fast steps`:

**Step 1: Binary Search to the Target (The Jump)**

- Because the `user_id` column in the index is `sorted`, the engine uses Binary Search to skip past `user_1` and jump directly to the `user_2` entry in the index. It does not scan the table row-by-one.

**Step 2: Extract the List of Pointers**

- Once it lands on `user_2`, it sees a `pre-packaged` list of pointers: `[0x04, 0x73]`.It stops searching the index immediately because it knows `user_123` comes next, and there are no more `user_2` entries.
- It goes straight to physical disk addresses 0x04 and 0x73 to pull those two complete order records.

**What if a user has 10,000 orders?**

Even if `user_1` had 10,000 orders, the engine would still jump straight to the start of `user_1` in the index, read the `10,000` sequential pointers right next to it, and instantly go grab those specific rows. It `completely avoids` scanning the rest of the millions of orders belonging to other users.

### Part 7 — Foreign Keys and Indexes

Assumed:

```
orders.user_id → users.id
```

and we frequently query:

```sql
WHERE user_id = ?
```

Then:

```sql
INDEX(user_id)
```

is often appropriate. But there's an important nuance:

```
A foreign key and an index are different things.
```

Foreign key:

```
protects relationship
```

Index:

```
helps locate rows efficiently
```

You can have:

```sql
FOREIGN KEY(user_id)
```

without necessarily having:

```
INDEX(user_id)
```

depending on the database.

### Part 8 — Composite Indexes

This is where index design gets much more interesting. Assumed:

```
GET /users/123/orders
```

And the application does:

```sql
WHERE user_id = 123
ORDER BY created_at DESC
```

Instead of:

```
INDEX(user_id)
```

we might consider:

```
INDEX(user_id, created_at)
```

Now the index corresponds much more closely to the actual `access pattern`. This leads to:

```
Indexes should be designed around queries, not tables.
```

### What is access pattern?

An access pattern refers to the specific way an application reads or writes data in a database. It describes `the questions your application asks most frequently`, how it searches for data, and how it inserts or updates it.

Understanding your access patterns is the single most important factor when designing databases, creating indexes, or deciding between Relational (SQL) and NoSQL systems.

**The 4 Components of an Access Pattern**

When engineers define an access pattern, they look at four key details:

- **`The "How" (Query Type):`** Are you reading a single row, a huge batch of rows, or updating data?

- **`The "What" (Filters):`** What `fields` are you putting in your `WHERE` clause (e.g., searching by user_id, email, or date_range)?

- **`The "Volume":`** How often does this query run? (e.g., 10,000 times a second vs. once a day).

- **`The Read-to-Write Ratio:`** Is your system heavy on reading data (like browsing products) or heavy on writing data (like logging GPS tracking coordinates)?

### Part 9 — Column Order Matters

These are not equivalent:

```
INDEX(user_id, created_at)
INDEX(created_at, user_id)
```

For a B-tree-style composite index, the ordering of columns affects which query patterns can efficiently use the index. Think:

```
(user_id, created_at)
```

roughly:

```
first organize by user_id
then within each user
organize by created_at
```

So this is naturally useful for:

```sql
WHERE user_id = ?
ORDER BY created_at DESC
```

while the reverse ordering has `different strengths`. We'll go deep into the **`leftmost-prefix principle`** .

### Part 10 — Selectivity

Another major concept. Suppose we have:

```
orders.status
```

Possible values:

```
pending
completed
cancelled
```

If 80% of your rows are:

```
completed
```

then `status` may not be highly selective compared to:

```
user_id
```

where millions of users may exist. An index's usefulness depends partly on:

```
How much the condition narrows the candidate rows.
```

But don't reduce index design to `"high cardinality = index.`" .Real query patterns, data distribution, optimizer behavior, and workload all matter

### Part 11 — Indexing status

Your example:

```
INDEX(status)
```

is a good starting point for understanding access patterns. But production thinking asks:

```
How frequently is status queried?
How many rows have each status?
What other filters are normally combined with it?
Is there sorting?
Is pagination involved?
How large is the table?
```

For example, the real query may be:

```sql
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 20
```

Then the index design could be quite different from simply:

```
INDEX(status)
```

### Part 12 — Query-Driven Index Design

This becomes our core workflow. Don't start with:

```
What indexes should this table have?
```

Start with:

```
What queries does the application execute?
```

For example:

**Query A**

```
GET /users/:id/orders
```

SQL:

```sql
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 20
```

Potential index:

```
(user_id, created_at)
```

**Query B**

```
GET /orders/:id
```

Potentially:

```
PRIMARY KEY(id)
```

already handles this. No additional index needed.

**Query C**

```
GET /orders?status=pending
```

Potentially:

```
(status)
```

But we investigate actual workload before deciding.

### Part 13 — Covering Indexes

Eventually we'll reach:

```
Can the database answer the query using only the index without going back to the table?
```

For example, if we frequently need:

```sql
SELECT id, created_at
FROM orders
WHERE user_id = ?
ORDER BY created_at DESC;
```

a suitable index may contain everything needed. This can reduce table access. But covering indexes increase index size, so again:

```
Optimization is a trade-off.
```

### Part 14 — Indexes for Pagination

Production applications often don't do:

```
OFFSET 500000
```

for huge datasets. Instead, we may use:

```
cursor-based pagination
```

For example:

```
created_at
id
```

and query:

```sql
WHERE user_id = ?
AND (created_at, id) < (?, ?)
ORDER BY created_at DESC, id DESC
LIMIT 20
```

This connects directly:

```
pagination design
+
index design
+
query design
```

This is absolutely part of production database engineering.

### Part 15 — Unique Indexes

Another important connection:

```
UNIQUE(email)
```

is often implemented using a unique index internally. So one database structure can provide:

```
data integrity
+
query performance
```

This is why we should understand:

```
constraint
vs
index
```

rather than treating them as unrelated topics.

### Part 16 — Partial / Conditional Indexes

Very useful in production. Imagine:

```
users
---------
email
deleted_at
```

Most users:

```
deleted_at = NULL
```

Maybe you only care about active users. Some databases allow:

```
index only active records
```

This can make indexes smaller and more targeted. The same idea can apply to:

```sql
orders WHERE status = 'pending'
```

depending on database engine and workload

### Part 17 — Indexing Soft Deletes

This is something you'll encounter frequently in real systems.Assumed:

```
is_deleted
```

And:

```
deleted_at
```

exists on many tables. Your application might constantly query:

```sql
WHERE user_id = ?
AND deleted_at IS NULL
```

So the soft-delete strategy can directly influence index design. This is one reason why:

```
Schema design, application behavior, and indexes cannot be designed independently.
```

### Part 18 — Indexes and Sorting

Don't just think about:

```
WHERE
```

Indexes can also help with:

```
ORDER BY
```

For example:

```sql
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 20
```

A good composite index can help both filtering and ordering. This is extremely important for:

```
feeds
admin dashboards
order lists
transaction history
notifications
activity logs
```

### Part 19 — Indexes and Pagination

We'll combine:

```
WHERE
ORDER BY
LIMIT
cursor
```

and learn how to derive the appropriate index. This is where you'll start looking at an endpoint and thinking:

```
"What index does this endpoint need?"
```

rather than:

```
"What indexes should I randomly add?"
```

### Part 20 — Query Plans

You cannot become strong at production indexing without learning:

```
EXPLAIN
EXPLAIN ANALYZE
```

depending on the database. Instead of guessing:

```
"I think this index is being used."
```

You ask the database:

```
How did you execute this query?
```

You learn to inspect things such as:

```
index scan
index seek
table/sequence scan
estimated rows
actual rows
cost
sort
join strategy
```

This is where indexing becomes measurable engineering rather than `intuition`.

### Part 21 — Over-Indexing

A common beginner mistake is:

```
index every column
```

For example:

```
id          INDEX
user_id     INDEX
status      INDEX
email       INDEX
name        INDEX
created_at  INDEX
updated_at  INDEX
...
```

That can be terrible. Why? Because every index has:

```
storage cost
write cost
maintenance cost
```

And indexes can overlap. For example:

```
INDEX(user_id)
INDEX(user_id, created_at)
```

may be redundant depending on workload and database behavior. We need to learn how to identify that.

### Part 23 — Transactions

I would include transactions in Level 6 because production integrity cannot be understood without them. Example:

```
Create order
+
reduce inventory
+
create payment record
```

What happens if:

```
order creation succeeds
inventory update succeeds
payment record fails
```

You could end up with inconsistent state. A transaction gives us atomicity:

```
all succeed
      OR
all roll back
```

We need to understand:

```
ACID
Atomicity
Consistency
Isolation
Durability
```

### Part 24 — Concurrency

প্রযুক্তির ভাষায় যখন বলা হয় দুজন ইউজার "একই সাথে" (Simultaneously) ডাটাবেজে কাজ করছেন, তখন বিষয়টিকে একদম ১ সেকেন্ডের ১০০ ভাগের ১ ভাগ সময়ের ব্যবধানে মিলতে হবে এমন নয়।ধরে নিন, একজন ইউজার একটা কাজ শুরু করলেন যেটা শেষ হতে ৩ সেকেন্ড লাগবে। তিনি কাজ শুরু করার ঠিক ১ সেকেন্ড পরেই আরেকজন ইউজারও একই কাজ শুরু করলেন। এখানে দুজনের কাজের সময়টা ওভারল্যাপ (একই সময়ের ভেতরে পড়া) করেছে। এর ফলে ডাটাবেজে নতুন কোনো আপডেট সেভ হওয়ার আগেই দুজন ইউজারই স্ক্রিনে পুরোনো ডেটা দেখতে পান। ডাটাবেজের ভাষায় একেই কনকারেন্সি (Concurrency) বা রেস কন্ডিশন (Race Condition) এর শুরুর ধাপ বলা হয়।

This is another production-level jump. Imagine:

```
Inventory = 1
```

Two customers simultaneously buy it. Both requests read:

```
inventory = 1
```

Both think:

```
available
```

Now what? This is no longer just schema design. We need:

```
transactions
+
locking
+
isolation
+
atomic updates
+
constraints
```

This connects directly to the production invariant:

```
Inventory must never become negative.
```

**analogy**

Imagine a shop has one remaining product. There is a glass display showing:

```
1 item available
```

Two customers look through the glass at almost the same time.

Customer A says:

```
"I want it."
```

Customer B says:

```
"I want it."
```

Both can see the same item. Why?

```
Because looking at something doesn't make it disappear.
```

The actual problem happens when both try to **`claim`** it. That's exactly what concurrency bugs are about.

### Part 25 — Race Conditions

We'll study scenarios such as:

```
double booking
double payment
duplicate coupon usage
inventory overselling
duplicate username
duplicate order processing
```

and ask:

```
Which layer prevents the race?
```

Sometimes:

```
application logic
```

Sometimes:

```
database constraint
```

Sometimes:

```
transaction
```

Sometimes:

```
locking
```

Usually:

```
combination
```

### সব কনকারেন্সিতে রেস কন্ডিশন হয় না, তবে রেস কন্ডিশন হওয়ার জন্য কনকারেন্সি থাকা আবশ্যক। what does it mean? give me example

Simple idea:

```
Concurrency থাকলেই Race Condition হবে—এমন না। কিন্তু Race Condition হতে হলে একাধিক operation-এর overlapping/concurrent execution থাকতে হবে।
```

**1. আগে Concurrency বুঝি**

ধরো, তোমার কাছে দুইটা কাজ আছে:

```javascript
async function taskA() {
  await delay(1000);
  console.log("Task A done");
}

async function taskB() {
  await delay(500);
  console.log("Task B done");
}

taskA();
taskB();
```

এখানে `taskA()` আর `taskB()` একই সময়ে চলার সুযোগ পাচ্ছে। এটাই concurrency । কিন্তু এখানে কোনো Race Condition নেই।

আর `taskA` একে `taskB` অপরের কোনো `shared data/state` পরিবর্তন করছে না।

**2. তাহলে Race Condition কখন হয়?**

ধরো, একটা shared variable আছে:

```javascript
let balance = 100;
```

দুইটা operation একই balance পরিবর্তন করতে চাচ্ছে:

```javascript
async function withdraw(amount) {
  const currentBalance = balance;

  await delay(100);

  balance = currentBalance - amount;
}
```

এখন:

```
withdraw(80);
withdraw(50);
```

দুইটা competitor withdrawal ভাবে চলছে। Possible execution:

```
Initial balance = 100

Withdraw A → reads balance = 100
Withdraw B → reads balance = 100

Withdraw A → writes 20
Withdraw B → writes 50
```

শেষে:

```
balance = 50
```

কিন্তু দুইটা withdrawal মোট:

```
80 + 50 = 130
```

অর্থাৎ balance `-30` হওয়া উচিত ছিল, অথবা অন্তত দ্বিতীয় reject withdrawal হওয়া উচিত ছিল। এখানে সমস্যা হলো দুইটা concurrent operation একই shared state-এর ওপর নির্ভর করছে এবং তাদের execution order ফলাফলকে পরিবর্তন করছে। এটাই `Breed Condition`।

সবচেয়ে important distinction এভাবে মনে রাখো:

```
Concurrency
    ↓
Multiple operations overlap
    ↓
Do they share/change the same state?
    ↓
No → Race condition নাও হতে পারে
    ↓
Yes
    ↓
Does timing/order affect the result?
    ↓
Yes → Race Condition
```

**Example 1 — Concurrency আছে, Race Condition নেই**

```
fetchUser();
fetchProducts();
```

দুটো request concurrently চলছে। কিন্তু:

```
User data ← আলাদা
Product data ← আলাদা
```

তাই একটার timing অন্যটার result পরিবর্তন করছে না।

Concurrency ✅
Race Condition ❌

**Example 2 — Concurrency + Race Condition**

```javascript
let stock = 1;

async function buyProduct() {
  const available = stock;

  await delay(100);

  if (available > 0) {
    stock = stock - 1;
    console.log("Purchase successful");
  }
}

buyProduct();
buyProduct();
```

দুইজন একই সময়ে শেষ available product কিনতে চাচ্ছে। দুজনই দেখতে পারে:

```
stock = 1
```

তারপর দুজনই purchase successful করতে পারে। বাস্তবে stock ছিল মাত্র 1।

```
Concurrency ✅
Shared state ✅
Timing-dependent result ✅
Race Condition ✅
```

One-line mental model

```
Concurrency means “একাধিক কাজ একই সময়ে এগোচ্ছে।”
Race Condition means “এই competitor কাজগুলোর কে আগে/পরে execute করল তার ওপর ভুল বা unexpected result নির্ভর করছে।”
```

### Part 26 — Isolation Levels

We'll eventually understand:

```
Read Uncommitted
Read Committed
Repeatable Read
Serializable
```

and phenomena such as:

```
dirty reads
non-repeatable reads
phantom reads
```

But we won't memorize definitions. We'll derive them through real situations.

### Part 27 — Deadlocks

Once transactions and locks exist, another production problem appears:

```
Transaction A locks X
Transaction B locks Y

A wants Y
B wants X
```

Now:

```
A waits for B
B waits for A
```

**`Deadlock.`**

Production systems must therefore consider:

```
consistent lock ordering
short transactions
retry strategies
appropriate isolation
```

### Part 28 — Data Types Are Part of Production Design

We shouldn't ignore data types. For example:

```
price
```

should not casually become:

```
FLOAT
```

for financial calculations. Depending on the database/application architecture, you may use:

```
DECIMAL / NUMERIC
```

or an integer representation such as:

```
amount_in_cents
```

Similarly:

```
timestamps
IDs
JSON
enums
booleans
text
binary
```

all have design implications.

### Part 29 — Time and Timestamps

Production systems need to think about:

```
created_at
updated_at
deleted_at
published_at
expires_at
```

Questions:

```
UTC or local time?
Who generates timestamps?
Can timestamps change?
Do we need immutable event time?
How do we index time?
```

For distributed systems, time becomes particularly interesting.

### Part 30 — Historical Data

Assumed:

```
Product
price = $100
```

The customer buys it. Later:

```
price = $150
```

Should the old order now display:

```
$150
```

Obviously, the historical order needs to preserve what actually happened. So:

```
Product.current_price
```

and:

```
OrderItem.unit_price
```

have different meanings. This is why production database design requires thinking about:

```
Current state vs historical facts.
```

### Part 31 — Mutable vs Immutable Data

We should ask:

```
Can this value change?
```

For example:

```
user.name
```

can change.

And:

```
order.created_at
payment.completed_at
order_item.unit_price
```

may represent historical facts that shouldn't simply be overwritten. This becomes extremely important for:

```
auditing
finance
orders
payments
logs
events
```

### Part 32 — Audit Columns

Production tables commonly need things like:

```
created_at
updated_at
created_by
updated_by
deleted_at
```

depending on the business. For sensitive operations:

```
who changed what?
when?
```

may require a separate:

```
audit_logs
```

table.

### Part 33 — Soft Delete

We'll examine:

```
hard delete
vs
soft delete
```

and understand when each is appropriate. Soft delete isn't automatically `"production best practice.`"

It creates consequences:

```
every query may need deleted_at filtering
unique constraints become complicated
indexes become more complicated
storage grows
relationships become more complicated
```

So the correct question isn't:

```
"Should I always use soft delete?"
```

It's:

```
"Does this domain require recoverability/history/non-destructive deletion?"
```

### Part 35 — Denormalization

Instead of calculating:

```
order total
```

every time from:

```
order_items
```

you might store:

```
orders.total_amount
```

But now you have an invariant:

```
orders.total_amount
=
SUM(order_items...)
```

That introduces a consistency problem. So whenever we denormalize, we should ask:

```
What new invariant did we create?
```

This is a fantastic production-design outfit.

### Part 36 — Database Constraints as Safety Nets

This gives us a powerful architecture:

```
Application
    ↓
business logic
    ↓
transaction
    ↓
database constraints
    ↓
persistent state
```

The database is the final guardian of important invariants. Not every business rule belongs in the database. But important data integrity rules often should.

### Part 37 — N+1 Query Problem

Since you're working with APIs, this is very relevant. Assumed:

```
GET /orders
```

returns:

```
100 orders
```

Then the application does:

```
1 query → orders
```

```
100 queries → user for each order
```

Total:

```
101 queries
```

That's the:

```
N+1 query problem.
```

We'll learn how relationships, joins, eager loading, batching, and indexes interact.

### Part 38 — Query Patterns From API Endpoints

This is where I want you to develop a production habit. Whenever you design:

```
GET /users/:id/orders
```

don't stop at:

```
orders.user_id
```

Think:

```
What SQL?
What filters?
What sorting?
What pagination?
How many rows?
How often?
What index?
What response shape?
```

For example:

```
GET /users/:id/orders
```

might translate into:

```sql
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 20
```

which suggests thinking about:

```
(user_id, created_at)
```

Now you're designing from the workload .

### Part 39 — Read vs. Write Workload

Different systems have different workloads.

```
Read-heavy
social feed
product catalog
news site
```

May tolerate more indexes/caching/denormalization.

```
Write-heavy
telemetry
logging
high-volume events
```

Too many indexes can become expensive. Therefore:

```
There is no universal "best schema."
```

There is a schema appropriate for a particular:

```
domain
+
invariants
+
workload
+
scale
```

Things to cover :
**6.1 — Constraints**

```
PK
FK
UNIQUE
NOT NULL
CHECK
DEFAULT
composite constraints
conditional uniqueness
referential actions
business invariants
application validation vs DB enforcement
```

**6.2 — Index Fundamentals**

```
what an index actually is
B-tree mental model
index lookup
selectivity/cardinality
index cost
primary-key indexes
unique indexes
foreign-key indexes
```

**6.3 — Composite Indexes**

```
(A, B)vs(B, A)
leftmost-prefix principle
equality + range
filtering + sorting
ORDER BY
LIMIT
covering indexes
index-only scans
```

**6.4 — Query-Driven Design**

```

Take actual API endpoints:

GET /users/:id/orders
GET /orders?status=pending
GET /products?category=...
GET /orders/:id
GET /users/:id/transactions
```

and derive indexes from them.

**6.5 — Query Plans**

```
EXPLAIN
EXPLAIN ANALYZE
scans
usage index
joins
sorting
estimated vs actual rows
diagnosing slow queries
```

**6.6 — Transactions & ACID**

```
atomicity
consistency
insulation
durability
commit
rollback
transaction boundaries
```

**6.7 — Concurrency**

```
race conditions
lost updates
double booking
inventory race
locks
isolation levels
deadlocks
retry strategies
```

**6.8 — Production Data Lifecycle**

```
soft deletion
historical data
audit logs
timestamps
immutable facts
current state vs history
retention/archive strategies
```

**6.9 — Performance Design**

```
N+1
paging
cursor pagination
read/write workload
denormalization
caching boundaries
redundant indexes
over-indexing
```
