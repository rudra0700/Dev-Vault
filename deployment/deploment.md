In backend we will use render because , in backend we are using multer and cloudinary and before uploading at cloudinary, file are temporary storing in project folder (write operation in file system). This kind of project are not allow in vercel.

And another reason is, we are using webhook as we using stripe payment system. So this is kind of webhook system application cant host at vercel.

Write some script before deployment in **`package.json`** file.

```typescript
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:generate": "prisma generate --schema=./prisma/schema",
    "db:migrate": "prisma migrate --schema=./prisma/schema",
    "db:push": "prisma db push --schema=./prisma/schema",
    "db:pull": "prisma db pull --schema=./prisma/schema",
    "db:studio": "prisma studio --schema=./prisma/schema",
    "postinstall": "prisma generate --schema=./prisma/schema",
    "stripe:webhook": "stripe listen --forward-to localhost:5000/webhook"
  },
```

Both pnpm build and pnpm run build will achieve the exact same result.
