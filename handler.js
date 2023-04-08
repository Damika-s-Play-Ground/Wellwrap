const serverlessExpress = require("@vendia/serverless-express");
const app = require("./src/app");
const AWS = require("aws-sdk");
const ses = new AWS.SES({ region: "us-east-1" });
const cognito = new AWS.CognitoIdentityServiceProvider();
const UserModel = require("./src/models/user.model");

let serverlessExpressInstance;

async function email(data) {
  try {
    const params = {
      Destination: {
        ToAddresses: [data.toAddresses],
      },
      Message: {
        Body: {
          Text: {
            Data: data.message,
          },
        },
        Subject: {
          Data: data.subject,
        },
      },
      Source: "damikaanupama@gmail.com",
    };
    const success = await ses.sendEmail(params).promise();
    console.log(success);
  } catch (err) {
    console.log(err);
  }
}

async function setup(event, context) {
  serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context);
}

async function callExistingLambdaFunction(user, token) {
  // Create a new AWS Lambda service object
  const lambda = new AWS.Lambda();

  // Set the parameters for the function
  const params = {
    FunctionName: "wellwrap-dev-app", // EXISTING_LAMBDA_FUNCTION_NAME
    Payload: JSON.stringify({
      user: user,
      token: token,
    }),
  };

  // Invoke the function and wait for the response
  await lambda.invoke(params).promise();
}

async function cognitoPostConfirmation(event, context) {
  const clientId = event.callerContext.clientId;
  const username = event.userName;
  const email = event.request.userAttributes.email;
  let user_type = event.request.userAttributes["custom:groups"];

  if (user_type == "Patient") {
    user_type = 1;
  } else if (user_type == "Doctor") {
    user_type = 2;
  } else if (user_type == "Insurance Company") {
    user_type = 3;
  } else if (user_type == "Friends and Family") {
    user_type = 4;
  }

  console.log("cognitoPostConfirmation: ", event, {
    username,
    email,
    user_type,
  });

  // Send an email using Amazon SES
  // await sendConfirmationEmail(user);

  await UserModel.create({ username, email, user_type });
  const flags = await UserModel.findFlags(username);
  console.log(flags);

  const initiateAuthParams = {
    AuthFlow: "CUSTOM_AUTH",
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
    },
  };
  cognito.initiateAuth(initiateAuthParams, function (err, data) {
    console.log("initiateAuth: ");
    if (err) {
      console.log(err, err.stack);
    } else {
      console.log(data.AuthenticationResult);
    }
  });
  event.flags = flags;
  return event;
}

function handler(event, context) {
  if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
    return cognitoPostConfirmation(event, context);
  }

  if (serverlessExpressInstance) {
    return serverlessExpressInstance(event, context);
  }

  return setup(event, context);
}

exports.handler = handler;
exports.email = email;
