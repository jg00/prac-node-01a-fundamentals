// 1 Object destructuring
const person = {
  name: "Willy",
  age: 29,
  greet() {
    console.log(this.name);
    // console.log(this);
  }
};

// 2 One way to get name by passing full object
/*
    const printName = personData => {
    console.log(personData.name);
    };

    printName(person);
*/

// 3a Object destructuring - Let's say we are only interested in the name.  Using objectdestructuring we can specify
// the property we are interested.
// In objects we pull them out by property name
const printName = ({ name, greet }) => {
  console.log(name);
  greet.bind(person)();
};

printName(person);

// 3b Object destructuring
const { name, age } = person;
console.log(name, age);

// 4 Array destructuring - names can be any because in arrays, the elements are pulled out by position.
const hobbies = ["Sports", "Cooking"];
let [hobby1, hobby2] = hobbies;
console.log(hobby1, hobby2); // We get Sports Cooking.  Note these are individual properties and not an array eventhough we destructure using [hobby1, hobby2]
