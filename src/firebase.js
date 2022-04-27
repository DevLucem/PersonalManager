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
    orderBy('created', 'desc')), callback)}
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
    assign('users', []);

    ['starting', 'ending'].forEach(value => data[value] = data[value] ? new Date(data[value]) : null)
    if (!data.users.includes(AUTH.currentUser.uid)) data.users = [AUTH.currentUser.uid, ...data.users]
    return setDoc(doc(DATA, data.id), data, {merge: true})
}

export const deleteData = data => {return deleteDoc(doc(DATA, data.id))}














/**
 * Task - a single item that is the simplest form of an action
 * id, created, name, description, tags, expiry, done, milestone, project, users, budget
 * */
const TASKS = collection(FIRESTORE, "tasks")
export const saveTask = (data) => {
    let task = {
        created: serverTimestamp(),
        id: doc(TASKS).id,
        ...data,
    }
    if (!task.users) task.users = [];
    if (!task.users.includes(AUTH.currentUser.uid)) task.users = [AUTH.currentUser.uid, ...task.users]
    return setDoc(doc(TASKS, task.id), task)
}

/**
 * Project - a set of several milestones
 * created, id, name, description, done, tags, paused, starting, expiry, users, budget
 * */
const PROJECTS = collection(FIRESTORE, "projects")
export const saveProject = (data) => {
    let project = {
        created: serverTimestamp(),
        id: doc(PROJECTS).id,
        ...data,
    }
    if (!project.users) project.users = [];
    if (!project.users.includes(AUTH.currentUser.uid)) project.users = [AUTH.currentUser.uid, ...project.users]
    return setDoc(doc(PROJECTS, project.id), project)
}

/**
 * Milestone - group your tasks together
 * created, id, name, description, done, tags, paused, starting, expiry, users, project
 * */
const MILESTONES = collection(FIRESTORE, "milestones")
export const saveMilestone = (data) => {
    let milestone = {
        created: serverTimestamp(),
        id: doc(MILESTONES).id,
        ...data,
    }
    if (!milestone.users) milestone.users = [];
    if (!milestone.users.includes(AUTH.currentUser.uid)) milestone.users = [AUTH.currentUser.uid, ...milestone.users]
    if (!milestone.project) return null;
    return setDoc(doc(MILESTONES, milestone.id), milestone)
}

/**
 * User - collaborators of your space
 * created, user, id, name, description, tags, users
 * */
const USERS = collection(FIRESTORE, "users")
export const saveUser = (data) => {
    let user = {
        created: serverTimestamp(),
        id: doc(USERS).id,
        ...data,
    }
    if (!user.users) user.users = [];
    if (!user.users.includes(AUTH.currentUser.uid)) user.users = [AUTH.currentUser.uid, ...user.users]
    return setDoc(doc(USERS, user.id), user)
}






