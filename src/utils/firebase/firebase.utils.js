import {initializeApp} from 'firebase/app';
import {getAuth, 
        signInWithRedirect, 
        signInWithPopup, 
        createUserWithEmailAndPassword, 
        signInWithEmailAndPassword, 
        GoogleAuthProvider, 
        signOut,
        onAuthStateChanged
        } from 'firebase/auth';
import {getFirestore, doc, getDoc, setDoc, collection, writeBatch, query, getDocs,} from 'firebase/firestore';   //'doc' is used get a documet from a collection, 'getDoc' and 'setDoc' is used to access and set the data on the document


//setting up firebase base configurations like, telling w/c database to work on and initializing it
const firebaseConfig = {
    apiKey: "AIzaSyBq7upSGDsTANlV8BUlg9SN0Pyp-3tpmD0",
    authDomain: "crown-closing-db.firebaseapp.com",
    projectId: "crown-closing-db",
    storageBucket: "crown-closing-db.appspot.com",
    messagingSenderId: "501509640897",
    appId: "1:501509640897:web:7c8f0c4921f739d3b07a40"
};
  
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const googleProvider = new GoogleAuthProvider();      //creating provider instance

googleProvider.setCustomParameters({
  prompt: "select_account"
});

//Authenticating user using signInWithPopup
export const auth = getAuth();     //storing and exporting auth instance
export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);     //Authenticating a user with his gmail with a pop up on the page.
export const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);  //Authenticating a user with his gmail by going to another page.

//storing users generated by the Authentication service in firestore(database).
export const db = getFirestore();     //creating database instance

export const addCollectionAndDocuments = async(collectionKey, objectsToAdd) => {  //we could have passed a 3rd argument of fields = 'title', to make it generic when calling docRef as docRef(collectionRef, object[fields].toLowerCase()) 
  
  const collectionRef = collection(db, collectionKey);   //calling a new collection from our database db, even if we have not yet created any collection, firestore will create an empty one & the collectionKey tells w/c collection we are looking for
  const batch = writeBatch(db);

  //creating documents for each objects passed from SHOP_DATA with document name of their respective title 
  objectsToAdd.forEach((object) => {
    const docRef = doc(collectionRef, object.title.toLowerCase());  // 'doc' gets a document from firestore, if it doesnt exist it creates empty one, so in a way we are creating a document on our collection with the objects title as its name
    batch.set(docRef, object);        //creating documents(in firestore) for each of the objects where the key of the document is their title and value is each object
  });

  await batch.commit();         //starts the writing
  console.log('done');
}


//helper functions are very useful b/c in the frontend world 3rd party codes or APIs( the ways we fetch, create, update) are often modified, when that happens we only need to modify our code only in the helper functions.
//helper function to fetch data(categories map in this case) from firestore. 
export const getCategoriesAndDocuments = async () => {      //its asynchronous function b/c we are making retrival from firebase
  const collectionRef = collection(db, 'categories');     //first we get the collection from our database(we named it db)
  const q = query(collectionRef);

  const querySnapshot = await getDocs(q);
  //querySnapshot.docs will give us an array of ind'l document snapshots i.e [hats doc, sneakers doc]
  const categoryMap = querySnapshot.docs.reduce((accum, docSnapshot) => {     //reduce method itterates through each element(document in this case) and gives back the accumulated object(documents in this case) 
    const { title, items} = docSnapshot.data();        //gives back title and item object from the each document
    accum[title.toLowerCase()] = items;               //remember object[key] = value...so we are setting items as the value to the title key 
    return accum;
  }, {})   

  return categoryMap;
}


export const createUserDocumetFromAuth = async (userAuth, additionalInformation={}) => {   // it takes the user property from the response object of the Auth service as a param
  if(!userAuth) return;                             //security feature, if unAuthorized sign in return null  
  
  const userDocRef = doc(db, 'users', userAuth.uid)   //creating a document(userDocRef) using 'doc' method to get a specific document from 'users' collection inside 'db' database. 'doc' takes 3 args, the database, the collection name, and a unique identifier of a particular document(id in this case)
  
  const userSnapshot = await getDoc(userDocRef)     //userSnapshot is an object contaning data(by using getDoc method) from a doc(userDocRef). userSnapshot is used just to check if there is data on the document('userDocRef' in this case)              
  console.log(userSnapshot.exists())               

  //if user data does not exist
  if(!userSnapshot.exists()) {
    const {displayName, email} = userAuth;         //displayName and email are some of the attributes returned by Auth service together with uid
    const createdAt = new Date();
    try{
      await setDoc(userDocRef, {displayName, email, createdAt, ...additionalInformation});   //if displayName is null, value from additionalInformation will overwrite it
    }
    catch(error) {
      console.log('error creating the user', error.message);
    }
  }
  
  //if user data exists
  return userDocRef;
}

//helper functions
export const createAuthUserWithEmailAndPassword = async(email, password) => {
  if(!email || !password) return;

  return await createUserWithEmailAndPassword(auth, email, password);
}

export const signInAuthWithEmailAndPassword = async(email, password) => {
  if(!email || !password) return;

  return await signInWithEmailAndPassword(auth, email, password);
}

export const signOutUser = async () => await signOut(auth);

export const onAuthStateChangedListner = (callback) => 
   onAuthStateChanged(auth, callback)    //runs the callback when the authentication state changes