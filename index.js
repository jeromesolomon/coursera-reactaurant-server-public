//
// firebase node.js server w/ CRUD for cousera project
//

// get the required libraries
const express = require("express");
const bodyParser = require("body-parser");
const mongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;

// support for heroku port
const PORT = process.env.PORT || 3001;

// mongo db paths
const CONNECTION_URL = "mongodb+srv://MONGODBUSER:MONGODBPASS@MONGODBPATH/test?retryWrites=true";
const DATABASE_NAME = "reactaurant";

// mongo globals
let database;


var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// allow fetch api to access across origins with cors
app.use(function(req, res, next) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");

  next();
  
});

//
// hello-world endpoint
// http://localhost:3000/hello-world
//
app.get('/hello-world', (req, res) => {
  return res.status(200).send('Hello World!');
});

//
// endpoint for list by listName
//
app.get("/:listName", (request, response) => {

    let collection = database.collection(request.params.listName);

    collection.find({}).toArray((error, result) => {

    if (error) {
        return response.status(500).send(error);
    }

    response.send(result);

  });

});

//
// endpoint for element in list by listName/id
//
app.get("/:listName/:id", (request, response) => {

  let collection = database.collection(request.params.listName);

  collection.findOne({ "id": parseInt(request.params.id) }, (error, result) => {

    // console.log("error =", error);
    // console.log("result =", result);

    if (error) {
        return response.status(500).send(error);
    }

    response.send(result);

  });

});

//
// comment post
//
app.post("/comments", (request, response) => {

  // console.log("request.body = ", request.body);

  let collection = database.collection("comments");

  // figure out the number of comments
  let numComments = 0;
  collection.countDocuments({}, (countError, countResponse) => {

    if (countError) {
        return response.status(500).send(error);
    }

    
    // console.log("countResponse = ", countResponse);

    numComments = countResponse;

    // console.log("numComments = ", numComments);

    // set the comment id to num
    request.body.id = numComments;
    // console.log("request.body with id added = ", request.body);

  
    // add the new comment
    collection.insertOne(request.body, (error, result) => {

        if(error) {
            return response.status(500).send(error);
        }

        // console.log("result = ", result);

        response.send(result.ops[0]);

    });

  });


});


//
// connect to mongodb atlas via heroku or localhost
//

app.listen(PORT, () => {

    mongoClient.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {

        if(error) {
            throw error;
        }

        database = client.db(DATABASE_NAME);

        console.log("Connected to `" + DATABASE_NAME + "`!");
        console.log(`Server listening on port ${PORT}`);

    });

});


