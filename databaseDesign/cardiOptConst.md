# Cardinality , optionality, constraint

```javascript
// Goal
business rule → cardinality → optionality → constraints → actual PostgreSQL design .
```

### 1. What Exactly Is Cardinality?

```
Cardinality describes how many instances of one entity can be associated with one instance of another entity.
```

Assumed:

```
Customer ───── Order
```

Ask two questions.

**Question A**

```
How many Orders can one Customer have?
```

Possibly:

```
0
1
10
1000
...
```

So:

```
Customer → 0..N Orders
```

**Question B**

```
How many Customers can one Order belong to?
```

Usually:

```
exactly 1
```

So:

```
Order → exactly 1 Customer
```

Therefore:

```
Customer 0..N ───── 1 Order
```

This is much more precise than simply saying:

```
1:N
```

### 2. Cardinality vs Optionality

This distinction is critical . People often mix them together.

Cardinality Answers:

```
How many?
```

Optionality Answers:

```
Is participation required?
```

Consider:

```
User ───── Profile
```

Maybe:

```
A User can have at most one Profile.
A Profile must belong to exactly one User.
```

Then:

```
User    → 0..1 Profile
Profile → 1 User
```

Here:

```javascript
0; // means optional
```

```javascript
1; // means mendatory
```

So:

```javascript
0..1 // zero or one
1..1 // exactly one
0..N // zero or many
1..N // one or many
```

### 3. The Four Most Important Multiplicities

Memorize these conceptually , not mechanically.

```javascript
// Multiplicity	Meaning
0..1	zero or one
1..1	exactly one
0..N	zero or many
1..N	one or many
```

Examples:

```javascript
User → Profile
0..1
// means A user may not have a profile but if have it has to be exactly one .
```

```javascript
Order → Customer
// means Every order must have a customer.
1..1
```

```javascript
Customer → Orders
0..N
// means A new customer may have no orders but if have it can have many .
```

```javascript
Order → OrderItems
1..N
// means An order must contain at least one line item (a product).
```

That last one is particularly interesting because a normal foreign key alone cannot enforce it . We'll get to that.

### 4. The Two Sides Must Always Be Analyzed Separately

Assumed:

```
Customer ───── Order
```

Don't say:

```
"It's one-to-many."
```

Instead write:

```
Customer → Orders
0..N

Order → Customer
1
```

Now you understand the actual rule

### 5. Example: Customer → Order

Requirement:

```
A customer may place multiple orders. But every order must belong to a customer.
```

Derivation:

```
Customer → 0..N Orders
Order → exactly 1 Customer
```

Diagram:

```
Customer
   │
   │ 0..N
   ▼
 Order
```

Database:

```sql
CREATE TABLE customers (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
);
```

Why **`NOT NULL`**? Because:

```
Order → exactly 1 Customer
```

Why no **`UNIQUE(customer_id)`**? Because:

```
Customer → 0..N Orders
```

`Multiple orders` must be allowed.

### 6. How UNIQUE Changes Cardinality

This is one of the most important connections.Assumed:

```sql
CREATE TABLE profiles (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE
);
```

The **`UNIQUE`** means:

```
one user_id
   ↓
cannot appear twice
```

Therefore:

```
User → maximum 1 Profile
```

Without **`UNIQUE`**:

```
user_id
-------
10
10
10
```

A user could have three profiles. So:

```
FOREIGN KEY
```

says:

```
The referenced parent must exist.
```

While **`UNIQUE`** can say:

```
This parent can be referenced by at most one child.
```

Together:

```
FK + UNIQUE
```

can implement a **`1:1`** relationship.

### 7. NOT NULL Controls Mandatory Participation

Consider:

```sql
customer_id BIGINT NOT NULL
```

This means:

```
Every Order row must have a customer_id.
```

Therefore:

```
Order → exactly 1 Customer
```

If you instead have:

```
customer_id BIGINT
```

then:

```
customer_id = NULL
```

is allowed. Therefore:

```
Order → 0..1 Customer
```

assuming the FK exists but this is dangerours. `Dont assume anything`. So:

```
NOT NULL
```

is often the database-level expression of mandatory participation .

### 8. But NULL Has Subtle Behavior

Assumed:

```sql
customer_id BIGINT REFERENCES customers(id)
```

Because it's nullable, this is allowed:

```
customer_id = NULL
```

Now :

```
customer_id = 999
```

is rejected if Customer 999 doesn't exist. So:

```
NULL
```

doesn't mean:

```
"Invalid customer."
```

It means:

```
"There is currently no customer value recorded here."
```

That's why you must understand the business meaning before deciding whether a foreign key should be nullable.

### 9. One-to-One: Required vs Optional

Consider:

```
User ───── Profile
```

**Case A**

Every User `must have` exactly one Profile.

```
User → 1 Profile
Profile → 1 User
```

But implementing this perfectly is slightly harder than:

```sql
profiles.user_id NOT NULL UNIQUE
```

because that guarantees:

```
Every profile has a user.
```

but doesn't automatically guarantee:

```
Every user has a profile.
```

This distinction is subtle and very important .

### 10. Foreign-Key Constraints Usually Protect the Child Side

If:

```
profiles.user_id → users.id
```

The FK guarantees:

```
Profile → valid User
```

It doesn't automatically guarantee:

```
Every User → Profile
```

Why? Because the database can contain:

```
users
-----
1
2
3

profiles
--------
user_id
1
2
```

User 3 has no profile. The FK is perfectly happy. So:

```
A foreign key doesn't automatically enforce minimum participation on the parent side.
```

This is one reason some business rules require `additional application logic, transactions, triggers, or different schema designs`.

### 11. A powerful rule about relationship

When designing a relationship, separate:

**Maximum cardinality**

Usually enforced through:

```
UNIQUE
```

**Minimum cardinality**

Often enforced through:

```
NOT NULL
```

but sometimes requires more. For example:

```
Order → 1..N OrderItems
```

**`order_id NOT NULL`** guarantees:

```
Every OrderItem belongs to an Order.
```

But it doesn't guarantee :

```
Every Order has at least one OrderItem.
```

That's a different direction.

### 12. This Is a Huge Production Insight

Assumed:

```
Order 1 ─────< OrderItem
```

Requirement:

```
Every order must contain at least one item.
```

You might write:

```sql
order_id BIGINT NOT NULL
```

and think you're done. But You're not. This prevents:

```
OrderItem without Order
```

But it doesn't prevent:

```
Order without OrderItem
```

You need another mechanism to enforce that rule. Common approaches include:

- application/service-layer transaction logic
- deferred constraints in appropriate designs
- database triggers when the invariant truly belongs in the database
- schema/workflow design that prevents incomplete orders from becoming a finalized state

In production, often the business rule is:

```
Draft Order → may have 0 items
Confirmed Order → must have ≥1 item
```

That's actually better modeling.

**Code Example**

Let's look at how the SQL code is structured and where the loophole happens.

**`1. The Setup (What you might write)`**

```sql
-- Create the Order table first
CREATE TABLE Orders (
    order_id BIGINT PRIMARY KEY,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

```sql
-- Create the OrderItem table
CREATE TABLE OrderItems (
    item_id BIGINT PRIMARY KEY,
    -- This NOT NULL ensures every item belongs to a valid order
    order_id BIGINT NOT NULL,
    product_name VARCHAR(100),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);
```

**`2. Why you think you're done (The Good Case)`**

If you try to insert a rogue item without a valid order, the database blocks it:

```sql
-- This will FAIL because order_id 999 does not exist
INSERT INTO OrderItems (item_id, order_id, product_name)
VALUES (1, 999, 'Laptop');
```

**`3. The Loophole (The Bad Case)`**

