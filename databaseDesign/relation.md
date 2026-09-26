# Relationship
First, lock in this idea:

```
A relationship answers: “How are these two entities connected, and what rules govern that connection?”
```

For example:

```
Customer ───── places ─────> Order
```

That sentence contains more information than the diagram. It says:

- Customer exists independently.
- Order exists independently.
- A customer can place orders.
- An order belongs to a customer.
- Therefore, there is a relationship between them.
- That relationship has cardinality : one customer → many orders.

### 1. Relationship ≠ Foreign Key

Assumed:

```
Customer
---------
id
name

Order
---------
id
customer_id
total
```

You might say:

```
customer_id creates the relationship.
```

Technically, `customer_id` is the implementation of the relationship in a relational database. The relationship itself is the `business concept`:

```
Customer ─── places ───> Order
```

The foreign key is how PostgreSQL represents that relationship:

```
Order.customer_id → Customer.id
```

So think:

```
Business world
      ↓
Relationship
      ↓
Database design
      ↓
Foreign key / join table
```

### 2. The Four Questions You Should Ask

Whenever you identify two entities, don't immediately create a foreign key. Ask these four questions.

```
Question 1 — Can A exist without B?
Question 2 — How many B's can one A have?
Question 3 — How many A's can one B have?
Question 4 — Does the relationship itself have information?
```

**Question - 4 explaination**
Assumed:

```
Student ───── Course
```

A student enrolls in a course. But enrollment may have:

```
enrolledAt
grade
status
semester
completedAt
```

Those properties don't belong naturally to Student. They don't belong naturally to Course. They belong to:

```
the enrollment relationship.
```

Therefore:

```
Student
   │
   │
   ▼
Enrollment
   ▲
   │
   │
Course
```

### 3. Relationship Cardinality

There are three major cardinalities.

```
1 : 1
1 : N
N : M
```

But don't just memorize those symbols.

### 4. One-to-One — 1:1

Example:

```
User ───── Profile
```

Potentially:

```
User 1 ───── 1 Profile
```

Meaning:

```
one User has at most one Profile
one Profile belongs to at most one User
```

Database:

```
users
---------
id
name
email

profiles
---------
id
user_id UNIQUE
bio
avatar
```

The important part is:

```
user_id UNIQUE
```

Why? Without `UNIQUE`:

```
profiles

id    user_id
1       10
2       10
3       10
```

Now User `10 has three profiles`. That's no longer `1:1`. So:

```
Cardinality isn't just a diagram. It must be enforced by database constraints.
```

### 5. But 1:1 Is More Complicated Than That

Consider:

```
User ───── Profile
```

Ask:

```
Can every User have a Profile?
```

Maybe:

```
Yes
```

Then:

```
User 1 ───── 1 Profile
```

But maybe a newly registered user doesn't have a profile yet. Then:

```
User 1 ───── 0..1 Profile
```

That's different. For example:

```
users
1 Rudra
2 John
3 Alex

profiles
1 user_id=1
2 user_id=2
```

Alex has no profile. That's perfectly valid if the relationship is optional. So industry-level modeling considers:

```
1
0..1
1..N
0..N
```

not merely:

```
1:1
1:N
```

### 6. One-to-Many — 1 :N

This is probably the relationship you'll use most. Example:

```
Customer
   │
   │
   ├──── Order
   ├──── Order
   ├──── Order
   └──── Order
```

Therefore:

```
Customer 1 ───────< Order
```

Database:

```
customers
---------
id
name

orders
---------
id
customer_id
total
created_at
```

The foreign key goes on the many side :

```
Order.customer_id
        ↓
Customer.id
```

This is a rule worth remembering:

```
In a normal 1 :N relationship, the foreign key lives on the N side.
```

### 7. Why Does the FK Go on the Many Sides?

Don't memorize it. Understand why. Imagine:

```
Customer
------------
id
name
orders[]
```

If Customer has:

```
orders = [101, 102, 103]
```

a relational table doesn't normally represent that array like that. Instead:

```
orders

id     customer_id
101       5
102       5
103       5
```

Each order says:

```
“I belong to Customer 5.”
```

Therefore:

```
Customer 5
   ↓
Order 101
Order 102
Order 103
```

`The many sides carry the reference`.

### 8. Another 1:N Example

Healthcare:

```
Doctor ─────< Appointment
```

One doctor:

```
Doctor 7
```

can have:

```
Appointment 101
Appointment 102
Appointment 103
```

