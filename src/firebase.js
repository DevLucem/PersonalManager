import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"
import {getFirestore, enableIndexedDbPersistence, onSnapshot, collection, query, where, serverTimestamp, doc, setDoc, deleteDoc, getDoc, orderBy} from 'firebase/firestore'
import { FIREBASE_CONFIG } from "./KEYS";

initializeApp(FIREBASE_CONFIG);

const AUTH = getAuth()
export const listenUser = (callback) => onAuthStateChanged(AUTH, callback)
export const logIn = () => {return signInWithPopup(AUTH, new GoogleAuthProvider())}
export const logOut = () => {return signOut(AUTH)}

const FIRESTORE = getFirestore()
enableIndexedDbPersistence(FIRESTORE).catch(e => console.log(e.code  === 'failed-precondition' ? 'Multiple Tabs Open' : 'Cant Cache ', e))

export const listenData = (path, callback) => {return onSnapshot(query(collection(FIRESTORE, path),
    where("users", "array-contains", AUTH.currentUser?.uid || "_public"),
    orderBy('created')), callback)}
export const updateData = (path, data) => {return setDoc(doc(FIRESTORE, path), data, {merge: true})}
export const getData = path => {return getDoc(doc(FIRESTORE, path))}


/** func Save Data
 * Milestone - group your tasks together
 * created, id, name, description, done, tags, paused, starting, expiry, users, project
 * */
const DATA = collection(FIRESTORE, "PM")
export const saveData = (data) => {

    if (!['type', 'name'].every(r => Object.keys(data).includes(r)))
        throw Error("Invalid values type and name")

    if (data.type==='milestone' && !['project'].every(r => Object.keys(data).includes(r)))
        throw Error("Invalid Milestone Data")

    const assign = (property, option) => {
        if (!data[property])
            data[property] = option;
    }

    assign('created', serverTimestamp());
    assign('id', doc(DATA).id);

    ['starting', 'ending'].forEach(value => data[value] = data[value] ? new Date(data[value]) : null)
    if (!data.users.includes(AUTH.currentUser.uid)) data.users = [AUTH.currentUser.uid, ...data.users]
    return setDoc(doc(DATA, data.id), data, {merge: true})
}
export const deleteData = data => {return deleteDoc(doc(DATA, data.id))}