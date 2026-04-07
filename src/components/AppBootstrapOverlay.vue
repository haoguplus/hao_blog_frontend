<template>
  <transition name="bootstrap-fade">
    <div v-if="appBootstrapStore.shouldShowOverlay" class="bootstrap-overlay" aria-live="polite">
      <div class="bootstrap-backdrop"></div>
      <div class="bootstrap-orb bootstrap-orb-left"></div>
      <div class="bootstrap-orb bootstrap-orb-right"></div>

      <section
        class="bootstrap-card"
        :class="{
          'is-loading': appBootstrapStore.isLoading,
          'is-error': appBootstrapStore.isError,
        }"
      >
        <div class="status-pill">
          {{ appBootstrapStore.isLoading ? 'Initializing' : 'Retry Available' }}
        </div>

        <div v-if="appBootstrapStore.isLoading" class="loading-scene" aria-hidden="true">
          <div class="loading-ring"></div>
          <div class="loading-ring loading-ring-secondary"></div>
          <div class="loading-core"></div>
          <div class="loading-grid">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div v-else class="failure-illustration" aria-hidden="true">
          <div class="failure-halo"></div>
          <div class="failure-panel">
            <span></span>
            <span></span>
          </div>
        </div>

        <h2 class="bootstrap-title">{{ appBootstrapStore.message }}</h2>
        <p class="bootstrap-copy">{{ appBootstrapStore.detail }}</p>

        <div v-if="appBootstrapStore.isLoading" class="progress-group" aria-hidden="true">
          <div class="progress-track">
            <div class="progress-bar"></div>
          </div>
          <div class="progress-labels">
            <span>站点信息</span>
            <span>访客状态</span>
            <span>路由准备</span>
          </div>
        </div>

        <div v-else class="failure-actions">
          <button class="primary-action" type="button" :disabled="retrying" @click="handleRetry">
            {{ retrying ? '重新连接中...' : '重新加载' }}
          </button>
          <button class="secondary-action" type="button" @click="handleRefresh">刷新页面</button>
        </div>
      </section>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppBootstrapStore } from '@/stores/appBootstrap'
import { runAppBootstrap } from '@/utils/appBootstrap'

const router = useRouter()
const appBootstrapStore = useAppBootstrapStore()
const retrying = ref(false)

const handleRetry = async () => {
  if (retrying.value) return

  retrying.value = true

  try {
    await runAppBootstrap()
    await router.replace(appBootstrapStore.targetPath || router.currentRoute.value.fullPath || '/')
  } catch {
    // failure state is handled in the bootstrap store
  } finally {
    retrying.value = false
  }
}

const handleRefresh = () => {
  window.location.reload()
}
</script>

<style scoped>
.bootstrap-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  padding: 24px;
  overflow: hidden;
}

.bootstrap-backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top, rgba(110, 140, 255, 0.2), transparent 34%),
    linear-gradient(135deg, rgba(242, 247, 255, 0.92), rgba(230, 238, 251, 0.9));
  backdrop-filter: blur(16px);
}

.bootstrap-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(10px);
  opacity: 0.8;
  pointer-events: none;
}

.bootstrap-orb-left {
  top: 8%;
  left: -40px;
  width: 260px;
  height: 260px;
  background: rgba(71, 124, 255, 0.18);
}

.bootstrap-orb-right {
  right: -60px;
  bottom: 10%;
  width: 320px;
  height: 320px;
  background: rgba(78, 197, 255, 0.16);
}

