import { collection, getDocs, query, where } from 'firebase/firestore'
import { app } from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import 'primeicons/primeicons.css'

// Get Firestore instance
const db = getFirestore(app)
console.log('Firestore initialized:', db)

export async function findMatchingItems(formData) {
    // Log the input formData to ensure it's passed correctly
    console.log('Searching for matching items with the following data:', formData)

    try {
        // Reference to the 'Found Item' collection
        const foundItemRef = collection(db, 'Found Item')

        // Create Firestore query to search for matching items
        const q = query(foundItemRef, where('category', '==', formData.category), where('colour', '==', formData.color), where('claimed_status', '==', 'Not Found Yet'))

        // Log the query that will be executed
        console.log('Firestore query:', q)

        // Execute the query and get the documents
        const querySnapshot = await getDocs(q)

        // Prepare an array to store the results
        let results = []

        // Loop through the documents in the snapshot and log each document data
        querySnapshot.forEach((doc) => {
            console.log('Found matching document:', doc.id, doc.data())
            results.push({ id: doc.id, ...doc.data() })
        })

        // Log the final results of the query
        console.log('Matching found items:', results)

        // Return the matching items
        return results
    } catch (error) {
        // Log any errors that occur during the Firestore query
        console.error('Error finding matching items:', error)
        throw new Error('Unable to retrieve matching items. Please try again later.')
    }
}
