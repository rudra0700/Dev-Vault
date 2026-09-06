# npm/package management
- **[Basic](./basic.md)**

You will cover :

```
What problem does npm actually solve?
node vs npm
npm project
what is package?
what is dependency?
what is devDependency?
what is package.json file?
npm init
npm install
npm uninstall
npm update
npm script
npm run dev
npm resolve
npm run
package.json
package-lock.json
package-lock.json vs node_modules
semantic versioning
node_modules
```

The goal is to understand this chain from the root:

```text
Your project
    ↓
package.json
    ↓
npm reads dependency requirements
    ↓
npm resolves versions
    ↓
package-lock.json records the exact resolution
    ↓
npm downloads packages
    ↓
node_modules/
```

### 1. What problem does npm actually solve ?

**What is npm actually?**

npm is software. More specifically, npm is a **`package manager`** and **`command-line tool`** for JavaScript/Node.js projects which is start by OS when we type command **`npm`**  .

When you install Node.js, npm normally comes with it. You can verify that from your terminal:
```
node --version
npm --version
```
You are actually running two different programs:
```
node
 ↓
JavaScript runtime

npm
 ↓
package-management command-line program
```

So when you type:
```
npm install express
```
you are not running Node to execute your application .You are launching the npm program . Imagine you create an Express application. Your code says:

```javascript
import express from "express";
```

But your computer doesn't automatically have Express. So you need to obtain Express somehow.

You could theoretically:

- Find Express's source code.
- Download it.
- Put it inside your project.
- Download everything Express itself needs.
- Make sure all versions are compatible.
- Repeat this for every dependency.
- Do this again on another computer/server.

That becomes a nightmare. npm solves package management. It handles things like:

- finding packages
- downloading packages
- installing dependencies
- resolving dependency trees
- managing versions
- recording exact installations
- running project commands
- removing packages
- updating packages

So npm isn't fundamentally "a thing that installs Node packages. npm is a package manager that manages the **`dependency`** graph of your JavaScript/Node project.

### 2. node vs npm

When you do:
```
node index.js
```
you're essentially telling the Node executable:
```
Operating System
      ↓
launch node program
      ↓
node reads index.js
      ↓
Node executes JavaScript
```
But when you do:
```
npm install express
```
you're doing:
```
Operating System
      ↓
launch npm program
      ↓
npm reads package.json
      ↓
npm figures out dependencies
      ↓
npm downloads packages
      ↓
npm creates/updates node_modules
      ↓
npm updates package-lock.json
```
**Node and npm are different programs doing different jobs.`**

### 3.  npm project

**`A directory whose dependency/project management is described by a package.jsonfile. npm can treat that directory as a project with metadata, dependencies, scripts, etc. It means you saying : "npm, create the metadata file that describes this project."`**

### 4. What is a package?

A package is basically reusable code that someone has wrote packaged/bundle it so other developers can use it.

```text
express
mongoose
jsonwebtoken
```

Each package contains code plus metadata. Very roughly:

```text
express package
├── package.json
├── lib/
├── ...
└── other files
```

And importantly, a package can depend on other packages. For example :

```text
your application
      │
      └── express
            │
            ├── package A
            ├── package B
            └── package C
```

### 5. What is a dependency?

Dependency means my project requires exactly this packages to run. This is called dependency or package dependency.

Your application depends on Express .

```text
Your application
       ↓
    Express
```

```text
{
  "dependencies": {
    "express": "^5.1.0"
  }
}
```

Now imagine Express itself requires other packages.

```
Your app
   ↓
Express
   ↓
dependency A
   ↓
dependency B
```

This creates a **`dependency tree`** . Real applications can have hundreds or thousands of packages in the dependency tree, even though you directly installed only a few.

### 6. What is devDependency?

Assume your production application needs:

```
express
mongoose
jsonwebtoken
```

Those are runtime dependencies.

```
"dependencies": {
  "express": "...",
  "mongoose": "...",
  "jsonwebtoken": "..."
}
```

But perhaps during development you use below packages. These are development tools.

```
nodemon
eslint
prettier
typescript
```

```text
dependencies
    ↓
needed by the application

devDependencies
    ↓
