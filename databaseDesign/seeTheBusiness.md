# SEE THE BUSINESS

Our goal is:

```
Given an unfamiliar project requirement, you should be able to look at it and systematically discover what exists, what happens, who owns what, what rules exist, and what must be remembered.
```

Not:

```
“Hmm… should I make 7 tables or 12 tables?”
```

### Part 1 — The mental model

Imagine someone gives you this requirement:

```
“We are building an online food delivery platform. Customers can browse restaurants and menus, add food to a cart, place orders, pay online, and track delivery. Restaurant owners manage their menus. Drivers accept deliveries and update delivery status. Customers can save multiple addresses. An order can be canceled before preparation starts.”
```

A beginner immediately thinks:

```
users
restaurants
products
orders
payments
...
```

That's backwards. Instead, your brain should go:

```
WHO participates?
        ↓
WHAT exists?
        ↓
WHAT can they do?
        ↓
WHAT happens?
        ↓
HOW are things related?
        ↓
WHAT rules restrict those actions?
        ↓
WHAT changes state?
        ↓
WHAT must we remember historically?
        ↓
WHAT must remain consistent?
```

Only after that do we think about database structures.

### Part 2 — The 10 things you must learn to extract

You mentioned these:

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

Good. We're going to turn each one into a skill.

**`1. Actors — WHO is interacting with the system?`**

```
An actor is something/someone that performs actions in the business.
```

For our food delivery system :

```
Customer
Restaurant Owner
Driver
Admin
Payment Provider
```

Notice something important.

```
Not every actor necessarily becomes a database entity.
```

For example:

```
Payment Provider
```

might be an external system. So:

```
Actor ≠ Table
```

**Ask** :

Whenever reading requirements:

```
Who does something?
```

Look for verbs.

```
Customer places order.
Restaurant accepts order.
Driver delivers order.
Admin suspends restaurant.
Payment provider confirms payment.
```

You have discovered actors.

**` 2. Entities — WHAT things exist?`**

Now ask:

```
What nouns represent important business concepts?
```

From:

```
“Customers place orders from restaurants and receive food at addresses.”
```

Potential concepts:

```
Customer
Order
Restaurant
Food/Menu Item
Address
```

But here's the trap.

```
Not every noun deserves an entity.
```

Suppose the requirement says:

```
“Customers place orders from restaurants using the mobile application.”
```

You probably don't need:

```
MobileApplication
```

as a database entity. Why? Because it's not a **`business object`** whose lifecycle you need to manage. This is one of the biggest database-design lessons:

```
A noun in a requirement is not automatically an entity.
```

**` 3. Attributes — WHAT do we know about an entity?`**

Once you identify:

```
Customer
```

ask:

```
What information does the business need to know about a customer?
```

Maybe:

```
name
email
phone
date_of_birth
status
created_at
```

Restaurant:

```
name
description
phone
status
opening_time
closing_time
```

Order:

```
order_number
status
total_amount
placed_at
cancelled_at
```

```
But don't blindly put every imaginable field into an entity.
```

Ask:

```
Does the business actually need to remember this?
```

That's the difference between modeling a business and designing a random object.

**`4. Actions — WHAT can happen?`**

Look for verbs.

Example:

```
Customer browses restaurant.
Customer adds item to cart.
Customer places order.
Customer pays.
Restaurant accepts order.
Restaurant starts preparation.
Driver accepts delivery.
Driver picks up order.
Driver delivers order.
Customer cancels order.
```

These actions tell you something deeper:

```
Your database needs to represent the consequences of actions.
```

For example:

```
Customer places order
```

means something happened that probably needs to be persisted.

```
Order
status = placed
placed_at = ...
```

Similarly:

```
Restaurant starts preparation
```

may cause:

```
Order
status = preparing
```

And:

```
Driver delivers order
```

may cause:

```
Order
status = delivered
delivered_at = ...
```

So actions lead us toward state.

**`5. Relationships — HOW are things connected?`**

Now ask:

```
How does one business concept relate to another?
```

Example:

```
Customer ─── places ───> Order
Restaurant ─── receives ───> Order
Order ─── contains ───> Menu Items
Customer ─── has ───> Address
Driver ─── delivers ───> Order
Restaurant ─── owns ───> Menu Items
```

