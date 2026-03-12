// src/firebase/realtimeService.ts
import {
  ref,
  set,
  get,
  update,
  onValue,
  child,
  type Unsubscribe,
} from 'firebase/database';
import { rtdb } from './firebase';

// ══════════════════════════════════════
// TYPES
// ══════════════════════════════════════
export interface SlotData {
  batteryPercent: number;
  price: number;
  status: 'available' | 'rented' | 'empty';
}

export interface StationData {
  place: string;
  someoneWillPay: boolean;
  paymentMethod: string;
  coinSlot: number;
  whichSlot: string;
  payingUserId: string;
  slot1: SlotData;
  slot2: SlotData;
}

export interface RtdbUserData {
  firstName: string;
  lastName: string;
  creditPoints: number;
  barangay: string;
  municipality: string;
}

// ══════════════════════════════════════
// USER — Create user in RTDB (called during sign up)
// ══════════════════════════════════════
export const createRtdbUser = async (
  userId: string,
  data: {
    firstName: string;
    lastName: string;
    barangay: string;
    municipality: string;
  }
): Promise<void> => {
  await set(ref(rtdb, `users/${userId}`), {
    firstName: data.firstName,
    lastName: data.lastName,
    creditPoints: 0,
    barangay: data.barangay,
    municipality: data.municipality,
  });
  console.log('RTDB user created:', userId);
};

// ══════════════════════════════════════
// USER — Listen to credit points (real-time)
// ══════════════════════════════════════
export const listenToCreditPoints = (
  userId: string,
  callback: (credits: number) => void
): Unsubscribe => {
  const creditsRef = ref(rtdb, `users/${userId}/creditPoints`);

  return onValue(creditsRef, (snapshot) => {
    const credits = snapshot.val() ?? 0;
    callback(credits);
  });
};

// ══════════════════════════════════════
// USER — Get user data once
// ══════════════════════════════════════
export const getRtdbUser = async (
  userId: string
): Promise<RtdbUserData | null> => {
  const snapshot = await get(child(ref(rtdb), `users/${userId}`));
  if (snapshot.exists()) {
    return snapshot.val() as RtdbUserData;
  }
  return null;
};

// ══════════════════════════════════════
// USER — Update credit points
// ══════════════════════════════════════
export const updateCreditPoints = async (
  userId: string,
  newCredits: number
): Promise<void> => {
  await update(ref(rtdb, `users/${userId}`), {
    creditPoints: newCredits,
  });
};

// ══════════════════════════════════════
// STATION — Search station by ID
// ══════════════════════════════════════
export const getStation = async (
  stationId: string
): Promise<StationData | null> => {
  const snapshot = await get(child(ref(rtdb), `stations/${stationId}`));
  if (snapshot.exists()) {
    return snapshot.val() as StationData;
  }
  return null;
};

// ══════════════════════════════════════
// STATION — Listen to station (real-time)
// ══════════════════════════════════════
export const listenToStation = (
  stationId: string,
  callback: (data: StationData | null) => void
): Unsubscribe => {
  const stationRef = ref(rtdb, `stations/${stationId}`);

  return onValue(stationRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as StationData);
    } else {
      callback(null);
    }
  });
};

// ══════════════════════════════════════
// STATION — Listen to coin slot (real-time during payment)
// ══════════════════════════════════════
export const listenToCoinSlot = (
  stationId: string,
  callback: (coinAmount: number) => void
): Unsubscribe => {
  const coinRef = ref(rtdb, `stations/${stationId}/coinSlot`);

  return onValue(coinRef, (snapshot) => {
    const amount = snapshot.val() ?? 0;
    callback(amount);
  });
};

// ══════════════════════════════════════
// PAYMENT — Start coin slot payment
// App tells ESP32: "someone is about to pay"
// ══════════════════════════════════════
export const startCoinSlotPayment = async (
  stationId: string,
  slotName: string,
  userId: string
): Promise<void> => {
  await update(ref(rtdb, `stations/${stationId}`), {
    someoneWillPay: true,
    paymentMethod: 'coinSlot',
    whichSlot: slotName,
    coinSlot: 0,
    payingUserId: userId,
  });
  console.log('Coin slot payment started for', slotName);
};

// ══════════════════════════════════════
// PAYMENT — Finish coin slot payment
// Called when user taps "Done Paying"
// ══════════════════════════════════════
export const finishCoinSlotPayment = async (
  stationId: string,
  slotName: string,
  userId: string,
  coinInserted: number,
  price: number,
  currentCredits: number
): Promise<void> => {
  // Calculate change → goes to credit points
  const change = coinInserted - price;

  // Update station: reset payment state, mark slot as rented
  await update(ref(rtdb, `stations/${stationId}`), {
    someoneWillPay: false,
    paymentMethod: '',
    whichSlot: '',
    coinSlot: 0,
    payingUserId: '',
  });

  // Update slot status to rented
  await update(ref(rtdb, `stations/${stationId}/${slotName}`), {
    status: 'rented',
  });

  // If overpaid, add change to user's credit points
  if (change > 0) {
    await update(ref(rtdb, `users/${userId}`), {
      creditPoints: currentCredits + change,
    });
    console.log(`Change of ₱${change} added to credit points`);
  }

  console.log('Payment complete!');
};

// ══════════════════════════════════════
// PAYMENT — Cancel coin slot payment
// If user closes the payment modal
// ══════════════════════════════════════
export const cancelCoinSlotPayment = async (
  stationId: string
): Promise<void> => {
  await update(ref(rtdb, `stations/${stationId}`), {
    someoneWillPay: false,
    paymentMethod: '',
    whichSlot: '',
    coinSlot: 0,
    payingUserId: '',
  });
  console.log('Payment cancelled');
};

// ══════════════════════════════════════
// PAYMENT — Pay via credit points
// ══════════════════════════════════════
export const payWithCreditPoints = async (
  stationId: string,
  slotName: string,
  userId: string,
  price: number,
  currentCredits: number
): Promise<{ success: boolean; message: string }> => {
  // Check if user has enough credits
  if (currentCredits < price) {
    return {
      success: false,
      message: `Not enough credits. You have ₱${currentCredits} but need ₱${price}.`,
    };
  }

  // Deduct credits
  await update(ref(rtdb, `users/${userId}`), {
    creditPoints: currentCredits - price,
  });

  // Mark slot as rented
  await update(ref(rtdb, `stations/${stationId}/${slotName}`), {
    status: 'rented',
  });

  return {
    success: true,
    message: `Payment successful! ₱${price} deducted from credits.`,
  };
};
