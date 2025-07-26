# 1. Introduction


## 1.1 Executive Summary

CanFindLah - as the name suggests, assures users that lost items can be found. Designed for NUS staff and students, it is an all-in-one platform that streamlines the recovery of lost personal belongings.

Losing personal belongings is common, especially for university students who juggle busy schedules and frequently move across campus. For instance, a study conducted at The National University of Malaysia (UKM) found that over 50% of students reported losing personal belongings on campus during a single academic year (Tan & Chong, 2023). The anxiety of not being able to recover a misplaced item can be overwhelming.

While Singapore is a safe country and students are often inclined to return lost items, existing lost-and-found systems have significant limitations that hinder their effectiveness. The NUS lost and found website and telegram group rely on manual processes, and lack real-time item matching, making it difficult for students to locate their belongings efficiently.

To address this, CanFindLah provides a fully automated, efficient system for managing lost and found items. The app offers a centralised platform for reporting and matching items, but the physical return of items is handled through decentralised user-driven meetups. This allows users to take control of the recovery process at their convenience while ensuring secure and efficient item matching.

To do so, CanFindLah has a range of features. This includes dedicated pages for reporting lost items and found items, a robust matching function that connects users based on item descriptions, a secure item visibility approach, and an anonymous chat feature to facilitate the safe and quick recovery of lost items.

For the final report, our team rephrased the 17 Functional and 16 Non-Functional Requirements from the mid-term report into user stories. We then refined and created user stories by updating the acceptance criteria. We have successfully implemented 22 user stories (20 functional, 2 non-functional) in our web application. All functional requirements were fully implemented.


## 


## 1.2 Problem Statement

University students lead hectic and dynamic lifestyles, juggling academics, internships, social commitments, and personal interests (Aslam, 2024). Unlike in traditional classrooms, students must constantly move across a large campus, attending lectures, tutorials, and co-curricular activities in different locations. This frequent movement, and lack of a fixed base, increases the likelihood of misplacing personal belongings.

Factors such as stress, inattention, disorganization, and forgetfulness further contribute to the problem (Hall, 2023), making it common for students to leave behind items such as laptops, water bottles, stationery, and wallets. By the time a student realizes an item is missing, it may no longer be at its original location, leading to frustration and wasted time searching for it. Fortunately, lost items are often picked up by other students with the intent of returning them. 

For instance, students at the National University of Singapore (NUS) currently rely on a Lost and Found Telegram channel and an Online Lost & Found System. However, these solutions are not the most efficient and could be improved.


<p align="center">
    <img src="/readme_images/figure1.png" width="300"/> <br>
    Figure 1: Current implementation of the NUS Lost and Found Telegram group
</p>


Messages in the Telegram group as shown in Figure 1 get buried quickly, making it difficult to track updates. Users must also manually scan through posts instead of receiving notifications when they find an item that matches their lost one. Additionally, lost and found item reports are mixed and confusing.


<p align="center">
    <img src="/readme_images/figure2.png" width="300"/> <br>
    Figure 2: Current implementation of the NUS Lost & Found System (RepoApp)
</p>


The list of items in the online system in Figure 2 does not allow users to easily search or filter lost items by location, date, or category, making the retrieval process time-consuming. The process of matching the found item and the lost item is also done manually only during working hours, which does not allow for real-time updates.

In response to these limitations in the existing systems, CanFindLah aims to integrate the existing features, together with additional features into a single web application, allowing users to recover their items efficiently.


## 1.3 Purpose

The purpose of CanFindLah is to provide an all-in-one lost-and-found system that enables users to report, search, and claim lost items efficiently. Our application will ensure that the entire process of the claiming of items is fully automated, and intervention is only needed when reports are made by users of the system.

A key differentiating feature of CanFindLah is its ‘secure item visibility’ model. Unlike current systems that publicly display all found items, our application will only reveal found items to users who have reported a lost item with a highly similar description. This approach enhances security and prevents fraudulent claims, particularly for high-value items, by ensuring that only rightful owners receive more detailed information about their belongings.

By leveraging automation and a security-first approach, CanFindLah will greatly reduce the stress and anxiety associated with losing personal belongings. Students will no longer need to sift through cluttered listings or worry about false claims, making the lost-and-found process faster, more secure, and hassle-free.


## 1.4 User Benefits

**Convenient & User-Friendly Experience**

CanFindLah offers a centralized platform with an intuitive interface, advanced item-matching functionality, structured input fields, and real-time updates, streamlining the lost-and-found process. By consolidating all reports into a single, accessible system, users no longer need to monitor multiple platforms, such as the Telegram Lost and Found Group Chat. Instead, searchers can efficiently report and track lost items within a dedicated, well-organized platform, ensuring a more structured and effective retrieval process.

**Efficient Communication & Retrieval Process**

