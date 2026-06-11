/**
 * GreenDome Travel & Tours — Google Sheets Form Handler
 *
 * SETUP:
 * 1. Open your Google Sheet → Extensions → Apps Script
 * 2. Paste this entire file (replace existing Code.gs)
 * 3. Run testAppendRow() once to verify the sheet connection (NOT doPost)
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL into js/main.js → GOOGLE_SHEET_URL
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ result: "error", message: "No POST data received" });
    }

    var data = JSON.parse(e.postData.contents);
    appendFormRow(data);

    return jsonResponse({ result: "success" });
  } catch (err) {
    return jsonResponse({ result: "error", message: String(err) });
  }
}

function doGet() {
  return jsonResponse({ result: "ok", message: "GreenDome form endpoint is live" });
}

function appendFormRow(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  sheet.appendRow([
    new Date(),
    data.formType || "",
    data.fullName || "",
    data.phone || "",
    data.email || "",
    data.travelers || "",
    data.interest || "",
    data.message || ""
  ]);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run THIS function from the editor to test (Run ▶ button).
 * doPost cannot be run manually — it needs a real HTTP POST from the website.
 */
function testAppendRow() {
  appendFormRow({
    formType: "Test Inquiry",
    fullName: "Test User",
    phone: "+92 331 7259177",
    email: "test@example.com",
    travelers: 2,
    interest: "Muharram Umrah 2026 - Quad Sharing",
    message: "This is a test row from Apps Script editor"
  });

  Logger.log("Test row appended successfully. Check your Google Sheet.");
}
