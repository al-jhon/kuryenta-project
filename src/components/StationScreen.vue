<!-- src\components\StationScreen.vue -->

<template>
  <div class="station-container">
    <!-- HEADER -->
    <div class="station-header">
      <button class="back-btn" @click="goBack">←</button>
      <h2 class="station-title">Station {{ stationId }}</h2>
      <div style="width: 40px"></div>
    </div>

    <!-- BANNED USER WARNING -->
    <div v-if="isUserBanned" class="banned-notice">
      Your account has been banned. You cannot rent.
    </div>

    <!-- ACTIVE RENTAL NOTICE -->
    <div v-if="activeRental && !isUserBanned" class="active-rental-notice">
      <p>You have an active rental!</p>
      <p class="rental-detail">
        Station {{ activeRental.stationId }} • {{ activeRental.slotName }} • Return by
        {{ formatDate(activeRental.returnBy) }}
      </p>
    </div>

    <!-- STATION INFO -->
    <div v-if="station" class="station-content">
      <p class="station-place">{{ station.place }}</p>
      <div class="slots-container">
        <!-- SLOT 1 -->
        <div
          class="slot-card"
          :class="station.slot1.status"
          @click="selectSlot('slot1', station.slot1)"
        >
          <h3>Slot 1</h3>
          <div class="battery-bar">
            <div
              class="battery-fill"
              :style="{ width: station.slot1.batteryPercent + '%' }"
              :class="getBatteryColor(station.slot1.batteryPercent)"
            ></div>
          </div>
          <p class="battery-text">{{ station.slot1.batteryPercent }}%</p>
          <p class="slot-price">P{{ station.slot1.price }}</p>
          <p class="slot-status" :class="station.slot1.status">
            {{ formatStatus(station.slot1.status) }}
          </p>
          <p v-if="station.slot1.status === 'rented'" class="renter-label">
            {{ station.slot1.rentedByName || 'Rented' }}
          </p>
        </div>

        <!-- SLOT 2 -->
        <div
          class="slot-card"
          :class="station.slot2.status"
          @click="selectSlot('slot2', station.slot2)"
        >
          <h3>Slot 2</h3>
          <div class="battery-bar">
            <div
              class="battery-fill"
              :style="{ width: station.slot2.batteryPercent + '%' }"
              :class="getBatteryColor(station.slot2.batteryPercent)"
            ></div>
          </div>
          <p class="battery-text">{{ station.slot2.batteryPercent }}%</p>
          <p class="slot-price">P{{ station.slot2.price }}</p>
          <p class="slot-status" :class="station.slot2.status">
            {{ formatStatus(station.slot2.status) }}
          </p>
          <p v-if="station.slot2.status === 'rented'" class="renter-label">
            {{ station.slot2.rentedByName || 'Rented' }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="loading"><p>Loading station...</p></div>

    <!-- SLOT INFO MODAL -->
    <div v-if="selectedSlot" class="modal-overlay" @click.self="closeSlotInfo">
      <div class="modal-card">
        <h3>{{ selectedSlotName === 'slot1' ? 'Slot 1' : 'Slot 2' }}</h3>
        <div class="modal-info">
          <p>Battery: {{ selectedSlot.batteryPercent }}%</p>
          <p>Price: P{{ selectedSlot.price }}</p>
          <p>Return within: 12 hours</p>
        </div>
        <div class="payment-buttons">
          <!-- Coin slot button is disabled while ESP32 is busy serving another user -->
          <button
            class="pay-btn coin-btn"
            :class="{ 'btn-busy': isCoinSlotBusy }"
            :disabled="isCoinSlotBusy"
            @click="startCoinPayment"
          >
            {{ isCoinSlotBusy ? 'Coin Slot Busy...' : 'Pay via Coin Slot' }}
          </button>
          <button class="pay-btn credit-btn" @click="startCreditPayment">
            Pay via Credit Points (P{{ userCredits }} available)
          </button>
        </div>
        <button class="cancel-btn" @click="closeSlotInfo">Cancel</button>
      </div>
    </div>

    <!-- ESP32 WAITING / LOADING MODAL -->
    <div v-if="isWaitingForEsp" class="modal-overlay">
      <div class="modal-card">
        <!-- BEFORE: <h3>Preparing Coin Slot</h3> -->
        <h3>
          {{ pendingPaymentMethod === 'creditPoints' ? 'Preparing Slot' : 'Preparing Coin Slot' }}
        </h3>
        <div class="esp-loading-wrapper">
          <div class="esp-spinner"></div>
          <!-- BEFORE: <p class="esp-loading-text">Station is getting ready to accept coins...</p> -->
          <p class="esp-loading-text">
            {{
              pendingPaymentMethod === 'creditPoints'
                ? 'Station is unlocking your slot...'
                : 'Station is getting ready to accept coins...'
            }}
          </p>
          <div class="esp-timeout-bar-track">
            <div
              class="esp-timeout-bar-fill"
              :class="{ warning: espTimeout <= 15, critical: espTimeout <= 5 }"
              :style="{ width: (espTimeout / 30) * 100 + '%' }"
            ></div>
          </div>
          <p
            class="esp-timeout-label"
            :class="{ warning: espTimeout <= 15, critical: espTimeout <= 5 }"
          >
            Timeout in {{ espTimeout }}s
          </p>
        </div>
        <button class="cancel-btn" @click="cancelEspWait">Cancel</button>
      </div>
    </div>

    <!-- COIN SLOT PAYMENT MODAL -->
    <div v-if="isCoinPaymentActive" class="modal-overlay">
      <div class="modal-card coin-modal">
        <h3>Coin Slot Payment</h3>

        <!-- COUNTDOWN TIMER RING -->
        <div class="countdown-wrapper">
          <div class="countdown-ring-container">
            <svg class="countdown-svg" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" class="ring-track" />
              <circle
                cx="32"
                cy="32"
                r="28"
                class="ring-fill"
                :class="{ warning: countdown <= 15, critical: countdown <= 5 }"
                :style="{ strokeDashoffset: ringOffset }"
              />
            </svg>
            <span
              class="countdown-number"
              :class="{ warning: countdown <= 15, critical: countdown <= 5 }"
            >
              {{ countdown }}
            </span>
          </div>
          <p class="countdown-hint">
            {{ liveCoinAmount > 0 ? 'Timer resets on each coin inserted' : 'Waiting for coins...' }}
          </p>
        </div>

        <div class="coin-info">
          <p class="coin-label">Price:</p>
          <p class="coin-value">P{{ paymentPrice }}</p>
        </div>
        <div class="coin-info">
          <p class="coin-label">Coins Inserted:</p>
          <p class="coin-value" :class="{ sufficient: liveCoinAmount >= paymentPrice }">
            P{{ liveCoinAmount }}
          </p>
        </div>
        <div class="coin-progress-bar">
          <div
            class="coin-progress-fill"
            :style="{ width: Math.min((liveCoinAmount / paymentPrice) * 100, 100) + '%' }"
            :class="{ sufficient: liveCoinAmount >= paymentPrice }"
          ></div>
        </div>
        <p v-if="liveCoinAmount < paymentPrice" class="coin-status">
          Insert P{{ paymentPrice - liveCoinAmount }} more...
        </p>
        <p v-else class="coin-status sufficient">
          Sufficient! Tap "Done Paying"
          <span v-if="liveCoinAmount > paymentPrice">
            (P{{ liveCoinAmount - paymentPrice }} change to credit points)
          </span>
        </p>
        <button
          class="done-btn"
          :class="{ active: liveCoinAmount >= paymentPrice }"
          :disabled="liveCoinAmount < paymentPrice || isProcessing"
          @click="finishCoinPayment"
        >
          {{ isProcessing ? 'Processing...' : 'Done Paying' }}
        </button>
        <button class="cancel-btn" @click="cancelPayment">Cancel Payment</button>
      </div>
    </div>

    <!-- CREDIT PAYMENT MODAL -->
    <div v-if="isCreditPaymentActive" class="modal-overlay">
      <div class="modal-card">
        <h3>Credit Points Payment</h3>
        <!-- COUNTDOWN RING — same as coin modal -->
        <div class="countdown-wrapper">
          <div class="countdown-ring-container">
            <svg class="countdown-svg" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" class="ring-track" />
              <circle
                cx="32"
                cy="32"
                r="28"
                class="ring-fill"
                :class="{ warning: countdown <= 15, critical: countdown <= 5 }"
                :style="{ strokeDashoffset: ringOffset }"
              />
            </svg>
            <span
              class="countdown-number"
              :class="{ warning: countdown <= 15, critical: countdown <= 5 }"
            >
              {{ countdown }}
            </span>
          </div>
          <p class="countdown-hint">Confirm before time runs out</p>
        </div>
        <div class="coin-info">
          <p class="coin-label">Price:</p>
          <p class="coin-value">P{{ paymentPrice }}</p>
        </div>
        <div class="coin-info">
          <p class="coin-label">Your Credits:</p>
          <p class="coin-value" :class="{ sufficient: userCredits >= paymentPrice }">
            P{{ userCredits }}
          </p>
        </div>
        <p v-if="userCredits < paymentPrice" class="coin-status">
          Not enough credits. Need P{{ paymentPrice - userCredits }} more.
        </p>
        <p v-if="paymentMessage" class="payment-message" :class="paymentMessageType">
          {{ paymentMessage }}
        </p>
        <button
          class="done-btn"
          :class="{ active: userCredits >= paymentPrice }"
          :disabled="userCredits < paymentPrice || isProcessing"
          @click="confirmCreditPayment"
        >
          {{ isProcessing ? 'Processing...' : 'Confirm Payment' }}
        </button>
        <button class="cancel-btn" @click="closeCreditPayment">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import type { WatchStopHandle } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth } from 'src/firebase/firebase';
