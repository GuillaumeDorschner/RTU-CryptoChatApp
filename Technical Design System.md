# **Technical Design System**

This technical design document provides a comprehensive overview of the project without requiring developers to dive into the code. It describes the software architecture, key workflows, and data handling in detail.

## **Overview**

The project is a secure real-time chat application using **ECDH** for key exchange and **AES** for message encryption. It stores user sessions via cookies and local storage, enabling seamless user experiences. Discussions are encrypted and can be deleted along with their associated keys. Users can view encryption keys as QR codes like for added flexibility.

### **Key Features**:

1. **User Authentication**:

   - Each user is assigned a unique ID upon login, stored in cookies.
   - Sessions persist across browser reloads unless manually cleared.

2. **Chat Management**:

   - Users can initiate chats by entering another user's ID.
   - Chat requests must be accepted before exchanging messages.
   - A list of ongoing chats is displayed on the left panel.

3. **Encryption**:

   - Each chat session uses its own **ECDH** key pair for secure key exchange and an **AES** key for message encryption.
   - chats info show associated keys. Encryption keys are displayed as colored QR codes for easy coparison.

## **Workflow**

### **1. User Initialization**

Users are assigned an ID upon their first connection, and sessions persist using browser cookies.

```mermaid
sequenceDiagram
    participant A as Alice (User)
    participant S as Server

    A-->>S: Connect to the server
    S-->>A: Return welcome page
    A-->>A: Does browser have cookie ID?
    Note over A: No
    A-->>A: Enter username
    A->>S: Send username
    S-->>S: Generate user ID and store in memory
    S-->>A: Return home page with ID
    Note over A: Yes
    A-->>A: Keep session active
    A-->>A: User connected
    A->>S: Open websocket connection
    S->>S: Store websocket connection in map
```

### **2. Key Exchange Workflow**

Securely exchange ECDH keys and establish an AES key for chat encryption. [Wikipedia](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie–Hellman)

```mermaid
sequenceDiagram
    participant A as Alice (User)
    participant S as Server
    participant B as Bob (User)

    Note over A,B: Key Exchange Phase
    A->>S: Send ECDH Public Key
    S-->>B: Relay Alice's ECDH Public Key
    B->>S: Send ECDH Public Key
    S-->>A: Relay Bob's ECDH Public Key
    A->>A: Compute Shared Secret with Bob's Public Key
    B->>B: Compute Shared Secret with Alice's Public Key
    A->>A: Derive AES Key from Shared Secret
    B->>B: Derive AES Key from Shared Secret
```

### **3. Messaging Workflow**

The server acts solely as a relay and does not decrypt (can't it's end to end encrypted) or store messages. Messages are securely encrypted and exchanged between users using AES. AES ensures message confidentiality by using a symmetric key derived from the ECDH shared secret

```mermaid
sequenceDiagram
    participant A as Alice (User)
    participant S as Server
    participant B as Bob (User)

    Note over A,B: Messaging Phase
    A->>S: Send encrypted message for Bob (via AES)
    S-->>B: Relay encrypted message for Bob (via AES)
    B->>B: Decrypt message using AES
    B->>S: Send encrypted message for Alice (via AES)
    S-->>A: Relay encrypted message for Alice (via AES)
    A->>A: Decrypt message using AES
```

## **Architecture**

### **Class Diagram: System Architecture**

This diagram outlines the key components of the system and their interactions.

```mermaid
classDiagram


    class Client {
        +sendMessage(message: String): void
        +receiveMessage(message: String): void
        +encryptMessage(message: String): String
        +decryptMessage(message: String): String
        +generateAESKey(): String
        +clearLocalStorage(): void
        +deleteChat(chatId: String): void
    }
    class ECDH {
        +generateKeyPair(): KeyPair
        +computeSharedKey(privateKey: String, publicKey: String): String
    }

    class KeyPair {
        +publicKey: String
        +privateKey: String
    }

    class Server {
        +generateUserId(username: String): String
        +relayPublicKey(senderId: String, recipientId: String, publicKey: String): void
        +relayEncryptedMessage(senderId: String, recipientId: String, encryptedMessage: String): void
        +clearUserSession(userId: String): void
    }

    class AES {
        +encrypt(data: String, key: String): String
        +decrypt(data: String, key: String): String
    }

    class ChatManager {
        +createChat(userId: String, recipientId: String): String
        +deleteChat(chatId: String): void
        +listChats(userId: String): Chat[]
    }

    class Chat {
        +chatId: String
        +messages: Message[]
        +encryptionKey: String
    }

    class Message {
        +senderId: String
        +content: String
        +timestamp: Date
    }

    Client --|> ECDH
    Client --|> AES
    Client --> ChatManager
    ChatManager --> Chat
    Chat --> Message
```

## **Storage Strategy**

- **Cookies**: Store the user's unique ID to persist sessions.
  - if clear the id / user / discution will be lost.
- **Local Storage**: Store chat discussions and their associated encryption key.
  - id discussions are deleted the chat and the key will be lost.
