const functions = require("firebase-functions");
const admin = require("firebase-admin")
admin.initializeApp()

const FIELD_VALUE = admin.firestore.FieldValue
const FIRESTORE = admin.firestore();
const USERS = FIRESTORE.collection('users')

exports.userCreated = functions.auth.user().onCreate(user => {
    return USERS.doc(user.uid).set({
        name: user.displayName,
        id: user.uid,
        created: FIELD_VALUE.serverTimestamp(),
        email: user.email
    })
})