So:

```
doctors
---------
id
name

appointments
---------
id
doctor_id
patient_id
scheduled_at
status
```

Here we actually have:

```
Doctor 1 ─────< Appointment
Patient 1 ─────< Appointment
```

This is extremely important. `An entity can participate in many relationships simultaneously`.

### 9. One Entity Doesn't Have Only One Relationship

Beginners often think:

```
User
 ↓
Order
```

But real applications look more like:

```
                    ┌──── Profile
                    │
                    ├──── Order
                    │
User ───────────────┼──── Address
                    │
                    ├──── PaymentMethod
                    │
                    ├──── Review
                    │
                    └──── Notification
```

Database design is basically discovering this graph. Think of your database as:

```
a graph of entities connected by business relationships.
```

**`Tables are nodes. Foreign keys / join entities are edges.`**

### 10. Many-to-Many — N:M

Now things get interesting. Example:

```
Student ───── Course
```

Can one Student take many Courses?

```
Yes.
```

```
Student 1
 ├── Course A
 ├── Course B
 └── Course C
```

Can one Course have many Students?

```
Yes.
```

```
Course A
 ├── Student 1
 ├── Student 2
 ├── Student 3
 └── Student 4
```

Therefore:

```
Student N ─────── M Course
```

That's many-to-many.

### 11. Why Can't We Simply Put a Foreign Key in Student?

Suppose:

```
students
---------
id
name
course_id
```

One student can only conveniently point to one course:

```
student 1 → course 10
```

What about:

```
course 10
course 20
course 30
```

You could imagine:

```
course_ids = [10,20,30]
```

But that's not normal relational modeling. What if we put:

```
course_id_1
course_id_2
course_id_3
course_id_4
```

Terrible design. The number of courses isn't fixed. So we introduce an intermediate entity.

### 12. The Join Entity

```
Student
   │
   │
   ▼
Enrollment
   ▲
   │
   │
Course
```

Tables:

```
students
---------
id
name

courses
---------
id
name

enrollments
---------
student_id
course_id
```

Now:

```
Student 1
   ↓
Enrollment
   ↓
Course A
```

and:

```
Student 1
   ↓
Enrollment
   ↓
Course B
```

and:

```
Student 2
   ↓
Enrollment
   ↓
Course A
```

The many-to-many relationship has been transformed into two **`1:N`** relationships:

```
Student 1 ─────< Enrollment >───── 1 Course
```

Conceptually:

```
Student 1 ─────< Enrollment
Course  1 ─────< Enrollment
```

This is the relational database solution to **`N:M`**.

### 13. The Most Important Question: What Is Enrollment?

Don't think:

```
“I need a join table because SQL requires it.”
```

Think:

```
“What does this row represent?”
```

This row:

```
student_id = 10
course_id = 50
```

means:

```
Student 10 is enrolled in Course 50.
```

That is a business fact. Therefore Enrollment isn't merely a technical bridge. It can become a real entity.

### 14. The Relationship Can Have Attributes

Suppose enrollment has:

```
student
course
enrolledAt
semester
grade
status
```

Now:

```
Enrollment
-----------
student_id
course_id
enrolled_at
semester
grade
status
```

Where does grade belong? Not in `Student` entity. Because a student can have:

```
Math → A
Physics → B
Database → A+
```

Not in `Course` entity. Because thousands of students have different grades. It belongs to:

```
Student + Course
```

That is exactly what the relationship represents

### 15. This Is the Core Mental Model

Whenever you see:

```
A ───── B
```

ask:

```
What does the connection between A and B mean?
```

For example:

```javascript
Student ─── Course // Enrollment
Customer ─── Product // WishListItems
Order ─── Product // orderItem
Doctor ─── Patient // Appointment
User ─── Organization // Membership
Driver ─── Vehicle // DriverVehicleAssignment
```

The name of the relationship often reveals the domain model.

### 16. Order + Product: The Classic Industry Example

Let's take e-commerce. You might initially think:

```
Order
---------
id
customer_id
products[]
```

But stop. Ask:

```
What does an order need to remember about a product?
```

Suppose:

```
Order #5001
```

contains:

```
iPhone
quantity = 2
unit price = $900

Headphone
quantity = 1
unit price = $30
```

Now `quantity` belongs where? Not in `Product`. Because Product doesn't have:

```
quantity = 2
```

A product could appear in thousands of orders with different quantities. Not `Order` either. An order contains multiple products, each with different quantities. Therefore:

```
OrderItem
```

### 18. What Goes Into OrderItem?

Potentially:

```
OrderItem
---------
id
order_id
product_id
quantity
unit_price
discount
tax
```

And now something very important happens. Suppose Product currently costs:

```
$100
```

Customer orders:

```
2 × $100
```

Tomorrow Product becomes:

```
$120
```

What should historical Order #5001 say? It should still say:

```
2 × $100
```

Therefore:

```
OrderItem.unit_price
```

is often necessary. This is an industry-level modeling decision. You're not merely storing relationships. You're preserving the business state that mattered at transaction time.

### 19. Relationship Attributes vs Entity Attributes

This is a skill you absolutely need. Consider:

```
Product
---------
id
name
current_price
```

and:

```
OrderItem
---------
order_id
product_id
quantity
unit_price
discount
```

Why is:

```
quantity
```

on `OrderItem`? Because:

```
quantity is about this Product within this Order.
```

Why is:

```
unit_price
```

on `OrderItem`? Because:

```
this was the price of this Product within this Order.
```

That's contextual information.

### 20. Another Powerful Example: User ↔ Organization

Imagine a SaaS application.

```
User
Organization
```

A User can belong to many organizations. An Organization can contain many users.Therefore:

```
User N ───── M Organization
```

Join entity:

```
Membership
---------
user_id
organization_id
role
joined_at
status
```

Now look at:

```
role
```

Could role belong to User?

```
No.
```

A user could be:

```
Admin in Organization A
Member in Organization B
Owner in Organization C
```

Could role belong to Organization?

```
No.
```

Therefore:

```
Membership.role
```

belongs to the relationship. This pattern appears everywhere in real SaaS systems.

### 21. Don't Assume Every Intermediate Table Is the Same

There are two related but different ideas.

**Pure junction table**

```
student_id
course_id
```

Its primary purpose is simply representing membership.

**Association entity**

```
student_id
course_id
enrolled_at
grade
status
```

Now it represents a meaningful business object/event. This distinction matters because the second one deserves more deliberate modeling.

### 23. Relationship Direction

This also causes confusion. Suppose:

```
Customer 1 ─────< Order
```

You might say:

```
Customer has Orders
```

or:

```
Order belongs to Customer
```

Both describe the same relationship from different perspectives. In code:

```
customer.orders
```

and:

```
order.customer
```

may both be useful. But the database only needs the actual structural relationship:

```
orders.customer_id → customers.id
```

The application can expose whichever navigation is useful.

### 24. Parent and Child

You'll hear:

```
parent
child
```

A useful mental model is:

```
Customer
   ↓
Order
```

`Customer` is parent. `Order` is child. Because `Order` `references `Customer`. But don't turn this into a universal philosophical rule.

In a database, `"parent/child"` usually describes `dependency/reference` structure, not necessarily a hierarchy in the business domain.

### 25. Ownership vs Relationship

Consider:

```
User ─── Address
```

Is Address owned by User?

```
Maybe.
```

But consider:

```
User ─── Organization
```

A User belongs to an Organization, but neither entity necessarily "owns" the other in a lifecycle sense.
And:

```
Order ─── Product
```

Order doesn't own Product. The `OrderItem` represents the association. So:

```
Relationship does not automatically mean ownership.
```

This becomes very important when designing deletion behavior.

### 26. Optional Relationships

Real systems contain optional relationships everywhere. Example:

```
Order ─── Payment
```

Does every Order immediately have a Payment?

```
Maybe not.
```

An order might be:

```
PENDING_PAYMENT
```

before payment happens. Therefore:

```
Order 1 ───── 0..1 Payment
```

Later:

```
Order 500
Payment 900
```

The relationship becomes populated. This is why you shouldn't blindly make every foreign key:

```
NOT NULL
```

You need to understand the lifecycle.

### 27. Required vs Optional Is a Huge Part of Production Design

Imagine:

```
User ───── Address
```

Maybe:

```
User can exist without Address.
```

Then:

```
User 1 ───── 0..N Address
```

But for:

```
Order ───── Customer
```

perhaps:

```
Order cannot exist without Customer.
```

Then:

```
Order.customer_id NOT NULL
```

So

```
business rules become database constraints.
```

That's production database design.

### 29. Self-Referencing Relationships

Here's another major relationship pattern. An entity can relate to itself . Example:

```
Employee
```

An employee can have a manager who is also an employee.

```
Employee
   ↑
   │
