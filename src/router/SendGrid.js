// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// const postmark = require('postmark');

// admin.initializeApp();

// // Configure Postmark API key from functions config
// const postmarkClient = new postmark.ServerClient(functions.config().postmark.key);

// exports.notifyUserOnMatch = functions.firestore
//   .document('Lost Item/{lost_item_id}')
//   .onUpdate(async (change, context) => {
//     const before = change.before.data();
//     const after = change.after.data();
    
//     // Check if status changed from "Not Found Yet" to "Matched"
//     if (before.claimed_status === 'Not Found Yet' && after.claimed_status === 'Matched') {
      
//       // Construct your email message
//       const emailData = {
//         From: 'e1130084@u.nus.edu', // Replace with your verified sender email
//         To: after.userEmail, // Ensure the document includes the user's email
//         Subject: 'Your lost item has been matched!',
//         TextBody: `Good news! Your lost item (Category: ${after.category}, Color: ${after.colour}, Brand: ${after.brand}) has been matched with a found item. Please log in to your account for further details.`,
//         HtmlBody: `<p>Good news! Your lost item (Category: ${after.category}, Color: ${after.colour}, Brand: ${after.brand}) has been matched with a found item. Please log in to your account for further details.</p>`,
//         MessageStream: "outbound" // This should be your message stream, typically "outbound"
//       };

//       try {
//         const result = await postmarkClient.sendEmail(emailData);
//         console.log(`Email sent to ${after.userEmail} for item ${context.params.itemId}`, result);
//       } catch (error) {
//         console.error('Error sending email:', error);
//       }
//     }
//         return null;
//   });

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();


export const sendWelcomeEmail = functions.firestore
  .document('Lost Item/{lost_item_id}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if the status changed from 'Not Found Yet' to 'Matched'
    if (before.claimed_status === 'Not Found Yet' && after.claimed_status === 'Matched') {
      // Add an email message document to the "mail" collection
      return admin.firestore()
        .collection("mail")
        .add({
          to: after.userEmail, // Use the user's email from the document data
          message: {
            subject: "Welcome!",
            html: "Congratulations, we have found you a match!"
          },
        });
    }
    return null;
  });

