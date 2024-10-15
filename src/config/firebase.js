import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signOut } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth/cordova";
import { collection, doc,getDocs,getFirestore, query, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyDLJ6TcB2r8igczXt9EUG3g7gCHnRSRdXw",
  authDomain: "chat-app-gs-e6c00.firebaseapp.com",
  projectId: "chat-app-gs-e6c00",
  storageBucket: "chat-app-gs-e6c00.appspot.com",
  messagingSenderId: "776696952908",
  appId: "1:776696952908:web:d38b6c12957e89c7911ce9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username,email,password) => {
   try{
    const res = await createUserWithEmailAndPassword(auth,email,password);
    const user = res.user;
    await setDoc(doc(db,"users",user.uid),{
    id:user.uid,
    username:username.toLowerCase(),
    email,
    name:"",
    avatar:"",
    bio:"Hey,  THere i am using chat app",
    lastSeen:Date.now()
 } )
   await setDoc(doc(db,"chats",user.uid),{
    chatsData:[]
   })

   }catch(error){
      console.error(error)
      toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}


const login = async (email,password) =>{
      try{
            await signInWithEmailAndPassword(auth,email,password);
      }catch(error){
           console.error(error);
           toast.error(error.code.split('/')[1].split('-').join(" "));
      }
}

const logout = async () =>{
  try{
   await  signOut(auth)

  }
  catch(error){
     console.error(error);
     toast.error(error.code.split('/')[1].split('-').join(" "));

  }
}

const resetPass = async (email) =>{
  if(!email)
    {
      toast.error('Enter your email');
      return null;

  }
  try{
    const userRef = collection(db,'users');
    const q = query(userRef,where("email","==",email));
    const querySnap = await getDocs(q);

    if(!querySnap.empty){
          await sendPasswordResetEmail(auth,email);
          toast.success("Reset Email Sent")
    }
          else{
            toast.error("Email doesn't exists")
          }
  }catch(error){
         console.error(error);
         toast.error(error.message)
  }
}


export {signup,login,logout,auth,db,resetPass}