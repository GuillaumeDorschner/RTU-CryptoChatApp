<div style="display: flex; justify-content: center; align-items: center; width: 500px; margin: 0 auto;">
    <img src="./img/guillaume.png" height=100 style="align-self: center;">
    <img alt="image" src="https://avatars.githubusercontent.com/u/98171103?v=4" height=100 style="align-self: center;">
    <div style="padding: 20px; text-align: center;">
        <h3 style="font-size: 16px;">CryptoChatApp</h3>
        <h3 style="font-size: 16px;">Guillaume Dorschner & Quentin Le Nestour</h3>
    </div>
    <img src="./img/rtu_logo.jpg" width="100" style="align-self: center;">
</div>

# Introduction

CryptoChatApp is a messaging application demonstrating cryptographic principles implemented from scratch. Without relying on external cryptographic libraries, it explores the fundamentals of **Elliptic-curve Diffie–Hellman** (asymmetric encryption) for key exchange and **AES** (symmetric encryption) for message security. Built using **React.js** and **Node.js**, the app supports real-time messaging through WebSocket. For more detailed information, check out the [diagram](#message-encryption-flow) section.

## Demo

![CryptoChatApp Demo](https://example.com/demo.gif)

## Getting Started

> **Note**: This project is for educational purposes and should not be used in production.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/GuillaumeDorschner/CryptoChatApp.git
   cd CryptoChatApp
   ```

2. Start the application with Docker:

   ```bash
   docker compose up
   ```

3. Open your browser and visit `http://localhost:3000`.

## Key Features

1. **ECDH**: Used to securely exchange the symmetric AES key between users.
2. **AES**: Ensures message confidentiality with fast and secure symmetric encryption.
3. **WebSocket**: Enables real-time communication without requiring user accounts.

## Message Encryption Flow

```mermaid
sequenceDiagram
    participant A as Alice (User)
    participant B as Bob (User)
    participant S as Server

    Note over A,S: ECDH Key Exchange Phase
        A->>S: ECDH Public Key
        S-->>B: Alice's ECDH Public Key
        B->>S: ECDH Public Key
        S-->>A: Bob's ECDH Public Key
        A->>A: Compute Shared Key with Bob's Public Key
        B->>B: Compute Shared Key with Alice's Public Key

    Note over A,B: AES Key Exchange Phase
        A->>A: Generate AES Symmetric Key
        A->>A: Encrypt AES Key with Bob's ECDH Public Key
        A->>B: Send Encrypted AES Key (relayed by Server)
        B->>B: Decrypt AES Key with ECDH Private Key

    Note over A,B: Messaging Phase
        A->>B: Message encrypted with AES
        B->>B: Decrypt Message with AES
        B->>A: Response encrypted with AES
```

For a detailed explanation of this project, refer to the [Technical Design System](./Technical%20Design%20System.md).

## Cryptographic Concepts

### Why Use ECDH?

Elliptic-Curve Diffie-Hellman (ECDH) is chosen for its high security with smaller key sizes compared to RSA or traditional Diffie-Hellman, making it faster and more efficient.  
📹 [Watch: Elliptic Curve Cryptography Explained](https://youtu.be/NF1pwjL9-DE)

### What is AES?

AES (Advanced Encryption Standard) is a symmetric encryption algorithm widely used for its speed and security.  
📹 [Watch: AES Explained](https://youtu.be/O4xNJsjtN6E)

### Common Issues with ECC

ECC, while secure, has implementation challenges and requires careful attention to avoid side-channel attacks.  
📹 [Watch: Problems with ECC](https://youtu.be/nybVFJVXbww)

### Learn Cryptographic Basics

For an introduction to public and private key cryptography, check out this beginner-friendly explanation:  
📹 [Watch: Diffie-Hellman and ECC with Color Analogy](https://youtu.be/NmM9HA2MQGI)

## Technology Stack

- **Frontend**: React.js
- **Backend**: Node.js
- **Real-time Messaging**: WebSocket (via `ws`)
- **Custom Cryptography**: ECDH and AES implemented manually.

## License

This project is licensed under the MIT License.
