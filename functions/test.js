const admin = require("firebase-admin")

admin.initializeApp({
    apiKey: "AIzaSyDRtz2aBwnDGFq8t0yTR4yH4YjpGif-3S4",
    authDomain: "prowealthmanager.firebaseapp.com",
    projectId: "prowealthmanager"
})

const FIRESTORE = admin.firestore();
const PM = FIRESTORE.collection('PM')
const MM = FIRESTORE.collection('MM')
const UM = FIRESTORE.collection('UM')

let user = {
    id: '19dFdFq6dFagcvAMZwIK',
    user: 'ZAarVUKOWtZM3zUgn51oLaqE9SM2'

}


UM.orderBy(`users.${user.user}`).get().then(docs => console.log('Users Shared', docs.size))
/*

return Promise.all([PM.where('users', 'array-contains', user.user).get(), MM.where('users', 'array-contains', user.user).get(), UM.where('users', 'array-contains', user.user).get()]).then(results => {
    let batch = FIRESTORE.batch();
    results.forEach((docs, i) => {
        console.log(i, 'found', docs.docs)
        // if (docs.size>0){ // todo fix this issue
        //     docs.forEach(doc => batch.update((i<1? PM: i<2? MM: UM).doc(doc.id), FIELD_VALUE.arrayRemove(user.user)))
        // }
    })
    return batch.commit().catch(e => console.error('Error Cleaning Project Data', e))
})*/