import { getUserData } from 'src/firebase/authService';
import {
  listenToStation,
  listenToCoinSlot,
  listenToCreditPoints,
  listenToActiveRental,
  startCoinSlotPayment,
  finishCoinSlotPayment,
  cancelCoinSlotPayment,
  refundCoinsToCredits,
  payWithCreditPoints,
  checkIfBanned,
  lockSlotForPayment,
  unlockSlotFromPayment,
  setEspReadyPay,
  type StationData,
  type SlotData,
  type ActiveRental,
  startCreditPointsPayment, // ← add this
} from 'src/firebase/realtimeService';
import type { Unsubscribe } from 'firebase/database';

// ── CONSTANTS ──
const COIN_TIMEOUT_SECONDS = 60;
const ESP_TIMEOUT_SECONDS = 30;

const route = useRoute();
const router = useRouter();
const stationId = route.params.stationId as string;

// ── STATE ──
const station = ref<StationData | null>(null);
const isUserBanned = ref(false);
const activeRental = ref<ActiveRental | null>(null);
const currentRenterName = ref('');
const currentRenterPhone = ref('');
const currentProfilePictureUrl = ref('');
const selectedSlot = ref<SlotData | null>(null);
const selectedSlotName = ref('');
// tracks which method is waiting for ESP so proceedToPaymentModal knows where to go
const pendingPaymentMethod = ref<'coinSlot' | 'creditPoints' | ''>('');

