import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { connectWallet, getAccountBalance, type WalletInfo } from "@/lib/stellar";

interface WalletContextType {
  wallet: WalletInfo | null;
  balance: string;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<WalletInfo | null>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [balance, setBalance] = useState("0");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = useCallback(async () => {
    if (!wallet) return;
    const bal = await getAccountBalance(wallet.publicKey);
    setBalance(bal);
  }, [wallet]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    const timeoutMs = 20000;
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Wallet connection timed out. Open Freighter and try again.")), timeoutMs);
    });

    try {
      const info = await Promise.race([connectWallet(), timeoutPromise]);
      setWallet(info);
      const bal = await getAccountBalance(info.publicKey);
      setBalance(bal);
      return info;
    } catch (e: any) {
      setError(e.message || "Failed to connect wallet");
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    setBalance("0");
    setError(null);
  }, []);

  useEffect(() => {
    if (wallet) {
      const interval = setInterval(refreshBalance, 15000);
      return () => clearInterval(interval);
    }
  }, [wallet, refreshBalance]);

  return (
    <WalletContext.Provider value={{ wallet, balance, isConnecting, error, connect, disconnect, refreshBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be inside WalletProvider");
  return ctx;
}
