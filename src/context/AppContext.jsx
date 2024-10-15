import { createContext, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();


const AppContextProvider = (props) => {


    const navigate = useNavigate();
    const [userData,setUserData] = useState(null);
    const [chatData,setChataData] = useState(null);
    const [messagesId,setMessagesId] = useState(null);
    const [messages,setMessages] = useState([]);
    const [chatUser,setChatUser] = useState(null);
    const [chatVisible,setChatVisible] = useState(false);

    const loadUserData = async (uid) => {
        try{
              const userRef = doc(db,'users',uid);
              const userSnap = await getDoc(userRef);
              const userData = userSnap.data();
              console.log("Loaded user data:", userData); // Ajoute ce log

              setUserData(userData);
              console.log("Current user ID:", userData ? userData.id : 'userData is null');  // Ajouté ici

              if(userData.avatar && userData.name){
                    navigate('/chat');
              }
              else{
                navigate('/profile')
              }
              await updateDoc(userRef,{
                lastSeen:Date.now()
              })
             const intervalId = setInterval(async ()=>{
                   if(auth.chatUser){
                    await updateDoc(userRef,{
                        lastSeen:Date.now()
                    })
                   }
              }, 60000);

              return () =>clearInterval(intervalId);
        }
        catch (error){

        }
    }

    useEffect(()=>{
         if(userData){
          const chatRef = doc(db,'chats',userData.id);
          const unSub = onSnapshot(chatRef,async (res) =>{
               const chatItems = res.data().chatsData;
            //    console.log(res.data());
               const tempData = [];
               for(const item of chatItems) {
                      const userRef = doc(db,'users',item.rId);
                      const userSnap = await getDoc(userRef);
                      const userData = userSnap.data();
                      tempData.push({...item,userData})
               }

               setChataData(tempData.sort((a,b)=>b.updateAt - a.updateAt))
          })
          return () =>{
            unSub();
          }
         }
    },[userData])


   const value = {
       userData,
       setUserData,
       chatData,
       setChataData,
       loadUserData,
       messages,
       setMessages,
       messagesId,
       setMessagesId,
       chatUser,
       setChatUser,
       chatVisible,
       setChatVisible
   }



   return (
    <AppContext.Provider value={value}>
         {props.children}
    </AppContext.Provider>
   )

}

export default AppContextProvider