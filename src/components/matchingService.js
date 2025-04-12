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
        const dateTimeLostString = formData.datetime // Use 'datetime' here
        if (!dateTimeLostString || typeof dateTimeLostString !== 'string') {
            throw new Error("'datetime' is missing or not a valid string.")
        }

        console.log('datetime:', dateTimeLostString)

        const dateTimeLost = new Date(dateTimeLostString)

        if (isNaN(dateTimeLost.getTime())) {
            throw new Error("'datetime' is not a valid date string.")
        }

        console.log('Parsed datetime:', dateTimeLost)

        const sevenDaysAfterLost = new Date(dateTimeLost)
        sevenDaysAfterLost.setDate(dateTimeLost.getDate() + 7)

        const foundItemRef = collection(db, 'Found Item')

        // First query: Match by category and colour
        const q = query(
            foundItemRef,
            where('category', '==', formData.category), // Query by category only
            where('colour', '==', formData.color), // Query by colour too
        )

        console.log('Firestore query (category & colour):', q)

        const querySnapshot = await getDocs(q)

        let results = []

        // If no items found by both category and colour, proceed with category only
        if (querySnapshot.empty) {
            console.log('No items found matching category and colour. Trying category only...')
            // Perform the query for category only
            const categoryQuery = query(foundItemRef, where('category', '==', formData.category))

            const categorySnapshot = await getDocs(categoryQuery)

            // If still no items found, just return
            if (categorySnapshot.empty) {
                console.log('No items found matching category alone.')
                return []
            }

            // Check descriptions for items found by category alone
            categorySnapshot.forEach((doc) => {
                const docData = doc.data()

                // Handle description comparison
                let descriptionMatch = true // Default to true if no description/brand comparison is needed

                const lostDescriptionWords = formData.description?.toLowerCase().match(/\b\w+\b/g) || []
                const lostSet = new Set(lostDescriptionWords)

                const lostBrandWords = formData.brand?.toLowerCase().match(/\b\w+\b/g) || []
                const lostBrandSet = new Set(lostBrandWords)

                let descMatched = false
                let brandMatched = false

                if (docData.description) {
                    const foundDescriptionWords = docData.description.toLowerCase().match(/\b\w+\b/g) || []
                    const foundDescSet = new Set(foundDescriptionWords)
                    descMatched = [...lostSet].some((word) => foundDescSet.has(word))
                }

                if (docData.brand) {
                    const foundBrandWords = docData.brand.toLowerCase().match(/\b\w+\b/g) || []
                    const foundBrandSet = new Set(foundBrandWords)
                    brandMatched = [...lostBrandSet].some((word) => foundBrandSet.has(word))
                }

                descriptionMatch = descMatched || brandMatched

                // Check if the date is within 7 days
                let dateTimeFound = docData.date_time_found
                if (dateTimeFound && dateTimeFound.toDate) {
                    dateTimeFound = dateTimeFound.toDate()
                } else {
                    dateTimeFound = new Date(dateTimeFound)
                }

                const timeDiff = Math.abs(dateTimeFound - dateTimeLost)
                const diffInDays = timeDiff / (1000 * 60 * 60 * 24)

                if (diffInDays <= 7 && descriptionMatch) {
                    console.log('Found matching document (category only):', doc.id, docData)
                    results.push({ id: doc.id, ...docData })
                }
            })
        } else {
            // Handle the case where category and colour match
            querySnapshot.forEach((doc) => {
                const docData = doc.data()

                let dateTimeFound = docData.date_time_found
                if (dateTimeFound && dateTimeFound.toDate) {
                    dateTimeFound = dateTimeFound.toDate()
                } else {
                    dateTimeFound = new Date(dateTimeFound)
                }

                let descriptionMatch = true // Default to true if no description comparison is needed
                if ((formData.category === 'others' || formData.category === 'Student Card') && docData.description) {
                    const lostDescriptionWords = formData.description?.toLowerCase().match(/\b\w+\b/g) || []
                    const foundDescriptionWords = docData.description?.toLowerCase().match(/\b\w+\b/g) || []

                    console.log('Lost description words:', lostDescriptionWords)
                    console.log('Found description words:', foundDescriptionWords)

                    // Check if any lost description word is in the found description
                    descriptionMatch = lostDescriptionWords.some((lostWord) => foundDescriptionWords.includes(lostWord))
                }

                // Apply 7 days rule (regardless of which date is earlier)
                const timeDiff = Math.abs(dateTimeFound - dateTimeLost)
                const diffInDays = timeDiff / (1000 * 60 * 60 * 24)

                if (docData.colour === formData.color && docData.claimed_status === 'Not Found Yet' && diffInDays <= 7 && descriptionMatch) {
                    console.log('Found matching document:', doc.id, docData)
                    results.push({ id: doc.id, ...docData })
                }
            })
        }

        console.log('Matching found items:', results)

        return results
    } catch (error) {
        console.error('Error finding matching items:', error)
        throw new Error('Unable to retrieve matching items. Please try again later.')
    }
}
