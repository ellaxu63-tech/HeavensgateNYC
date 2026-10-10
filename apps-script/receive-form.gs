/*
 * HEAVENSGATE NYC: receives the application form (apply.html).
 *
 * Every submission is added as a row to the Google Sheet this script lives in,
 * and a copy is emailed to NOTIFY_EMAIL. Paste this whole file into the sheet's
 * Apps Script editor and deploy it as a web app (steps: README, "Receiving the
 * form"). The columns follow the question ids in js/data.js; if you add a
 * question later, its column appears by itself.
 */
var NOTIFY_EMAIL = 'info@heavensgateny.com' // who gets the email for each submission
var SHEET_NAME = 'Applications'             // the tab the rows go into (made if missing)

function doPost(e) {
  var answers = (e && e.parameter) || {}
  var lock = LockService.getScriptLock()
  lock.waitLock(20000) // two people sending at the same moment take turns
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    var sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME)

    var headers = sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : ['Time']
    Object.keys(answers).forEach(function (key) {
      if (headers.indexOf(key) === -1) headers.push(key)
    })
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold')
    sheet.setFrozenRows(1)

    var row = headers.map(function (header) {
      return header === 'Time' ? new Date() : safe_(answers[header])
    })
    sheet.appendRow(row)
  } finally {
    lock.releaseLock()
  }

  // The row is saved first; a problem with the email never loses a submission.
  try {
    var lines = Object.keys(answers).map(function (key) {
      return key + ': ' + answers[key]
    })
    var message = {
      to: NOTIFY_EMAIL,
      subject: 'New submission: ' + String(answers.name || 'someone').replace(/[\r\n]+/g, ' ').slice(0, 80),
      body: lines.join('\n\n') + '\n\nAll submissions: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(answers.email || '')) message.replyTo = answers.email
    MailApp.sendEmail(message)
  } catch (error) {
    console.error('Email not sent: ' + error)
  }

  return ContentService.createTextOutput('ok')
}

// Opening the web app address in a browser just says it is running.
function doGet() {
  return ContentService.createTextOutput('The HEAVENSGATE NYC form receiver is running.')
}

// A cell that starts with = + - @ would be run as a formula; the apostrophe makes it plain text.
function safe_(value) {
  var text = String(value === undefined ? '' : value).slice(0, 4000)
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text
}
