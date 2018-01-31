var builder = require('botbuilder');
var restify = require('restify'); // module pour executer le bot dans un canal ou un emulateur il faut l'exécuter sur une api endpoint

//var connector = new builder.ChatConnector().listen(); // pour tester a l'invite de cmd node.js: ConsoleConnector pour emulateur : ChatConnector

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
  
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});


// Listen for messages from users 
server.post('/api/messages', connector.listen());



/* // Receive messages from the user and respond by echoing each message back (prefixed with 'blabla')
var bot = new builder.UniversalBot(connector,  [
    // Step 1
    function (session) {
        session.beginDialog('Bonjour ');
        builder.Prompts.text(session, 'Quel est ton prénom? ');
    },
    // Step 2
    function (session, results) {
        session.endDialog(`Coucou ${results.response}!`);
    }
]); */

var inMemoryStorage = new builder.MemoryBotStorage();

// This is a dinner reservation bot that uses a waterfall technique to prompt users for input.
var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("Welcome to the dinner reservation.");
        builder.Prompts.time(session, "Please provide a reservation date and time format (MM/JJ/AAAA HH:MM:SS)");
    },
    function (session, results) {
        session.dialogData.reservationDate = builder.EntityRecognizer.resolveTime([results.response]);
        builder.Prompts.number(session, "How many people are in your party?");
    },
    function (session, results) {
        session.dialogData.partySize = results.response;
        builder.Prompts.text(session, "Whose name will this reservation be under?");
    },
    function (session, results) {
        session.dialogData.reservationName = results.response;

        // Process request and display reservation details
        session.send(`Reservation confirmed. Reservation details: <br/>Date/Time: ${session.dialogData.reservationDate} <br/>Party size: ${session.dialogData.partySize} <br/>Reservation name: ${session.dialogData.reservationName}`);
        session.endDialog();
    }
]).set('storage', inMemoryStorage); // Register in-memory storage 



