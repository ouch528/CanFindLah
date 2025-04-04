import admin from "firebase-admin";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";

admin.initializeApp();

export const sendWelcomeEmail = onDocumentUpdated('Lost Item/{lost_item_id}', async (event) => {
  // Get the before and after snapshots of the document
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  // Check if claimed_status changed from "Not Found Yet" to "Matched"
  if (beforeData.claimed_status === 'Not Found Yet' && afterData.claimed_status === 'Matched') {
    // Retrieve userId from the Lost Item document (ensure this field exists)
    const userId = afterData.userId;
    if (!userId) {
      console.log('No userId found in Lost Item document.');
      return;
    }

    try {
      // Retrieve the user document from the "users" collection
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      if (!userDoc.exists) {
        console.log(`User document not found for userId: ${userId}`);
        return;
      }

      // Extract the email from the user document (assumes the field is named "email")
      const userEmail = userDoc.data().email;
      if (!userEmail) {
        console.log(`No email found for userId: ${userId}`);
        return;
      }

      // Add a mail document to the "mail" collection so that your email service can process it
      await admin.firestore().collection('mail').add({
        to: userEmail,
        message: {
          subject: "Your lost item has been matched!",
          html: "Congratulations, we have found you a match!",
        },
      });
      console.log(`Email queued for user: ${userEmail}`);
    } catch (error) {
      console.error('Error retrieving user or queuing email:', error);
    }
  }
});




// import * as admin from "firebase-admin";
// import * as functions from "firebase-functions";

// admin.initializeApp();

// export const sendWelcomeEmail = functions.firestore
//   .document('Lost Item/{lost_item_id}')
//   .onUpdate(async (change, context) => {
//     const before = change.before.data();
//     const after = change.after.data();

//     // Check if the status changed from 'Not Found Yet' to 'Matched'
//     if (before.claimed_status === 'Not Found Yet' && after.claimed_status === 'Matched') {
//       // Add an email message document to the "mail" collection
//       return admin.firestore()
//         .collection("mail")
//         .add({
//           to: after.userEmail, // Use the user's email from the document data
//           message: {
//             subject: "Welcome!",
//             html: "Congratulations, we have found you a match!"
//           },
//         });
//     }
//     return null;
//   });






















/**
 * Import function triggers from their respective submodules:
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
// const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
// const functions = require('firebase-functions'); // For config()
// const admin = require('firebase-admin');
// const nodemailer = require('nodemailer');

// admin.initializeApp();

// // Configure Gmail SMTP credentials from functions config.
// // Set these with:
// // firebase functions:config:set gmail.email="your_email@gmail.com" gmail.password="your_app_password"
// const gmailEmail = functions.config().gmail.email;
// const gmailPassword = functions.config().gmail.password;

// // Create a Nodemailer transporter using Gmail's SMTP
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: gmailEmail,
//     pass: gmailPassword,
//   },
// });

// exports.notifyUserOnMatch = onDocumentUpdated('Lost Item/{itemId}', async (event) => {
//   // Extract data from Firestore snapshots
//   const beforeData = event.data.before.data();
//   const afterData = event.data.after.data();

//   // Check if claimed_status changed from "Not Found Yet" to "Matched"
//   if (beforeData.claimed_status === 'Not Found Yet' && afterData.claimed_status === 'Matched') {
//     // Construct the email message
//     const mailOptions = {
//       from: gmailEmail,  // Sender address (must match the Gmail account)
//       to: afterData.userEmail,  // Recipient address; ensure your document has a valid email field
//       subject: 'Your lost item has been matched!',
//       text: `Good news! Your lost item (Category: ${afterData.category}, Color: ${afterData.colour}, Brand: ${afterData.brand}) has been matched with a found item. Please log in to your account for further details.`,
//       html: `<p>Good news! Your lost item (Category: ${afterData.category}, Color: ${afterData.colour}, Brand: ${afterData.brand}) has been matched with a found item. Please log in to your account for further details.</p>`
//     };

//     try {
//       const info = await transporter.sendMail(mailOptions);
//       console.log(`Email sent to ${afterData.userEmail} for item ${event.params.itemId}:`, info);
//     } catch (error) {
//       console.error('Error sending email:', error);
//     }
//   }
//   return null;
// });




// /**
//  * Import function triggers from their respective submodules:
//  *
//  * const {onCall} = require("firebase-functions/v2/https");
//  * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
//  *
//  * See a full list of supported triggers at https://firebase.google.com/docs/functions
//  */
// const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
// const functions = require('firebase-functions'); // still needed for config()
// const admin = require('firebase-admin');
// const postmark = require('postmark');

// admin.initializeApp();

// // Configure Postmark API key from functions config
// const postmarkClient = new postmark.ServerClient(functions.postmark.key);

// exports.notifyUserOnMatch = onDocumentUpdated('Lost Item/{itemId}', async (event) => {
//   // event.data holds the Firestore document snapshots
//   const before = event.data.before;
//   const after = event.data.after;

//   // Check if status changed from "Not Found Yet" to "Matched"
//   if (before.claimed_status === 'Not Found Yet' && after.claimed_status === 'Matched') {
//     // Construct your email message
//     const emailData = {
//       From: 'noreply@yourdomain.com', // Replace with your verified sender email
//       To: after.userEmail,            // Ensure the document includes the user's email
//       Subject: 'Your lost item has been matched!',
//       TextBody: `Good news! Your lost item (Category: ${after.category}, Color: ${after.colour}, Brand: ${after.brand}) has been matched with a found item. Please log in to your account for further details.`,
//       HtmlBody: `<p>Good news! Your lost item (Category: ${after.category}, Color: ${after.colour}, Brand: ${after.brand}) has been matched with a found item. Please log in to your account for further details.</p>`,
//       MessageStream: 'outbound' // Adjust if needed for your Postmark setup
//     };

//     try {
//       const result = await postmarkClient.sendEmail(emailData);
//       console.log(`Email sent to ${after.userEmail} for item ${event.params.itemId}`, result);
//     } catch (error) {
//       console.error('Error sending email:', error);
//     }
//   }

//   return null;
// });

