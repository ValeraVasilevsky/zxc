<template>
  <RouterView v-slot="{ Component }">
    <Suspense>
      <template #default>
        <component :is="Component" />
      </template>
    </Suspense>
  </RouterView>
</template>