Now we can start thinking structurally. For example:

```
One Customer
    ↓
many Orders
```

So:

```
Customer 1 ─────── N Order
```

And:

```
One Order
    ↓
multiple Menu Items
```

But here's where beginners frequently get confused. Suppose:

```
Order #1001

Burger × 2
Pizza × 1
Coke × 3
```

That's not simply:

```
Order → Product
```

There is another business concept:

```
Order Item
```

because the relationship itself contains information:

```
quantity
unit_price
discount
subtotal
```

This leads to a very powerful rule:

```
Sometimes the relationship between two entities becomes an entity of its own because the relationship has business data.
```

We'll spend a LOT of time on this later.

**`6. Business Rules — WHAT is allowed?`**

This is where production database design begins to separate from CRUD tutorials.

Requirement:

```
“An order can be canceled only before preparation starts.”
```

That's not just a UI rule. That's a **`business invariant`**. We can express it:

```
IF order.status >= preparing
THEN cancellation is not allowed
```

Another:

```
“A restaurant cannot accept orders when it is suspended.”
```

```
restaurant.status = suspended
        ↓
cannot accept new orders
```

Another:

```
“A driver cannot accept another active delivery while already delivering an order.”
```

Now we're discovering rules. When reading requirements, actively search for words like:

```
only
cannot
must
unless
before
after
at least
maximum
minimum
exactly
unique
required
optional
if
when
until
```

These words are gold for database design.

**`7. State Changes — WHAT changes over time?`**

Many real-world entities aren't static. An order might go:

```
placed
   ↓
confirmed
   ↓
preparing
   ↓
ready
   ↓
picked_up
   ↓
delivered
```

That's a **`state machine`**. And database designers must ask:

```
What states exist?
Which transitions are allowed?
Who can cause each transition?
What information changes during the transition?
```

For example:

```
placed → preparing
```

might only be allowed for:

```
Restaurant
```

While:

```
ready → picked_up
```

might require:

```
Driver
```

And:

```
picked_up → delivered
```

might also require:

```
Driver
```

Now we're no longer merely designing tables. We're modeling business behavior.

**`8. Ownership — WHO owns WHAT?`**

Ownership is incredibly important. Consider:

```
Customer
Address
```

Does an address belong to the customer? Usually:

```
Customer
   │
   ├── Address
   ├── Address
   └── Address
```

But consider an `order`. Does an order belong to a customer?

```
Yes.
```

```
Customer
   │
   ├── Order
   ├── Order
   └── Order
```

But there's a subtle question:

```
What happens if the customer changes their address later?
```

Suppose:

```
Customer's address today:

123 Main Street
```

They place an order.

```
Tomorrow:

123 Main Street → 999 New Street
```

Should yesterday's order now show:

```
999 New Street
```

Probably not. Why? Because the order represents a **`historical business event`**. This brings us to historical data.

**`9. Historical Data — WHAT must never change?`**

This is a HUGE production concept. Suppose an order was placed at:

```
$10
```

Later the product price becomes:

```
$15
```

Should the old order suddenly become:

```
$15
```

No. The order needs to preserve the **`historical fact`**: At the time of purchase `unit_price` was :

```
unit_price = $10
```

Therefore, an **`OrderItem`** often stores something like:

```
product_id
quantity
unit_price
```

rather than relying forever on:

```
Product.price
```

This is a fundamental modeling principle:

```
Current state and historical fact are not always the same thing. The current state is what exists right now, while a historical fact is what happened in the past and cannot be changed.

Current State: The latest value or live condition of a record in a database (e.g., a customer's current address or a product's current price).

Historical Fact: What the value actually was at the exact moment a past business event occurred (e.g., the address a product was shipped to three years ago, or the price a customer paid at checkout)

Why They Differ in Practice?

Overwriting Data: If a database updates a customer's profile by replacing the old address with a new one, the old address disappears.

Rewriting History: If you look at an old sales order using the live customer profile, it might display the new address, making it look like you shipped an item to the wrong place.

Auditing and Compliance: Businesses need to prove what happened during a specific transaction. Changing the current state should never alter past accounting, legal, or operational records.
```

