import {
  Horizon,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  BASE_FEE,
  Memo,
} from "@stellar/stellar-sdk";
import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

export const server = new Horizon.Server(HORIZON_URL);

export interface WalletInfo {
  publicKey: string;
  network: string;
}

export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false;

    // Do NOT rely on window.freighterApi injection (can be unavailable in some setups)
    // and instead probe Freighter through its API bridge.
    const connected = await isConnected();
    if (!connected.error) return true;

    const allowed = await isAllowed();
    if (!allowed.error) return true;

    const errorText = `${connected.error?.message || ""} ${allowed.error?.message || ""}`.toLowerCase();
    return !errorText.includes("not installed") && !errorText.includes("extension");
  } catch {
    return false;
  }
}

export async function connectWallet(): Promise<WalletInfo> {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    throw new Error("Unable to reach Freighter. Open the Freighter extension and try connecting again.");
  }

  const allowedResult = await isAllowed();
  if (allowedResult.error) {
    throw new Error(allowedResult.error);
  }

  if (!allowedResult.isAllowed) {
    const accessResult = await requestAccess();
    if (accessResult.error) {
      throw new Error(accessResult.error);
    }
  }

  const addressResult = await getAddress();
  if (addressResult.error || !addressResult.address) {
    throw new Error(addressResult.error || "Wallet address not available. Please unlock Freighter and try again.");
  }

  const networkResult = await getNetwork();
  if (networkResult.error) {
    throw new Error(networkResult.error);
  }

  if (networkResult.networkPassphrase !== NETWORK_PASSPHRASE) {
    throw new Error("Please switch Freighter to TESTNET and try again.");
  }

  return {
    publicKey: addressResult.address,
    network: "TESTNET",
  };
}

export async function getAccountBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (b: any) => b.asset_type === "native"
    );
    return nativeBalance ? nativeBalance.balance : "0";
  } catch {
    return "0";
  }
}

export async function sendPayment(
  senderPublicKey: string,
  destinationPublicKey: string,
  amountXLM: string
): Promise<{ hash: string; success: boolean }> {
  // Load sender account
  const senderAccount = await server.loadAccount(senderPublicKey);

  // Build transaction
  const transaction = new TransactionBuilder(senderAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: destinationPublicKey,
        asset: Asset.native(),
        amount: amountXLM,
      })
    )
    .addMemo(Memo.text("StellarSplit"))
    .setTimeout(180)
    .build();

  // Sign with Freighter
  const xdr = transaction.toXDR();
  const signResult = await signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: senderPublicKey,
  });

  if (signResult.error) {
    throw new Error(signResult.error);
  }

  // Submit the signed transaction
  const signedXdr = signResult.signedTxXdr;
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const result = await server.submitTransaction(tx);

  return {
    hash: (result as any).hash,
    success: true,
  };
}

export function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function getExplorerUrl(hash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}
