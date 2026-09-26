# Normalization

### Standardization — From Business Rules → Stable Database Design

First, one important mindset:

```
Normalization is not primarily about splitting tables.
```

It is about making sure:

```
Each fact has one appropriate home, and relationships between facts are represented correctly.
```

The table-splitting is merely the consequence.

### 1. Why Does Normalization Exist?

```
Database pioneers summary this concept with a famous, clever twist on the courtroom oath: "Every column must describe the key, the whole key, and nothing but the key."
```

Imagine you're building an e-commerce system. A beginner might start with:

```
orders

id
customer_name
customer_email
product1
product2
product3
product1_price
product2_price
product3_price
shipping_address
payment_status
```

At first glance, it looks convenient. But ask yourself:

**Question 1**

What is a customer?

```
customer_name
customer_email
```

That's one business entity.

**Question 2**

What is a product?

```
product_name
product_price
...
```

Another business entity.

**Question 3**

What is an order?

```
order_id
customer
order_date
status
...
```

Another entity.

**Question 4**

What is the relationship between an order and products? An order can contain multiple products. So we have:

```
Customer
    ↓
Order
    ↓
OrderItem
    ↓
Product
```

This structure wasn't memorized. We discovered it from the business.

### 2. The Fundamental Problem: Repeated Facts

Suppose you instead create:

```
orders
--------
id
customer_id
customer_name
customer_email
product_id
product_name
product_price
quantity
```

And imagine:

| order_id | customer_id | customer_name | customer_email    | product_id | product_name        | price  | quantity |
| :------- | :---------- | :------------ | :---------------- | :--------- | :------------------ | :----: | :------: |
| 101      | 7           | Rudra         | rudra@example.com | 50         | Wireless Mouse      | $25.00 |    2     |
| 101      | 7           | Rudra         | rudra@example.com | 51         | Mechanical Keyboard | $89.99 |    1     |

Notice something. The customer's information is repeated three times.

```
Rudra
rudra@mail.com
```

And if the same customer places 100 orders, their information could be repeated hundreds of times. This creates data anomalies . Normalization is largely about preventing this kind of problem.

### 3. The Three Classic Anomalies

Don't just memorize their names. Understand the situations.

**A. Update anomaly**

```
An update anomaly occurs when you want to change a single piece of information, but because that information is repeated across multiple rows, you are forced to update it in every single spot.

If you miss even one row, your database falls out of sync, creating conflicting information
```

Assumed:

```
customer_id = 7
email = rudra@gmail.com
```

appears in `50 rows`. The customer's email address changes. You now have to update:

```
50 rows
```

What if you update 49 and accidentally miss one? Now your database says the customer has two different emails. That's an update anomaly .

### 4. Insert Anomaly

```
An insertion anomaly occurs when you cannot save a specific piece of data into your database because it requires another completely unrelated piece of data to exist first.
```

Suppose your table is:

```
order_items
---------
order_id
customer_id
product_id
product_name
```

You want to add a new product. But the product hasn't been ordered yet. Where do you store it? You can't naturally insert:

```
product_id = 100
product_name = Mechanical Keyboard
```

because your table is fundamentally about order items. So you're forced to create an `order` just to store a product. That's an `insert anomaly` .

A sign that two different concepts have been mixed together.

### 5. Delete Anomaly

```
A deletion anomaly occurs when you delete a specific record to remove one piece of data, but because the database is poorly organized, you accidentally wipe out completely unrelated, critical information at the same time.
```

Imagine:

```
order_id | product_id | product_name
-------------------------------------
101      | 50         | Keyboard
```

Order **`101`** is canceled and deleted. Now you've accidentally lost the only record of:

```
Keyboard
```

The product shouldn't disappear merely because an order disappeared.
Why? Because:

```
Product existence and order existence are different business facts.
```

Therefore they deserve different homes.

```
products
---------
id
name
```

and

```
orders
------
id
...
```

and their relationship:

```
order_items
---------
order_id
product_id
quantity
```

### 6. This Is the Heart of Normalization

