# Streams
- **[Basic](./basic.md)**

Things that covered below :

```
0. What problems Streams solve
1. What exactly is a "chunk"?
2. Readable Stream
3. Writable Stream
4. Readable → Writable
5. Why pipe() is this so important?
6. BackPressure
6. where previous/loaded chunk gone after removing from memory?
7. pipe() Helps manage backpressure
8. pipeline() — learn this
10. Transform Stream
11. Duplex Stream
11. HTTP is deeply connected to Streams
12. Why an HTTP Request is a Readable Stream?
13. File upload
14. File download
15. Buffer vs Stream
16. Stream is NOT necessarily "faster"
17. The Stream lifecycle
18. Events you should know
19. write() returning false
20. highWaterMark
21. Object mode
22. Async iteration
```

### 0. What problems Streams solve

Suppose you have a 2 GB video file. Without streaming, conceptually:

```javascript
const data = await readEntireFile();
sendToClient(data);
```

You are asking your program to deal with the entire 2 GB as one piece of data. With a stream:

```
File
 ↓
chunk
 ↓
chunk
 ↓
chunk
 ↓
chunk
 ↓
Client
```

Maybe each chunk is only tens of KB. So the fundamental idea is:

```
A stream allows data to be processed gradually instead of requiring the entire data set to be available at once.
```

### 1. What exactly is a "chunk"?

A stream doesn't usually give you:

```
"whole file"
```

It gives you pieces:

```
chunk 1
chunk 2
chunk 3
chunk 4
...
```

For binary data, these chunks are generally Buffers. Example:

```javascript
import fs from "node:fs";
const stream = fs.createReadStream("./video.mp4");
stream.on("data", (chunk) => {
  console.log(chunk);
});
```

You might conceptually get:

```
Buffer(...)
Buffer(...)
Buffer(...)
Buffer(...)
...
```

So:

```
Stream
   ↓
chunk
chunk
chunk
chunk
chunk
```

Don't think:

```
“A stream is a big piece of data.”
```

Think:

```
"A stream is a mechanism for moving data incrementally."
```

### 2. Readable Stream

**`A Readable Stream is a source of data.`** Examples:

```
File
HTTP request
Database cursor
Network socket
```

They can produce data. Example:

```javascript
import fs from "node:fs";

const readable = fs.createReadStream("./big-file.txt");

readable.on("data", (chunk) => {
  console.log(chunk.toString());
});
```

Conceptually:

```
             produces
                ↓
File → Readable Stream → chunks
```

**Who produces the chunks?**

```
The underlying source + Node's stream implementation.
```

Your code doesn't normally manually say:

```
"Here is chunk #1"
"Here is chunk #2"
```

The stream machinery manages that.

### 3. Writable Stream

**`A Writable Stream is a destination for data .`** Examples:

```
File
HTTP response
Network socket
```

Example:

```javascript
const writable = fs.createWriteStream("./output.txt");

writable.write("Hello");
writable.write("World");

writable.end();
```

```
chunks
  ↓
Writable Stream
  ↓
destination
```

### 4. Readable → Writable

Assumed:

```
big-file.txt
      ↓
read
      ↓
write
      ↓
copy.txt
```

You could do this manually:

```javascript
readable.on("data", (chunk) => {
  writable.write(chunk);
});
```

But don't generally build pipelines this way . Do like this :

```javascript
readable.pipe(writable);
```

For example:

```javascript
import fs from "node:fs";

const readable = fs.createReadStream("./big-file.txt");
const writable = fs.createWriteStream("./copy.txt");

readable.pipe(writable);
```

This is one of the most important Stream patterns.

### 5. Why pipe() is this so important?

pipe()isn't simply:

```
read → write
```

It also coordinates the flow between the two streams. Especially:

```
Backpressure
```

This is where Streams become interesting.

### 6. BackPressure

In software, backpressure is a resistance or signal applied against the flow of data to prevent a system from being overwhelmed. Here is how it looks in two common tech scenarios

```
Fast Producer
     ↓
Readable
     ↓
     ↓↓↓↓↓↓↓↓↓
     ↓
Slow Consumer
```

Suppose the file can produce:

```
100 MB/s
```

but the destination can only consume:

```
10 MB/s
```

If you continuously push data:

```
Producer
 ↓
 ↓
 ↓
 ↓
 ↓
 ↓
Consumer
```

data can accumulate in memory. That's bad. So the consumer effectively says:

```
"Slow down. I can't process this quickly."
```

That's backpressure .

**`1. Fast File Upload to a Slow Database:`**

- **`The setpup`** : A web server is receiving a massive 10 GB CSV file upload from a user over a fast network connection (100 MB/s). The server needs to parse this file and insert the rows into a database. However, the database can only write data at 10 MB/s.

- `**Without Backpressure`\*\*: The server keeps reading the fast network stream, piling millions of rows into its RAM (the buffer). The RAM fills up completely, and the server crashes with an Out of Memory exception.

- **`With Backpressure`**: The server notices its internal buffer is getting full. It temporarily stops reading from the network socket. The network layer automatically tells the client's browser to pause sending data packets. Once the database catches up and clears the server's buffer, the server resumes reading the network stream.

**`2. Video Streaming (Netflix / YouTube)`**

- **`The Setup:`** A media server can send video data at 500 Mbps, but your smartphone is on a weak cellular connection and can only download at 15 Mbps.

- **`The Backpressure`**: Your phone's video player app signals the server to halt the data transmission once its local buffer is full (e.g., 2 minutes of video pre-loaded). The server pauses sending chunks. As you watch the video and empty the buffer, your phone asks for more chunks. The consumer controls the rate of the provider.

**`The Step-by-Step Process`**

```
[20GB Video on Server] ──(Chunks)──> [Small Buffer in RAM (e.g., 50MB)] ──> [Screen/Player] ──> [Erased from RAM]
```

- **`Allocating a Tiny Buffer`**: Your video player app doesn't ask for 20GB. It allocates a tiny, fixed amount of your 8GB RAM—usually just 50 MB to 100 MB—to act as the video buffer.

- **`Filling the Buffer`**: The server sends the video chunk by chunk. These chunks fill up that 100 MB buffer in your RAM.

- **`Triggering Backpressure`**: As soon as that 100 MB buffer is completely full, your phone automatically sends a tiny network signal back to the video server saying: "Stop! My buffer is full. Do not send any more chunks for a moment.

- **`"Playing the Video`**: The video player reads the chunks out of that 100 MB buffer and displays the pixels on your screen.

- **`Garbage Collection (The Cleanup)`**: As soon as you watch a specific chunk of the video (say, seconds 0:01 to 0:05), your phone instantly deletes those chunks from your RAM to make room for new ones.

- **`Lifting Backpressure`**: Now that the buffer has emptied down to, say, 20 MB, your phone signals the server: "Okay, I have room again. Send the next few chunks!"

### 6. where previous/loaded chunk gone after removing from memory?

The short answer is Those chunks are permanently deleted and destroyed. They do not go to your phone's storage, nor do they go back to the internet. They cease to exist on your phone entirely.

**`1. It is overwritten in RAM (Garbage Collection)`** :

- When the video player is done displaying those specific frames on your screen, it marks that 100MB of space in your RAM as "free."Your phone's Operating System (Android or iOS) instantly allows new incoming chunks from the network to overwrite those exact physical transistors inside your RAM chip. The electrical charges that represented that 100MB of data are physically changed to represent the new 100MB of data.

**`2. It is NOT saved to your hard drive (Storage/ROM)`**

- Because you are streaming and not downloading, your phone purposefully bypasses your phone's permanent storage (flash memory/internal storage). The data never touches your disk. Once it is cleared from the RAM, it is gone from your device forever.

**`3. The only exception: Browser Caching (Temporary Storage)`** :

- Sometimes, apps or web browsers will save a tiny bit of the very recent past to a temporary folder on your disk called a Cache.
  - This only happens so that if you rewind the video by 5 seconds, it doesn't have to download it from the internet again.
  - However, because your phone only has limited space, this cache has a very strict limit (e.g., 200MB). Once that limit is reached, the oldest watched chunks are automatically deleted from your storage disk too.

### 7. pipe() Helps manage backpressure

This is one major reason you should prefer:

```javascript
readable.pipe(writable);
```

over manually doing:

```javascript
readable.on("data", (chunk) => {
  writable.write(chunk);
});
```