manager_id
   │
Employee
```

Table:

```
employees
---------
id
name
manager_id → employees.id
```

```
Data:

id   name       manager_id
1    CEO        NULL
2    Manager    1
3    Developer  2
4    Designer   2
```

Relationship:

```
Employee 1 ─────< Employee
```

This is a self-referencing **`1 :N`** relationship. Very common.

### 31. Relationships Can Have Their Own Lifecycle

This is where `"relationship becomes an entity"` becomes even clearer. Consider:

```
Driver ─── Vehicle
```

Suppose a driver can use different vehicles over time. You need:

```
assigned_at
unassigned_at
status
```

Now:

```
DriverVehicleAssignment
-----------------------
driver_id
vehicle_id
assigned_at
unassigned_at
status
```

The relationship itself has a lifecycle. So it absolutely deserves explicit modeling.

### 32. Relationship as an Event

This is another distinction you should master. Consider:

```
Customer → Order
```

The relationship might be:

```
places
```

Now:

```
Payment
Shipment
Refund
```

are not necessarily mother relationships. They can be `events/transactions/entities` with their own lifecycle . For example:

```
Order
   ↓
Payment
```

Payment might have:

```
id
order_id
amount
currency
provider
status
transaction_reference
created_at
paid_at
failed_at
```

That's far more than:

```
order_id
```

So don't force everything into the "relationship table" category.
Ask:

```
Is this merely connecting two entities, or does this represent a meaningful business object/event with its own lifecycle?
```

### 34. A Relationship Can Be 1 :N Without a Join Table

Don't over-normalize. Example:

```
Department 1 ─────< Employee
```

You don't need:

```
DepartmentEmployee
```

because this is naturally:

```
employees.department_id
```

The intermediate entity becomes useful when:

```
N:M
```

or when the association itself needs meaningful representation.

### 35. A Relationship Can Look N :M but Actually Be Something Else

This is a subtle production-level point. Assumed:

```
Doctor ─── Patient
```

You might initially think:

```
Doctor N:M Patient
```

But then ask:

```
What connects a doctor and patient at a particular time?
```

Answer:

```
Appointment
```

So instead of:

```
Doctor >──< Patient
```

your model:

```
Doctor 1 ─────< Appointment >───── 1 Patient
```

This is much more expressive. Because:

```
Appointment
---------
doctor_id
patient_id
scheduled_at
status
reason
notes
```

Now the system knows when and why the relationship occurred. This is exactly how you should think.

### 36. Don’t Model Only the Static World

Production systems contain time . Consider:

```
Employee ─── Department
```

Current-state model:

```
employees
---------
id
department_id
```

But suppose the business asks:

```
“Which department did this employee belong to in January 2025?”
```

Suddenly the simple FK isn't enough. You may need:

```
EmployeeDepartmentHistory
-------------------------
employee_id
department_id
started_at
ended_at
```

Now the relationship itself has temporal information. This is called `temporal/history` modeling , and it's an important step beyond basic relationship design.

### 37. Relationship + Time Changes Everything

Compared:

**Current state**

```
Driver
  ↓
current_vehicle_id
```

versus historical:

```
DriverVehicleAssignment
-----------------------
driver_id
vehicle_id
started_at
ended_at
```

Current state answers:

```
What vehicle does the driver use now?
```

History answers:

```
Which vehicles does the driver use over time?
```

Different requirements → different models.

### 38. Relationship Constraints

Now let's move into actual production thinking. Assumed:

```
OrderItem
---------
order_id
product_id
quantity
```

You probably want:

```
quantity > 0
```

And perhaps:

```
UNIQUE(order_id, product_id)
```

if one product should appear only once per order. Then:

```
Order #1
Product #10
```

cannot appear twice.

Instead:

```
OrderItem
product_id=10
quantity=3
```

If the business permits the same product to appear as separate lines, then the constraint would be different.

Again:

```
Database structure follows business rules.
```

### 39. Foreign Key ≠ Automatically Correct Relationship

Assumed:

```
orders.customer_id
```

References:

```
customers.id
```

That guarantees:

```
referenced customer exists.
```

But it doesn't automatically answer:

- Can the customer be deleted?
- Can an order exist without customer?
- Can the customer change?
- Should historical orders remain?
- Can the relationship be reassigned?
- Should deletion cascade?
- Is the relationship optional?

These are separate business decisions.

### 40. Delete Behavior Is Part of Relationship Design

Assumed:

```
User 1 ─────< Order
```

Now User gets deleted. What happens to orders? Possibilities are :

**Cascade**

```
delete User
   ↓
