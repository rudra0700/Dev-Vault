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
NOTE : You can only change component name, not file name. File name must stay as `page.tsx`. Changing component name is only for convenient.  You can ignore that

To handle form we generally use react-hook-form or use useState or other ways. There is another way to handle this using react `useActionState` built in hook

```javascript
const [state, dispatchAction, isPending] = useActionState(reducerAction, initialState, permalink?);
```

To access data from backend we use `server action` (nothing but a regular javscript function) so that our nextjs backend server can talk to actual node or express server because of security purpose. Client side is less secure.

`state` is response that return from reducerAction funtion.