// ESP waiting state
const isWaitingForEsp = ref(false);
const espTimeout = ref(ESP_TIMEOUT_SECONDS);

// Coin payment state
const isCoinPaymentActive = ref(false);
const liveCoinAmount = ref(0);
const paymentPrice = ref(0);
const isProcessing = ref(false);
const countdown = ref(COIN_TIMEOUT_SECONDS);

// Credit payment state
const isCreditPaymentActive = ref(false);
const userCredits = ref(0);
const paymentMessage = ref('');
const paymentMessageType = ref('');

// ── COMPUTED ──
// True when ESP32 is actively serving a coin payment on this station
const isCoinSlotBusy = computed(() => station.value?.espReadyPay === true);

// SVG ring — circumference of r=28 circle ≈ 175.9
const CIRCUMFERENCE = 2 * Math.PI * 28;
const ringOffset = computed(() => CIRCUMFERENCE * (1 - countdown.value / COIN_TIMEOUT_SECONDS));

// ── TIMERS / WATCHERS ──
let espTimeoutInterval: ReturnType<typeof setInterval> | null = null;
let stopEspWatch: WatchStopHandle | null = null;
let countdownInterval: ReturnType<typeof setInterval> | null = null;
let savedSlotData: SlotData | null = null;

// Reset coin timer every time a coin is inserted
watch(liveCoinAmount, (newVal, oldVal) => {
  if (isCoinPaymentActive.value && newVal > oldVal) {
    countdown.value = COIN_TIMEOUT_SECONDS;
  }
});

