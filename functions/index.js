const functions = require("firebase-functions");
const admin = require("firebase-admin")
admin.initializeApp()

const FIELD_VALUE = admin.firestore.FieldValue
const FIRESTORE = admin.firestore();

const USERS = FIRESTORE.collection('users')
const MILESTONES = FIRESTORE.collection('milestones')

exports.userCreated = functions.auth.user().onCreate(user => {
    return USERS.doc(user.uid).set({
        name: user.displayName,
        id: user.uid,
        created: FIELD_VALUE.serverTimestamp(),
        email: user.email
    })
})

const PM = FIRESTORE.collection('PM')
exports.projectDeleted = functions.firestore.document("PM/{project}").onDelete( (snapshot, context) => {
    let doc = snapshot.data();
    if (doc.type === 'task') return null;
    console.log('cleaning up', doc.type, doc.id)
    return PM.where(doc.type, '==', snapshot.id).get().then(docs => {
        if (docs.size>0){
            let batch = FIRESTORE.batch();
            docs.forEach(doc => batch.delete(PM.doc(doc.id)))
            return batch.commit().catch(e => console.error('Error Cleaning Project Data', e))
        } return null
    })
})