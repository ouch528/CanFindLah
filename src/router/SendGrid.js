// const functions = require('firebase-functions');
// const admin = require('firebase-admin');
// const sgMail = require('@sendgrid/mail');

// admin.initializeApp();

// const API_KEY = functions.config().sendgrid.key;
// const TEMPLATE_ID = functions.config().sendgrid.template;

// // Configure SendGrid API key
// sgMail.setApiKey(API_KEY);

// exports.notifyUserOnMatch = functions.firestore
//   .document('lost_items/{itemId}')
//   .onUpdate(async (change, context) => {
//     const before = change.before.data();
//     const after = change.after.data();
    
//     // Check if status changed from "Not Found Yet" to "Matched"
//     if (before.claimed_status === 'Not Found Yet' && after.claimed_status === 'Matched') {
      
//       // Construct your email message (ensure the user's email is stored in the document, e.g., after.userEmail)
//       const msg = {
//         to: after.userEmail, 
//         from: 'noreply@yourdomain.com',
//         subject: 'Your lost item has been matched!',
//         text: `Good news! Your lost item (Category: ${after.category}, Color: ${after.colour}, Brand: ${after.brand}) has been matched with a found item. Please log in to your account for further details.`,
//         // Optionally include HTML content:
//         html: `<p>Good news! Your lost item (Category: ${after.category}, Color: ${after.colour}, Brand: ${after.brand}) has been matched with a found item. Please log in to your account for further details.</p>`
//       };
      
//       try {
//         await sgMail.send(msg);
//         console.log(`Email sent to ${after.userEmail} for item ${context.params.itemId}`);
//       } catch (error) {
//         console.error('Error sending email:', error);
//       }
//     }
    
//     // Do nothing for "Returned" or other status changes
//     return null;
//   });

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const postmark = require('postmark');

admin.initializeApp();

// Configure Postmark API key from functions config
const postmarkClient = new postmark.ServerClient(functions.config().postmark.key);

exports.notifyUserOnMatch = functions.firestore
  .document('Lost Item/{lost_item_id}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if status changed from "Not Found Yet" to "Matched"
    if (before.claimed_status === 'Not Found Yet' && after.claimed_status === 'Matched') {
      
      // Construct your email message
      const emailData = {
        From: 'noreply@yourdomain.com', // Replace with your verified sender email
        To: after.userEmail, // Ensure the document includes the user's email
        Subject: 'Your lost item has been matched!',
        TextBody: `Good news! Your lost item (Category: ${after.category}, Color: ${after.colour}, Brand: ${after.brand}) has been matched with a found item. Please log in to your account for further details.`,
        HtmlBody: `<p>Good news! Your lost item (Category: ${after.category}, Color: ${after.colour}, Brand: ${after.brand}) has been matched with a found item. Please log in to your account for further details.</p>`,
        MessageStream: "outbound" // This should be your message stream, typically "outbound"
      };

      try {
        const result = await postmarkClient.sendEmail(emailData);
        console.log(`Email sent to ${after.userEmail} for item ${context.params.itemId}`, result);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
    
    // No action for "Returned" or other status updates
    return null;
  });

