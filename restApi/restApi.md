Api is not just a frontend, backend machanism. It connects the organaization exposing their data through. Api is like a contract. Api is a medium of exchanging data. That means i will give some information to get some other information if i have authority. Its not about REST api, its the general concept about only API. Api is just a hidden thing , we dont know how its implemented behind the scene and actually we dont even need to know how it works, we just know we give input and api will gives us output(data). Like every programming language has built in api, using which we can access the file system, operating system. REST, Graphql, soap, webhook is just a way of style how to expose the door of pipeline.

When we implelement stripe in nodejs backend, we have to send must necessary data to stripe, otherwise we cant proceed the payment. So its a **`design decision`** of stripe api how stripe will receive the data from client and its also expose the example response object so that developer can understand what they will get after input

When you are going to develop a application, think about api first, not design, not database. Like you want to make a password generator app. Think about first that what should be my endpoint, what minimum input can i take from user, what if user want this kind of strength, what if user dont provide character or too much character. So think about api first before developing application. This is called **`API first approach`**

In api lifecycle there is two lifecycle, producer lifecycle and consumer lifecycle. In producer lifecycle, designing api is one of the most important things. Its include the resources, the style of url endpoint, url authentication, authorization. So it has to be a stand alone standerdized design so that different platform can understand the api. The common standard language for api design is **`OpenApi Specification`** like dollar system.

Api design does not means api development like using nodejs or python, Its a design decision. API design is the process of making intentional decisions about how an API will expose data and functionality to its consumers. A successful API design describes the API endpoints, methods, and resources in a standardized specification format.

Hobby project is the best place to show your work that you implement that you have learned so many difficult things.

Process:
Step 1: Determine what the API is intended to do
Step 2: Define the API contract with a specification
Step 3: Validate your assumptions with mocks and tests
Step 4: Document the API

What is REST api?
REST stands for Representational State Transfer and API stands for Application
Programming Interface. It's an architectural style for networked applications, defining
principles for resource identification, addressing, and data exchange between clients and
servers via HTTP

If you follow the 6 constraint of REST api design, it will automatically be a scalable REST api design.

What is Representational state?
In the context of REST Architecture, a resource is any data
object or entity that can be accessed or manipulated through
the REST API. And "Representational State" Means" it represents
the current state of your Resources. Now this representation
can be JSON, XML, or any other format.

The 6 constraint are: 
1. Client server - client and server must be seperate
2. Statelessness - must be stateless means, every request must send the requirements data to get the data no matter how many times you request in an endpoint.
3. Cachebility: 
4. Uniform interface
5. Layyered system

Day 2: 

1. Partial Response
partial response is important because we dont need whole fields from backend, if all the things are sent from server, the data transmission will be slow. In pertial response we only sent that data we need. So latency will be low and bandwidth will save and response size will be low

Http-cache-control
When topic is about cache control, three things should be in your head: 
1. What data will we cache?
2. Who will cache the data?
3. For How much time this caching data will saved?

Etag is just a flag. it does not store any resource or data, its just check the version of data has changed or not

in api versioning ,  if you do any breaking change or non breaking change, api versioning is the only way and you have to write all the controller and services function from scratch, so that prev version client application dont fall. Then if you want prev versions feattures will stay in new version , make sure to copy all feature from prev version and gracefully deprecated the prev version.

Make sure you give depreciation warning before deprecate your previous version so that current client base applications instantly dont face any disaster. They should get enough time to change their codebase. You can give the warning as a object property inside new versions response body.

And most important part before deprecation is, you must monitor the traffic when thinking about the complete shift to the new version. For example, if prev version has 1 million user and after release new version , if all user or most of the user dont shift to the new version, dont deprecate the old version.

Day - 3
JSON and Yaml is the format of data which we transmit over network. So to writing api we use common format, either json or yaml. But as a common specification we will use openApi specification(contract paper)

