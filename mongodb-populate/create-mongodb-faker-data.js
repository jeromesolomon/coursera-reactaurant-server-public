//
// create some data in mongo using faker
//

// get the required libraries
const mongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;

const faker = require("faker");
const _ = require("lodash");
const { date } = require("faker");

// set faker to us english
faker.locale = "en_US";


// mongo db paths
const CONNECTION_URL = "mongodb+srv://MONGODBUSER:MONGODBPASS@MONGODBPATH/test?retryWrites=true";
const DATABASE_NAME = "reactaurant";

// mongo globals
let database;


// create dish list
const createDishList = (numDish) => {

  let l = [];

  _.times(numDish, (index)=> {

    let imagePath = "images/dish" + ((index % 4) + 1).toString() + ".png";
    
    let num = faker.finance.amount() % 20;
    let value = Math.round((num + Number.EPSILON) * 100) / 100;
    let price = value.toString();

    let labelList = ["Hot", "Mild", "Spicy", "Plain"];
    labelList = faker.helpers.shuffle(labelList);
    label = labelList[0];

    let dish = {
      "id": index,
      "name": faker.commerce.productName(),
      "image": imagePath,
      "category": faker.commerce.color(),
      "label": label,
      "price": price,
      "featured": faker.random.boolean(),
      "description": faker.random.words(15).toLocaleLowerCase()
    };

    l.push(dish);

  });

  

  return l;

};

  

// create comment list
const createCommentList = (numComment, dishList) => {

  let l = [];

  _.times(numComment, (index)=> {


    let dishId = Math.floor(Math.random() * dishList.length); 

    let rating = Math.floor(Math.random() * 5) + 1; 

    let year = 2010 + Math.floor(Math.random() * 10);
    let month = Math.floor(Math.random() * 12);
    let day = Math.floor(Math.random() * 25);

    let date = new Date(year, month, day).toISOString();

    let comment = {
      "id": index,
      "dishId": dishId,
      "rating": rating,
      "comment": faker.random.words(9).toLocaleLowerCase(),
      "author": faker.name.findName(),
      "date": date
    };

    l.push(comment);

  });
  

  return l;

};


// create promo list
const createPromoList = (numLeader, dishList) => {

  let l = [];

  _.times(numLeader, (index)=> {

    let i = Math.floor(Math.random() * dishList.length); 

    // console.log("i = ", i);
    // console.log("dishList = ", dishList);

    l.push(dishList[i]);

  });
  

  return l;

};


// create leader list
const createLeaderList = (numPromo) => {

  let l = [];

  _.times(numPromo, (index)=> {

    let imagePath = "images/leader" + ((index % 4) + 1).toString() + ".png";

    let leader = {
      "id": index,
      "name": faker.name.findName(),
      "image": imagePath,
      "designation": faker.name.jobTitle(),
      "abbr": "Team Member",
      "featured": faker.random.boolean(),
      "description": faker.random.words(12).toLocaleLowerCase()
    };

    l.push(leader);

  });
  

  return l;

};


// create feedback list
const createFeedbackList = (numComment) => {

  let l = [];

  _.times(numComment, (index)=> {


    let year = 2010 + Math.floor(Math.random() * 10);
    let month = Math.floor(Math.random() * 12);
    let day = Math.floor(Math.random() * 25);

    let date = new Date(year, month, day).toISOString();

    let feedback = {
      "firstname": faker.name.firstName(),
      "lastname": faker.name.lastName(),
      "telnum": "123456789",
      "email": faker.internet.email(),
      "agree": faker.random.boolean(),
      "contactType": "Email",
      "message": faker.random.words(12).toLocaleLowerCase(),
      "date": date,
      "id": index
    };

    l.push(feedback);

  });
  

  return l;

};

//
// create list
//
function createList(listName, dishList) {

  let l = [];

  switch (listName) {

    case "dishes":
        l = createDishList(14);
        break;

    case "comments":
        l = createCommentList(25, dishList);
        break;

    case "leaders":
        l = createLeaderList(5);
        break;

    case "promotions":
        l = createPromoList(3, dishList);
        break;

    case "feedback":
        l = createFeedbackList(7);
        break;

    default:
      l = [];
  }

  return l;

}

//
// add list
//
function addList(listName, colName) {

  database.collection(colName).insertMany(listName, function(error, response) {

    if (error) 
      throw error;

    console.log("Number of documents inserted: " + response.insertedCount);

  });

}

//
// delete data
//
function deleteData(colName) {

  database.collection(colName).drop(function(error, response) {

    if (error) 
      throw error;

    console.log("Collection deleted");

  });

}

//
// create data
//
function createData(colName, listData) {

  database.createCollection(colName, function(error, response) {

    if (error) 
      throw error;

    // console.log("response =", response);
    console.log("Collection created");

    console.log("Add list");
    addList(listData, colName);


  });

}

//
// create data, connect to db, and write data
//
function main() {

  
  mongoClient.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {

      if (error) {
          throw error;
      }

      database = client.db(DATABASE_NAME);
      console.log("Connected to `" + DATABASE_NAME);

      
      // loop on each list type
      let dishList = [];

      let allLists = ["dishes", "comments", "leaders", "promotions", "feedback"];

      for (let listName of allLists) {

        console.log("Creating listName = ", listName);

        deleteData(listName);

        // create list, pass in dishList for non dish list lists
        let l = [];

        if (listName == "dishes") {
          l = createList(listName, []);
          dishList = l;
        }
        else {
          l = createList(listName, dishList);
        }
          
        // console.log("l =", l);


        createData(listName, l);

        const prompt = require('prompt-sync')();
        const name = prompt('Wait a few seconds,hit return, and process next table:');

      }

      // console.log("Closing connection to " + DATABASE_NAME);
      // client.close();


  });


}


main();

