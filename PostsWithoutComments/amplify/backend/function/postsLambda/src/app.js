const AWS = require('aws-sdk')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var bodyParser = require('body-parser')
var express = require('express')
const { v4: uuidv4 } = require('uuid')

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "postsTable";
if(process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

const getUserId = request => {
  try {
    const reqContext = request.apiGateway.event.requestContext;
    const authProvider = reqContext.identity.cognitoAuthenticationProvider;
    return authProvider ? authProvider.split(":CognitoSignIn:").pop() : "UNAUTH";
  } catch (error) {
    return "UNAUTH";
  }
}

var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (request, response, next) {
  response.header("Access-Control-Allow-Origin", "*")
  response.header("Access-Control-Allow-Headers", "Origin", "X-Requested-With", "Content-Type: application/json", "Accept")
  next()
});

app.get("/posts", function(request, response) {
  let params = {
    TableName: tableName,
    limit: 100,
  }
  dynamodb.scan(params, (err, result) => {
    if (err) {
      response.json({
        statusCode: 500,
        error: 'Could not load items: ' + err.message
      });
    } else {
      response.json({
        statusCode: 200,
        url: request.url,
        body: JSON.stringify(result.Items)
      });
    }
  });
});

app.get("/posts/:id", function(request, response) {
  let params = {
    TableName: tableName,
    Key: {
      id: request.params.id
    }
  }
  dynamodb.get(params, (err, result) => {
    if(err) {
      response.json({
        statusCode: 500,
        error: 'Could not load item: ' + err.message
      });
    } else {
      if (result.Item) {
        response.json({
          statusCode: 200,
          url: request.url,
          body: JSON.stringify(result.Item)
        });
      } else {
        response.json(result) ;
      }
    }
  });
});

app.post("/posts", function(request, response) {
  //const username = request.apiGateway.event.requestContext.identity.usernameCognito;
  let params = {
    TableName: tableName,
    Item: {
      id: uuidv4(),
      postTitle: request.body.postTitle,
      postContent: request.body.postContent,
      postImagePath: request.body.postImagePath,
      postOwnerId: getUserId(request)
    }
  }
  dynamodb.put(params, (err, result) => {
    if(err) {
      response.json({
        statusCode: 500,
        error: err.message,
        url: request.url
      });
    } else{
      response.json({
        success: 'post call succeed!',
        url: request.url,
        body: JSON.stringify(params.Item)
      })
    }
  });
});

app.put("/posts", function(request, response) {
  let params = {
    TableName: tableName,
    Key : {
      id: request.body.id
    }
  }
  dynamodb.put(params, (err, result) => {
    if(err) {
      response.json({
        statusCode: 500,
        error: err,
        url: request.url
      });
    } else{
      response.json({
        success: 'put call succeed!',
        statusCode: 200,
        url: request.url,
        body: JSON.stringify(result.Attributes)
      })
    }
  });
});

app.delete("/posts/:id", function(request, response) {
  let params = {
    TableName: tableName,
    Key: {
      id: request.params.id
    }
  }
  dynamodb.delete(params, (err, result)=> {
    if(err) {
      response.json({
        statusCode: 500,
        error: err.message,
        url: request.url
      });
    } else {
      response.json({
        success: 'delete call succeed!',
        statusCode: 200,
        url: request.url,
        body: JSON.stringify(result)
      });
    }
  });
});

app.listen(3000, function() {
    console.log("App started")
});

module.exports = app

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file