Whenever you're designing a table, ask:

```
What does one row represent?
```

This question is unbelievably powerful. For example:

```
customers
```

One row represents:

```
One customer.
```

```
orders
```

One row represents:

```
One order.
```

```
products
```

One row represents:

```
One product.
```

```
order_items
```

One row represents:

```
One product occurrence/line within one order.
```

If you cannot answer clearly:

```
“What does one row represent?”
```

your table design probably needs more thinking.

### 7. Now Let's Understand 1NF

Don't start with:

```
"1NF means atomic values."
```

Instead, ask:

```
What kind of data structure makes a relational table difficult to work with?
```

Consider:

```
A table is in First Normal Form (1NF) when every single cell contains only one single, indivisible value, and there are no repeating groups of data.

You need to apply 1NF right at the beginning of designing a database, usually when you are handed a messy Excel spreadsheet where humans have packed multiple pieces of information into a single box to save space
```

**When Do We Need 1NF? (The Red Flags)**

You must apply 1NF rules if your table has either of these two problems:

- `Comma-Separated Lists`: A single cell holds multiple values (e.g., `"Muffin, Coffee, Juice"` packed into an Items column).

- `Repeating Columns`: You have columns like `Item1, Item2, Item3` stretching out horizontally to accommodate multiple purchases.

**Why this breaks your system:**

- `Searching is a nightmare:` If you want to find every customer who bought a `"Coffee",` you can't just look for an exact match. You have to write messy text-searching code to find the word "Coffee" hidden inside a comma-separated sentence.

- `Updating is risky`: If the price or name of "Muffin" changes, you have to parse through text strings to find and replace it.

**Moving to 1NF (The Solution)**

To bring this table into `1NF`, we must enforce the `"atomic value"` rule: every cell must hold exactly one distinct value. We split the comma-separated row into two clean, separate rows.

| OrderId | ItemId | CustomerName | ItemBought |
| :------ | :----: | -----------: | :--------- |
| 1001    |   1    |          Bob | Muffin     |
| 1001    |   2    |          Bob | Coffie     |
| 1002    |   1    |      Charlie | Juice      |

`Note: Because OrderID 1001 now appears twice, we create a composite primary key using OrderID + ItemID to ensure every row is uniquely identifiable.`

```
orders
--------
id
customer
products
```

Data:

```
1 | Rudra | Keyboard, Mouse, Monitor
```

What's inside `products`? Multiple products. That creates problems.
You can't naturally say:

```sql
WHERE product = 'Mouse'
```

because the field contains a collection encoded as text. Instead:

```
order_items
------------
order_id | product_id | quantity
----------------------------------
1        | 10         | 1
1        | 11         | 2
1        | 12         | 1
```

Now each row represents one order-product relationship. This is the practical idea behind 1NF . Think:

```
A column should represent one value for that row, not an encoded list/set of values.
```

### 8. What 1NF Does NOT Mean

This is where beginners often misunderstand normalization. Atomic doesn't mean:

```
“Every value must contain only one word.”
```

For example:

```
address = "123 Main Street, Chattogram"
```

That's perfectly capable of being one value. `1NF` isn't telling you to split every string into:

```
house
road
city
country
```

Normalization is about the `meaning and structure of data` , not blindly splitting strings. Similarly:

```
full_name = "Rudra Barua"
```

doesn't automatically violate 1NF.

### 9. The Bigger Question After 1NF

Once you've achieved a reasonable row structure, we ask:

```
Does every non-key attribute actually belong to this row's identity?
```

This takes us toward `2NF`. And this is where `composite keys` become important.

### 10. 2NF — Understand the Problem, Not the Definition

Consider:

```
order_items
-----------
order_id
product_id
product_name
product_price
quantity
```

Suppose the primary key is:

```
(order_id, product_id)
```

Why composite? Because:

```
order_id + product_id
```

identifies one specific product inside one order. Now examine the attributes.

**quantity**

Depends on:

```
order_id + product_id
```

because quantity means:

```
How many units of this product are in this order?
```

Thats Good.

And:

