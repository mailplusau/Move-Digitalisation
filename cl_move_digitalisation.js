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
var serviceLegs_moved = nlapiGetFieldValue('custpage_servicelegs_moved');
var serviceLegs_inactivated = nlapiGetFieldValue('custpage_servicelegs_inactivated');
var jobs_moved = nlapiGetFieldValue('custpage_jobs_moved');
var run = 0;

var servicesLength = parseInt(nlapiGetFieldValue('custpage_services_length'));
var legsLength = parseInt(nlapiGetFieldValue('custpage_legs_length'));
var jobsLength = parseInt(nlapiGetFieldValue('custpage_jobs_length'));

var progressBar;

function pageInit() {
    $('#tbl_submitter').addClass('hide');
    if (!isNullorEmpty(zee_id)) {
        run = $('#run option:selected').val();
        if (servicesLength == 0) {
            $('.radio_section').removeClass('hide');
        }
        if (!isNullorEmpty(serviceLegs_moved) && serviceLegs_moved == 'T') {
            $('.radio_section').removeClass('hide');
            $('.old_to_new_section').removeClass('hide');
            $('.territory_buying_section').addClass('hide');
            $('#old_to_new').attr('checked', true);
            $('#old_to_new').attr('disabled', true);
            $('#territory_buying').attr('disabled', true);
        } else if (!isNullorEmpty(serviceLegs_inactivated) && serviceLegs_inactivated == 'T') {
            $('.radio_section').removeClass('hide');
            $('.old_to_new_section').addClass('hide');
            $('.territory_buying_section').removeClass('hide');
            $('#territory_buying').attr('checked', true);
            $('#old_to_new').attr('disabled', true);
            $('#territory_buying').attr('disabled', true);
        }
    }

    if (!isNullorEmpty(services_moved) && servicesLength != 0) {
        progressBar = setInterval(updateProgressBar, 5000, 'services');
    } else if (!isNullorEmpty(serviceLegs_moved) && legsLength != 0) {
        progressBar = setInterval(updateProgressBar, 5000, 'legs_and_frequencies');
    } else if (!isNullorEmpty(serviceLegs_inactivated) && legsLength != 0) {
        progressBar = setInterval(updateProgressBar, 5000, 'inactivate_legs_and_frequencies');
    } else if (!isNullorEmpty(jobs_moved)) {
        console.log('jobs_moved not null');
        $('#progress-records-legs_and_frequencies').attr('class', 'progress-bar progress-bar-success');
        $('#progress-records-legs_and_frequencies').attr('aria-valuenow', legsLength);
        $('#progress-records-legs_and_frequencies').attr('style', 'width:100%');
        $('#progress-records-legs_and_frequencies').text('Records moved : ' + legsLength + ' / ' + legsLength);
        if (jobsLength != 0) {
            progressBar = setInterval(updateProgressBar, 5000, 'jobs');
        }
    }


}

function saveRecord() {
    return true;
}

function onclick_back() {
    if (!isNullorEmpty(cust_id)) {
        var url = baseURL + "/app/common/entity/custjob.nl?id=" + cust_id;
        window.location.href = url;
    } else if (!isNullorEmpty(zee_id)) {
        var url = baseURL + "/app/common/entity/partner.nl?id=" + zee_id;
        window.location.href = url;
    }
}

$(document).on('change', '#run', function(e) {
    run = $('#run option:selected').val();
    nlapiSetFieldValue('custpage_run', run);
})

