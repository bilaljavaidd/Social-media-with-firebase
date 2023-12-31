
import {
  storage, ref, uploadBytesResumable, doc,
  db, getDoc, auth, onAuthStateChanged, getDownloadURL, setDoc
} from "../firebase.Config.js";


const userName = document.getElementById('userName')
const firstName = document.getElementById('firstName')
const lastName = document.getElementById('lastName')
const emailAddress = document.getElementById('mobileNumber')
const profilePicture = document.getElementById('profilePicture')
const editBtn = document.getElementById('editBtn')
let currentLoggedInUser;


onAuthStateChanged(auth, (user) => {
  if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      console.log(uid)
      getUserData(uid)
      currentLoggedInUser = uid
      // ...
  } else {
      // User is signed out
      // ...
      // console.log("sign out")
      window.location.href = '../login/login.html'
  }
});

async function getUserData(uid) {
  try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          const { username: firstNameFromDB, surname: lastNameFromDB, email, userProfileName } = docSnap.data()
          userName.value =  userProfileName|| 'Set Profile name'
          firstName.value = firstNameFromDB
          lastName.value = lastNameFromDB
          emailAddress.value = email
      } else {
          // docSnap.data() will be undefined in this case
          console.log("No such document!");
      }
  } catch (error) {
      console.log(error, "==>>error in get User Data")
  }
}

editBtn.addEventListener('click', editProfileHandler )

function editProfileHandler(){
  // console.log(userName.value, firstName.value, lastName.value, emailAddress.value, profilePicture.files[0], "edit button working properly")
  const file = profilePicture.files[0]

   // Create the file metadata
    /** @type {any} */
    const metadata = {
      contentType: 'image/jpeg'
  };
  // Upload file and metadata to the object 'images/mountains.jpg'
  const storageRef = ref(storage, 'images/' + file.name);

    // Listen for state changes, errors, and completion of the upload.

  const uploadTask = uploadBytesResumable(storageRef, file, metadata);
  uploadTask.on('state_changed',
  (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
      switch (snapshot.state) {
          case 'paused':
              console.log('Upload is paused');
              break;
          case 'running':
              console.log('Upload is running');
              break;
      }
  },
  (error) => {
    // A full list of error codes is available at
    // https://firebase.google.com/docs/storage/web/handle-errors
    switch (error.code) {
        case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
        case 'storage/canceled':
            // User canceled the upload
            break;

        // ...

        case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
    }
},
() => {
  // Upload completed successfully, now we can get the download URL
  getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
      console.log('File available at', downloadURL);
      await setDoc(doc(db, "users", currentLoggedInUser), {
          username: firstName.value,
          surname: lastName.value,
          userProfileName: userName.value,
           email : emailAddress.value,
          profilePicture: downloadURL
      });
  });
}
);
setTimeout(()=>{

  window.location.href = "../dashboard/index.html"
},5000)

}