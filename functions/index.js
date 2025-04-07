import admin from "firebase-admin";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions"; // optional for structured logs

admin.initializeApp();

export const sendWelcomeEmail = onDocumentUpdated('Lost Item/{lost_item_id}', async (event) => {
  // Get the before and after snapshots of the document
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  // Check if claimed_status changed from "Not Found Yet" to "Matched"
  if (beforeData.claimed_status === 'Not Found Yet' && afterData.claimed_status === 'Matched') {
    // Use the userEmail field directly from the Lost Item document
    const userEmail = afterData.userEmail;
    if (!userEmail) {
      console.log('No userEmail found in Lost Item document.');
      return;
    }

    try {
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
      console.error('Error queuing email:', error);
    }
  }
});


export const testNotifyUnreadMessages = onRequest(async (req, res) => {
  const db = admin.firestore();

  try {
    // Query ongoing conversations (assumes a field "ongoing" set to true)
    const convSnapshot = await db.collection("conversations")
      .where("ongoing", "==", true)
      .get();

    if (convSnapshot.empty) {
      res.send("No ongoing conversations found.");
      return;
    }

    let totalProcessed = 0;
    // Iterate through each ongoing conversation
    for (const convDoc of convSnapshot.docs) {
      const convId = convDoc.id;
      // Query the "messages" subcollection within this conversation
      const messagesSnapshot = await convDoc.ref.collection("messages")
        .where("readAt", "==", null)
        .get();

      if (messagesSnapshot.empty) {
        logger.info(`No unread messages in conversation ${convId}`);
        continue;
      }

      // Process each unread message
      for (const msgDoc of messagesSnapshot.docs) {
        const msgData = msgDoc.data();
        // Get the email field from the message document
        const userEmail = msgData.email;
        if (!userEmail) {
          logger.warn(`Message ${msgDoc.id} in conversation ${convId} is missing an 'email' field.`);
          continue;
        }

        // Queue an email notification by adding a document to the "mail" collection
        await db.collection("mail").add({
          to: userEmail,
          message: {
            subject: "Test: You have an unread message",
            html: `<p>This is a test notification: You have an unread message in conversation ${convId}.</p>`,
          },
        });

        totalProcessed++;
        logger.info(`Queued email for message ${msgDoc.id} in conversation ${convId} to ${userEmail}`);
      }
    }

    res.send(`Processed ${totalProcessed} unread messages.`);
  } catch (error) {
    logger.error("Error processing unread messages:", error);
    res.status(500).send("Error processing unread messages.");
  }
});


// export const notifyUnreadMessages = onSchedule(
//   {
//     schedule: "every 5 minutes", // You can adjust this cron as needed
//     timeZone: "Asia/Singapore"   // or your preferred time zone
//   },
//   async (event) => {
//     const db = admin.firestore();
//     const now = Date.now();
//     // const oneHourAgo = new Date(now - 60 * 60 * 1000); // 1 hour in milliseconds
//     const oneHourAgo = new Date(now - 1000);

//     try {
//       // 1. Query all message docs (across conversation subcollections) that are:
//       //    - unread (readAt == null)
//       //    - older than 1 hour (timestamp < oneHourAgo)
//       // Note: .collectionGroup("messages") searches all subcollections named "messages"
//       // across your entire Firestore.
//       const messagesSnapshot = await db
//         .collectionGroup("messages")
//         .where("readAt", "==", null)
//         .where("timestamp", "<", oneHourAgo)
//         .get();

//       if (messagesSnapshot.empty) {
//         logger.info("No unread messages older than 1 hour found.");
//         return;
//       }

//       // 2. For each unread message, send an email notification to the receiver
//       for (const msgDoc of messagesSnapshot.docs) {
//         const msgData = msgDoc.data();
//         const { userId } = msgData;
//         if (!receiverId) {
//           logger.warn(`Message ${msgDoc.id} has no receiverId field.`);
//           continue;
//         }

//         // 3. Look up the receiver’s user doc to get the email
//         const userDoc = await db.collection("users").doc(userId).get();
//         if (!userDoc.exists) {
//           logger.warn(`No user found for receiverId: ${userId}`);
//           continue;
//         }

//         const userEmail = userDoc.data().email;
//         if (!userEmail) {
//           logger.warn(`No email field for user: ${userId}`);
//           continue;
//         }

//         // 4. Queue an email in the "mail" collection
//         await db.collection("mail").add({
//           to: userEmail,
//           message: {
//             subject: "You have unread messages!",
//             html: `
//               <p>You have unread messages that have been waiting for over an hour.</p>
//               <p>Please log in to check your conversation.</p>
//             `,
//           },
//         });

//         logger.info(`Queued email notification for user: ${userId}`);

//         // (Optional) Mark that we've notified this user to avoid spamming
//         // e.g. msgDoc.ref.update({ notified: true });
//       }

//       logger.info(`Processed ${messagesSnapshot.size} unread messages older than 1 hour.`);
//     } catch (error) {
//       logger.error("Error checking for unread messages:", error);
//     }
//   }
// );


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

