/*
  Idea is to pass a callback as an argument to a function that executes that callback only after some other code (maybe async) is complete.
*/

const fetchData = callback => {
  // We need a way of doing something further when this inner timer is done.  Here we can use the callback.
  setTimeout(() => {
    console.log(
      "2 FetchData async code executes and only when done will the callback be called."
    );
    callback("3 Done!");
  }, 5000);
};

setTimeout(() => {
  console.log("1 Timer is done");

  // Let's say we want to execute this callback below but is dependent on when more async code (ie inside fetchData() function
  // is completed.  This callback is not executed immediately.
  // fetchData(callback)
  fetchData(text => {
    console.log(text);
  });
}, 2000);

console.log("Hello");
console.log("Hi");

/*
    This is one way of handlind async code using callbacks
        setTimeout(callback, 2000) - callback function is called after two seconds
*/
