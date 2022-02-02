import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import {config} from "./KEYS";
firebase.initializeApp(config);

export const firestore = firebase.firestore();
export const FIELD_VALUE = firebase.firestore.FieldValue;
export const PROJECT = firestore.collection("project")
export const NOTE = firestore.collection("note")
export const TASK = firestore.collection("task")
export const MONEY = firestore.collection("money")

export default firebase;
