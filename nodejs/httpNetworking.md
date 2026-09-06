# HTTP/Networking
- **[Basic](./basic.md)**

Things that covered below :

```
Basic mental model
1. What exactly is an HTTP client?
2. Why does a backend need to call another server?
3. What actually is an HTTP request?
4. HTTP methods
5. URL anatomy
6. Headers
7. Content-Type vs Accept
8. Request body
9. Response
10. Very important: fetch() doesn't reject for HTTP errors
11. HTTP status codes
12. HTTP response body isn't always JSON
13. The complete fetch() pattern you should know
14. Now go one level deeper: DNS
15. TCP
16. HTTPS and TLS
17. The full journey
18. Connection reuse
19. Timeouts
20. Network errors vs HTTP errors
21. Retry
22. Idempotency
23. Authentication
25. Query parameters
26. Request cancellation
27. What Axios actually gives you
28. A production-style HTTP client abstraction
29. Logging and observability
30. Rate limiting
31. SSRF — important security concept
```

### 0. Understand the mental model

Assume your Node/Express API receives:

```
POST /orders
```

Your server needs to ask a payment service:

```
POST https://api.payment.com/charges
```

```
                    YOUR SERVER
                 Node.js / Express
                       │
                       │ 1. HTTP request
                       ▼
              ┌─────────────────┐
              │  Payment Server  │
              └─────────────────┘
                       │
                       │ 2. HTTP response
                       ▼
                    YOUR SERVER
                       │
                       ▼
                  Your client
```

But underneath HTTP , there is considerably more:

```
Node.js
   │
   │ fetch()
   ▼
HTTP request
   │
   ▼
DNS
   │
   ▼
TCP connection
   │
   ▼
TLS encryption (HTTPS)
   │
   ▼
HTTP protocol
   │
   ▼
Remote server
```

And the response travels back through those layers.

### 1. What exactly is an HTTP client?

```
Browser → Server
```

The browser is acting as an HTTP client. But Node.js can also act as an HTTP client.

```
Node.js → Server
```

So there are two different roles Node can play.

**Node as a HTTP server**

```javascript
import express from "express";

const app = express();

app.get("/users", (req, res) => {
  res.json({ message: "Hello" });
});

app.listen(3000);
```

Here:

```
Browser
   │
   │ HTTP request
   ▼
Node/Express
   │
   │ HTTP response
   ▼
Browser
```

Node is the server.

**Node as HTTP client**

```javascript
const response = await fetch("https://api.example.com/users");

const data = await response.json();
```

Now:

```
Node
 │
 │ HTTP request
 ▼
api.example.com
 │
 │ HTTP response
 ▼
Node
```

Node is the client here .

### 2. Why does a backend need to call another server?

Because modern applications are rarely one giant application. For example:

```
Your Backend
     │
     ├── Payment API
     │
     ├── Email API
     │
     ├── SMS API
     │
     ├── Cloudinary
     │
     ├── Google API
     │
     ├── Maps API
     │
     └── Another microservice
```

For example, when creating an order:

```
Client
  │
  │ POST /orders
  ▼
Your Node server
  │
  │ POST /payment
  ▼
Payment provider
  │
  │ payment result
  ▼
Your Node server
  │
  ▼
Client
```

This is why HTTP client knowledge is essential for backend developers.

### 3. What actually is an HTTP request?

At the conceptual level:

```
HTTP Request
│
├── Method
├── URL
├── Headers
└── Body
```

For example:

```
POST /users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer TOKEN
```

Body:

```javascript
{
  "name": "Rudra",
  "email": "rudra@example.com"
}
```

So when you write:

```javascript
fetch("https://api.example.com/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Rudra",
    email: "rudra@example.com",
  }),
});
```

you're constructing an HTTP request.

### 4. HTTP methods

You should know these extremely well:

```
GET
POST
PUT
PATCH
DELETE
HEAD
OPTIONS
```

The daily-use ones are primarily:

```
GET
POST
PATCH
PUT
DELETE
```

**GET** : Retrieve something.

```javascript
fetch("https://api.example.com/users");
```

Conceptually:

```
GET /users
```

**POST** : Create something or perform an operation.

```javascript
fetch("https://api.example.com/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "John",
  }),
});
```

**PATCH** : Partially modify something.

```javascript
fetch("https://api.example.com/users/123", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "John Updated",
  }),
});
```

**PUT** : Usually represents replacing/updating a resource.

```
PUT /users/123
```

You don't need to obsess over PUT vs PATCH initially, but you should understand the semantic difference.

**DELETE**

```javascript
await fetch("https://api.example.com/users/123", {
  method: "DELETE",
});
```

### 5. URL anatomy

You should be comfortable reading this:

```
https://api.example.com:443/users/123?active=true&sort=name
└─┬─┘ └──────────────┘ └─┬───┘ └───────────────┘
 scheme      host         path          query
```