// ── FIREBASE LISTENERS ──
let unsubStation: Unsubscribe | null = null;
let unsubCoinSlot: Unsubscribe | null = null;
let unsubCredits: Unsubscribe | null = null;
let unsubActiveRental: Unsubscribe | null = null;

onMounted(async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userData = await getUserData(user.uid);
  if (userData) {
    currentRenterName.value = `${userData.firstName} ${userData.lastName}`.trim();
    currentRenterPhone.value = userData.phoneNumber || '';
    currentProfilePictureUrl.value = userData.profilePictureUrl || '';
  }

  isUserBanned.value = await checkIfBanned(user.uid);
  unsubStation = listenToStation(stationId, (data) => {
    station.value = data;
  });
  unsubCredits = listenToCreditPoints(user.uid, (credits) => {
    userCredits.value = credits;
  });
  unsubActiveRental = listenToActiveRental(user.uid, (rental) => {
    activeRental.value = rental;
  });
});

onUnmounted(async () => {
  // Save BEFORE clearing — clearEspWait sets isWaitingForEsp to false
  const wasWaitingForEsp = isWaitingForEsp.value;
  const wasCoinActive = isCoinPaymentActive.value;

  clearCountdown();
  clearEspWait();

  const user = auth.currentUser;
  if (user && selectedSlotName.value && station.value) {
    const currentSlot = station.value[selectedSlotName.value as 'slot1' | 'slot2'];
    if (currentSlot?.status === 'pending' && currentSlot?.pendingBy === user.uid) {
      await unlockSlotFromPayment(stationId, selectedSlotName.value);
    }
  }

  // Now uses saved values instead of the already-cleared ones
  if (wasWaitingForEsp || wasCoinActive) {
    await setEspReadyPay(stationId, false);
    await cancelCoinSlotPayment(stationId);
  }

  if (unsubStation) unsubStation();
  if (unsubCoinSlot) unsubCoinSlot();
  if (unsubCredits) unsubCredits();
  if (unsubActiveRental) unsubActiveRental();
});

// ────────────────────────────────────────────
// ESP WAITING HELPERS
// ────────────────────────────────────────────

/** Clears ESP timeout interval and station watcher without touching Firebase. */
const clearEspWait = (): void => {
  if (espTimeoutInterval) {
    clearInterval(espTimeoutInterval);
    espTimeoutInterval = null;
  }
  if (stopEspWatch) {
    stopEspWatch();
    stopEspWatch = null;
  }
  isWaitingForEsp.value = false;
};

/** Called when 30s timeout fires — ESP32 never responded. */
const handleEspTimeout = async (): Promise<void> => {
  const user = auth.currentUser;
  if (user && selectedSlotName.value) {
    await unlockSlotFromPayment(stationId, selectedSlotName.value);
  }
  await cancelCoinSlotPayment(stationId);
  await setEspReadyPay(stationId, false);
  savedSlotData = null;
  alert('The station is not responding. Please try again or contact support.');
};

/** Called when user manually taps Cancel during loading. */
const cancelEspWait = async (): Promise<void> => {
  clearEspWait();
  const user = auth.currentUser;
  if (user && selectedSlotName.value) {
    await unlockSlotFromPayment(stationId, selectedSlotName.value);
  }
  await cancelCoinSlotPayment(stationId);
  await setEspReadyPay(stationId, false);
  savedSlotData = null;
  selectedSlotName.value = ''; // ← add this line
  pendingPaymentMethod.value = ''; // ← add this
};

/** Called when espReadyPay flips to true — open the actual coin payment UI. */
const proceedToPaymentModal = (): void => {
  if (pendingPaymentMethod.value === 'coinSlot') {
    isCoinPaymentActive.value = true;
    unsubCoinSlot = listenToCoinSlot(stationId, (amount) => {
      liveCoinAmount.value = amount;
    });
    startCountdown();
  } else if (pendingPaymentMethod.value === 'creditPoints') {
    isCreditPaymentActive.value = true;
    paymentMessage.value = '';
    startCountdown(); // ← add this
  }
};
// ────────────────────────────────────────────
// COIN COUNTDOWN HELPERS
// ────────────────────────────────────────────

