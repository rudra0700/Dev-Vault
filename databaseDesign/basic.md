# Database Design

Things that we will cover. It will be a mental model :

```
1. Learn to see the business
```

```
Production database design is not primarily a database skill. It's a problem-modeling skill.
```

Once you can reliably transform:

```
Business → Rules → Things → Relationships → Data → Constraints → Access patterns → Schema
```

you can design databases for almost anything.

### Level 1 — Learn to SEE the business

```
Before tables.
Before collections.
Before SQL.
Before MongoDB.
```

You have to learn to read a project requirement and extract:

```
Actors
Entities
Attributes
Actions
Relationships
Business rules
State changes
Ownership
Constraints
Historical data
Transactions
```

For example:

```
A customer places orders.
An order contains multiple products.
A product belongs to a category.
Customers can have multiple addresses.
An order can be canceled before shipment.
```

Don't think:

```
usertable
orderstable
productstable...
```

Instead think:

```javascript
Who? //Customer
What? // Product, Order, Category, Address
What happens? //Customer places Order.
What relationship? // Order contains Products.
What are the rules? //An order can be canceled only before shipment.
```

### Level 2 — Entity Identification

**`Entity`**

An entity in database design is a `real-world object, place, person, event, or concept` that has a `distinct`, `independent existence` and about which data can be `stored`

```
Something the system needs to remember independently.
```

Example:

```
User
Product
Order
Payment
Address
Category
```

**`Attribute`**

```
Something describing an entity.
```

```
User
 ├── id
 ├── name
 ├── email
 └── createdAt

```

**`Relationship`**

```
How entities interact.
```

```
User ───── places ───── Order
```

**`Event/Transaction`**

```
Something that happened.
```

```
Payment
OrderPlaced
Shipment
Refund

```

**`Value Object`**

```
Something meaningful but not necessarily independently managed.
```

```
Address
Money
Coordinates
DateRange
```

### Level 3 — Relationship Mastery

**`1 → 1`**`

```
User ─── Profile
```

**`1 → Many`**

```
Customer ───< Orders
```

**`Many → Many`**

```
Order >───< Product
```

Then, Many-to-many usually becomes an intermediate entity.

```
Order
   │
   │
   ▼
OrderItem
   ▲
   │
   │
Product
```

So instead of:

```
Order
 └── products[]
```

you may have:

```
Order
OrderItem
Product
```

And then you ask:

```
Does the relationship itself have information?
```

If yes, that's a giant clue that the relationship deserves its own entity. For example:

```
OrderItem
- orderId
- productId
- quantity
- unitPrice
- discount
```

Now you understand why that table exists.

Not:

```
“Because database tutorials said so.”
```

### Level 4 — Cardinality + Optionality

You need to be able to say:

```
User 1 ──── N Orders
```

but also:

```
Order ──── 1 Customer
```

and:

```
Customer ──── 0..N Orders
```

And:

```
Order ──── 1..N OrderItems
```

versus:

```
Order ──── 0..1 Payment
```

That distinction matters enormously. You'll learn to ask:

```
Can this exist without the other?
Is this relationship mandatory?
How many can exist?
```

These questions determine your schema.

### Level 5 — Normalization

Now we enter serious relational design. You'll learn:

**1NF**

Atomic values.

**2NF**

Remove partial dependency.

**3NF**

Remove unnecessary transitive dependency.

But I don't want you memorizing definitions. I want you to understand why normalization exists. Suppose you do this:

```
orders

id
customer_name
customer_email
product1
product2
product3
```

Problems appear immediately. Then:

```
orders

