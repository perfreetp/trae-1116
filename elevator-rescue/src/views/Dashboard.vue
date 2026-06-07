<template>
  <div class="page-container">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="4">
        <div class="stat-card" @click="jumpToDispatch">
          <el-icon :size="28" color="#409eff"><Bell /></el-icon>
          <div class="stat-value" style="color: #409eff">{{ store.todayAlarmCount }}</div>
          <div class="stat-label">今日接警</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card processing" @click="jumpToTrack">
          <el-icon :size="28" color="#e6a23c"><Loading /></el-icon>
          <div class="stat-value" style="color: #e6a23c">{{ store.processingCount }}</div>
          <div class="stat-label">处置中</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card timeout" @click="jumpToDispatch">
          <el-icon :size="28" color="#f56c6c"><Warning /></el-icon>
          <div class="stat-value" style="color: #f56c6c">{{ store.timeoutAlarms.length }}</div>
          <div class="stat-label">已超时</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card escalated" @click="jumpToDispatch">
          <el-icon :size="28" color="#ff4d4f"><Siren /></el-icon>
          <div class="stat-value" style="color: #ff4d4f">{{ store.escalatedAlarms.length }}</div>
          <div class="stat-label">支援请求</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card idle">
          <el-icon :size="28" color="#67c23a"><UserFilled /></el-icon>
          <div class="stat-value" style="color: #67c23a">{{ store.idleRescuers.length }}</div>
          <div class="stat-label">空闲救援</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card closed" @click="jumpToStatistics">
          <el-icon :size="28" color="#909399"><CircleCheck /></el-icon>
          <div class="stat-value" style="color: #909399">{{ store.todayClosedCount }}</div>
          <div class="stat-label">今日结案</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="6">
        <div class="card-section area-card">
          <div class="card-title">
            <el-icon><Location /></el-icon>
            区域态势分布
          </div>
          <div class="area-list">
            <div
              v-for="(alarms, area) in store.alarmsByArea"
              :key="area"
              class="area-item"
              @click="selectedArea = selectedArea === area ? null : area"
            >
              <div class="area-header">
                <span class="area-name">{{ area }}</span>
                <el-tag size="small" type="primary">{{ alarms.length }} 件</el-tag>
              </div>
              <div class="area-stats">
                <span class="stat-item">
                  <span class="dot pending"></span>
                  待派 {{ alarms.filter(a => a.status === 'pending').length }}
                </span>
                <span class="stat-item">
                  <span class="dot dispatched"></span>
                  处置中 {{ alarms.filter(a => a.status === 'dispatched' || a.status === 'arrived').length }}
                </span>
                <span class="stat-item">
                  <span class="dot escalated"></span>
                  支援 {{ alarms.filter(a => a.isEscalated).length }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-section">
          <div class="card-title">
            <el-icon><User /></el-icon>
            救援力量分布
          </div>
          <div class="rescuer-stats">
            <div v-for="area in store.areas" :key="area" class="rescuer-area">
              <div class="area-title">{{ area }}</div>
              <div class="rescuer-counts">
                <span class="available">
                  <el-icon><CircleCheck /></el-icon>
                  空闲 {{ store.rescuers.filter(r => r.area === area && r.status === 'idle' && !r.isBackup).length }}
                </span>
                <span class="backup">
                  <el-icon><FirstAidKit /></el-icon>
                  备援 {{ store.rescuers.filter(r => r.area === area && r.status === 'idle' && r.isBackup).length }}
                </span>
                <span class="busy">
                  <el-icon><Loading /></el-icon>
                  出警 {{ store.rescuers.filter(r => r.area === area && r.status === 'busy').length }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="card-section">
          <div class="card-title">
            <el-icon><List /></el-icon>
            实时事件列表
            <el-tag v-if="selectedArea" size="small" type="info" style="margin-left: 8px">
              {{ selectedArea }}
              <el-icon style="cursor: pointer" @click.stop="selectedArea = null"><Close /></el-icon>
            </el-tag>
          </div>
          <div class="event-list-header">
            <span class="col-status">状态</span>
            <span class="col-info">事件信息</span>
            <span class="col-time">计时</span>
            <span class="col-action">操作</span>
          </div>
          <div class="event-list">
            <div
              v-for="alarm in displayAlarms"
              :key="alarm.id"
              class="event-row"
              :class="{ 'is-timeout': isTimeout(alarm), 'is-escalated': alarm.isEscalated }"
            >
              <div class="col-status">
                <el-tag :type="statusType(alarm.status)" size="small" effect="dark">
                  {{ statusLabel(alarm.status) }}
                </el-tag>
                <el-tag v-if="alarm.isEscalated" size="small" type="danger" effect="dark" style="margin-top: 4px">
                  {{ store.getEscalationStatusLabel(alarm.escalationStatus) }}
                </el-tag>
              </div>
              <div class="col-info">
                <div class="event-no">{{ alarm.alarmNo }}</div>
                <div class="event-building">{{ alarm.elevator?.buildingName }}</div>
                <div class="event-detail">
                  <span>被困 {{ alarm.trappedCount }} 人</span>
                  <el-tag :type="emergencyType(alarm.emergencyLevel)" size="small" style="margin-left: 4px">
                    {{ emergencyLabel(alarm.emergencyLevel) }}
                  </el-tag>
                </div>
              </div>
              <div class="col-time">
                <div class="timer" :class="{ 'timer-danger': isTimeout(alarm) }">
                  {{ formatTimer(alarm) }}
                </div>
                <div class="timer-label">
                  {{ alarm.status === 'pending' ? '待派时间' : alarm.status === 'closed' ? '已结案' : '已派遣' }}
                </div>
              </div>
              <div class="col-action">
                <el-button
                  v-if="alarm.status === 'pending'"
                  type="primary"
                  size="small"
                  @click="goToDispatch(alarm)"
                >
                  去派单
                </el-button>
                <el-button
                  v-else-if="alarm.status !== 'closed'"
                  type="success"
                  size="small"
                  @click="goToCollaboration(alarm)"
                >
                  协同处置
                </el-button>
                <el-button
                  v-else
                  type="info"
                  size="small"
                  @click="goToStatistics(alarm)"
                >
                  查看复盘
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="card-section">
          <div class="card-title">
            <el-icon><Warning /></el-icon>
            超时预警 & 支援请求
          </div>
          <div v-if="store.timeoutAlarms.length === 0 && store.escalatedAlarms.length === 0" class="empty-tip">
            <el-empty description="暂无预警和支援请求" :image-size="80" />
          </div>
          <div v-else class="alert-list">
            <div
              v-for="alarm in store.escalatedAlarms"
              :key="'escalated-' + alarm.id"
              class="alert-item escalated"
              @click="goToDispatch(alarm)"
            >
              <div class="alert-tag">
                <el-icon><Siren /></el-icon>
                支援请求
              </div>
              <div class="alert-info">
                <div class="alert-title">{{ alarm.alarmNo }} - {{ alarm.elevator?.buildingName }}</div>
                <div class="alert-desc">
                  被困 {{ alarm.trappedCount }} 人 · 备援：{{ alarm.backupRescuer?.name || '待派遣' }}
                  <el-tag size="small" type="danger" style="margin-left: 8px">
                    {{ store.getEscalationStatusLabel(alarm.escalationStatus) }}
                  </el-tag>
                </div>
              </div>
              <div class="alert-time">
                {{ getEscalatedMinutes(alarm) }} 分钟前
              </div>
            </div>
            <div
              v-for="alarm in store.timeoutAlarms.filter(a => !a.isEscalated)"
              :key="'timeout-' + alarm.id"
              class="alert-item timeout"
              @click="goToDispatch(alarm)"
            >
              <div class="alert-tag">
                <el-icon><Timer /></el-icon>
                超时预警
              </div>
              <div class="alert-info">
                <div class="alert-title">{{ alarm.alarmNo }} - {{ alarm.elevator?.buildingName }}</div>
                <div class="alert-desc">
                  被困 {{ alarm.trappedCount }} 人 · 救援：{{ alarm.rescuer?.name }}
                </div>
              </div>
              <div class="alert-time">
                超时 {{ getTimeoutMinutes(alarm) }} 分钟
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="card-section">
          <div class="card-title">
            <el-icon><DataLine /></el-icon>
            故障类型分布
          </div>
          <div ref="faultChartRef" style="height: 280px"></div>
        </div>

        <div class="card-section">
          <div class="card-title">
            <el-icon><TrendCharts /></el-icon>
            响应时长趋势
          </div>
          <div ref="trendChartRef" style="height: 250px"></div>
        </div>

        <div class="card-section">
          <div class="card-title">
            <el-icon><Trophy /></el-icon>
            实时排名 TOP3
          </div>
          <div class="ranking-list">
            <div
              v-for="(item, idx) in store.monthlyRanking.slice(0, 3)"
              :key="item.company"
              class="ranking-item"
            >
              <div class="ranking-no" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</div>
              <div class="ranking-info">
                <div class="ranking-company">{{ item.company }}</div>
                <div class="ranking-detail">
                  准时率 <span :style="{ color: item.onTimeRate >= 90 ? '#67c23a' : '#e6a23c' }">{{ item.onTimeRate }}%</span>
                  · 平均 {{ item.avgResponseTime }}分钟
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const router = useRouter()
const store = useAppStore()
const faultChartRef = ref(null)
const trendChartRef = ref(null)
const selectedArea = ref(null)
const tickTimer = ref(null)
const tick = ref(0)

const displayAlarms = computed(() => {
  let alarms = store.allActiveAlarms
  if (selectedArea.value) {
    alarms = alarms.filter(a => a.elevator?.area === selectedArea.value)
  }
  return alarms.slice(0, 8)
})

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

const isTimeout = (alarm) => {
  if (alarm.status !== 'dispatched' || !alarm.dispatchTime) return false
  return dayjs().diff(dayjs(alarm.dispatchTime), 'minute') > 30
}

const formatTimer = (alarm) => {
  tick.value
  if (alarm.status === 'pending') {
    const diff = dayjs().diff(dayjs(alarm.alarmTime), 'minute')
    return `${diff} 分钟`
  }
  if (alarm.status === 'dispatched' && alarm.dispatchTime) {
    const diff = dayjs().diff(dayjs(alarm.dispatchTime), 'minute')
    return `${diff} 分钟`
  }
  if (alarm.status === 'arrived' && alarm.arriveTime) {
    const diff = dayjs().diff(dayjs(alarm.arriveTime), 'minute')
    return `到场 ${diff} 分钟`
  }
  if (alarm.status === 'closed') {
    return '已结案'
  }
  return '-'
}

const getTimeoutMinutes = (alarm) => {
  if (!alarm.dispatchTime) return 0
  return dayjs().diff(dayjs(alarm.dispatchTime), 'minute') - 30
}

const getEscalatedMinutes = (alarm) => {
  if (!alarm.escalateTime) return 0
  return dayjs().diff(dayjs(alarm.escalateTime), 'minute')
}

const jumpToDispatch = () => router.push('/dispatch')
const jumpToTrack = () => router.push('/track')
const jumpToStatistics = () => router.push('/statistics')

const goToDispatch = (alarm) => {
  router.push('/dispatch')
}

const goToCollaboration = (alarm) => {
  router.push('/collaboration')
}

const goToStatistics = (alarm) => {
  router.push('/statistics')
}

const initFaultChart = () => {
  if (!faultChartRef.value) return
  const chart = echarts.init(faultChartRef.value)
  const data = store.faultTypeStats
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 5, top: 'center', textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 13, fontWeight: 'bold' }
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
  tickTimer.value = setInterval(() => {
    tick.value++
  }, 1000)
})