const startCountdown = (): void => {
  clearCountdown();
  countdown.value = COIN_TIMEOUT_SECONDS;
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearCountdown();
      void handleCoinTimerExpiry();
    }
  }, 1000);
};

const clearCountdown = (): void => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
};

const handleCoinTimerExpiry = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  // ── CREDIT POINTS TIMER EXPIRED ──
  if (pendingPaymentMethod.value === 'creditPoints') {
    await cancelCoinSlotPayment(stationId);
    isCreditPaymentActive.value = false;
    paymentMessage.value = '';
    // Go back to payment options if no payment was made
    if (savedSlotData) {
      selectedSlot.value = savedSlotData;
    }
    return;
  }

  // ── COIN SLOT TIMER EXPIRED ──
  if (unsubCoinSlot) unsubCoinSlot();
  await setEspReadyPay(stationId, false);

  if (liveCoinAmount.value === 0) {
    await cancelCoinSlotPayment(stationId);
    isCoinPaymentActive.value = false;
    liveCoinAmount.value = 0;
    if (savedSlotData) {
      selectedSlot.value = savedSlotData;
    }
    return;
  }

  if (liveCoinAmount.value < paymentPrice.value) {
    isProcessing.value = true;
    const refundAmount = liveCoinAmount.value;
    try {
      await refundCoinsToCredits(
        stationId,
        selectedSlotName.value,
        user.uid,
        refundAmount,
        userCredits.value,
      );
      isCoinPaymentActive.value = false;
      liveCoinAmount.value = 0;
      savedSlotData = null;
      alert(
        `Time's up! You inserted P${refundAmount} but the price is P${paymentPrice.value}.\n` +
          `P${refundAmount} has been added to your credit points.`,
      );
    } catch (error) {
      console.error('Refund error:', error);
      alert('Something went wrong refunding your coins. Please contact support.');
    } finally {
      isProcessing.value = false;
    }
  }
};

// ────────────────────────────────────────────
// SLOT SELECTION
// ────────────────────────────────────────────

const goBack = (): void => {
  router.back();
};

const formatStatus = (status: string): string => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'pending':
      return 'Pending...';
    case 'rented':
      return 'Rented';
    case 'charging':
      return 'Charging';
    case 'maintenance':
      return 'Maintenance';
    default:
      return status;
  }
};

const getBatteryColor = (percent: number): string => {
  if (percent >= 60) return 'green';
  if (percent >= 30) return 'yellow';
  return 'red';
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

const selectSlot = async (slotName: string, slot: SlotData): Promise<void> => {
  if (isUserBanned.value) {
    alert('Your account is banned. You cannot rent.');
    return;
  }
  if (activeRental.value) {
    alert(
      `You already have an active rental!\nStation ${activeRental.value.stationId} • ${activeRental.value.slotName}`,
    );
    return;
  }
  if (slot.status !== 'available') return;

  const user = auth.currentUser;
  if (!user) return;

  const locked = await lockSlotForPayment(stationId, slotName, user.uid);
  if (!locked) {
    alert('Sorry, this slot was just taken by someone else.');
    return;
  }

  selectedSlotName.value = slotName;
  selectedSlot.value = slot;
};

const closeSlotInfo = async (): Promise<void> => {
  const user = auth.currentUser;
  if (user && selectedSlotName.value) {
    await unlockSlotFromPayment(stationId, selectedSlotName.value);
  }
  selectedSlot.value = null;
  selectedSlotName.value = '';
  savedSlotData = null;
};

// ────────────────────────────────────────────
// COIN PAYMENT
// ────────────────────────────────────────────

const startCoinPayment = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !selectedSlot.value) return;

  pendingPaymentMethod.value = 'coinSlot'; // ← add this line
  paymentPrice.value = selectedSlot.value.price;
  liveCoinAmount.value = 0;

  // Save slot so we can restore the payment-options modal in Scene 1
  savedSlotData = { ...selectedSlot.value };

  // Close payment-options modal immediately
  selectedSlot.value = null;

  // Tell ESP32 to prepare (sets someoneWillPay: true, whichSlot, etc.)
  await startCoinSlotPayment(stationId, selectedSlotName.value, user.uid);

  // Show the loading modal
  isWaitingForEsp.value = true;
  espTimeout.value = ESP_TIMEOUT_SECONDS;

  // Start 30-second visual countdown
  espTimeoutInterval = setInterval(() => {
    espTimeout.value--;
    if (espTimeout.value <= 0) {
      clearEspWait();
      void handleEspTimeout();
    }
  }, 1000);

  // Watch station for espReadyPay to flip true (ESP32 confirmed ready)
  stopEspWatch = watch(
    () => station.value?.espReadyPay,
    (ready) => {
      if (ready === true && isWaitingForEsp.value) {
        clearEspWait();
        proceedToPaymentModal(); // ← was proceedToCoinModal
      }
    },
  );
};

