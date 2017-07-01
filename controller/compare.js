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
		common = parse.getCommon(args),
		relationships = parse.getRelationships(args);

	var entity = "";
	if (school) entity = school;
	if (department) entity = department;
	if (major) entity = major;

	var commonEntity = "";
	if (common) commonEntity = common;

	helper.saveContext(session, entity, relationships);

	if (commonEntity) {
		if (entity && relationships.length) { getEntity(session, entity, relationships, 0); getCommonEntity(session, commonEntity); }
		else if (!relationships.length) qna.getAnswer(session.conversationData.allQuestions.slice(-1), function (answer) {
			if (answer) { session.send(answer); session.endDialog(); }
			else if (entity) getEntity(session, entity, relationships);
			else { session.send(noanswer); session.endDialog(); }
		});
	} else {
		if (entity && relationships.length) getEntity(session, entity, relationships, 2);
		else if (!relationships.length) qna.getAnswer(session.conversationData.allQuestions.slice(-1), function (answer) {
			if (answer) { session.send(answer); session.endDialog(); }
			else if (entity) getEntity(session, entity, relationships);
			else { session.send(noanswer); session.endDialog(); }
		});
	}
}

function getEntity (session, entity, relationships, flag) {
	neo4j.getEntity(entity, relationships, function (data, entity, relationships) { sendData(session, data, flag, entity, relationships); });
}

function getCommonEntity (session, commonEntity) {
	neo4j.getEntity(commonEntity, [], function (data, entity) { sendData(session, data, 1, entity); });
}

function sendData (session, data, flag, entity, relationships) {
	var number = extractNumber(data);
	if (flag == 2) {
		session.send("本校官网缺失相关信息，无法比较");
		if (data[0]['url']) {
			var heroCard = createHeroCard(session, data[0]);
			session.send(heroCard);
		} else {
			var text = helper.createTextFromNode(data[0]);
			session.send(text);
		}
	} else {
		if (flag == 0) { 
			session.dialogData.data1 = data; 
			session.dialogData.entity1 = entity;
			session.dialogData.relationships1 = relationships; 
			session.dialogData.number1 = number; 
		} else if (flag == 1) { 
			session.dialogData.data2 = data; 
			session.dialogData.entity2 = entity;
			session.dialogData.number2 = number;
		}
		if (session.dialogData.data1 && session.dialogData.data2) {
			var text = "<b>" + session.dialogData.entity1 + "</b>" + "的";
			for (var i=0; i<session.dialogData.relationships1.length; i++) { text += "<b>" + session.dialogData.relationships1[i] + "</b>"; }
			text += "在<b>" + session.dialogData.entity2 + "</b>";
			if (session.dialogData.number1 < session.dialogData.number2) text += "之<b>前</b>";
			else text += "<b>之后</b>";
			session.send(text);
			if (session.dialogData.data1) {
				if (session.dialogData.data1[0]['url']) {
					var heroCard = createHeroCard(session, session.dialogData.data1[0]);
					session.send(heroCard);
				} else {
					var text = helper.createTextFromNode(session.dialogData.data1[0]);
					session.send(text);
				}
			}
			if (session.dialogData.data2) {
				if (session.dialogData.data2[0]['url']) {
					var heroCard = createHeroCard(session, session.dialogData.data2[0]);
					session.send(heroCard);
				} else {
					var text = helper.createTextFromNode(session.dialogData.data2[0]);
					session.send(text);
				}
			}
			session.endDialog();
		}
	}
}

function extractNumber (data) {
	var number = -1;
	if (data.length > 1) 
		number = data.length;
	else if (data.length)
		if (data[0]['desc_1']) number = parseInt(data[0]['desc_1']);
	return number;
}

function createHeroCard (session, data) {
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