![](http://howlplay.com/static/media/logo.5c3ed17a.svg)
# HowlPlay Game-Server

A Node.js application which runs a single instance of the game server for the HowlPlay application. The game server is responsible for handling all player interactions and connections with an a single quiz. Node.js web-sockets are the underlying technology that power the game server.

## Running the Game Server Locally

To run the Howlplay Game Server locally is a simple two step process:
1. `npm install` or `yarn install` the required dependencies
2. Run either `npm start` or `yarn start`

## Data Specification

All data will be binary, which means, if you are using JavaScript, everything should be ArrayBuffer. Everything represented below will be in Uint8Array format for better readability.

Operation&nbsp;&nbsp;&nbsp;&nbsp;Payload

[0x0-0xFF     , 0x0-0xFF ...]

So how do we do string encodings?
We use something called SINU (SINU is not UTF-8)

We encode using a subset of UTF-8 and a superset of ASCII. All you need to do, is to encode the string using UTF-8, for example, if you encode "skittles", you should get the following:

Uint8Array [ 115, 0, 107, 0, 105, 0, 116, 0, 116, 0, 108, 0, 101, 0, 115, 0 ]

Then you want to delete data at all odd index positions, after the operation, you should get this:

Uint8Array [ 115, 107, 105, 116, 116, 108, 101, 115 ]

And that will be our final encoding. Make sure you follow this specification carefully.

## Operations

#### 0x00 Ping SERVER 

This operation is only for server.

For example, if server send the following data:

Uint8Array [ 0 ]

client should send back the same data once they receive it.

No payload is allowed. Data must be exactly [0x00].

#### 0x01 Request to Set Nickname CLIENT

This operation is for client side.

The nickname should be the payload.

For example, if you are trying to set nickname called: progamer96, then you should send the following data:

Uint8Array [ 1, 112, 114, 111, 103, 97, 109, 101, 114, 57, 54 ]

#### 0x02 Confirm Nickname Has Been Set SERVER

This operation will be sent once server has received 0x01, and can successfully set the nickname for that connection (no conflict).

You should not send any payload.

Uint8Array [ 2 ]

#### 0x03 Failed to Set Nickname SERVER

This operation will be sent if server received 0x01, and cannot set the nickname.

You should not send any payload.

Uint8Array [ 3 ]

#### 0x04 Request Quiz Hash Confirmation CLIENT

This operation should be sent by client upon connection, followed by MD5 hash of the quiz data.

One example would be:

Uint8Array [ 4, 56, 57, 53, 57, 102, 97, 100, 48, 56, 97, 102, 55, 100, 100, 54, 52, 54, 54, 48, 49, 97, 49, 53, 49, 102, 52, 97, 57, 102, 53, 101, 53 ]
// 8959fad08af7dd646601a151f4a9f5e5

MD5 hash should always be hex and lowercase.

#### 0x05 Successfully Confirmed Quiz Hash SERVER

Server will send this if quiz hash has been confirmed. No payload allowed.

Uint8Array [ 5 ]

#### 0x06 Failed to Confirm Quiz Hash SERVER

Server will send this if quiz hash does not match. No payload allowed.

Will also send this if nickname has not been set.

Uint8Array [ 6 ]

#### 0x07 Send Answers to Questions CLIENT

Send a list of answers to quiz questions.

First byte of the payload indicates question index, followed by answers after and including that index.

For example, if user answerd question 0,1,2,3, and the answers are: A, C, D, E, then your message should be:

Uint8Array [ 7, 0, 1, 3, 4, 5 ]

#### 0x09 Answers Accepted SERVER

Server should send this message if answers were accepted.

First byte indicates the next index, and second byte indicates how many answers were accepted.

For example, 0x07 message above should lead the server to respond with the following message:

Uint8Array [ 9, 4, 4 ]

#### 0x0A Answers Rejected SERVER

Server should send this message if answers were rejected.

Answers will be rejected if:

    Index overflow
    Have 2 0x07 messages processing at the same time.
    Not a valid answer, for example, user choose E when there are only A,B,C,D.
    Time has passed or game not started yet.

Same as 0x09, for example, 0x07 message above should lead the server to respond with the following message:

Uint8Array [ 10, 0, 0 ]