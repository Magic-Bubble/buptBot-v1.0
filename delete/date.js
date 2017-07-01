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

	if (entity && relationship) getDate(session, entity, relationship);
	else if (entity) getEntity(session, entity);
}

function getDate (session, entity, relationship) {
	neo4j.get_er(entity, relationship, function (data) { sendData(session, data); });
}

function getEntity (session, entity) {
	neo4j.get_e(entity, function (data) { sendData(session, data); });
}

function sendData(session, data) {
	if (data.length != 1) session.send("<b>总计：</b>" + data.length);
	for (var i=0; i<data.length; i++) {
		var text = helper.createTextFromNode(data[i]);
		session.send(text);
	}
	session.endDialog();
}

module.exports = startProcess;