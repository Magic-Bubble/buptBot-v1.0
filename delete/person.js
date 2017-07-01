var builder = require('botbuilder');
var parse = require("../utils/parse");
var neo4j = require("../utils/neo4j");
var helper = require("../utils/helper");

function startProcess (session, args) {
	var school = parse.getSchool(args),
		department = parse.getDepartment(args),
		major = parse.getMajor(args),
		relationship = parse.getRelationship(args);

	var entity = "";
	if (school) entity = school;
	if (department) entity = department;
	if (major) entity = major;

	console.log(entity, relationship);

	if (entity && relationship) getPerson(session, entity, relationship);
	else if (entity) getEntity(session, entity);
}

function getPerson (session, entity, relationship) {
	neo4j.get_er(entity, relationship, function (data) { sendData(session, data); });
}

function getEntity (session, entity) {
	neo4j.get_e(entity, function (data) { sendData(session, data); });
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