.bootstrap-card {
  position: relative;
  z-index: 1;
  width: min(100%, 560px);
  padding: 28px;
  border: 1px solid rgba(183, 202, 233, 0.78);
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 255, 0.94)),
    linear-gradient(135deg, rgba(92, 126, 255, 0.08), rgba(69, 190, 255, 0.04));
  box-shadow:
    0 28px 60px rgba(37, 70, 126, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  text-align: center;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(67, 98, 231, 0.1);
  color: #3558a2;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.loading-scene,
.failure-illustration {
  position: relative;
  display: grid;
  place-items: center;
  width: 180px;
  height: 180px;
  margin: 22px auto 18px;
}

.loading-ring,
.loading-ring-secondary {
  position: absolute;
  width: 142px;
  height: 142px;
  border: 1px solid rgba(84, 119, 255, 0.18);
  border-radius: 50%;
}

.loading-ring {
  border-top-color: rgba(84, 119, 255, 0.72);
  border-right-color: rgba(84, 119, 255, 0.42);
  animation: spin 2.8s linear infinite;
}

.loading-ring-secondary {
  width: 112px;
  height: 112px;
  border-bottom-color: rgba(72, 179, 255, 0.62);
  border-left-color: rgba(72, 179, 255, 0.28);
  animation: spin-reverse 2.2s linear infinite;
}

.loading-core {
  width: 58px;
  height: 58px;
  border-radius: 20px;
  background: linear-gradient(135deg, #4f6ff1 0%, #55b4ff 100%);
  box-shadow:
    0 16px 32px rgba(79, 111, 241, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  transform: rotate(12deg);
}

.loading-grid {
  position: absolute;
  inset: 32px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.loading-grid span {
  border-radius: 16px;
  background: rgba(99, 128, 243, 0.08);
  animation: pulse 1.8s ease-in-out infinite;
}

.loading-grid span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-grid span:nth-child(3) {
  animation-delay: 0.4s;
}

.loading-grid span:nth-child(4) {
  animation-delay: 0.6s;
}

.failure-halo {
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 144, 120, 0.26), rgba(255, 144, 120, 0));
}

.failure-panel {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 26px;
  background: linear-gradient(160deg, #fff4ef 0%, #ffe5db 100%);
  box-shadow:
    0 22px 40px rgba(219, 118, 86, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.failure-panel span {
  position: absolute;
  top: 42px;
  left: 24px;
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: #de7150;
}

.failure-panel span:first-child {
  transform: rotate(45deg);
}

.failure-panel span:last-child {
  transform: rotate(-45deg);
}

.bootstrap-title {
  margin: 0;
  color: #1b2b47;
  font-size: clamp(1.7rem, 3vw, 2.2rem);
  font-weight: 800;
  line-height: 1.15;
}

.bootstrap-copy {
  max-width: 420px;
  margin: 14px auto 0;
  color: #617392;
  font-size: 15px;
  line-height: 1.8;
}

.progress-group {
  margin-top: 22px;
}

.progress-track {
  position: relative;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(212, 223, 241, 0.86);
}

.progress-bar {
  width: 42%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(135deg, #4d6df0, #56b3ff);
  animation: progress-slide 1.8s ease-in-out infinite;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  color: #7b8ca7;
  font-size: 12px;
  font-weight: 700;
}

.failure-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.primary-action,
.secondary-action {
  min-width: 144px;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.primary-action {
  border: none;
  background: linear-gradient(135deg, #4d6df0 0%, #58b0ff 100%);
  color: #fff;
  box-shadow: 0 16px 28px rgba(77, 109, 240, 0.22);
}

.secondary-action {
  border: 1px solid rgba(180, 197, 225, 0.88);
  background: rgba(255, 255, 255, 0.8);
  color: #3a517d;
  box-shadow: 0 10px 20px rgba(70, 94, 140, 0.08);
}

.primary-action:hover,
.secondary-action:hover {
  transform: translateY(-1px);
}

.primary-action:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.primary-action:focus-visible,
.secondary-action:focus-visible {
  outline: 2px solid #5675f3;
  outline-offset: 2px;
}

.bootstrap-fade-enter-active,
.bootstrap-fade-leave-active {
  transition: opacity 0.28s ease;
}

.bootstrap-fade-enter-from,
.bootstrap-fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spin-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.34;
    transform: scale(0.96);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes progress-slide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(340%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-ring,
  .loading-ring-secondary,
  .loading-grid span,
  .progress-bar {
    animation: none;
  }

  .primary-action,
  .secondary-action {
    transition: none;
  }
}

@media (max-width: 640px) {
  .bootstrap-overlay {
    padding: 16px;
  }

  .bootstrap-card {
    padding: 22px 18px;
    border-radius: 24px;
  }

  .loading-scene,
  .failure-illustration {
    width: 156px;
    height: 156px;
    margin-top: 18px;
  }

  .failure-actions {
    flex-direction: column;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
  }

  .progress-labels {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
