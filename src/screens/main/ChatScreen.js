import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { Send } from 'lucide-react';
import axios from 'axios';
import { XAI_API_KEY } from '@env';

// Utils
import { detectLanguage } from '../../utils/languageDetection';

const ChatScreen = ({ route, navigation }) => {
  const { companion, chatId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [isHinglish, setIsHinglish] = useState(false);
  
  const flatListRef = useRef(null);
  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser.uid;

  // Set the companion name as the header title
  useEffect(() => {
    navigation.setOptions({
      title: companion.name,
      headerRight: () => (
        <View className="flex-row items-center">
          <Text className="text-white mr-2">{userCredits} credits</Text>
        </View>
      )
    });
  }, [navigation, companion, userCredits]);

  // Fetch user credits
  useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        const userRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserCredits(doc.data().credits || 0);
          }
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error fetching user credits:', error);
      }
    };
    
    fetchUserCredits();
  }, [userId, db]);

  // Fetch or create chat
  useEffect(() => {
    let unsubscribe;
    
    const setupChat = async () => {
      try {
        let currentChatId = chatId;
        
        // If no chatId provided, check if a chat exists or create a new one
        if (!currentChatId) {
          const chatsRef = collection(db, 'chats');
          const q = query(
            chatsRef, 
            where('userId', '==', userId),
            where('companionId', '==', companion.id)
          );
          
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            // Chat exists
            currentChatId = querySnapshot.docs[0].id;
          } else {
            // Create new chat
            const newChatRef = await addDoc(chatsRef, {
              userId,
              companionId: companion.id,
              createdAt: serverTimestamp(),
              lastMessage: 'Start chatting...',
              lastMessageTime: serverTimestamp(),
              unreadCount: 0
            });
            currentChatId = newChatRef.id;
          }
          
          // Update navigation params with chatId
          navigation.setParams({ chatId: currentChatId });
        }
        
        // Listen for messages
        const messagesRef = collection(db, 'chats', currentChatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const messagesList = [];
          querySnapshot.forEach((doc) => {
            messagesList.push({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate() || new Date()
            });
          });
          
          setMessages(messagesList);
          setLoading(false);
          
          // Mark messages as read
          updateDoc(doc(db, 'chats', currentChatId), {
            unreadCount: 0
          });
        });
        
        // If it's a new chat, send welcome message
        if (messages.length === 0 && !loading) {
          sendAIResponse(currentChatId, true);
        }
      } catch (error) {
        console.error('Error setting up chat:', error);
        setLoading(false);
      }
    };
    
    setupChat();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatId, companion, userId, db, navigation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;
    
    if (userCredits <= 0) {
      alert('You need credits to send messages. Please purchase credits from the Credits tab.');
      return;
    }
    
    const currentChatId = route.params.chatId;
    const messageText = inputText.trim();
    setInputText('');
    setSending(true);
    
    try {
      // Detect language
      const detectedLanguage = detectLanguage(messageText);
      setIsHinglish(detectedLanguage === 'hinglish');
      
      // Add user message to Firestore
      const messagesRef = collection(db, 'chats', currentChatId, 'messages');
      await addDoc(messagesRef, {
        text: messageText,
        sender: 'user',
        timestamp: serverTimestamp()
      });
      
      // Update chat with last message
      await updateDoc(doc(db, 'chats', currentChatId), {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp()
      });
      
      // Deduct credit
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        credits: userCredits - 1
      });
      
      // Get AI response
      await sendAIResponse(currentChatId);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const sendAIResponse = async (chatId, isWelcome = false) => {
    try {
      // Get chat history for context
      const context = isWelcome 
        ? [] 
        : messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }));
      
      // Add user's latest message if not welcome message
      if (!isWelcome && inputText.trim()) {
        context.push({
          role: 'user',
          content: inputText.trim()
        });
      }
      
      // Create system message with companion personality
      const systemMessage = {
        role: 'system',
        content: `You are ${companion.name}, ${companion.description}. ${
          isHinglish ? 'Respond in Hinglish (mix of Hindi and English).' : 'Respond in English.'
        } ${isWelcome ? 'Send a friendly welcome message to start the conversation.' : ''}`
      };
      
      // Call AI API (this would normally be done via Cloud Functions for security)
      // For demo purposes, we're calling directly - in production, use Firebase Cloud Functions
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [systemMessage, ...context],
          max_tokens: 150,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${XAI_API_KEY}`
          }
        }
      );
      
      const aiMessage = response.data.choices[0].message.content.trim();
      
      // Add AI response to Firestore
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: aiMessage,
        sender: 'ai',
        timestamp: serverTimestamp()
      });
      
      // Update chat with last message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: aiMessage,
        lastMessageTime: serverTimestamp()
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add fallback message if AI fails
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'ai',
        timestamp: serverTimestamp()
      });
    }
  };

  const renderMessageItem = ({ item }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View 
        className={`flex-row my-1 mx-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <Image 
            source={{ uri: companion.avatar }} 
            className="w-8 h-8 rounded-full mr-2 mt-1"
          />
        )}
        <View 
          className={`p-3 rounded-2xl max-w-[80%] ${
            isUser 
              ? 'bg-primary rounded-tr-none' 
              : 'bg-white border border-secondary-light rounded-tl-none'
          }`}
        >
          <Text 
            className={isUser ? 'text-white' : 'text-text-default'}
          >
            {item.text}
          </Text>
          <Text 
            className={`text-xs mt-1 ${isUser ? 'text-white opacity-70' : 'text-text-light'}`}
          >
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FF69B4" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
        )}
        
        <View className="p-2 border-t border-secondary-light bg-white flex-row items-center">
          <TextInput
            className="flex-1 bg-background-light rounded-full px-4 py-2 mr-2"
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            className={`rounded-full p-2 ${
              inputText.trim() && !sending ? 'bg-primary' : 'bg-gray-300'
            }`}
            onPress={sendMessage}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;