Because the `Orders` table knows absolutely nothing about the `OrderItems` table, you can create a completely "empty" ghost order:

```sql
-- This SUCCESSFULY creates an order with no items!
INSERT INTO Orders (order_id) VALUES (42);

-- If you run: SELECT * FROM OrderItems WHERE order_id = 42;
-- Result: 0 rows returned. (An empty order, which violates your rule!)
```

### 13. State Can Change the Cardinality Rule

Instead of saying:

```
An Order must always have one or more OrderItems.
```

Maybe the real rule is:

```
DRAFT
  → 0..N items

CONFIRMED
  → 1..N items
```

Now your domain model is much more realistic. This is why database design cannot be separated from business workflow.

### 14. One-to-One in Production

`1:1` relationships are often used for:

**Optional profile/details**

```
User ───── 0..1 Profile
```

**Sensitive/private data separation**

```
Employee ───── 0..1 EmployeePrivateData
```

**Different lifecycle**

```
Account ───── 0..1 Subscription
```

**Specialization**

```
User
 ├── PatientProfile
 ├── DoctorProfile
 └── AdminProfile
```

But don't create `1:1` tables just because:

```
"We can split this table."
```

There should be a reason:

- different lifecycle
- security/access boundary
- sparse/optional attributes
- organizational boundary
- subtype/specialization
- operational reasons

### 15. One-to-Many in Production

Most application relationships are some form of:

```
Parent 1 ─────< Child
```

Examples:

```
Customer ─────< Order
Order ────────< OrderItem
Doctor ───────< Appointment
Post ─────────< Comment
Organization ─< UserMembership
```

The normal implementation:

```
child.parent_id
```

with:

```
FOREIGN KEY
```

and usually:

```
INDEX(parent_id)
```

### 16. Why Index Foreign Keys?

Assumed:

```
orders.customer_id
```

You frequently ask:

```sql
SELECT *
FROM orders
WHERE customer_id = 100;
```

An index helps:

```sql
CREATE INDEX idx_orders_customer_id
ON orders(customer_id);
```

But here's an important industry nuance:

```
A foreign key does not automatically mean you should blindly create a standalone index in every database.
```

PostgreSQL doesn't automatically create an index on the referencing column merely because you declare a foreign key.

Whether you need one depends on:

- query patterns
- join frequency
- delete/update behavior on parent rows
- table size
- existing composite indexes

For common parent-child lookups, indexing the FK is often appropriate.

### 17. Composite Indexes Matter Too

Suppose you frequently query:

```sql
WHERE customer_id = ?
ORDER BY created_at DESC
```

A useful index may be:

```sql
CREATE INDEX idx_orders_customer_created
ON orders(customer_id, created_at DESC);
```

This is different from simply:

```sql
INDEX(customer_id)
```

Relationship design eventually connects directly to query design and indexing .

### 18. Many-to-Many Cardinality

Assumed:

```
Student ───── Course
```

Requirement:

```
A student can enroll in many courses, and a course can have many students.
```

Therefore:

```
Student → 0..N Courses
Course → 0..N Students
```

Database:

```
students
courses
enrollments
```

And:

```
enrollments
------------
student_id
course_id
```

Usually:

```sql
PRIMARY KEY (student_id, course_id)
```

if one student can have only one current enrollment in a course. That constraint is important.Without it:

```
student_id | course_id
-----------|----------
1          | 10
1          | 10
1          | 10
```

You accidentally allow duplicate relationships.

### 19. UNIQUE Composite Is a Relationship Constraint

Even if you use a surrogate ID:

```
enrollments
-----------
id
student_id
course_id
```

you might still need:

```sql
UNIQUE(student_id, course_id)
```

because:

```
id
```

prevents duplicate IDs, but doesn't prevent:

```
student 1 + course 10
```

from occurring `multiple times`. This is a crucial production lesson:

```
Primary keys identify rows. Business uniqueness constraints protect business rules.
```

Those are not always the same thing.