delete Orders
```

Dangerous for transactional history.

**Restrict**

```
delete User
   ↓
ERROR because Orders exist
```

**Set NULL**

```
delete User
   ↓
Order.customer_id = NULL
```

But then you need:

```
customer_id nullable
```

**Soft delete**

Instead of physically deleting:

```
users
---------
id
deleted_at
```

The relationship remains intact. There isn't a universally correct option. The business's data-retention requirements determine it.

### 41. Don’t Confuse Database Relationships With API Relationships

This is important for your backend work.

Database:

```
Order
  customer_id
```

API response might be:

```json
{
  "id": 500,
  "customer": {
    "id": 10,
    "name": "Rudra"
  }
}
```

or:

```json
{
  "id": 500,
  "customerId": 10
}
```

Those are API representation choices . But they don't change the underlying relationship. Similarly, `Prisma/ORM` relationships are `an abstraction` over the database relationship.

Don't let:

```
Prisma relation
Mongoose populate
ORM include
API nested JSON
```

become your mental model. First understand the business relationship. Then database. Then ORM. Then API.

### 43. A Very Powerful Relationship Discovery Process

When you receive a new project requirement, use this process.

**Step 1 — Find entities**

Extract nouns first. The requirement is:

```
Customers can browse products, add products to carts, place orders, make payments, and receive shipments.
```

Potential entities:

```
Customer
Product
Cart
Order
Payment
Shipment
```

**Step 2 — Find verbs**

Look for relationships.

```
Customer → browses → Product

Customer → owns → Cart

Customer → places → Order

Order → contains → Product

Order → has → Payment

Order → has → Shipment
```

**Step 3 — Ask cardinality**

```
Customer 1:N Order
Order N:M Product
Order 1:N Payment?
Order 1:1 Payment?
```

Don't assume. Ask what the business requires.

**Step 4 — Ask optionality**

```
Can Customer exist without Order?
```

Yes.

```
Can Order exist without Customer?
```

Probably no.

Then:

```
Customer 0..N Orders
Order exactly 1 Customer
```

**Step 5 — Ask whether relationship has attributes**

```
Order ─── Product
```

Does the connection have:

```
quantity
unit_price
discount
tax
```

Yes. Therefore:

```
OrderItem
```

**Step 6 — Ask whether relationship has a lifecycle**

```
Driver ─── Vehicle
```

If assignment history matters:

```
DriverVehicleAssignment
```

**Step 7 — Add constraints**

Examples:

```
NOT NULL
UNIQUE
FOREIGN KEY
CHECK
PRIMARY KEY
```

**Step 8 — Think about time**

Ask:

```
“Do we only care about the current relationship, or do we need history?”
```

This one question catches a lot of production requirements.

### 44. A Complete Example: Ride Booking

Since you've worked on a ride-booking system, let's apply everything.

Entities:

```
User
Driver
Vehicle
Ride
Payment
Review
```

Potential relationships:

```
User 1 ─────< Ride
Driver 1 ───< Ride
Vehicle 1 ───< Ride
Ride 1 ────── Payment
Ride 1 ────── Review
```

But now we need to think harder.

**User → Ride**

```
User 1 ─────< Ride
```

A rider can request many rides.

```
rides.rider_id → users.id
```

**Driver → Ride**

```
Driver 1 ─────< Ride
```

A driver completes many rides.

```
rides.driver_id → drivers.id
```

But is a driver mandatory? `Not necessarily`. A newly requested ride may be:

```
REQUESTED
```

with:

```
driver_id = NULL
```

So:

```
Ride
  driver_id nullable
```

This is a real-world optional relationship.

### Ride → Vehicle

You might initially say:

```
Ride.vehicle_id
```

But ask:

```
Is vehicle information supposed to represent the vehicle used for this historical ride?
```

If yes, storing the vehicle used at ride time may be important. Because the driver's current vehicle can change later.So:

```
Ride
---------
driver_id
vehicle_id
```

can preserve the historical fact.

### 45. What About Driver ↔ Vehicle?

Suppose a driver can change vehicles:

```
Driver
 ├── Car A
 ├── Car B
 └── Car C
