const admin = require("firebase-admin");
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

admin.initializeApp();

// export const sendAlertEmail = onDocumentUpdated('Lost Item/{lost_item_id}', async (event) => {
//   // Get the before and after snapshots of the document
//   const beforeData = event.data.before.data();
//   const afterData = event.data.after.data();

//   // Check if claimed_status changed from "Not Found Yet" to "Matched"
//   if (beforeData.claimed_status === 'Not Found Yet' && afterData.claimed_status === 'Matched') {
//     // Use the userEmail field directly from the Lost Item document
//     const userEmail = afterData.email;
//     if (!userEmail) {
//       console.log('No userEmail found in Lost Item document.');
//       return;
//     }

//     try {
//       // Add a mail document to the "mail" collection so that your email service can process it
//       await admin.firestore().collection('mail').add({
//         to: userEmail,
//         message: {
//           subject: "Your lost item has been matched!",
//           html: "Congratulations, we have found you a match!",
//         },
//       });
//       console.log(`Email queued for user: ${userEmail}`);
//     } catch (error) {
//       console.error('Error queuing email:', error);
//     }
//   }
// });


export const notifyUnreadMessagesReminder = onSchedule(
  {
    schedule: "every 5 minutes",
    timeZone: "Asia/Singapore"
  },
  async (event) => {
    const db = admin.firestore();
    // For testing, we only require the message to be older than 1 minute
    // In production, you'd probably use 60 * 60 * 1000 for an hour
    const thresholdMs = 60 * 60 * 1000;
    const nowMillis = Date.now();

    try {
      // 1. Query conversation docs with Notified == false
      const convSnapshot = await db
        .collection("conversations")
        .where("Notified", "==", false)
        .get();

      if (convSnapshot.empty) {
        logger.info("No conversations require notification.");
        return;
      }

      let totalProcessed = 0;

      // 2. Check each conversation's messages subcollection
      for (const convDoc of convSnapshot.docs) {
        const convId = convDoc.id;

        // Get all unread messages (readAt == null) in this conversation
        const messagesSnapshot = await convDoc.ref
          .collection("messages")
          .where("readAt", "==", null)
          .get();

        if (messagesSnapshot.empty) {
          logger.info(`No unread messages in conversation ${convId}`);
          continue;
        }

        // We'll see if there's at least one message older than threshold
        let hasOldUnread = false;
        let oldestMessageTimeString = null;
        let receiverId = null;

        for (const msgDoc of messagesSnapshot.docs) {
          const msgData = msgDoc.data();
          if (!msgData.timestamp) {
            continue; // skip if no timestamp
          }
          const messageAgeMs = nowMillis - msgData.timestamp.toMillis();
          if (messageAgeMs >= thresholdMs) {
            hasOldUnread = true;
            oldestMessageTimeString = msgData.timestamp.toDate().toLocaleString('en-US', { timeZone: 'Asia/Singapore'});
            receiverId = msgData.receiver;
            break; 
          }
        }

        // If no message qualified, skip
        if (!hasOldUnread || !receiverId) {
          continue;
        }

        // 3. Look up the user's email (receiverId) from the "users" collection
        const userDoc = await db.collection("users").doc(receiverId).get();
        if (!userDoc.exists) {
          logger.warn(`User doc not found for receiver: ${receiverId}`);
          continue;
        }
        const userEmail = userDoc.data().email;
        if (!userEmail) {
          logger.warn(`No email for user: ${receiverId}`);
          continue;
        }

        // 4. Send an email by adding to the "mail" collection
        await db.collection("mail").add({
          to: userEmail,
          message: {
            subject: "Reminder: You Have Unread Messages!",
            html: `
            
              <p>You have an unread message from ${oldestMessageTimeString} in conversation.</p>
              <a href="http://localhost:5173/messages?conversationId=${convId}">
                ${convId}
              </a>.
              <p>Please log in to read it.</p>
            `,
          },
        });
        logger.info(`Queued reminder email for conversation ${convId} to ${userEmail}`);

        // 5. Mark the entire conversation as Notified
        await convDoc.ref.update({ Notified: true });
        totalProcessed++;
      }

      logger.info(`Processed ${totalProcessed} conversation(s) for reminders.`);
    } catch (error) {
      logger.error("Error processing unread message reminders:", error);
    }
  }
);