onUnmounted(() => {
  if (tickTimer.value) clearInterval(tickTimer.value)
})
</script>

<style scoped>
.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
}

.stat-card .stat-value {
  font-size: 28px;
  font-weight: 700;
  margin: 8px 0;
}

.stat-card .stat-label {
  color: #909399;
  font-size: 13px;
}

.area-card {
  margin-bottom: 20px;
}

.area-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.area-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.area-item:hover {
  background: #ecf5ff;
  border-left-color: #409eff;
}

.area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.area-name {
  font-weight: 600;
  font-size: 14px;
}

.area-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #606266;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.dot.pending { background: #e6a23c; }
.dot.dispatched { background: #409eff; }
.dot.escalated { background: #f56c6c; }

.rescuer-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rescuer-area .area-title {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
}

.rescuer-counts {
  display: flex;
  gap: 10px;
  font-size: 12px;
}

.rescuer-counts span {
  display: flex;
  align-items: center;
  gap: 2px;
}

.rescuer-counts .available { color: #67c23a; }
.rescuer-counts .backup { color: #f56c6c; }
.rescuer-counts .busy { color: #e6a23c; }

.event-list-header {
  display: flex;
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.col-status { width: 90px; }
.col-info { flex: 1; }
.col-time { width: 100px; text-align: center; }
.col-action { width: 100px; text-align: right; }

.event-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 380px;
  overflow-y: auto;
}

.event-row {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  transition: all 0.2s;
}

.event-row:hover {
  border-color: #409eff;
  background: #f5faff;
}

.event-row.is-timeout {
  border-color: #f56c6c;
  background: #fef0f0;
  animation: blink 2s infinite;
}

.event-row.is-escalated {
  border-color: #ff4d4f;
  background: #fff2f0;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.event-no {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 2px;
}

.event-building {
  font-size: 12px;
  color: #606266;
  margin-bottom: 2px;
}

.event-detail {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
}

.timer {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.timer.timer-danger {
  color: #f56c6c;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.timer-label {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.alert-item.escalated {
  background: linear-gradient(90deg, #fff2f0 0%, #fff 100%);
  border-left: 4px solid #ff4d4f;
}

.alert-item.timeout {
  background: linear-gradient(90deg, #fef0f0 0%, #fff 100%);
  border-left: 4px solid #f56c6c;
}

.alert-item:hover {
  transform: translateX(4px);
}

.alert-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #f56c6c;
  white-space: nowrap;
}

.alert-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
}

.alert-desc {
  font-size: 12px;
  color: #606266;
}

.alert-time {
  margin-left: auto;
  font-size: 12px;
  color: #f56c6c;
  white-space: nowrap;
}

.empty-tip {
  padding: 20px 0;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.ranking-no {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  color: #fff;
}

.ranking-no.rank-1 { background: #f56c6c; }
.ranking-no.rank-2 { background: #e6a23c; }
.ranking-no.rank-3 { background: #909399; }

.ranking-company {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
}

.ranking-detail {
  font-size: 11px;
  color: #909399;
}
</style>
