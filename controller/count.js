var builder = require('botbuilder');
var parse = require("../utils/parse");
var neo4j = require("../utils/neo4j");
var helper = require("../utils/helper");
var qna = require('./qna');
var noanswer = require('../conf/noanswer');

function startProcess (session, args) {
	helper.saveQuestion(session);

	var school = parse.getSchool(args),
		department = parse.getDepartment(args),
		major = parse.getMajor(args),
		relationships = parse.getRelationships(args);

	var entity = "";
	if (school) entity = school;
	if (department) entity = department;
	if (major) entity = major;

	helper.saveContext(session, entity, relationships);

	if (entity && relationships.length) getNumber(session, entity, relationships);
	else if (relationships.length) combineContext(session, relationships);
	else qna.getAnswer(session.conversationData.allQuestions.slice(-1), function (answer) {
		if (answer) { session.send(answer); session.endDialog(); }
		else if (entity) getEntity(session, entity, relationships);
		else { session.send(noanswer); session.endDialog(); }
	});
}

function getNumber (session, entity, relationships) {
	neo4j.getNumber(entity, relationships, function (data) { sendData(session, data); });
}

function sendData (session, data) {
	if (!data.length) {
		qna.getAnswer(session.conversationData.allQuestions.slice(-1), function (answer) {
									if (answer) { session.send(answer); session.endDialog(); }
									else { session.send(noanswer); session.endDialog(); }
								});
	} else {
		var text = "<b>总计：</b>" + data.length + "，分别是：";
		for (var i=0; i<data.length-1; i++) text += data[i].name + "、";
		text += data[i].name;
		session.send(text);
		session.endDialog();
	}
}

function combineContext (session, relationships) {
	var isFind = false;
	for (var i = session.conversationData.context.length-1; i>=0; i--) {
		if (session.conversationData.context[i].entity) {
			isFind = true;
			var entity = session.conversationData.context[i].entity;
			var relationships = relationships.concat(session.conversationData.context[i].relationships);
			neo4j.getNumber(entity, relationships, function (data) { sendData(session, data); });
			break;
		}
	}
	if (!isFind) {
		var entity = "北京邮电大学";
		neo4j.getNumber(entity, relationships, function (data) { sendData(session, data); });
	}
}

module.exports = startProcess;