### 20. Primary Key vs Unique Constraint

**Primary key**

```
What uniquely identifies this row?
```

Example:

```
order.id
```

**Unique constraint**

```
What combination of values ​​must never be duplicated?
```

Example:

```
membership(user_id, organization_id)
```

These are different questions.

### 21. Natural Key vs. Surrogate Key

Assumed:

```
users.email
```

should be `unique`. You might have:

```sql
id BIGINT PRIMARY KEY,
email TEXT NOT NULL UNIQUE
```

Here:

```
id
```

is the surrogate identifier.

```
email
```

has a business uniqueness rule. Don't assume:

```
"If something is unique, it should be the primary key."
```

The identifier and the business constraint serve different purposes.

### 22. Optionality in Many-to-Many

Consider:

```
Student 0..N ───── 0..N Course
```

This means:

- The student may have no courses.
- Course may have no students.

The join table naturally allows that. But if the business says:

```
Every active student must be enrolled in at least one course.
```

That's not automatically enforced by the `junction table`. Again:

```
minimum participation
```

can be harder than:

```
maximum participation
```

### 23. Constraint Types You Need to Master

Now let's build your production constraint toolbox.

**PRIMARY KEY**

Guarantees row identity.

```sql
id BIGINT PRIMARY KEY
```

Conceptually:

```
unique + not null
```

for the key.

**FOREIGN KEY**

Guarantees referential integrity.

```sql
customer_id BIGINT
REFERENCES customers(id)
```

Meaning:

```
Order.customer_id
       ↓
must reference an existing Customer
```

unless nullable and set to NULL.

**NOT NULL**

Guarantees a value must exist.

```sql
email TEXT NOT NULL
```

This is about `presence` , not `correctness`.

**UNIQUE**

Guarantees uniqueness.

```sql
email TEXT UNIQUE
```

or:

```sql
UNIQUE (organization_id, email)
```

**CHECK**

Guarantees subject to conditions.

```sql
quantity INTEGER CHECK (quantity > 0)
```

or:

```sql
status TEXT CHECK (
    status IN ('PENDING', 'PAID', 'CANCELLED')
)
```

**DEFAULT**

Provides a value when one isn't supplied.

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

Important:

```
DEFAULT does not mean NOT NULL.
```

You can have:

```sql
status TEXT DEFAULT 'PENDING'
```

and still explicitly insert:

```sql
NULL
```

unless `NOT NULL`is also specified.

### 24. CHECK Constraints Are Extremely Powerful

Don't push every business rule into JavaScript. Assumed:

```
quantity must be > 0
```

Do:

```sql
CHECK (quantity > 0)
```

Then even if:

```
React
Express
Prisma
SQL script
admin tool
```

tries to insert:

```
quantity = -10
```

The database rejects it. That's a **`defense in depth`** .

### 25. Domain Constraints

Assumed:

```
discount_percentage
```

must be between 0 and 100.

```sql
CHECK (
    discount_percentage >= 0
    AND discount_percentage <= 100
)
```

or:

```
age >= 0
```

or:

```
amount >= 0
```

or:

```
start_time < end_time
```

These constraints encode domain invariants.

### 26. Foreign Key Actions

Now we reach another important part of relationship design:

```
ON DELETE
ON UPDATE
```

Assumed:

```
Customer ─────< Order
```

What happens if Customer is deleted? Possible policies include:

```
CASCADE
RESTRICT
NO ACTION
SET NULL
SET DEFAULT
```

### 27. WATERFALL

```sql
FOREIGN KEY (customer_id)
REFERENCES customers(id)
ON DELETE CASCADE
```

Deleting:

```
Customer
```

causes:

```
Orders
```

to be deleted. Useful for true dependent data such as some:

```
User → UserPreferences
Post → DraftSections
Order → OrderItems
```

But dangerous for important historical/financial records.

### 28. SET NULL

**`ON DELETE SET NULL`** is a database setting used on a `foreign key constraint`. It means:

```
"If a parent row is deleted, don't delete the child rows. Instead, keep them but set their connection column to NULL (empty).
```

"It is the exact opposite of **`ON DELETE CASCADE (which wipes everything out)`**. Instead of destroying the child records, it **`orphans`** them safely.

**Code Example**

To use `SET NULL`, the column holding the foreign key must be allowed to be empty (you cannot use NOT NULL on it).

```sql
-- 1. Create Parent Table
CREATE TABLE Departments (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(50)
);
```

```sql
-- 2. Create Child Table
CREATE TABLE Employees (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(50),
    dept_id INT, -- ⚠️ Notice there is NO "NOT NULL" here! It must be allowed to be blank.

    -- ⬇️ This is the rule:
    FOREIGN KEY (dept_id) REFERENCES Departments(dept_id) ON DELETE SET NULL
);
```

```sql
ON DELETE SET NULL
```

Means:

```
Parent deleted
      ↓
child FK = NULL
```

But this requires:

```sql
customer_id BIGINT NULL
```

and the business must allow an orphaned reference.This is sometimes appropriate for relationships such as:

```
Post → Author
```

if author deletion is allowed and historical content should remain.

### 29. RESTRICT / NO ACTION

These prevent deletion when dependent references exist, subject to PostgreSQL's constraint timing semantics. Conceptually:

```
Customer
   ↓
has Orders
   ↓
cannot delete Customer
```

until the dependent references are handled. This is often a safer default for important historical relationships than casually using cascade.

### 30. NO ACTION vs  RESTRICT in PostgreSQL

They are similar, but not identical.

**`NO ACTION`** allows the constraint to be checked at the end of the statement, or at transaction end if the FK is declared **`DEFERRABLE`**.

**`RESTRICT`** is stricter and prevents the deletion/update when the referenced rows are still present.

You don't need to memorize this immediately, but know:

```
They are not literally interchangeable in PostgreSQL.
```

### 31. ON UPDATE

**`ON UPDATE CASCADE`** is a database setting that automatically updates `child rows` when a `parent row's` identifier `(Primary Key)` changes. It means: "If I change a key value in the parent table, `automatically` pass that change down to all connected rows in the child table.

"This ensures that the links between your tables never break, preventing "orphaned" records. You'll see:

```sql
ON UPDATE CASCADE
```

but in many production systems, primary keys are intentionally stable. If:

```
customer.id = 100
```

changes to:

```
customer.id = 500
```

cascading that change through every dependent table can be `unnecessary`.

A common design is:

```
Treat immutable IDs as immutable.
```

Then you rarely need it `ON UPDATE CASCADE`

### 32. Business Rule vs. Database Constraint

This distinction is extremely important. Assumed:

```
A customer cannot have more than 5 active addresses.
```

Can you express that with a simple:

```
CHECK
```

No.

A **`CHECK`** generally operates on the current row, not arbitrary counts across other rows. You may need:

```
application transaction logic
trigger
specialized schema design
exclusion/partial constraints for certain patterns
locking/concurrency control
```

This is where database design becomes advanced.

### 33. Constraints Must Survive Concurrency

Imagine your API checks:

```
Does this email already exist?
```

It returns:

```
No
```

Request A inserts. Request B simultaneously checks. It also sees:

```
No
```

Both insert. Without a database-level unique constraint, you could get duplicates. With:

```sql
UNIQUE(email)
```

the database arbitrates the race. This is a huge production principle:

```
If something must never happen, enforce it at the database level whenever the database can express the invariant.
```

Application validation improves UX. Database constraints protect integrity. You usually want both.

### 34. Validation vs. Constraint

Assumed:

```
email must be unique
```

**Frontend:**

```
"Email already registered"
```

Good UX.

**Backend:**

```
check email
```

Good application behavior.

**Database:**

```sq;
UNIQUE(email)
```

Actual integrity guarantee. Why all three? Because clients can:

