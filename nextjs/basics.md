### Next js fundamentals:

In next js `page.tsx` by default a server component. To make it client a component we can use `"use client"` at the top of `page.tsx` file.

However we should not do this. So if we need to make a cilent component, we will make component exactly like react component, then import it into `page.tsx` file. That means, a specific portion of code is client part, rest of are server code

Next js follows folder base routing system. You must create `page.tsx` file to render something into UI (browser).

So obviously, you dont create only one route. You will need many routes(folder) where each folder will contains `page.tsx` file.By seeing this you can get confused.

Another reason is that, so you can understand the difference between component and actual page. For convenient you can change your component name like this -

#### **`page.tsx`**

```javascript
const RegisterPage = () => {
  return (
    <div>
      <h1>Register</h1>
    </div>
  );
};

export default RegisterPage;
```

NOTE : You can only change component name, not file name. File name must stay as `page.tsx`. Changing component name is only for convenient. You can ignore that

To handle form we generally use react-hook-form or use useState or other ways. There is another way to handle this using react `useActionState` built in hook

```javascript
const [state, dispatchAction, isPending] = useActionState(reducerAction, initialState, permalink?);
```

To access data from backend we use `server action` (nothing but a regular javscript function) so that our nextjs backend server can talk to actual node or express server because of security purpose. Client side is less secure.

`state` is response that return from reducerAction funtion.

### How to get token in client side?

if we do not resolve this line we get a response like this. We have to extract the accessToken and refreshToken from headers. At first its come from node js backend to our next js backend, not directly in browser. we manually set this two tokens in nextjs cookie store:

```javascript
 {
  status: 201,
  statusText: 'Created',
  headers: Headers {
    'x-powered-by': 'Express',
    'access-control-allow-origin': 'http://localhost:3000',
    vary: 'Origin',
    'access-control-allow-credentials': 'true',
    'set-cookie': 'accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZ21haWwuY29tIiwicm9sZSI6IlBBVElFTlQiLCJpYXQiOjE3ODIzNjQ1MDksImV4cCI6MTc4MjM2ODEwOX0.oaC7MhdPUSa45QMctSP3Ih5ppo9Q99z0XLnpqg9n0jo; Max-Age=3600; Path=/; Expires=Thu, 25 Jun 2026 06:15:09 GMT; HttpOnly; Secure; SameSite=None, refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZ21haWwuY29tIiwicm9sZSI6IlBBVElFTlQiLCJpYXQiOjE3ODIzNjQ1MDksImV4cCI6MTc5MDE0MDUwOX0.EPliTI8L4e2CrBDy22MtMhuMDAEB3OYiV6EAUnzczpQ; Max-Age=7776000; Path=/; Expires=Wed, 23 Sep 2026 05:15:09 GMT; HttpOnly; Secure; SameSite=None',
    'content-type': 'application/json; charset=utf-8',
    'content-length': '91',
    etag: 'W/"5b-GnbbR3NXR6pXN1YQsR6v8i7GURY"',
    date: 'Thu, 25 Jun 2026 05:15:09 GMT',
    connection: 'keep-alive',
    'keep-alive': 'timeout=5'
  },
  body: ReadableStream { locked: true, state: 'closed', supportsBYOB: true },
  bodyUsed: true,
  ok: true,
  redirected: false,
  type: 'basic',
  url: 'http://localhost:5000/api/v1/auth/login'
}
```

you extract the token from headers like this :

```javascript
const setCookieHeaders = res.headers.getSetCookie();
```

Then you get the below result. We could use javscript split method also, but that could create mess

```javascript
[
  "accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZ21haWwuY29tIiwicm9sZSI6IlBBVElFTlQiLCJpYXQiOjE3ODIzNjQ5OTEsImV4cCI6MTc4MjM2ODU5MX0.CcTaazd8GpGSUT3_KOnT9CEO0qRC-Kuc06Jb98vgtPI; Max-Age=3600; Path=/; Expires=Thu, 25 Jun 2026 06:23:11 GMT; HttpOnly; Secure; SameSite=None",
  "refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZ21haWwuY29tIiwicm9sZSI6IlBBVElFTlQiLCJpYXQiOjE3ODIzNjQ5OTEsImV4cCI6MTc5MDE0MDk5MX0.Y4b55B63OCG7UL95SAHoBjnv4kqYnSsT8gDcK4FArnc; Max-Age=7776000; Path=/; Expires=Wed, 23 Sep 2026 05:23:11 GMT; HttpOnly; Secure; SameSite=None",
];
```

Then you will use a npm package named `cookie`. Install it like `npm i cookie`. It will parse that token array you got above and return two object, because we run a loop with the above array like this :

```javascript
setCookieHeaders.forEach((cookie) => {
  const parsedCookie = parse(cookie);
  console.log(parsedCookie);
});
```

The result will be like that:

```javascript
{
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZ21haWwuY29tIiwicm9sZSI6IlBBVElFTlQiLCJpYXQiOjE3ODIzNjU2OTAsImV4cCI6MTc4MjM2OTI5MH0.ueidzVQkCiJ_4qfZSvS1cMuZGHi3icdAUx6bmYhtnLY',
  'Max-Age': '3600',
  Path: '/',
  Expires: 'Thu, 25 Jun 2026 06:34:50 GMT',
  SameSite: 'None'
}

{
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5AZ21haWwuY29tIiwicm9sZSI6IlBBVElFTlQiLCJpYXQiOjE3ODIzNjU2OTAsImV4cCI6MTc5MDE0MTY5MH0.5T8o0B9kfJf4wGp8t00LZLksJlNNU3m_nrXqxVGtieY',
  'Max-Age': '7776000',
  Path: '/',
  Expires: 'Wed, 23 Sep 2026 05:34:50 GMT',
  SameSite: 'None'
}
```

Then you will set the token in next js cookie store:

```javascript
const cookieStore = await cookies();

cookieStore.set("accessToken", accessTokenObject.accessToken, {
  secure: true,
  httpOnly: true,
  maxAge: parseInt(accessTokenObject["Max-Age"]) || 1000 * 60 * 60,
  path: accessTokenObject.Path || "/",
  sameSite: accessTokenObject["SameSite"] || "none",
});

cookieStore.set("refreshToken", refreshTokenObject.refreshToken, {
  secure: true,
  httpOnly: true,
  maxAge: parseInt(refreshTokenObject["Max-Age"]) || 1000 * 60 * 60 * 24 * 90,
  path: refreshTokenObject.Path || "/",
  sameSite: refreshTokenObject["SameSite"] || "none",
});
```
You wont get `searchParams` if your component is client component. Make sure your component is server component

You can use `async` keyword in client component unless you dont use any `onClick`, `onChange` like APIs. 

When we do login functionality, we cant sent the cookie directly to the browser from our node or express js backend, because of next js internal backend. Cookie at first will go the next js internal backend and we must manually send the cookie to the browser. Same things happened about sending request to the authenticated routes after logged in. Our node or express js server cant directly access the browser cookie because at first will go the nextjs internal backend. You have to manully send the cookie to the node js server from server action function. 

By default in server component, we get two default props in every `page.tsx` file, params and searchParams.