The lack of a direct messaging feature in existing systems prevents users from directly contacting the founder of a lost item. CanFindLah addresses this issue by facilitating direct, anonymous communication between searchers and founders, ensuring a seamless and secure exchange of information. Additionally, to enhance efficiency and expedite the retrieval process, CanFindLah operates 24/7, allowing users to report, track, and coordinate item returns at any time. \


**Security & Verification Measures**

Users benefit from a secure environment where only verified NUS students and staff can access the platform. This prevents misuse by outsiders and reduces the risk of fraudulent claims. Instead of needing to reveal personal details, users only need to provide a messaging username, preserving anonymity while enabling effective communication. Before viewing or claiming matched items, users are required to describe their lost items in detail, ensuring that only the rightful owner can recover the item. These safeguards help users feel confident that their belongings are protected and will be returned securely.


## 1.5 Scope

CanFindLah is a dynamic application that will allow for secure lost-and-found item reporting and matching. It provides dedicated pages for reporting lost items and found items, a robust matching function that connects users based on item descriptions, and an anonymous chat feature to facilitate the safe and quick recovery of lost items.

The scope of users for the application includes NUS staff and students with a valid NUS email address. However, the app will not be directly integrated with the NUS authentication system. Instead, users will be verified through a verification email process. It is also important to note that the application is not responsible for the physical storage of items, location tracking services, and the resolution of any legal disputes related to the found items.


# 2. User Requirements Analysis


## 2.1 User Groups

NUS Students & Staff



1. **Searchers: Reporters of Lost Items**
    1. These users would want to report lost items by providing details such as the item description, location, and time of loss.
    2. These users will receive notifications when potential matches are found for their reported lost item.
    3. These users can chat with the founders of the items to verify ownership and arrange the return.
2. **Founders: Reporters of Found Items**
    4. These users want to report items found in NUS. They will provide details such as the item description, location, and time of finding.
    5. These users can view potential matches and contact the owner via the chat feature to verify ownership before handing over the item.


## 2.2 User Stories** **& Functional Requirements

We have rephrased the requirements from the mid-term report in the form of user stories. However, these are not our finalized product backlogs. We have further selected and refined the user stories that have been developed. Please refer to them in the Product Backlog section, as well as in our SCRUM Artifact.


