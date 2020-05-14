var baseURL = 'https://1048144.app.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
    baseURL = 'https://1048144-sb3.app.netsuite.com';
}

var ctx = nlapiGetContext();

function moveDigitalisation(request, response) {
    if (request.getMethod() == "GET") {
        var cust_id = request.getParameter('cust_id');
        var zee_id = request.getParameter('zee_id');
        var services_moved = request.getParameter('services_moved');
        var serviceLegs_moved = request.getParameter('serviceLegs_moved');
        var serviceLegs_inactivated = request.getParameter('serviceLegs_inactivated');
        var run = request.getParameter('run');
        var servicesLength = request.getParameter('servicesLength');
        var legsLength = request.getParameter('legsLength');

        var inlineQty = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script><script src="//code.jquery.com/jquery-1.11.0.min.js"></script><link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.16/css/jquery.dataTables.css"><script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.16/js/jquery.dataTables.js"></script><link href="//netdna.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" rel="stylesheet"><script src="//netdna.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script><link rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2060796&c=1048144&h=9ee6accfd476c9cae718&_xt=.css"/><script src="https://1048144.app.netsuite.com/core/media/media.nl?id=2060797&c=1048144&h=ef2cda20731d146b5e98&_xt=.js"></script><link type="text/css" rel="stylesheet" href="https://1048144.app.netsuite.com/core/media/media.nl?id=2090583&c=1048144&h=a0ef6ac4e28f91203dfe&_xt=.css"><style>.mandatory{color:red;}</style>';
        inlineQty += '<div class="container" style="padding-top: 3%;"><div id="alert" class="alert alert-danger fade in hidden"></div>';


        //CHANGE OF ENTITY PROCESS
        if (!isNullorEmpty(cust_id)) {
            var form = nlapiCreateForm('Move Digitalisation : Change of Entity');

            var cust_record = nlapiLoadRecord('customer', cust_id);
            var entity_id = cust_record.getFieldValue('entityid');
            var cust_name = cust_record.getFieldValue('companyname');
            var new_cust_id = cust_record.getFieldValue('custentity_new_customer');
            var new_cust_name = cust_record.getFieldText('custentity_new_customer');

            inlineQty += '<div class="form-group container">'
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-sm-6"><div class="input-group"><span class="input-group-addon" style="font-weight:bold;">MOVE DIGITALISATION FROM</span>';
            inlineQty += '<input class="form-control" type="text" value="' + entity_id + ' ' + cust_name + '" readonly/></div></div>';
            inlineQty += '<div class="col-sm-6"><div class="input-group"><span class="input-group-addon" style="font-weight:bold;">TO</span><input class="form-control" type="text" value="' + new_cust_name + '" readonly/></div></div>';
            inlineQty += '</div>';

            inlineQty += '</div>';

            inlineQty += '<div class="form-group container">'
            inlineQty += '<div class="row" style="margin-top:10px"><div class="col-sm-3"><input type="button" class="btn btn-primary moveServiceLegs" value="Move Service Legs and Frequencies" style="width:100%;"></div><div class="col-sm-4"><input type="text" class="form-control serviceLegsMoved hide" readonly/></div></div>';
            inlineQty += '<div class="row" style="margin-top:10px"><div class="col-sm-3"><input type="button" class="btn btn-primary moveAppJobs" value="Move App Jobs" style="width:100%;" disabled></div><div class="col-sm-4"><input type="text" class="form-control appJobsMoved hide" readonly/></div>';

            inlineQty += '</div>';
        }

        //NEW ZEE PROCESS
        if (!isNullorEmpty(zee_id)) {
            var form = nlapiCreateForm('Move Digitalisation : New Franchisee');

            var zee_record = nlapiLoadRecord('partner', zee_id);
            var zee_name = zee_record.getFieldValue('companyname');
            var new_zee_id = zee_record.getFieldValue('custentity_zeesold_new_zee');
            var new_zee_name = zee_record.getFieldText('custentity_zeesold_new_zee');

            if (isNullorEmpty(servicesLength)) {
                servicesLength = getResultSetLength('services', zee_id);
            }
            if (isNullorEmpty(legsLength)) {
                legsLength = getResultSetLength('legs_and_frequencies', zee_id);
            }

            inlineQty += '<div class="form-group container">'
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-sm-6"><div class="input-group"><span class="input-group-addon" style="font-weight:bold;">MOVE DIGITALISATION FROM</span>';
            inlineQty += '<input class="form-control" type="text" value="' + zee_name + '" readonly/></div></div>';
            inlineQty += '<div class="col-sm-6"><div class="input-group"><span class="input-group-addon" style="font-weight:bold;">TO</span><input class="form-control" type="text" value="' + new_zee_name + '" readonly/></div></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            inlineQty += '<div class="form-group container services_section">';
            inlineQty += '<div class="row" style="margin-top:10px"><div class="col-sm-4"><input type="button" class="btn btn-primary moveServices" value="MOVE SERVICES" style="width:100%;"></div>';
            /*inlineQty += '<div class="col-sm-6"><input type="text" class="form-control servicesMoved hide" id="servicesMoved" readonly/></div><div class="col-sm-2"><input type="button" id="updateServicesMoved" class="btn btn-info servicesMoved hide" value="UPDATE"style="width:100%"/></div></div>';*/
            inlineQty += '<div class="col-sm-8">';
            inlineQty += progressBar('services', servicesLength);
            inlineQty += '</div></div></div>';

            inlineQty += '<div class="form-group container radio_section hide" style="margin-top:50px">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-sm-2"></div>'
            inlineQty += '<div class="col-sm-4"><div class="input-group"><input type="text" readonly value="Old Zee --> New Zee" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="radio" id="old_to_new" class="old_to_new" name="radio"/></span></div></div>';
            inlineQty += '<div class="col-sm-4"><div class="input-group"><input type="text" readonly value="Territory buying" class="form-control input-group-addon"/> <span class="input-group-addon"><input type="radio"  id="territory_buying" class="territory_buying" name="radio"/></span></div></div>';
            inlineQty += '</div>';
            inlineQty += '</div>';

            inlineQty += '<div class="form-group container old_to_new_section hide">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-sm-12 heading1"><h4><span class="label label-default col-sm-12">SCENARIO 1 : OLD ZEE --> NEW ZEE</span></h4></div>';
            inlineQty += '</div>';

            inlineQty += '<div class="row" style="margin-top:10px">';
            inlineQty += '<div class="col-sm-4"><div class="input-group"><span class="input-group-addon" id="run_text">SELECT RUN</span><select id="run" class="form-control run"><option value="0"></option>';

            var runPlanSearch = nlapiLoadSearch('customrecord_run_plan', 'customsearch_app_run_plan_active');

            var newFilters_runPlan = new Array();
            newFilters_runPlan[newFilters_runPlan.length] = new nlobjSearchFilter('custrecord_run_franchisee', null, 'is', new_zee_id);

            runPlanSearch.addFilters(newFilters_runPlan);

            var resultSet_runPlan = runPlanSearch.runSearch();
            var run_selection_html = '';
            resultSet_runPlan.forEachResult(function(searchResult_runPlan) {
                if (searchResult_runPlan.getValue('internalid') == run) {
                    run_selection_html += '<option value="' + searchResult_runPlan.getValue('internalid') + '" selected>' + searchResult_runPlan.getValue('name') + '</option>'
                } else {
                    run_selection_html += '<option value="' + searchResult_runPlan.getValue('internalid') + '">' + searchResult_runPlan.getValue('name') + '</option>'
                }
                return true;
            });
            inlineQty += run_selection_html;
            inlineQty += '</select></div></div>';
            inlineQty += '</div>';

            inlineQty += '<div class="row" style="margin-top:10px"><div class="col-sm-4"><input type="button" class="btn btn-primary moveServiceLegs" value="MOVE SERVICE LEGS AND FREQUENCIES" style="width:100%;"></div>';
            inlineQty += '<div class="col-sm-8">';
            inlineQty += progressBar('legs_and_frequencies', legsLength);
            /*            inlineQty += '<div class="col-sm-6"><input type="text" class="form-control serviceLegsMoved hide" id="serviceLegsMoved" readonly/></div><div class="col-sm-2"><input type="button" id="updateServiceLegsMoved" class="btn btn-info serviceLegsMoved hide" value="UPDATE" style="width:100%"/></div></div>';*/

            inlineQty += '</div></div></div>';

            inlineQty += '<div class="form-group container territory_buying_section hide">';
            inlineQty += '<div class="row">';
            inlineQty += '<div class="col-sm-12 heading1"><h4><span class="label label-default col-sm-12">SCENARIO 2 : TERRITORY BUYING THE ZEE</span></h4></div>';
            inlineQty += '</div>';

            inlineQty += '<div class="row" style="margin-top:10px"><div class="col-sm-4"><input type="button" class="btn btn-primary inactivateLegs" value="INACTIVATE SERVICE LEGS AND FREQUENCIES" style="width:100%;"></div>';
            inlineQty += '<div class="col-sm-8">';
            inlineQty += progressBar('inactivate_legs_and_frequencies', legsLength);
            /*inlineQty += '<div class="col-sm-6"><input type="text" class="form-control serviceLegsInactivated hide" readonly/></div><div class="col-sm-2"><input type="button" id="updateServiceLegsMoved" class="btn btn-info serviceLegsInactivated hide" value="UPDATE"style="width:100%"/></div></div>';*/

            inlineQty += '</div></div></div>';

        }

        form.addField('preview_table', 'inlinehtml', '').setLayoutType('startrow').setDefaultValue(inlineQty);
        form.addField('custpage_customer_id', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(cust_id);
        form.addField('custpage_new_customer_id', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(new_cust_id);
        form.addField('custpage_zee_id', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(zee_id);
        form.addField('custpage_new_zee_id', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(new_zee_id);
        form.addField('custpage_action', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_services_moved', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(services_moved);
        form.addField('custpage_servicelegs_moved', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(serviceLegs_moved);
        form.addField('custpage_servicelegs_inactivated', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(serviceLegs_inactivated);
        form.addField('custpage_run', 'text', 'Customer ID').setDisplayType('hidden');
        form.addField('custpage_services_length', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(servicesLength);
        form.addField('custpage_legs_length', 'text', 'Customer ID').setDisplayType('hidden').setDefaultValue(legsLength);


        form.addSubmitButton('Move Digitalisation');
        form.addButton('back', 'Back', 'onclick_back()');
        form.setScript('customscript_cl_move_digitalisation');
        response.writePage(form);
    } else {
        nlapiLogExecution('DEBUG', 'FORM SENT');
        var action = request.getParameter('custpage_action');
        var zee_id = request.getParameter('custpage_zee_id');
        var new_zee_id = request.getParameter('custpage_new_zee_id');
        var run = request.getParameter('custpage_run');
        var servicesLength = request.getParameter('custpage_services_length');
        var legsLength = request.getParameter('custpage_legs_length');
        nlapiLogExecution('DEBUG', 'action', action);

        if (action == 'move services') {
            var params = {
                custscript_zee_id: zee_id,
                custscript_new_zee_id: new_zee_id,
            }
            var status = nlapiScheduleScript('customscript_ss_move_services', 'customdeploy1', params);
            nlapiLogExecution('DEBUG', 'status', status);
            var params_servicesProgress = {
                zee_id: zee_id,
                services_moved: 'T',
                servicesLength: parseInt(servicesLength),
                legsLength: parseInt(legsLength),
            }
            nlapiSetRedirectURL('SUITELET', 'customscript_sl_move_digitalisation', 'customdeploy_sl_move_digitalisation', null, params_servicesProgress);
        } else if (action == 'move legs and frequencies') {
            var params = {
                custscript_zee_id_2: zee_id,
                custscript_new_zee_id_2: new_zee_id,
                custscript_run: run,
            }
            var status = nlapiScheduleScript('customscript_ss_move_legs', 'customdeploy1', params);
            nlapiLogExecution('DEBUG', 'status', status);
            var params_legsProgress = {
                zee_id: zee_id,
                //services_moved: 'T',
                serviceLegs_moved: 'T',
                run: run,
                servicesLength: parseInt(servicesLength),
                legsLength: parseInt(legsLength),
            }
            nlapiSetRedirectURL('SUITELET', 'customscript_sl_move_digitalisation', 'customdeploy_sl_move_digitalisation', null, params_legsProgress);
        } else if (action == 'inactivate legs and frequencies') {
            var params = {
                custscript_zee_id_3: zee_id,
            }
            var status = nlapiScheduleScript('customscript_ss_inactivate_legs', 'customdeploy1', params);
            nlapiLogExecution('DEBUG', 'status', status);
            var params_legsProgress_inactivate = {
                zee_id: zee_id,
                //services_moved: 'T',
                serviceLegs_inactivated: 'T',
                servicesLength: parseInt(servicesLength),
                legsLength: parseInt(legsLength),
            }
            nlapiSetRedirectURL('SUITELET', 'customscript_sl_move_digitalisation', 'customdeploy_sl_move_digitalisation', null, params_legsProgress_inactivate);
        }
    }
}

function progressBar(type, nb_records_total) {
    var inlineQty = '<div class="progress progress_' + type + '">';
    if (nb_records_total > 0) {
        inlineQty += '<div class="progress-bar progress-bar-info" id="progress-records-' + type + '" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="' + nb_records_total + '" style="width:100%">' + nb_records_total + ' records to move</div>';
    } else if (nb_records_total == 0) {
        inlineQty += '<div class="progress-bar progress-bar-danger" id="progress-records-' + type + '" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="' + nb_records_total + '" style="width:100%">There are no records to move</div>';
    }
    inlineQty += '</div>';
    return inlineQty;
}

function getResultSetLength(type, zee_id) {
    if (type == 'services') {
        nlapiLogExecution('DEBUG', 'services');
        var search = nlapiLoadSearch('customrecord_service', 'customsearch_move_digit_services');
        var filterExpression = [
            ["custrecord_service_franchisee", "is", zee_id],
        ];
    } else if (type == 'legs_and_frequencies') {
        nlapiLogExecution('DEBUG', 'legs_and_frequencies');
        var search = nlapiLoadSearch('customrecord_service_leg', 'customsearch_move_digit_legs');
        var filterExpression = [
            ["custrecord_service_leg_franchisee", "is", zee_id],
        ];
    } else if (type == "inactivate_legs_and_frequencies") {
        nlapiLogExecution('DEBUG', 'inactivate_legs_and_frequencies');
        var search = nlapiLoadSearch('customrecord_service_leg', 'customsearch_move_digit_legs');
        var filterExpression = [
            ["custrecord_service_leg_franchisee", "is", zee_id],
            ["isinactive", "is", 'F'],
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