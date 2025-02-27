import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react';

// Data
import { companions } from '../../data/companions';

const ChatsListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const auth = getAuth();
        const db = getFirestore();
        const userId = auth.currentUser.uid;
        
        // Get chats from Firestore
        const chatsRef = collection(db, 'chats');
        const q = query(
          chatsRef, 
          where('userId', '==', userId),
          orderBy('lastMessageTime', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const chatsList = [];
        
        querySnapshot.forEach((doc) => {
          const chatData = doc.data();
          // Find companion details
          const companion = companions.find(c => c.id === chatData.companionId);
          if (companion) {
            chatsList.push({
              id: doc.id,
              companion,
              lastMessage: chatData.lastMessage,
              lastMessageTime: chatData.lastMessageTime.toDate(),
              unreadCount: chatData.unreadCount || 0
            });
          }
        });
        
        setChats(chatsList);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
    
    // Set up listener for when we come back to this screen
    const unsubscribe = navigation.addListener('focus', fetchChats);
    return unsubscribe;
  }, [navigation]);

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (diff < oneDay) {
      // Today, show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 2 * oneDay) {
      // Yesterday
      return 'Yesterday';
    } else {
      // Show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      className="flex-row items-center p-4 border-b border-secondary-light"
      onPress={() => navigation.navigate('Chat', { companion: item.companion, chatId: item.id })}
    >
      <Image 
        source={{ uri: item.companion.avatar }} 
        className="w-16 h-16 rounded-full"
      />
      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-text-default">{item.companion.name}</Text>
          <Text className="text-xs text-text-light">{formatTime(item.lastMessageTime)}</Text>
        </View>
        <Text 
          className={`text-sm ${item.unreadCount > 0 ? 'font-bold text-text-default' : 'text-text-light'}`}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
        {item.unreadCount > 0 && (
          <View className="bg-primary rounded-full h-6 w-6 items-center justify-center absolute right-0 top-0">
            <Text className="text-white text-xs font-bold">{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View className="flex-1 items-center justify-center p-8">
      <MessageCircle size={64} color="#FF69B4" />
      <Text className="text-xl font-bold text-text-default mt-4 text-center">No chats yet</Text>
      <Text className="text-text-light text-center mt-2">
        Start a conversation with one of our AI companions from the Profiles tab
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-light">
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyComponent}
      />
    </SafeAreaView>
  );
};

export default ChatsListScreen;