<table>
  <tr>
   <td>S/N
   </td>
   <td>User Stories
   </td>
   <td>Acceptance Criteria
   </td>
   <td>Priority
   </td>
  </tr>
  <tr>
   <td colspan="4" ><strong>Authentication</strong>
   </td>
  </tr>
  <tr>
   <td rowspan="3" >F-01
   </td>
   <td rowspan="3" >As‬‭ a‬‭ new‬‭ user,‬‭ I‬‭ want‬‭ to‬‭ be‬‭ able‬‭ to‬‭ sign‬‭ up‬‭, so‬‭ that‬‭ I‬‭ can‬‭ access and use‬‭ the‬‭ lost‬‭ and‬ found platform securely.‬
   </td>
   <td><strong>F-01-AC1:</strong> The system must validate password strength of at least 10 characters, with a mix of uppercase, lowercase, numbers and special characters. 
   </td>
   <td rowspan="3" >High
   </td>
  </tr>
  <tr>
   <td><strong>F-01-AC2: </strong>The system must validate the email address by ensuring that the email ends with a NUS domain.
   </td>
  </tr>
  <tr>
   <td><strong>F-01-AC3: </strong>The system must prevent duplicate registrations by checking the uniqueness of the email.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >F-02
   </td>
   <td rowspan="2" >As‬‭ a‬‭ registered‬‭ user,‬‭ I‬‭ want‬‭ to‬‭ log‬‭ in‬‭ quickly‬,‭ so‬‭ that‬‭ I‬‭ can‬ report‬‭ or‬‭ find‬‭ items‬ without repeating the signup process.‬
   </td>
   <td><strong>F-02-AC1: </strong>Users can access to the platform by entering NUS email and passwords after signing up and authentication
   </td>
   <td rowspan="2" >High
   </td>
  </tr>
  <tr>
   <td><strong>F-02-AC2: </strong>The system should display an error message if authentication fails.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >F-03
   </td>
   <td rowspan="2" >As a user, I want to make sure only authenticated users can access the platform, so that unauthorized users cannot misuse the platform.
   </td>
   <td><strong>F-03-AC1: </strong>The system shall ensure that only authenticated users with valid accounts can access protected pages.
   </td>
   <td rowspan="2" >High
   </td>
  </tr>
  <tr>
   <td><strong>F-03-AC2: </strong>The system shall implement brute-force protection measures, such as locking user accounts after multiple failed login attempts.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >F-04
   </td>
   <td rowspan="2" >As‬‭ a‬‭ user,‬‭ I‬‭ want‬‭ to‬‭ be‬‭ able‬‭ to‬‭ log‬‭ out‬‭, so‬‭ that‬‭ I‬‭ can‬‭ securely‬‭ exit‬‭ the application.
   </td>
   <td><strong>F-04-AC1: </strong>Upon logging out, the system should immediately clear the session and prevent access to protected pages until the user re-authenticates.
   </td>
   <td rowspan="2" >High
   </td>
  </tr>
  <tr>
   <td><strong>F-04-AC2: </strong>The system should redirect users to the login page upon logout.
   </td>
  </tr>
  <tr>
   <td rowspan="4" >F-05
   </td>
   <td rowspan="4" >As a user, I want to ensure that only NUS students or staff can access the platform using their NUS email, so that access is restricted to only authorized individuals.
   </td>
   <td><strong>F-05-AC1: </strong>Upon sign-up, the system should send an email verification link to the user.
   </td>
   <td rowspan="4" >Medium
   </td>
  </tr>
  <tr>
   <td><strong>F-05-AC2: </strong>The system should allow users to request a new verification email.
   </td>
  </tr>
  <tr>
   <td><strong>F-05-AC3: </strong>The system should only allow verified users to access the full functionalities.
   </td>
  </tr>
  <tr>
   <td><strong>F-05-AC4: </strong>The system should display a prompt to unverified users attempting to log in so that users can verify their email.
   </td>
  </tr>
  <tr>
   <td colspan="4" ><strong>Report Lost Item Page</strong>
   </td>
  </tr>
  <tr>
   <td rowspan="3" >F-06
   </td>
   <td rowspan="3" >As a user, I‬‭ want‬‭ to‬‭ enter‬‭ as much details‬‭ about‬‭ my‬‭ lost‬‭ item‬‭, so‬‭ that‬‭ the‬‭ system‬‭ can‬ ‭help me find potential matches and allow me to retrieve my items.
   </td>
   <td><strong>F-06-AC1: </strong>The system should allow users to select an item category and colour from preset dropdown lists.
   </td>
   <td rowspan="3" >High
   </td>
  </tr>
  <tr>
   <td><strong>F-06-AC2:</strong>The system should allow users to manually enter the item description, brand, and location where the item was last seen.
   </td>
  </tr>
  <tr>
   <td><strong>F-06-AC3: </strong>The system should allow users to input the date and time the item went missing, validating that the selected datetime is not in the future.
   </td>
  </tr>
  <tr>
   <td rowspan="3" >F-07
   </td>
   <td rowspan="3" >As‬‭ a‬‭ user,‬‭ I‬‭ want‬‭ to‬‭ see‬‭ a‬‭ list‬‭ of‬‭ found‬‭ items‬‭ that‬‭ match‬‭ the‭ description of my lost item, so that I can check if my item has already been found by someone else.
   </td>
   <td><strong>F-07-AC1: </strong>Once the user clicks on the submit button, the system will find the most similar items by comparing the category, colour, and datetime lost. 
   </td>
   <td rowspan="3" >High
   </td>
  </tr>
  <tr>
   <td><strong>F-07-AC2: </strong>The system should display relevant matches based on the user’s input, including category, colour, location, and datetime reported.
   </td>
  </tr>
  <tr>
   <td><strong>F-07-AC3: </strong>The system should display the image of the found item and the item description to the users.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >F-08
   </td>
   <td rowspan="2" >As a user, I want to select my lost item that has been displayed to me, so that I can start to coordinate the retrieval process to retrieve my item.
   </td>
   <td><strong>F-08-AC1: </strong>The system should allow users to  select a matched item and identify it as theirs.
   </td>
   <td rowspan="2" >High
   </td>
  </tr>
  <tr>
   <td><strong>F-08-AC2: </strong>The system should redirect users to a new chat, where the seeker can start a new conversation with the founder, to retrieve the item.
   </td>
  </tr>
  <tr>
   <td colspan="4" ><strong>Report Found Item Page</strong>
   </td>
  </tr>
  <tr>
   <td rowspan="4" >F-09
   </td>
   <td rowspan="4" >As a user, I want to report found items, so that I can help return lost items to their owners efficiently and provide clear information for identification.
   </td>
   <td><strong>F-09-AC1: </strong>The system shall provide predefined categories and a dropdown list for colour selection.
   </td>
   <td rowspan="4" >High
   </td>
  </tr>
  <tr>
   <td><strong>F-09-AC2: </strong>The system shall allow users to manually input item descriptions, brands, and locations where items were found.
   </td>
  </tr>
  <tr>
   <td><strong>F-09-AC3: </strong>The system shall allow users to select the date and time an item was found, validating to ensure no future datetime is selected.
   </td>
  </tr>
  <tr>
   <td><strong>F-09-AC4: </strong>The system shall allow users to upload an image (JPEG or PNG) smaller than 3MB, with an option to preview before submission.
   </td>
  </tr>
  <tr>
   <td colspan="4" ><strong>History Page</strong>
   </td>
  </tr>
  <tr>
   <td rowspan="3" >F-10
   </td>
   <td rowspan="3" >As a user, I want to view a list of all the items I have reported on a separate page, so that I can keep track of their status.
   </td>
   <td><strong>F-10-AC1: </strong>The system should display each item's description, the user's role ("Founder" or "Searcher"), and the item's current status.
   </td>
   <td rowspan="3" >High
   </td>
  </tr>
  <tr>
   <td><strong>F-10-AC2: </strong>The system should categorize item statuses as:
<p>
- "Not Found Yet": No matching item currently exists in the system.
<p>
- "Matched": A matching item is available in the system.
<p>
- "Returned": The item has been successfully returned.
   </td>
  </tr>
  <tr>
   <td><strong>F-10-AC3: </strong>The system should sort the items chronologically, showing the most recent entries first.
   </td>
  </tr>
  <tr>
   <td rowspan="3" >F-11
   </td>
   <td rowspan="3" >As a user, I want to be able to update or delete previously reported lost item details, so that I can ensure the relevance of item reports for easier identification.
   </td>
   <td><strong>F-11-AC1: </strong>The system should allow users to edit item details, including item category, colour, description, last seen location, and date and time the item went missing.
   </td>
   <td rowspan="3" >Medium
   </td>
  </tr>
  <tr>
   <td><strong>F-11-AC2: </strong>The system should enable users to delete item reports entirely if no longer relevant.
   </td>
  </tr>
  <tr>
   <td><strong>F-11-AC3: </strong>The system must prompt users with a confirmation message before saving changes or permanently deleting an item report.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >F-12
   </td>
   <td rowspan="2" >As a user, I want to be able to receive notification via email whenever my lost item is potentially matched with a found item, so that I can take action promptly.
   </td>
   <td><strong>F-12-AC1: </strong>An email notification should be sent to the user with the relevant item details when a newly reported found item potentially matches with a lost item. 
   </td>
   <td rowspan="2" >Medium
   </td>
  </tr>
  <tr>
   <td><strong>F-12-AC2: </strong>The system will not send notifications when an item is marked as "Returned."
   </td>
  </tr>
  <tr>
   <td colspan="4" ><strong>Message Inbox</strong>
   </td>
  </tr>
  <tr>
   <td rowspan="2" >F-13
   </td>
   <td rowspan="2" >As a user, I want to view and access all of my conversations, so that I can keep track of my messages and stay up to date with my chats.
   </td>
   <td><strong>F-13-AC1: </strong>The system should display a list of active chats sorted by the most recent messages, displaying the sender’s username and the latest message. 
   </td>
   <td rowspan="2" >High
   </td>
  </tr>
  <tr>
   <td><strong>F-13-AC2: </strong>The system should display the full conversation with smooth scrolling to access older messages once the user clicks on a specific chat.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >F-14
   </td>
   <td rowspan="2" >As a user, I want to delete past conversations, so that I can keep my message history organized and free up space.
   </td>
   <td><strong>F-14-AC1: </strong>The system should allow users to delete the entire conversation, with a confirmation prompt to prevent accidental removal.
   </td>
   <td rowspan="2" >Low
   </td>
  </tr>
  <tr>
   <td><strong>F-14-AC2: </strong>The system should permanently remove the conversation history from the database upon deletion.
   </td>
  </tr>
  <tr>
   <td colspan="4" ><strong>Conversation Panel</strong>
   </td>
  </tr>
  <tr>
   <td>F-15
   </td>
   <td>As a user, I want to be able to exchange real-time text messages seamlessly during active conversations, so that I can communicate quickly and effectively without delays or interruptions.
   </td>
   <td><strong>F-15-AC1: </strong>The system must display messages immediately in the chat interface once sent by the user.
   </td>
   <td>High
   </td>
  </tr>
  <tr>
   <td rowspan="3" >F-16
   </td>
   <td rowspan="3" >As a user, I want to be able to upload and share files, including images, during a conversation, so that I can easily verify items and coordinate meetups more smoothly.
   </td>
   <td><strong>F-16-AC1: </strong>The system must support common file formats such as JPEG, PNG, and PDF.
   </td>
   <td rowspan="3" >Medium
   </td>
  </tr>
  <tr>
   <td><strong>F-16-AC2: </strong>The system should enable users to upload and download attachments within 1 second.
   </td>
  </tr>
  <tr>
   <td><strong>F-16-AC3: </strong>The system should restrict file uploads to a maximum size of 3MB per file.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >F-17
   </td>
   <td rowspan="2" >As a user, I want to receive timely notifications via email if I have unread chat messages for over an hour, so that I don’t overlook important communications.
   </td>
   <td><strong>F-17-AC1: </strong>The system must automatically send email notifications to the user's registered NUS email address if a message remains unread for one hour.
   </td>
   <td rowspan="2" >Medium
   </td>
  </tr>
  <tr>
   <td><strong>F-17-AC2: </strong>The system must include a direct link within the email notification, redirecting the user to the specific chat conversation.
   </td>
  </tr>
