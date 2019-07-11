// this handled in object
const person = {
  name: "Bill",
  age: 20,
  greet() {
    console.log("'this' refers to person object " + this.name);
  },
  greet2: () => {
    console.log("'this' refers to global scope " + this.name);
  },
  greet3: function() {
    console.log("'this' refers to person object " + this.name);
  }
};

person.greet(); // Bill
person.greet2(); // undefined
person.greet3(); // Bill
