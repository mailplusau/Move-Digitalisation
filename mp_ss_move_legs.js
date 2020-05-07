var ctx = nlapiGetContext();
var usageThreshold = 50;
var adhocInvDeploy = 'customdeploy1';
var prevInvDeploy = null;

function moveLegs() {
    var zee_id = parseInt(ctx.getSetting('SCRIPT', 'custscript_zee_id_2'));
    var new_zee_id = parseInt(ctx.getSetting('SCRIPT', 'custscript_new_zee_id_2'));
    var run = parseInt(ctx.getSetting('SCRIPT', 'custscript_run'));
    nlapiLogExecution('DEBUG', 'zee_id', zee_id);
    nlapiLogExecution('DEBUG', 'new_zee_id', new_zee_id);
    nlapiLogExecution('DEBUG', 'run', run);

    var legsSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_move_digit_legs');
    var filterExpression = [
        ["custrecord_service_leg_franchisee", "is", zee_id],
    ];
    legsSearch.setFilterExpression(filterExpression);
    var legsResult = legsSearch.runSearch();

    var old_service_id;
    var old_leg_id;

    var count = 0;
    var service_count = 0;

    var message = '';
    var next_service = false;
    legsResult.forEachResult(function(legResult) {
        var service_id = legResult.getValue("internalid", "CUSTRECORD_SERVICE_LEG_SERVICE", null);
        //var service_cust_id = legResult.getValue("custrecord_service_customer", "CUSTRECORD_SERVICE_LEG_SERVICE", null);
        var service_zee_id = legResult.getValue("custrecord_service_franchisee", "CUSTRECORD_SERVICE_LEG_SERVICE", null);
        var leg_id = legResult.getValue("internalid");
        var freq_id = legResult.getValue("internalid", "CUSTRECORD_SERVICE_FREQ_STOP", null);

        nlapiLogExecution('DEBUG', 'old_service_id', old_service_id);
        nlapiLogExecution('DEBUG', 'service_id', service_id);

        if (count == 0) {
            if (service_zee_id != new_zee_id) {
                nlapiLogExecution('DEBUG', 'SERVICE NOT MOVED', service_id);
                message += '<p>Please move service ' + service_id + ' before scheduling it.</p>';
                next_service = true;
            } else {
                nlapiLogExecution('DEBUG', 'leg_id', leg_id);
                var leg_record = nlapiLoadRecord('customrecord_service_leg', leg_id);
                leg_record.setFieldValue('custrecord_service_leg_franchisee', new_zee_id);
                nlapiSubmitRecord(leg_record);
                service_count++;
            }
        } else if (old_service_id != service_id || next_service == false) {
            if (service_zee_id != new_zee_id) {
                nlapiLogExecution('DEBUG', 'SERVICE NOT MOVED', service_id);
                message += '<p>Please move service ' + service_id + ' before scheduling it.</p>';
                next_service = true;
            } else {
                next_service = false;
                if (old_leg_id != leg_id) {
                    nlapiLogExecution('DEBUG', 'leg_id', leg_id);
                    var leg_record = nlapiLoadRecord('customrecord_service_leg', leg_id);
                    leg_record.setFieldValue('custrecord_service_leg_franchisee', new_zee_id);
                    nlapiSubmitRecord(leg_record);
                    if (old_service_id != service_id) {
                        service_count++;
                    }
                }
            }
        }
        if (next_service == false) {
            nlapiLogExecution('DEBUG', 'freq_id', freq_id);
            var freq_record = nlapiLoadRecord('customrecord_service_freq', freq_id);
            freq_record.setFieldValue('custrecord_service_freq_franchisee', new_zee_id);
            freq_record.setFieldValue('custrecord_service_freq_run_plan', run);
            nlapiSubmitRecord(freq_record);
        }


        old_service_id = service_id;
        old_leg_id = leg_id;
        count++;
        return true;
    });
}