You'll see this everywhere:

```
E-commerce
Banking
Healthcare
Accounting
Booking
Ride sharing
Subscriptions
Inventory
HR
```

**`10. Constraints — WHAT must remain true?`**

Constraints are conditions that must always hold. Examples:

```
email must be unique
order must belong to a customer
quantity must be > 0
price cannot be negative
driver must be approved before accepting rides
order cannot be delivered before pickup
```

Think:

```
What would make the data invalid?
```

That's your constraint discovery process.

**`11. Transactions — WHAT must happen together?`**

Suppose:

```
Customer places order
```

Several things may happen:

```
Create Order
Create Order Items
Calculate total
Reserve inventory
Create payment record
```

Now ask:

```
Which operations must succeed together?
```

Suppose the order gets created but payment record creation fails You might end up with:

```
Order exists
Payment doesn't exist
```

Is that acceptable?

```
Maybe.
  or
Maybe not.
```

This is why transaction boundaries matter. Don't start with:

```
“MongoDB transaction or PostgreSQL transaction?”
```

Start with:

```
What business operation must be treated as one consistent unit?
```

Technology comes later.

**`How Business Rules Turn into Constraints`**

When designing a database, your job is to translate human business rules into machine-readable constraints.

- **`The Rule`**: "Every employee must have a unique identification number."
  - `The Constraint`: You apply a PRIMARY KEY or UNIQUE constraint to the Employee_ID column.

- `The Rule`: "An order cannot be placed without a matching, existing customer."
  - `The Constraint`: You apply a FOREIGN KEY constraint to the Orders table linking it back to the Customers table.

- `The Rule`: "An applicant must be at least 18 years old."
  - `The Constraint`: You apply a CHECK constraint (Age >= 18) to the Age column.

- `The Rule`: "We must always know the product's name."
  - `The Constraint` : You apply a NOT NULL constraint to the Product_Name column.

**`When Business Rules Cannot Be Constraints?`**

Not every business rule can be written as a simple database constraint. Some rules involve complex logic or multiple steps.

For example, a rule like _"If a customer spends over ৳10,000, automatically upgrade them to Premium status and email them a coupon"_ cannot be handled by a basic column constraint. Instead, it must be enforced using database triggers, stored procedures, or application code (backend programming).

# Deep Layer :

At first we need to understand why humans model businesses this way at all. Here's the fundamental idea:

```
A business is a system that manages reality. A business is a system and a system is a business.
```

Imagine a ride-sharing company. Reality:

```
Rider wants a ride.
Driver is available.
Ride is requested.
Driver accepts.
Driver arrives.
Rider gets in.
Trip happens.
Driver completes trip.
Payment occurs.
```

So

```
The database isn't the business. The database is a persistent representation of important facts about that business.
```

That's why your first question should never be:

```
“What tables should I create?”
```

It should be:

```
“What facts about this business need to survive after the program stops running?”
```

# Let's dissect a requirement like an engineer

Take this:

```
“A customer can have multiple saved addresses. The customer can place an order using one of those addresses. Once an order is placed, changing the customer's saved address should not change the delivery address of the existing order.”
```

Don't design anything yet. Let's extract.

**Actors**

```
Customer
```

**Entities**

```
Customer
Address
Order
```

**Relationships**

```
Customer → has → Address
Customer → places → Order
Order → uses → Address
```

**Cardinality**

```
Customer 1 → N Address

Customer 1 → N Order
```

**Business rule**

```
Order must use an address belonging to customer
```

Potentially:

```
Customer cannot place an order using another customer's address.
```

**Historical requirement**

This is the important part:

```
Order's delivery address must remain unchanged even if customer's saved address changes.
```

Now you should immediately recognize:

```
Saved Address
        ≠
Historical Delivery Address
```

They may look similar. They may contain:

```
street
city
postal_code
country
```

But semantically they are different concepts.

# One of the biggest lessons of this entire course

Two objects can have identical fields but represent different business concepts. For example:

```
Address
```

and

```
OrderDeliveryAddress
```

could both have:

```
street
city
postal_code
```

Yet they are not necessarily the same entity. Why?

Because **their meaning and lifecycle are different.** That's called **semantic modeling.**