const finishCoinPayment = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user || liveCoinAmount.value < paymentPrice.value) return;

  // Stop the countdown — user finished in time
  clearCountdown();
  isProcessing.value = true;

  try {
    await finishCoinSlotPayment(
      stationId,
      selectedSlotName.value,
      user.uid,
      liveCoinAmount.value,
      paymentPrice.value,
      userCredits.value,
      currentRenterName.value,
      currentRenterPhone.value,
      currentProfilePictureUrl.value,
    );
    // Reset ESP flag — payment is done
    if (unsubCoinSlot) unsubCoinSlot();
    isCoinPaymentActive.value = false;
    savedSlotData = null;
    alert('Payment successful! Enjoy your rental. Return within 12 hours.');
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
  } finally {
    isProcessing.value = false;
  }
};

const cancelPayment = async (): Promise<void> => {
  clearCountdown();
  const user = auth.currentUser;
  if (user && selectedSlotName.value) {
    await unlockSlotFromPayment(stationId, selectedSlotName.value);
  }
  await cancelCoinSlotPayment(stationId);
  await setEspReadyPay(stationId, false);
  if (unsubCoinSlot) unsubCoinSlot();
  isCoinPaymentActive.value = false;
  liveCoinAmount.value = 0;
  savedSlotData = null;
};

// ────────────────────────────────────────────
// CREDIT PAYMENT
// ────────────────────────────────────────────

const startCreditPayment = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !selectedSlot.value) return;

  pendingPaymentMethod.value = 'creditPoints';
  paymentPrice.value = selectedSlot.value.price;
  savedSlotData = { ...selectedSlot.value };

  // Close payment-options modal
  selectedSlot.value = null;

  // Tell ESP32 to prepare (paymentMethod: 'creditPoints', whichSlot set)
  await startCreditPointsPayment(stationId, selectedSlotName.value, user.uid);

  // Show loading modal
  isWaitingForEsp.value = true;
  espTimeout.value = ESP_TIMEOUT_SECONDS;

  espTimeoutInterval = setInterval(() => {
    espTimeout.value--;
    if (espTimeout.value <= 0) {
      clearEspWait();
      void handleEspTimeout();
    }
  }, 1000);

  // Watch for ESP32 to confirm ready
  stopEspWatch = watch(
    () => station.value?.espReadyPay,
    (ready) => {
      if (ready === true && isWaitingForEsp.value) {
        clearEspWait();
        proceedToPaymentModal();
      }
    },
  );
};

const confirmCreditPayment = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  clearCountdown(); // ← add this — user confirmed, stop the timer
  isProcessing.value = true;
  paymentMessage.value = '';
  try {
    const result = await payWithCreditPoints(
      stationId,
      selectedSlotName.value,
      user.uid,
      paymentPrice.value,
      userCredits.value,
      currentRenterName.value,
      currentRenterPhone.value,
      currentProfilePictureUrl.value,
    );
    if (result.success) {
      paymentMessageType.value = 'success';
      paymentMessage.value = result.message;
      setTimeout(() => {
        isCreditPaymentActive.value = false;
        paymentMessage.value = '';
        pendingPaymentMethod.value = ''; // ← add this
        alert('Payment successful! Enjoy your rental. Return within 12 hours.');
      }, 1500);
    } else {
      paymentMessageType.value = 'error';
      paymentMessage.value = result.message;
    }
  } catch (error) {
    console.error('Credit payment error:', error);
    paymentMessage.value = 'Payment failed. Try again.';
    paymentMessageType.value = 'error';
  } finally {
    isProcessing.value = false;
  }
};

