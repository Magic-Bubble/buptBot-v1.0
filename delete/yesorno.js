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

	if (entity && relationship) getConcept(session, entity, relationship);
}

function getYesorno (session, entity, relationship) {
	neo4j.get_ere(entity1, relationship, entity2, function (data) { sendData(session, data); });
}

function sendData(session, data) {
	if (data) {
		session.send("是");
	} else {
		session.send("不是");
	}
	session.endDialog();
}

module.exports = startProcess;