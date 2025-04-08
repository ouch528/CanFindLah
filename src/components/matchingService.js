import { collection, getDocs, query, where } from 'firebase/firestore'
import { app } from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import 'primeicons/primeicons.css'

// Get Firestore instance
const db = getFirestore(app)
console.log('Firestore initialized:', db)

export async function findMatchingItems(formData) {
    console.log('Form Data:', formData) // Log formData to see if datetime is there

    try {
        // Ensure 'datetime' is present and is a valid string (it should be 'datetime' instead of 'date_time_lost')
        const dateTimeLostString = formData.datetime // Use 'datetime' here
        if (!dateTimeLostString || typeof dateTimeLostString !== 'string') {
            throw new Error("'datetime' is missing or not a valid string.")
        }

        // Log the value of datetime to ensure it's what we expect
        console.log('datetime:', dateTimeLostString)

        // Convert the datetime string to a JavaScript Date object
        const dateTimeLost = new Date(dateTimeLostString)

        // Ensure the string is a valid date
        if (isNaN(dateTimeLost.getTime())) {
            throw new Error("'datetime' is not a valid date string.")
        }

        console.log('Parsed datetime:', dateTimeLost)

        // Add 7 days to the lost date
        const sevenDaysAfterLost = new Date(dateTimeLost)
        sevenDaysAfterLost.setDate(dateTimeLost.getDate() + 7)

        // Reference to the 'Found Item' collection
        const foundItemRef = collection(db, 'Found Item')

        // Simplified Firestore query to search based only on category (no need for composite index)
        const q = query(
            foundItemRef,
            where('category', '==', formData.category), // Query by category only
        )

        console.log('Firestore query:', q)

        // Execute the query and get the documents
        const querySnapshot = await getDocs(q)

        // Prepare an array to store the results
        let results = []

        querySnapshot.forEach((doc) => {
            const docData = doc.data()

            // Check if 'date_time_found' is a Firestore Timestamp and convert it to a Date
            let dateTimeFound = docData.date_time_found
            if (dateTimeFound && dateTimeFound.toDate) {
                dateTimeFound = dateTimeFound.toDate() // If it's a Firestore Timestamp, convert to Date
            } else {
                dateTimeFound = new Date(dateTimeFound) // Otherwise, assume it's a Date or string
            }

            // Check if the category is 'others' and compare descriptions
            let descriptionMatch = true // Default to true if no description comparison is needed
            if (formData.category === 'others' && docData.description) {
                // Use regex to match words from both the lost and found descriptions
                const lostDescriptionWords = formData.description.toLowerCase().match(/\b\w+\b/g) // Matches all word characters (alphanumeric + underscores)
                const foundDescriptionWords = docData.description.toLowerCase().match(/\b\w+\b/g) // Matches all word characters (alphanumeric + underscores)

                console.log('Lost description words:', lostDescriptionWords)
                console.log('Found description words:', foundDescriptionWords)

                // Check if any of the lost description words are present in the found description
                descriptionMatch = lostDescriptionWords.some((lostWord) => foundDescriptionWords.includes(lostWord))
            }

            // Now, perform the additional filtering on client-side based on color, claimed_status, and the date range
            if (
                docData.colour === formData.color &&
                docData.claimed_status === 'Not Found Yet' &&
                dateTimeFound >= dateTimeLost && // Check if found date is after or equal to lost date
                dateTimeFound <= sevenDaysAfterLost && // Check if found date is within 7 days
                descriptionMatch // Check if description matches (only for 'others' category)
            ) {
                console.log('Found matching document:', doc.id, docData)
                results.push({ id: doc.id, ...docData })
            }
        })

        console.log('Matching found items:', results)

        return results
    } catch (error) {
        console.error('Error finding matching items:', error)
        throw new Error('Unable to retrieve matching items. Please try again later.')
    }
}
