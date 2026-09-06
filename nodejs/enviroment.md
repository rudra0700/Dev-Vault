# Enviroment variable
- **[Basic](./basic.md)**

Things we covered below :

```
1. What is enviroment?
2. what actually is an environment variable?
3 .env≠ environment variables
4. What is it process?
5. Environment variables come from outside your application
6. Why do we use .env
7 .env.example is an industry-friendly pattern
8. Environment variables are ALWAYS strings
9. Don't scatter process.enveverywhere
10. But don't blindly use || for secrets
11. Fail fast: a major industry practice
12. Even better: validate environment variables
13. A production-oriented configuration structure
14. Development vs. Production
15. Where does production get environment variables?
16. .env is a development convenience, not a security system
17. Don't put secrets into frontend environment variables
18. Environment variables vs configuration
19. Rules to be remember when it comes to enviroment variables
```

### 1. What is enviroment?

Every time you run a Node.js application **`(by typing node app.js)`**, the operating system spins up a new process. That process is given its own tiny sandbox or "environment" space by the OS. In the context of Node.js, **`the "environment" refers to the specific execution context and operating system process in which your application is running.`** It is the surrounding ecosystem provided by the machine or cloud infrastructure that hosts your code

### 2. what actually is an environment variable?

An environment variable is simply a key-value pair provided to a running process by its environment . For example:

```
PORT=5000
DATABASE_URL=mongodb://localhost:27017/mydb
JWT_SECRET=some-secret
```

Think of your Node application as:

```
Operating System
      ↓
Environment variables
      ↓
Node.js process
      ↓
process.env
      ↓
Your application
```

So when you write:

```javascript
console.log(process.env.PORT);
```

Node isn't magically reading a **`.envfile.`** It is asking:

```
"Does the environment of this Node process contain a variable named PORT?"
```

### 3 .env≠ environment variables

Suppose you have:

```
.env
```

containing:

```
PORT=5000
DATABASE_URL=mongodb://localhost:27017/mydb
JWT_SECRET=abc123
```

You might think:

```
.env
   ↓
process.env
```

But Node doesn't historically treat **`.env`** as the operating system environment automatically . Something has to load those values.
Modern Node.js can load **`.env`** files itself, and libraries such as **`dotenv`** have traditionally been used for this too.

For example, with dotenv:

```javascript
import "dotenv/config";
console.log(process.env.PORT);
```

Conceptually:

```
.env
 ↓
dotenv
 ↓
process.env
 ↓
your code
```

With Node's built-in .envsupport, you can also start Node with an env file:

```
node --env-file=.env server.js
```

Then:

```javascript
console.log(process.env.PORT);
```

### 4. What is it process?

Node gives your application a global object called:

```
process
```

It represents the currently running Node.js process . For example:

```javascript
console.log(process);
```

There is a huge amount of information there. Among them:

```
process.env
```

**`process.env`** contains the environment variables available to your Node process. For example:

```javascript
console.log(process.env);
```

might contain things like:

```javascript
{
  PATH: "...",
  HOME: "...",
  PORT: "5000",
  DATABASE_URL: "...",
  JWT_SECRET: "..."
}
```

### 5. Environment variables come from outside your application

From the perspective of the Node.js runtime engine, that file is completely external until an outside tool explicitly injects it.

**Node.js Cannot Read .env Files Naturally**

If you write a standard Node.js file and try to access a variable you typed in your .env file, Node.js will return undefined.

```javascript
console.log(process.env.PORT); // ❌ Returns 'undefined' naturally!
```

Node.js only looks at the Operating System's environment. It has no idea what a **`.env`** file is. For those variables to get into your code, **`an external tool`** must read the file and inject those values into the OS process before or as your code starts running.

**How the Variables Actually Get In?**

When you use a tool like **`dotenv`** or Node's native **`--env-file`** flag, a distinct three-step process happens:

- **`The Operating System`** starts a new memory process for Node.js.
- **`The Injector (like the dotenv package)`** opens your .env file, reads it as plain text, and pushes those key-value pairs into the OS process memory.
- **`Your Application Code`** finally runs and reads them out of the process memory using process.env.

