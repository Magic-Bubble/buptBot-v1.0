var builder = require('botbuilder');
var parse = require("../utils/parse");
var neo4j = require("../utils/neo4j");
var helper = require("../utils/helper");
var noanswer = require('../conf/noanswer');

function startProcess (session, args) {
	var school = parse.getSchool(args),
		department = parse.getDepartment(args),
		major = parse.getMajor(args),
		relationships = parse.getRelationships(args);

	var entity = "";
	if (school) entity = school;
	if (department) entity = department;
	if (major) entity = major;

	if (entity) getConcept(session, entity, relationships);
	else if (relationships.length) combineContext(session, relationships);
	else session.send(noanswer);
}

function getConcept (session, entity, relationships) {
	neo4j.getEntity(entity, relationships, function (data) { sendData(session, data); });
}

function combineContext (session, relationships) {
	
}

function sendData(session, data) {
	if (data.length != 1) session.send("<b>总计：</b>" + data.length);
	for (var i=0; i<data.length; i++) {
		if (data[i]['url']) {
			var heroCard = createHeroCard(session, data[i]);
			session.send(heroCard);
		} else {
			var text = helper.createTextFromNode(data[i]);
			session.send(text);
		}
	}
	session.endDialog();
}

function createHeroCard(session, data) {
	var options = helper.createHeroCardOptionsFromNode(data);
	var msg = new builder.Message(session);
	msg.attachments([
		new builder.HeroCard(session)
			.title(options.title)
			.subtitle(options.subtitle)
			.text(options.text)
			.images([builder.CardImage.create(session, options.image)])
	]);
	return msg;
}

module.exports = startProcess;