export const resetNotifiedOnNewMessage = onDocumentCreated(
  "conversations/{convId}/messages/{msgId}",
  async (event) => {
    // Each new message (always unread by default) should re-open reminders
    const msgData = event.data.data();
    // Only reset if the message truly is unread (readAt not set)
    if (msgData.readAt != null) return;

    // Parent conversation reference
    const convRef = event.data.ref.parent.parent;
    if (!convRef) {
      logger.error("Can't locate parent conversation for new message");
      return;
    }

    try {
      await convRef.update({ Notified: false });
      logger.info(`Reset Notified for conversation ${convRef.id}`);
    } catch (err) {
      logger.error("Error resetting Notified:", err);
    }
  }
);




// export const notifyUnreadMessagesReminder = onSchedule(
//   {
//     schedule: "every 5 minutes", // run every 3 hours
//     timeZone: "Asia/Singapore"
//   },
//   async (event) => {
//     const db = admin.firestore();
//     // For testing, we want to trigger a reminder if the message is older than 1 minute.
//     // In production, change 60 * 1000 to 60 * 60 * 1000 for one hour.
//     const thresholdInMs = 60 * 1000; // one minute threshold for testing
//     const nowMillis = Date.now();

//     try {
//       // Query all messages that have readAt == null AND have not been notified yet.
//       // (We assume that messages that have been processed would have a field "notified": true)
//       const messagesSnapshot = await db.collectionGroup("messages")
//         .where("readAt", "==", null)
//         .where("Notified", "==", false)
//         .get();

//       if (messagesSnapshot.empty) {
//         logger.info("No unread messages (or all already notified) found.");
//         return;
//       }

//       let totalProcessed = 0;

//       // Process each message document
//       for (const msgDoc of messagesSnapshot.docs) {
//         const msgData = msgDoc.data();

//         // Ensure that the message has a timestamp field.
//         if (!msgData.timestamp) {
//           logger.warn(`Message ${msgDoc.id} is missing a timestamp.`);
//           continue;
//         }

//         // Firestore Timestamp objects have a toMillis() method.
//         const messageTime = msgData.timestamp.toMillis();
//         const diff = nowMillis - messageTime;

//         // Check if at least thresholdInMs (1 minute for testing) have passed
//         if (diff >= thresholdInMs) {
//           // Get the receiver's ID from the message document. (Assumes field name "receiver")
//           const receiverId = msgData.receiver;
//           if (!receiverId) {
//             logger.warn(`Message ${msgDoc.id} is missing the receiver field.`);
//             continue;
//           }

//           // Look up the user's email in the "users" collection
//           const userDoc = await db.collection("users").doc(receiverId).get();
//           if (!userDoc.exists) {
//             logger.warn(`No user document found for receiver: ${receiverId}`);
//             continue;
//           }
//           const userEmail = userDoc.data().email;
//           if (!userEmail) {
//             logger.warn(`User ${receiverId} does not have an email field.`);
//             continue;
//           }

//           logger.info("About to add document to mail collection for user: " + userEmail);

//           // Queue an email reminder by writing into the "mail" collection.
//           await db.collection("mail").add({
//             to: userEmail,
//             message: {
//               subject: "Reminder: Unread Message Notification",
//               html: `
//                 <p>You have a message sent at ${msgData.timestamp.toDate().toLocaleString()} that remains unread.</p>
//                 <p>Please check your conversation.</p>
//               `,
//             },
//           });

//           logger.info("Mail document added successfully");