needed to develop/build/test the application
```

installation :

```javascript
npm install express //dependency
npm install -D nodemon // devDependency
npm install --save-dev nodemon // devDependency
```

### 7. package.json file

package.json is essentially the project's metadata. It tell npm “Here is what my project is, what it needs, and what commands it knows how to run.” 
**`package.json`** is NOT a JavaScript program that Node executes. npm is the program that reads it when you run an npm command.

When you create a Node project, you generally have:

```javascript
{
  "name": "my-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^5.1.0",
    "mongoose": "^8.18.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

**`NOTE`** : package.json does not contain the actual Express source code. It contains information about Express.

```
package.json
     ↓
"I need Express"
     ↓
"Not here is the express source code"
```

One of the things npm does is look for the relevant package.json. Suppose you're here:
```
C:\projects\my-api>
```
and the directory contains:
```
my-api/
├── package.json
└── src/
```

You execute:
```
npm install
```

Conceptually:
```javascript
Windows
  ↓
starts npm
  ↓
npm determines the current project //most important (npm can track the current directory package.json file)
  ↓
npm finds package.json
  ↓
npm parses the JSON
  ↓
npm looks at dependencies
  ↓
npm resolves them
  ↓
npm installs them
```

### 8. npm init

It means "Initialize this directory as an npm **`project`**." It does not install Express. It doesnot create node_modules. It primarily establishes the project's npm metadata.

```
npm init
```

It creates a package.json. npm asks you questions such as:

```text
package name:
version:
description:
entry point:
...
```

It will create :

```
project/
└── package.json
```

You can also use below which accepts the default values.

```text
npm init -y
```

### 9. npm install

```text
npm install express
```

This command triggers several things.

```text
npm install express
       ↓
npm finds Express
       ↓
npm determines a suitable version
       ↓
npm downloads Express
       ↓
npm determines Express's dependencies
       ↓
npm downloads those dependencies
       ↓
node_modules/ is created/updated
       ↓
package.json is updated
       ↓
package-lock.json is created/updated
```

you may get:

```
project/
│
├── package.json
├── package-lock.json
├── node_modules/
│   ├── express/
│   ├── ...
│   └── ...
└── src/
```

And package.json might contain:

```javascript
"dependencies": {
  "express": "^5.1.0"
}
```

### 10.  npm uninstall

```
npm uninstall express
```

npm removes the package from the project. It removes the package from node_modules, package.json file and as well as from package-lock.json file . So lockfile will also be updated accordingly.

### 11. npm update

Assumed:

```
"express": "^5.1.0"
```

and a newer compatible version exists. By running:

```
npm update
```

asks npm to update packages within the allowed version ranges. npm update does not mean "Upgrade everything to the newest version that exists on Earth.". It works within the constraints defined by your

- **`npm install`** : Install dependencies and make the project match the package configuration/lockfile.
- **`npm update`** : Update installed dependencies where newer versions satisfy the specified ranges.

```
install
   ↓
"make sure I have what this project declares"

update
   ↓
"move my dependencies forward within allowed ranges"
```

### 12. npm scripts

These are npm scripts .

```javascript
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "jest"
  }
}
```

You execute them with :

```
npm run dev
npm run test
npm start
```

Without npm scripts you might repeatedly type in command line:

```
node src/server.js
nodemon src/server.js
tsc && node dist/server.js
```

Instead, your project can define:

```javascript
"scripts": {
  "dev": "nodemon src/server.js",
  "build": "tsc",
  "start": "node dist/server.js"
}
```

Then developers only need to know:

```
npm run dev
npm run build
npm start
```

This makes the project's commands part of the project itself .

### 13. npm run dev

```javascript
"scripts": {
  "dev": "nodemon src/server.js"
}
```

You run:

```
npm run dev
```

npm looks inside:

```

package.json
     ↓
scripts
     ↓
dev
     ↓
"nodemon src/server.js"
```

and executes that command.

### 14. npm resolve 
npm has to determine which exact version should I install? That's the resolution .

Imagine the npm registry has:
```
express
├── 5.0.0
├── 5.1.0
├── 5.1.1
├── 5.1.2
├── 5.2.0
└── 6.0.0
```

Your project says:
```
express: ^5.1.0
```
npm has to evaluate the available versions and determine which versions satisfy that range. That's what we mean npm resolves the dependency.

 But resolution isn't only about Express. This is where it becomes interesting.

Assumed:
```
your application
      ↓
    express
      ↓
  package-A
      ↓
  package-B
```

Your application directly requested:
```
express
```

But Express has dependencies. So npm has to resolve those too . The real problem becomes:
```
Your project
    ↓
What version of Express?
    ↓
What does that Express version depend on?
    ↓
What versions of those dependencies?
    ↓
What do THOSE packages depend on?
    ↓
...
```

That's why we call it a dependency tree/graph .
```
Your application
│
├── express ^5.1.0
│       │
│       ├── package-A ^2.0.0
│       │       └── package-X ^1.0.0
│       │
│       └── package-B ^3.0.0
│
└── mongoose ^8.0.0
        │
        └── package-C ^4.0.0
```
npm needs to find versions that satisfy all those requirements That's the dependency resolution problem .

### 15 . package.json vs node_modules

- **`package.json`** : "These are the packages my project depends on."

- **`node_modules`** : "Here are the current installed packages."

### 16 . package-lock.json

package-lock.json records the exact dependency resolution npm selected.

Think about a scenario , you and your teammate running:

```
npm install
```

at different times. You don't want dependency resolution to randomly produce a different dependency tree. That's where the lock file comes in.

- **`package.json`** : "I need Express version compatible with this range."

- **`package-lock.json`** : "Here is the exact dependency tree we resolved."

Lockfile records something like below and It also records package integrity information and other installation metadata.

```text
express → 5.1.0
dependency A → 2.4.7
dependency B → 1.8.3
dependency C → 4.2.1
...
```

```
package.json
    ↓
dependency REQUIREMENTS
```

```
package-lock.json
    ↓
dependency RESOLUTION
```

### 17 . Why commit package-lock.json in github?

Suppose you build an API. You push:

```
package.json
package-lock.json
src/
```

but don't push:

```
node_modules/
```

Your teammate clones the project. They run:

```
npm install
```

npm reads:

```
package.json
       +
package-lock.json
```

and reconstructs:

```
node_modules/
```

So everyone can reproduce essentially the same dependency tree. This is why package-lock.jsonis normally committed to Git for an application.

### 18 . Why dont commit node_modules to github?

Because it can become very huge file with hundreds of file with package. As we can reconstruct it with npm command, there is no need to send this big folder to github.

### 19 . Semantic Versioning — SemVer

```
5.1.0
│ │ │
│ │ └── PATCH
│ └──── MINOR
└────── MAJOR
```

```javascript
PATCH -> 5.1.0 → 5.1.1
MINOR -> 5.1.0 → 5.2.0
MAJOR -> 5.1.0 → 6.0.0
```

This gives package consumers a standardized way to communicate compatibility.

### 20 . Why does npm care about versions so much?

Imagine your application was developed using:

```
mongoose 8.18.0
```

Then six months later a new major version comes out:

```
mongoose 9.x
```

If npm blindly installed the newest version every time, your application could suddenly break.That's why version constraints matter.

You are essentially telling npm:

```
Here is the compatibility range I'm willing to accept.
```

### 21 . Local vs global packages

Usually, project dependencies are installed locally :
```
npm install express
```

which means:
```
project/
└── node_modules/
    └── express/
```

Global installation puts the package in a global npm location so its CLI can be available system-wide.
```
npm install -g some-package
```
For application dependencies, you generally want:
```
LOCAL
```
because your project should declare exactly what it needs.

### 22 . Advance : npm manages a dependency graph

Assumed:
```
Your API
│
├── express
│    ├── package-A
│    └── package-B
│
├── mongoose
│    ├── package-C
│    └── package-D
│
└── jsonwebtoken
     └── package-E
```
You directly declared:
```
express
mongoose
jsonwebtoken
```

But npm also has to deal with:
```
A
B
C
D
E
```

These are **`transitive dependencies`** . So there are two categories:

**Direct dependency**

You explicitly install/use it:
```
your app → express
```

**Transitive dependency**

Your dependency needs it:
```
your app
   ↓
express
   ↓
some-package
```
You didn't necessarily install some-package directly. npm manages the entire tree.

**`NOTE :`**  node_modules is not simply "the packages I installed." It is the installed dependency tree.

### Final mental model :
Node executes your JavaScript; npm manages your project's packages; package.jsontells npm what the project needs; package-lock.jsonrecords the resolved dependency tree; and node_modulescontains the resulting installed packages.