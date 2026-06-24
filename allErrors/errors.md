# All kinds of error

### Zod Error :

When zod error happenend, you will get error like this. Below code snippet says in how many fields you give wrong input which does not match with zod valiation. This will be an `object`

The original error object will be mostly like this :

```javascript
{
   success: false,
    error: Error [ZodError]: [
       {
         "expected": "number",
         "code": "invalid_type",
         "path": [
           "email"
         ],
         "message": "Invalid input: expected number, received string"
       },
       {
         "expected": "number",
         "code": "invalid_type",
         "path": [
           "password"
         ],
         "message": "Invalid input: expected number, received string"
       }
     ]
}
```

You have to extract the `error` array which at this point inside error object as a property using dot notation, like if the error object is in `validateFields` variable, you gotta extract the array like this `(validateFields.error)`.

After extracting the array you will get below snippet:

```javascript
 error: Error [ZodError]: [
    {
      "expected": "number",
      "code": "invalid_type",
      "path": [
        "email"
      ],
      "message": "Invalid input: expected number, received string"
    },
    {
      "expected": "number",
      "code": "invalid_type",
      "path": [
        "password"
      ],
      "message": "Invalid input: expected number, received string"
    }
  ]
```

But the problem is, still you can't run a loop into this array. The interesting fact is you will get the loopable array if you do like this `validateFields.error.issues`. Then you will get the loopable array.

```javascript
[
  {
    expected: "number",
    code: "invalid_type",
    path: ["email"],
    message: "Invalid input: expected number, received string",
  },
  {
    expected: "number",
    code: "invalid_type",
    path: ["password"],
    message: "Invalid input: expected number, received string",
  },
];
```

After that you can map and modify the array and sent to somewhere else you need like below :

```javascript
if (!validatedFields.success) {
  return {
    success: false,
    errors: validatedFields.error.issues.map((issue) => {
      return {
        field: issue.path[0],
        message: issue.message,
      };
    }),
  };
}
```
