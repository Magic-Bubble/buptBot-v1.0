var builder = require('botbuilder');

function getByType (args, type, all=false) {
	if (!all) {
		var tmp = "";
		var tmpEntity = builder.EntityRecognizer.findEntity(args.intent.entities, type);
		if (tmpEntity) tmp = tmpEntity.resolution.values[0];
	} else {
		var tmp = [];
		var tmpEntities = builder.EntityRecognizer.findAllEntities(args.intent.entities, type);
		if (tmpEntities) {
			tmpEntities.sort(function (a, b) {
				return parseInt(a.startIndex) == parseInt(b.startIndex) ? 
					parseInt(b.endIndex) - parseInt(a.endIndex) : parseInt(a.startIndex) - parseInt(b.startIndex)
				});
			var curEnd = 0;
			for (var i=0; i<tmpEntities.length; i++) {
				var end = parseInt(tmpEntities[i].endIndex);
				if (end > curEnd) {
					tmp.push(tmpEntities[i].resolution.values[0]);
					curEnd = end;
				}
			}
		}
	}
	return tmp;
}

function getSchool (args) {
	return getByType(args, "学校列表");
}

function getDepartment (args) {
	return getByType(args, "院系机构列表");
}

function getMajor (args) {
	return getByType(args, "专业列表");
}

function getCommon (args) {
	return getByType(args, "常识列表");
}

function getRelationships (args) {
	return getByType(args, "关系列表", true);
}

module.exports = {
	"getSchool": getSchool,
	"getDepartment": getDepartment,
	"getMajor": getMajor,
	"getCommon": getCommon,
	"getRelationships": getRelationships
}
