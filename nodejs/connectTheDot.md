- **[Basic](./basic.md)**
### Does dist folder contain whole node_modules folder after build?
The direct answer is: No, the dist folder does not contain the node_modules folder. Instead, a "bundler" opens up node_modules, extracts only the specific React code your application actually uses, and injects (shuffles) it directly into your final product files.

#### The Analogy: Building a Wooden House

Imagine you want to build a wooden doghouse.
- **`node_modules`** is the Home Depot hardware store. It contains thousands of planks of wood, screws, tools, and paint colors you might need.

- **`Your source code`** (src) is your blueprint. It says, "Take 4 planks of wood and 10 specific screws to build this.

- **`"The Build Process (npm run build)`** is the carpenter. The carpenter goes to the hardware store (node_modules), grabs only those 4 planks and 10 screws, and assembles the doghouse.

- The **`dist folder`** is the finished doghouse. You deliver the doghouse to the customer's backyard (the production server). You do not ship the entire Home Depot store with it!


 ### What Actually Happens During npm run build?
 When you run the build command, a tool behind the scenes (like Vite, Webpack, or Turbopack) performs a process called Bundling and Tree Shaking.
 
 ```test
 [ Your Code ] -------\
                      +---> [ BUNDLER (Vite/Webpack) ] ---> [ dist/assets/index.js ]
[ node_modules ] ----/                                        (Your code + React combined)
```

#### 1. Resolution
The bundler looks at your main.jsx or index.js file. It sees import React from 'react'. It follows that path into node_modules to find the React library source code.

#### Bundling (Combining)
The bundler takes your custom components and the official React library code and melts them together into one or two massive, highly optimized JavaScript files inside dist/assets/ (often called something like index-C8j3x9a.js).

#### Tree Shaking (Cleaning)
If a library in node_modules has 100 features, but you only imported 2 of them, the bundler throws away the other 98 features. This keeps your production file incredibly small.

### Seeing is Believing:

If you open up your **`dist`** folder after building, you will notice it only contains a few files: **`index.htmlA CSS file A JS file (e.g., index-D3x9a8f.js)`**, 

If you open that index.js file and search (Ctrl+F) for words like "useState", "useEffect", or "react", you will find the React source code buried inside it! It has been minified (squished together to save space), but it is absolutely there.

### Why do we do this?

Browsers do not understand node_modules or Node's internal file-searching system. They only know how to download and execute standard files linked via an HTML page. By packing everything into a single dist folder, your website can load instantly on any cheap web server or browser worldwide.