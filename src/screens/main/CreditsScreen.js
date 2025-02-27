import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import * as InAppPurchases from 'expo-in-app-purchases';
import { CreditCard, Gift, Sparkles } from 'lucide-react';

const creditPackages = [
  { id: 'small_pack', title: '50 Credits', price: '$4.99', amount: 50 },
  { id: 'medium_pack', title: '150 Credits', price: '$9.99', amount: 150, popular: true },
  { id: 'large_pack', title: '500 Credits', price: '$24.99', amount: 500 },
  { id: 'mega_pack', title: '1200 Credits', price: '$49.99', amount: 1200, bestValue: true },
];

const CreditsScreen = () => {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  
  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser?.uid;

  // Fetch user credits
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) return;
        
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setCredits(userSnap.data().credits || 0);
          
          // Get purchase history if it exists
          const history = userSnap.data().purchaseHistory || [];
          setPurchaseHistory(history);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load your credits information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, db]);

  // Initialize in-app purchases
  useEffect(() => {
    const setupPurchases = async () => {
      try {
        await InAppPurchases.connectAsync();
        
        // Set up purchase listener
        InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
          if (responseCode === InAppPurchases.IAPResponseCode.OK) {
            results.forEach(purchase => {
              if (!purchase.acknowledged) {
                // Process the purchase
                processPurchase(purchase);
              }
            });
          } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
            console.log('User canceled the transaction');
          } else if (responseCode === InAppPurchases.IAPResponseCode.ERROR) {
            Alert.alert('Error', `There was an error with your purchase: ${errorCode}`);
          }
        });
        
        // Get available products (in a real app, you'd have actual product IDs)
        // await InAppPurchases.getProductsAsync([
        //   'small_pack', 'medium_pack', 'large_pack', 'mega_pack'
        // ]);
        
      } catch (error) {
        console.error('Error setting up in-app purchases:', error);
      }
    };
    
    setupPurchases();
    
    return () => {
      // Disconnect when component unmounts
      InAppPurchases.disconnectAsync();
    };
  }, []);

  const processPurchase = async (purchase) => {
    try {
      // Find the package that was purchased
      const packageInfo = creditPackages.find(pkg => pkg.id === purchase.productId);
      
      if (!packageInfo) {
        console.error('Unknown product purchased:', purchase.productId);
        return;
      }
      
      // Update user's credits in Firestore
      const userRef = doc(db, 'users', userId);
      
      // Get current user data
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        console.error('User document not found');
        return;
      }
      
      const userData = userSnap.data();
      const currentCredits = userData.credits || 0;
      const newCredits = currentCredits + packageInfo.amount;
      
      // Add to purchase history
      const purchaseRecord = {
        id: purchase.transactionId,
        productId: purchase.productId,
        date: new Date(),
        amount: packageInfo.amount,
        price: packageInfo.price
      };
      
      const history = userData.purchaseHistory || [];
      history.push(purchaseRecord);
      
      // Update Firestore
      await updateDoc(userRef, {
        credits: newCredits,
        purchaseHistory: history
      });
      
      // Update local state
      setCredits(newCredits);
      setPurchaseHistory(history);
      
      // Finish the transaction
      await InAppPurchases.finishTransactionAsync(purchase, true);
      
      Alert.alert('Success', `You've added ${packageInfo.amount} credits to your account!`);
    } catch (error) {
      console.error('Error processing purchase:', error);
      Alert.alert('Error', 'Failed to process your purchase. Please contact support.');
    }
  };

  const handlePurchase = async (packageId) => {
    try {
      setPurchasing(true);
      
      // In a real app, you would use actual in-app purchase here
      // await InAppPurchases.purchaseItemAsync(packageId);
      
      // For demo purposes, we'll simulate a purchase
      const packageInfo = creditPackages.find(pkg => pkg.id === packageId);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user's credits in Firestore
      const userRef = doc(db, 'users', userId);
      
      // Get current user data
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error('User document not found');
      }
      
      const userData = userSnap.data();
      const currentCredits = userData.credits || 0;
      const newCredits = currentCredits + packageInfo.amount;
      
      // Add to purchase history
      const purchaseRecord = {
        id: `demo-${Date.now()}`,
        productId: packageId,
        date: new Date(),
        amount: packageInfo.amount,
        price: packageInfo.price
      };
      
      const history = userData.purchaseHistory || [];
      history.push(purchaseRecord);
      
      // Update Firestore
      await updateDoc(userRef, {
        credits: newCredits,
        purchaseHistory: history
      });
      
      // Update local state
      setCredits(newCredits);
      setPurchaseHistory(history);
      
      Alert.alert('Success', `You've added ${packageInfo.amount} credits to your account!`);
    } catch (error) {
      console.error('Error purchasing credits:', error);
      Alert.alert('Error', 'Failed to complete your purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const renderCreditPackage = ({ item }) => (
    <TouchableOpacity 
      className={`bg-white rounded-xl p-4 mb-4 ${
        item.popular ? 'border-2 border-primary' : 
        item.bestValue ? 'border-2 border-yellow-400' : ''
      }`}
      onPress={() => handlePurchase(item.id)}
      disabled={purchasing}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-bold text-text-default">{item.title}</Text>
          <Text className="text-2xl font-bold text-primary mt-1">{item.price}</Text>
        </View>
        
        <View className="bg-background-light p-3 rounded-full">
          <CreditCard size={28} color="#FF69B4" />
        </View>
      </View>
      
      {item.popular && (
        <View className="bg-primary py-1 px-3 rounded-full absolute -top-2 -right-2">
          <Text className="text-white text-xs font-bold">POPULAR</Text>
        </View>
      )}
      
      {item.bestValue && (
        <View className="bg-yellow-400 py-1 px-3 rounded-full absolute -top-2 -right-2">
          <Text className="text-white text-xs font-bold">BEST VALUE</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFreeCredits = () => (
    <TouchableOpacity 
      className="bg-white rounded-xl p-4 mb-6 border border-dashed border-secondary"
      onPress={() => Alert.alert('Coming Soon', 'Daily rewards will be available in the next update!')}
    >
      <View className="flex-row items-center">
        <View className="bg-secondary-light p-3 rounded-full mr-4">
          <Gift size={24} color="#FF69B4" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-text-default">Daily Reward</Text>
          <Text className="text-text-light">Come back tomorrow for 5 free credits!</Text>
        </View>
        <Sparkles size={24} color="#FFD700" />
      </View>
    </TouchableOpacity>
  );

  const renderPurchaseHistory = () => {
    if (purchaseHistory.length === 0) {
      return null;
    }
    
    return (
      <View className="mt-6">
        <Text className="text-lg font-bold text-text-default mb-2">Purchase History</Text>
        {purchaseHistory.slice(0, 3).map((purchase, index) => (
          <View key={purchase.id} className="bg-white rounded-lg p-3 mb-2 flex-row justify-between">
            <View>
              <Text className="font-medium">{purchase.amount} Credits</Text>
              <Text className="text-xs text-text-light">
                {new Date(purchase.date.seconds * 1000).toLocaleDateString()}
              </Text>
            </View>
            <Text className="text-primary font-bold">{purchase.price}</Text>
          </View>
        ))}
        
        {purchaseHistory.length > 3 && (
          <TouchableOpacity className="items-center mt-2">
            <Text className="text-primary-dark">View all purchases</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-light">
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <View className="p-4 flex-1">
        <View className="items-center bg-white rounded-xl p-6 mb-6 shadow-sm">
          <Text className="text-text-light">Current Balance</Text>
          <View className="flex-row items-center">
            <Text className="text-4xl font-bold text-primary">{credits}</Text>
            <Text className="text-lg text-text-light ml-2">credits</Text>
          </View>
          
          <View className="w-full bg-background-light h-1 my-4 rounded-full" />
          
          <Text className="text-text-light text-center">
            1 credit = 1 message sent to any companion
          </Text>
        </View>
        
        {renderFreeCredits()}
        
        <Text className="text-xl font-bold text-text-default mb-4">Buy Credits</Text>
        
        <FlatList
          data={creditPackages}
          renderItem={renderCreditPackage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListFooterComponent={renderPurchaseHistory}
        />
      </View>
      
      {purchasing && (
        <View className="absolute inset-0 bg-black bg-opacity-30 justify-center items-center">
          <View className="bg-white p-6 rounded-xl items-center">
            <ActivityIndicator size="large" color="#FF69B4" />
            <Text className="mt-4 font-medium">Processing your purchase...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CreditsScreen;