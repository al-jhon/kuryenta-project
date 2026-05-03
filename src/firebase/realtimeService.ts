// src\firebase\realtimeService.ts

import { ref, set, get, update, onValue, child, type Unsubscribe } from 'firebase/database';
import { rtdb } from './firebase';

// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
// TYPES
// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
export interface SlotData {
  batteryPercent: number;
  price: number;
  status: 'available' | 'rented' | 'charging' | 'maintenance' | 'pending';
  onlineChecker?: string; // ← ADD THIS (e.g. "2026-03-12T18:30")
  isPresent?: boolean;
  isLocked?: boolean;
  isCharging?: boolean;
  rentedBy?: string;
  rentedByName?: string;
  rentedByPhone?: string;
  rentedAt?: string;
  returnBy?: string;
  pendingBy?: string;
  pendingSince?: string;
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
  phoneNumber: string;
  profilePictureUrl: string;
  creditPoints: number;
  barangay: string;
  municipality: string;
  strikes: number;
  isBanned: boolean;
  activeRental: ActiveRental | null;
}

export interface ActiveRental {
  stationId: string;
  slotName: string;
  rentedAt: string;
  returnBy: string;
  rentalId: string;
}

export interface RentalHistoryData {
  userId: string;
  userName: string;
  userPhone: string;
  profilePictureUrl: string;
  stationId: string;
  slotName: string;
  rentedAt: string;
  returnBy: string;
  returnedAt: string | null;
  paymentMethod: string;
  amountPaid: number;
  status: 'active' | 'returned';
  wasOverdue: boolean;
}

// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
// USER — Create user in RTDB on signup
// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
export const createRtdbUser = async (
  userId: string,
  data: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    barangay: string;
    municipality: string;
    profilePictureUrl: string;
  },
): Promise<void> => {
  await set(ref(rtdb, `users/${userId}`), {
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    profilePictureUrl: data.profilePictureUrl,
    creditPoints: 0,
    barangay: data.barangay,
    municipality: data.municipality,
    strikes: 0,
    isBanned: false,
    activeRental: null,
  });
};

export const listenToCreditPoints = (
  userId: string,
  callback: (credits: number) => void,
): Unsubscribe => {
  const creditsRef = ref(rtdb, `users/${userId}/creditPoints`);
  return onValue(creditsRef, (snapshot) => {
    callback(snapshot.val() ?? 0);
  });
};

export const getRtdbUser = async (userId: string): Promise<RtdbUserData | null> => {
  const snapshot = await get(child(ref(rtdb), `users/${userId}`));
  return snapshot.exists() ? (snapshot.val() as RtdbUserData) : null;
};

export const updateCreditPoints = async (userId: string, newCredits: number): Promise<void> => {
  await update(ref(rtdb, `users/${userId}`), { creditPoints: newCredits });
};

export const listenToActiveRental = (
  userId: string,
  callback: (rental: ActiveRental | null) => void,
): Unsubscribe => {
  const rentalRef = ref(rtdb, `users/${userId}/activeRental`);
  return onValue(rentalRef, (snapshot) => {
    callback(snapshot.val() as ActiveRental | null);
  });
};

export const checkIfBanned = async (userId: string): Promise<boolean> => {
  const snapshot = await get(ref(rtdb, `users/${userId}/isBanned`));
  return snapshot.val() === true;
};

export const getStation = async (stationId: string): Promise<StationData | null> => {
  const snapshot = await get(child(ref(rtdb), `stations/${stationId}`));
  return snapshot.exists() ? (snapshot.val() as StationData) : null;
};

export const listenToStation = (
  stationId: string,
  callback: (data: StationData | null) => void,
): Unsubscribe => {
  const stationRef = ref(rtdb, `stations/${stationId}`);
  return onValue(stationRef, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as StationData) : null);
  });
};

export const listenToCoinSlot = (
  stationId: string,
  callback: (coinAmount: number) => void,
): Unsubscribe => {
  const coinRef = ref(rtdb, `stations/${stationId}/coinSlot`);
  return onValue(coinRef, (snapshot) => {
    callback(snapshot.val() ?? 0);
  });
};

// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
// SLOT PENDING LOCK
// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
// Add this to realtimeService.ts
export const clearStalePendingSlots = async (stationId: string): Promise<void> => {
  const THREE_MINUTES = 3 * 60 * 1000;
  const now = Date.now();
  const slots = ['slot1', 'slot2'] as const;

  for (const slotName of slots) {
    const slotRef = ref(rtdb, `stations/${stationId}/${slotName}`);
    const snapshot = await get(slotRef);
    const slot = snapshot.val() as SlotData;

    if (slot?.status === 'pending' && slot?.pendingSince) {
      const age = now - new Date(slot.pendingSince).getTime();
      if (age >= THREE_MINUTES) {
        await update(slotRef, {
          status: 'available',
          pendingBy: '',
          pendingSince: '',
        });
      }
    }
  }
};

