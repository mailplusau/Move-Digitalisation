var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

var cust_id = nlapiGetFieldValue('custpage_customer_id');
var new_cust_id = nlapiGetFieldValue('custpage_new_customer_id');

function pageInit() {}

function saveRecord() {
    //check if the services have been moved
    return true;
}

function onclick_back() {
    var url = baseURL + "/app/common/entity/custjob.nl?id=" + cust_id;
    window.location.href = url;
}

$(document).on('click', '.moveServiceLegs', function(e) {
    var customer_record = nlapiLoadRecord('customer', cust_id);
    var new_customer_id = customer_record.getFieldValue('custentity_new_customer');
    var run_scheduled = customer_record.getFieldValue('custentity_run_scheduled');

    var legsSearch = nlapiLoadSearch('customrecord_service_leg', 'customsearch_move_digit_legs');
    var filterExpression = [
        ["custrecord_service_leg_customer", "is", cust_id],
    ];
    legsSearch.setFilterExpression(filterExpression);
    var legsResult = legsSearch.runSearch();

    var old_service_id;
    var old_leg_id;
    var old_service_cust_id;

    var leg_id_array = [];
    var freq_id_array = [];
    var count = 0;
    var service_count = 0;
    var message = '';
    legsResult.forEachResult(function(legResult) {
        var service_id = legResult.getValue("internalid", "CUSTRECORD_SERVICE_LEG_SERVICE", null);
        var service_cust_id = legResult.getValue("custrecord_service_customer", "CUSTRECORD_SERVICE_LEG_SERVICE", null);
        var leg_id = legResult.getValue("internalid");
        var freq_id = legResult.getValue("internalid", "CUSTRECORD_SERVICE_FREQ_STOP", null);

        console.log('old_service_id', old_service_id);
        console.log('service_id', service_id);
        if (count > 0) {
            if (old_leg_id != leg_id) {
                leg_id_array[leg_id_array.length] = old_leg_id;
            }
            if (old_service_id != service_id) {
                console.log('old_service_id', old_service_id);
                console.log('leg_id_array', leg_id_array);
                console.log('freq_id_array', freq_id_array);
                if (old_service_cust_id != new_cust_id) {
                    message += '<p>Please move service ' + old_service_id + ' before scheduling it.</p>';
                    console.log('message', message);
                } else {
                    for (i = 0; i < leg_id_array.length; i++) {
                        var leg_record = nlapiLoadRecord('customrecord_service_leg', leg_id_array[i]);
                        var leg_zee = leg_record.getFieldValue('custrecord_service_leg_franchisee');
                        leg_record.setFieldValue('custrecord_service_leg_customer', new_customer_id);
                        leg_record.setFieldValue('custrecord_service_leg_service', old_service_id);
                        leg_record.setFieldValue('custrecord_service_leg_franchisee', leg_zee); //for transfers, zee can be diff from cust zee
                        nlapiSubmitRecord(leg_record);
                    }
                    for (i = 0; i < freq_id_array.length; i++) {
                        var freq_record = nlapiLoadRecord('customrecord_service_freq', freq_id_array[i]);
                        var freq_zee = freq_record.getFieldValue('custrecord_service_leg_franchisee');
                        freq_record.setFieldValue('custrecord_service_freq_customer', new_customer_id);
                        freq_record.setFieldValue('custrecord_service_leg_franchisee', freq_zee); //for transfers
                        nlapiSubmitRecord(freq_record);
                    }
                    service_count++;
                }

                leg_id_array = [];
                freq_id_array = [];
            }

        }
        freq_id_array[freq_id_array.length] = freq_id;

        old_service_id = service_id;
        old_leg_id = leg_id;
        old_service_cust_id = service_cust_id;
        count++;
        return true
    })
    if (count > 0) {
        leg_id_array[leg_id_array.length] = old_leg_id;

        console.log('old_service_id', old_service_id);
        console.log('leg_id_array', leg_id_array);
        console.log('freq_id_array', freq_id_array);

        if (old_service_cust_id != new_cust_id) {
            message += '<p>Please move service ' + old_service_id + ' before scheduling it.</p>';
            console.log('message', message);
        } else {

            for (i = 0; i < leg_id_array.length; i++) {
                console.log('leg_id_array[i]', leg_id_array[i]);
                var leg_record = nlapiLoadRecord('customrecord_service_leg', leg_id_array[i]);
                var leg_zee = leg_record.getFieldValue('custrecord_service_leg_franchisee');
                leg_record.setFieldValue('custrecord_service_leg_customer', new_customer_id);
                leg_record.setFieldValue('custrecord_service_leg_service', old_service_id);
                leg_record.setFieldValue('custrecord_service_leg_franchisee', leg_zee); //for transfers, zee can be diff from cust zee
                nlapiSubmitRecord(leg_record);
            }
            for (i = 0; i < freq_id_array.length; i++) {
                console.log('freq_id_array[i]', freq_id_array[i]);
                var freq_record = nlapiLoadRecord('customrecord_service_freq', freq_id_array[i]);
                var freq_zee = freq_record.getFieldValue('custrecord_service_leg_franchisee');
                freq_record.setFieldValue('custrecord_service_freq_customer', new_customer_id);
                freq_record.setFieldValue('custrecord_service_leg_franchisee', freq_zee); //for transfers
                nlapiSubmitRecord(freq_record);
            }
            service_count++;
        }

    }

    if (!isNullorEmpty(new_customer_id)) {
        var new_customer_record = nlapiLoadRecord('customer', new_customer_id);
        new_customer_record.setFieldValue('custentity_run_scheduled', run_scheduled);
        nlapiSubmitRecord(new_customer_record);
    }
    $(this).removeClass('btn-warning');
    if (service_count == 0) {
        $(this).addClass('btn-danger');
    } else {
        $(this).addClass('btn-success');
    }
    $('.serviceLegsMoved').val('' + service_count + ' services have been scheduled');
    $('.serviceLegsMoved').removeClass('hide');

    if (message != '') {
        showAlert(message);
    } else {
        $('.moveAppJobs').removeAttr('disabled');
    }
})

