<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="16">
        <div class="card-section">
          <div class="card-title">
            <el-icon><List /></el-icon>
            待派单列表
            <el-tag size="small" type="warning" style="margin-left: 10px">{{ store.pendingDispatchAlarms.length }} 单</el-tag>
          </div>
          <el-table :data="store.pendingDispatchAlarms" stripe empty-text="暂无待派单">
            <el-table-column prop="alarmNo" label="接警编号" width="150" />
            <el-table-column label="电梯信息" width="200">
              <template #default="{ row }">
                <div style="font-weight: 500">{{ row.elevator?.buildingName }}</div>
                <div style="color: #909399; font-size: 12px">{{ row.elevator?.elevatorNo }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="reporterName" label="报警人" width="90" />
            <el-table-column prop="trappedCount" label="被困人数" width="80" align="center">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: 600">{{ row.trappedCount }}人</span>
              </template>
            </el-table-column>
            <el-table-column label="特殊情况" width="120">
              <template #default="{ row }">
                <span v-if="row.specialPerson && row.specialPerson !== '无'" style="color: #e6a23c">
                  {{ row.specialPerson }}
                </span>
                <span v-else style="color: #909399">无</span>
              </template>
            </el-table-column>
            <el-table-column label="紧急程度" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="emergencyType(row.emergencyLevel)" size="small" effect="dark">
                  {{ emergencyLabel(row.emergencyLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="等待时长" width="100" align="center">
              <template #default="{ row }">
                <span :class="{ 'timeout-text': getWaitMinutes(row) > 15 }">
                  {{ getWaitMinutes(row) }} 分钟
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="alarmTime" label="接警时间" width="140" />
            <el-table-column label="操作" width="120" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="openDispatchDialog(row)">
                  派遣
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="card-section">
          <div class="card-title">
            <el-icon><Van /></el-icon>
            进行中的任务
            <el-tag size="small" type="primary" style="margin-left: 10px">{{ store.dispatchedAlarms.length }} 单</el-tag>
          </div>
          <el-table :data="store.dispatchedAlarms" stripe empty-text="暂无进行中的任务">
            <el-table-column prop="alarmNo" label="接警编号" width="140" />
            <el-table-column label="电梯信息" width="180">
              <template #default="{ row }">
                <div>{{ row.elevator?.buildingName }}</div>
                <div style="color: #909399; font-size: 12px">{{ row.elevator?.elevatorNo }}</div>
              </template>
            </el-table-column>
            <el-table-column label="救援人员" width="120">
              <template #default="{ row }">{{ row.rescuer?.name }}</template>
            </el-table-column>
            <el-table-column label="派遣时间" width="140">
              <template #default="{ row }">{{ row.dispatchTime }}</template>
            </el-table-column>
            <el-table-column label="到场计时" width="160" align="center">
              <template #default="{ row }">
                <div v-if="row.status === 'arrived'" style="color: #67c23a">
                  <el-icon><CircleCheck /></el-icon>
                  已到场 ({{ row.arriveTime }})
                </div>
                <div v-else class="timer-box" :class="{ 'timeout-box': isTimeout(row) }">
                  <div class="timer-value">{{ formatTimer(row) }}</div>
                  <div class="timer-label">
                    {{ isTimeout(row) ? '已超时' : '响应倒计时' }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'arrived' ? 'success' : 'primary'" size="small">
                  {{ row.status === 'arrived' ? '已到场' : '已派遣' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'dispatched'"
                  type="success"
                  size="small"
                  @click="markArrived(row)"
                >
                  到场签到
                </el-button>
                <el-button v-else type="primary" link size="small" @click="goToTrack(row)">
                  处置跟踪
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="card-section" v-if="store.timeoutAlarms.length > 0">
          <div class="card-title" style="color: #f56c6c">
            <el-icon><Warning /></el-icon>
            超时预警
            <el-badge :value="store.timeoutAlarms.length" class="warning-badge" type="danger" />
          </div>
          <div class="timeout-list">
            <div v-for="alarm in store.timeoutAlarms" :key="alarm.id" class="timeout-card">
              <div class="timeout-card-header">
                <el-tag type="danger" effect="dark">{{ alarm.alarmNo }}</el-tag>
                <span class="timeout-minutes">
                  超时 {{ getTimeoutMinutes(alarm) }} 分钟
                </span>
              </div>
              <div class="timeout-card-body">
                <p><el-icon><Location /></el-icon> {{ alarm.elevator?.buildingName }}</p>
                <p><el-icon><User /></el-icon> 被困 {{ alarm.trappedCount }} 人</p>
                <p><el-icon><Phone /></el-icon> {{ alarm.reporterName }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card-section">
          <div class="card-title">
            <el-icon><User /></el-icon>
            救援人员状态
          </div>
          <div class="rescuer-status-list">
            <div v-for="rescuer in store.rescuers" :key="rescuer.id" class="rescuer-status-item">
              <div class="rescuer-info">
                <el-avatar :size="40" :icon="User" />
                <div>
                  <div class="rescuer-name">{{ rescuer.name }}</div>
                  <div class="rescuer-company">{{ rescuer.company }}</div>
                </div>
              </div>
              <div class="rescuer-status">
                <el-tag :type="rescuer.status === 'idle' ? 'success' : 'warning'" size="small">
                  {{ rescuer.status === 'idle' ? '空闲' : '出警中' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="dispatchDialogVisible" title="派遣救援人员" width="500px">
      <div v-if="currentAlarm">
        <div class="dispatch-info">
          <p><strong>接警编号：</strong>{{ currentAlarm.alarmNo }}</p>
          <p><strong>电梯位置：</strong>{{ currentAlarm.elevator?.buildingName }}</p>
          <p><strong>被困人数：</strong>{{ currentAlarm.trappedCount }} 人</p>
          <p><strong>维保单位：</strong>{{ currentAlarm.elevator?.maintenanceCompany }}</p>
        </div>
        <el-divider />
        <el-form label-width="100px">
          <el-form-item label="选择救援人员" required>
            <el-select v-model="selectedRescuerId" placeholder="请选择空闲的救援人员" style="width: 100%">
              <el-option
                v-for="rescuer in availableRescuers"
                :key="rescuer.id"
                :label="`${rescuer.name} (${rescuer.company})`"
                :value="rescuer.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dispatchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmDispatch" :disabled="!selectedRescuerId">
            确认派遣
          </el-button>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()
const store = useAppStore()

const dispatchDialogVisible = ref(false)
const currentAlarm = ref(null)
const selectedRescuerId = ref('')
const timer = ref(null)

const availableRescuers = computed(() => {
  if (!currentAlarm.value) return []
  const company = currentAlarm.value.elevator?.maintenanceCompany
  return store.rescuers.filter(r => r.company === company && r.status === 'idle')
})

const emergencyType = (level) => {
  const map = { normal: '', urgent: 'warning', critical: 'danger' }
  return map[level] || ''
}

const emergencyLabel = (level) => {
  const map = { normal: '一般', urgent: '紧急', critical: '特急' }
  return map[level] || '一般'
}

const getWaitMinutes = (alarm) => {
  return dayjs().diff(dayjs(alarm.alarmTime), 'minute')
}

const getTimeoutMinutes = (alarm) => {
  if (!alarm.dispatchTime) return 0
  return Math.max(0, dayjs().diff(dayjs(alarm.dispatchTime), 'minute') - 30)
}

const isTimeout = (alarm) => {
  if (!alarm.dispatchTime || alarm.status === 'arrived') return false
  return dayjs().diff(dayjs(alarm.dispatchTime), 'minute') > 30
}

const formatTimer = (alarm) => {
  if (!alarm.dispatchTime) return '00:00'
  const diff = dayjs().diff(dayjs(alarm.dispatchTime), 'second')
  const minutes = Math.floor(diff / 60)
  const seconds = diff % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const openDispatchDialog = (alarm) => {
  currentAlarm.value = alarm
  selectedRescuerId.value = ''
  dispatchDialogVisible.value = true
}

const confirmDispatch = () => {
  if (!selectedRescuerId.value) {
    ElMessage.warning('请选择救援人员')
    return
  }
  store.dispatchAlarm(currentAlarm.value.id, selectedRescuerId.value)
  ElMessage.success('派遣成功，已通知救援人员')
  dispatchDialogVisible.value = false
}

const markArrived = (alarm) => {
  store.markArrived(alarm.id)
  ElMessage.success('已记录到场时间')
}

const goToTrack = (alarm) => {
  router.push('/track')
}

const tick = () => {
  // 触发响应式更新
  store.alarms.forEach(a => {})
}

onMounted(() => {
  timer.value = setInterval(tick, 1000)
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
})
</script>

<style scoped>
.timeout-text {
  color: #f56c6c;
  font-weight: 600;
}

.timer-box {
  padding: 8px 12px;
  background: #ecf5ff;
  border-radius: 6px;
  text-align: center;
}

.timer-box.timeout-box {
  background: #fef0f0;
}

.timer-box.timeout-box .timer-value {
  color: #f56c6c;
}

.timer-value {
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
  font-family: monospace;
}

.timer-label {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.timeout-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeout-card {
  padding: 12px;
  background: #fef0f0;
  border-radius: 6px;
  border: 1px solid #fbc4c4;
}

.timeout-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeout-minutes {
  color: #f56c6c;
  font-weight: 600;
  font-size: 13px;
}

.timeout-card-body p {
  margin: 4px 0;
  font-size: 13px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 4px;
}

.rescuer-status-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rescuer-status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
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

.dispatch-info p {
  margin: 6px 0;
  font-size: 14px;
}
</style>
