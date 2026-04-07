<template>
  <div class="header-container"></div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'

const activeIndex = ref(0)

const setActive = (index: number) => {
  activeIndex.value = index
}

const indicatorStyle = computed(() => ({
  transform: `translateX(${activeIndex.value * 6.9375}rem)`,
}))
</script>
<style scoped>
.header-container {
  width: 100%;
  height: 100%;
  background-color: var(--card-bg);
  box-shadow: 0 0.0625rem 0.125rem 0px rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
}

.nav-bar {
  width: 100%;
  position: relative;
}

.nav-list {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  /* justify-content: center; */
}

.nav-item {
  margin: 0 0.9375rem;
  width: 5rem;
  text-align: center;
  cursor: pointer;
}

.nav-link {
  text-decoration: none;
  color: var(--text-color);
  font-size: 1rem;
  font-weight: 500;
  padding: 0.625rem 0.9375rem;
  border-radius: 0.25rem;
  transition: background-color 0.3s ease;
}

.nav-item:hover .nav-link {
  background-color: var(--hover-bg);
}

.nav-item.active .nav-link {
  background-color: var(--active-bg);
  color: var(--active-text);
}

.indicator {
  position: absolute;
  bottom: -0.3125rem;
  left: 0.9375rem; /* 初始位置 */
  width: 5rem;
  height: 0.1875rem;
  background-color: blue;
  transition: transform 0.3s ease;
}
</style>
