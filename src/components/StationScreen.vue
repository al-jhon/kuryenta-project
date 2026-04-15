<!--src\components\StationScreen.vue  -->

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
          <button class="pay-btn coin-btn" @click="startCoinPayment">Pay via Coin Slot</button>
          <button class="pay-btn credit-btn" @click="startCreditPayment">
            Pay via Credit Points (P{{ userCredits }} available)
          </button>
        </div>
        <button class="cancel-btn" @click="closeSlotInfo">Cancel</button>
      </div>
    </div>

    <!-- COIN SLOT PAYMENT MODAL -->
    <div v-if="isCoinPaymentActive" class="modal-overlay">
      <div class="modal-card coin-modal">
        <h3>Coin Slot Payment</h3>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth } from 'src/firebase/firebase';
import { getUserData } from 'src/firebase/authService';
import {
  clearStalePendingSlots,
  listenToStation,
  listenToCoinSlot,
  listenToCreditPoints,
  listenToActiveRental,
  startCoinSlotPayment,
  finishCoinSlotPayment,
  cancelCoinSlotPayment,
  payWithCreditPoints,
  checkIfBanned,
  lockSlotForPayment,
  unlockSlotFromPayment,
  type StationData,
  type SlotData,
  type ActiveRental,
} from 'src/firebase/realtimeService';
import type { Unsubscribe } from 'firebase/database';

const route = useRoute();
const router = useRouter();
const stationId = route.params.stationId as string;

const station = ref<StationData | null>(null);
const isUserBanned = ref(false);
const activeRental = ref<ActiveRental | null>(null);
const currentRenterName = ref('');
const currentRenterPhone = ref('');
const currentProfilePictureUrl = ref('');
const selectedSlot = ref<SlotData | null>(null);
const selectedSlotName = ref('');
const isCoinPaymentActive = ref(false);
const liveCoinAmount = ref(0);
const paymentPrice = ref(0);
const isProcessing = ref(false);
const isCreditPaymentActive = ref(false);
const userCredits = ref(0);
const paymentMessage = ref('');
const paymentMessageType = ref('');

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

  // Clear any stale pending locks before listening
  await clearStalePendingSlots(stationId);

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
  // Release pending lock if user leaves the screen mid-selection
  const user = auth.currentUser;
  if (user && selectedSlotName.value && station.value) {
    const currentSlot = station.value[selectedSlotName.value as 'slot1' | 'slot2'];
    if (currentSlot?.status === 'pending' && currentSlot?.pendingBy === user.uid) {
      await unlockSlotFromPayment(stationId, selectedSlotName.value);
    }
  }
  if (unsubStation) unsubStation();
  if (unsubCoinSlot) unsubCoinSlot();
  if (unsubCredits) unsubCredits();
  if (unsubActiveRental) unsubActiveRental();
});

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

  // Lock the slot immediately to block other users
  const locked = await lockSlotForPayment(stationId, slotName, user.uid);
  if (!locked) {
    alert('Sorry, this slot was just taken by someone else.');
    return;
  }

  selectedSlotName.value = slotName;
  selectedSlot.value = slot;
};

const closeSlotInfo = async (): Promise<void> => {
  // Release the pending lock when user cancels
  const user = auth.currentUser;
  if (user && selectedSlotName.value) {
    await unlockSlotFromPayment(stationId, selectedSlotName.value);
  }
  selectedSlot.value = null;
  selectedSlotName.value = '';
};

const startCoinPayment = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !selectedSlot.value) return;
  paymentPrice.value = selectedSlot.value.price;
  liveCoinAmount.value = 0;
  isCoinPaymentActive.value = true;
  selectedSlot.value = null;
  await startCoinSlotPayment(stationId, selectedSlotName.value, user.uid);
  unsubCoinSlot = listenToCoinSlot(stationId, (amount) => {
    liveCoinAmount.value = amount;
  });
};

const finishCoinPayment = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user || liveCoinAmount.value < paymentPrice.value) return;
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
    if (unsubCoinSlot) unsubCoinSlot();
    isCoinPaymentActive.value = false;
    alert('Payment successful! Enjoy your rental. Return within 12 hours.');
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
  } finally {
    isProcessing.value = false;
  }
};

const cancelPayment = async (): Promise<void> => {
  // Release pending lock then cancel coin payment
  const user = auth.currentUser;
  if (user && selectedSlotName.value) {
    await unlockSlotFromPayment(stationId, selectedSlotName.value);
  }
  await cancelCoinSlotPayment(stationId);
  if (unsubCoinSlot) unsubCoinSlot();
  isCoinPaymentActive.value = false;
  liveCoinAmount.value = 0;
};

const startCreditPayment = (): void => {
  if (!selectedSlot.value) return;
  paymentPrice.value = selectedSlot.value.price;
  isCreditPaymentActive.value = true;
  paymentMessage.value = '';
  selectedSlot.value = null;
};

const confirmCreditPayment = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
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
  // Release pending lock when user cancels credit payment
  const user = auth.currentUser;
  if (user && selectedSlotName.value) {
    await unlockSlotFromPayment(stationId, selectedSlotName.value);
  }
  isCreditPaymentActive.value = false;
  paymentMessage.value = '';
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

/* ── MODAL OVERLAY ── */
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
}
.coin-btn {
  background-color: #f39c12;
  color: white;
}
.credit-btn {
  background-color: #0e255c;
  color: white;
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
.slot-card.pending {
  border-color: #f39c12;
  opacity: 0.6;
  cursor: not-allowed;
}
.slot-status.pending {
  color: #f39c12;
}
</style>
