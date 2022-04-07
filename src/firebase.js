import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import {config} from "./KEYS";
firebase.initializeApp(config);

export const firestore = firebase.firestore();
export const FIELD_VALUE = firebase.firestore.FieldValue;
export const PROJECTS = firestore.collection("projects")
export const MILESTONES = firestore.collection("milestones")
export const NOTE = firestore.collection("note")
export const TASKS = firestore.collection("tasks")
export const USERS = firestore.collection("users")
export const MONEY = firestore.collection("money")

export default firebase;