```

If only the current vehicle matters:

```
Driver
---------
current_vehicle_id
```

might be enough. If historical assignments matter:

```
DriverVehicleAssignment
-----------------------
driver_id
vehicle_id
started_at
ended_at
```

Again:

```
Requirements determine relationship structure.
```

### 46. ​​Ride → Payment

Don't automatically make:

```
ride.payment_id
```

or:

```
payment.ride_id
```

until you understand the business. Could there be:

```
initial payment
refund
retry
failed payment
successful payment
```

Then:

```
Ride 1 ─────< Payment
```

may make more sense. Potentially:

```
payments
---------
id
ride_id
amount
status
provider
transaction_id
created_at
```

The relationship cardinality depends on the payment lifecycle.

### 47. Relationship Design Is Really About Business Rules

Beginners think:

```
1:1
1:N
N:M
```

are database concepts. They are, but underneath them they're describing:

```
Business rules about how things can interact.
```

For example:

```
One customer can place many orders.
An order belongs to exactly one customer.
```

That is a business rule. Database design translates it into:

```
orders.customer_id
NOT NULL
FOREIGN KEY
```

Similarly:

```
A user can belong to many organizations.
An organization can contain many users.
A user's role is different in each organization.
```

becomes:

```
Membership
---------
user_id
organization_id
role
```

That is the transition from:

```
requirements → domain model → database model.
```

### 48. Your Relationship Decision Tree

Whenever you see two entities:

```
A ───── B
```

ask:

```
                 A and B
                    │
                    ▼
           How can they relate?
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
         1:1       1:N       N:M
          │         │         │
          │         │         ▼
          │         │      Junction/
          │         │      Association
          │         │         │
          │         │         ▼
          │         │   Does it have
          │         │   attributes?
          │         │         │
          │         │       YES
          │         │         │
          │         │         ▼
          │         │   Proper entity
          │         │
          ▼         ▼
     FK + UNIQUE   FK on N side
```

Then for every relationship , ask:

```
1. Cardinality?
2. Optional or required?
3. Where does the FK live?
4. Does the relationship have attributes?
5. Does it have its own lifecycle?
6. Does time/history matter?
7. What constraints are required?
8. What happens on delete?
9. Can the relationship change?
10. Do we need historical state?
```

If you can answer those ten questions, you're no longer just memorizing relationship types. You're designing relationships .

### 49. The 7 Relationship Patterns You Should Master

For your database-design journey, I would organize relationships like this:
**Pattern 1 — 1:1**

```
User ─── Profile
```

Learn:

```
FK
UNIQUE
optional 1:1
required 1:1
splitting tables
lifecycle/deletion
```

**Pattern 2 — 1 :N**

```
Customer ───< Order
```

Learn:

```
FK on N side
required/optional FK
parent/child
cascade/restrict/set-null
indexing FK
```

**Pattern 3 — N :M**

```
Student >───< Course
```

Learn:

```
junction table
composite key
unique constraints
association entities
```

**Pattern 4 — N :M + attributes**

```
Order >───< Product
       ↓
   OrderItem
```

Learn:

```
contextual attributes
snapshots
price/quantity/discount
association entity
```

**Pattern 5 — Self-reference**

```
Employee
   ↑
   │
manager_id
```

Learn:

```
hierarchical data
recursive relationships
categories
organizational structures
```

**Pattern 6 — Relationship with history**

```
Driver
   ↓
Assignment
   ↑
Vehicle
```

Learn:

```
started_at
ended_at
current vs historical state
temporal modeling
```

**Pattern 7 — Relationship/Event with life cycle**

```
Order → Payment
Order → Shipment
User → Subscription
Doctor → Appointment
```

Learn:

```
status
state transitions
timestamps
business lifecycle
why these should often become first-class entities.
```

### 50. One Final Mental Shift

I really want you to stop thinking:

```
"How many tables do I need?"
```

Instead think:

```
“What facts does my system need to remember?”
```

Then:

```
What things exist?
        ↓
Entities
        ↓
How do they interact?
        ↓
Relationships
        ↓
How many can relate?
        ↓
Cardinality
        ↓
Is the relationship optional?
        ↓
Optionality
        ↓
Does the relationship carry information?
        ↓
Association entity
        ↓
Does it have a lifecycle/history?
        ↓
First-class domain entity
        ↓
What rules must never be violated?
        ↓
Constraints
```

That is the production database-design mindset . And notice something beautiful:

```
OrderItem
```

wasn't invented because PostgreSQL demanded a third table. It appeared because the real-world fact

```
"Product X was purchased in Order Y, at quantity Z, for price P"
```

is itself something the system needs to remember.
