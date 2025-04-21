// === SETTINGS SHEET HELP === //
// Sheet: Settings (A2 = Group Email, B2 = Notification Email, C2 = Form URL)
function getSettings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  const values = sheet.getRange("A2:C2").getValues()[0];
  return {
    groupEmail: values[0],
    notifyEmail: values[1],
    formUrl: values[2]
  };
}

// === UTILITY FUNCTIONS === //
function datesMatch(date1, date2) {
  return date1.getTime() === date2.getTime();
}

function logToSheetDetailed(action, email, status, notes) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = ss.getSheetByName("Action Log");

  if (!logSheet) {
    logSheet = ss.insertSheet("Action Log");
    logSheet.appendRow(["Timestamp", "Action", "Email", "Group", "Status", "Notes"]);
  }

  const timestamp = new Date();
  const group = getSettings().groupEmail;
  logSheet.appendRow([timestamp, action, email, group, status, notes]);
}

function emailRequester(recipient, subject, body) {
  if (recipient) {
    try {
      MailApp.sendEmail(recipient, subject, body);
    } catch (emailErr) {
      Logger.log("⚠️ Failed to email requester: " + emailErr.message);
    }
  }
}

// === DAILY GROUP MANAGEMENT FUNCTION === //
function manageModifiedAccessGroup() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
  const data = sheet.getDataRange().getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { groupEmail, notifyEmail, formUrl } = getSettings();
  const statusCol = 9; // I
  const notesCol = 10; // J

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const studentEmail = row[2];
    const requesterEmail = row[7];
    const startDate = new Date(row[4]);
    const endDate = new Date(row[5]);

    const statusCell = sheet.getRange(i + 1, statusCol);
    const notesCell = sheet.getRange(i + 1, notesCol);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    try {
      if (datesMatch(today, startDate)) {
        try {
          AdminDirectory.Members.insert({ email: studentEmail, role: "MEMBER" }, groupEmail);
          statusCell.setValue("Added to group");
          notesCell.setValue("✅ Added successfully");

          const msg = `✅ ${studentEmail} was added to ${groupEmail} on ${today.toDateString()}`;
          MailApp.sendEmail(notifyEmail, "Student Added to Group", msg);

          emailRequester(requesterEmail,
            "Access Granted: Student Added to Group",
            `Hi there,\n\nYour student (${studentEmail}) has been added to the group: ${groupEmail}.\n\nThanks!`);

          logToSheetDetailed("Add", studentEmail, "Success", "Added on schedule");
        } catch (e) {
          statusCell.setValue("Already in group");
          notesCell.setValue(`⚠️ Already in group or error: ${e.message}`);
          logToSheetDetailed("Add", studentEmail, "Already in group", e.message);
        }

      } else if (datesMatch(today, endDate)) {
        AdminDirectory.Members.remove(groupEmail, studentEmail);
        statusCell.setValue("Removed from group");
        notesCell.setValue("❌ Removed successfully");

        const msg = `❌ ${studentEmail} was removed from ${groupEmail} on ${today.toDateString()}`;
        MailApp.sendEmail(notifyEmail, "Student Removed from Group", msg);

        emailRequester(requesterEmail,
          "Access Ended: Student Removed from Group",
          `Hi there,\n\nYour student (${studentEmail}) has been removed from the group: ${groupEmail}.\n\nIf you need to re-request access, please fill out the form again:\n${formUrl}\n\nThanks!`);

        logToSheetDetailed("Remove", studentEmail, "Success", "Removed on schedule");
      } else {
        notesCell.setValue("No action today");
      }
    } catch (error) {
      statusCell.setValue("Error");
      notesCell.setValue("Error: " + error.message);
      logToSheetDetailed("Error", studentEmail, "Failure", error.message);
    }
  }
}

// === FORM SUBMISSION HANDLER === //
function onFormSubmit(e) {
  const { groupEmail, notifyEmail, formUrl } = getSettings();

  try {
    Logger.log("Form submitted!");
    Logger.log(JSON.stringify(e));

    const submittedEmail = e.values[2];  // Student Email
    const startDate = new Date(e.values[4]);
    const endDate = new Date(e.values[5]);
    const requesterEmail = e.values[7];  // Requester Email

    const today = new Date();
    today.setHours(0,0,0,0);
    startDate.setHours(0,0,0,0);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
    const lastRow = sheet.getLastRow();
    const statusCell = sheet.getRange(lastRow, 9); // Column I
    const notesCell = sheet.getRange(lastRow, 10); // Column J

    let action = "", status = "", notes = "";

    if (startDate.getTime() === today.getTime()) {
      try {
        AdminDirectory.Members.insert({
          email: submittedEmail,
          role: "MEMBER"
        }, groupEmail);

        action = "Add";
        status = "Success";
        notes = "✅ Added immediately on submission";

        statusCell.setValue("Added to group");
        notesCell.setValue(notes);

        emailRequester(requesterEmail,
          "Access Granted: Student Added to Group",
          `Hi there,\n\nYour student (${submittedEmail}) has been added to the group: ${groupEmail}.\n\nThanks!`);

      } catch (err) {
        action = "Add";
        status = "Error";
        notes = `⚠️ ${err.message}`;
        statusCell.setValue("Error");
        notesCell.setValue(notes);
      }
    } else {
      action = "Add";
      status = "Pending";
      notes = `Scheduled for ${startDate.toDateString()}`;
      notesCell.setValue("No action today");
    }

    const msg = `📥 New Form Submission\n\nAction: ${action}\nEmail: ${submittedEmail}\nStatus: ${status}\nNotes: ${notes}\nStart: ${e.values[4]}\nEnd: ${e.values[5]}`;
    MailApp.sendEmail(notifyEmail, "New Form Submission (Modified Access)", msg);

    try {
      logToSheetDetailed(action, submittedEmail, status, notes);
    } catch (logErr) {
      Logger.log("⚠️ Failed to log to sheet: " + logErr.message);
    }
  } catch (mainErr) {
    Logger.log("❌ onFormSubmit error: " + mainErr.message);
  }
}
