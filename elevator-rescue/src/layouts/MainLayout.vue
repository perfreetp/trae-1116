<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon :size="28" color="#409eff"><Warning /></el-icon>
        <span class="logo-text">电梯应急平台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>首页看板</span>
        </el-menu-item>
        <el-menu-item index="/alarm">
          <el-icon><Bell /></el-icon>
          <span>事件接警</span>
        </el-menu-item>
        <el-menu-item index="/elevator">
          <el-icon><OfficeBuilding /></el-icon>
          <span>设备档案</span>
        </el-menu-item>
        <el-menu-item index="/dispatch">
          <el-icon><Van /></el-icon>
          <span>救援调度</span>
        </el-menu-item>
        <el-menu-item index="/track">
          <el-icon><Timer /></el-icon>
          <span>处置跟踪</span>
        </el-menu-item>
        <el-menu-item index="/maintenance">
          <el-icon><Tools /></el-icon>
          <span>维保记录</span>
        </el-menu-item>
        <el-menu-item index="/complaint">
          <el-icon><Service /></el-icon>
          <span>投诉回访</span>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon><TrendCharts /></el-icon>
          <span>考核统计</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span class="page-title">{{ currentPageTitle }}</span>
        </div>
        <div class="header-right">
          <el-badge :value="pendingCount" class="item">
            <el-button type="primary" text @click="$router.push('/dispatch')">
              <el-icon><Bell /></el-icon>
              待派单
            </el-button>
          </el-badge>
          <el-divider direction="vertical" />
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" icon="User" />
              <span class="username">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

const activeMenu = ref(route.path)
const pendingCount = computed(() => store.pendingDispatchAlarms.length)

const menuTitles = {
  '/dashboard': '首页看板',
  '/alarm': '事件接警',
  '/elevator': '设备档案',
  '/dispatch': '救援调度',
  '/track': '处置跟踪',
  '/maintenance': '维保记录',
  '/complaint': '投诉回访',
  '/statistics': '考核统计'
}

const currentPageTitle = computed(() => menuTitles[route.path] || '电梯困人应急处置平台')

const handleMenuSelect = (index) => {
  activeMenu.value = index
  router.push(index)
}
</script>

<style scoped>
.layout-container {
  height: 100%;
}

.sidebar {
  background: #001529;
  color: #fff;
  overflow: hidden;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 60px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.sidebar-menu {
  border-right: none;
  background: #001529;
}

.sidebar-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.75);
}

.sidebar-menu :deep(.el-menu-item:hover) {
  color: #fff;
  background: rgba(64, 158, 255, 0.2);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  color: #fff;
  background: #409eff;
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  height: 60px;
}

.header-left .page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  color: #606266;
}

.main-content {
  padding: 0;
  background: #f5f7fa;
  overflow-y: auto;
}
</style>