//           // Mark the message as having been notified so we don't send multiple reminders.
//           await updateDoc(doc(db, 'conversations'),
//             { Notified: true });

//           totalProcessed++;
//           logger.info(`Queued reminder email for message ${msgDoc.id} to ${userEmail}`);
//         }
//       }

//       logger.info(`Processed ${totalProcessed} unread message(s) for reminder.`);
//     } catch (error) {
//       logger.error("Error processing unread message reminders:", error);
//     }
//   }
// );

// export const notifyUnreadConversation = onSchedule(
//   {
//     // For testing, you might run this on a schedule (e.g. "every 3 hours").
//     // If you remove the schedule, it would run only once manually.
//     schedule: "every 5 minutes",
//     timeZone: "Asia/Singapore"
//   },
//   async (event) => {
//     const db = admin.firestore();
//     // For testing, we set a threshold of 1 minute;
//     // for production, consider using 60 * 60 * 1000 for one hour.
//     const thresholdInMs = 60 * 60 * 1000;
//     const nowMillis = Date.now();
//     const thresholdTime = new Date(nowMillis - thresholdInMs);

//     try {
//       // Query ongoing conversations that have not yet been notified.
//       const convSnapshot = await db.collection("conversations")
//         .where("ongoing", "==", true)
//         // .orderBy("timestamp", "desc")
//         .limit(1)
//         .get();

//       if (convSnapshot.empty) {
//         logger.info("No ongoing conversations found that require notification.");
//         return;
//       }

//       let totalProcessed = 0;

//       // Process each conversation document.
//       for (const convDoc of convSnapshot.docs) {
//         const convId = convDoc.id;

//         // Query the messages subcollection for unread messages older than the threshold.
//         // This query is done on the subcollection within the conversation.
//         const messagesSnapshot = await convDoc.ref.collection("messages")
//           .where("readAt", "==", null)
//           .where("timestamp", "<", thresholdTime)
//           .get();

//         // If there are no messages that meet the criteria, skip this conversation.
//         if (messagesSnapshot.empty) {
//           logger.info(`No unread messages in conversation ${convId} that meet the threshold.`);
//           continue;
//         }

//         // We want only one email per conversation.
//         // Take the receiver ID from the first qualifying message.
//         const firstMsgData = messagesSnapshot.docs[0].data();       
//         const receiverId = firstMsgData.receiver;
//         if (!receiverId) {
//           logger.warn(`Conversation ${convId}: First message is missing receiver information.`);
//           continue;
//         }

//         // Look up the receiver's email address in the "users" collection.
//         const userDoc = await db.collection("users").doc(receiverId).get();
//         if (!userDoc.exists) {
//           logger.warn(`No user document found for receiver: ${receiverId} in conversation ${convId}.`);
//           continue;
//         }
//         const userEmail = userDoc.data().email;
//         if (!userEmail) {
//           logger.warn(`No email found for receiver: ${receiverId} in conversation ${convId}.`);
//           continue;
//         }

//         // Queue an email notification by adding a document to the "mail" collection.
//         await db.collection("mail").add({
//           to: userEmail,
//           message: {
//             subject: "Reminder: You have unread messages!",
//             html: `
//               <p>You have unread messages in conversation ${convId} that have been waiting for a while.</p>
//               <p>Please log in to your account to check them.</p>
//             `,
//           },
//         });

//         // Mark the conversation as notified so that we do not send additional emails later.
//         await convDoc.ref.update({ notified: true });
//         totalProcessed++;
//         logger.info(`Queued notification email for conversation ${convId} to ${userEmail}`);
//       }

//       logger.info(`Processed ${totalProcessed} conversation(s) with unread messages.`);
//     } catch (error) {
//       logger.error("Error processing unread conversation notifications:", error);
//     }
//   }
// );




