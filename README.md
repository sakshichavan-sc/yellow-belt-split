# ⚡ Stellar Split

A decentralized bill-splitting dApp built on the **Stellar Testnet**. Create bills, add participants by their Stellar wallet addresses, and settle payments in **XLM** — fast, transparent, and on-chain.

---

## 🚀 Features

- **Freighter Wallet Integration** — Connect via the [Freighter](https://freighter.app) browser extension
- **Multi-Wallet Bill Splitting** — Add multiple participants with their Stellar public keys
- **On-Chain XLM Payments** — Transactions are signed via Freighter and submitted to the Stellar Testnet
- **Transaction Verification** — Every payment generates a hash with a link to [Stellar Expert](https://stellar.expert)
- **Real-Time Balance** — View your XLM balance and auto-refresh every 15 seconds
- **Bill Progress Tracking** — Visual progress bar showing paid vs pending participants
- **Local Persistence** — Bills are saved to localStorage so they persist across sessions
- **Custom Recipient Address** — Specify where payments should go (defaults to bill creator)

---

## Deployed link
https://vercel.com/sakshichavan-scs-projects/yellow-belt-split1/yqM8dtA7idwof38uVSGivGc3PNBB

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion |
| UI Components | shadcn/ui |
| Blockchain | Stellar Testnet (`@stellar/stellar-sdk` v13) |
| Wallet | Freighter (`@stellar/freighter-api` v6) |
| State | React hooks + localStorage |

---

## 📋 How It Works

### 1. Connect Wallet
Click **"Connect Freighter"** to link your Stellar testnet wallet via the Freighter browser extension.

### 2. Create a Bill
- Enter a bill title and total amount in XLM
- Optionally set a recipient address (where payments go) — defaults to your wallet
- Add participants with their **name** and **Stellar public key** (56 characters, starts with `G`)
- The total is automatically split equally among participants

### 3. Pay Your Share
- Each participant connects **their own Freighter wallet**
- When their wallet address matches a participant in the bill, a **"Pay Now"** button appears
- Clicking "Pay Now" triggers a Freighter signing prompt
- The signed transaction is submitted to the Stellar Testnet
- A transaction hash is generated with a link to Stellar Expert

### 4. Settlement
- Once all participants have paid, the bill status changes to **"Settled"** 
- All transaction hashes are stored and linked for verification

---

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (or [Bun](https://bun.sh/))
- [Freighter Wallet](https://freighter.app) browser extension installed
- Freighter configured to **Stellar Testnet**
- XLM funded via [Stellar Friendbot](https://friendbot.stellar.org/?addr=YOUR_ADDRESS)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd stellar-split

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🧪 Testing the Payment Flow

1. **Fund your wallet** — Use the [Stellar Friendbot](https://friendbot.stellar.org) to get 10,000 testnet XLM
2. **Create a bill** — Connect your wallet and create a bill
3. **Add yourself as a participant** — Use your own Stellar address as both creator and participant
4. **Pay your share** — The "Pay Now" button will appear next to your name
5. **Verify on-chain** — Click the external link icon to view the transaction on Stellar Expert

### Testing with multiple wallets
- Create multiple Freighter accounts (Settings → Add Account in Freighter)
- Fund each with Friendbot
- Add each account as a participant in a bill
- Switch between accounts in Freighter to pay each share

---

## 📁 Project Structure

```
src/
├── components/
│   ├── BillCard.tsx          # Bill display with payment actions
│   ├── CreateBillForm.tsx    # Bill creation form with participant management
│   ├── WalletConnect.tsx     # Freighter wallet connection UI
│   └── ui/                   # shadcn/ui components
├── hooks/
│   ├── useBillStore.ts       # Bill state management & localStorage persistence
│   └── useWallet.tsx         # Wallet context provider & Freighter integration
├── lib/
│   ├── stellar.ts            # Stellar SDK utilities (connect, pay, balance)
│   └── utils.ts              # General utilities
├── pages/
│   └── Index.tsx             # Main application page
└── index.css                 # Global styles & design tokens
```

---

## 🔑 Key Stellar Functions

| Function | Description |
|----------|-------------|
| `connectWallet()` | Connects to Freighter and retrieves the public key |
| `getAccountBalance()` | Fetches XLM balance from Horizon Testnet |
| `sendPayment()` | Builds, signs (via Freighter), and submits a payment transaction |
| `getExplorerUrl()` | Returns a Stellar Expert link for a transaction hash |

---

## ⚠️ Important Notes

- This app runs on **Stellar Testnet only** — no real funds are used
- Freighter must be set to **Test Network** in its settings
- Bills are stored in **localStorage** — clearing browser data will remove them
- Each participant must connect their **own wallet** to pay their share
- The recipient address receives all payments from participants

---

## Screenshots
### Verify Transaction
![Verify Transaction](screenshots/verify%20transaction.png)

### Payment Message
![Payment Message](screenshots/payment%20message.png)

### Wallet Connect
![Wallet Connect](screenshots/wallet%20connect.png)

### Contract Deployment
![Contract Deployment](screenshots/contract%20deployment.png)
## 📄 License

MIT
