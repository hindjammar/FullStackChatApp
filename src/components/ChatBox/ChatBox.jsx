import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc,setDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'


const ChatBox = () => {

  const {userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext);

  const [input,setInput] = useState("");

  // Fonction pour créer le document de messages
  const createMessagesDocument = async (messagesId) => {
    try {
      const newDocRef = doc(db, 'messages', messagesId);
      await setDoc(newDocRef, {
        messages: [] // Assure-toi que le champ 'messages' est un tableau vide
      });
      console.log("Document créé avec succès :", messagesId);
    } catch (error) {
      console.error("Erreur lors de la création du document :", error);
    }
  };


  const sendMessage = async () =>{

    try{
      if (input && messagesId){
        await createMessagesDocument(messagesId); // Crée le document s'il n'existe pas


            await updateDoc(doc(db,'messages',messagesId),{
              messages: arrayUnion({
                sId:userData.id,
                text:input,
                createdAt:new Date()

              })
            })

            const userIDs = [chatUser.rId,userData.id];


            userIDs.forEach(async (id) =>{
              const userChatsRef = doc(db,'chats',id);
              const userChatsSnapshot = await getDoc(userChatsRef);

              if(userChatsSnapshot.exists()){
                    const userChatData = userChatsSnapshot.data();
                    const chatIndex = userChatData.chatsData.findIndex((c)=>c.messageId === messagesId);

                    if (chatIndex !== -1) {

                    userChatData.chatsData[chatIndex].lastMessage = input.slice(0,30);
                    userChatData.chatsData[chatIndex].updatedAt = Date.now();
                    if (userChatData.chatsData[chatIndex].rId === userData.id) {
                      userChatData.chatsData[chatIndex].messageSeen =  false;
                    }
                    await updateDoc(userChatsRef,{
                      chatsData:userChatData.chatsData
                    })
              }    
            }
            })
      }

    }catch(error){
     toast.error(error.message);
    }
    setInput("");
  }

  const convertTimestamp = (timestamp) =>{
          let date = timestamp.toDate();
          const hour = date.getHours();
          const minute = date.getMinutes();
          if(hour>12){
                return hour-12 + ":" + minute + "PM";
          }
          else{
            return hour + ":" + minute + "AM";
          }
  }

  useEffect(()=>{
      if(messagesId){
        const unSub = onSnapshot(doc(db,'messages',messagesId),(res)=>{
          if (res.exists()) {

            setMessages(res.data().messages.reverse())        }
        else {
          console.log("Document non trouvé");
        }
       } )   
        return () =>{
          unSub();
        }
      }
  }, [messagesId])

  return chatUser? (
    <div className='chat-box'>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>{chatUser.userData.name}<img className='dot' src={assets.green_dot} alt="" /></p>
        <img src={assets.help_icon} className='help' alt="" />
      </div>



   <div className="chat-msg">
        {messages.map((msg,index)=>{
          return (
           <div key={index} className={msg.sId === userData.id ? "s-msg" :"r-msg" }>
           <p className="msg">{msg.text}</p>
           <div>
             <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
             <p>{convertTimestamp(msg.createdAt)}</p>
           </div>
          </div>
          );
        })}
       

       
    </div>

      <div className="chat-input">
        <input onChange={(e)=>setInput(e.target.value)} value={input} type="text" placeholder='Send a message' />
        <input type="file" id='image' accept='image/png, image/jpeg' hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  )
  :<div className='chat-welcome'>
     <img src={assets.logo_icon} alt="" />
     <p>Chat anytime, anywhere</p>
  </div>
}

export default ChatBox
