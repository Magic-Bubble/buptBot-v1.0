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

	console.log(entity, relationships);

	if (entity && relationships.length) getEntity(session, entity, relationships);
	else if (relationships.length) combineContext(session, relationships);
	else qna.getAnswer(session.conversationData.allQuestions.slice(-1), function (answer) {
		if (answer) { session.send(answer); session.endDialog(); }
		else if (entity) getEntity(session, entity, relationships);
		else { session.send(noanswer); session.endDialog(); }
	});
}

function getEntity (session, entity, relationships) {
	if (relationships.length > 1) {
		neo4j.getEntity(entity, relationships[0], function (data) { sendData(session, data, 0); });
		neo4j.getEntity(entity, relationships[1], function (data) { sendData(session, data, 1); });
	} else if (relationships.length == 1) {
		neo4j.getEntity(entity, relationships, function (data) { sendData(session, data, 2); });
	}
}

function combineContext (session, relationships) {
	var isFind = false;
	for (var i = session.conversationData.context.length-1; i>=0; i--) {
		if (session.conversationData.context[i].entity) {
			isFind = true;
			var entity = session.conversationData.context[i].entity;
			var relationships = relationships.concat(session.conversationData.context[i].relationships);
			neo4j.getEntity(entity, relationships, function (data) { sendData(session, data); });
			break;
		}
	}
	if (!isFind) {
		var entity = "北京邮电大学";
		neo4j.getEntity(entity, relationships, function (data) { sendData(session, data); });
	}
}

function sendData (session, data, flag) {
	var number = extractNumber(data);
	if (flag == 0) { session.dialogData.data1 = data; session.dialogData.ratio1 = number; } 
	else if (flag == 1) { session.dialogData.data2 = data; session.dialogData.ratio2 = number; }
	else if (flag == 2) {
		session.send("本校官网缺失相关信息，无法计算比例");
		if (data[0]['url']) {
			var heroCard = createHeroCard(session, data[0]);
			session.send(heroCard);
		} else {
			var text = helper.createTextFromNode(data[0]);
			session.send(text);
		}
	}
	if (session.dialogData.data1 && session.dialogData.data2) {
		if (session.dialogData.ratio1 >= 0 && session.dialogData.ratio2 > 0) {
			var ratio = session.dialogData.ratio1 / session.dialogData.ratio2;
			session.send("比例为：" + ratio * 100 + "%");
		}
		if (session.dialogData.data1) {
			if (session.dialogData.data1[0]['url']) {
				var heroCard = createHeroCard(session, session.dialogData.data1[0]);
				session.send(heroCard);
			} else {
				var text = helper.createTextFromNode(session.dialogData.data1[0]);
				session.send(text);
			}
		}
		if (ession.dialogData.data2) {
			if (session.dialogData.data2[0]['url']) {
				var heroCard = createHeroCard(session, session.dialogData.data2[0]);
				session.send(heroCard);
			} else {
				var text = helper.createTextFromNode(session.dialogData.data2[0]);
				session.send(text);
			}
		}
	}
	session.endDialog();
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