// Add this to realtimeService.ts
export const refundCoinsToCredits = async (
  stationId: string,
  slotName: string,
  userId: string,
  coinAmount: number,
  currentCredits: number,
): Promise<void> => {
  await update(ref(rtdb, `stations/${stationId}`), {
    someoneWillPay: false,
    paymentMethod: '',
    whichSlot: '',
    coinSlot: 0,
    payingUserId: '',
  });
  await update(ref(rtdb, `stations/${stationId}/${slotName}`), {
    status: 'available',
    pendingBy: '',
    pendingSince: '',
  });
  await update(ref(rtdb, `users/${userId}`), {
    creditPoints: currentCredits + coinAmount,
  });
};

// 1. Add to StationData interface
export interface StationData {
  place: string;
  someoneWillPay: boolean;
  paymentMethod: string;
  coinSlot: number;
  whichSlot: string;
  payingUserId: string;
  espReadyPay: boolean; // ← ADD THIS
  slot1: SlotData;
  slot2: SlotData;
}

// 2. Add this new function anywhere in the file
export const setEspReadyPay = async (stationId: string, value: boolean): Promise<void> => {
  await update(ref(rtdb, `stations/${stationId}`), { espReadyPay: value });
};

export const startCreditPointsPayment = async (
  stationId: string,
  slotName: string,
  userId: string,
): Promise<void> => {
  await update(ref(rtdb, `stations/${stationId}`), {
    someoneWillPay: true,
    paymentMethod: 'creditPoints',
    whichSlot: slotName,
    payingUserId: userId,
  });
};

export const lockSlotForPayment = async (
  stationId: string,
  slotName: string,
  userId: string,
): Promise<boolean> => {
  const slotRef = ref(rtdb, `stations/${stationId}/${slotName}`);
  const snapshot = await get(slotRef);
  const slot = snapshot.val() as SlotData;

  if (slot.status === 'pending') {
    // Auto-expire stale locks older than 3 minutes
    const pendingAge = slot.pendingSince
      ? Date.now() - new Date(slot.pendingSince).getTime()
      : Infinity;
    if (pendingAge < 3 * 60 * 1000) {
      return false; // still fresh, another user has it
    }
    // Stale lock — fall through and overwrite it
  } else if (slot.status !== 'available') {
    return false;
  }

  await update(slotRef, {
    status: 'pending',
    pendingBy: userId,
    pendingSince: new Date().toISOString(),
  });
  return true;
};

export const unlockSlotFromPayment = async (stationId: string, slotName: string): Promise<void> => {
  await update(ref(rtdb, `stations/${stationId}/${slotName}`), {
    status: 'available',
    pendingBy: '',
    pendingSince: '',
  });
};

export const startCoinSlotPayment = async (
  stationId: string,
  slotName: string,
  userId: string,
): Promise<void> => {
  await update(ref(rtdb, `stations/${stationId}`), {
    someoneWillPay: true,
    paymentMethod: 'coinSlot',
    whichSlot: slotName,
    coinSlot: 0,
    payingUserId: userId,
  });
};

export const finishCoinSlotPayment = async (
  stationId: string,
  slotName: string,
  userId: string,
  coinInserted: number,
  price: number,
  currentCredits: number,
  renterName: string,
  renterPhone: string,
  profilePictureUrl: string,
): Promise<void> => {
  const now = new Date();
  const returnBy = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const change = coinInserted - price;
  const rentalId = `rental_${Date.now()}`;

  // In realtimeService.ts — inside finishCoinSlotPayment
  await update(ref(rtdb, `stations/${stationId}`), {
    someoneWillPay: false,
    paymentMethod: '',
    whichSlot: '',
    coinSlot: 0,
    payingUserId: '',
    espReadyPay: false, // ← add this
  });

  await update(ref(rtdb, `stations/${stationId}/${slotName}`), {
    status: 'rented',
    isPresent: false,
    isLocked: true,
    isCharging: false,
    rentedBy: userId,
    rentedByName: renterName,
    rentedByPhone: renterPhone,
    rentedAt: now.toISOString(),
    returnBy: returnBy.toISOString(),
    pendingBy: '',
    pendingSince: '',
  });

  await update(ref(rtdb, `users/${userId}`), {
    creditPoints: currentCredits + change,
    activeRental: {
      stationId,
      slotName,
      rentedAt: now.toISOString(),
      returnBy: returnBy.toISOString(),
      rentalId,
    },
  });

  await set(ref(rtdb, `rentalHistory/${rentalId}`), {
    userId,
    userName: renterName,
    userPhone: renterPhone,
    profilePictureUrl,
    stationId,
    slotName,
    rentedAt: now.toISOString(),
    returnBy: returnBy.toISOString(),
    returnedAt: null,
    paymentMethod: 'coinSlot',
    amountPaid: price,
    status: 'active',
    wasOverdue: false,
  });
};

