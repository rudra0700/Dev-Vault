# Multer and Cloudinary and FormData

### What is multer?

Multer is a `middleware` for Node.js or express js used to handle file uploads in your app. It is use to handle `multipart/form-data (file uploads)`.

### How does multer work?

By default, Express has no idea how to read `multipart/form-data`. If you try to access `req.body` for a file upload without Multer, you get nothing. What Multer does behind the scene is browser sends messy and raw binary data. A regular HTTP request can't just carry that — it needs to be packaged in a special format called `multipart/form-data`.That's the gap `FormData` and `Multer` exists to bridge.

Then `multer` reads the incoming stream,
separates fields & files, stores file `(disk or memory)` and
attaches data to:

```javascript
req.file; // single file
req.files; // multiple files
req.body; // text fields
```

When you send normal data from `frontend → backend (like JSON)`, Express can handle it easily using:

```javascript
app.use(express.json());
```

But files are different. If you upload a file (`image, pdf`, etc.), the browser sends it as:

```javascript
multipart/form-data;
```

Express cannot parse this format by default.

### Why multer specifically?

Express doesn't handle file uploads out of the box because raw binary streams are complex and dangerous to handle naively (huge files, wrong types, malicious uploads). Multer gives you:

- storage control — disk (saves to a folder) or memory (keeps it as a `Buffer`)
- file filtering — accept only images, PDFs, etc.
- size limits — reject files above a certain size.
- field mapping — `.single('field')`, `.array('field', max)`, `.fields([...])`for flexible upload shapes

**Mental-Model** - Form Data is the packer on the `browser`. Multer is the unpacker on the `server`. They speak the same language: `multipart/form-data`

### Different multer method

```javascript
upload.single("image"); // one file
upload.array("images", 5); // multiple files
upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "gallery", maxCount: 3 },
]);
```

### What is FormData (browser side)?

Multer and FormData are two sides of the same coin — one lives in the browser, one lives in the server.

<!-- ```
Browser(client)
        ↓
wrap with root layout.tsx
        ↓
wrap with route-group layout.tsx (if any)
        ↓
render page.tsx
``` -->

![OpenAI Logo](https://i.ibb.co.com/wNq60TKw/multer-formdata-flow.png)

`FormData` is a `browser API` used to send data in `multipart/form-data` format. It packages your files and text fields into that `multipart/form-data` format. Think of it as putting your stuff into a properly labeled shipping box.

```javascript
const formData = new FormData();
formData.append("name", "Rudra");
formData.append("image", fileInput.files[0]);

fetch("/upload", {
  method: "POST",
  body: formData,
});
```

The browser automatically sets the `Content-Type: multipart/form-data` header — you never have to set that yourself.

This sends `text(name)`, `file(image)` in a special encoded format.

When a user submits a form with a file, the data arrives as `multipart/form-data`.Without Multer, your backend server won't know how to read this payload. `Multer` intercepts the request, validates the file (e.g., ensuring it's an image and not too large), and makes it available in your Node.js code.

### Why Multer is Needed?

Without multer express doesn’t understand file data.

```javascript
app.post("/upload", (req, res) => {
  console.log(req.body); // empty
  console.log(req.file); // undefined
});
```

With multer

```javascript
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("image"), (req, res) => {
  console.log(req.file); // file info
  console.log(req.body); // text fields
});
```

### When not to use Multer?

1.  If you're only sending JSON
2.  If no file upload involved

### What is cloudinary?

Cloudinary is a cloud-based `media management platform` used to store, optimize, and deliver those files. `Multer` and `Cloudinary` do completely different jobs. Multer doesn't `"send"` anything to Cloudinary. `You do`. Multer just hands you the parsed file, and then you decide what to do with it.