</table>



## 


## 2.3 User Stories** **& Non-Functional Requirements


<table>
  <tr>
   <td>S/N
   </td>
   <td>User Stories
   </td>
   <td>Acceptance Criteria
   </td>
   <td>Priority
   </td>
  </tr>
  <tr>
   <td colspan="4" ><strong>Scalability</strong>
   </td>
  </tr>
  <tr>
   <td rowspan="2" >NF-01
   </td>
   <td rowspan="2" >As a user, I want the application to remain fast and responsive even as more people use it, so that I can continue to access its features smoothly without interruptions or slowdowns
   </td>
   <td><strong>NF-01-AC1: </strong>The application should be able to handle a 100% increase in user traffic over 6 months without requiring a complete redesign.
   </td>
   <td rowspan="2" >Medium
   </td>
  </tr>
  <tr>
   <td><strong>NF-01-AC2: </strong>The system should be capable of scaling vertically and horizontally to handle double the initial load using auto-scaling tools.
   </td>
  </tr>
  <tr>
   <td colspan="4" ><strong>Performance</strong>
   </td>
  </tr>
  <tr>
   <td rowspan="2" >NF-02
   </td>
   <td rowspan="2" >As a user, I want the application to work smoothly even when many people are using it at the same time, so that I can rely on its performance regardless of how busy it gets.
   </td>
   <td><strong>NF-02-AC1: </strong>The application should be able to handle at least 100 concurrent users.
   </td>
   <td rowspan="2" >High
   </td>
  </tr>
  <tr>
   <td><strong>NF-02-AC2: </strong>The application should also be able to handle at least 1000 requests per minute without any change in performance.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >NF-03
   </td>
   <td rowspan="2" >As a user, I want the pages and data to load quickly without needing to refresh, so that I can enjoy a smooth and seamless experience while using the application.
   </td>
   <td><strong>NF-03-AC1: </strong>The pages should load within 3 seconds without the users having to refresh the page.
   </td>
   <td rowspan="2" >High
   </td>
  </tr>
  <tr>
   <td><strong>NF-03-AC2: </strong>Data retrieval and request processing must be completed within 3 seconds.
   </td>
  </tr>
  <tr>
   <td colspan="4" ><strong>Security</strong>
   </td>
  </tr>
  <tr>
   <td rowspan="2" >NF-04
   </td>
   <td rowspan="2" >As a user, I want to ensure that only I can access and make changes to my account, so that my personal information and activity remain secure and private.
   </td>
   <td><strong>NF-04-AC1: </strong>The application should use Firebase Authentication to authenticate users for logging in. 
   </td>
   <td rowspan="2" >High
   </td>
  </tr>
  <tr>
   <td><strong>NF-04-AC2: </strong>Every application page should only be accessible upon successful authentication.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >NF-05
   </td>
   <td rowspan="2" >As a user, I want my reports and chat history to be protected from unauthorized access, so that I can feel confident that my personal data is safe 
   </td>
   <td><strong>NF-05-AC1: </strong>The system should ensure that the data stored in the database is protected from any injection attacks.
   </td>
   <td rowspan="2" >High
   </td>
  </tr>
  <tr>
   <td><strong>NF-05-AC2: </strong>Users should only be able to access and modify data they are authorized to view
   </td>
  </tr>
  <tr>
   <td colspan="4" ><strong>Compatibility</strong>
   </td>
  </tr>
  <tr>
   <td rowspan="2" >NF-06
   </td>
   <td rowspan="2" >As a user, I want the application to work the same on the latest browsers so that I can have a consistent and reliable experience across different browsers.
   </td>
   <td><strong>NF-06-AC1: </strong>The system must display and function accurately across Chrome, Firefox, Safari, and Edge.
   </td>
   <td rowspan="2" >High
   </td>
  </tr>
  <tr>
   <td><strong>NF-06-AC2: </strong>UI elements must be consistent across all browsers.
   </td>
  </tr>
  <tr>
   <td>NF-07
   </td>
   <td>As a user, I want to access the application on desktops, tablets, and mobile devices, so that I can report any items on the go.
   </td>
   <td><strong>NF-07-AC1: </strong>Users must be able to access and use all features without layout or functionality issues on different screen sizes.
   </td>
   <td>Medium
   </td>
  </tr>
  <tr>
   <td colspan="4" ><strong>Usability</strong>
   </td>
  </tr>
  <tr>
   <td>NF-08
   </td>
   <td>As a user, I want the interface to be easy to understand and navigate, so that I can complete important tasks without needing help or tutorials.
   </td>
   <td><strong>NF-08-AC1: </strong>Users should be able to navigate and complete key actions without needing external guidance or tutorials.
   </td>
   <td>High
   </td>
  </tr>
  <tr>
   <td rowspan="2" >NF-09
   </td>
   <td rowspan="2" >As a user, I want buttons, forms, and navigation to respond instantly to my actions, so that I get clear feedback
   </td>
   <td><strong>NF-09-AC1: </strong>Clickable elements should visually indicate interaction (e.g., hover effects).
   </td>
   <td rowspan="2" >Medium
   </td>
  </tr>
  <tr>
   <td><strong>NF-09-AC2: </strong>Forms should validate input in real time.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >NF-10
   </td>
   <td rowspan="2" >As a user, I want the application to have a consistent look and feel across all pages, so that it feels visually cohesive.
   </td>
   <td><strong>NF-10-AC1: </strong>UI components should follow a standardized design system.
   </td>
   <td rowspan="2" >Medium
   </td>
  </tr>
  <tr>
   <td><strong>NF-10-AC2: </strong>The same fonts, buttons, and styles should be applied consistently.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >NF-11
   </td>
   <td rowspan="2" >As the CanFindLah Team, we would like the application to be accessible to users with disabilities and comply with web accessibility standards.
   </td>
   <td><strong>NF-11-AC1: </strong>The interface must support screen readers with alt text and proper HTML structure. Users should be able to navigate all interactive elements using a keyboard.
   </td>
   <td rowspan="2" >Medium
   </td>
  </tr>
  <tr>
   <td><strong>NF-11-AC2: </strong>The text must be resizable without affecting functionality, and colour contrast should meet accessibility standards for readability.
   </td>
  </tr>
  <tr>
   <td colspan="4" ><strong>Maintainability</strong>
   </td>
  </tr>
  <tr>
   <td>NF-12
   </td>
   <td>As the CanFindLah Team, we would like the system to have comprehensive documentation, so that it assists developers in maintaining and updating the system.
   </td>
   <td><strong>NF-12-AC1: </strong>The project must include detailed API documentation, database schema, and system architecture diagrams.
   </td>
   <td>High
   </td>
  </tr>
  <tr>
   <td>NF-13
   </td>
   <td>As the CanFindLah Team, we would like the system to be developed using a modular approach,so as to facilitate easier updates and debugging.
   </td>
   <td><strong>NF-13-AC1: </strong>Codebase should be structured into reusable components, with minimal dependencies between modules.
   </td>
   <td>High
   </td>
  </tr>
  <tr>
   <td colspan="4" ><strong>Reliability</strong>
   </td>
  </tr>
  <tr>
   <td>NF-14
   </td>
   <td>As a user, I want the platform to be consistently available, so that I can access it anytime without disruptions, even if issues occur in the background.
   </td>
   <td><strong>NF-14-AC1: </strong>The system should maintain 99.5% uptime, with automated monitoring to detect and resolve failures.
   </td>
   <td>High
   </td>
  </tr>
  <tr>
   <td>NF-15
   </td>
   <td>As the CanFindLah Team, we would like the system to have an automated backup mechanism, so as to prevent data loss.
   </td>
   <td><strong>NF-15-AC1: </strong>Data should be backed up daily and stored securely with a recovery plan to restore lost data when needed.
   </td>
   <td>High
   </td>
  </tr>
  <tr>
   <td colspan="4" ><strong>Compliance</strong>
   </td>
  </tr>
  <tr>
   <td rowspan="2" >NF-16
   </td>
   <td rowspan="2" >As a user, I want my personal data to be securely handled and only accessible by the right people, so that I can trust the platform to protect my privacy at all times
   </td>
   <td><strong>NF-16-AC1: </strong>User data should be encrypted at rest and in transit.
   </td>
   <td rowspan="2" >High
   </td>
  </tr>
  <tr>
   <td><strong>NF-16-AC2: </strong>Access control must be implemented for sensitive data.
   </td>
  </tr>
