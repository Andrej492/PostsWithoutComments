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
app.use(function ( request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type",
    "Accept, Authorization");
  next();
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

function updatePost( postId, postTitle, postContent, postImagePath) {
    return dynamodb.update({
      TableName: tableName,
      Key: {
        id: postId
      },
      UpdateExpression: 'set #postTitle = :value1, #postContent = :value2, #postImagePath = :value3',
      ExpressionAttributeNames: {
        '#postTitle': 'postTitle',
        '#postContent': 'postContent',
        '#postImagePath': 'postImagePath'
      },
      ExpressionAttributeValues: {
        ':value1': postTitle,
        ':value2': postContent,
        ':value3': postImagePath,
      },
      ReturnValues: 'ALL_NEW'
    }).promise()
  }
app.put("/posts", function(request, response) {
  let params = {
    TableName: tableName,
    Key: {
      id: request.body.id
    },
    UpdateExpression: 'set #postTitle = :value1, #postContent = :value2, #postImagePath = :value3',
      ExpressionAttributeNames: {
        '#postTitle': 'postTitle',
        '#postContent': 'postContent',
        '#postImagePath': 'postImagePath'
      },
      ExpressionAttributeValues: {
        ':value1': request.body.postTitle,
        ':value2': request.body.postContent,
        ':value3': request.body.postImagePath,
      },
      ReturnValues: 'ALL_NEW'
  }
  dynamodb.update(params, (err, result) => {
    if(err) {
      response.json({
        statusCode: 500,
        error: err.message,
        url: request.url
      });
    } else{
      response.json({
        success: 'put call succeed!',
        url: request.url,
        body: JSON.stringify(result)
      })
    }
  });
});
app.delete("/posts", function(request, response) {
  let params = {
    TableName: tableName,
    Key: {
      id: request.body.id
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


function appendComments(postId, comment) {
  return dynamodb.update({
    TableName: tableName,
    Key: { id: postId },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'set #comments = list_append(if_not_exists(#comments, :empty_list), :comment)',
    ExpressionAttributeNames: {
      '#comments': 'comments'
    },
    ExpressionAttributeValues: {
      ':comment': [comment],
      ':empty_list': []
    }
  }).promise()
}

app.post("/posts/:id", function(request,response) {
  const timestamp = new Date().toISOString();
  var appendedComments = [];
  appendComments(request.params.id,
    {
      commentId: uuidv4(),
      commentContent: request.body.comments.commentContent,
      commentOwnerId: getUserId(request),
      commentOwnerUsername: request.body.comments.commentOwnerUsername,
      commentEdited: request.body.comments.commentEdited,
      commentCreatedAt: timestamp,
      commentUpdatedAt: timestamp
    }
  ).then(res => {
      appendedComments = res;
      console.log(res);
    }
  )
  let params = {
    TableName: tableName,
    Item : {
      comments: appendedComments
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

function updateComment(postId, index, commentContent, isEdited, timestampUpdate) {
  return dynamodb.update({
    TableName: tableName,
    Key: { id: postId },
    UpdateExpression: 'set #comments['+ index +'].commentContent = :value1, #comments['+ index +'].commentEdited = :value2, #comments['+ index +'].commentUpdatedAt = :value3',
    ExpressionAttributeNames: {
      '#comments': 'comments'
    },
    ExpressionAttributeValues: {
      ':value1': commentContent,
      ':value2': isEdited,
      ':value3': timestampUpdate
    },
    ReturnValues: 'ALL_NEW'
  }).promise()
}

app.put("/posts/:id", function(request,response) {
  const timestampUpdate = new Date().toISOString();
  var updatedComments = [];
  updateComment(
    request.params.id,
    request.body.comments.commentIndex,
    request.body.comments.commentContent,
    request.body.comments.commentEdited,
    timestampUpdate
  )
  .then(res => {
    updatedComments = res;
    console.log(res);
  }
  ).catch(err => console.log(err));
  let params = {
    TableName: tableName,
    Key: {
      id: request.params.id
    },
    Item : {
      comments: updatedComments
    }
  }
  dynamodb.update(params, (err, result) => {
    if(err) {
      response.json({
        statusCode: 500,
        error: err.message,
        url: request.url
      });
    } else{
      response.json({
        success: 'put call succeed!',
        url: request.url,
        body: JSON.stringify(params.Item)
      })
    }
  });
});


function deleteComment(postId, index) {
  return dynamodb.update({
    TableName: tableName,
    Key: { id: postId },
    UpdateExpression: 'REMOVE #comments['+ index +']',
    ExpressionAttributeNames: {
      '#comments': 'comments'
    },
    ReturnValues: 'ALL_NEW'
  }).promise()
}

app.delete("/posts/:id", function(request, response) {
  var updatedComments = [];
  deleteComment(
    request.params.id,
    request.body.comments.commentIndex,
  ).then(res => {
    updatedComments = res;
    console.log(res);
  }).catch(err => console.log(err));
  let params = {
    TableName: tableName,
    Key: {
      id: request.params.id
    },
    Item : {
      comments: updatedComments
    }
  }
  dynamodb.update(params, (err, result)=> {
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
        body: JSON.stringify(params.Item)
      });
    }
  });
});

module.exports = app

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file