![OpenAI Logo](https://i.ibb.co.com/0RqYVykH/multer-storage-vs-cloudinary.png)

### How does cloudinary work?

Once `Multer` has safely processed the file, it hands the file over to Cloudinary. `Cloudinary` uploads the file to its cloud servers and gives you back a stable URL. You then save that URL in your database

It also do auto-formatting, image resizing, video transcoding, and watermarking.

Using Multer alone means the files are taking up space on your own web server. If your server crashes, `you risk losing your users data`.

### Multer storage option

- **Disk Storage (common)**

```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
```

- **Memory Storage**

```javascript
const upload = multer({ storage: multer.memoryStorage() });
```

`diskStorage` — Multer writes the file to your server's hard drive (eg: `/uploads/image.jpg`). Your route handler then picks up that path and calls `Cloudinary's SDK` with it. After the upload to Cloudinary succeeds, you have to manually `delete` the local file, otherwise your server fills up.

```javascript
// diskStorage + Cloudinary
app.post("/upload", upload.single("photo"), async (req, res) => {
  const result = await cloudinary.uploader.upload(req.file.path); // you call this
  fs.unlinkSync(req.file.path); // you must clean up
  res.json({ url: result.secure_url });
});
```

`memoryStorage` — Multer never touches the disk. It holds the file as a `Buffer` in RAM. You then pipe that buffer directly to Cloudinary. No local file is ever created, no `cleanup` needed. This is the `preferred` approach when using Cloudinary.

```javascript
// memoryStorage + Cloudinary (the cleaner way)
const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.single("photo"), (req, res) => {
  const stream = cloudinary.uploader.upload_stream((error, result) => {
    res.json({ url: result.secure_url });
  });
  streamifier.createReadStream(req.file.buffer).pipe(stream);
});
```

### So why does Multer have storage at all?
Because `Multer` was built for the general case, not just Cloudinary. Lots of apps need files saved locally — image processing servers, apps running on their own infrastructure, scripts that process CSVs, etc. Cloudinary is just one of many things you might do with a parsed file.

#### why multer needs storage?

At first you need to know how data travels over the internet and how your server handles computer memory

- **`Data Arrives in Pieces (Streaming)`** : When a user uploads a 5MB image, the file does not arrive at your server instantly as one complete file. Instead, it arrives over the network as a continuous stream of tiny pieces of data (called `chunks`). Your server cannot send a file to Cloudinary until it actually has the file data ready to go. Multer’s "storage" is the bucket that catches these incoming chunks and holds them so they can be processed.

- **`The Cloudinary SDK Needs a Finished Product`** To send a file to Cloudinary, you use Cloudinary's code library (SDK). This library requires you to give it a fully assembled file path (`from your disk`) or a complete data buffer (from your memory).Multer acts as the assembly line. It takes the raw, incoming network stream, assembles it into a format Cloudinary understands, and hands it off.

#### How Multer Uses Memory Storage(The Direct Path)?

To achieve the `"direct"` upload you can use Multer's Memory Storage `(multer.memoryStorage())` instead of Disk Storage.

When you use Memory Storage:

1. Multer catches the incoming file chunks.
2. It holds them temporarily in your server's RAM (memory) as a `Buffer`.
3. **It never writes anything to your hard drive.**
4. You instantly pass that buffer straight to Cloudinary.
5. The temporary memory is immediately wiped clean.

#### what is the default storage multer use automatically? save chunk hard drive or ram?

By default, if you do not specify a storage configuration, Multer saves files to your `server's RAM (memory)`, but it does it as a raw stream rather than a clean buffer.

However, if you use Multer's most basic setup by only providing a `dest (destination)` string, it automatically defaults to your `hard drive`.

- **The Hard Drive Default (Using `dest`)** : If you write your code like this:

```javascript
const upload = multer({ dest: "uploads/" });
```

Multer automatically creates the `uploads/` folder on your disk, renames the incoming file to a random string of characters (with no file extension for security), and saves it there

- **The Direct RAM Default (Using storage)** : If you want it to automatically use your RAM so you can send it to Cloudinary, you must explicitly tell it to use memory storage:

```javascript
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
```

The file is converted into a temporary Buffer object accessible via `req.file.buffer`. It never touches your `hard drive`.

#### **Which one should you use for Cloudinary?**

You should always choose RAM (Memory Storage) when working with Cloudinary. Saving to the hard drive first creates "junk" files on your server that you have to manually delete after uploading them to the cloud.
