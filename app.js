require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
var qna = require('./controller/qna');
var noanswer = require('./conf/noanswer');

var processNone = require('./controller/none'),
	processCount = require('./controller/count'),
	processJudge = require('./controller/judge'),
	processCompare = require('./controller/compare'),
	processRatio = require('./controller/ratio'),
	processMaxmin = require('./controller/maxmin');

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
bot.dialog('Count', processCount).triggerAction({ matches: '计数' });
bot.dialog('Judge', processJudge).triggerAction({ matches: '判断' });
bot.dialog('Compare', processCompare).triggerAction({ matches: '比较' });
bot.dialog('Radio', processRatio).triggerAction({ matches: '比例' });
bot.dialog('Maximin', processMaxmin).triggerAction({ matches: '最值' });
bot.dialog('None', processNone).triggerAction({ matches: 'None' });