The stream system handles flow control.

**Industry rule**

```
When connecting standard Node streams, prefer pipe() or, even better for multi-step/error-sensitive processing, pipeline().
```

### 8. pipeline() — learn this

Modern Node applications should know:

```javascript
import { pipeline } from "node:stream/promises";
```

Example:

```javascript
await pipeline(
  fs.createReadStream("./input.txt"),
  fs.createWriteStream("./output.txt"),
);
```

Why? Because real systems often have:

```
Readable
   ↓
Transform
   ↓
Transform
   ↓
Writable
```

And you want proper error handling and cleanup. Example:

```javascript
await pipeline(
  fs.createReadStream("./input.txt"),
  transformStream,
  fs.createWriteStream("./output.txt"),
);
```

For production stream chains:

```
Know pipeline()well.
```

### 10. Transform Stream

This is the fourth major stream type.

A Transform Stream is:

```
Readable + Writable + transformation
```

Example:

```
input
 ↓
Transform
 ↓
output
```

Imagine:

```
File
 ↓
gzip
 ↓
compressed file
```

```javascript
import fs from "node:fs";
import zlib from "node:zlib";

const readable = fs.createReadStream("./input.txt");
const gzip = zlib.createGzip();
const writable = fs.createWriteStream("./input.txt.gz");

readable.pipe(gzip).pipe(writable);
```

This is a beautiful real-world example of streams.

### 11. Duplex Stream

Duplex means:

```
Readable + Writable
```

It can receive data and produce data. A classic example:

```
TCP socket

Conceptually:

        Socket
       ↙      ↘
   receive    send
```

You don't need to memorize complicated custom Duplex implementation yet. Just understand:

```
Readable
   = read

Writable
   = write

Duplex
   = read + write

Transform
   = read + write + transformation
```

### 11. HTTP is deeply connected to Streams

To the server, an incoming HTTP request is always a readable stream, regardless of whether it is a GET or a POST request.

When you write:

```javascript
http.createServer((req, res) => {});
```

req is a Readable Stream . Why? Because data comes from the

```
 client → server .
```

```
Browser
   ↓
HTTP request
   ↓
req
   ↓
Readable Stream
```

And:

```
res is a Writable Stream .
```

Because data goes:

```
Server
   ↓
res
   ↓
HTTP response
   ↓
Browser
```

So:

```
Browser
   ↓
   request
   ↓
Readable Stream (req)

Writable Stream (res)
   ↓
   response
   ↓
Browser
```

### 12. Why an HTTP Request is a Readable Stream?

To the server, the client (the browser) is pushing data through a network pipe. The server's only job is to read that data as it arrives. Therefore, the server wraps that incoming connection in a Readable Stream.

"Readable" and "Writable" are not absolute properties of the data—they are relative roles based on who is holding the pipe.

A single network connection between a client and a server is like a two-lane highway.

Because data flows in two opposite directions, the machine at either end sees the exact same highway lane differently. What is an exit lane (Writable) for the browser is an entry lane (Readable) for the server.

**The Two-Lane Highway (Visualizing the Perspective)**

Let’s trace a full POST request and Response lifecycle. Look closely at how the exact same data pipe flips roles depending on which machine's perspective you are looking from.

**`Lane 1: The Request (Data moving from Browser ➔ Server)`**:

Imagine you are uploading a photo to a server.

- **`From the Browser's Perspective`**: The browser is the creator of the photo data. It opens a pipe and `writes` the photo `bytes` into it. To the browser, this request lane is Writable.

- **`From the Server's Perspective`**: The server is sitting at the other end of that exact same pipe. Bytes start popping out of it. The server cannot put data back into this specific lane; it can only pull data out and read it. To the server, this request lane is Readable.

**`Lane 2: The Response (Data moving from Server ➔ Browser)`**

Now, the server wants to send back a message saying "Upload Successful!"

- **`From the Server's Perspective`**: The server creates the "Success" message and writes it into the response pipe. To the server, the response is Writable.

- **`From the Browser's Perspective`**: The browser sits at the end of the response pipe and waits for the message to arrive so it can read it and display it on your screen. To the browser, the response is Readable.

### 13. File upload

Assumes user uploads have a large file. Conceptually:

