<template>
  <div class="web-layout">
    <div class="web-img">
      <div class="web-img-container"></div>
    </div>

    <div class="persion" :style="persionStyle">
      <button class="menu-toggle" type="button" @click="toggleMobileMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <person />
    </div>

    <div v-if="isMobileMenuOpen" class="menu-mask" @click="closeMobileMenu"></div>

    <div class="web-main">
      <div class="web-menu" :class="{ 'is-mobile-open': isMobileMenuOpen }">
        <myMenu />
      </div>
      <div class="web-content">
        <div class="web-body">
          <router-view></router-view>
        </div>
        <footer class="web-footer">
          <div class="footer-panel">
            <div class="footer-line footer-brand" v-if="siteInfo.siteCopyright">
              <span class="footer-label">版权</span>
              <span class="footer-text">{{ siteInfo.siteCopyright }}</span>
            </div>
            <div class="footer-divider" v-if="siteInfo.siteCopyright && siteInfo.siteIcp"></div>
            <div class="footer-line footer-record" v-if="siteInfo.siteIcp">
              <span class="footer-label">备案</span>
              <span class="footer-text" v-html="siteInfo.siteIcp"></span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import myMenu from '@/components/menu.vue'
import person from '@/components/person.vue'
import { useSiteInfoStore } from '@/stores/siteInfo'
let siteInfo = useSiteInfoStore().siteInfo
const route = useRoute()
const scrollY = ref(0)
const isMobileMenuOpen = ref(false)
const maxAlpha = 0.85
const fadeDistance = 220

const persionStyle = computed(() => {
  const alpha = Math.min(maxAlpha, scrollY.value / fadeDistance)

  return {
    backgroundColor: `rgba(255, 255, 255, ${alpha})`,
    backdropFilter: alpha > 0 ? 'saturate(150%) blur(10px)' : 'none',
    transition: 'background-color 0.25s ease, backdrop-filter 0.25s ease, top 0.2s ease',
    top: '0px',
    color: `rgba(0, 0, 0, ${alpha})`,
  }
})

function handleScroll() {
  scrollY.value = window.scrollY || window.pageYOffset
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
  },
)

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
a {
  text-decoration: none;
  color: #334155;
}
.web-layout {
  padding: 0 30px;
  background-color: var(--bg-color);
}

.web-layout > .web-img {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 300px;
  background-color: #8dbd3b;
  background-image: url('@/assets/image/bg.jpg');
  background-size: cover;
  background-position: center top;
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 0) 100%);
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 0) 100%);
}

.web-layout > .web-img > .web-img-container {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.web-layout > .web-img::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 45%,
    rgba(255, 255, 255, 0.92) 100%
  );
  content: '';
  pointer-events: none;
}

.web-layout > .persion {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 998;
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  justify-content: flex-end;
  width: 100vw;
  padding: 0 20px 0 12px;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(196, 208, 224, 0.82);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 24px rgba(53, 81, 122, 0.08);
  cursor: pointer;
}

.menu-toggle span {
  display: block;
  width: 18px;
  height: 2px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 999px;
  background: #38507d;
}

.menu-mask {
  position: fixed;
  inset: 0;
  z-index: 997;
  background: rgba(15, 23, 42, 0.34);
  backdrop-filter: blur(2px);
}

.web-layout > .web-main {
  display: flex;
  margin: 0 auto;
  margin-top: 150px;
  max-width: 1200px;
}

.web-layout > .web-main > .web-menu {
  position: sticky;
  top: 0;
  width: 300px;
  flex-shrink: 0;
}

.web-layout > .web-main > .web-content {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100px;
  margin-left: 20px;
}

.web-layout > .web-main > .web-content > .web-body {
  min-height: 600px;
}

.web-layout .web-footer {
  margin-top: 32px;
  padding: 8px 0 28px;
}

.web-layout .footer-panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 18px;
  padding: 18px 24px;
  overflow: hidden;
  border: 1px solid rgba(221, 228, 238, 0.9);
  border-radius: 24px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.88)),
    rgba(255, 255, 255, 0.82);
  box-shadow:
    0 18px 40px rgba(31, 41, 55, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(14px);
}

.web-layout .footer-panel::before {
  position: absolute;
  top: -42px;
  right: -18px;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(141, 189, 59, 0.2), rgba(141, 189, 59, 0));
  content: '';
  pointer-events: none;
}

.web-layout .footer-line {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.web-layout .footer-brand {
  justify-content: flex-start;
}

.web-layout .footer-record {
  justify-content: flex-end;
}

.web-layout .footer-label {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid rgba(56, 80, 125, 0.12);
  border-radius: 999px;
  background: rgba(56, 80, 125, 0.06);
  color: #38507d;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.web-layout .footer-text {
  min-width: 0;
  color: #334155;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}

.web-layout .footer-divider {
  width: 1px;
  height: 44px;
  background: linear-gradient(
    180deg,
    rgba(148, 163, 184, 0),
    rgba(148, 163, 184, 0.75),
    rgba(148, 163, 184, 0)
  );
}

@media (max-width: 768px) {
  .web-layout {
    padding: 0;
  }

  .menu-toggle {
    display: inline-flex;
  }

  .web-layout > .persion {
    padding: 0 12px;
    justify-content: space-between;
  }

  .web-layout > .web-main {
    margin-top: 120px;
  }

  .web-layout > .web-main > .web-menu {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 998;
    width: min(82vw, 320px);
    margin: 0;
    transform: translateX(-100%);
    transition: transform 0.28s ease;
  }

  .web-layout > .web-main > .web-menu.is-mobile-open {
    transform: translateX(0);
  }

  .web-layout > .web-main > .web-content {
    width: 100%;
    margin-left: 0;
    padding: 0 16px;
  }

  .web-layout .web-footer {
    margin-top: 24px;
    padding-bottom: 24px;
  }

  .web-layout .footer-panel {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px;
    border-radius: 20px;
  }

  .web-layout .footer-line {
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .web-layout .footer-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(148, 163, 184, 0),
      rgba(148, 163, 184, 0.7),
      rgba(148, 163, 184, 0)
    );
  }
}
</style>
