var ctx = nlapiGetContext();
var usageThreshold = 50;
var adhocInvDeploy = 'customdeploy1';
var prevInvDeploy = null;

function moveLegs() {
    var zee_id = ctx.getSetting('SCRIPT', 'custscript_zee_id_2');
    var new_zee_id = ctx.getSetting('SCRIPT', 'custscript_new_zee_id_2');
    var run = ctx.getSetting('SCRIPT', 'custscript_run');
    var cust_id = ctx.getSetting('SCRIPT', 'custscript_cust_id');
    var new_cust_id = ctx.getSetting('SCRIPT', 'custscript_new_cust_id');
    nlapiLogExecution('DEBUG', 'zee_id', zee_id);
    nlapiLogExecution('DEBUG', 'new_zee_id', new_zee_id);
    nlapiLogExecution('DEBUG', 'run', run);
    nlapiLogExecution('DEBUG', 'cust_id', cust_id);
    nlapiLogExecution('DEBUG', 'new_cust_id', new_cust_id);

    var legsSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_move_digit_legs');
    if (!isNullorEmpty(zee_id)) {
        var filterExpression = [
            ["custrecord_service_leg_franchisee", "is", zee_id],
        ];
        legsSearch.setFilterExpression(filterExpression);
        var legsResult = legsSearch.runSearch();

        var old_leg_id;

        var count = 0;
        var service_count = 0;

        legsResult.forEachResult(function(legResult) {
            var service_id = legResult.getValue("internalid", "CUSTRECORD_SERVICE_LEG_SERVICE", null);
            //var service_cust_id = legResult.getValue("custrecord_service_customer", "CUSTRECORD_SERVICE_LEG_SERVICE", null);
            //var service_zee_id = legResult.getValue("custrecord_service_franchisee", "CUSTRECORD_SERVICE_LEG_SERVICE", null);
            var leg_id = legResult.getValue("internalid");
            var freq_id = legResult.getValue("internalid", "CUSTRECORD_SERVICE_FREQ_STOP", null);

            nlapiLogExecution('DEBUG', 'service_id', service_id);

            if (count == 0 && !isNullorEmpty(leg_id)) {
                nlapiLogExecution('DEBUG', 'leg_id', leg_id);
                var leg_record = nlapiLoadRecord('customrecord_service_leg', leg_id);
                leg_record.setFieldValue('custrecord_service_leg_franchisee', new_zee_id);
                nlapiSubmitRecord(leg_record);
            } else {
                if (!isNullorEmpty(leg_id) && old_leg_id != leg_id) {
                    nlapiLogExecution('DEBUG', 'leg_id', leg_id);
                    var leg_record = nlapiLoadRecord('customrecord_service_leg', leg_id);
                    leg_record.setFieldValue('custrecord_service_leg_franchisee', new_zee_id);
                    nlapiSubmitRecord(leg_record);
                }
            }

            nlapiLogExecution('DEBUG', 'freq_id', freq_id);
            if (!isNullorEmpty(freq_id)) {
                var freq_record = nlapiLoadRecord('customrecord_service_freq', freq_id);
                freq_record.setFieldValue('custrecord_service_freq_franchisee', new_zee_id);
                freq_record.setFieldValue('custrecord_service_freq_run_plan', run);
                nlapiSubmitRecord(freq_record);
            }
            old_leg_id = leg_id;
            count++;
            return true;
        });
    } else if (!isNullorEmpty(cust_id)) {
        var filterExpression = [
            ["custrecord_service_leg_customer", "is", cust_id],
        ];
        legsSearch.setFilterExpression(filterExpression);
        var legsResult = legsSearch.runSearch();

        var old_leg_id;

        var count = 0;
        var service_count = 0;

        legsResult.forEachResult(function(legResult) {
            var service_id = legResult.getValue("internalid", "CUSTRECORD_SERVICE_LEG_SERVICE", null);
            //var service_cust_id = legResult.getValue("custrecord_service_customer", "CUSTRECORD_SERVICE_LEG_SERVICE", null);
            //var service_zee_id = legResult.getValue("custrecord_service_franchisee", "CUSTRECORD_SERVICE_LEG_SERVICE", null);
            var leg_id = legResult.getValue("internalid");
            var freq_id = legResult.getValue("internalid", "CUSTRECORD_SERVICE_FREQ_STOP", null);

            nlapiLogExecution('DEBUG', 'service_id', service_id);

            if (count == 0 && !isNullorEmpty(leg_id)) {
                nlapiLogExecution('DEBUG', 'leg_id', leg_id);
                var leg_record = nlapiLoadRecord('customrecord_service_leg', leg_id);
                var leg_zee = leg_record.getFieldValue('custrecord_service_leg_franchisee');
                leg_record.setFieldValue('custrecord_service_leg_customer', new_cust_id);
                leg_record.setFieldValue('custrecord_service_leg_service', service_id);
                leg_record.setFieldValue('custrecord_service_leg_franchisee', leg_zee); //for transfers, zee can be diff from cust zee
                nlapiSubmitRecord(leg_record);
            } else {
                if (!isNullorEmpty(leg_id) && old_leg_id != leg_id) {
                    nlapiLogExecution('DEBUG', 'leg_id', leg_id);
                    var leg_record = nlapiLoadRecord('customrecord_service_leg', leg_id);
                    var leg_zee = leg_record.getFieldValue('custrecord_service_leg_franchisee');
                    leg_record.setFieldValue('custrecord_service_leg_customer', new_cust_id);
                    leg_record.setFieldValue('custrecord_service_leg_service', service_id);
                    leg_record.setFieldValue('custrecord_service_leg_franchisee', leg_zee); //for transfers, zee can be diff from cust zee
                    nlapiSubmitRecord(leg_record);
                }
            }

            nlapiLogExecution('DEBUG', 'freq_id', freq_id);
            if (!isNullorEmpty(freq_id)) {
                var freq_record = nlapiLoadRecord('customrecord_service_freq', freq_id);
                var freq_zee = freq_record.getFieldValue('custrecord_service_leg_franchisee');
                freq_record.setFieldValue('custrecord_service_freq_customer', new_cust_id);
                freq_record.setFieldValue('custrecord_service_leg_franchisee', freq_zee); //for transfers
                nlapiSubmitRecord(freq_record);
            }
            old_leg_id = leg_id;
            count++;
            return true;
        });

        //CHECK IF THE CUSTOMER IF FULLY SCHEDULED
        if (!isNullorEmpty(new_cust_id)) {
            var customerScheduled = true;
            var serviceSearch = nlapiLoadSearch('customrecord_service', 'customsearch_rp_services');

            var newFilters = new Array();
            newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_service_customer', null, 'is', new_cust_id);
            serviceSearch.addFilters(newFilters);
            var resultSetService = serviceSearch.runSearch();
            resultSetService.forEachResult(function(searchResult) {
                var scheduleRun = searchResult.getValue("custrecord_service_run_scheduled", null, "GROUP");
                if (scheduleRun == 2 || isNullorEmpty(scheduleRun)) {
                    customerScheduled = false;
                    return false;
                }
                return true;
            });
            nlapiLogExecution('DEBUG', 'customerScheduled', customerScheduled);
            var customer_record = nlapiLoadRecord('customer', customer_id);
            if (customerScheduled == true) {
                customer_record.setFieldValue('custentity_run_scheduled', 1);

            } else if (customerScheduled == false) {
                customer_record.setFieldValue('custentity_run_scheduled', 2);
            }
            nlapiSubmitRecord(customer_record);
        }
    }
}