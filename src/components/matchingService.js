import { collection, getDocs, query, where, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { app } from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import 'primeicons/primeicons.css'
import { useUserStore } from '@/stores/user-store'

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

                    const lostSet = new Set(lostDescriptionWords)
                    const foundSet = new Set(foundDescriptionWords)

                    descriptionMatch = [...lostSet].some((word) => foundSet.has(word))

                    console.log('Description match (using Set):', descriptionMatch)
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
        // const userStore = useUserStore()
        // const user_id = userStore.userId
        // const filteredResults = results.filter(item => item.reporter_id != user_id);
        // return filteredResults

        return results
    } catch (error) {
        console.error('Error finding matching items:', error)
        throw new Error('Unable to retrieve matching items. Please try again later.')
    }
}

export async function findMatchingLostItems(formData) {
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
        sevenDaysAfterLost.setDate(dateTimeLost.getDate() - 7)

        const foundItemRef = collection(db, 'Lost Item')

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
                let dateTimeFound = docData.date_time_lost
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

                let dateTimeFound = docData.date_time_lost
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

                    const lostSet = new Set(lostDescriptionWords)
                    const foundSet = new Set(foundDescriptionWords)

                    descriptionMatch = [...lostSet].some((word) => foundSet.has(word))

                    console.log('Description match (using Set):', descriptionMatch)
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
        // const userStore = useUserStore()
        // const user_id = userStore.userId
        // const filtered = results.filter(item => item.reporter_id != user_id);
        // const arrayResult = filtered.map(item => item.lost_item_id)

        const arrayResult = results.map((item) => item.lost_item_id)

        console.log(arrayResult)
        for (let i = 0; i < arrayResult.length; i++) {
            if (arrayResult[i] == 'empty for now') {
                continue
            }
            const lostItemRef = doc(db, 'Lost Item', arrayResult[i])
            const lostItemSnap = await getDoc(lostItemRef)
            if (lostItemSnap.exists()) {
                const lostItemData = lostItemSnap.data()
                const email = lostItemData.email
                sendEmail(email, lostItemData)
            }
            console.log(arrayResult[i])
            await updateDoc(lostItemRef, {
                found_afterwards: true,
            })
        }

        return arrayResult
    } catch (error) {
        console.error('Error finding matching items:', error)
        throw new Error('Unable to retrieve matching items. Please try again later.')
    }
}

async function sendEmail(userEmail, data) {
    try {
        // Add a mail document to the "mail" collection so that your email service can process it
        const emailDate = data.date_time_lost.replace('T', ' ')
        console.log('ahh')
        console.log(data.lost_item_id)

        await addDoc(collection(db, 'mail'), {
            to: userEmail,
            message: {
                subject: 'Your lost item has found a potential match!',
                html: `Congratulations, we have found you a potential match for your lost item ${data.name} that was lost in ${data.location} on ${emailDate}!`,
            },
        })
        console.log(`Email queued for user: ${userEmail}`)
    } catch (error) {
        console.error('Error queuing email:', error)
    }
}
