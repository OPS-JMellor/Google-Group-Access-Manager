# 🛂 Google Group Access Manager

Automate the temporary assignment of users to a Google Group based on start and end dates submitted through a Google Form.

Perfect for K-12 districts, this Apps Script + Google Sheet setup helps manage:
- Student access to services (like Securly, GoGuardian, content filters)
- Temporary permissions for devices, printers, Wi-Fi, etc.
- Flexible, scheduled group membership with zero manual cleanup

---

## 🧩 What It Does

- ✅ Adds users to a specified Google Group on their **Start Date**
- ✅ Removes them from the group on their **End Date**
- 📬 Sends email confirmations to the **form submitter** and a central **admin/tech contact**
- 📊 Tracks changes and errors in a built-in **Action Log** sheet
- 🕓 Runs daily and on form submission

---

## 📋 Sheet Layout

### `Form Responses 1` tab (auto-filled by the form)

| Timestamp | Student Name | Student Email | School | Start Date | End Date | Email Address(Hidden Column) | Requester Email | Status | Notes |
|-----------|--------------|---------------|--------|------------|----------|----------------|------------------|--------|-------|

- **Requester Email** = who submitted the form (will get confirmation emails)
- **Student Email** = who is being added/removed to the group
- **Status/Notes** = auto-filled by the script

---

### `Settings` tab

| Group Email                      | Notification Email           | Form URL                        |
|----------------------------------|-------------------------------|----------------------------------|
| `modified-access@yourdomain.com` | `techteam@yourdomain.com`     | `https://forms.gle/your-form-id` |

- **Group Email**: Where users are added/removed
- **Notification Email**: Who gets admin log updates
- **Form URL**: Included in removal emails to make resubmitting easy

---

## ⚙️ Setup Instructions

### 1. 📄 Make a copy of the [template sheet]([#](https://docs.google.com/spreadsheets/d/1Jm1XLEFLJi2gJA-Nc7J93kX6IV77oBP9-ioxyMaFkLc/edit?usp=sharing))

### 2. 🔧 Open the Apps Script Editor (already included!)

The template sheet already includes the full working script.

To view or edit it:
- Go to `Extensions → Apps Script`

If you're making your own copy from scratch, you'll need to paste in `Code.gs` manually. Otherwise, you're ready to go!

### 3. 🕹 Set Up Triggers
Go to the Apps Script Trigger Panel:

| Function                    | Event Source       | Event Type         |
|-----------------------------|--------------------|---------------------|
| `onFormSubmit`              | From spreadsheet   | On form submit      |
| `manageModifiedAccessGroup`| Time-driven        | Day timer (e.g., 8am)|

### 4. 🧪 Enable APIs
- Go to **Services (🧩 icon)** in Apps Script
- Add **Admin SDK**
- Ensure you’re authorized as a super admin with permission to manage groups

---

## 📬 Email Behavior

| Trigger         | Sends To              | Description                      |
|-----------------|-----------------------|----------------------------------|
| On Form Submit  | Requester + Admin     | “Student will be added on date…” |
| On Start Date   | Requester + Admin     | “Student added to group”         |
| On End Date     | Requester + Admin     | “Student removed from group” + resubmit link

---

## ✅ Use Cases

- Schedule temporary Google Group access
- Handle manual overrides for content filters
- Automate rolling on/off privileges without extra systems

---

## 🧪 Example Walkthrough

1. Staff member fills out form:
   > “Give student25@ access to Modified Access from April 21 to April 28”

2. On April 21:
   - Student is auto-added to the group
   - Requester and tech team get emails

3. On April 28:
   - Student is removed from the group
   - Requester is notified + given a link to re-submit

---

## 📦 Want to Contribute?

Feel free to fork this repo and submit pull requests! Suggestions welcome for:
- Multi-group support
- Admin override panels
- Slack integration or alerts

---

## 📜 License

[MIT License](LICENSE) – free to use, share, and modify.

---

💡 Created by Joel Mellor - Orono Schools to save time and sanity for K-12 tech admins everywhere.
