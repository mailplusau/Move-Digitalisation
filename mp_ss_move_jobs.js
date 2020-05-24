var ctx = nlapiGetContext();
var usageThreshold = 50;
var adhocInvDeploy = 'customdeploy1';
var prevInvDeploy = null;

function moveJobs() {
    var cust_id = ctx.getSetting('SCRIPT', 'custscript_cust_id_2');
    var new_cust_id = ctx.getSetting('SCRIPT', 'custscript_new_cust_id_2');

    nlapiLogExecution('DEBUG', 'cust_id', cust_id);
    nlapiLogExecution('DEBUG', 'new_cust_id', new_cust_id);
    
    var jobsSearch = nlapiLoadSearch('customrecord_job', 'customsearch_move_digit_jobs');
    var filterExpression = [
        ["custrecord_job_customer", "is", cust_id],
        "AND", ["custrecord_job_date_scheduled", "within", "thismonth"],
    ];
    jobsSearch.setFilterExpression(filterExpression);
    var jobsResult = jobsSearch.runSearch();

    var old_jobgroup_id;
    var job_count = 0;
    jobsResult.forEachResult(function(jobResult) {
        var job_id = jobResult.getValue('internalid');
        var jobgroup_id = jobResult.getValue("internalid", "CUSTRECORD_JOB_GROUP", null);
        var service = jobResult.getValue("custrecord_job_service");
        if (job_count == 0) {
            nlapiLogExecution('DEBUG','jobgroup_id', jobgroup_id);
            var jobgroup_record = nlapiLoadRecord('customrecord_jobgroup', jobgroup_id);
            jobgroup_record.setFieldValue('custrecord_jobgroup_customer', new_cust_id);
            jobgroup_record.setFieldValue('custrecord_jobgroup_service', service);
            nlapiSubmitRecord(jobgroup_record);
        } else if (old_jobgroup_id != jobgroup_id) {
            nlapiLogExecution('DEBUG','jobgroup_id', jobgroup_id);
            var jobgroup_record = nlapiLoadRecord('customrecord_jobgroup', jobgroup_id);
            jobgroup_record.setFieldValue('custrecord_jobgroup_customer', new_cust_id);
            jobgroup_record.setFieldValue('custrecord_jobgroup_service', service);
            nlapiSubmitRecord(jobgroup_record);
        }
        nlapiLogExecution('DEBUG','job_id', job_id);
        var job_record = nlapiLoadRecord('customrecord_job', job_id);
        job_record.setFieldValue('custrecord_job_customer', new_cust_id);
        job_record.setFieldValue('custrecord_job_service', service);
        nlapiSubmitRecord(job_record);

        old_jobgroup_id = jobgroup_id;
        job_count++;
        return true;
    });
}