id
customer_id
customer_name
customer_email
```

Still problematic if customer information belongs to customers. Eventually:

```
customers
orders
order_items
products
```

You should be able to derive this structure from the business , not memorize it.

### Level 6 — Production Database Design

This is where we move beyond classroom ER diagrams. You learn:

**Constraints**

```
PRIMARY KEY
FOREIGN KEY
UNIQUE
NOT NULL
CHECK
DEFAULT
```

And understand:

```
The database should protect business invariants whenever practical.
```

For example:

```
users.email UNIQUE
```

instead of trusting application code to prevent duplicates.

**Indexes**

This is critical. A schema isn't production-ready simply because the relationships are correct. You need to think:

```
How will the application query this data?
```

For example:

```
GET /users/:id/orders
```

might lead you toward:

```
INDEX orders(user_id)
```

Then:

```
GET /orders?status=pending
```

might require thinking about:

```
INDEX orders(status)
```

And perhaps:

```
INDEX orders(user_id, created_at)
```

depending on the actual query patterns. This introduces a major principle:

```
Database design is influenced by access patterns.
```

### Level 7 — Transactions + Concurrency

Now things become genuinely production-level. Imagine:

```
User buys last product.
```

Two users make the request simultaneously. Both see:

```
stock = 1
```

Both attempts:

```
stock = stock - 1
```

Now you have a concurrency problem. You'll learn:

```
ACID
Transactions
Insulation levels
Race conditions
Locks
Optimistic concurrency
Pessimistic locking
Atomic updates
Deadlocks
Idempotency
```

And you'll understand when database design itself can prevent bugs .

### Level 8 — Complex System Design

Finally, we'll attack systems where database design becomes genuinely challenging. We'll design databases for things like:

**E-commerce**

```
User
Address
Product
Category
Inventory
Cart
CartItem
Order
OrderItem
Payment
Shipment
Coupon
Review
Refund
```

But the important part isn't the number of tables. We'll derive every one.

**Ride Booking**

This is especially useful for you because you've already worked on one. We might model:

```
User
DriverProfile
Vehicle
Ride
RideStatusHistory
Payment
DriverLocation
Rating
```

Then ask:

```
Why is it RideStatusHistory separate?
Should current status be stored on Ride?
Should driver location live in PostgreSQL?
What needs historical records?
What happens when a driver accepts a ride?
What happens if two drivers accept simultaneously?
```

Now you're doing real database engineering .

**Social Media**

```
User
Post
Comment
Like
Follow
Media
Notification
Conversation
Message
```

Then we attack:

```
Should likes be embedded?
Should comments be embedded?
How do you model follow relationships?
How do you prevent duplicate likes?
How do you efficiently retrieve a user's feed?
```

**Banking / Wallet**

Now we introduce concepts such as:

```
Account
Transaction
LedgerEntry
Transfer
Balance
```

And you'll discover why financial systems often require very different modeling decisions than a CRUD application.

# MOST important thing

```
Memorizing 100 database concepts won't solve your problem.
```

Instead, we're going to build a **`repeatable database-design algorithm`** . Whenever you receive a new project, you'll run this process.

### Your Database Design Algorithm

**`Step 1 — Understand the business`**

Ask:

```
What does this system actually do?
```

Not:

```
What tables do I need?
```

**`Step 2 — Identify actors`**

```
Who interacts with the system?
```

```
Customer
Admin
Driver
Seller
Employee
```

**`Step 3 — Extract nouns`**

From the requirements:

```
Customer creates an order containing products and countries using a payment method.
```

Potential entities:

```
Customer
Order
Product
Payment
PaymentMethod
```

But don't immediately create tables .

**`Step 4 — Extract verbs`**

```
Customer → creates → Order
Order → contains → Product
Customer → makes → Payment
```

Now relationships begin appearing.

**`Step 5 — Find business rules`**

Example:

```
An order must contain at least one item.
```

That's a rule.

```
An email must be unique.
```

That's a constraint.

```
An order cannot be canceled after shipment.
```

That's a state/business rule. These rules influence your design.

**`Step 6 — Determine ownership`**

Ask:

```
Who owns this data?
```

For example:

```
Order
 └── OrderItems
```

An **`OrderItem`** usually doesn't make much sense independently from its order. That's an ownership clue.

**`Step 7 — Determine cardinality`**

```
Customer 1 ─── N Orders
Order 1 ─── N OrderItems
Product 1 ─── N OrderItems
```

**`Step 8 — Decide entity boundaries`**

Now ask:

```
Does this thing deserve independent existence?
```

This is where the:

```
“How many tables?”
```

question gets answered. Not by a fixed number.

**`Step 9 — Model the data`**

Only now:

```
customers
orders
order_items
products
payments
```

**`Step 10 — Normalize`**

Look for:

```
duplicated data
repeating groups
update anomalies
unnecessary dependencies
unclear ownership
```

**`Step 11 — Add constraints`**

```
PK
FK
UNIQUE
NOT NULL
CHECK
```

**`Step 12 — Think about questions`**

Ask:

```
What will the application frequently read?
```

For example:

```
Get user's recent orders
Get pending orders
Get product reviews
Get driver's active ride
```

Then design indexes based on actual access patterns.

**`Step 13 — Think about transactions`**

Ask:

```
Which operations must succeed or fail together?
```

For example:

```
Create order
+
Create order items
+
Reduce inventory
+
Create payment record
```

Maybe these require transactional coordination.

**`Step 14 — Think about competition`**

Ask:

```
What happens if two requests happen at exactly the same time?
```

This is where production thinking starts.

**`Step 15 — Validate the design`**

Ask:

```
Can I insert the data correctly?
Can I update it safely?
Can I delete it safely?
Can I prevent invalid states?
Can I query common use cases efficiently?
Am I duplicating data unnecessarily?
Am I creating unnecessary entities?
What happens at 1 million records?
What happens at 100 million?
What happens under concurrent requests?
```

That's database design mastery.

# Learn in a specific order Not randomly.

### Phase 1 — Mental Model

```
What is data modeling?
Entity
Attribute
Relationship
Entity vs attribute
Entity vs event
Entity vs. value object
Ownership
Cardinality
Optionality
```

### Phase 2 — Relational Modeling

```
Primary keys
Foreign keys
Composite keys
Natural vs. Surrogate Keys
1:1
1 :N
M :N
Junction tables
Self-referencing relationships
Recursive relationships
```

### Phase 3 — Normalization

```
1NF
2NF
3NF
BCNF
Functional dependency
Update anomaly
Insert anomaly
Delete anomaly
When denormalization makes sense
```

### Phase 4 — Production Design

```
Constraints
Indexes
Composite indexes
Query-driven design
Transactions
ACID
Insulation
Locking
Concurrency
Idempotency
Soft delete
Audit history
Temporal data
```

### Phase 5 — Real Systems

```
Authentication system
E-commerce
Ride booking
Social media
Job portal
Learning platform
Booking system
Inventory
Payment/wallet
Messaging
Notification system
```

### Phase 6 — Advanced

```
Polymorphic relationships
Event history
State machines
Geospatial data
Partitioning
Sharding
Replication
Read/write separation
Caching
Redis alongside database
Eventually consistent data
Distributed transactions
CQRS
Event sourcing
Data warehousing
```

# You should be explain these :

```
They're impressive because they can explain:

Why does this entity exist?

Why this relationship exists.

Why this data is stored here.

Why this should not be duplicated.

Why this relationship is one-to-many.

Why this needs an index.

Why this operation needs a transaction.

Why this historical data must be preserved.

Why this part should be normalized.

Why this particular part can be denormalized.
```
