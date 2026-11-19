/**
 * Medical Solutions applicant form endpoint.
 *
 * Setup is in /workspace/jobsite/README.md (copy this file into a Apps Script
 * project, deploy as a web app, paste the URL into js/apply.js).
 *
 * The site posts a JSON body as text/plain (to avoid a CORS preflight).
 * This script appends a row to the Applicants tab and emails chrysmedsol@gmail.com.
 */
var SPREADSHEET_ID = '1YJuw2hlfeCiv5vP4F14PnaohVPR-6GGJtd8-PAgE5hw';
var APPLICANTS_TAB = 'Applicants';
var NOTIFY_EMAIL = 'chrysmedsol@gmail.com';

function doPost(e) {
  var result = { ok: false };
  try {
    var data = parseBody_(e);
    var name = trim_(data.name || data.full_name);
    var phone = trim_(data.phone);
    var email = trim_(data.email);
    if (!name || !phone || !email) {
      throw new Error('Name, phone, and email are required.');
    }
    if (!hasConsent_(data.consent)) {
      throw new Error('Consent to be contacted is required.');
    }

    var applied = new Date();
    var source = trim_(data.src || data.source || data.source_board) || 'Website';
    var rowMap = {
      'Date Applied': applied,
      'Name': name,
      'Phone': phone,
      'Email': email,
      'Discipline': trim_(data.discipline),
      'Specialty / Modality': trim_(data.specialty),
      'Licenses / Certs': trim_(data.license_state || data.licenses),
      'Current Location': trim_(data.current_location),
      'Job Applied To': trim_(data.job_title || data.jobAppliedTo),
      'Job ID': trim_(data.job_id || data.job_reference),
      'Source Board': source,
      'Status': 'New',
      'Last Contact': '',
      'Notes': 'Consented to texts/calls from the apply form.'
    };

    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(APPLICANTS_TAB);
    if (!sheet) {
      throw new Error('Applicants tab was not found.');
    }
    var lastCol = Math.max(sheet.getLastColumn(), 1);
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    if (!headers.length || !headers[0]) {
      throw new Error('Applicants header row is missing.');
    }
    var row = headers.map(function (header) {
      return Object.prototype.hasOwnProperty.call(rowMap, header) ? rowMap[header] : '';
    });
    sheet.appendRow(row);

    var subject = 'New applicant: ' + name;
    var jobTitle = trim_(data.job_title);
    if (jobTitle) subject += ' — ' + jobTitle;
    var body = [
      'A new application was submitted on the job site.',
      '',
      'Date: ' + applied.toString(),
      'Name: ' + name,
      'Phone: ' + phone,
      'Email: ' + email,
      'Discipline: ' + trim_(data.discipline),
      'License state: ' + trim_(data.license_state || data.licenses),
      'Job: ' + jobTitle,
      'Job ID: ' + trim_(data.job_id || data.job_reference),
      'Source Board: ' + source
    ].join('\n');
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

    result = { ok: true };
  } catch (err) {
    result = { ok: false, error: String(err && err.message ? err.message : err) };
  }
  return jsonOutput_(result);
}

function doGet() {
  return jsonOutput_({ ok: true, service: 'applicants' });
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Empty request body.');
  }
  return JSON.parse(e.postData.contents);
}

function hasConsent_(value) {
  return value === true || value === 'true' || value === 'yes' || value === 'on';
}

function trim_(value) {
  return String(value == null ? '' : value).trim();
}

function jsonOutput_(obj) {
  // text/plain keeps the browser request "simple" when paired with a text/plain POST.
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.TEXT);
}
