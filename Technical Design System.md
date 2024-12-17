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
    A-->>A: Generate user ID
    Note over A: Yes
    A-->>A: Session restored
    A->>S: WebSocket on connect
    S->>S: Store in map (ID, WebSocket)
```

### **2. Key Exchange Workflow**

Securely exchange ECDH keys and establish an AES key for chat encryption. We will use the Curve 25519 for the ECDH key exchange, but we can specify any following curve (secp256k1, secp256r1, secp384r1, secp521r1).
At the end we get posiion of the key in the curve and we can generate the same key for both users. We will use only the x coordinate of the key (it's very common) and we will use it as the key for the AES encryption. Before using the shared secret we need to verify if the point does fall into the curve if so we will derive the key using a [KDF (Key Derivation Function)](https://en.wikipedia.org/wiki/Key_derivation_function) to make it more secure.

<p align="center">
<img src="./media/EC_anim.gif"/>
<p align="center" >Example of the Elliptic Curve</p>
</p>

For mmore information about the Elliptic-curve & Elliptic-curve Diffie–Hellman you can check [Wikipedia](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie–Hellman) and [RFC 4492](https://datatracker.ietf.org/doc/html/rfc4492).

Bellow is the sequence diagram of the key exchange workflow.

```mermaid
sequenceDiagram
    participant A as Alice (User)
    participant S as Server
    participant B as Bob (User)

    Note over A,B: Key Exchange Phase
    A->>A: Generate ECDH Key Pair
    A->>S: Send ECDH Public Key One
    S-->>B: Relay Alice's ECDH Public Key One
    B->>B: Generate ECDH Key Pair
    B->>S: Send ECDH Public Key Two
    S-->>A: Relay Bob's ECDH Public Key Two
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

#### Frontend

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
        +generateKeyPair(curveName: String = "curve25519"): KeyPair
        +computeSharedSecret(privateKey: String, publicKey: String, curveName: String = "curve25519"): String
        +deriveAESKey(sharedSecret: String, salt: String = "", info: String = ""): String
        +validatePublicKey(publicKey: String, curveName: String = "curve25519"): Boolean
    }

    class KeyPair {
        +publicKey: String
        +privateKey: String
    }


    class AES {
        +encrypt(data: String, key: String): String
        +decrypt(data: String, key: String): String
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

    client --|> ECDH
    client --|> AES
```

#### Backend

```mermaid
classDiagram
    class Server {
        +generateUserId(username: String): String
        +relayPublicKey(senderId: String, recipientId: String, publicKey: String): void
        +relayEncryptedMessage(senderId: String, recipientId: String, encryptedMessage: String): void
        +clearUserSession(userId: String): void
    }

    class WebSocket {
        +onConnect(userId: String): void
        +onMessage(userId: String, message: String): void
        +onDisconnect(userId: String): void
    }

    class Api {
        +createChat(userId: String, recipientId: String): void
        +deleteChat(userId: String, chatId: String): void
    }

    Server --|> WebSocket
    Server --|> Api
```

## **Storage Strategy**

- **Cookies**: Store the user's unique ID to persist sessions.
  - if clear the id / user / discution will be lost.
- **Local Storage**: Store chat discussions and their associated encryption key.
  - id discussions are deleted the chat and the key will be lost.