**product_name**

Does product name depend on:

```
order_id + product_id
```

No. It depends only on:

```
product_id
```

Likewise:

```
product_price
```

may depend on the product, depending on what "price" means in your model. So you've got:

```
(order_id, product_id)
        ↓
     quantity
```

and:

```
product_id
    ↓
product_name
```

The product information doesn't belong in `order_items` . This is the practical problem that 2NF addresses.

### 11. Partial Dependency

This is the textbook phrase:

```
A non-key attribute shouldn't depend on only part of a composite key.
```

But I want you to translate it mentally into:

```
"Does this attribute describe the entire row, or only one component of the row's identity?"
```

That's much more useful. Our table:

```
order_items
-----------------------------
(order_id, product_id) ← identity

quantity               ← describes this relationship
product_name           ← describes product
```

Therefore:

```
products
-------------
id
name
```

and:

```
order_items
--------------
order_id
product_id
quantity
```

Now each fact has an appropriate home.

### 12. Important Industry Point: 2NF Often Doesn't Feel Dramatic

In many modern production schemas, tables frequently have a simple surrogate primary key:

```
id
```

rather than:

```
(order_id, product_id)
```

For example:

```
order_items
--------------
id
order_id
product_id
quantity
```

Strictly speaking, because the primary key is now:

```
id
```

you don't have the same textbook partial-dependency setup. But the underlying design problem still exists You still shouldn't put:

```
product_name
product_description
product_category
```

inside order_items merely because `product_id` Why? Because those facts describe the product, not the order item This is why you should learn normalization as dependency reasoning, not as a checklist.

### 13. Now 3NF

3NF is where another subtle problem appears. Suppose:

```
employees
------------
id
name
department_id
department_name
department_location
```

Looks reasonable. But ask: What determines `department_name`?

```
department_id
      ↓
department_name
```

What determines `department_location`?

```
department_id
      ↓
department_location
```

The employee's department information is actually describing the `department`. So:

```
employees
-----------
id
name
department_id
```

and:

```
departments
----------
id
name
location
```

Now:

```
employee
   ↓
department
```

### 15. A Very Important Mental Model

When you're looking at a table, classify every column. Assumed:

```
orders
---------
id
customer_id
customer_name
customer_email
status
created_at
```

Ask about every field:

**`id`**

What is it?

```
Order identity
```

Good.

**`customer_id`**

What is it?

```
Relationship to customer
```

Good.

**`customer_name`**
What does it describe?

```
Customer
```

Potential problem.

**`customer_email`**

What does it describe?

```
Customer
```

Potential problem.

**`status`**

What does it describe?

```
Order
```

Good.

**`created_at`**

What does it describe?

```
Order
```

Good.

So:

```
orders
-----------
id
customer_id
status
created_at
```

and:

```
customers
-------
id
name
email
```

### 16. The “One Fact, One Home” Principle

This is one of the best mental models you can take from normalization. Assumed:

```
customer_id = 7
customer_name = Rudra
customer_email = rudra@gmail.com
```

Where should the fact:

```
Rudra's email = rudra@gmail.com
```

live?

In:

```
customers
```

Not:

```
orders
```

because that's fundamentally a `customer fact` . Likewise:

```
product_id = 50
product_name = Keyboard
```

belongs to:

```
products
```

And:

```
order 101 contains product 50, quantity 3
```

belongs to:

```
order_items
```

This gives us:

```
customers
     │
     │
     ▼
   orders
     │
     │
     ▼
order_items
     │
     │
     ▼
  products
```

### 17. But Here's an Industry-Level Twist

You may now think:

```
"Okay, then I should never duplicate data."
```

`No`.

That's an important misconception. Production database design does not mean:

```
"Never duplicate anything."
```

Normalization gives you a strong normalized foundation. But sometimes `controlled denormalization` is useful.

```
Controlled denormalization is the intentional, strategic practice of adding redundant or duplicated data back into a highly normalized database.

It is "controlled" because you aren't doing it out of laziness or bad design; you are doing it on purpose to massively speed up data retrieval (read performance) at the cost of slightly more complex data inserts and updates.
```

