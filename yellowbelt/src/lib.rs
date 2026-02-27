#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror,
    Env, Address, Vec, Map
};

#[contract]
pub struct BillSplitContract;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Bill(u32),
    BillCounter,
}

#[contracterror]
#[derive(Copy, Clone, Eq, PartialEq)]
#[repr(u32)]
pub enum BillError {
    InvalidParticipants = 1,
    InvalidAmount = 2,
    DuplicateParticipant = 3,
    BillNotFound = 4,
    NotParticipant = 5,
    AlreadyPaid = 6,
    AlreadySettled = 7,
}

#[contracttype]
#[derive(Clone)]
pub struct Bill {
    pub creator: Address,
    pub total: i128,
    pub share: i128,
    pub participants: Vec<Address>,
    pub paid: Map<Address, bool>,
    pub settled: bool,
}

#[contractimpl]
impl BillSplitContract {
    pub fn create_bill(env: Env, creator: Address, total: i128, participants: Vec<Address>) -> Result<u32, BillError> {
        creator.require_auth();
        if participants.len() == 0 { return Err(BillError::InvalidParticipants); }
        if total <= 0 { return Err(BillError::InvalidAmount); }

        let mut unique_check: Map<Address, bool> = Map::new(&env);
        for addr in participants.iter() {
            if unique_check.contains_key(addr.clone()) {
                return Err(BillError::DuplicateParticipant);
            }
            unique_check.set(addr.clone(), true);
        }

        let share = total / participants.len() as i128;

        let mut paid_map: Map<Address, bool> = Map::new(&env);
        for addr in participants.iter() {
            paid_map.set(addr.clone(), false);
        }

        let mut id: u32 = env.storage().persistent().get(&DataKey::BillCounter).unwrap_or(0);
        id += 1;

        let bill = Bill {
            creator: creator.clone(),
            total,
            share,
            participants,
            paid: paid_map,
            settled: false,
        };

        env.storage().persistent().set(&DataKey::Bill(id), &bill);
        env.storage().persistent().set(&DataKey::BillCounter, &id);

        env.events().publish(("bill_created", id), total);
        Ok(id)
    }

    pub fn pay_bill(env: Env, bill_id: u32, payer: Address) -> Result<(), BillError> {
        payer.require_auth();

        let mut bill: Bill = env.storage().persistent().get(&DataKey::Bill(bill_id)).ok_or(BillError::BillNotFound)?;

        if bill.settled { return Err(BillError::AlreadySettled); }
        if !bill.paid.contains_key(payer.clone()) { return Err(BillError::NotParticipant); }
        if bill.paid.get(payer.clone()).unwrap_or(false) { return Err(BillError::AlreadyPaid); }

        bill.paid.set(payer.clone(), true);

        let mut all_paid = true;
        for addr in bill.participants.iter() {
            if !bill.paid.get(addr.clone()).unwrap_or(false) {
                all_paid = false;
                break;
            }
        }

        if all_paid {
            bill.settled = true;
            env.events().publish(("bill_settled", bill_id), true);
        }

        env.storage().persistent().set(&DataKey::Bill(bill_id), &bill);
        env.events().publish(("bill_paid", bill_id), payer);
        Ok(())
    }

    pub fn get_bill(env: Env, bill_id: u32) -> Result<Bill, BillError> {
        env.storage().persistent().get(&DataKey::Bill(bill_id)).ok_or(BillError::BillNotFound)
    }
}