The **`.env`** file is essentially just a local "simulator" of the cloud environment.

**.env Is Never Deployed**

The biggest proof that **`.env`** is outside your application is that it should never leave your computer.

Your project should include a **`.gitignore`** file that explicitly blocks **`.env`** from being pushed to GitHub.

- **`On your laptop`**: The dotenv tool reads your local .env file to mimic an environment.

- **`On the production server (like AWS or Render)`**: There is no .env file. Instead, you type those exact same variables into the cloud platform's dashboard settings.

Because your code looks at **`process.env`** and not the literal file, it doesn't care whether the values came from a local text file or a secure cloud dashboard.

Your application can be:

```javascript
const port = process.env.PORT;
```

But the application itself doesn't necessarily define PORT. The environment running the application can define it. For example, Linux:

```
PORT=5000 node server.js
```

Now inside Node:

```
console.log(process.env.PORT);
```

you get:

```
5000
```

This is powerful because the same code can run in different environments.

```
Development
PORT=5000
DATABASE_URL=local_database
Production
PORT=8080
DATABASE_URL=production_database
```

Your source code remains:

```
const port = process.env.PORT;
const database = process.env.DATABASE_URL;
```

No source-code modification is required.

### 6. Why do we use .env?

During local development, manually doing this every time:

```
PORT=5000 DATABASE_URL=... JWT_SECRET=... node server.js
```

would be annoying. So we commonly create **`.env`** file

```
PORT=5000
DATABASE_URL=mongodb://localhost:27017/myapp
JWT_SECRET=super-secret
```

Then load it. Traditionally:

```
npm install dotenv
```

and:

```javascript
import dotenv from "dotenv";
dotenv.config();
```

Now:

```
process.env.PORT
process.env.DATABASE_URL
process.env.JWT_SECRET
```

are available.

### 7 .env.example is an industry-friendly pattern

Instead of committing:

```
DATABASE_URL=actual-password-here
JWT_SECRET=actual-secret
```

you commit:

```
PORT=5000
DATABASE_URL=
JWT_SECRET=
STRIPE_SECRET_KEY=
```

This tells another developer:

```
"These are the environment variables this application expects."
```

### 8. Environment variables are ALWAYS strings

Assumed:

```
PORT=5000
DEBUG=true
MAX_CONNECTIONS=10
```

```javascript
typeof process.env.PORT; // you might think  its a number but its a string. Even boolean value is also string
```

To convert into actual value do this instead :

```javascript
const port = Number(process.env.PORT);
const debug = Boolean(process.env.DEBUG);
```

### 9. Don't scatter process.enveverywhere

You can do this:

```javascript
import mongoose from "mongoose";
mongoose.connect(process.env.DATABASE_URL);
```

And:

```javascript
jwt.sign(payload, process.env.JWT_SECRET);
```

And:

```javascript
app.listen(process.env.PORT);
```

But in a growing application, this becomes messy. You'll eventually have:

```
process.env.PORT
process.env.DATABASE_URL
process.env.JWT_SECRET
process.env.CLIENT_URL
process.env.STRIPE_SECRET_KEY
process.env.REDIS_URL
process.env.CLOUDINARY_API_KEY
...
```

spread throughout your entire codebase. A better pattern is to have a central configuration layer .For example:

```
src/
├── config/
│   └── env.js
├── modules/
├── routes/
├── controllers/
└── server.js
```

env.js:

```javascript
const env = {
  port: Number(process.env.PORT || 5000),

  databaseUrl: process.env.DATABASE_URL,

  jwtSecret: process.env.JWT_SECRET,

  clientUrl: process.env.CLIENT_URL,
};

export default env;
```

Then:

```javascript
import env from "./config/env.js";
console.log(env.port);
```

This gives you one central place to understand your application's configuration.

### 10. But don't blindly use || for secrets

You'll sometimes see:

```javascript
const jwtSecret = process.env.JWT_SECRET || "secret";
```

This is convenient during tutorials. But for production, it's dangerous. Imagine:

```
JWT_SECRET
```

is accidentally missing. Your application silently uses:

```
secret
```

Now your application has a serious security problem. For **`required configuration`**, fail fast instead.

### 11. Fail fast: a major industry practice

For example:

```javascript
const requiredEnv = ["DATABASE_URL", "JWT_SECRET"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}
```

Now if:

```
JWT_SECRET
```

is missing, the application doesn't start. That's good.

Instead of:

```
Server started...
Database connection failed later...
Authentication mysteriously broken...
```

you will get:

```
Error: Missing environment variable: JWT_SECRET
```

immediately. This principle is called fail fast .

### 12. Even better: validate environment variables

As applications become more serious, use a schema validator. For example:

```javascript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),

  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(1),
});

const env = envSchema.parse(process.env);

export default env;
```

Now:

```
env.PORT
env.DATABASE_URL
env.JWT_SECRET
```

are validated when the application starts. This is much stronger than:

```
process.env.SOMETHING
```

everywhere.

### 13. A production-oriented configuration structure

```
src/
│
├── config/
│   └── env.js
│
├── modules/
│   ├── auth/
│   ├── users/
│   └── products/
│
├── middleware/
├── routes/
├── app.js
└── server.js
```

config/env.js:

```javascript
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().default(5000),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(1),

  CLIENT_URL: z.string().url(),
});

const env = schema.parse(process.env);
export default env;
```

Then anywhere:

```javascript
import env from "./config/env.js";

console.log(env.NODE_ENV);
console.log(env.PORT);
```

Sometimes you need external package like **`dotenv`** to load the enviroments variable to your application. Then the codebase would be :

```javascript
// env.js
import "dotenv/config"; // 1. IMPORTANT: This must be the very first line to load .env into process.env
import { z } from "zod";

// 2. Define the exact shape and rules for your environment variables
const envSchema = z.object({
  PORT: z.string().transform(Number).default("3000"), // Converts string "3000" to a real number
  DATABASE_URL: z
    .string()
    .url({ message: "DATABASE_URL must be a valid connection string" }),
  API_SECRET: z
    .string()
    .min(8, { message: "API_SECRET must be at least 8 characters long" }),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

// 3. Validate the process.env object against your schema
const envServer = envSchema.safeParse(process.env);

// 4. If validation fails, crash the app immediately and print the errors beautifully
if (!envServer.success) {
  console.error("Invalid or missing environment variables:");
  console.error(JSON.stringify(envServer.error.format(), null, 2));
  process.exit(1);
}

// 5. Export the safely validated and typed data object
export const env = envServer.data;
```

### 14. Development vs. Production

You might have:

```
development
production
test
```

**Development** : Your laptop:

```
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/myapp
```

**Production** : Your deployed server:

```
NODE_ENV=production
PORT=...
DATABASE_URL=production_database
```

The important thing is your code doesn't need to contain production secrets. Your hosting platform supplies them. Conceptually:

```
                    SAME CODE
                       │
             ┌─────────┴─────────┐
             ↓                   ↓
        Development          Production
             │                   │
       local .env          platform secrets
             │                   │
             ↓                   ↓
       process.env          process.env
```

Your application accesses both through the same interface:

```
process.env.DATABASE_URL
```

### 15. Where does production get environment variables?

Suppose you deploy your Node backend to a cloud platform. You generally don't upload:

```
.env
```

Instead, the platform has something like:

```
Environment Variables / Secrets
```

You configure:

```
DATABASE_URL=...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
```

The platform injects them into your application's process. So:

```
Cloud platform
       ↓
environment variables
       ↓
Node process
       ↓
process.env
```

Your application doesn't care whether the variable came from .envor the hosting platform.

### 16. .env is a development convenience, not a security system

Don't think:

```
.env= secure
```

Instead think Environment variables are a configuration mechanism.

```
.env is simply one way of supplying those values ​​locally.
```

For production, you might use:

```
cloud platform environment variables
secret managers
container/Kubernetes secrets
CI/CD secret stores
dedicated secret-management systems
```

