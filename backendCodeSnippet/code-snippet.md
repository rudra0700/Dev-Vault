To start backend you need to a server code snippet which you can reuse almost every project. Make changes if necessary.

If you want to use express, `mongoose`, `mongodb`, `passport`, and `react` use this code snippent. 

And if you use `express`, `postgres`, `prisma`, and `next js`, follow the code from below link
 
- **[Prisma, express, postgres code snippet](#express-postgres-prisma-configuration-code-snippet)**


Make `app.ts` file and paste the below code block.

```javascript
import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalError } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session"
import './app/config/passport'
import { envVars } from "./app/config/env";


export const app = express();

app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(cors({
   origin: envVars.FRONTEND_URL,
   credentials: true
}));

app.use("/api/v1", router)

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "PH Tour management Backend" });
});

// Global error handling
app.use(globalError);

app.use(notFound)
```

Make a `globalError.ts` file and paste the below code

```javascript
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelper/AppError";
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleCastError } from "../helpers/handleCastError";
import { handleZodError } from "../helpers/handleZodError";
import { handleValidationError } from "../helpers/handleValidationError";
import { TErrorSources } from "../interfaces/error.types";
import { deleteImageFromCloudinary } from "../config/cloudinary.config";



export const globalError = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if(envVars.NODE_ENV === 'development'){
    console.log(err);
  }

  if(req.file){
    await deleteImageFromCloudinary(req.file.path)
  }

  if(req.files && Array.isArray(req.files) && req.files.length){
     const imageUrls = (req.files as Express.Multer.File[]).map(file => file.path);
     await Promise.all(imageUrls.map(url => deleteImageFromCloudinary(url)))
  }

  let errorSources: TErrorSources[] = [];
  let message = `Something went wrong ${err.message} from global error`;
  let statusCode = 500;


  //Mongoose Duplicate error
  if (err.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;

    //Mongoose Cast error / Invalid id
  } else if (err.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;

  } else if (err.name === "ZodError") {
   const simplifiedError = handleZodError(err);
   statusCode = simplifiedError.statusCode;
   message = simplifiedError.message;
   errorSources = simplifiedError.errorSources as TErrorSources[]
  }

  //Mongoose validation error
  else if (err.name === "ValidationError") {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources as TErrorSources[];

  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }
  res.status(statusCode).json({
    success: false,
    message: message,
    errorSources,
    err: envVars.NODE_ENV === "development" ? err : null,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};

```

Make a `notFound.ts` file and paste the below code

```javascript
import { Request, Response } from "express";
import httpStatus from "http-status-codes"

const notFound = (req : Request, res: Response) => {
    res.status(httpStatus.NOT_FOUND).json({
      success: false,
      messgage: "Route not found"
    })
}

export default notFound
```

Make a `validateRequest.ts` file and paste the below code.

```javascript
import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

export const validateRequest =
  (zodSchema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.body = JSON.parse(req.body.data) || req.body;
      if (req.body.data) {
        req.body = JSON.parse(req.body.data);
      }
      req.body = await zodSchema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
```

Make `server.ts` file and paste the below code block. Make changes if necessary.

```javascript
import { Server } from "http";
import mongoose from "mongoose";
import { app } from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";
import { connectRedis } from "./app/config/redis.config";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("database is connected");
    server = app.listen(envVars.PORT, () => {
      console.log(`server is running on ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);

  }
};

(async () => {
  await connectRedis();
  await startServer();
  await seedSuperAdmin();
})()


process.on("unhandledRejection", (err) => {
  console.log(
    "Unhandled rejection is detected... server is shutting down",
    err
  );
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.log("Uncaught exception is detected... server is shutting down", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("Signal termination is receieved... server is shutting down");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("Signal termination is receieved... server is shutting down");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

//Unhandled rejection
// Promise.reject(new Error("Unhandled rejection caught"))

//Uncaught exception
// throw new Error("I forgot to catch the local error")

/**
 * Unhanled rejection error
 * Uncaught rejection error
 * Signal terminatin/ sigterm error
 */
```

This is a controller function. Make `user.controller.ts` file and paste the below code

```javascript
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.createUser(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User created successfully",
      data: user,
    });
  }
);
```

This is catchAsync wrapper function. Make `catchAsync.ts` file and paste the below code

```javascript
import { NextFunction, Request, Response } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const catchAsync =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
      next(err);
    });
  };
```

This is sendResponse utils funtion. Make `sendResponse.ts` file and paste the below code.

```javascript
import { Response } from "express";

interface TMeta {
    page?: number;
    limit?: number;
    totalPage?: number;
    total: number;
}

interface TResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
    meta?: TMeta;
}
export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
    res.status(data.statusCode).json({
        statusCode : data.statusCode,
        success: data.success,
        message: data.message,
        data: data.data,
        meta: data.meta
    })
}
```

## Express, Postgres, prisma configuration code snippet

 