</table>



## 2.4 Limitations

**Basic Matching Algorithm**

The current matching algorithm relies on keyword-based searches, which may struggle when there are multiple items of similar keywords, leading to missed matches. For example, a "silver water bottle" and a "metallic flask" may not be recognized as the same item, reducing accuracy and increasing manual verification. To improve efficiency, potential enhancements are image recognition technology and natural language processing, allowing the system to compare uploaded images and also interpret user descriptions more intelligently.

**High Reliance on User Input**

The app’s effectiveness is highly dependent on the accuracy and completeness of user input. If users provide vague or inconsistent descriptions, the system may struggle to generate accurate matches. Similarly, founders who omit key details when reporting discovered items may unintentionally exclude the rightful searcher from finding their lost belongings. 

**Small User Base at Launch**

A key challenge at launch is the small user base, which may reduce the platform’s effectiveness. With fewer reported lost and found items, the chances of successful matches decrease, making it harder to gain traction. To overcome this, we can implement a targeted outreach strategy, including collaborations with NUS departments and active promotions through the existing Lost and Found Telegram channel, encouraging students and staff to adopt the app.

.


# 3. System Design


## 3.1 Firestore Data Diagram


<p align="center">
    <img src="/readme_images/figure3.png" width="500"/> <br>
    Figure 3: Firestore Data Diagram
