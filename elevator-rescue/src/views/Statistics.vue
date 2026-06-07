<template>
  <div class="page-container">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">本月接警总数</div>
          <div class="stat-value" style="color: #409eff">{{ store.alarms.length }}</div>
          <div class="stat-sub">较上月 <span style="color: #67c23a">+12%</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">平均到场时间</div>
          <div class="stat-value" style="color: #e6a23c">{{ store.avgResponseTime }}<small style="font-size: 16px">分钟</small></div>
          <div class="stat-sub">较上月 <span style="color: #67c23a">-8%</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">准时到达率</div>
          <div class="stat-value" style="color: #67c23a">92<small style="font-size: 16px">%</small></div>
          <div class="stat-sub">较上月 <span style="color: #67c23a">+3%</span></div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">业主满意度</div>
          <div class="stat-value" style="color: #f56c6c">{{ store.evaluationStats.avgScore }}<small style="font-size: 16px">分</small></div>
          <div class="stat-sub">共 {{ store.evaluationStats.total }} 条评价</div>
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
          <el-table :data="store.monthlyRanking" stripe>
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
              <div class="avg-score">{{ store.evaluationStats.avgScore }}</div>
              <div class="avg-stars">
                <el-rate :model-value="parseFloat(store.evaluationStats.avgScore)" disabled :size="18" />
              </div>
              <div class="avg-tip">综合评分（满分5分）</div>
            </div>
            <div class="score-distribution">
              <div v-for="item in store.evaluationStats.distribution" :key="item.score" class="score-item">
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
      <el-table :data="store.closedAlarms" stripe>
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
            <span v-if="row.dispatchTime && row.arriveTime">
              {{ getResponseTime(row) }}分钟
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="故障原因" width="120">
          <template #default="{ row }">
            {{ row.faultReason ? store.getFaultReasonLabel(row.faultReason) : '-' }}
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

    <el-dialog v-model="reportVisible" title="事件复盘报告" width="700px">
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
          </el-descriptions>

          <div class="report-section">
            <h4>一、处置过程</h4>
            <ul>
              <li>{{ currentReport.alarmTime }} 接警登记，被困 {{ currentReport.trappedCount }} 人</li>
              <li v-if="currentReport.dispatchTime">{{ currentReport.dispatchTime }} 派遣救援人员 {{ currentReport.rescuer?.name }}</li>
              <li v-if="currentReport.arriveTime">{{ currentReport.arriveTime }} 救援人员到场</li>
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
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const store = useAppStore()

const faultChartRef = ref(null)
const trendChartRef = ref(null)
const reportVisible = ref(false)
const currentReport = ref(null)

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

const viewReport = (row) => {
  currentReport.value = row
  reportVisible.value = true
}

const initFaultChart = () => {
  if (!faultChartRef.value) return
  const chart = echarts.init(faultChartRef.value)
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
  })
}

const initTrendChart = () => {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value)
  const data = store.avgResponseTimeTrend
  chart.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}<br/>平均响应: {c}分钟' },
    grid: { left: 50, right: 30, top: 30, bottom: 40 },
    xAxis: { type: 'category', data: data.map(d => d.date), boundaryGap: false },
    yAxis: { type: 'value', name: '分钟', min: 0 },
    series: [{
      name: '平均响应时长',
      data: data.map(d => d.time),
      type: 'line',
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
      },
      lineStyle: { color: '#409eff', width: 2 },
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
