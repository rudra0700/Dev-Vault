## Your new database-design vocabulary

From now on, I want you to think in these terms:

**Discovery**

```
Actor
Entity
Attribute
Action
```

**Structure**

```
Relationship
Cardinality
Optionality
Ownership
```

**Behavior**

```
Business Rule
State
State Transition
Invariant
```

**Time**

```
Current State
Historical Fact
Effective Date
Audit/Event
```

**Integrity**

```
Constraint
Uniqueness
Referential Integrity
Validation
Consistency
```

**Atomicity**

```
Business Operation
Transaction Boundary
Consistency
Failure Scenario
```

Later we'll add:

```
Aggregate
Bounded Context
Lifecycle
Identity
Normalization
Denormalization
Temporal Modeling
Concurrency
Idempotency
Soft Delete
Audit Trail
Event Modeling
Read Model
Write Model
```

### Our Level 1 curriculum

**Level 1A — Business vocabulary**

```
What is a business domain?
Actor vs entity
Entity vs object
Nouns vs meaningful business concepts
Attributes
Identifying an entity's identity
```

**Level 1B — Behavior**

```
Actions/events
Commands vs events
Business rules
Invariants
Preconditions/postconditions
```

**Level 1C — Relationships**

```
One-to-one
One-to-many
Many-to-many
Cardinality
Optional vs mandatory relationships
Relationship attributes
Ownership
```

**Level 1D — Time**

```
State
State transitions
Lifecycle
Current vs historical data
Snapshots
Audit history
```

**Level 1E — Integrity**

```
Constraints
Uniqueness
Referential integrity
Validation
Consistency
Failure scenarios
```

**Level 1F — Business operations**

```
Transactions
Transaction boundaries
Atomic operations
Concurrency
Idempotency
```

And finally:

```
Level 1G — Requirement → Business Model
```

Burn this into your brain:

```
Don't design the database from the nouns. Model the business from its facts, behaviors, relationships, rules, and time.
```

And one more:

```
A database schema is the implementation of a business model—not the starting point.
```

```
LEVEL 2 — ENTITY IDENTIFICATION
        ↓
1. Entity
2. Attribute
3. Relationship
4. Event / Transaction
5. Value Object
        ↓
LEVEL 3 — ENTITY DISCOVERY FROM REQUIREMENTS
        ↓
6. How to extract entities from a real project
7. How to distinguish Entity vs Attribute
8. How to distinguish Entity vs Value Object
9. How to discover hidden entities
10. How to discover relationship entities
11. How to detect lifecycle entities
12. How to detect audit/history requirements
        ↓
LEVEL 4 — RELATIONSHIP MODELING
        ↓
1:1 / 1:N / M:N
Optionality
Ownership
Composition
Association
Cardinality
Constraints
        ↓
LEVEL 5 — DATABASE STRUCTURE
        ↓
Tables / collections
Normalization
Keys
Constraints
Indexes
Transactions
```

```
functional dependencies + candidate keys + primary keys/composite keys ,
```