</p>


The diagram in Figure 3 illustrates how data is structured in Firebase for CanFindLah.

The lost_item_ID, found_item_ID, user_id, and chat_id are automatically generated by the system.

The names of Lost Items and Found Items are determined based on the category, color, and brand provided by the user during input

Each chat entry includes the ID of the founder, ID of the searcher, chat_id, and chat_history.

In the History Page, each user has a user_id linked to a collection of found_item_ID and lost_item_ID, tracking their lost and found items.

The Messages Page stores a user_id along with a collection of chat_id, enabling users to access their conversations efficiently.


## 3.2 Data Flow Diagram


<p align="center">
    <img src="/readme_images/figure4.png" width="500"/> <br>
    Figure 4: Data Flow Diagram
</p>


The data flow diagram in Figure 4 shows the movement of data in the CanFindLah application.

If a user does not have an account, they are required to enter their name, email, and password during registration. Once verified, users can log in by entering their email and password. The system will then retrieve the user’s account details from the User database and match them with the login credentials to authenticate the user.

Report Lost Item Page allows the user to enter details of their lost item so that it can be stored in the Lost Item Database. The system then matches these details against the Found Item Database to assist in recovery. 

Report Found Item Page allows users to enter the details of found items so that they can be stored in the Found Item Database.

Message Inbox allows users to select and access conversations associated with their user_id, retrieved from the Message Database.

The Conversation Panel enables users to chat with other users in real time. All chat history is stored in the Chat database. When a user sends a message, it is immediately stored in the Chat Database with a timestamp.


## 3.3 User Flow Diagram


<p align="center">
    <img src="/readme_images/figure5.png" width="500"/> <br>
    Figure 5: User Flow Diagram
</p>


The user flow diagram in Figure 5 maps out users’ journeys through CanFindLah. Authentication through the Login Page will direct users to a home page with access to four main sections: History Page, Report Lost Item Page, Found Lost Item Page, and Chat Page. 

The Report Found Item Page allows founders to submit details of the item they found, and founders are required to upload an image of the item for verification. 

The Report Lost Item Page allows searchers to enter details of their lost item. If there is a matching item found, the corresponding images and details of the found items are displayed. If the item belongs to the searcher, they will be directed to a chat with the founder for further confirmation and arrangement for item recovery.

The Message Page allows users to browse conversations and chat with founders or searchers. 

The History Page allows users to access their reported items and check their status.


# 4. Prototype Design


## 4.1 Authentication Page 


<table>
  <tr>
   <td>

<p align="center">
    <img src="/readme_images/figure6a.png" width="500"/> <br>
</p>

   </td>
   <td>

<p align="center">
    <img src="/readme_images/figure6b.png" width="500"/> <br>
</p>

   </td>
  </tr>
</table>

<p align="center">
    Figure 6: Login Page (at the left) + Signup Page (at the right)
</p>

The Authentication Page as shown in Figure 6 offers a secure login and signup system (F-01) designed for NUS students and staff. Users can log in using their email and password, with a password visibility toggle for convenience. New users can register through the Sign-Up function (F-02), ensuring that only authenticated and verified users gain access to the platform (F-03), enhancing both security and user experience. Users are prompted to enter a display “username”, which will only be used for chat identification purposes, preserving the app’s anonymous communication feature. Upon signing up, the users will receive an email verification (F-05) and the system should send an email verification link to the user to be validated.


## 4.2 Home Page


<p align="center">
    <img src="/readme_images/figure7.png" width="500"/> <br>
    Figure 7: Home Page
</p>


The Home Page as shown in Figure 7 serves as the main navigation hub, allowing users to seamlessly report lost or found items with clearly labeled buttons for quick access. Designed for ease of use, the interface enables users to take immediate action upon logging in. A real-time dashboard at the bottom displays key statistics, including the number of items claimed, found, and yet to be claimed, providing insights into potential matches for lost belongings. Additionally, users have quick access to essential pages such as the History Page, the Messages Page, and have the option to log out (F-04), ensuring smooth navigation and efficient communication within the platform.


## 4.3 Report Lost Item Page


<p align="center">
    <img src="/readme_images/figure8.png" width="500"/> <br>
    Figure 8: Report Lost Item Page
</p>


<p align="center">
    <img src="/readme_images/figure9.png" width="500"/> <br>
    Figure 9: Display Matching Item
</p>


<p align="center">
    <img src="/readme_images/figure10.png" width="500"/> <br>
    Figure 10: Verify item
