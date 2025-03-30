<template>
    <h2 id="header">Similar Items Found</h2>
</template>

<script>
import { app, storage } from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import { ref, getDownloadURL } from 'firebase/storage'
import { collection, getDoc, doc, deleteDoc, updateDoc, arrayRemove } from 'firebase/firestore'
import 'primeicons/primeicons.css'

const db = getFirestore(app)

export default {}
</script>

<style>
#header {
    font-size: 3rem;
    color: #684545;
    text-align: center;
}
</style>
