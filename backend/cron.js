require("dotenv").config();
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database.sqlite");

// Connect to DB
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Error opening database " + err.message);
});

// Configure Ethereal Email for testing
let transporter;

async function setupTransporter() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("Nodemailer transporter ready. Using Ethereal E-mail.");
  } catch (error) {
    console.error("Error creating ethereal account", error);
  }
}

setupTransporter();

function sendEmailReminder(user, reminder, daysLeft) {
  if (!transporter) return;

  let dueMessage;
  let subjectText = "Bill Reminder – Upcoming Payment";
  
  if (daysLeft === -1) {
    dueMessage = "was due YESTERDAY";
    subjectText = `[OVERDUE] Bill Reminder – Payment Overdue!`;
  } else if (daysLeft === 0) {
    dueMessage = "is due TODAY";
    subjectText = `[ACTION REQUIRED] Bill Reminder – Payment Due Today!`;
  } else {
    dueMessage = `is due in ${daysLeft} day(s)`;
  }

  const mailOptions = {
    from: '"Smart Bill Tracker" <noreply@smartbilltracker.com>',
    to: user.email,
    subject: subjectText,
    text: `Hello ${user.name},\n\n` +
          `This is a reminder that your ${reminder.title} payment of ₹${reminder.amount} ${dueMessage} (${reminder.dueDate}).\n` +
          `Please make sure to pay it as soon as possible to avoid penalties.\n\n` +
          `Thank you for using Smart Bill Tracker.`,
    html: `<p>Hello <strong>${user.name}</strong>,</p>
           <p>This is a reminder that your <strong>${reminder.title}</strong> payment of ₹${reminder.amount} <strong>${dueMessage}</strong> (${reminder.dueDate}).</p>
           <p>Please make sure to pay it as soon as possible to avoid penalties.</p>
           <br/>
           <p>Thank you for using Smart Bill Tracker.</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log(`Email sent to ${user.email} for reminder ${reminder.title}`);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  });
}

// Helper to calculate days diff
function getDaysDifference(targetDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(targetDateStr);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
}

// Run cron job every day at 00:00 (Midnight)
// For testing, we can use "* * * * *" to run every minute and comment it out later.
cron.schedule("0 0 * * *", () => {
  console.log("Running daily email reminder checks...");

  db.all(`
    SELECT r.*, u.name, u.email, u.email_reminders_enabled 
    FROM reminders r
    JOIN users u ON r.user_id = u.id
    WHERE r.status != 'completed' AND u.email_reminders_enabled = 1
  `, [], (err, rows) => {
    if (err) {
      console.error("Error fetching reminders", err);
      return;
    }

    rows.forEach(row => {
      const daysDiff = getDaysDifference(row.dueDate);

      if (daysDiff === 7 || daysDiff === 1 || daysDiff === 0 || daysDiff === -1) {
        const user = { name: row.name, email: row.email };
        sendEmailReminder(user, row, daysDiff);
      }
    });
  });
});

console.log("Background email scheduler started...");