export const cancelCoinSlotPayment = async (stationId: string): Promise<void> => {
  await update(ref(rtdb, `stations/${stationId}`), {
    someoneWillPay: false,
    paymentMethod: '',
    whichSlot: '',
    coinSlot: 0,
    payingUserId: '',
    espReadyPay: false, // ← add this
  });
};

export const payWithCreditPoints = async (
  stationId: string,
  slotName: string,
  userId: string,
  price: number,
  currentCredits: number,
  renterName: string,
  renterPhone: string,
  profilePictureUrl: string,
): Promise<{ success: boolean; message: string }> => {
  if (currentCredits < price) {
    return {
      success: false,
      message: `Not enough credits. You have P${currentCredits} but need P${price}.`,
    };
  }

  const now = new Date();
  const returnBy = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const rentalId = `rental_${Date.now()}`;

  // ✅ STEP 1: Slot marked rented FIRST before ESP32 exits its loop
  await update(ref(rtdb, `stations/${stationId}/${slotName}`), {
    status: 'rented',
    isPresent: false,
    isLocked: true,
    isCharging: false,
    rentedBy: userId,
    rentedByName: renterName,
    rentedByPhone: renterPhone,
    rentedAt: now.toISOString(),
    returnBy: returnBy.toISOString(),
    pendingBy: '',
    pendingSince: '',
  });

  // ✅ STEP 2: NOW signal ESP32 that payment is done — slot is already "rented"
  await update(ref(rtdb, `stations/${stationId}`), {
    someoneWillPay: false,
    paymentMethod: '',
    whichSlot: '',
    coinSlot: 0,
    payingUserId: '',
    espReadyPay: false,
  });

  // ✅ STEP 3: User update last — no race condition here
  await update(ref(rtdb, `users/${userId}`), {
    creditPoints: currentCredits - price,
    activeRental: {
      stationId,
      slotName,
      rentedAt: now.toISOString(),
      returnBy: returnBy.toISOString(),
      rentalId,
    },
  });

  await set(ref(rtdb, `rentalHistory/${rentalId}`), {
    userId,
    userName: renterName,
    userPhone: renterPhone,
    profilePictureUrl,
    stationId,
    slotName,
    rentedAt: now.toISOString(),
    returnBy: returnBy.toISOString(),
    returnedAt: null,
    paymentMethod: 'creditPoints',
    amountPaid: price,
    status: 'active',
    wasOverdue: false,
  });

  return { success: true, message: `Payment successful! P${price} deducted from credits.` };
};

export const listenToUserRentalHistory = (
  userId: string,
  callback: (history: RentalHistoryData[]) => void,
): Unsubscribe => {
  const historyRef = ref(rtdb, 'rentalHistory');
  return onValue(historyRef, (snapshot) => {
    const data = snapshot.val() || {};
    const userHistory = Object.values(data as Record<string, RentalHistoryData>)
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.rentedAt).getTime() - new Date(a.rentedAt).getTime());
    callback(userHistory);
  });
};

// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
// ALERTS
// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
export interface AlertData {
  timeStamp: number; // Unix ms — e.g. 1714000000000
  content: string;
  view: boolean;
}

export interface AlertItem {
  id: string;
  data: AlertData;
}

export const listenToAlerts = (
  userId: string,
  callback: (alerts: AlertItem[]) => void,
): Unsubscribe => {
  const alertsRef = ref(rtdb, `users/${userId}/alerts`);
  return onValue(alertsRef, (snapshot) => {
    const raw = snapshot.val() || {};
    const alerts: AlertItem[] = Object.entries(raw as Record<string, AlertData>)
      .map(([id, data]) => ({ id, data }))
      .sort((a, b) => b.data.timeStamp - a.data.timeStamp); // newest first
    callback(alerts);
  });
};

export const markAlertAsViewed = async (userId: string, alertId: string): Promise<void> => {
  await update(ref(rtdb, `users/${userId}/alerts/${alertId}`), { view: true });
};

export const deleteAlert = async (userId: string, alertId: string): Promise<void> => {
  await set(ref(rtdb, `users/${userId}/alerts/${alertId}`), null);
};

export const deleteAllAlerts = async (userId: string): Promise<void> => {
  await set(ref(rtdb, `users/${userId}/alerts`), null);
};
