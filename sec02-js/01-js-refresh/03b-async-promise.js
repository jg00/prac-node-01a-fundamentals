const fetchData = () => {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Done");
    }, 5000);
  });
  return promise;
};

setTimeout(() => {
  console.log("1 Timer is done");

  fetchData() // returns a promise and we can use .then
    .then(text => {
      console.log(text);
      return fetchData(); // will return another promise and we can use .then
    })
    .then(text2 => {
      console.log(text2);
    });
}, 2000);

console.log("0 Hello");
console.log("0 Hi");
