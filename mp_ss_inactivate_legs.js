var ctx = nlapiGetContext();
var usageThreshold = 50;
var adhocInvDeploy = 'customdeploy1';
var prevInvDeploy = null;

function inactivateLegs() {
    var zee_id = parseInt(ctx.getSetting('SCRIPT', 'custscript_zee_id_2'));
    nlapiLogExecution('DEBUG', 'zee_id', zee_id);

    var legsSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_move_digit_legs');
    var filterExpression = [
        ["custrecord_service_leg_franchisee", "is", zee_id],
    ];
    legsSearch.setFilterExpression(filterExpression);
    var legsResult = legsSearch.runSearch();

    var old_leg_id;
    var count = 0;

    legsResult.forEachResult(function(legResult) {
        var leg_id = legResult.getValue("internalid");
        var freq_id = legResult.getValue("internalid", "CUSTRECORD_SERVICE_FREQ_STOP", null);

        nlapiLogExecution('DEBUG', 'service_id', service_id);

        if (count == 0) {
            nlapiLogExecution('DEBUG', 'leg_id', leg_id);
            var leg_record = nlapiLoadRecord('customrecord_service_leg', leg_id);
            leg_record.setFieldValue('isinactive', 'T');
            nlapiSubmitRecord(leg_record);
        } else if (old_leg_id != leg_id) {
            nlapiLogExecution('DEBUG', 'leg_id', leg_id);
            var leg_record = nlapiLoadRecord('customrecord_service_leg', leg_id);
            leg_record.setFieldValue('isinactive', 'T');
            nlapiSubmitRecord(leg_record);
        }

        nlapiLogExecution('DEBUG', 'freq_id', freq_id);
        var freq_record = nlapiLoadRecord('customrecord_service_freq', freq_id);
        freq_record.setFieldValue('isinactive', 'T');
        nlapiSubmitRecord(freq_record);

        old_leg_id = leg_id;
        count++;
        return true;
    });
}