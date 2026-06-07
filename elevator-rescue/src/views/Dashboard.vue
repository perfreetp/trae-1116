<template>
  <div class="page-container">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <div class="stat-card">
          <el-icon :size="28" color="#409eff"><Bell /></el-icon>
          <div class="stat-value" style="color: #409eff">{{ store.todayAlarmCount }}</div>
          <div class="stat-label">今日接警</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <el-icon :size="28" color="#e6a23c"><Loading /></el-icon>
          <div class="stat-value" style="color: #e6a23c">{{ store.processingCount }}</div>
          <div class="stat-label">处置中</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <el-icon :size="28" color="#f56c6c"><Warning /></el-icon>
          <div class="stat-value" style="color: #f56c6c">{{ store.escalatedAlarms.length }}</div>
          <div class="stat-label">需支援</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <el-icon :size="28" color="#67c23a"><CircleCheck /></el-icon>
          <div class="stat-value" style="color: #67c23a">{{ store.todayClosedCount }}</div>
          <div class="stat-label">今日结案</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <div class="card-section">
          <div class="card-title">
            <span>最新接警列表</span>
            <el-button type="primary" text @click="$router.push('/alarm')">更多 ></el-button>
          </div>
          <el-table :data="recentAlarms" stripe>
            <el-table-column prop="alarmNo" label="接警编号" width="150" />
            <el-table-column label="电梯信息" width="200">
              <template #default="{ row }">
                <div>{{ row.elevator?.buildingName }}</div>
                <div style="color: #909399; font-size: 12px">{{ row.elevator?.elevatorNo }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="trappedCount" label="被困人数" width="90" align="center" />
            <el-table-column label="紧急程度" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="emergencyType(row.emergencyLevel)" size="small">
                  {{ emergencyLabel(row.emergencyLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">
                  {{ statusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="alarmTime" label="接警时间" width="160" />
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewDetail(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="card-section">
          <div class="card-title">故障类型分布</div>
          <div ref="faultChartRef" style="height: 300px"></div>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="card-section">
          <div class="card-title">超时预警 & 支援请求</div>
          <div v-if="store.timeoutAlarms.length === 0 && store.escalatedAlarms.length === 0" class="empty-tip">
            <el-empty description="暂无预警和支援请求" :image-size="80" />
          </div>
          <div v-else>
            <div v-for="alarm in store.escalatedAlarms" :key="alarm.id" class="timeout-item escalated">
              <div class="timeout-header">
                <el-tag type="danger" effect="dark" class="warning-badge">支援请求</el-tag>
                <span class="timeout-no">{{ alarm.alarmNo }}</span>
              </div>
              <div class="timeout-info">
                <p><el-icon><Location /></el-icon> {{ alarm.elevator?.buildingName }}</p>
                <p><el-icon><User /></el-icon> 被困 {{ alarm.trappedCount }} 人</p>
                <p><el-icon><Phone /></el-icon> 备援：{{ alarm.backupRescuer?.name || '-' }}</p>
              </div>
            </div>
            <div v-for="alarm in store.timeoutAlarms.filter(a => !a.isEscalated)" :key="alarm.id" class="timeout-item">
              <div class="timeout-header">
                <el-tag type="danger" effect="dark" class="warning-badge">超时预警</el-tag>
                <span class="timeout-no">{{ alarm.alarmNo }}</span>
              </div>
              <div class="timeout-info">
                <p><el-icon><Location /></el-icon> {{ alarm.elevator?.buildingName }}</p>
                <p><el-icon><User /></el-icon> 被困 {{ alarm.trappedCount }} 人</p>
                <p><el-icon><Timer /></el-icon> 已超时 {{ getTimeoutMinutes(alarm) }} 分钟</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card-section">
          <div class="card-title">救援人员状态</div>
          <div class="rescuer-list">
            <div v-for="rescuer in store.rescuers" :key="rescuer.id" class="rescuer-item">
              <div class="rescuer-info">
                <el-avatar :size="36" :icon="User" />
                <div>
                  <div class="rescuer-name">
                    {{ rescuer.name }}
                    <el-tag v-if="rescuer.isBackup" size="small" type="danger" style="margin-left: 4px">备援</el-tag>
                  </div>
                  <div class="rescuer-company">{{ rescuer.company }}</div>
                  <div v-if="rescuer.isBackup && rescuer.status === 'idle'" class="rescuer-area">
                    区域：{{ rescuer.area }} · 预计 {{ rescuer.estimatedArrival }} 分钟到达
                  </div>
                </div>
              </div>
              <el-tag :type="rescuer.status === 'idle' ? 'success' : 'warning'" size="small">
                {{ rescuer.status === 'idle' ? '空闲' : '出警中' }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="card-section">
          <div class="card-title">响应时长趋势</div>
          <div ref="trendChartRef" style="height: 250px"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const router = useRouter()
const store = useAppStore()
const faultChartRef = ref(null)
const trendChartRef = ref(null)

const recentAlarms = computed(() => store.alarms.slice(0, 8))

const emergencyType = (level) => {
  const map = { normal: '', urgent: 'warning', critical: 'danger' }
  return map[level] || ''
}

const emergencyLabel = (level) => {
  const map = { normal: '一般', urgent: '紧急', critical: '特急' }
  return map[level] || '一般'
}

const statusType = (status) => {
  const map = { pending: 'warning', dispatched: 'primary', arrived: 'info', closed: 'success' }
  return map[status] || ''
}

const statusLabel = (status) => {
  const map = { pending: '待派单', dispatched: '已派遣', arrived: '已到场', closed: '已结案' }
  return map[status] || status
}

const getTimeoutMinutes = (alarm) => {
  if (!alarm.dispatchTime) return 0
  return dayjs().diff(dayjs(alarm.dispatchTime), 'minute')
}

const viewDetail = (row) => {
  if (row.status === 'pending') {
    router.push('/dispatch')
  } else if (row.status === 'closed') {
    router.push('/statistics')
  } else {
    router.push('/track')
  }
}

const initFaultChart = () => {
  if (!faultChartRef.value) return
  const chart = echarts.init(faultChartRef.value)
  const data = store.faultTypeStats
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      },
      labelLine: { show: false },
      data
    }]
  })
}

const initTrendChart = () => {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value)
  const data = store.avgResponseTimeTrend
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: data.map(d => d.date), axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', name: '分钟' },
    series: [{
      data: data.map(d => d.time),
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.3 },
      lineStyle: { color: '#409eff' },
      itemStyle: { color: '#409eff' }
    }]
  })
}

onMounted(() => {
  nextTick(() => {
    initFaultChart()
    initTrendChart()
  })
})
</script>

<style scoped>
.stat-row {
  margin-bottom: 20px;
}

.empty-tip {
  padding: 20px 0;
}

.timeout-item {
  padding: 12px;
  background: #fef0f0;
  border-radius: 6px;
  margin-bottom: 10px;
  border-left: 4px solid #f56c6c;
}

.timeout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeout-no {
  font-size: 12px;
  color: #909399;
}

.timeout-info p {
  font-size: 13px;
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
}

.timeout-item.escalated {
  background: #fff1f0;
  border-left-color: #ff4d4f;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.rescuer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rescuer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rescuer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rescuer-name {
  font-size: 14px;
  font-weight: 500;
}

.rescuer-company {
  font-size: 12px;
  color: #909399;
}

.rescuer-area {
  font-size: 11px;
  color: #f56c6c;
  margin-top: 2px;
}
</style>