For example, consider an order. Today a product costs:

```
৳1,000
```

Customer purchases it. Six months later:

```
Product price = ৳1,500
```

What should the old order show? Obviously, the historical purchase price:

```
৳1,000
```

Therefore `order_items` may legitimately contain:

```
order_id
product_id
quantity
unit_price
```

even though products also has a current price. Is that a bad normalization?

```
No.
```

Because these represent different business facts:

```
products.price
    ↓
current/catalog price
```

versus:

```
order_items.unit_price
    ↓
price actually used for this transaction
```

This is not `accidental duplication` . It's a deliberate historical/business fact.

### 18. Normalization Is About Meaning

Compare these two:

**Bad duplication**

```
orders
-----------
customer_id
customer_name
customer_email
```

because:

```
customer_id → customer_name
customer_id → customer_email
```

And these are customer facts.

**Legitimate snapshot**

```
order_items
--------------
product_id
unit_price
```

where `unit_price` means:

```
Price charged in this particular transaction.
```

The two values ​​might currently be equal to the product's price, but they represent `different` facts.

### 19. Another Production Example: Shipping Address

Assumed:

```
customers
------------
id
name
address
```

and:

```
orders
-------------
id
customer_id
```

Should an order always dynamically use the customer's current address? Imagine:

```
2026:
Customer lives in Chattogram.

2027:
Customer moves to Dhaka.
```

If the old order dynamically joins the customer table, you might display:

```
Dhaka
```

for an order that was shipped to:

```
Chattogram
```

That's incorrect historically. So an order might have a snapshot:

```
orders
---------------
id
customer_id
shipping_address
...
```

Again:

```
This is intentional duplication representing a different business fact.
```

### 20. This Is Where Beginners Get Tricked

They learn:

```
"Normalization removes duplication."
```

Then they see:

```
customers.address
orders.shipping_address
```

and think:

```
"Breach!"
```

Not necessarily. Ask:

```
Are these two columns representing the same fact?
```

If:

```
customers.address
```

means:

```
Customer's current/default address
```

and:

```
orders.shipping_address
```

means:

```
Address used for this particular order
```

Then they are different facts . Therefore both can be correct.

### 21. Normalization ≠ Maximum Number of Tables

Another huge misconception. Suppose you have:

```
users
------------
id
first_name
last_name
email
```

Don't create:

```
user_first_names
user_last_names
user_emails
```

just because you're trying to "normalize." That's nonsense. Normalization doesn't mean:

```
Split everything.
```

It means:

```
Structure data according to its dependencies and business meaning.
```

### 22. Let's Design a Real System

Let's say the business says:

```
"Users can place orders. An order contains multiple products. A product belongs to a category. A product can have multiple images. Users can save multiple addresses."
```

Don't start writing SQL. First extract the nouns:

```
User
Order
Product
Category
Image
Address
```

Then identify relationships.

```
User 1 ──── N Order

Order 1 ──── N OrderItem

Product 1 ──── N OrderItem

Category 1 ──── N Product

Product 1 ──── N ProductImage

User 1 ──── N Address
```

Then identify what belongs to each entity.

**User**

```
users
------------
id
name
email
password_hash
created_at
```

**Category**

```
categories
-------------
id
name
slug
```

**Product**

```
products
--------------
id
category_id
name
description
price
stock
```

**Order**

```
orders
----------------
id
user_id
status
shipping_address
created_at
```

**OrderItem**

```
order_items

id
order_id
product_id
quantity
unit_price
```

**Product Image**

```
product_images
-------------------
id
product_id
url
sort_order
```

**Address**

```
addresses
------------
id
user_id
label
street
city
...
```

Now look at what happened. We didn't say:

```
"Let's apply 1NF."
```

then:

```
"Let's apply 2NF."
```

then:

```
"Let's apply 3NF."
```

Instead:

```
Business → entities → facts → relationships → dependencies → tables.
```

Normalization is happening underneath that reasoning.

