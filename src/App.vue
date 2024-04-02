<template>
  {{ token }}
  <router-view></router-view>
</template>

<script setup>
const props = defineProps({
  token: String
})
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>