const closeCreditPayment = async (): Promise<void> => {
  clearCountdown(); // ← add this
  const user = auth.currentUser;
  if (user && selectedSlotName.value) {
    await unlockSlotFromPayment(stationId, selectedSlotName.value);
  }
  await cancelCoinSlotPayment(stationId); // resets someoneWillPay, espReadyPay, etc.
  isCreditPaymentActive.value = false;
  paymentMessage.value = '';
  pendingPaymentMethod.value = '';
  selectedSlotName.value = '';
};
</script>

<style scoped>
.station-container {
  min-height: 100vh;
  background-color: #deeef7;
  padding-bottom: 80px;
}

/* ── HEADER ── */
.station-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background-color: #0e255c;
}
.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
}
.station-title {
  color: white;
  font-size: 18px;
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

/* ── BANNED NOTICE ── */
.banned-notice {
  background-color: #fdecea;
  color: #c62828;
  text-align: center;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 2px solid #ef9a9a;
}

/* ── ACTIVE RENTAL NOTICE ── */
.active-rental-notice {
  background-color: #fff3e0;
  color: #e65100;
  text-align: center;
  padding: 12px 20px;
  border-bottom: 2px solid #ffcc80;
}
.active-rental-notice p {
  margin: 2px 0;
  font-size: 14px;
  font-weight: 600;
}
.rental-detail {
  font-size: 12px !important;
  font-weight: 400 !important;
  color: #bf360c !important;
}

/* ── CONTENT ── */
.station-content {
  padding: 20px;
}
.station-place {
  font-size: 16px;
  color: #333;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}

/* ── SLOT CARDS ── */
.slots-container {
  display: flex;
  gap: 15px;
  justify-content: center;
}
.slot-card {
  background-color: white;
  border-radius: 15px;
  padding: 20px;
  width: 150px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border: 3px solid transparent;
}
.slot-card.available {
  border-color: #27ae60;
}
.slot-card.available:active {
  transform: scale(0.95);
}
.slot-card.rented {
  border-color: #e74c3c;
  opacity: 0.6;
  cursor: not-allowed;
}
.slot-card.charging {
  border-color: #3498db;
  opacity: 0.7;
  cursor: not-allowed;
}
.slot-card.maintenance {
  border-color: #999;
  opacity: 0.4;
  cursor: not-allowed;
}
.slot-card.pending {
  border-color: #f39c12;
  opacity: 0.6;
  cursor: not-allowed;
}
.slot-card h3 {
  margin: 0 0 10px 0;
  color: #0e255c;
}
.renter-label {
  font-size: 10px;
  color: #e74c3c;
  margin: 4px 0 0 0;
}

/* ── BATTERY BAR ── */
.battery-bar {
  width: 100%;
  height: 12px;
  background-color: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}
.battery-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s;
}
.battery-fill.green {
  background-color: #27ae60;
}
.battery-fill.yellow {
  background-color: #f39c12;
}
.battery-fill.red {
  background-color: #e74c3c;
}
.battery-text {
  font-size: 14px;
  color: #555;
  margin: 5px 0;
}
.slot-price {
  font-size: 20px;
  font-weight: bold;
  color: #0e255c;
  margin: 5px 0;
}
.slot-status {
  font-size: 12px;
  font-weight: 600;
  margin: 5px 0 0 0;
}
.slot-status.available {
  color: #27ae60;
}
.slot-status.rented {
  color: #e74c3c;
}
.slot-status.charging {
  color: #3498db;
}
.slot-status.maintenance {
  color: #999;
}
.slot-status.pending {
  color: #f39c12;
}

/* ── MODAL ── */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}
.modal-card {
  background-color: white;
  border-radius: 20px;
  padding: 25px;
  width: 100%;
  max-width: 350px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.modal-card h3 {
  color: #0e255c;
  margin: 0 0 15px 0;
  font-size: 20px;
}
.modal-info p {
  font-size: 16px;
  color: #333;
  margin: 8px 0;
}

/* ── PAYMENT BUTTONS ── */
.payment-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
}
.pay-btn {
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  transition: opacity 0.2s;
}
.coin-btn {
  background-color: #f39c12;
  color: white;
}
.credit-btn {
  background-color: #0e255c;
  color: white;
}
.btn-busy {
  background-color: #bbb;
  cursor: not-allowed;
  opacity: 0.7;
}
.cancel-btn {
  margin-top: 10px;
  padding: 10px;
  background-color: transparent;
  border: 2px solid #0e255c;
  border-radius: 12px;
  color: #0e255c;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  font-family: 'Poppins', sans-serif;
}

