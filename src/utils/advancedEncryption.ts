/**
 * Advanced End-to-End Encryption Module
 * 
 * Implementuje zaawansowane szyfrowanie end-to-end z wykorzystaniem:
 * - Algorytmu AES-GCM 256-bit do szyfrowania wiadomości
 * - Algorytmu ECDH (Elliptic Curve Diffie-Hellman) do wymiany kluczy
 * - Algorytmu HKDF do derywacji kluczy
 * - Podpisów cyfrowych do weryfikacji autentyczności
 * - Mechanizmu Perfect Forward Secrecy
 */

// Funkcja do generowania pary kluczy ECDH
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-384'
    },
    true,
    ['deriveKey', 'deriveBits']
  );
}

// Funkcja do eksportowania klucza publicznego do formatu Base64
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('spki', publicKey);
  return arrayBufferToBase64(exported);
}

// Funkcja do importowania klucza publicznego z formatu Base64
export async function importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(publicKeyBase64);
  return await window.crypto.subtle.importKey(
    'spki',
    keyData,
    {
      name: 'ECDH',
      namedCurve: 'P-384'
    },
    true,
    []
  );
}

// Funkcja do derywacji wspólnego sekretu przy użyciu ECDH
export async function deriveSharedSecret(privateKey: CryptoKey, publicKey: CryptoKey): Promise<ArrayBuffer> {
  return await window.crypto.subtle.deriveBits(
    {
      name: 'ECDH',
      public: publicKey
    },
    privateKey,
    384
  );
}

// Funkcja do derywacji klucza szyfrującego z wspólnego sekretu przy użyciu HKDF
export async function deriveEncryptionKey(sharedSecret: ArrayBuffer, salt: ArrayBuffer, info: ArrayBuffer): Promise<CryptoKey> {
  // Najpierw importujemy wspólny sekret jako klucz
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    sharedSecret,
    { name: 'HKDF' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Następnie derywujemy klucz szyfrujący
  return await window.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-384',
      salt: salt,
      info: info
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Funkcja do szyfrowania wiadomości
export async function encryptMessage(message: string, encryptionKey: CryptoKey): Promise<{ciphertext: string, iv: string}> {
  // Generowanie losowego wektora inicjalizacyjnego (IV)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Konwersja wiadomości na ArrayBuffer
  const encoder = new TextEncoder();
  const messageData = encoder.encode(message);
  
  // Szyfrowanie wiadomości
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128
    },
    encryptionKey,
    messageData
  );
  
  // Konwersja zaszyfrowanych danych i IV do Base64
  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv)
  };
}

// Funkcja do deszyfrowania wiadomości
export async function decryptMessage(ciphertext: string, iv: string, encryptionKey: CryptoKey): Promise<string> {
  // Konwersja zaszyfrowanych danych i IV z Base64 do ArrayBuffer
  const ciphertextData = base64ToArrayBuffer(ciphertext);
  const ivData = base64ToArrayBuffer(iv);
  
  // Deszyfrowanie wiadomości
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivData,
      tagLength: 128
    },
    encryptionKey,
    ciphertextData
  );
  
  // Konwersja odszyfrowanych danych na string
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Funkcja do generowania podpisu cyfrowego
export async function signMessage(message: string, privateKey: CryptoKey): Promise<string> {
  // Konwersja wiadomości na ArrayBuffer
  const encoder = new TextEncoder();
  const messageData = encoder.encode(message);
  
  // Generowanie podpisu
  const signature = await window.crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-384' }
    },
    privateKey,
    messageData
  );
  
  // Konwersja podpisu do Base64
  return arrayBufferToBase64(signature);
}

// Funkcja do weryfikacji podpisu cyfrowego
export async function verifySignature(message: string, signature: string, publicKey: CryptoKey): Promise<boolean> {
  // Konwersja wiadomości na ArrayBuffer
  const encoder = new TextEncoder();
  const messageData = encoder.encode(message);
  
  // Konwersja podpisu z Base64 do ArrayBuffer
  const signatureData = base64ToArrayBuffer(signature);
  
  // Weryfikacja podpisu
  return await window.crypto.subtle.verify(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-384' }
    },
    publicKey,
    signatureData,
    messageData
  );
}

// Funkcja do generowania kluczy dla Perfect Forward Secrecy
export async function generateEphemeralKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-384'
    },
    true,
    ['deriveKey', 'deriveBits']
  );
}

// Funkcja do generowania losowego salt
export function generateSalt(): ArrayBuffer {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

// Funkcja do generowania losowego info dla HKDF
export function generateInfo(sender: string, recipient: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(`${sender}-to-${recipient}-${Date.now()}`);
}

// Funkcja pomocnicza do konwersji ArrayBuffer na Base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Funkcja pomocnicza do konwersji Base64 na ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Klasa do zarządzania sesją szyfrowania
export class EncryptionSession {
  private keyPair: CryptoKeyPair | null = null;
  private encryptionKey: CryptoKey | null = null;
  private remotePublicKey: CryptoKey | null = null;
  
  // Inicjalizacja sesji szyfrowania
  async initialize(): Promise<string> {
    // Generowanie pary kluczy
    this.keyPair = await generateKeyPair();
    
    // Eksportowanie klucza publicznego do wymiany
    return await exportPublicKey(this.keyPair.publicKey);
  }
  
  // Ustawienie klucza publicznego drugiej strony
  async setRemotePublicKey(publicKeyBase64: string): Promise<void> {
    this.remotePublicKey = await importPublicKey(publicKeyBase64);
    
    if (!this.keyPair) {
      throw new Error('Session not initialized');
    }
    
    // Derywacja wspólnego sekretu
    const sharedSecret = await deriveSharedSecret(this.keyPair.privateKey, this.remotePublicKey);
    
    // Generowanie salt i info
    const salt = generateSalt();
    const info = generateInfo('local', 'remote');
    
    // Derywacja klucza szyfrującego
    this.encryptionKey = await deriveEncryptionKey(sharedSecret, salt, info);
  }
  
  // Szyfrowanie wiadomości
  async encrypt(message: string): Promise<{ciphertext: string, iv: string}> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not established');
    }
    
    return await encryptMessage(message, this.encryptionKey);
  }
  
  // Deszyfrowanie wiadomości
  async decrypt(ciphertext: string, iv: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not established');
    }
    
    return await decryptMessage(ciphertext, iv, this.encryptionKey);
  }
  
  // Rotacja kluczy dla Perfect Forward Secrecy
  async rotateKeys(): Promise<string> {
    // Generowanie nowej pary kluczy
    this.keyPair = await generateKeyPair();
    
    if (!this.remotePublicKey) {
      throw new Error('Remote public key not set');
    }
    
    // Derywacja nowego wspólnego sekretu
    const sharedSecret = await deriveSharedSecret(this.keyPair.privateKey, this.remotePublicKey);
    
    // Generowanie nowego salt i info
    const salt = generateSalt();
    const info = generateInfo('local', 'remote');
    
    // Derywacja nowego klucza szyfrującego
    this.encryptionKey = await deriveEncryptionKey(sharedSecret, salt, info);
    
    // Eksportowanie nowego klucza publicznego do wymiany
    return await exportPublicKey(this.keyPair.publicKey);
  }
}