More precisely:

```
https://
   │
   └── scheme

api.example.com
   │
   └── hostname

:443
   │
   └── port

/users/123
   │
   └── path

?active=true&sort=name
   │
   └── query string
```

This becomes important when constructing APIs dynamically.

### 6. Headers

Headers are metadata attached to HTTP requests/responses. For example:

```javascript
Content-Type: application/json
Authorization: Bearer abc123
Accept: application/json
User-Agent: ...
```

In Node:

```javascript
const response = await fetch("https://api.example.com/users", {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  },
});
```

You should understand these particularly well:

```
Content-Type
Accept
Authorization
User-Agent
Cookie
Set-Cookie
Cache-Control
Content-Length
```

Not because you need to memorize every HTTP header, but because you will constantly encounter them.

### 7. Content-Type vs Accept

**Content-Type** : "What format am I sending?"

```
Content-Type: application/json
```

means:

```
My request body is JSON.
```

**Accept** : "What format do I want back?"

```
Accept: application/json
```

means:

```
I'd like the response in JSON.
```

Think:

```
Content-Type → request body
Accept       → desired response
```

### 8. Request body

A request can contain data. Example:

```javascript
const response = await fetch("https://api.example.com/users", {
  method: "POST",

  headers: {
    "Content-Type": "application/json",
  },

  body: JSON.stringify({
    name: "John",
    age: 25,
  }),
});
```

Notice:

```javascript
body: JSON.stringify(...)
```

Why?

```
Because HTTP transfers bytes/text.
```

JavaScript object:

```javascript
{
  name: "John";
}
```

is not automatically an HTTP JSON payload. We serialize it:

```
JavaScript object
       ↓
JSON.stringify()
       ↓
JSON text
       ↓
HTTP body
```

### 9. Response

Now the server responds:

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 123,
  "name": "John"
}
```

Node receives a Response object.

```javascript
const response = await fetch("https://api.example.com/users");

console.log(response.status);
console.log(response.headers);
```

Then:

```javascript
const data = await response.json();
```

Now:

```
HTTP response
      ↓
response
      ↓
response.json()
      ↓
JavaScript object
```

### 10. Very important: fetch() doesn't reject for HTTP errors

This is one of the most important practical things to understand.Suppose the server returns:

```
404 Not Found
```

This resonse variable :

```javascript
const response = await fetch(url);
```

does not normally throw just because the HTTP status is 404. You need:

```javascript
if (!response.ok) {
  throw new Error(`HTTP error: ${response.status}`);
}
```

Example:

```javascript
const response = await fetch("https://api.example.com/users/999");

if (!response.ok) {
  throw new Error(`Request failed: ${response.status}`);
}

const data = await response.json();
```

This distinction is fundamental:

```
Network failure
       ↓
fetch rejects

HTTP 404 / 500
       ↓
fetch normally resolves
       ↓
response.ok === false
```

Axios behaves somewhat differently by default, which is one reason you should understand native fetch() first.

### 11. HTTP status codes

```
1xx → informational

2xx → success
3xx → redirection
4xx → client-side/request problem
5xx → server-side problem
```

Daily-use:

```
200 OK
201 Created
204 No Content

301 / 302 redirects
304 Not Modified

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Content
429 Too Many Requests

500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
504 Gateway Timeout
```

Especially understand the difference between:

```
401
403
```

and:

```
400
422
```

### 12. HTTP response body isn't always JSON

This is important. You might have:

```javascript
await response.json();
```

But the server could return:

```
JSON
HTML
text
image
PDF
binary data
```

For example:

```javascript
const text = await response.text();
```

or:

```javascript
const blob = await response.blob();
```

or in Node-specific situations:

```javascript
const buffer = await response.arrayBuffer();
```

So don't mentally define HTTP as:

```
HTTP = JSON
```

Instead:

```
HTTP
 ↓
headers tell you what the body represents
 ↓
