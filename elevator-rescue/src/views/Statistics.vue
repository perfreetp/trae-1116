<template>
  <div class="page-container">
    <div class="card-section">
      <div class="filter-section">
        <div class="filter-item">
          <span class="filter-label">小区：</span>
          <el-select v-model="filter.community" placeholder="全部小区" clearable style="width: 150px">
            <el-option v-for="c in communities" :key="c" :label="c" :value="c" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">维保单位：</span>
          <el-select v-model="filter.company" placeholder="全部单位" clearable style="width: 180px">
            <el-option v-for="c in companies" :key="c" :label="c" :value="c" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">故障类型：</span>
          <el-select v-model="filter.faultType" placeholder="全部类型" clearable style="width: 160px">
            <el-option
              v-for="fr in store.faultReasons"
              :key="fr.value"
              :label="fr.label"
              :value="fr.value"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">紧急程度：</span>
          <el-select v-model="filter.emergency" placeholder="全部" clearable style="width: 130px">
            <el-option label="一般" value="normal" />
            <el-option label="紧急" value="urgent" />
            <el-option label="特急" value="critical" />
          </el-select>
        </div>
        <div class="filter-item">
          <el-button type="primary" @click="applyFilter">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilter">重置</el-button>
        </div>
      </div>
    </div>

    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">筛选后接警数</div>
          <div class="stat-value" style="color: #409eff">{{ filteredStats.total }}</div>
          <div class="stat-sub">占全部 <span style="color: #67c23a">{{ filteredPercent.total }}%</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">平均到场时间</div>
          <div class="stat-value" style="color: #e6a23c">{{ filteredStats.avgResponseTime }}<small style="font-size: 16px">分钟</small></div>
          <div class="stat-sub">超时 <span style="color: #f56c6c">{{ filteredStats.timeoutCount }} 件</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">准时到达率</div>
          <div class="stat-value" :style="{ color: filteredStats.onTimeRate >= 90 ? '#67c23a' : '#f56c6c' }">
            {{ filteredStats.onTimeRate }}<small style="font-size: 16px">%</small>
          </div>
          <div class="stat-sub">升级支援 <span style="color: #f56c6c">{{ filteredStats.escalatedCount }} 件</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">业主满意度</div>
          <div class="stat-value" style="color: #f56c6c">{{ filteredStats.avgScore }}<small style="font-size: 16px">分</small></div>
          <div class="stat-sub">共 {{ filteredStats.evaluationCount }} 条评价</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <div class="card-section">
          <div class="card-title">
            <el-icon><Trophy /></el-icon>
            维保单位月度排名
          </div>
          <el-table :data="filteredRanking" stripe>
            <el-table-column label="排名" width="70" align="center">
              <template #default="{ $index }">
                <el-tag v-if="$index < 3" :type="rankType($index)" size="small">
                  {{ $index + 1 }}
                </el-tag>
                <span v-else>{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="company" label="维保单位" show-overflow-tooltip />
            <el-table-column prop="total" label="接警数" width="80" align="center" />
            <el-table-column label="准时率" width="100" align="center">
              <template #default="{ row }">
                <span :style="{ color: row.onTimeRate >= 90 ? '#67c23a' : '#e6a23c' }">
                  {{ row.onTimeRate }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column label="平均响应" width="100" align="center">
              <template #default="{ row }">{{ row.avgResponseTime }}分钟</template>
            </el-table-column>
            <el-table-column label="满意度" width="100" align="center">
              <template #default="{ row }">
                <el-rate v-model="row.avgScore" disabled :size="13" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="card-section">
          <div class="card-title">
            <el-icon><DataLine /></el-icon>
            高频故障分析
          </div>
          <div ref="faultChartRef" style="height: 350px"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <div class="card-section">
          <div class="card-title">
            <el-icon><Timer /></el-icon>
            响应时长趋势
          </div>
          <div ref="trendChartRef" style="height: 300px"></div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="card-section">
          <div class="card-title">
            <el-icon><Star /></el-icon>
            业主评价汇总
          </div>
          <div class="evaluation-summary">
            <div class="avg-score-box">
              <div class="avg-score">{{ filteredStats.avgScore }}</div>
              <div class="avg-stars">
                <el-rate :model-value="parseFloat(filteredStats.avgScore)" disabled :size="18" />
              </div>
              <div class="avg-tip">综合评分（满分5分）</div>
            </div>
            <div class="score-distribution">
              <div v-for="item in filteredEvaluation.distribution" :key="item.score" class="score-item">
                <span class="score-label">{{ item.score }}星</span>
                <el-progress
                  :percentage="item.percent"
                  :stroke-width="12"
                  :color="progressColor(item.score)"
                  show-text
                />
                <span class="score-count">{{ item.count }}条</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="card-section">
      <div class="card-title">
        <el-icon><Document /></el-icon>
        已结案事件列表
      </div>
      <el-table :data="filteredClosedAlarms" stripe>
        <el-table-column prop="alarmNo" label="接警编号" width="150" />
        <el-table-column label="电梯信息" width="200">
          <template #default="{ row }">
            <div>{{ row.elevator?.buildingName }}</div>
            <div style="color: #909399; font-size: 12px">{{ row.elevator?.elevatorNo }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="trappedCount" label="被困人数" width="80" align="center" />
        <el-table-column label="救援人员" width="100">
          <template #default="{ row }">{{ row.rescuer?.name }}</template>
        </el-table-column>
        <el-table-column label="响应时长" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.dispatchTime && row.arriveTime" :style="{ color: isTimeout(row) ? '#f56c6c' : '#67c23a' }">
              {{ getResponseTime(row) }}分钟
              <el-tag v-if="isTimeout(row)" type="danger" size="small" style="margin-left: 2px">超时</el-tag>
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="故障原因" width="120">
          <template #default="{ row }">
            {{ row.faultReason ? store.getFaultReasonLabel(row.faultReason) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="升级支援" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isEscalated" type="danger" size="small">已升级</el-tag>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column label="业主评价" width="120" align="center">
          <template #default="{ row }">
            <el-rate v-if="row.evaluation" :model-value="row.evaluation.score" disabled :size="13" />
            <span v-else style="color: #909399">未评价</span>
          </template>
        </el-table-column>
        <el-table-column prop="closeTime" label="结案时间" width="160" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewReport(row)">复盘报告</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="reportVisible" title="事件复盘报告" width="750px">
      <template v-if="currentReport">
        <div class="report-content">
          <h3 style="text-align: center; margin-bottom: 20px">电梯困人事件复盘报告</h3>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="接警编号">{{ currentReport.alarmNo }}</el-descriptions-item>
            <el-descriptions-item label="结案时间">{{ currentReport.closeTime }}</el-descriptions-item>
            <el-descriptions-item label="电梯编号">{{ currentReport.elevator?.elevatorNo }}</el-descriptions-item>
            <el-descriptions-item label="所在楼盘">{{ currentReport.elevator?.buildingName }}</el-descriptions-item>
            <el-descriptions-item label="接警时间">{{ currentReport.alarmTime }}</el-descriptions-item>
            <el-descriptions-item label="派遣时间">{{ currentReport.dispatchTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="到场时间">{{ currentReport.arriveTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="被困人数">{{ currentReport.trappedCount }} 人</el-descriptions-item>
            <el-descriptions-item label="是否超时">
              <el-tag :type="isTimeout(currentReport) ? 'danger' : 'success'" size="small">
                {{ isTimeout(currentReport) ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="是否升级支援">
              <el-tag :type="currentReport.isEscalated ? 'danger' : 'success'" size="small">
                {{ currentReport.isEscalated ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <div class="report-section">
            <h4>一、处置过程</h4>
            <ul>
              <li>{{ currentReport.alarmTime }} 接警登记，被困 {{ currentReport.trappedCount }} 人，紧急程度：{{ emergencyLabel(currentReport.emergencyLevel) }}</li>
              <li v-if="currentReport.dispatchTime">{{ currentReport.dispatchTime }} 派遣救援人员 {{ currentReport.rescuer?.name }}（{{ currentReport.rescuer?.company }}）</li>
              <li v-if="currentReport.isEscalated">{{ currentReport.escalateTime }} 超时升级支援，备援人员 {{ currentReport.backupRescuer?.name }} 派出</li>
              <li v-if="currentReport.arriveTime">{{ currentReport.arriveTime }} 救援人员到场，响应时长 {{ getResponseTime(currentReport) }} 分钟</li>
              <li v-if="currentReport.closeTime">{{ currentReport.closeTime }} 案件结案</li>
            </ul>
          </div>

          <div class="report-section">
            <h4>二、故障原因分析</h4>
            <p>故障类型：{{ currentReport.faultReason ? store.getFaultReasonLabel(currentReport.faultReason) : '-' }}</p>
            <p>详细说明：{{ currentReport.faultReasonDetail || '暂无' }}</p>
          </div>

          <div class="report-section">
            <h4>三、改进建议</h4>
            <ul>
              <li v-if="isTimeout(currentReport)" style="color: #f56c6c">⚠ 本次响应超时（{{ getResponseTime(currentReport) }}分钟），建议优化救援调度流程</li>
              <li v-if="currentReport.isEscalated" style="color: #f56c6c">⚠ 本次升级支援，建议加强维保单位救援力量配置</li>
              <li>建议加强电梯日常维护保养，重点检查{{ currentReport.faultReason ? store.getFaultReasonLabel(currentReport.faultReason) : '相关部件' }}</li>
              <li>定期对物业人员进行应急处置培训</li>
              <li>优化救援调度流程，缩短响应时间</li>
            </ul>
          </div>

          <div v-if="currentReport.evaluation" class="report-section">
            <h4>四、业主评价</h4>
            <p>评分：<el-rate :model-value="currentReport.evaluation.score" disabled :size="15" /></p>
            <p>评价：{{ currentReport.evaluation.comment || '无' }}</p>
          </div>

          <div class="report-section">
            <h4>五、操作留痕</h4>
            <el-timeline>
              <el-timeline-item
                v-for="(log, idx) in reportAuditLogs"
                :key="idx"
                :timestamp="log.time"
                :type="logTypeColor(log.actionType)"
                placement="top"
                size="large"
              >
                <div class="log-content">
                  <div class="log-text">{{ log.content }}</div>
                  <div class="log-meta">
                    <el-tag size="small">{{ log.operator }}</el-tag>
                    <span style="margin-left: 8px; color: #909399; font-size: 12px;">{{ roleLabel(log.operatorRole) }}</span>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
            <div v-if="reportAuditLogs.length === 0" class="empty-tip">暂无操作记录</div>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const store = useAppStore()

const filter = reactive({
  community: '',
  company: '',
  faultType: '',
  emergency: ''
})

const faultChartRef = ref(null)
const trendChartRef = ref(null)
const reportVisible = ref(false)
const currentReport = ref(null)

const communities = computed(() => {
  const set = new Set()
  store.elevators.forEach(e => set.add(e.buildingName))
  return Array.from(set)
})

const companies = computed(() => {
  const set = new Set()
  store.rescuers.forEach(r => set.add(r.company))
  return Array.from(set)
})

const applyFilter = () => {
  store.setStatsFilter({
    community: filter.community,
    company: filter.company,
    faultType: filter.faultType,
    emergency: filter.emergency
  })
  nextTick(() => {
    initFaultChart()
    initTrendChart()
  })
}

const resetFilter = () => {
  filter.community = ''
  filter.company = ''
  filter.faultType = ''
  filter.emergency = ''
  store.resetStatsFilter()
  nextTick(() => {
    initFaultChart()
    initTrendChart()
  })
}

const filteredStats = computed(() => {
  const alarms = store.filteredAlarms
  const closed = alarms.filter(a => a.status === 'closed')
  const total = alarms.length
  const timeoutCount = closed.filter(isTimeout).length
  const escalatedCount = alarms.filter(a => a.isEscalated).length
  
  const responseTimes = closed
    .filter(a => a.dispatchTime && a.arriveTime)
    .map(a => getResponseTime(a))
  
  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0
  
  const onTimeCount = responseTimes.filter(t => t <= 30).length
  const onTimeRate = closed.length > 0
    ? Math.round((onTimeCount / closed.length) * 100)
    : 100
  
  const evaluated = closed.filter(a => a.evaluation)
  const scores = evaluated.map(a => a.evaluation.score)
  const avgScore = scores.length > 0
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : '4.5'
  
  return {
    total,
    avgResponseTime,
    timeoutCount,
    escalatedCount,
    onTimeRate,
    avgScore,
    evaluationCount: evaluated.length
  }
})

const filteredPercent = computed(() => {
  return {
    total: store.alarms.length > 0
      ? Math.round((filteredStats.value.total / store.alarms.length) * 100)
      : 100
  }
})

const filteredRanking = computed(() => {
  return store.monthlyRanking
})

const filteredClosedAlarms = computed(() => {
  return store.filteredAlarms.filter(a => a.status === 'closed')
})

const filteredEvaluation = computed(() => {
  return store.evaluationStats
})

const hasData = computed(() => {
  return store.filteredAlarms.length > 0
})

const rankType = (index) => {
  const types = ['danger', 'warning', 'info']
  return types[index] || ''
}

const progressColor = (score) => {
  const colors = ['#f56c6c', '#e6a23c', '#e6a23c', '#67c23a', '#67c23a']
  return colors[score - 1] || '#909399'
}

const getResponseTime = (alarm) => {
  if (!alarm.dispatchTime || !alarm.arriveTime) return 0
  return dayjs(alarm.arriveTime).diff(dayjs(alarm.dispatchTime), 'minute')
}

const isTimeout = (alarm) => {
  return getResponseTime(alarm) > 30
}

const emergencyLabel = (level) => {
  const map = { normal: '一般', urgent: '紧急', critical: '特急' }
  return map[level] || '一般'
}

const roleLabel = (role) => {
  const map = { supervisor: '市场监管', property: '物业公司', maintenance: '维保单位', rescuer: '救援人员', system: '系统' }
  return map[role] || role
}

const viewReport = (row) => {
  currentReport.value = row
  reportVisible.value = true
}

const reportAuditLogs = computed(() => {
  if (!currentReport.value) return []
  return store.getAlarmAuditLogs(currentReport.value.id)
})

const logTypeColor = (actionType) => {
  const map = {
    alarm: '',
    dispatch: 'warning',
    arrive: 'primary',
    comfort: 'success',
    escalate: 'danger',
    backup_arrive: 'warning',
    support_complete: 'info',
    close: 'success'
  }
  return map[actionType] || ''
}

const initFaultChart = () => {
  if (!faultChartRef.value) return
  const chart = echarts.init(faultChartRef.value)
  if (!hasData.value) {
    chart.setOption({
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: { color: '#909399', fontSize: 16 }
      }
    })
    return
  }
  const data = store.faultTypeStats
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      label: { show: true, formatter: '{b}\n{d}%' },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      },
      data
    }]
  }, true)
}

const initTrendChart = () => {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value)
  if (!hasData.value) {
    chart.setOption({
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: { color: '#909399', fontSize: 16 }
      }
    })
    return
  }
  const data = store.avgResponseTimeTrend
  chart.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}<br/>平均响应: {c}分钟' },
    grid: { left: 50, right: 30, top: 30, bottom: 40 },
    xAxis: { type: 'category', data: data.map(d => d.date), boundaryGap: false },
    yAxis: { type: 'value', name: '分钟', min: 0, max: 60,
      splitLine: { show: true },
      axisLabel: { formatter: '{value}分' }
    },
    series: [{
      name: '平均响应时长',
      data: data.map(d => d.time),
      type: 'line',
      smooth: true,
      markLine: {
        silent: true,
        data: [{ yAxis: 30, name: '超时预警线', lineStyle: { color: '#f56c6c', type: 'dashed' } }]
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
      },
      lineStyle: { color: '#409eff', width: 2 },
      itemStyle: { color: '#409eff' }
    }]
  }, true)
}

onMounted(() => {
  nextTick(() => {
    initFaultChart()
    initTrendChart()
  })
})

watch(() => store.statsFilter, () => {
  nextTick(() => {
    initFaultChart()
    initTrendChart()
  })
}, { deep: true })
</script>

<style scoped>
.filter-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
}

.stat-card .stat-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-card .stat-value {
  font-size: 32px;
  font-weight: 700;
  margin: 8px 0;
}

.stat-card .stat-sub {
  color: #909399;
  font-size: 12px;
}

.evaluation-summary {
  display: flex;
  gap: 30px;
}

.avg-score-box {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  min-width: 140px;
}

.avg-score {
  font-size: 48px;
  font-weight: 700;
  color: #f56c6c;
  line-height: 1;
}

.avg-stars {
  margin: 10px 0;
}

.avg-tip {
  font-size: 12px;
  color: #909399;
}

.score-distribution {
  flex: 1;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.score-label {
  width: 40px;
  font-size: 13px;
}

.score-item :deep(.el-progress) {
  flex: 1;
}

.score-count {
  width: 50px;
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.report-content {
  padding: 10px;
}

.report-section {
  margin-top: 20px;
}

.report-section h4 {
  margin-bottom: 10px;
  color: #303133;
}

.report-section ul {
  padding-left: 20px;
  color: #606266;
}

.report-section li {
  margin: 6px 0;
}

.report-section p {
  color: #606266;
  margin: 6px 0;
}
</style>