</p>


The Report Lost Item Page as shown in Figure 8 allows users to input detailed information about their lost item, including its category, colour, brand, location, date, and description. This structured form ensures accurate reporting, increasing the chances of successful recovery. Upon clicking the Submit button (F-06), the system's matching algorithm runs, scanning the database for similar found items. If there are potential matches, the results are displayed alongside photos and descriptions, as shown in Figure 9, allowing users to visually compare and identify potential matches (F-07). As shown in Figure 10, each listed item allows users to confirm if the item belongs to them (F-08). 


## 4.4 Report Found Item Page


<p align="center">
    <img src="/readme_images/figure11.png" width="500"/> <br>
    Figure 11: Report Found Item Page
</p>


The Report Found Item Page as shown in Figure 11 allows users to provide detailed information about an item they have found, ensuring a smooth and efficient process for matching it with its rightful owner. Users can enter key details such as category, colour, brand, location found, date & time found, and a description of the item (F-09). This structured input helps improve the matching algorithm, increasing the chances of matching the found item with a reported lost item. Once the Submit button is clicked, the system processes the information and cross-checks it with existing or future lost item reports. 


## 4.5 History Page


<p align="center">
    <img src="/readme_images/figure12.png" width="500"/> <br>
    Figure 12: History Page
</p>


The History Page as shown in Figure 12 provides users with a structured overview of their lost and found reports, categorized by status for easy tracking. Each entry includes essential details such as item category, color, brand, location found, date and time found, description and status updates, with users assigned roles as Searchers or Founders. Status tags such as "Not Found Yet", "Matched" and "Returned" indicate the progress of each report, ensuring clarity in item recovery (F-10). Users can also update or delete their previously reported item details to ensure the accuracy and relevance of item reports (F-11). A status filter allows users to filter entries efficiently, while a completion message at the bottom confirms all reports have been loaded. This streamlined interface enhances navigation, making it easy for users to monitor the progress of their lost and found items in real-time (F-12). 


## 4.6 Message Inbox and Conversational Panel


<p align="center">
    <img src="/readme_images/figure13.png" width="500"/> <br>
    Figure 13: Message Inbox (at the left) + Conversation Panel (at the right)
</p>


The Message Inbox as shown in Figure 13 enables direct communication between founders and searchers of lost items, streamlining the retrieval process. Users can view a list of conversations (F-13) with item ownership status, indicating whether the person they are chatting with is a searcher or a founder. Each chat entry includes the user name, user role and a message preview, enabling quick navigation to relevant conversations. Users can also delete chats that are no longer active or in use. (F-14)

Within the conversational panel, users can engage in real-time messaging with the founder or searcher to coordinate the return process efficiently (F-15). Additionally, the chat supports JPEG file attachments, allowing users to share images for enhanced verification and authentication of lost items (F-16). This integrated messaging system ensures seamless, secure, and efficient communication, significantly improving the lost-and-found experience.




# 5. Code Design

**Conditional Rendering**


<p align="center">
    <img src="/readme_images/figure14.png" width="500"/> <br>
    Figure 14: Example Usage of Conditional Rendering
</p>


In our web application, we utilize conditional rendering to dynamically control the display of UI elements based on application state and user roles. This approach ensures that only relevant content and actions are shown to users at any given time, enhancing usability and reducing interface clutter. By conditionally displaying components such as buttons, images, and informational text, the application maintains a clean and context-aware user interface. This not only improves user experience but also ensures that the interface remains responsive and adaptable to different scenarios throughout the application.

**Clarity in Documentation & Comments**


<p align="center">
    <img src="/readme_images/figure15.png" width="500"/> <br>
    Figure 15: Example of Clarity in Documentation & Comments
</p>


Throughout our project, we have maintained clear and consistent documentation within the code to enhance readability and understanding. Comments are thoughtfully placed to explain the purpose and functionality of key logic blocks, input validations, and data handling processes. This practice ensures that both current and future team members can easily comprehend the structure and flow of the code, leading to smoother collaboration, easier debugging, and more efficient development overall.

**Usage of Props**


<p align="center">
    <img src="/readme_images/figure16.png" width="500"/> <br>
    Figure 16: Example Usage of Props
</p>


In our web application, we utilize props to pass data objects, such as individual lost or found item entries between components. Each item is passed as a prop containing essential details like images, descriptions, and metadata. This modular approach enhances component reusability and ensures that data is dynamically rendered. 

**Component Abstraction**


<p align="center">
    <img src="/readme_images/figure17.png" width="500"/> <br>
    Figure 17: Example of Abstracting Components
</p>


To ensure modularity in our web application, we have abstracted key components into reusable units. This approach improves maintainability by separating concerns clearly, allowing easier future development and updates. By isolating functionality, these components enhance maintainability and scalability by enabling the item display logic to be reused across different views without redundancy.