/* Rev 3 (Working) Firestore automatically creates single-field indexes, but when you use multiple where clauses that reference different fields, 
a composite index is needed to efficiently run the query. Firestore provides an error message with a link to help you create the required index.

import admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";

admin.initializeApp();

export const notifyUnreadMessagesReminder = onSchedule(
  {
    schedule: "every 5 minutes", // run every 5 minutes
    timeZone: "Asia/Singapore"
  },
  async (event) => {
    const db = admin.firestore();
    // For testing, we want to trigger a reminder if the message is older than 1 minute.
    // In production, change 60 * 1000 to 60 * 60 * 1000 for one hour.
    const thresholdInMs = 60 * 1000; // one minute threshold for testing
    const nowMillis = Date.now();

    try {
      // Query all messages that have readAt == null AND have not been notified yet.
      // (We assume that messages that have been processed would have a field "notified": true)
      const messagesSnapshot = await db.collectionGroup("messages")
        .where("readAt", "==", null)
        .where("notified", "==", false)
        .get();

      if (messagesSnapshot.empty) {
        logger.info("No unread messages (or all already notified) found.");
        return;
      }

      let totalProcessed = 0;

      // Process each message document
      for (const msgDoc of messagesSnapshot.docs) {
        const msgData = msgDoc.data();

        // Ensure that the message has a timestamp field.
        if (!msgData.timestamp) {
          logger.warn(`Message ${msgDoc.id} is missing a timestamp.`);
          continue;
        }

        // Firestore Timestamp objects have a toMillis() method.
        const messageTime = msgData.timestamp.toMillis();
        const diff = nowMillis - messageTime;

        // Check if at least thresholdInMs (1 minute for testing) have passed
        if (diff >= thresholdInMs) {
          // Get the receiver's ID from the message document. (Assumes field name "receiver")
          const receiverId = msgData.receiver;
          if (!receiverId) {
            logger.warn(`Message ${msgDoc.id} is missing the receiver field.`);
            continue;
          }

          // Look up the user's email in the "users" collection
          const userDoc = await db.collection("users").doc(receiverId).get();
          if (!userDoc.exists) {
            logger.warn(`No user document found for receiver: ${receiverId}`);
            continue;
          }
          const userEmail = userDoc.data().email;
          if (!userEmail) {
            logger.warn(`User ${receiverId} does not have an email field.`);
            continue;
          }

          // Queue an email reminder by writing into the "mail" collection.
          await db.collection("mail").add({
            to: userEmail,
            message: {
              subject: "Reminder: Unread Message Notification",
              html: `
                <p>You have a message sent at ${msgData.timestamp.toDate().toLocaleString()} that remains unread.</p>
                <p>Please check your conversation.</p>
              `,
            },
          });

          // Mark the message as having been notified so we don't send multiple reminders.
          await msgDoc.ref.update({ notified: true });

          totalProcessed++;
          logger.info(`Queued reminder email for message ${msgDoc.id} to ${userEmail}`);
        }
      }

      logger.info(`Processed ${totalProcessed} unread message(s) for reminder.`);
    } catch (error) {
      logger.error("Error processing unread message reminders:", error);
    }
  }
);
*/



