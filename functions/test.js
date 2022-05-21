const admin = require("firebase-admin")

admin.initializeApp({
    apiKey: "AIzaSyDRtz2aBwnDGFq8t0yTR4yH4YjpGif-3S4",
    authDomain: "prowealthmanager.firebaseapp.com",
    projectId: "prowealthmanager"
})

const FIRESTORE = admin.firestore();
const PM = FIRESTORE.collection('MM')

PM.get().then(docs => {
    console.log(docs.size)
    let batch = FIRESTORE.batch();
    docs.forEach(doc => {
        let data = doc.data();
        if (data.users[0]){
            let users = {
                [data.users[0]]: 1
            }
            data.users.splice(1).forEach(user => users[user] = 3)
            console.log(data.id, data.name, users)
            batch.update(PM.doc(data.id), {users: users})
        }
    })
    batch.commit().catch(e => console.error(e))
})