```
Browser
   ↓
HTTP request
   ↓
req Readable Stream
   ↓
processing
   ↓
file/storage Writable Stream
```

You don't necessarily want:

```
const entireFile = await somehowLoadEverythingIntoMemory();
```

Instead, data can flow incrementally. That's why streams appear in:

```
file uploads
downloads
video
audio
compression
HTTP
sockets
cloud storage
large data processing
```

### 14. File download

Imagine your server needs to send a large file. Instead of loading everything:

```javascript
const file = fs.readFileSync("./movie.mp4");
res.end(file);
```

You can stream it:

```javascript
const stream = fs.createReadStream("./movie.mp4");
stream.pipe(res);
```

Conceptually:

```
movie.mp4
   ↓
Readable Stream
   ↓
chunks
   ↓
HTTP response
   ↓
Browser
```

That's an extremely practical Node pattern.

### 15. Buffer vs Stream

**Buffer**

Represents data currently held in memory.

```javascript
const buffer = Buffer.from("Hello");
```

Think:

```
DATA IN MEMORY
```

**Stream**

Represents a process of moving data over time.

```
data
 ↓
chunk
 ↓
chunk
 ↓
chunk
 ↓
...
```

So:

```
Buffer = a piece of data in memory

Stream = mechanism for handling data progressively
```

### 16. Stream is NOT necessarily "faster"

Important misconception. Streams don't magically make:

```
2 GB → 1 GB
```

or make the network faster. Their biggest benefits are:

**Memory efficiency**

Instead of

```
2 GB loaded
```

You can process:

```
small chunks
```

**Flow control**

Backpressure prevents producers from overwhelming consumers.

**Composability**

You can build:

```
read
 ↓
transform
 ↓
transform
 ↓
write
```

### 17. The Stream lifecycle

Readable:

```
data available
     ↓
chunks emitted
     ↓
end
```

Writable:

```
write()
write()
write()
  ↓
finish
```

Errors can occur anywhere:

```
Readable
   ↓
 error
   ↓
Transform
   ↓
 error
   ↓
Writable
```

This is another reason **pipeline()** is valuable.

### 18. Events you should know

For Readable

```
data
end
error
```

For Writable:

```
drain
finish
error
```

You don't need to memorize every event right now. But understand:

```
data → chunk arrived

end → readable has no more data

finish → writable has finished accepting data

error → something went wrong

drain → writable can accept more data
```

### 19. write() returning false

This is important for understanding backpressure at a lower level.

Consider:

```javascript
const canContinue = writable.write(chunk);
```

If:

```
canContinue === true
```

the writable can continue accepting data.

If:

```
canContinue === false
```

you should stop pushing data until:

```javascript
writable.on("drain", () => {
  // continue
});
```

You don't need to manually implement this every day. But you should understand why it exists. Because then:

```
readable.pipe(writable);
```

makes much more sense.

### 20. highWaterMark

Streams have internal buffering.

highWaterMark basically defines a threshold for how much data the stream tries to buffer before applying flow-control pressure.

Example:

```javascript
fs.createReadStream("./file.txt", {
  highWaterMark: 64 * 1024,
});
```

Here you're configuring a 64 KB threshold. But don't fall into the trap of thinking:

```
" highWaterMark= exactly the size of every chunk."
```

That's not the correct mental model.

```
It is primarily a buffering / flow-control threshold , and actual chunk behavior can depend on the stream.
```

**Industry rule**

Know what highWaterMark means . Don't obsess over tuning it unless your application actually needs performance optimization.

### 21. Object mode

Normally streams deal with:

```
Buffer
String
```

But streams can also operate in:

```
objectMode: true
```

Then chunks can be JavaScript objects:

```javascript
{
  id: 123,
  name: "Rudra"
}
```

This becomes useful for:

```
large data processing
database cursors
ETL pipelines
custom transforms
```

You should know the concept, but don't prioritize it over backpressure and pipeline.

### 22. Async iteration

Modern JavaScript gives you another beautiful way to consume streams:

```javascript
for await (const chunk of readable) {
  console.log(chunk);
}
```

It makes stream consumption feel similar to normal async code Example:

```javascript
const readable = fs.createReadStream("./large.txt");

for await (const chunk of readable) {
  console.log(chunk.toString());
}
```