body can contain many formats
```

### 13. The complete fetch() pattern you should know

```javascript
async function getUser(userId) {
  const response = await fetch(`https://api.example.com/users/${userId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}
```

Then:

```javascript
const user = await getUser("123");
console.log(user);
```

This pattern will appear everywhere in backend development.

### 14. Now go one level deeper: DNS

You type:

```
https://api.example.com/users
```

But your computer cannot directly send packets to:

```
api.example.com
```

It needs an IP address. So DNS translates:

```
api.example.com
        ↓
     DNS lookup
        ↓
   203.0.113.10
```

Conceptually:

```
Node
 │
 │ "What IP belongs to api.example.com?"
 ▼
DNS
 │
 │ "203.0.113.10"
 ▼
Node
```

Then Node can establish a network connection. This is why DNS is part of your HTTP client's journey even though you wrote only:

```
fetch(url);
```

### 15. TCP

Once Node knows the destination IP, it needs a network connection For traditional HTTP/1.1 and HTTP/2 over TLS, the underlying transport commonly involves TCP. Conceptually:

```
Node
 │
 │ TCP connection
 ▼
Remote server
```

TCP gives you reliable, ordered delivery of bytes. You don't normally manage TCP directly when using:

```
fetch()
```

Node's networking stack handles it underneath.

### 16. HTTPS and TLS

If you use:

```
https://
```

you aren't just using **`HTTP`**. You're using:

```
HTTP
 +
TLS
```

Conceptually:

```
Node
  │
  ▼
TCP
  │
  ▼
TLS
  │
  ▼
HTTP
  │
  ▼
Server
```

TLS provides things like:

- encryption
- server authentication
- protection against tampering

You don't need to become a cryptography expert. But you should understand:

```
HTTP  → plaintext protocol
HTTPS → HTTP over TLS
```

### 17. The full journey

```
fetch("https://api.example.com/users")
                │
                ▼
          Parse URL
                │
                ▼
          DNS resolution
                │
                ▼
         Get IP address
                │
                ▼
        TCP connection
                │
                ▼
        TLS handshake
          (HTTPS)
                │
                ▼
        HTTP request
                │
                ▼
        Remote server
                │
                ▼
        HTTP response
                │
                ▼
        Node receives it
                │
                ▼
       response.json()
                │
                ▼
       JavaScript object
```

### 18. Connection reuse

Imagine your server makes:

```
Request 1 → Payment API
Request 2 → Payment API
Request 3 → Payment API
Request 4 → Payment API
```

You don't ideally want to create a completely new network connection every single time. Modern HTTP clients and agents can reuse connections.

Conceptually:

```
Connection
   │
   ├── HTTP request 1
   ├── HTTP request 2
   ├── HTTP request 3
   └── HTTP request 4
```

This reduces connection overhead and improves performance. You don't need to manually implement connection pooling for normal fetch() usage, but you should understand the concept.

### 19. Timeouts

This is absolutely industry important Imagine:

```
const response = await fetch(paymentUrl);
```

What if the payment server becomes extremely slow? Your request may wait longer than you want. Backend systems therefore need timeout policies. With modern Node.js **`fetch()`**:

```javascript
const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, 5000);

try {
  const response = await fetch("https://api.example.com/payment", {
    signal: controller.signal,
  });

  if (!response.ok) {
    throw new Error(`Payment API failed: ${response.status}`);
  }

  const data = await response.json();

  return data;
} finally {
  clearTimeout(timeout);
}
```

```
External API
     │
     │ doesn't respond
     ▼
Your request waits...
     │
     │ timeout
     ▼
Abort request
```

### 20. Network errors vs HTTP errors

In Node.js, HTTP errors and network errors are fundamentally different. An HTTP error occurs when a connection succeeds, but the server returns a failing status code (e.g., 404 Not Found or 500 Internal Server Error). A network error occurs when the request fails to reach the server or the connection drops abruptly (e.g., ECONNREFUSED, ENOTFOUND, or a timeout)

**HTTP error**

The server responded:

```
404
500
503
```

You successfully communicated with the server. The server simply returned an unsuccessful status.

**Network error**

You may have:

```
DNS failure
connection refused
TLS problem
connection reset
timeout
network unavailable
```

You may never receive a valid HTTP response. So:

```
HTTP error
→ response exists

Network error
→ response may not exist
```

Your error handling should understand the difference.

**Step 1:**

**`Handling Errors with fetch (Modern Node.js)`**

Since Node.js v18+, the global fetch API is natively supported. Native fetch only throws a network error; it does not throw an error for HTTP statuses like 404 or 500. You must check the **`response.ok`** property manually to capture HTTP errors.

```javascript
async function makeRequest(url) {
  try {
    const response = await fetch(url);

    // 1. Handle HTTP Errors (e.g., 400, 404, 500)
    if (!response.ok) {
      console.error(`HTTP Error! Status: ${response.status}`);
      // Handle specific status codes if needed
      if (response.status === 404) {
        console.log("The requested resource was not found.");
      }
      return;
    }

    // Success case
    const data = await response.json();
    console.log("Success data:", data);
  } catch (error) {
    // 2. Handle Network Errors (e.g., no internet, invalid domain, timeout)
    if (error instanceof TypeError && error.message.includes("fetch failed")) {
      console.error(
        "Network Error: Could not connect to the server. Check your internet connection.",
      );
    } else {
      console.error("An unexpected error occurred:", error.message);
    }
  }
}

// Example calls:
makeRequest("https://typicode.com"); // Success
makeRequest("https://typicode.com"); // HTTP Error (404)
makeRequest("https://this-domain-does-not-exist-12345.com"); // Network Error
```

### 21. Retry

Suppose you receive:

```
503 Service Unavailable
```

Should you try again? Sometimes yes. But not blindly . For example:

```
GET request
   ↓
503
   ↓
wait
   ↓
retry
```

You need to understand:

```
which errors are retryable
how many attempts
delay between attempts
exponential backoff
jitter
idempotency
```

This becomes particularly important with payment APIs and distributed systems.

### 22. Idempotency

Idempotency is a property of an operation or API endpoint where making the exact same request multiple times has the exact same effect as making it once.

Suppose you send:

```
POST /payments
```

The server processes the payment. But then your network connection dies before you receive the response. Your server thinks:

```
"I don't know whether payment succeeded."
```

If you blindly retry:

```
POST /payments
```

you could potentially create the operation twice. This is why payment systems often use idempotency keys . Conceptually:

```
Idempotency-Key: abc-123
```

Then:

```
Request
   ↓
Payment server
   ↓
processed

Network failure
   ↓
retry same request + same key
   ↓
server recognizes previous operation
```

### 23. Authentication

Your Node server will frequently call protected APIs. Common mechanisms include:

```javascript
// Bearer token
headers: {
  Authorization: `Bearer ${token}`;
}
```

```javascript
// API key
headers: {
  "X-API-Key": apiKey
}
```

Basic authentication

```
Authorization: Basic ...
```

Cookies

```
Cookie: session=...
```

### 25. Query parameters

Don't manually concatenate complicated query strings.

Bad:

```javascript
const url = "/users?page=" + page + "&limit=" + limit;
```

Use URL/ URLSearchParams.

```javascript
const url = new URL("https://api.example.com/users");

url.searchParams.set("page", "2");
url.searchParams.set("limit", "20");

const response = await fetch(url);
```

This becomes especially useful when parameters contain:

```
spaces
&
?
special characters
```

### 26. Request cancellation

Sometimes your server starts a request that is no longer needed JavaScript's AbortControlleris important here:

```javascript
const controller = new AbortController();

const response = await fetch(url, {
  signal: controller.signal,
});

controller.abort();
```

You should understand:

```
AbortController
      ↓
AbortSignal
      ↓
fetch()
```

Timeouts commonly use this mechanism too.

### 27. What Axios actually gives you

Without Axios:

```javascript
const response = await fetch(url);

if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}

const data = await response.json();
```

With Axios:

```javascript
const response = await axios.get(url);

const data = response.data;
```

Axios provides conveniences around HTTP communication. But underneath:

```
Axios
  ↓
HTTP networking
  ↓
TCP/TLS
  ↓
remote server
```

So don't think:

```
fetch vs Axios
```

as if they are completely different concepts. Think:

```
HTTP
 ↓
Node HTTP client
 ↓
fetch / Axios
```

### 28. A production-style HTTP client abstraction

Eventually, you don't want this scattered throughout your application:

```javascript
fetch(...)
fetch(...)
fetch(...)
fetch(...)
fetch(...)
```

Instead:

```
controllers
    ↓
services
    ↓
API client
    ↓
fetch / Axios
    ↓
external service
```

For example:

```javascript
async function createPayment(payment) {
  const response = await fetch(`${process.env.PAYMENT_API_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PAYMENT_API_KEY}`,
    },
    body: JSON.stringify(payment),
  });

  if (!response.ok) {
    throw new Error(`Payment API failed: ${response.status}`);
  }

  return response.json();
}
```

Then your application can simply do:

```javascript
const payment = await createPayment({
  amount: 1000,
  currency: "BDT",
});
```

Your business logic doesn't need to care about the details of HTTP.

### 29. Logging and observability

In industry, when an external API fails, you need to know:

```
Which API?
Which endpoint?
Which method?
How long did it take?
What status came back?
Did it timeout?
Did it retry?
```

For example:

```
POST /payments
External API: payment-provider
Status: 503
Duration: 2.4s
Retry: 2
```

But never log secrets :

```
❌ API keys
❌ Authorization tokens
❌ passwords
❌ sensitive personal data
```

This is part of production HTTP-client design.

### 30. Rate limiting

External APIs may say:

```
429 Too Many Requests
```

For example:

```
Your server
   │
   ├── request
   ├── request
   ├── request
   ├── request
   └── request
           ↓
      API limit reached
           ↓
          429
```

Your client should understand:

```
rate limits
retry-after
backoff
request frequency
```

This matters constantly when working with third-party APIs.

### 31. SSRF — important security concept

Imagine your server accepts:

```javascript
{
  "url": "https://some-url.com"
}
```

and then does:

```javascript
await fetch(userProvidedUrl);
```

That's potentially dangerous. An attacker may try to make your server request internal resources. This is called:

```
Server-Side Request Forgery (SSRF).
```

You don't need to become a security specialist yet, but you should know .Never blindly fetch arbitrary URLs supplied by users.