$(document).on('click', '.moveServiceLegs', function(e) {
    //CHANGE OF ENTITY PROCESS
    if (!isNullorEmpty(cust_id)) {
        nlapiSetFieldValue('custpage_action', 'move legs and frequencies');
        $('#submitter').trigger('click');
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
    if (!isNullorEmpty(cust_id)) {
        nlapiSetFieldValue('custpage_action', 'move jobs');
        $('#submitter').trigger('click');
    }
});

$(document).on('click', '.moveServices', function(e) {
    nlapiSetFieldValue('custpage_action', 'move services');
    $('#submitter').trigger('click');
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

$(document).on('click', '#old_to_new', function(e) {
    $('.old_to_new_section').removeClass('hide');
    $('.territory_buying_section').addClass('hide');
})

$(document).on('click', '#territory_buying', function(e) {
    $('.territory_buying_section').removeClass('hide');
    $('.old_to_new_section').addClass('hide');
})

function updateProgressBar(type) {
    console.log("updateProgressBar is running", type);
    var nb_records_left_to_move = getResultSetLength(type, zee_id, cust_id);
    console.log('nb_records_left_to_move', nb_records_left_to_move);
    if (nb_records_left_to_move == 0) {
        clearInterval(progressBar);
        console.log('clear progress bar');
        $('#progress-records-' + type + '').attr('class', 'progress-bar progress-bar-success');
        if (type == 'services') {
            $('.radio_section').removeClass('hide');
        } else if (type == 'legs_and_frequencies') {
            if (!isNullorEmpty(zee_id)) {
                $('#tbl_submitter').removeClass('hide');
            } else if (!isNullorEmpty(cust_id)) {
                $('.moveAppJobs').removeAttr('disabled');
            }
        } else if (type == 'jobs') {
            $('#tbl_submitter').removeClass('hide');
        }
    } else {
        $('#progress-records-' + type + '').attr('class', 'progress-bar progress-bar-warning');
    }

    if (type == 'services') {
        var nb_records_total = servicesLength;
    } else if (type == 'legs_and_frequencies' || type == 'inactivate_legs_and_frequencies') {
        var nb_records_total = legsLength;
    } else if (type == 'jobs') {
        var nb_records_total = jobsLength;
    }

    var nb_records_moved = nb_records_total - nb_records_left_to_move;
    var width = parseInt((nb_records_moved / nb_records_total) * 100);

    $('#progress-records-' + type + '').attr('aria-valuenow', nb_records_moved);
    $('#progress-records-' + type + '').attr('style', 'width:' + width + '%');
    $('#progress-records-' + type + '').text('Records moved : ' + nb_records_moved + ' / ' + nb_records_total);
    console.log('end of progress bar');
}

function getResultSetLength(type, zee_id, cust_id) {
    if (type == 'services') {
        nlapiLogExecution('DEBUG', 'services');
        var search = nlapiLoadSearch('customrecord_service', 'customsearch_move_digit_services');
        var filterExpression = [
            ["custrecord_service_franchisee", "is", zee_id],
        ];
    } else if (type == 'legs_and_frequencies' || type == 'inactivate_legs_and_frequencies') {
        nlapiLogExecution('DEBUG', 'legs_and_frequencies');
        var search = nlapiLoadSearch('customrecord_service_leg', 'customsearch_move_digit_legs');
        if (!isNullorEmpty(zee_id)) {
            var filterExpression = [
                ["custrecord_service_leg_franchisee", "is", zee_id],
                "AND", ["isinactive", "is", 'F'],
            ];
        } else if (!isNullorEmpty(cust_id)) {
            var filterExpression = [
                ["custrecord_service_leg_customer", "is", cust_id],
                "AND", ["isinactive", "is", 'F'],
            ];
        }
    } else if (type == 'jobs') {
        nlapiLogExecution('DEBUG', 'jobs');
        var search = nlapiLoadSearch('customrecord_job', 'customsearch_move_digit_jobs');
        var filterExpression = [
            ["custrecord_job_customer", "is", cust_id],
            "AND", ["custrecord_job_date_scheduled", "within", "thismonth"],
        ];
    }
    search.setFilterExpression(filterExpression);
    var results = search.runSearch();
    var resultsSet = results.getResults(0, 1000);
    if (!isNullorEmpty(resultsSet)) {
        return parseInt(resultsSet.length)
    } else {
        return 0;
    }
}