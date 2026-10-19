/*
 * HEAVENSGATE NYC: receives the forms (designers.html, crew.html, ...).
 *
 * Every submission is added as a row to the Google Sheet this script lives in, on a tab named after
 * the form ("Designers", "Crew"; made the first time one arrives). No email is sent unless you put an
 * address in NOTIFY_EMAIL. Paste this whole file into the sheet's Apps Script editor and deploy it as a web app
 * (steps: README, "Receiving the forms"). The columns follow the question ids in js/data.js; if you
 * add a question later, its column appears by itself.
 *
 * First time: run `setup` once (it makes the four tabs with their columns, the photo folder, and asks for the
 * permissions it needs). Then deploy as a web app (README, "Receiving the forms").
 *
 * Photos (the models form) arrive as pictures: each is saved in a Drive folder (PHOTO_FOLDER, made the first
 * time) and its link goes in the sheet (and the pictures are attached to the email, if there is one). The
 * files stay private to you; share the folder with whoever does the casting.
 */
var NOTIFY_EMAIL = ''                       // an address to email every submission to; empty = no emails (the sheet is the inbox)
var DEFAULT_TAB = 'Submissions'             // the tab for anything that arrives without a form name
var PHOTO_FOLDER = 'HEAVENSGATE form photos' // the Drive folder the uploaded photos are saved in
var MAX_PHOTOS = 5                          // most pictures kept from one submission
var MAX_PHOTO_BYTES = 3 * 1024 * 1024       // largest picture kept (the site sends about 200 KB each)

// The tabs and their columns, in the order of the questions in js/data.js. Only the starting layout:
// a question added later gets its own column by itself, so this list never has to be kept up to date.
var TABS = {
  Designers: ['name', 'brand', 'email', 'instagram', 'portfolio', 'looks', 'about', 'confirm', 'show'],
  Crew: ['name', 'email', 'phone', 'instagram', 'role', 'quote', 'experience', 'portfolio', 'notes'],
  Volunteers: ['name', 'email', 'phone', 'instagram', 'role', 'experience', 'portfolio', 'notes'],
  Models: ['name', 'email', 'phone', 'instagram', 'height', 'measurements', 'sizes', 'photos_1', 'photos_2', 'photos_3', 'experience', 'representation', 'agency', 'work', 'portfolio'],
}
var WIDE_COLUMNS = ['about', 'work', 'notes', 'quote'] // the long answers get a wide, wrapped column

// Run this once from the editor (pick `setup` in the toolbar, then Run). Safe to run again: it only adds what
// is missing. It also asks Google for the permissions the script needs (sheet, email, Drive), so the
// first real submission does not have to.
function setup() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  Object.keys(TABS).forEach(function (tab, i) {
    var sheet = spreadsheet.getSheetByName(tab) || spreadsheet.insertSheet(tab, i)
    var headers = sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : ['Time']
    TABS[tab].forEach(function (key) {
      if (headers.indexOf(key) === -1) headers.push(key)
    })
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#f3f3f3')
    sheet.setFrozenRows(1)
    sheet.setColumnWidth(1, 150)
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm')
    headers.forEach(function (header, column) {
      if (column === 0) return
      var wide = WIDE_COLUMNS.indexOf(header) !== -1
      sheet.setColumnWidth(column + 1, wide ? 320 : 160)
      if (wide) sheet.getRange(2, column + 1, sheet.getMaxRows() - 1, 1).setWrap(true)
    })
  })
  // The sheet starts with an empty "Sheet1": drop it once the real tabs are there.
  var blank = spreadsheet.getSheetByName('Sheet1')
  if (blank && blank.getLastRow() === 0 && spreadsheet.getSheets().length > 1) spreadsheet.deleteSheet(blank)
  photoFolder_()
  MailApp.getRemainingDailyQuota()
  SpreadsheetApp.getUi().alert('Ready. Tabs: ' + Object.keys(TABS).join(', ') + '. Next: Deploy > New deployment > Web app.')
}

function doPost(e) {
  try {
    return receive_((e && e.parameter) || {})
  } catch (error) {
    console.error('Submission not saved: ' + error) // shows in the editor under Executions
    return ContentService.createTextOutput('error: ' + error)
  }
}

