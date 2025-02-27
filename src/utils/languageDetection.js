// A simple utility to detect if text is in Hinglish (mix of Hindi and English)
// This is a basic implementation - in a production app, you'd use a more sophisticated NLP approach

export const detectLanguage = (text) => {
  // Common Hindi words and patterns that might appear in Hinglish text
  const hindiPatterns = [
    /kya/i, /hai/i, /hain/i, /main/i, /tum/i, /aap/i, /mujhe/i, /tumhe/i, 
    /humko/i, /unko/i, /kaise/i, /kyun/i, /matlab/i, /accha/i, /theek/i,
    /nahi/i, /nahin/i, /bilkul/i, /bahut/i, /thoda/i, /jyada/i, /kam/i,
    /pyaar/i, /dost/i, /yaar/i, /bhai/i, /didi/i, /mummy/i, /papa/i,
    /karo/i, /karenge/i, /karoge/i, /karunga/i, /karungi/i,
    /ho/i, /tha/i, /thi/i, /hoga/i, /hogi/i, /raha/i, /rahi/i,
    /mera/i, /meri/i, /tumhara/i, /tumhari/i, /uska/i, /uski/i,
    /hamara/i, /hamari/i, /unka/i, /unki/i
  ];
  
  // Check if the text contains Hindi patterns
  const containsHindiPatterns = hindiPatterns.some(pattern => pattern.test(text));
  
  // Check if the text also contains English words
  // This is a very basic check - just looking for common English words
  const containsEnglish = /\b(the|is|are|was|were|have|has|had|will|would|can|could|should|may|might|must|and|or|but|if|then|than|that|this|these|those|it|its|there|their|they|them|he|she|his|her|him|you|your|we|our|us|my|mine|me|i|am)\b/i.test(text);
  
  // If text contains both Hindi patterns and English words, it's likely Hinglish
  if (containsHindiPatterns && containsEnglish) {
    return 'hinglish';
  }
  
  // If it contains Hindi patterns but not clearly English, still consider it Hinglish
  if (containsHindiPatterns) {
    return 'hinglish';
  }
  
  // Default to English
  return 'english';
};