The exact mechanism changes. Your application still shows:

```
process.env.DATABASE_URL
```

### 17. Don't put secrets into frontend environment variables

This is a huge mistake in full-stack applications. Suppose React has:

```
VITE_API_KEY=...
```

Anything bundled into frontend JavaScript should generally be considered public . Why? Because the browser receives your JavaScript. A user can inspect the bundle. Therefore:

```
Backend environment variable
        ↓
Server only
        ↓
SECRET
```

is fundamentally different from:

```
Frontend environment variable
        ↓
Bundled into JS
        ↓
Browser
        ↓
Potentially visible to users
```

So never assume a frontend .envvariable is secret .

### 18. Environment variables vs configuration

Configuration is the complete collection of settings and rules that define how your application runs, whereas environment variables are just one specific delivery method used to pass some of those configuration values into your application from the outside.

Configuration includes every piece of data that controls your application's behavior but does not change the core source code logic. It acts as the control panel for your software.

Configuration can include things that change per environment (like a database password) as well as general settings that stay the same everywhere (like maximum upload file size, pagination limits, or feature flags).

Configuration can be stored in many formats:

- A JSON or YAML file (config.json)
- A database table
- Command-line arguments
- Environment variables (process.env)

```

                APPLICATION
                     │
              configuration
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
       code defaults       environment
                                │
                       ┌────────┴────────┐
                       ↓                 ↓
                    local .env      production secrets
```

Configuration includes things like:

```
PORT
DATABASE_URL
JWT_SECRET
CLIENT_URL
NODE_ENV
REDIS_URL
API_BASE_URL
```

Not all configuration is necessarily secret. For example:

```
PORT=5000
NODE_ENV=production
```

aren't secrets. Whereas:

```
DATABASE_PASSWORD=...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
```

are sensitive.

## Rules to be remember when it comes to enviroment variables(Industry best practice):

**1. Never hardcode secrets**

```javascript
const JWT_SECRET = "my-super-secret"; // wrong
const JWT_SECRET = process.env.JWT_SECRET; // right
```

**2. Never commit real secrets**

```javascript
.env // wrong
.env.example //right
```

**3. Validate required variables at startup**

**4. Centralize configuration**

Prefer:

```
env.JWT_SECRET
```

from one configuration module over:

```
process.env.JWT_SECRET
```

scattered throughout 50 files.

**5. Treat every environment variable as a string**

**6. Keep different environments separate**

```
development
test
production
```

should not accidentally share the same database or secrets.

**7. Production secrets belong in a secret/configuration manager**

Don't deploy:

```
.env
```

containing production credentials. Use your hosting provider's environment-variable/secrets system or a dedicated secret manager.

**8. Don't log secrets**

Never do:

```javascript
console.log(process.env);
```

in production. You could expose:

```
DATABASE_URL
JWT_SECRET
API_KEYS
PASSWORDS
```

Instead, if you want to debugging configuration:

```javascript
console.log({
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
});
```

**9. Rotate compromised secrets**
"Rotating a secret" means invalidating (deactivating) the compromised key or password and replacing it with a brand-new, secure one.

Think of it like losing your house keys. You don't just ask the burglar not to use them; you change the physical locks on your doors and get new keys. In software, you do the exact same thing with your leaked data.

If a credential leaks on GitHub, hackers run automated bots that scan every commit within seconds. Assume the leaked secret was instantly stolen.

If you accidentally expose:

```
STRIPE_SECRET_KEY
DATABASE_PASSWORD
JWT_SECRET
```

don't simply delete it from Git. Replace/rotate the actual secret.

```
Step-1 : Generate a Brand New Secret
Step 2: Update Your Environments with the New Secret
Step 3: Verify the App Works
Step 4: Deactivate/Delete the Old (Compromised) Secret
Step 5: Remove the .env file from your git repo and add .env file  into .gitignore file.
```

**10. Keep.env.example updated**

When you introduce:

```
process.env.REDIS_URL
```

also update:

```
REDIS_URL=
```

in:

```
.env.example
```

This makes onboarding much easier.