// Saves one submission: the row in its tab, the photos in Drive, and the email if NOTIFY_EMAIL is set.
function receive_(answers) {
  var tab = tabName_(answers.form)
  delete answers.form // the tab already says which form it is
  var photos = savePhotos_(answers) // before the sheet is locked: saving files is the slow part

  var lock = LockService.getScriptLock()
  lock.waitLock(20000) // two people sending at the same moment take turns
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    var sheet = spreadsheet.getSheetByName(tab) || spreadsheet.insertSheet(tab)

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
  if (!NOTIFY_EMAIL) return ContentService.createTextOutput('ok')
  try {
    var lines = Object.keys(answers).map(function (key) {
      return key + ': ' + answers[key]
    })
    var who = answers.name || answers.brand || 'someone'
    var message = {
      to: NOTIFY_EMAIL,
      subject: 'New ' + (tab === DEFAULT_TAB ? '' : tab.toLowerCase() + ' ') + 'submission: ' + String(who).replace(/[\r\n]+/g, ' ').slice(0, 80),
      body: lines.join('\n\n') + '\n\nAll submissions: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    }
    if (photos.length) message.attachments = photos
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(answers.email || '')) message.replyTo = answers.email
    MailApp.sendEmail(message)
  } catch (error) {
    console.error('Email not sent: ' + error)
  }

  return ContentService.createTextOutput('ok')
}

// Opening the web app address in a browser says it is running. Opening it with ?test=1 on the end saves one
// clearly marked test row in the Models tab, so you can check the whole thing without the website: it says
// what happened, or what went wrong.
function doGet(e) {
  if (e && e.parameter && e.parameter.test) {
    try {
      receive_({ form: 'models', name: 'TEST - delete this row', email: 'test@example.com', phone: '', instagram: '@test', height: 'test', measurements: 'test', sizes: 'test', experience: 'test' })
      return ContentService.createTextOutput('Test row added to the Models tab. You can delete it.')
    } catch (error) {
      return ContentService.createTextOutput('Test failed: ' + error)
    }
  }
  return ContentService.createTextOutput('The HEAVENSGATE NYC form receiver is running.')
}

// Pictures arrive as "data:image/jpeg;base64,...". Each is saved to Drive and replaced, in `answers`, by
// its link (so the sheet gets the link, not the picture). Returns the pictures, to attach to the email.
// A problem here never loses the submission: the answers are still saved, with a note in the photo's cell.
function savePhotos_(answers) {
  var blobs = []
  var folder = null
  var who = String(answers.name || 'applicant').replace(/[^A-Za-z0-9 \-]/g, '').slice(0, 40).trim() || 'applicant'
  Object.keys(answers).forEach(function (key) {
    var text = String(answers[key])
    if (text.indexOf('data:image/') !== 0) return
    try {
      var comma = text.indexOf(',')
      var type = text.slice(5, text.indexOf(';'))
      if (comma === -1 || ['image/jpeg', 'image/png', 'image/webp'].indexOf(type) === -1) throw new Error('not a picture')
      if (blobs.length >= MAX_PHOTOS) throw new Error('too many pictures')
      var bytes = Utilities.base64Decode(text.slice(comma + 1))
      if (bytes.length > MAX_PHOTO_BYTES) throw new Error('picture too large')
      var extension = type === 'image/jpeg' ? 'jpg' : type.slice(6)
      var blob = Utilities.newBlob(bytes, type, who + ' - ' + key + ' - ' + Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd HHmmss') + '.' + extension)
      folder = folder || photoFolder_()
      answers[key] = folder.createFile(blob).getUrl()
      blobs.push(blob)
    } catch (error) {
      console.error('Photo not saved (' + key + '): ' + error)
      answers[key] = '(photo not saved: ' + error.message + ')'
    }
  })
  return blobs
}

function photoFolder_() {
  var found = DriveApp.getFoldersByName(PHOTO_FOLDER)
  return found.hasNext() ? found.next() : DriveApp.createFolder(PHOTO_FOLDER)
}

// "designers" -> "Designers". Only letters, numbers, spaces, dashes: it becomes a tab name.
function tabName_(form) {
  var name = String(form || '').replace(/[^A-Za-z0-9 \-]/g, '').slice(0, 40).trim()
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : DEFAULT_TAB
}

// A cell that starts with = + - @ would be run as a formula; the apostrophe makes it plain text.
function safe_(value) {
  var text = String(value === undefined ? '' : value).slice(0, 4000)
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text
}
