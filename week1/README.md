# [SocialHackersAcademy](https://www.socialhackersacademy.org/) - JavaScript third module
 week 1

## Some freeCodeCamp challenges:

1. [Comparisons with the Logical And Operator](https://www.freecodecamp.com/challenges/comparisons-with-the-logical-and-operator)

**Answer**

```js
function testLogicalAnd(val) {
  // Only change code below this line

  if ((val <= 50) && (val >= 25)) return "Yes";

  // Only change code above this line
  return "No";
}

// Change this value to test
testLogicalAnd(10);
```

2. [Record Collection](https://www.freecodecamp.com/challenges/record-collection)

**Answer**

```js
//   ...  code ...
// Only change code below this line
function updateRecords(id, prop, value) {
  var album = collection[id];

/* If value is empty (""), delete the given prop property from the album.  */
  if (value === "") {
    if (!!album[prop]) delete album[prop];
  } else {

/* If prop isn't "tracks" and value isn't empty (""), update or set the value for that record album's property. */

    if ((prop !== "tracks") && (value !=="")) {
        album[prop] = value;
    } else {

/* If prop is "tracks" but the album doesn't have a "tracks" property, create an empty array before adding the new value to the album's corresponding property.
*/
      var arr = album[prop];
      if (!arr) {
        console.log(arr);
        arr = [];
        arr.push(value);
        album[prop] = arr;
        arr = null;
        console.log(album[prop]);
      } else {
 /* If prop is "tracks" and value isn't empty (""), push the value onto the end of the album's existing tracks array.
 */
        arr.push(value);
        arr = null;
      }

    } // Here we close the if prop is not tracks statement
  } // here we close the if value is empty statement
  return collection;
}
//   ...  code ...
```

3. [Iterate over Arrays with map](https://www.freecodecamp.com/challenges/iterate-over-arrays-with-map)

**Answer**

```js
var oldArray = [1,2,3,4,5];

// Only change code below this line.

var newArray = oldArray.map(function(item) { return item += 3; });
```


## More map, filter, reduce, and =>

1. Say you would like to write a program that doubles the odd numbers in an array and throws away the even number.

Your solution could be something like this:
```js
let numbers = [1, 2, 3, 4];
let newNumbers = [];

for(let i = 0; i < numbers.length; i++) {
    if(numbers[i] % 2 !== 0) {
        newNumbers[i] = numbers[i] * 2;
    }
}

console.log("The doubled numbers are", newNumbers); // [2, 6]

```

rewrite the above program using `map` and `filter` don't forget to use `=>`

**Answer**

```js
let newNumbers = numbers.filter(ell => (ell%2 !== 0)).map(ell => (2*ell));
```

2. Use the array of the previous assignment, write a program that adds the even numbers to the resulting array twice, but the odd numbers only once. Don't forget to use `=>`.

Your output should be:
```js
console.log("The final numbers are", newNumbers);// [1, 2, 2, 3, 4, 4]
```

**Answer**

```js
var newNumbers = numbers
  .reduce(function(acc, ell) {
            acc.push(ell);
            if (ell%2 === 0) {
              acc.push(ell);
            }
            return acc;
  },[]);
```

3. Underneath you see a very interesting small insight in Maartje's work:
```js
let monday = [
        {
            name     : 'Write a summary HTML/CSS',
            duration : 180
        },
        {
            name     : 'Some web development',
            duration : 120
        },
        {
            name     : 'Try to convince teachers to fix homework class10',
            duration : 30
        },
        {
            name     : 'Fix homework for class10 myself',
            duration : 20
        },
        {
            name     : 'Talk to a lot of people',
            duration : 200
        }
    ];

let tuesday = [
        {
            name     : 'Keep writing summery',
            duration : 240
        },
        {
            name     : 'Some more web development',
            duration : 180
        },
        {
            name     : 'Staring out the window',
            duration  : 10
        },
        {
            name     : 'Talk to a lot of people',
            duration : 200
        },
        {
            name     : 'Look at application assignments new students',
            duration : 40
        }
    ];

let tasks = [monday, tuesday];
```

 Write a program that does the following:

1. Collect two days' worth of tasks.

**Answer**

```js
let collectedTasks = tasks[0].concat(tasks[1]);
```

2. Convert the task durations to hours, instead of minutes.

**Answer**

```js
let convertedTasks = collectedTasks
  .map(function(item) {
         let obj = {hours: (Math.floor(item.duration / 60)), minutes: (item.duration % 60)};
         item.duration = obj;
         return item;
});
```

3. Filter out everything that took two hours or more.

**Answer**

```js
let filteredTasks = convertedTasks.filter(item => (item.duration.hours < 2));
```

4. Sum it all up.

**Answer**

```js
let sumInMinutes = filteredTasks.reduce(function(acc, item) {
  acc += (item.duration.hours * 60) + (item.duration.minutes);
  return acc;
}, 0);
let sum = {};
sum.hours = Math.floor(sumInMinutes / 60);
sum.minutes = sumInMinutes % 60;
```

5. Multiply the result by a per-hour rate for billing (you can decide yourself what Maartje should make per hour).

**Answer**

```js
const perHourRate = 20;
let salary = (sumInMinutes * perHourRate) / 60;
```

6. Output a formatted Euro amount.

**Answer**

```js
console.log("Salary: " + salary.toFixed(2) + " euros.");
```

7. Don't forget to use `=>`

__Note: In every step we include the code from the previous steps__



# License and Copyright

Unless explicitly specified all this is copyrighted by Costas Stavrou, the
author of these Github pages and GPL-3 licensed.