### 23. The Functional Dependency Mindset

Now we need to introduce one concept deeply because it makes normalization much easier:

**Functional dependency**

Assumed:

```
customer_id = 7
```

uniquely identifies:

```
customer_name
customer_email
```

We can express:

```
customer_id → customer_name
customer_id → customer_email
```

Read it as:

```
Knowing the customer ID determines which customer name/email we're talking about.
```

Similarly:

```
product_id → product_name
product_id → current_price
```

And:

```
order_id → order_status
```

And:

```
(order_id, product_id) → quantity
```

Functional dependencies are basically telling you:

```
Which piece of information determines another piece of information?
```

This is the mathematical foundation underneath normalization.

### 24. Why Dependencies Matter

Imagine:

```
orders
-----------
order_id
customer_id
customer_name
```

You have:

```
order_id → customer_id
customer_id → customer_name
```

Now:

```
customer_name
```

isn't really an order property. It's customer property. That's your signal that the schema is mixing different entities. Move:

```
customer_name
```

to:

```
customers
```

and keep:

```
orders.customer_id
```

as the relationship.

### 25. Primary Key: Your Table’s Identity

This connects directly to standardization. For every table, ask:

```
What uniquely identifies one row?
```

For:

```
customers
```

answer:

```
customer_id
```

For:

```
orders
```

answer:

```
order_id
```

For:

```
order_items
```

you might use:

```
id
```

or:

```
(order_id, product_id)
```

depending on your modeling requirements. The key tells you what the row is . Then ask:

```
What facts depend on that identity?
```

That's normalization thinking.

### 26. Candidate Keys Matter Too

Don't just think about `id`. Assumed:

```
users
-------------
id
email
name
```

You might have:

```
id → email
email → id
```

if email is `unique`. Both may be candidate keys. In production, you might choose:

```
id
```

as the primary key and enforce:

```
UNIQUE(email)
```

This is important because database correctness isn't achieved merely through table names. You also need:

- primary keys
- foreign keys
- unique constraints
- NOT NULL
- CHECK constraints
- appropriate indexes
- appropriate data types

Normalization is one part of relational integrity.

### 27. Normalization and Relationships Are Connected

This is why your earlier confusion around:

```
1:1
1:N
N:1
N:M
```

is actually related to normalization. Assumed:

```
A doctor can have many appointments.
```

Then:

```
doctors
    id

appointments
    id
    doctor_id
```

The relationship is represented through:

```
appointments.doctor_id
```

You don't store:

```
doctor.appointment1
doctor.appointment2
doctor.appointment3
```

because that's trying to encode a relationship as repeated columns.

### 28. Many-to-Many Is Especially Important

Assumed:

```
Students can enroll in many courses, and courses can have many students.
```

Don't do:

```
students
--------------
id
course1
course2
course3
```

or :

```
courses
---------------
id
student1
student2
student3
```

Instead:

```
students
courses
enrollments
```

with:

```
enrollments
----------------
student_id
course_id
enrolled_at
grade
```

Why? Because:

```
Student ↔ Course
```

is a many-to-many relationship. The relationship itself becomes a thing we can model. And notice something beautiful:

```
enrollments
```

can contain facts about the relationship:

```
enrolled_at
grade
status
```

That's exactly the kind of thinking you need for production database design.

### 29. Normalization Doesn’t Tell You Everything

This is extremely important. You can have a database that is technically normalized and still be a terrible production design.For example:

```
users
orders
products
order_items
```

might be normalized. But production design still requires questions like:

**Constraints**

Can an order item reference a nonexistent product?

```
FOREIGN KEY
```

**Uniqueness**

Can two users have the same email?

```
UNIQUE
```

**Nullability**

Can an order exist without a customer?

```
Depends on business rules.
```

**Indexing**

Do we frequently query:

```sql
WHERE user_id = ?
```

Then an index may be appropriate.

**Lifecycle**

Can products be deleted?

```
Maybe soft deletion is required.
```

**Historical data**

Should product names/prices be snapshotted into order items?

```
Depends on business requirements.
```