- bypass frontend
- race each other
- use another API
- use scripts
- have bugs

### 35. The Database Is the Final Guardian

Think:

```
Frontend
   ↓
Backend validation
   ↓
Business logic
   ↓
Database constraints
   ↓
Actual data integrity
```

Don't rely only on:

```
React validation
```

or:

```
Express validation
```

for structural invariants.

### 36. Partial Unique Constraints

Assumed:

```
A user can have many deleted accounts/history rows, but only one active account.
```

You might use a partial unique index:

```sql
CREATE UNIQUE INDEX one_active_account_per_user
ON accounts(user_id)
WHERE deleted_at IS NULL;
```

Now:

```
user_id | deleted_at
--------|-----------
10      | 2025-01-01
10      | 2026-01-01
10      | NULL
```

is allowed. But another:

```
10 | NULL
```

is rejected. This lets your database express sophisticated business rules.

### 38. Cardinality Is Not Just Table Structure

Assumed:

```
Doctor 1 ─────< Appointment
```

That doesn't tell us:

```
Can a doctor have two appointments at the same time?
```

That's a separate business constraint. And it can be extremely important. You might need to prevent overlapping schedules.
In PostgreSQL, exclusion constraints can be useful for certain `temporal/range` rules.

Conceptually:

```
Doctor
   ↓
Appointment
```

with:

```
doctor_id
time_range
```

and a rule:

```
Same doctor cannot have overlapping appointments.
```

That's beyond basic cardinality.

### 39. Cardinality ≠ Business Capacity

Consider:

```
Customer 1 ─────< Order
```

This means:

```
many
```

It does not mean:

```
unlimited
```

The application may have:

```
maximum 100 orders/day
```

or:

```
maximum 5 active orders
```

These are additional business constraints. So your mental model should be:

```
Cardinality
   ↓
Structural relationship
   ↓
Additional business constraints
```

### 40. Relationship Design Checklist

For every relationship, write this:

```
ENTITY A:
ENTITY B:

A → B:
minimum =
maximum =

B → A:
minimum =
maximum =

FK:
where?

NULL:
allowed?

UNIQUE:
needed?

PK:
what identifies relationship?

CHECK:
what values are valid?

DELETE:
what happens?

UPDATE:
what happens?

INDEX:
what queries need it?

TIME:
does history matter?

LIFECYCLE:
does relationship have states?

CONCURRENCY:
what can race?

BUSINESS RULES:
what else must never happen?
```

### 41. Let's Design a Real Example End-to-End

Take:

```
A customer can place many orders. An order must belong to one customer. An order contains one or more products. A product can appear in many orders. Each order item records quantity and the price at purchase time. Orders can be canceled, but historical order data must remain.
```

Let's derive it.

**Entity discovery**

```
Customer
Order
Product
OrderItem
```

**Relationship discovery**

```
Customer → Order
Order → Product
```

Aim:

```
Order N:M Product
```

and relationship has:

```
quantity
purchase_price
```

Therefore:

```
OrderItem
```

### 42. Final Relationship Model

More precisely:

```
Customer → Order
0..N

Order → Customer
1

Order → OrderItem
1..N

OrderItem → Order
1

Product → OrderItem
0..N

OrderItem → Product
1
```

### 43. Convert That Into Constraints

Customer → Order:

```sql
orders.customer_id NOT NULL
```

because:

```
Order → exactly 1 Customer
```

Order → OrderItem:

Each Order Item:

```sql
order_id NOT NULL
```

because:

```
OrderItem → exactly 1 Order
```

Product → Order Item:

```sql
product_id NOT NULL
```

because:

```
OrderItem → exactly 1 Product
```

### 44. Relationship-Level Attributes

```
OrderItem
---------
order_id
product_id
quantity
unit_price
```

Constraints:

```
quantity > 0
unit_price >= 0
```

Potentially:

```sql
UNIQUE(order_id, product_id)
```

