## The “Must-Know” TypeScript (80% of daily use)

- **[Real World Example](#some-real-world-example)**

**Basic Types (FOUNDATION)** :

```typescript
let name: string = "Rudra";
let age: number = 25;
let isAdmin: boolean = false;
```

```typescript
let data: any; // avoid if possible
let value: unknown; // safer than any
```

**Arrays & Objects (SUPER COMMON)** :

```typescript
let numbers: number[] = [1, 2, 3];

let user: {
  name: string;
  age: number;
} = {
  name: "Rudra",
  age: 28,
};
```

**Function Types (VERY IMPORTANT)** :

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

**Interfaces (MOST USED IN REAL PROJECTS)**

```typescript
// Think of interface as a contract/blueprint for objects.In TypeScript, an interface is a powerful contract that defines the "shape" or structure of an object.

// It specifies exactly what properties and methods an object must have, without dictating how they are implemented.

// Used for:

// API response types
// Props in React
// Database models (kinda)
// -----------------------------------------------

// 1. Typing Objects (MOST BASIC + MOST USED)
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: rudra,
  age: 26,
};

// =======================Start==================================>

// 2. Typing API Responses (VERY REAL USE CASE)

// The Promise keyword is used because getUser is an async (asynchronous) function.

// In JavaScript and TypeScript, any function marked with async automatically returns a Promise, even if you return a plain value inside the code.

// The angle brackets <User> use a feature called Generics. It tells the TypeScript compiler exactly what kind of data will eventually arrive inside that placeholder object.

// --> Promise = This function is asynchronous and returns a placeholder.

// --> <User> = When the placeholder resolves (finishes), it will contain an object that matches the User interface structure.

interface User {
  _id: string;
  name: string;
  email: string;
}

async function getUser(): Promise<User> {
  const res = await fetch("/api/user");
  return res.json();
}

// Anyone who calls your getUser function knows they must use await or .then() to extract the actual User object:

// To get the data, you must await the promise
const user: User = await getUser();
console.log(user.name); // TypeScript knows this is safe

// ======================End================================>

// 3. Optional Properties
interface User {
  name: string;
  age?: number;
}

// 4. Readonly Properties
interface User {
  readonly _id: string; // Prevent accidental changes (important in DB data).
  name: string;
}

// 5. Function Types
interface Add {
  (a: number, b: number): number;
}

const add: Add = (a, b) => a + b; // Used in callbacks, utilities.

// 6. Interfaces for React Props (SUPER IMPORTANT)
interface Props {
  name: string;
  age: number;
}

function Profile({name, age} : Props){
  return <div>{name} - {age}</div>
}

// 7. Nested Objects
interface User {
  name: string;
  address: {
    city: string;
    country: string;
  };
}

// 8. Extending Interfaces (INHERITANCE) - Reuse structure — very powerful.
interface Person {
  name: string;
}

interface User extends Person {
  email: string;
}

// 9. Multiple Interface Extension
interface A {
  a: string;
}

interface B {
  b: number;
}

interface C extends A, B {}

// 10. Index Signatures (Dynamic Keys)
interface Errors {
  [key: string]: string;
}

const error : Errors = {
  email: "Invalid Email",
  password: "Too short"
}

// 11. Interface with Arrays
// It means, below code block, every element of the array should be an object and that object has to be have a name property and value must be a string.

interface User {
  name: string
}

const users : User[] = [
  {name: "A"},
  {name: "B"},
]

// 12. Method Inside Interface
interface User {
  name: string;
  greet() : void
}

const user : User = {
  name: "Rudra",
  greet() {
    console.log("Rudra is here")
  }
}

// 13. Interface for Classes (Important if you use OOP)
interface Animal {
  name: string;
  makeSound() : void
}

class Dog implements Animal {
  name : "Tommy",
  makeSound() {
    console.log("Bark")
  }
}

// 14. Merging Interfaces (UNIQUE FEATURE)
interface User {
  name: string;
}

interface User {
  age: number;
}

// automatically becomes
{
  name: string;
  age: number
}

// 15. Interface with Generics
interface ApiResponse<T>{
  data: T;
  success: boolean;
}

const res : ApiResponse<string> = {
  data: "Hello",
  success: true
}

// 16. Interface for Function Props (React Advanced)
interface Props {
  onClick: (id: string) => void;
}

// 17. Partial Data Handling (Common Pattern)
interface User {
  name: string;
  age: number;
}

const updateUser = (data: Partial<User>) => {
  // update logic (Very common in updating APIs)
};

// 18. Interface for External Libraries / Data
interface ApiError {
  message: string;
  status: number;
}
```

**Optional & Default Properties** :

```typescript
interface User {
  name: string;
  age?: number; // optional
}
```

**Type Aliases (Alternative to interface)** :

```typescript
type User = {
  name: string;
  age: number;
};

// You can both type and interface.
```

**Union Types (VERY VERY COMMON)** :

```typescript
// Its quite similar like Logical OR operator

let id: string | number;

// How to use

function printId(id: string | number) {
  // This means id can be only string or number
  console.log(id);
}
```

**Type Inference (Don’t Overthink TS)** :

```typescript
// You don’t always need to write types manually.

let name = "Rudra"; // TS automatically knows it's string
```

**Generics (IMPORTANT)** :

```typescript
function identity<T>(value: T): T {
  return value;
}

// Used in:

// React hooks
// API utilities
// Reusable functions
```

**Type Assertion (You WILL see this)**

```javascript
const input = document.getElementById("name") as HTMLInputElement;
```

**Enums (LESS used but good to know)**

```typescript
enum Role {
  ADMIN,
  USER,
}
```

## Some Real World Example

```typescript
interface User {
  _id: strring;
  name: string;
  email: string;
}

const getUser = async (): Promise<User> => {
  const res = await fetch("/api/v1/user");
  return res.json();
};

// ====================start==============================>

// Without Generics (Specific & Rigid)

// If you want a function that returns whatever value you give it, you might write it for a string. But then you cannot reuse it for a number.

function echoString(item: string): string {
  return item;
}

echoString("Hello"); // Works
echoString(123); // ❌ Error! Cannot pass a number.

// With Generics (Flexible & "Generic")

// Instead of fixing the type, you use a Type Variable (usually written as <T>). This <T> acts as a placeholder for a generic type.

// 'T' is a placeholder for any type
function echo<T>(item: T): T {
  return item;
}

// Now you can reuse the exact same function for any "brand" of data type!
let output1 = echo<string>("Hello"); // T becomes string
let output2 = echo<number>(123); // T becomes number
let output3 = echo<boolean>(true); // T becomes boolean

// ====================end==============================>
```

```typescript
// ReadOnly properties Example

// 1. Database IDs (Most Important Use Case)
// Its important because _id is a primary key, by changing it database relation, caching and authentication can break.

// readonly is about intent + safety , not runtime protection.
// TypeScript prevents changes at compile time.
// JavaScript still allows it at runtime (unless frozen).


interface User {
  readonly _id: string;
  name: string;
}

const user: User = {
  _id: "abc123",
  name: "Rudra",
};

// Not allowed
user._id = "xyz999"; // Error

// Allowed
user.name = "Updated Rudra";

// 2. Payment / Transaction Data
// You should never allow transaction details to be modified after creation.

// Its important because, it prevents fraud or accidental overwrites and
// Financial data must be immutable

interface Transaction {
  readonly transactionId: string;
  readonly amount: number;
  readonly createdAt: Date;
  status: "completed" | "pending";
}

const tx: Transaction = {
  transactionId: "txn_001",
  amount: 500,
  createdAt: new Date(),
  status: "pending",
};

// Not allowed
tx.amount = 1000; // Error

// Allowed
tx.status = "completed";

// 3. Configuration / Environment Settings
// Config values ​​should not change at runtime.

interface AppConfig {
  readonly API_URL: string;
  readonly PORT: number;
}

const config: AppConfig = {
  API_URL: "https://api.example.com",
  PORT: 3000,
};

// Not allowed
config.PORT = 5000;

// 4. Authenticated User Identity
// User identity should not be mutated after login.

interface AuthUser {
  readonly userId: string;
  readonly email: string;
  role: "user" | "admin";
}

const currentUser: AuthUser = {
  userId: "u123",
  email: "user@mail.com",
  role: "user"
};

// Not allowed
currentUser.email = "hacker@mail.com";

// Allowed
currentUser.role = "admin";

// 5. React Props (Very Common in Frontend)
// Props should be treated as immutable because react relies on immutability for re-render logic

interface Props {
  readonly title: string;
}

function Header(props: Props) {
  // Not allowed
  // props.title = "New Title";

  return <h1>{props.title}</h1>;
}

// 6. Readonly Arrays (Prevent mutation)
// Prevent accidental mutation of shared data

const numbers: readonly number[] = [1, 2, 3];

// Not allowed
numbers.push(4);
numbers[0] = 10;

// Allowed
console.log(numbers[0]);

// 7. Domain Models (Business Logic Protection)
// SKU is unique identifier → must stay constant.

interface Product {
  readonly sku: string;
  name: string;
  price: number;
}

const product: Product = {
  sku: "SKU123",
  name: "Laptop",
  price: 1000
};

// Not allowed
product.sku = "SKU999";

// 8. Readonly arrays / tuples — prevent accidental push/pop

function printAll(items: readonly string[]) {
  items.push("new item"); // Error: Property 'push' does not exist on type 'readonly string[]'
  console.log(items.join(", "));
}

const fixedCoordinates: readonly [number, number] = [10, 20];
// fixedCoordinates[0] = 99; // Not allowed


// 9. Readonly<T> utility type — make an entire object immutable

interface Settings {
  theme: string;
  language: string;
}

const settings: Readonly<Settings> = { theme: "dark", language: "en" };
// settings.theme = "light"; // Error: all properties become readonly

// If you want runtime safety:

Object.freeze(user);
```

```typescript
// Void example

// In TypeScript, void means: “this function does not return anything” .

// void= “just do something, don’t give anything back”

// TypeScript is all about type safety .

// By using void,
// Make your intention clear
// Prevent accidental returns

interface User {
  name: string;
  greet(): void;
}

const user: User = {
  name: "Rudra",
  greet() {
    console.log("Rudra is here"); // Here greet just printing, not return anything.
  },
};

greet(): void {
  return "Hello"; // ❌ TypeScript will warn (not allowed)
}

// ====================== void vs undefined =====================

// void  = return nothing
// undefined = actual value

function test(): void {
  return; // ✅ ok
}

function test2(): undefined {
  return undefined; // ✅ must return explicitly
}

// 1. Logging / Side Effects
function logMessage(message: string): void {
  console.log(message);
}

// 2. Event Handlers (VERY COMMON)
function handleClick(): void {
  console.log("Button clicked");
};

 // used in react
<button onClick={handleClick}>Click</button>

// 3. API Call (no return needed)
async function sendData(): Promise<void> {
  await fetch("/api/data", { // You don't care about return → just success
    method: "POST",
  });
};

// 4. Updating State (React style)
function updateUserName(name: string): void {
  // imagine setState
  console.log("Updated:", name);
}

// 5. Interface Methods
interface Logger {
  log(message: string) : void
}

// Quick Comparison
function add(a: number, b: number): number {
  return a + b; // returns value
}

function printSum(a: number, b: number): void {
  console.log(a + b); // no return
}


// 3. Callback parameter type (very common in real apps)
function fetchData(url: string, callback: (data: string) => void): void {
  // simulate async work
  setTimeout(() => {
    callback("some data");
  }, 1000);
}

fetchData("api/users", (data) => {
  console.log("Received:", data);
});
```