/* ── ESP WAITING / LOADING ── */
.esp-loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0 20px;
  gap: 12px;
}
.esp-spinner {
  width: 48px;
  height: 48px;
  border: 5px solid #e0e0e0;
  border-top-color: #0e255c;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.esp-loading-text {
  font-size: 14px;
  color: #555;
  margin: 0;
}
.esp-timeout-bar-track {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}
.esp-timeout-bar-fill {
  height: 100%;
  background-color: #27ae60;
  border-radius: 4px;
  transition:
    width 1s linear,
    background-color 0.3s;
}
.esp-timeout-bar-fill.warning {
  background-color: #f39c12;
}
.esp-timeout-bar-fill.critical {
  background-color: #e74c3c;
}
.esp-timeout-label {
  font-size: 12px;
  color: #888;
  margin: 0;
}
.esp-timeout-label.warning {
  color: #f39c12;
  font-weight: 600;
}
.esp-timeout-label.critical {
  color: #e74c3c;
  font-weight: 600;
}

/* ── COUNTDOWN RING ── */
.countdown-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}
.countdown-ring-container {
  position: relative;
  width: 64px;
  height: 64px;
}
.countdown-svg {
  width: 64px;
  height: 64px;
  transform: rotate(-90deg);
}
.ring-track {
  fill: none;
  stroke: #e0e0e0;
  stroke-width: 5;
}
.ring-fill {
  fill: none;
  stroke: #27ae60;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: 175.9;
  stroke-dashoffset: 0;
  transition:
    stroke-dashoffset 1s linear,
    stroke 0.3s;
}
.ring-fill.warning {
  stroke: #f39c12;
}
.ring-fill.critical {
  stroke: #e74c3c;
}
.countdown-number {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #27ae60;
  font-family: 'Poppins', sans-serif;
}
.countdown-number.warning {
  color: #f39c12;
}
.countdown-number.critical {
  color: #e74c3c;
}
.countdown-hint {
  font-size: 11px;
  color: #aaa;
  margin: 6px 0 0 0;
}

/* ── COIN PAYMENT ── */
.coin-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.coin-label {
  font-size: 14px;
  color: #888;
  margin: 0;
}
.coin-value {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin: 0;
}
.coin-value.sufficient {
  color: #27ae60;
}

/* ── PROGRESS BAR ── */
.coin-progress-bar {
  width: 100%;
  height: 14px;
  background-color: #e0e0e0;
  border-radius: 7px;
  overflow: hidden;
  margin: 15px 0;
}
.coin-progress-fill {
  height: 100%;
  background-color: #f39c12;
  border-radius: 7px;
  transition: width 0.3s;
}
.coin-progress-fill.sufficient {
  background-color: #27ae60;
}
.coin-status {
  font-size: 13px;
  color: #888;
  margin: 10px 0 15px 0;
}
.coin-status.sufficient {
  color: #27ae60;
  font-weight: 600;
}

/* ── DONE BUTTON ── */
.done-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  background-color: #a0a0a0;
  color: white;
  font-family: 'Poppins', sans-serif;
  transition: background-color 0.2s;
}
.done-btn.active {
  background-color: #27ae60;
}
.done-btn:disabled {
  cursor: not-allowed;
}

/* ── MESSAGES ── */
.payment-message {
  font-size: 13px;
  margin: 10px 0;
}
.payment-message.success {
  color: #27ae60;
}
.payment-message.error {
  color: #e74c3c;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #888;
}
</style>
