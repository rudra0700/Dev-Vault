React is a JavaScript library for rendering user interfaces (UI). UI is built from small units like buttons, text, and images. React lets you combine them into reusable, nestable components.

#### component:

React applications are built from isolated pieces of UI called components. A React component is a JavaScript function that you can sprinkle with markup. Components can be as small as a button, or as large as an entire page.

#### import and export:

You can declare many components in one file, but large files can get difficult to navigate. To solve this, you can export a component into its own file, and then import that component from another file:

#### Writing markup with JSX :

Each React component is a JavaScript function that may contain some markup that React renders into the browser. React components use a syntax extension called JSX to represent that markup. JSX looks a lot like HTML, but it is a bit stricter and can display dynamic information.

#### JavaScript in JSX with curly braces :

JSX lets you write HTML-like markup inside a JavaScript file, keeping rendering logic and content in the same place.

#### Passing props to a component :

React components use props to communicate with each other. Every parent component can pass some information to its child components by giving them props.

In React JS, "props" stands for "properties.They are a built-in React object used to pass data from a parent component down to a child component. pass data from a parent component down to a child component. You can think of props as arguments passed to a JavaScript function. you can pass any JavaScript value through them, including objects, arrays, functions, and even JSX!

When you create a component in React, React automatically creates an object to hold all the attributes you pass to that component. You do not have to create, define, or initialize this object yourself.

When you write JSX code like this:

```javascript
<Welcome username="Alex" age={25} />
```

Before the code runs in the browser, React converts that JSX into a standard JavaScript object. It gathers all your attributes and packs them into a single dictionary. Behind the scenes, it looks like this:

```javascript
// This is the built-in object React automatically constructs
{
  username: "Alex",
  age: 25
}
```

React then takes this automatically created object and injects it as the first argument into your component function.

```javascript
// React passes that built-in object right here into the 'props' variable
function Welcome(props) {
  console.log(props); // Outputs: { username: "Alex", age: 25 }
  return <h1>Hello, {props.username}</h1>;
}
```
