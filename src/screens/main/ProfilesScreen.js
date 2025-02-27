import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Data
import { companions } from '../../data/companions';

const ProfilesScreen = ({ navigation }) => {
  const auth = getAuth();
  const db = getFirestore();
  
  const startChat = async (companion) => {
    try {
      const userId = auth.currentUser.uid;
      
      // Create a new chat
      const chatsRef = collection(db, 'chats');
      const newChatRef = await addDoc(chatsRef, {
        userId,
        companionId: companion.id,
        createdAt: serverTimestamp(),
        lastMessage: 'Start chatting...',
        lastMessageTime: serverTimestamp(),
        unreadCount: 0
      });
      
      // Navigate to chat screen
      navigation.navigate('Chats', {
        screen: 'Chat',
        params: { companion, chatId: newChatRef.id }
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  const renderCompanionItem = ({ item }) => (
    <TouchableOpacity 
      className="bg-white rounded-xl overflow-hidden shadow-sm m-2 w-[47%]"
      onPress={() => startChat(item)}
    >
      <Image 
        source={{ uri: item.avatar }} 
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-lg font-bold text-text-default">{item.name}</Text>
        <Text className="text-xs text-primary-dark">{item.age} • {item.location}</Text>
        <Text className="text-sm text-text-light mt-1" numberOfLines={2}>
          {item.shortDescription}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <View className="p-4">
        <Text className="text-2xl font-bold text-text-default">Meet Our Companions</Text>
        <Text className="text-text-light">Tap on a profile to start chatting</Text>
      </View>
      
      <FlatList
        data={companions}
        renderItem={renderCompanionItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
      />
    </SafeAreaView>
  );
};

export default ProfilesScreen;