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

const PM = FIRESTORE.collection('PM')
exports.projectUpdated = functions.firestore.document('PM/{project}').onUpdate( snapshot => {

    let doc = snapshot.after.data();
    // todo remember to show if milestone done or project archived, update all children
    let before = snapshot.before.get('users');
    let after = snapshot.after.get('users');

    console.log(before, after, doc)
    if (doc.type === 'task' || before===after ) return null;
    let updates = {};

    Object.keys(after).forEach(el => {
        updates['users.' + el] = after[el]
    })
    Object.keys(before).forEach(el => {
        if (!after[el]) {
            updates['users.' + el] = FIELD_VALUE.delete()
        }
    })

    console.log(updates)
    return PM.where(doc.type, '==', snapshot.after.id).get().then(docs => {
        if (docs.size>0){
            let batch = FIRESTORE.batch();
            docs.forEach(doc => batch.update(PM.doc(doc.id), updates))
            console.log(docs.size, docs.docs)
            return batch.commit().catch(e => console.error('Error Cleaning Project Data', e))
        } return null
    })
})
exports.projectDeleted = functions.firestore.document("PM/{project}").onDelete( (snapshot) => {
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

const UM = FIRESTORE.collection('UM')
const MM = FIRESTORE.collection('MM')

exports.userCreated = functions.firestore.document("UM/{user}").onCreate( (snapshot, context) => {
    let user = snapshot.data();
    if (user.email) return USERS.where('email', '==', user.email).get().then(docs => {
        if (docs.size>0){
            let id = docs.docs[0].data().id
            return UM.doc(user.id).update({user: id}).then(_ => console.log('Updated New User')).catch(e => console.error('Error Updating New User ID'))
        }
        return null;
    })
    return null;
})

exports.userDeleted = functions.firestore.document("UM/{user}").onDelete( (snapshot, context) => {
    let user = "users." + snapshot.data().user;
    return Promise.all([PM.orderBy(user).get(), MM.orderBy(user).get(), UM.orderBy(user).get()]).then(results => {
        let batch = FIRESTORE.batch();
        results.forEach((docs, i) => {
            if (docs.size>0){
                docs.forEach(doc => batch.update((i<1? PM: i<2? MM: UM).doc(doc.id), {[user]: FIELD_VALUE.delete()}))
            }
        })
        return batch.commit().catch(e => console.error('Error Cleaning Project Data', e))
    })
})
