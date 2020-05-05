var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

var role = nlapiGetRole();

function beforeUserLoad(type, form) {
	if (type == 'view') {
		var systemAdmin = [3, 1032];

		//Only Admin Roles can move digitalisation
		if (isinArray(role, systemAdmin)){
			var zeeRecordId = nlapiGetRecordId();
			var zeeRecord = nlapiLoadRecord('partner', zeeRecordId);
			var new_zee = zeeRecord.getFieldValue('custentity_zeesold_new_zee');
			if (!isNullorEmpty(new_zee)){
				form.addButton('custpage_movedigitalisation', 'Move Digitalisation', getButtonScript('move_digitalisation', null, zeeRecordId));
			}
		}
	}
}

function getButtonScript(type, salesrecordid, zeeRecordId) {
    var rtnScript = 'return void';
    if (type == 'move_digitalisation') {
        var url = nlapiResolveURL('SUITELET', 'customscript_sl_move_digitalisation', 'customdeploy_sl_move_digitalisation');
        url += '&zee_id=' + zeeRecordId;
        rtnScript = "window.location='" + url + "'";
    }
    return rtnScript;
}

function isInArray(val, array) {
    return array.indexOf(val) >= 0;
}