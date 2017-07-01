require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
var noanswer = require('./conf/noanswer');

var processCommon = require('./controller/common');
/*var processConcept = require('./intents/concept'),
	processPerson = require('./intents/person'),
	processDate = require('./intents/date'),
	processLocation = require('./intents/location'),*/
var processNumber = require('./controller/number');
var test = require('./controller/test');
	/*processNone = require('./intents/none');*/

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
	console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID,
	appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector);
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.dialog('/', function (session) { session.send(noanswer); session.endDialog(); });
bot.dialog('Concept', processCommon).triggerAction({ matches: '概念' });
bot.dialog('Person', processCommon).triggerAction({ matches: '人物' });
bot.dialog('Date', processCommon).triggerAction({ matches: '时间' });
bot.dialog('Location', processCommon).triggerAction({ matches: '地点' });
bot.dialog('Number', processNumber).triggerAction({ matches: '数字' });
bot.dialog('Repectively', test).triggerAction({ matches: 'repectively' });
/*bot.dialog('None', processNone).triggerAction({ matches: 'None' });*/