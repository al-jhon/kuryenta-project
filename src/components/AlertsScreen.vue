<!-- src\components\AlertsScreen.vue -->
<template>
  <div class="alerts-container">
    <!-- HEADER -->
    <div class="alerts-header">
      <h2 class="alerts-title">Alerts</h2>
      <button
        v-if="alerts.length > 0"
        class="clear-all-btn"
        :disabled="isClearing"
        @click="handleClearAll"
      >
        {{ isClearing ? 'Clearing…' : 'Clear All' }}
      </button>
    </div>

    <!-- UNREAD BADGE SUMMARY -->
    <p v-if="unreadCount > 0" class="unread-summary">
      {{ unreadCount }} unread {{ unreadCount === 1 ? 'alert' : 'alerts' }}
    </p>

    <!-- LOADING -->
    <div v-if="isLoading" class="alerts-loading">
      <p>Loading alerts…</p>
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="alerts.length === 0" class="alerts-empty">
      <div class="empty-icon">🔔</div>
      <p class="empty-title">No Alerts</p>
      <p class="empty-sub">You're all caught up!</p>
    </div>

    <!-- ALERT LIST -->
    <div v-else class="alerts-list">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-item"
        :class="{ unread: !alert.data.view }"
        @click="handleView(alert)"
      >
        <!-- UNREAD DOT -->
        <div class="unread-dot-wrapper">
          <span v-if="!alert.data.view" class="unread-dot"></span>
        </div>

        <!-- CONTENT -->
        <div class="alert-body">
          <p class="alert-content">{{ alert.data.content }}</p>
          <p class="alert-time">{{ formatTime(alert.data.timeStamp) }}</p>
        </div>

        <!-- DELETE -->
        <button
          class="delete-btn"
          @click.stop="handleDelete(alert.id)"
          :disabled="deletingId === alert.id"
          title="Delete alert"
        >
          <svg viewBox="0 0 24 24" fill="none" class="trash-icon">
            <path
              d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6h14z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { auth } from 'src/firebase/firebase';
import {
  listenToAlerts,
  markAlertAsViewed,
  deleteAlert,
  deleteAllAlerts,
  type AlertItem,
} from 'src/firebase/realtimeService';
import type { Unsubscribe } from 'firebase/database';

const alerts = ref<AlertItem[]>([]);
const isLoading = ref(true);
const isClearing = ref(false);
const deletingId = ref<string | null>(null);

let unsubAlerts: Unsubscribe | null = null;

const unreadCount = computed(() => alerts.value.filter((a) => !a.data.view).length);

onMounted(() => {
  const user = auth.currentUser;
  if (!user) return;
  unsubAlerts = listenToAlerts(user.uid, (data) => {
    alerts.value = data;
    isLoading.value = false;
  });
});

onUnmounted(() => {
  if (unsubAlerts) unsubAlerts();
});

const formatTime = (ts: number): string => {
  if (!ts) return '';
  try {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

const handleView = async (alert: AlertItem): Promise<void> => {
  if (alert.data.view) return;
  const user = auth.currentUser;
  if (!user) return;
  await markAlertAsViewed(user.uid, alert.id);
};

const handleDelete = async (alertId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  deletingId.value = alertId;
  try {
    await deleteAlert(user.uid, alertId);
  } finally {
    deletingId.value = null;
  }
};

const handleClearAll = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  isClearing.value = true;
  try {
    await deleteAllAlerts(user.uid);
  } finally {
    isClearing.value = false;
  }
};
</script>

<style scoped>
.alerts-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: #f5f5f5;
  padding-bottom: 80px;
}

/* ── Header ── */
.alerts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 8px;
  background: #ffffff;
  border-bottom: 1px solid #ebebeb;
}

.alerts-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.clear-all-btn {
  font-size: 13px;
  color: #e74c3c;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  font-weight: 600;
}
.clear-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Unread summary ── */
.unread-summary {
  font-size: 12px;
  color: #f39c12;
  font-weight: 600;
  padding: 6px 20px;
  background: #fff8e8;
  border-bottom: 1px solid #ffe9a0;
  margin: 0;
}

/* ── Loading ── */
.alerts-loading {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

/* ── Empty state ── */
.alerts-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 8px;
}
.empty-icon {
  font-size: 52px;
  margin-bottom: 8px;
}
.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}
.empty-sub {
  font-size: 14px;
  color: #888;
  margin: 0;
}

/* ── List ── */
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #ffffff;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.15s;
}
.alert-item:active {
  background: #f0f0f0;
}
.alert-item.unread {
  background: #fff8e8;
}

/* Unread dot */
.unread-dot-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  flex-shrink: 0;
  padding-top: 4px;
}
.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f39c12;
  display: block;
}

/* Body */
.alert-body {
  flex: 1;
  min-width: 0;
}
.alert-content {
  font-size: 14px;
  color: #1a1a1a;
  margin: 0 0 4px;
  line-height: 1.4;
  word-break: break-word;
}
.alert-time {
  font-size: 11px;
  color: #999;
  margin: 0;
}

/* Delete */
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #ccc;
  flex-shrink: 0;
  transition: color 0.2s;
}
.delete-btn:hover {
  color: #e74c3c;
}
.delete-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.trash-icon {
  width: 18px;
  height: 18px;
}
</style>
