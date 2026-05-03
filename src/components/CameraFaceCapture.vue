<!-- src/components/CameraFaceCapture.vue -->
<template>
  <div v-if="isOpen" class="camera-overlay">
    <div class="camera-container">
      <!-- HEADER -->
      <div class="camera-header">
        <button class="close-btn" @click="closeCamera">✕</button>
        <p class="camera-title">Take Profile Photo</p>
        <div style="width: 40px"></div>
      </div>

      <!-- CAMERA VIEW -->
      <div class="camera-view">
        <video ref="videoRef" autoplay playsinline muted class="camera-video"></video>

        <!-- FACE GUIDE CIRCLE -->
        <div class="face-guide" :class="{ detected: isFaceDetected }">
          <div class="guide-circle"></div>
        </div>

        <!-- STATUS -->
        <div class="status-bar">
          <p v-if="isModelLoading" class="status-text">Loading face detection...</p>
          <p v-else-if="!isFaceDetected" class="status-text">
            Position your face inside the circle
          </p>
          <p v-else class="status-text detected">✓ Face detected!</p>
        </div>
      </div>

      <!-- CAPTURE BUTTON -->
      <div class="camera-footer">
        <button
          class="capture-btn"
          :class="{ active: isFaceDetected }"
          :disabled="!isFaceDetected || isUploading"
          @click="captureAndUpload"
        >
          <div class="capture-btn-inner"></div>
        </button>
        <p class="capture-hint">
          {{
            isUploading ? 'Uploading...' : isFaceDetected ? 'Tap to capture' : 'Waiting for face...'
          }}
        </p>
      </div>

      <!-- HIDDEN CANVAS -->
      <canvas ref="captureCanvas" class="hidden-canvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import * as faceapi from 'face-api.js';
import { uploadToCloudinary } from 'src/services/cloudinaryService';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'captured', url: string): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const captureCanvas = ref<HTMLCanvasElement | null>(null);

const isModelLoading = ref(true);
const isFaceDetected = ref(false);
const isUploading = ref(false);

let stream: MediaStream | null = null;
let detectionInterval: ReturnType<typeof setInterval> | null = null;

// ──────── WATCH OPEN STATE ────────
watch(
  () => props.isOpen,
  async (opened) => {
    if (opened) {
      await startCamera();
    } else {
      stopCamera();
    }
  },
);

// ──────── START CAMERA ────────
const startCamera = async (): Promise<void> => {
  try {
    isModelLoading.value = true;
    isFaceDetected.value = false;

    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });

    await new Promise<void>((resolve) => {
      const checkVideo = setInterval(() => {
        if (videoRef.value) {
          clearInterval(checkVideo);
          resolve();
        }
      }, 50);
    });

    if (videoRef.value) {
      videoRef.value.srcObject = stream;

      videoRef.value.onloadedmetadata = async () => {
        try {
          await videoRef.value?.play();
        } catch (e) {
          console.warn('Video play error:', e);
        }
        isModelLoading.value = false;
        startFaceDetection();
      };
    }
  } catch (error) {
    console.error('Camera error:', error);
    isModelLoading.value = false;
    alert('Could not access camera. Please allow camera permission.');
  }
};

// ──────── FACE DETECTION LOOP ────────
const detectFace = async (): Promise<void> => {
  if (!videoRef.value) return;

  try {
    const detections = await faceapi.detectAllFaces(
      videoRef.value,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 224,
        scoreThreshold: 0.5,
      }),
    );

    isFaceDetected.value = detections.length === 1;
  } catch {
    // Ignore detection errors
  }
};

const startFaceDetection = (): void => {
  detectionInterval = setInterval(() => {
    void detectFace();
  }, 300);
};

// ──────── CAPTURE & UPLOAD ────────
const captureAndUpload = async (): Promise<void> => {
  if (!isFaceDetected.value || !videoRef.value || !captureCanvas.value) return;

  isUploading.value = true;

  try {
    const video = videoRef.value;
    const canvas = captureCanvas.value;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    const size = Math.min(canvas.width, canvas.height);
    const offsetX = (canvas.width - size) / 2;
    const offsetY = (canvas.height - size) / 2;

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = 500;
    croppedCanvas.height = 500;

    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) return;

    croppedCtx.drawImage(canvas, offsetX, offsetY, size, size, 0, 0, 500, 500);

    const blob = await new Promise<Blob>((resolve) => {
      croppedCanvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.85);
    });

    const result = await uploadToCloudinary(blob);

    console.log('Uploaded to Cloudinary:', result.secure_url);

    emit('captured', result.secure_url);

    closeCamera();
  } catch (error) {
    console.error('Capture/upload error:', error);
    alert('Failed to upload photo. Please try again.');
  } finally {
    isUploading.value = false;
  }
};

// ──────── STOP CAMERA ────────
const stopCamera = (): void => {
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  isFaceDetected.value = false;
  isModelLoading.value = true;
};

// ──────── CLOSE ────────
const closeCamera = (): void => {
  stopCamera();
  emit('close');
};

onUnmounted(() => {
  stopCamera();
});
</script>

<style scoped>
.camera-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.camera-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.camera-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background-color: #111;
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-title {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

.camera-view {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #000;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.face-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 220px;
  height: 280px;
  pointer-events: none;
}

.guide-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px dashed rgba(255, 255, 255, 0.4);
  transition: all 0.3s;
}

.face-guide.detected .guide-circle {
  border: 3px solid #27ae60;
  box-shadow: 0 0 30px rgba(39, 174, 96, 0.3);
}

.status-bar {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
}

.status-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0;
  font-family: 'Poppins', sans-serif;
  background-color: rgba(0, 0, 0, 0.6);
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
}

.status-text.detected {
  color: #27ae60;
}

.camera-footer {
  padding: 25px;
  background-color: #111;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.capture-btn {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 4px solid #444;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.capture-btn.active {
  border-color: white;
}

.capture-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.capture-btn-inner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #444;
  transition: background-color 0.3s;
}

.capture-btn.active .capture-btn-inner {
  background-color: white;
}

.capture-btn:active:not(:disabled) .capture-btn-inner {
  background-color: #ccc;
  transform: scale(0.92);
}

.capture-hint {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

.hidden-canvas {
  display: none;
}
</style>
