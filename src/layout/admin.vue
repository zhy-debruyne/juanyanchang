<template>
  <el-container>
    <el-header>
        <Header />
    </el-header>   
    <el-container>
      <el-aside style="width: 250px;">
      <Navigation />
      </el-aside>
      <el-main>
       <Main/>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import  Navigation  from '@/layout/components/navigation.vue'
import Main from '@/layout/components/main.vue'
import Header from '@/layout/components/header.vue'
</script>

<style scoped>

</style>

