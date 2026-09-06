# Thing we will cover :
- **[Basic](./basic.md)**

Things that we will cover:

```
HTTP is not a node
What problem does http solve?
TCP comes before http
What is PORT?
HTTP request
HTTP response
res.end()
Routing
Query parameters
Difference between query parameters vs path parameters
request body
```

### HTTP is not Node

HTTP is a protocol. Node.js is a runtime. Node's http module is an **`implementation/tool`** that allows Node programs to communicate using HTTP.

For example:

```
HTTP
  ↓
Rules for communication

Node.js
  ↓
JavaScript runtime

Node's http module
  ↓
Implementation/API for creating HTTP servers and clients
```

So when you write:

```
http.createServer(...)
```

you aren't creating HTTP itself. You're asking Node
"Create a program that can receive and send HTTP messages."

### What problem does HTTP solve?

Imagine your browser wants from a server :

```
GET /products
```

The browser needs a standardized way to tell the server:

```
"I want /products."
```

The server needs a standardized way to answer:

```
"Here is the result."
```

HTTP defines the structure and rules for that communication.That is the fundamental HTTP cycle.

```text
CLIENT
   │
   │ HTTP REQUEST
   ▼
SERVER
   │
   │ HTTP RESPONSE
   ▼
CLIENT
```

### TCP comes before HTTP

HTTP generally operates on top of a transport connection such as TCP for HTTP/1.1 and HTTP/2

```
HTTP
  ↓
"How do we structure web communication?"

TCP
  ↓
"How do we reliably transport the data?"

IP
  ↓
"Where should the data go?"
```

For example, when you visit:

```
http://localhost:3000/products
```

the browser needs to establish communication with something listening on port 3000.

```
localhost
   ↓
your computer
   ↓
port 3000
   ↓
Node server
```

When Node does:

```
server.listen(3000);
```

it effectively says, "Start listening for incoming connections on port 3000."

### What is a port?

Your computer can run many network programs simultaneously.

```
Chrome             → various connections
Node application   → port 3000
PostgreSQL         → port 5432
Redis              → port 6379
```

A port helps the operating system determine, "Which program should receive this network traffic?"

```
IP address
    +
port
    ↓
particular network endpoint
```

Both computer must have port. Who send request have a sender or source port and who receieved have receiver or destination port. Destination port must know the sender port because of reply back to the same port.

### What actually is an HTTP request?

An HTTP request contains several important pieces.

```
REQUEST
│
├── Method
├── Target/URL
├── Headers
└── Body
```

For example:

```
GET /products?page=2 HTTP/1.1

Host: example.com
Accept: application/json
User-Agent: ...
```

**Method**

What kind of operation is the client asking for?

```
GET
POST
PUT
PATCH
DELETE
```

**URL/path**

Which resource does the client want?

```
/products
/products/123
/users
/users/42
```

**Query parameters**

Additional parameters attached to the URL.

```
/products?page=2&limit=10
```

Additional metadata/instructions about the request.

```
Content-Type: application/json
Authorization: Bearer ...
Accept: application/json
Body
```

Data being sent with the request. For example, a POST request might contain:

```javascript
{
  "name": "Rudra",
  "email": "example@email.com"
}
```

### HTTP response

The server sends an HTTP response back.

```
RESPONSE
│
├── Status code
├── Headers
└── Body
```

**Status code**

```
200 → successful
201 → created
400 → bad request
401 → authentication required/failed
403 → forbidden
404 → not found
500 → server error
Response headers
```

**Response Header**

```
Content-Type: application/json
Set-Cookie: ...
Cache-Control: ...
Response body
```

**Response data:**

```javascript
{
    "name": "Rudra"
}
```

**`res`** is the object you use to construct your response.

### res.end()

Its more important than it looks

Consider:

```
const server = http.createServer((req, res) => {
    res.end("Hello");
});
```

You might initially think "This function prints Hello."Not exactly It means:

```
create HTTP response
       ↓
response body = "Hello"
       ↓
finish response
       ↓
Node sends response
       ↓
browser receives it
```

That's why forgetting to finish a response can leave the client waiting.

### Routing

Now we can understand one of the things Express simplifies.Suppose you want:

```
GET /users
GET /products
GET /about
```

With raw node:

```javascript
const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/users") {
    res.end("Users");
    return;
  }

  if (req.method === "GET" && req.url === "/products") {
    res.end("Products");
    return;
  }

  if (req.method === "GET" && req.url === "/about") {
    res.end("About");
    return;
  }

  res.statusCode = 404;
  res.end("Not Found");
});
```

You're manually implementing routing logic.Express gives you a much nicer abstraction:
```javascript
app.get("/users", handler);
app.get("/products", handler);
app.get("/about", handler);
```

So Express isn't magically creating HTTP. It is giving you higher-level abstractions around Node's HTTP functionality.

### Query Parameter

A query parameter (also called a query string or URL parameter) is a key-value pair appended to the end of a URL to pass extra information to a web server. They are primarily used to filter, sort, or paginate data without altering the main endpoint of the website or API

**Structure of Query Parameters**

Query parameters follow a strict syntax structure within a URL:
```
The Question Mark (?): Separates the main URL path from the query parameters.
```
```
The Key-Value Pair: Written as key=value. The key is the name of the data field, and the value is the actual data.
```
```
The Ampersand (&): Used to separate and chain multiple parameters together.
```

**Common Use Cases**
```
Searching & Filtering: Telling the server exactly what content to look for (e.g., Google search tracking your keyword via ?q=query+parameter).
```
```
Pagination: Breaking down a massive list of items into smaller, digestible pages (e.g., ?limit=10&3page=3).
```
```
Sorting: Changing the order of the displayed data (e.g., ?order=newest).
```
```
Marketing Analytics: Tracking where web traffic is coming from using standardized UTM parameters (e.g., ?utm_source=newsletter).
```

**Important Rules to Remember**
```
URL Encoding: URLs cannot contain spaces or certain special characters. The browser automatically converts them into percent-encoded values (e.g., a space becomes %20).
```
```
Case Sensitivity: Parameter keys are strictly case-sensitive; ?search=web and ?Search=web are treated as different instructions by most servers.
```
```
Data Type: All parameters are inherently transmitted as text strings. Backend code must manually convert numbers or booleans into their correct data types.
```

### Route parameters(path paramters) vs query parameters
```
https://example.com/products/123?page=2&limit=10
│       │           │       │
│       │           │       └── query
│       │           └────────── path
│       └────────────────────── host
└────────────────────────────── protocol
```

Compared:
```
/products?page=2
```
with:
```
/products/123
```
The primary difference is that router parameters (path parameters) identify a specific resource, while query parameters filter or modify the presentation of those resources

**Route parameters :** 

- Identify a resource
- part of the main path - /users/123
- Its mendatory because if you omit,  it can change the route
- Order matter for the route matching
- Accessible via **`req.params`** or framework equivalent. 

**Query paremeters**

- Filter, sort, or paginate resources.
- After a ?, key-value, e.g., ?role=admin.
- The page loads without them
- Can be in any order
- Accessible via **`req.query`** or framework equivalent.

Express gives you:

```javascript
app.get("/products/:id", (req, res) => {
    console.log(req.params.id);
});
```

Again, Express is providing a routing abstraction.

### Request body

Suppose the browser sends:
```
POST /users
```

with:
```
{
    "name": "Rudra",
    "age": 20
}
```

Where does that JSON go? The answer is **`Into the HTTP request body .`** But there's an important Node concept:
```
The request body arrives as a stream of data.
```

That means you don't necessarily get the entire body instantly as one JavaScript object.
```
network
   ↓
data arrives
   ↓
chunk
   ↓
chunk
   ↓
chunk
   ↓
...
```

Node's request object is a readable stream. That's why raw Node body handling looks like:
```javascript
let body = "";

req.on("data", chunk => {
    body += chunk;
});

req.on("end", () => {
    console.log(body);
});
```

### Final Mental Model :
```
HTTP POST request
        ↓
Node receives bytes
        ↓
Node HTTP parser
        ↓
IncomingMessage → req
ServerResponse   → res
        ↓
Express middleware
        ↓
JSON body parsed
        ↓
Express router
        ↓
POST /users matched
        ↓
handler executes
        ↓
req.body available
        ↓
database operation
        ↓
response constructed
        ↓
status = 201
Content-Type = application/json
body = JSON
        ↓
response sent through Node
        ↓
TCP
        ↓
browser
```

