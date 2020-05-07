var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

var context = nlapiGetContext();

var cust_id = nlapiGetFieldValue('custpage_customer_id');
var new_cust_id = nlapiGetFieldValue('custpage_new_customer_id');
var zee_id = nlapiGetFieldValue('custpage_zee_id');
var new_zee_id = nlapiGetFieldValue('custpage_new_zee_id');
var services_moved = nlapiGetFieldValue('custpage_services_moved');
var run = 0;

function pageInit() {
    run = $('#run option:selected').val();
    if (!isNullorEmpty(services_moved) && services_moved == 'T') {
        $('.moveServices').removeClass('btn-warning');
        $('.moveServices').addClass('btn-success');
        $('.moveServiceLegs').removeAttr('disabled');
        $('.inactivateLegs').removeAttr('disabled');
    }
}

function saveRecord() {
    return true;
}

function onclick_back() {
    var url = baseURL + "/app/common/entity/custjob.nl?id=" + cust_id;
    window.location.href = url;
}

$(document).on('change', '#run', function(e) {
    run = $('#run option:selected').val();
    nlapiSetFieldValue('custpage_run', run);
})

$(document).on('click', '.moveServiceLegs', function(e) {
    //CHANGE OF ENTITY PROCESS
    if (!isNullorEmpty(cust_id)) {
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

        var count = 0;
        var service_count = 0;

        var message = '';
        var next_service = false;
        legsResult.forEachResult(function(legResult) {
            var service_id = legResult.getValue("internalid", "CUSTRECORD_SERVICE_LEG_SERVICE", null);
            var service_cust_id = legResult.getValue("custrecord_service_customer", "CUSTRECORD_SERVICE_LEG_SERVICE", null);
            var leg_id = legResult.getValue("internalid");
            var freq_id = legResult.getValue("internalid", "CUSTRECORD_SERVICE_FREQ_STOP", null);

            console.log('old_service_id', old_service_id);
            console.log('service_id', service_id);

            if (count == 0) {
                if (service_cust_id != new_cust_id) {
                    console.log('SERVICE NOT MOVED', service_id);
                    message += '<p>Please move service ' + service_id + ' before scheduling it.</p>';
                    next_service = true;
                } else {
                    console.log('leg_id', leg_id);
                    var leg_record = nlapiLoadRecord('customrecord_service_leg', leg_id);
                    var leg_zee = leg_record.getFieldValue('custrecord_service_leg_franchisee');
                    leg_record.setFieldValue('custrecord_service_leg_customer', new_customer_id);
                    leg_record.setFieldValue('custrecord_service_leg_service', service_id);
                    leg_record.setFieldValue('custrecord_service_leg_franchisee', leg_zee); //for transfers, zee can be diff from cust zee
                    nlapiSubmitRecord(leg_record);
                    service_count++;
                }
            } else if (old_service_id != service_id || next_service == false) {
                if (service_cust_id != new_cust_id) {
                    console.log('SERVICE NOT MOVED', service_id);
                    message += '<p>Please move service ' + service_id + ' before scheduling it.</p>';
                    next_service = true;
                } else {
                    next_service = false;
                    if (old_leg_id != leg_id) {
                        console.log('leg_id', leg_id);
                        var leg_record = nlapiLoadRecord('customrecord_service_leg', leg_id);
                        var leg_zee = leg_record.getFieldValue('custrecord_service_leg_franchisee');
                        leg_record.setFieldValue('custrecord_service_leg_customer', new_customer_id);
                        leg_record.setFieldValue('custrecord_service_leg_service', service_id);
                        leg_record.setFieldValue('custrecord_service_leg_franchisee', leg_zee); //for transfers, zee can be diff from cust zee
                        nlapiSubmitRecord(leg_record);
                        if (old_service_id != service_id) {
                            service_count++;
                        }
                    }
                }
            }
            if (next_service == false) {
                console.log('freq_id', freq_id);
                var freq_record = nlapiLoadRecord('customrecord_service_freq', freq_id);
                var freq_zee = freq_record.getFieldValue('custrecord_service_leg_franchisee');
                freq_record.setFieldValue('custrecord_service_freq_customer', new_customer_id);
                freq_record.setFieldValue('custrecord_service_leg_franchisee', freq_zee); //for transfers
                nlapiSubmitRecord(freq_record);
            }


            old_service_id = service_id;
            old_leg_id = leg_id;
            count++;
            return true;
        });

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
        $('.serviceLegsMoved').val('' + service_count + ' service(s) have been scheduled');
        $('.serviceLegsMoved').removeClass('hide');

        if (message != '') {
            showAlert(message);
        } else {
            $('.moveAppJobs').removeAttr('disabled');
        }
    }

    //NEW ZEE PROCESS
    if (!isNullorEmpty(zee_id)) {
        console.log('run', run);
        if (run != 0) {
            nlapiSetFieldValue('custpage_action', 'move legs and frequencies');
            $('#submitter').trigger('click');
        } else {
            var message = '<p>Please select a run<p>';
            showAlert(message);
        }

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
});

$(document).on('click', '.moveServices', function(e) {
    nlapiSetFieldValue('custpage_action', 'move services');
    $('#submitter').trigger('click');


    /*    var start_time = Date.now();
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
            console.log('Remaining Usage', context.getRemainingUsage());
            var package = serviceResult.getValue('custrecord_service_package');
            var service = serviceResult.getValue("internalid");
            var customer = serviceResult.getValue("custrecord_service_customer");
            var cust_zee = serviceResult.getValue("partner", "CUSTRECORD_SERVICE_CUSTOMER", null);

            if (service_count == 0) {
                console.log('FIRST service');
                if (cust_zee != new_zee_id) {
                    console.log('CUSTOMER NOT MOVED', customer);
                    message += '<p>Please move customer ' + customer + ' before moving its services.</p>';
                    next_customer = true;
                } else {
                    if (!isNullorEmpty(package)) {
                        console.log('package', package);
                        var package_record = nlapiLoadRecord('customrecord_service_package', package);
                        package_record.setFieldValue('custrecord_service_package_franchisee', new_zee_id);
                        nlapiSubmitRecord(package_record);
                    }
                    console.log('service', service);
                    var service_record = nlapiLoadRecord('customrecord_service', service);
                    service_record.setFieldValue('custrecord_service_franchisee', new_zee_id);
                    service_record.setFieldValue('custrecord_service_package', package);
                    nlapiSubmitRecord(service_record);

                    service_count++;
                }
            } else if (old_customer == customer && next_customer == true) {
                //if the customer has not been moved, go to next customer
                console.log('CUSTOMER NOT MOVED', customer);
            } else {
                if (cust_zee != new_zee_id) {
                    console.log('CUSTOMER NOT MOVED', customer);
                    message += '<p>Please move customer ' + customer + ' before moving its services.</p>';
                    next_customer = true;
                } else {
                    next_customer = false;
                    if (!isNullorEmpty(package) && old_package != package) {
                        console.log('package', package);
                        var package_record = nlapiLoadRecord('customrecord_service_package', package);
                        package_record.setFieldValue('custrecord_service_package_franchisee', new_zee_id);
                        nlapiSubmitRecord(package_record);
                    }
                    console.log('service', service);
                    var service_record = nlapiLoadRecord('customrecord_service', service);
                    service_record.setFieldValue('custrecord_service_franchisee', new_zee_id);
                    service_record.setFieldValue('custrecord_service_package', package);
                    nlapiSubmitRecord(service_record);

                    service_count++;
                }

            }
            old_customer = customer;
            return true;

        })*/
    //console.log('service_count', service_count);
    /*    $(this).removeClass('btn-warning');
        if (service_count == 0) {
            $(this).addClass('btn-danger');
        } else {
            $(this).addClass('btn-success');
        }
        $('.servicesMoved').val('' + service_count + ' services have been moved');
        $('.servicesMoved').removeClass('hide');
        if (message != '') {
            showAlert(message);
        } else {
            $('.moveServiceLegs').removeAttr('disabled');
        }
        console.log('moving services time', Date.now() - start_time);*/
});

$(document).on('click', '.inactivateLegs', function(e) {
    nlapiSetFieldValue('custpage_action', 'inactivate legs and frequencies');
    $('#submitter').trigger('click');
})

//Show Alert message on top of the page with errors
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