if a product can appear only once per order.

### 45. Historical Integrity

Assumes Product currently costs:

```
100
```

OrderItem:

```
unit_price = 100
```

Later:

```
Product.current_price = 150
```

Historical order remains:

```
unit_price = 100
```

That's a snapshot . This is a major production modeling technique.
You don't always want historical records to dynamically reflect today's related entity state.

### 46. ​​Don’t Cascade Historical Orders Away

If:

```
Customer → Order
```

and orders represent financial history, casually doing:

```sql
ON DELETE CASCADE
```

could destroy important records. Instead, you might use:

```
soft delete customer
```

or:

```
restrict deletion
```

depending on requirements.The exact choice depends on retention/legal/business rules.

### 47. Another Deep Concept: Relationship Multiplicity Can Differ by State

Consider:

```
User → Subscription
```

A user might have:

```
0..N historical subscriptions
```

aim:

```
0..1 active subscription
```

So:

```
Historical relationship:
User → 0..N Subscription

Active relationship:
User → 0..1 active Subscription
```

You might enforce the active rule with:

```sql
CREATE UNIQUE INDEX one_active_subscription
ON subscriptions(user_id)
WHERE status = 'ACTIVE';
```

That's a beautiful example of combining:

```
cardinality
+
state
+
constraint
```

### 48. What “Industry-Level” Really Means Here

Industry-level database design does not mean:

```
"Use 50 tables."
```

It means:

```
Represent the business rules accurately and protect important invariants.
```

A mature schema asks:

```
What can exist?
What cannot exist?

How many can exist?

When is the relationship optional?

Who depends on whom?

Can the relationship change?

Does it have attributes?

Does it have a lifecycle?

Does historical state matter?

What happens when something is deleted?

What happens concurrently?

Which rules must the database itself guarantee?

That's the mindset you want.
```

### 49. Your Core Mental Model

From now on, when you see:

```
A ───── B
```

Don't write SQL immediately.

Walk through:

```
                    A ───── B
                         │
                         ▼
                 What is the relationship?
                         │
                         ▼
                    Cardinality
                         │
                 ┌───────┴───────┐
                 ▼               ▼
              Minimum          Maximum
                 │               │
                 │               │
            0 or 1            1 or N
                 │               │
                 └───────┬───────┘
                         ▼
                    Optionality
                         │
                         ▼
                    Constraints
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
        NOT NULL       UNIQUE          FK
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                  Business rules
                         │
                         ▼
                  Index / performance
                         │
                         ▼
                 Delete / lifecycle
                         │
                         ▼
                    Final schema
```

### 50. The Three Levels You Should Be Able to Explain

If someone gives you:

```
"A user can belong to many organizations. An organization can have many users. A user's role can be different in each organization."
```

You should mentally go:

**Level 1 — Cardinality**

```
User → 0..N Organizations
Organization → 0..N Users
```

Therefore:

```
N:M
```

**Level 2 — Relationship entity**

```
Membership
```

because:

```
role
```

belongs to the relationship.

**Level 3 — Constraints**

```
Membership.user_id → users.id
Membership.organization_id → organizations.id

UNIQUE(user_id, organization_id)

role NOT NULL

```

Potentially:

```
CHECK(role IN (...))
```

And index according to access patterns. That is database design.

Not:

```
“I know how to write Prisma relationships.”
```

### 51. One Last Thing: Don't Over-Constrain

This is just as important as adding constraints. A bad schema can be overly restrictive. For example:

```sql
UNIQUE(customer_id)
```

would accidentally turn:

```
Customer 1:N Order
```

into:

```
Customer 1:1 Order
```

And:

```
NOT NULL
```

on a relationship that is legitimately optional would prevent valid states.

And:

```
ON DELETE CASCADE
```

could destroy data that should have been retained. So the goal isn't:

```
Maximum number of constraints.
```

The goal is:

```
Exactly the constraints justified by the business rules.
```
