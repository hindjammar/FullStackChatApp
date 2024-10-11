import { createContext, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();


const AppContextProvider = (props) => {


    const navigate = useNavigate();
    const [userData,setUserData] = useState(null);
    const [chatData,setChataData] = useState(null);

    const loadUserData = async (uid) => {
        try{
              const userRef = doc(db,'users',uid);
              const userSnap = await getDoc(userRef);
              const userData = userSnap.data();
              setUserData(userData);
              if(userData.avatar && userData.name){
                    navigate('/chat');
              }
              else{
                navigate('/profile')
              }
              await updateDoc(userRef,{
                lastSeen:Date.now()
              })
              setInterval(async ()=>{
                   if(auth.chatUser){
                    await updateDoc(userRef,{
                        lastSeen:Date.now()
                    })
                   }
              }, 60000);

              
        }
        catch (error){

        }
    }

    useEffect(()=>{
         if(userData){
          const chatRef = doc(db,'chats',userData.id);
          const unSub = onSnapshot(chatRef,async () =>{
               const chatItems = res.data().chatsData;
               console.log(res.data());
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
       loadUserData
   }



   return (
    <AppContext.Provider value={value}>
         {props.children}
    </AppContext.Provider>
   )

}

export default AppContextProvider