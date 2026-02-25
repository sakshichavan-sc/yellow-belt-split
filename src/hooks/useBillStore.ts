import { useState, useCallback } from "react";

export interface Participant {
  address: string;
  name: string;
  amountOwed: string;
  paid: boolean;
  txHash?: string;
}

export interface Bill {
  id: string;
  title: string;
  description: string;
  totalAmount: string;
  creatorAddress: string;
  recipientAddress: string;
  participants: Participant[];
  createdAt: number;
  status: "open" | "settled";
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

const STORAGE_KEY = "stellar_split_bills";

function loadBills(): Bill[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBills(bills: Bill[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

export function useBillStore() {
  const [bills, setBills] = useState<Bill[]>(loadBills);

  const addBill = useCallback(
    (bill: Omit<Bill, "id" | "createdAt" | "status">) => {
      const newBill: Bill = {
        ...bill,
        id: generateId(),
        createdAt: Date.now(),
        status: "open",
      };
      setBills((prev) => {
        const updated = [newBill, ...prev];
        saveBills(updated);
        return updated;
      });
      return newBill;
    },
    []
  );

  const markParticipantPaid = useCallback(
    (billId: string, participantAddress: string, txHash: string) => {
      setBills((prev) => {
        const updated = prev.map((bill) => {
          if (bill.id !== billId) return bill;
          const updatedParticipants = bill.participants.map((p) =>
            p.address === participantAddress
              ? { ...p, paid: true, txHash }
              : p
          );
          const allPaid = updatedParticipants.every((p) => p.paid);
          return {
            ...bill,
            participants: updatedParticipants,
            status: allPaid ? ("settled" as const) : ("open" as const),
          };
        });
        saveBills(updated);
        return updated;
      });
    },
    []
  );

  const refreshBills = useCallback(() => {
    setBills(loadBills());
  }, []);

  return { bills, addBill, markParticipantPaid, refreshBills };
}