**Concurrency**

What happens when two customers purchase the last item?

```
Normalization doesn't solve that.
```

**Performance**

Should some read-heavy data be deliberately denormalized?

```
Possibly.
```

So:

```
Normalization is necessary knowledge, but it is not the entirety of production database design.
```

### 30. Normalization Levels Beyond 3NF

You should know the broader landscape, but don't let it become memorization.

**1NF**

```
Deal with repeating groups / non-relationally structured values.
```

**2NF**

```
Deal with attributes depending on only part of a composite key.
```

**3NF**

```
Deal with non-key attributes depending on other non-key attributes.
```

**BCNF**

```
A stricter form of 3NF concerning determinants and candidate keys.
```

**4NF**

```
Deals with certain independent multi-valued dependencies.
```

**5NF**

```
Deals with more complex join dependencies.
```

For most application development:

```
1NF → 2NF → 3NF + understanding BCNF is plenty for your practical foundation.
```

You should know `4NF/5NF` exist, but don't turn them into a memorization project right now.

### 31. A More Useful Classification

When you encounter a table, ask these questions.

**Question 1 — What is one row?**

```
One customer?
One order?
One product?
One order item?
One payment?
One appointment?
```

If you can't answer, stop.

**Question 2 — What is the key?**

```
What uniquely identifies this row?
```

**Question 3 — What does each column describe?**

For every column:

```
Does it describe the row itself?
```

If not:

```
Why is it here?
```

**Question 4 — Does this column depend on the whole key?**

Especially with composite keys.

**Question 5 — Does one non-key attribute determine another?**

Example:

```
department_id → department_name
```

inside:

```
employees
```

That's a warning.

**Question 6 — Is this duplication accidental or intentional?**

This is an `industry-level question` .

```
customer.email repeated in orders
```

Probably accidental.

But:

```
order_items.unit_price
```

may be intentional historical data.

**Question 7 — What business rule am I representing?**

This is the biggest one.

### 33. Let's Do Your Original Example Properly

You started with:

```
orders
-----------------
id
customer_name
customer_email
product1
product2
product3
svg
```

Let's reason rather than "normalize."

**Step 1 — What is the row?**

Probably:

```
One order.
```

Good.

**Step 2 — Which attributes describe the order?**

Potentially:

```
id
status
created_at
...
```

**Step 3 — Which attributes describe the customer?**

```
customer_name
customer_email
```

Move those to:

```
customers
```

**Step 4 — What does product1, product2, product3 mean?**

It represents multiple products. That's a repeating group. Create:

```
order_items
```

**Step 5 — What describes the product?**

```
product_name
price
...
```

Move to:

```
products
```

**Step 6 — What describes the relationship between order and product?**

Potentially:

```
quantity
unit_price
discount
```

Those belong in:

```
order_items
```

So we arrive at:

```
customers
---------
id
name
email
```

```
orders
------
id
customer_id
status
created_at
```

```
products
--------
id
name
price
```

```
order_items
-----------
id
order_id
product_id
quantity
unit_price
```

That's not because we memorized:

```
"Normalization says four tables."
```

It's because the business facts demand those boundaries.

### 35. Your New Database-Design Brain

When you see:

```
customer_name
customer_email
```

don't immediately think:

```
"3NF!"
```

Think:

```
Customer facts.
```

When you see:

```
product_name
product_price
```

think:

```
Product facts.
```

When you see:

```
quantity
```

inside an order-product context, then its :

```
Relationship fact.
```

When you see:

```
order_status
```

think:

```
Order fact.
```

When you see:

```
payment_transaction_id
payment_status
amount_paid
```

think:

```
Payment/transaction domain facts.
```

That's the skill.

### 36. And One Final Rule

Don't aim for:

```
"The most normalized database possible."
```

Aim for:

```
"A database whose structure accurately represents the business, preserves data integrity, avoids accidental redundancy, and supports the application's real queries and lifecycle."
```

Usually that starts with a well-normalized relational model. Then, only when you have a reason , you introduce deliberate denormalization.