$(document).on('click', '.moveAppJobs', function(e) {
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
            console.log('jobgroup_id', jobgroup_id);
            var jobgroup_record = nlapiLoadRecord('customrecord_jobgroup', jobgroup_id);
            jobgroup_record.setFieldValue('custrecord_jobgroup_customer', new_cust_id);
            jobgroup_record.setFieldValue('custrecord_jobgroup_service', service);
            nlapiSubmitRecord(jobgroup_record);
        } else if (old_jobgroup_id != jobgroup_id) {
            console.log('jobgroup_id', jobgroup_id);
            var jobgroup_record = nlapiLoadRecord('customrecord_jobgroup', jobgroup_id);
            jobgroup_record.setFieldValue('custrecord_jobgroup_customer', new_cust_id);
            jobgroup_record.setFieldValue('custrecord_jobgroup_service', service);
            nlapiSubmitRecord(jobgroup_record);
        }
        console.log('job_id', job_id);
        var job_record = nlapiLoadRecord('customrecord_job', job_id);
        job_record.setFieldValue('custrecord_job_customer', new_cust_id);
        job_record.setFieldValue('custrecord_job_service', service);
        nlapiSubmitRecord(job_record);

        old_jobgroup_id = jobgroup_id;
        job_count++;
        return true;
    });
    console.log('job_count', job_count);
    $(this).removeClass('btn-warning');
    if (job_count == 0) {
        $(this).addClass('btn-danger');
    } else {
        $(this).addClass('btn-success');
    }

    $('.appJobsMoved').val('' + job_count + ' jobs have been moved');
    $('.appJobsMoved').removeClass('hide');
})

//Show Aler message on top of the page with errors
function showAlert(message) {
    console.log(message)
    $('#alert').html('<button type="button" class="close">&times;</button>' + message);
    $('#alert').removeClass('hidden');
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;
    setTimeout(function() {
        $("#alert .close").trigger('click');
    }, 100000);
    // $(window).scrollTop($('#alert').offset().top);
}

//Close the Alert Box on click
$(document).on('click', '#alert .close', function(e) {
    $(this).parent().hide();
});