<template>
  <Teleport to="body">
    <transition name="dialog-fade">
      <div v-if="visible" class="modal-overlay" @click.self="onClose">
        <div class="modal-shell" role="dialog" aria-modal="true">
          <button class="modal-close" type="button" aria-label="关闭弹窗" @click="onClose">
            <span></span>
            <span></span>
          </button>

          <div class="modal-glow modal-glow-left"></div>
          <div class="modal-glow modal-glow-right"></div>

          <div class="modal-header">
            <div class="modal-header-inner">
              <slot name="header">
                <h3 class="modal-title">{{ title }}</h3>
              </slot>
            </div>
          </div>

          <div class="modal-body">
            <slot name="body"></slot>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  title?: string
}>()

const emits = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}>()

const title = computed(() => props.title || '登录 / 注册')

const onClose = () => {
  emits('update:visible', false)
  emits('close')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) {
    onClose()
  }
}

watch(
  () => props.visible,
  (visible) => {
    document.body.style.overflow = visible ? 'hidden' : ''

    if (visible) {
      window.addEventListener('keydown', handleKeydown)
      return
    }

    window.removeEventListener('keydown', handleKeydown)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow-y: auto;
  background:
    radial-gradient(circle at top, rgba(108, 130, 255, 0.28), transparent 34%),
    linear-gradient(135deg, rgba(10, 22, 44, 0.74), rgba(20, 33, 61, 0.84));
  backdrop-filter: blur(16px);
  z-index: 1000;
}

.modal-shell {
  position: relative;
  width: min(100%, 500px);
  max-height: calc(100vh - 48px);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 28px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.97), rgba(244, 247, 255, 0.93));
  box-shadow:
    0 32px 80px rgba(9, 20, 43, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
}

.modal-header {
  position: relative;
  padding: 28px 28px 18px;
  background:
    linear-gradient(135deg, rgba(84, 117, 255, 0.14), rgba(57, 181, 255, 0.06)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0));
}

.modal-header::after {
  content: '';
  position: absolute;
  left: 28px;
  right: 28px;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(111, 137, 255, 0.42), rgba(111, 137, 255, 0));
}

.modal-header-inner,
.modal-body {
  position: relative;
  z-index: 1;
}

.modal-title {
  margin: 0;
  color: #16213d;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.modal-body {
  padding: 24px 28px 30px;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 10px 24px rgba(18, 34, 72, 0.12);
  cursor: pointer;
  transition:
    transform 0.22s ease,
    background-color 0.22s ease,
    box-shadow 0.22s ease;
  z-index: 2;
}

.modal-close:hover {
  transform: translateY(-1px);
  background: #ffffff;
  box-shadow: 0 16px 28px rgba(18, 34, 72, 0.16);
}

.modal-close:focus-visible {
  outline: 2px solid #6a7cff;
  outline-offset: 2px;
}

.modal-close span {
  position: absolute;
  top: 19px;
  left: 11px;
  width: 18px;
  height: 2px;
  border-radius: 999px;
  background: #52607f;
}

.modal-close span:first-child {
  transform: rotate(45deg);
}

.modal-close span:last-child {
  transform: rotate(-45deg);
}

.modal-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(8px);
  pointer-events: none;
}

.modal-glow-left {
  top: -36px;
  left: -28px;
  width: 160px;
  height: 160px;
  background: rgba(120, 149, 255, 0.22);
}

.modal-glow-right {
  right: -34px;
  bottom: 54px;
  width: 140px;
  height: 140px;
  background: rgba(110, 226, 208, 0.16);
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.28s ease;
}

.dialog-fade-enter-active .modal-shell,
.dialog-fade-leave-active .modal-shell {
  transition:
    transform 0.28s ease,
    opacity 0.28s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .modal-shell,
.dialog-fade-leave-to .modal-shell {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

@media (max-width: 640px) {
  .modal-overlay {
    align-items: center;
    padding: max(18px, env(safe-area-inset-top)) 14px 18px;
  }

  .modal-shell {
    width: 100%;
    max-height: calc(100vh - 36px - env(safe-area-inset-top));
    border-radius: 26px 26px 22px 22px;
  }

  .modal-header {
    padding: 24px 20px 16px;
  }

  .modal-body {
    padding: 20px 20px 24px;
  }

  .modal-title {
    font-size: 22px;
  }
}
</style>
