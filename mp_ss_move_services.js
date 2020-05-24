var ctx = nlapiGetContext();
var usageThreshold = 50;
var adhocInvDeploy = 'customdeploy1';
var prevInvDeploy = null;

function moveServices(){
    var zee_id = parseInt(ctx.getSetting('SCRIPT', 'custscript_zee_id'));
    var new_zee_id = parseInt(ctx.getSetting('SCRIPT', 'custscript_new_zee_id'));

    nlapiLogExecution('DEBUG','zee_id', zee_id);
    nlapiLogExecution('DEBUG','new_zee_id', new_zee_id);

    var servicesSearch = nlapiLoadSearch('customrecord_service', 'customsearch_move_digit_services');
    //Move Digitalisation : New Franchisee
    if (!isNullorEmpty(zee_id)) {
        var filterExpression = [
            ["custrecord_service_franchisee", "is", zee_id],
        ];
    }
    servicesSearch.setFilterExpression(filterExpression);
    var servicesResult = servicesSearch.runSearch();

    var old_package;
    var old_customer;
    var next_customer;
    var service_count = 0;
    var message = '';

    servicesResult.forEachResult(function(serviceResult) {
        nlapiLogExecution('DEBUG','Remaining Usage', ctx.getRemainingUsage());
        var package = serviceResult.getValue('custrecord_service_package');
        var service = serviceResult.getValue("internalid");
        var customer = serviceResult.getValue("custrecord_service_customer");
        var cust_zee = serviceResult.getValue("partner", "CUSTRECORD_SERVICE_CUSTOMER", null);

        if (service_count == 0) {
            nlapiLogExecution('DEBUG','FIRST service');
            if (cust_zee != new_zee_id) {
                nlapiLogExecution('DEBUG','CUSTOMER NOT MOVED', customer);
                message += '<p>Please move customer ' + customer + ' before moving its services.</p>';
                next_customer = true;
            } else {
                if (!isNullorEmpty(package)) {
                    nlapiLogExecution('DEBUG','package', package);
                    var package_record = nlapiLoadRecord('customrecord_service_package', package);
                    package_record.setFieldValue('custrecord_service_package_franchisee', new_zee_id);
                    nlapiSubmitRecord(package_record);
                }
                nlapiLogExecution('DEBUG','service', service);
                var service_record = nlapiLoadRecord('customrecord_service', service);
                service_record.setFieldValue('custrecord_service_franchisee', new_zee_id);
                service_record.setFieldValue('custrecord_service_package', package);
                nlapiSubmitRecord(service_record);

                service_count++;
            }
        } else if (old_customer == customer && next_customer == true) {
            //if the customer has not been moved, go to next customer
            nlapiLogExecution('DEBUG','CUSTOMER NOT MOVED', customer);
        } else {
            if (cust_zee != new_zee_id) {
                nlapiLogExecution('DEBUG','CUSTOMER NOT MOVED', customer);
                message += '<p>Please move customer ' + customer + ' before moving its services.</p>';
                next_customer = true;
            } else {
                next_customer = false;
                if (!isNullorEmpty(package) && old_package != package) {
                    nlapiLogExecution('DEBUG','package', package);
                    var package_record = nlapiLoadRecord('customrecord_service_package', package);
                    package_record.setFieldValue('custrecord_service_package_franchisee', new_zee_id);
                    nlapiSubmitRecord(package_record);
                }
                nlapiLogExecution('DEBUG','service', service);
                var service_record = nlapiLoadRecord('customrecord_service', service);
                service_record.setFieldValue('custrecord_service_franchisee', new_zee_id);
                service_record.setFieldValue('custrecord_service_package', package);
                nlapiSubmitRecord(service_record);

                service_count++;
            }

        }
        old_customer = customer;
        return true;

    })
    nlapiLogExecution('DEBUG', 'message', message);
}