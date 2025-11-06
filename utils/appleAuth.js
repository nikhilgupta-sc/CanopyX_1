import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

export const signInWithAppleAsync = async () => {
  try {
    const nonce = Math.random().toString(36).substring(2, 15);
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      nonce
    );

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    return {
      type: 'success',
      params: {
        id_token: credential.identityToken,
        access_token: credential.authorizationCode,
        nonce: nonce,
      },
    };
  } catch (error) {
    if (error.code === 'ERR_CANCELED') {
      // User canceled the sign-in
      return { type: 'cancel' };
    }
    console.error('Apple Sign In Error:', error);
    throw error;
  }
};