/* Rev2 Working Code
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

export const notifyUnreadMessages = onSchedule(
  {
    schedule: "every 5 minutes",
    timeZone: "Asia/Singapore"
  },
  async (event) => {
    const db = admin.firestore();
    const now = Date.now();
    // Calculate one hour ago
    const oneHourAgo = new Date(now - 60 * 60 * 1000)

    try {
      // Query ongoing conversations. (Assuming each conversation document has an "ongoing" field set to true)
      const convSnapshot = await db.collection("conversations")
        .where("ongoing", "==", true)
        .get();

      if (convSnapshot.empty) {
        logger.info("No ongoing conversations found.");
        return;
      }

      let totalProcessed = 0;
      // Iterate over each conversation document
      for (const convDoc of convSnapshot.docs) {
        const convId = convDoc.id;
        // Query the messages subcollection for unread messages older than one hour.
        const messagesSnapshot = await convDoc.ref.collection("messages")
          .where("readAt", "==", null)
          // .where("timestamp", "<", oneMinuteAgo) //check error
          // .where("differenceInMilliseconds", "<", 1000)
          .get();

        if (messagesSnapshot.empty) {
          logger.info(`No unread messages in conversation ${convId}`);
          continue;
        }

        // Process each unread message
        for (const msgDoc of messagesSnapshot.docs) {
          const msgData = msgDoc.data();

          // Retrieve the receiver's ID from the message document.
          const receiverId = msgData.receiver;
          if (!receiverId) {
            logger.warn(`Message ${msgDoc.id} in conversation ${convId} is missing receiver_id.`);
            continue;
          }

          // Look up the receiver’s email in the users collection.
          const userDoc = await db.collection("users").doc(receiverId).get();
          if (!userDoc.exists) {
            logger.warn(`No user document found for receiver_id: ${receiverId}`);
            continue;
          }

          const userEmail = userDoc.data().email;
          if (!userEmail) {
            logger.warn(`No email found for user ${receiverId}`);
            continue;
          }

          // Queue an email notification by adding a document to the "mail" collection.
          await db.collection("mail").add({
            to: userEmail,
            message: {
              subject: "You have unread messages!",
              html: `
                <p>You have unread messages in conversation ${convId} that have been waiting for over an hour.</p>
                <p>Please log in to your account to view them.</p>
              `,
            },
          });

          totalProcessed++;
          logger.info(`Queued email for conversation ${convId} to ${userEmail}`);
        }
      }

      logger.info(`Processed ${totalProcessed} unread messages.`);
    } catch (error) {
      logger.error("Error processing unread messages:", error);
    }
  }
);

*/



//Rev 1 Working Code .....
// export const testNotifyUnreadMessages = onRequest(async (req, res) => {
//   const db = admin.firestore();
//   // const now = Date.now();
//     // const oneHourAgo = new Date(now - 60 * 60 * 1000); // 1 hour in milliseconds
//   // const oneHourAgo = new Date(now - 60000);

//   try {
//     // Query ongoing conversations (assumes a field "ongoing" set to true)
//     const convSnapshot = await db.collection("conversations")
//       .where("ongoing", "==", true)
//       .get();

//     if (convSnapshot.empty) {
//       res.send("No ongoing conversations found.");
//       return;
//     }

//     let totalProcessed = 0;
//     // Iterate through each ongoing conversation
//     for (const convDoc of convSnapshot.docs) {
//       const convId = convDoc.id;
//       // Query the "messages" subcollection within this conversation
//       const messagesSnapshot = await convDoc.ref.collection("messages")
//         .where("readAt", "==", null)
//         .get();

//       if (messagesSnapshot.empty) {
//         logger.info(`No unread messages in conversation ${convId}`);
//         continue;
//       }

//       // Process each unread message
//       for (const msgDoc of messagesSnapshot.docs) {
//         const msgData = msgDoc.data();
//         // Get the email field from the message document
//         const userEmail = msgData.email;
//         if (!userEmail) {
//           logger.warn(`Message ${msgDoc.id} in conversation ${convId} is missing an 'email' field.`);
//           continue;
//         }

//         // Queue an email notification by adding a document to the "mail" collection
//         await db.collection("mail").add({
//           to: userEmail,
//           message: {
//             subject: "Test: You have an unread message",
//             html: `<p>This is a test notification: You have an unread message in conversation ${convId}.</p>`,
//           },
//         });

//         totalProcessed++;
//         logger.info(`Queued email for message ${msgDoc.id} in conversation ${convId} to ${userEmail}`);
//       }
//     }

//     res.send(`Processed ${totalProcessed} unread messages.`);
//   } catch (error) {
//     logger.error("Error processing unread messages:", error);
//     res.status(500).send("Error processing unread messages.");
//   }
// });





//Original Ver .....
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

