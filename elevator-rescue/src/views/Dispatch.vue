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
            <el-tag v-if="store.escalatedAlarms.length > 0" size="small" type="danger" style="margin-left: 8px">
              {{ store.escalatedAlarms.length }} 单需支援
            </el-tag>
          </div>
          <el-table :data="store.dispatchedAlarms" stripe empty-text="暂无进行中的任务">
            <el-table-column label="状态" width="90" align="center" fixed>
              <template #default="{ row }">
                <div class="status-col">
                  <el-tag :type="row.isEscalated ? 'danger' : (row.status === 'arrived' ? 'success' : 'primary')" size="small">
                    {{ row.isEscalated ? '已升级' : (row.status === 'arrived' ? '已到场' : '已派遣') }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="alarmNo" label="接警编号" width="130" />
            <el-table-column label="电梯信息" width="170">
              <template #default="{ row }">
                <div>{{ row.elevator?.buildingName }}</div>
                <div style="color: #909399; font-size: 12px">{{ row.elevator?.elevatorNo }}</div>
              </template>
            </el-table-column>
            <el-table-column label="救援人员" width="90">
              <template #default="{ row }">{{ row.rescuer?.name }}</template>
            </el-table-column>
            <el-table-column label="备援人员" width="90">
              <template #default="{ row }">
                <span v-if="row.backupRescuer">{{ row.backupRescuer?.name }}</span>
                <span v-else style="color: #909399">-</span>
              </template>
            </el-table-column>
            <el-table-column label="派遣时间" width="130">
              <template #default="{ row }">{{ row.dispatchTime }}</template>
            </el-table-column>
            <el-table-column label="到场计时" width="150" align="center">
              <template #default="{ row }">
                <div v-if="row.status === 'arrived'" style="color: #67c23a">
                  <el-icon><CircleCheck /></el-icon>
                  已到场
                </div>
                <div v-else class="timer-box" :class="{ 'timeout-box': isTimeout(row) }">
                  <div class="timer-value">{{ formatTimer(row) }}</div>
                  <div class="timer-label">
                    {{ isTimeout(row) ? '已超时' : '响应倒计时' }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right" align="center">
              <template #default="{ row }">
                <template v-if="row.status === 'dispatched'">
                  <el-button type="success" size="small" @click="markArrived(row)">
                    到场签到
                  </el-button>
                  <el-button
                    v-if="isTimeout(row) && !row.isEscalated"
                    type="danger"
                    size="small"
                    @click="openEscalateDialog(row)"
                  >
                    升级支援
                  </el-button>
                </template>
                <template v-else>
                  <el-button type="primary" link size="small" @click="goToTrack(row)">
                    处置跟踪
                  </el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="card-section" v-if="store.timeoutAlarms.length > 0 || store.escalatedAlarms.length > 0">
          <div class="card-title" style="color: #f56c6c">
            <el-icon><Warning /></el-icon>
            超时预警 / 支援请求
            <el-badge :value="store.timeoutAlarms.length + store.escalatedAlarms.length" class="warning-badge" type="danger" />
          </div>
          <div class="timeout-list">
            <div v-for="alarm in allWarningAlarms" :key="alarm.id" class="timeout-card" :class="{ 'escalated': alarm.isEscalated }">
              <div class="timeout-card-header">
                <el-tag :type="alarm.isEscalated ? 'danger' : 'warning'" effect="dark">
                  {{ alarm.isEscalated ? '支援请求' : '超时预警' }}
                </el-tag>
                <span class="timeout-no">{{ alarm.alarmNo }}</span>
              </div>
              <div class="timeout-card-body">
                <p><el-icon><Location /></el-icon> {{ alarm.elevator?.buildingName }}</p>
                <p><el-icon><User /></el-icon> 被困 {{ alarm.trappedCount }} 人</p>
                <p><el-icon><Phone /></el-icon> {{ alarm.reporterName }}</p>
                <p v-if="alarm.dispatchTime">
                  <el-icon><Timer /></el-icon>
                  {{ alarm.isEscalated ? '已升级' : '已超时' }} {{ getTimeoutMinutes(alarm) }} 分钟
                </p>
              </div>
              <div v-if="alarm.isEscalated" class="escalated-info">
                <el-icon><UserFilled /></el-icon>
                备援人员：{{ alarm.backupRescuer?.name }}
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
                  <div class="rescuer-name">
                    {{ rescuer.name }}
                    <el-tag v-if="rescuer.isBackup" size="small" type="info" style="margin-left: 6px">备援</el-tag>
                  </div>
                  <div class="rescuer-company">{{ rescuer.company }} · {{ rescuer.area }}</div>
                </div>
              </div>
              <div class="rescuer-status">
                <el-tag :type="rescuer.status === 'idle' ? 'success' : 'warning'" size="small">
                  {{ rescuer.status === 'idle' ? '空闲' : '出警中' }}
                </el-tag>
                <div v-if="rescuer.status === 'idle'" class="eta-info">
                  预计 {{ rescuer.estimatedArrival }} 分钟到场
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="dispatchDialogVisible" title="派遣救援人员" width="600px">
      <div v-if="currentAlarm">
        <div class="dispatch-info">
          <p><strong>接警编号：</strong>{{ currentAlarm.alarmNo }}</p>
          <p><strong>电梯位置：</strong>{{ currentAlarm.elevator?.buildingName }} ({{ currentAlarm.elevator?.address }})</p>
          <p><strong>被困人数：</strong>{{ currentAlarm.trappedCount }} 人</p>
          <p><strong>维保单位：</strong>{{ currentAlarm.elevator?.maintenanceCompany }}</p>
        </div>
        <el-divider />
        
        <el-tabs v-model="dispatchTab">
          <el-tab-pane label="本单位人员" name="main">
            <div class="rescuer-select-list">
              <div
                v-for="rescuer in mainRescuers"
                :key="rescuer.id"
                class="rescuer-select-item"
                :class="{ selected: selectedRescuerId === rescuer.id }"
                @click="selectedRescuerId = rescuer.id"
              >
                <el-avatar :size="36" :icon="User" />
                <div class="rescuer-select-info">
                  <div class="rescuer-select-name">{{ rescuer.name }}</div>
                  <div class="rescuer-select-meta">
                    <span>{{ rescuer.company }}</span>
                    <span class="eta">预计 {{ rescuer.estimatedArrival }} 分钟到场</span>
                  </div>
                </div>
                <el-radio :model-value="selectedRescuerId" :label="rescuer.id" />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="附近备援人员" name="backup">
            <el-alert
              title="选择备援人员派遣，系统将自动标记为升级支援"
              type="warning"
              :closable="false"
              style="margin-bottom: 12px"
            />
            <div class="rescuer-select-list">
              <div
                v-for="rescuer in backupRescuers"
                :key="rescuer.id"
                class="rescuer-select-item"
                :class="{ selected: selectedRescuerId === rescuer.id }"
                @click="selectedRescuerId = rescuer.id"
              >
                <el-avatar :size="36" :icon="User" />
                <div class="rescuer-select-info">
                  <div class="rescuer-select-name">
                    {{ rescuer.name }}
                    <el-tag size="small" type="info">备援</el-tag>
                  </div>
                  <div class="rescuer-select-meta">
                    <span>{{ rescuer.company }}</span>
                    <span class="eta">预计 {{ rescuer.estimatedArrival }} 分钟到场</span>
                  </div>
                </div>
                <el-radio :model-value="selectedRescuerId" :label="rescuer.id" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <template #footer>
          <el-button @click="dispatchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmDispatch" :disabled="!selectedRescuerId">
            确认派遣
          </el-button>
        </template>
      </div>
    </el-dialog>

    <el-dialog v-model="escalateDialogVisible" title="升级支援请求" width="500px">
      <div v-if="currentAlarm">
        <el-alert
          title="该单已超时，建议升级请求备援人员支援"
          type="warning"
          :closable="false"
          style="margin-bottom: 16px"
        />
        <div class="dispatch-info">
          <p><strong>接警编号：</strong>{{ currentAlarm.alarmNo }}</p>
          <p><strong>电梯位置：</strong>{{ currentAlarm.elevator?.buildingName }}</p>
          <p><strong>当前救援人员：</strong>{{ currentAlarm.rescuer?.name }}</p>
          <p><strong>已超时：</strong>{{ getTimeoutMinutes(currentAlarm) }} 分钟</p>
        </div>
        <el-divider />
        <el-form label-width="100px">
          <el-form-item label="选择备援人员" required>
            <el-select v-model="selectedBackupRescuerId" placeholder="请选择备援人员" style="width: 100%">
              <el-option
                v-for="rescuer in availableBackupRescuers"
                :key="rescuer.id"
                :label="`${rescuer.name} (${rescuer.company}，预计${rescuer.estimatedArrival}分钟到场)`"
                :value="rescuer.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="escalateDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmEscalate" :disabled="!selectedBackupRescuerId">
            确认升级支援
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
const escalateDialogVisible = ref(false)
const dispatchTab = ref('main')
const currentAlarm = ref(null)
const selectedRescuerId = ref('')
const selectedBackupRescuerId = ref('')
const timer = ref(null)

const allWarningAlarms = computed(() => {
  const timeout = store.timeoutAlarms.filter(a => !a.isEscalated)
  return [...store.escalatedAlarms, ...timeout]
})

const mainRescuers = computed(() => {
  if (!currentAlarm.value) return []
  const company = currentAlarm.value.elevator?.maintenanceCompany
  return store.rescuers.filter(r => r.company === company && r.status === 'idle' && !r.isBackup)
    .sort((a, b) => a.estimatedArrival - b.estimatedArrival)
})

const backupRescuers = computed(() => {
  if (!currentAlarm.value) return []
  return store.rescuers.filter(r => r.isBackup && r.status === 'idle')
    .sort((a, b) => a.estimatedArrival - b.estimatedArrival)
})

const availableBackupRescuers = computed(() => {
  return store.rescuers.filter(r => r.isBackup && r.status === 'idle')
    .sort((a, b) => a.estimatedArrival - b.estimatedArrival)
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
  if (!alarm.dispatchTime && !alarm.escalateTime) return 0
  const baseTime = alarm.escalateTime || alarm.dispatchTime
  return Math.max(0, dayjs().diff(dayjs(baseTime), 'minute') - 30)
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
  dispatchTab.value = 'main'
  dispatchDialogVisible.value = true
}

const openEscalateDialog = (alarm) => {
  currentAlarm.value = alarm
  selectedBackupRescuerId.value = ''
  escalateDialogVisible.value = true
}

const confirmDispatch = () => {
  if (!selectedRescuerId.value) {
    ElMessage.warning('请选择救援人员')
    return
  }
  const isBackup = dispatchTab.value === 'backup'
  store.dispatchAlarm(currentAlarm.value.id, selectedRescuerId.value)
  if (isBackup) {
    const alarm = store.alarms.find(a => a.id === currentAlarm.value.id)
    if (alarm) {
      alarm.isEscalated = true
      alarm.escalateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      alarm.backupRescuerId = selectedRescuerId.value
      alarm.backupRescuer = alarm.rescuer
    }
  }
  ElMessage.success('派遣成功，已通知救援人员')
  dispatchDialogVisible.value = false
}

const confirmEscalate = () => {
  if (!selectedBackupRescuerId.value) {
    ElMessage.warning('请选择备援人员')
    return
  }
  store.escalateSupport(currentAlarm.value.id, selectedBackupRescuerId.value)
  ElMessage.success('已升级支援请求，备援人员已派出')
  escalateDialogVisible.value = false
}

const markArrived = (alarm) => {
  store.markArrived(alarm.id)
  ElMessage.success('已记录到场时间')
}

const goToTrack = (alarm) => {
  router.push('/track')
}

const tick = () => {
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
  padding: 6px 10px;
  background: #ecf5ff;
  border-radius: 6px;
  text-align: center;
}

.timer-box.timeout-box {
  background: #fef0f0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.timer-box.timeout-box .timer-value {
  color: #f56c6c;
}

.timer-value {
  font-size: 18px;
  font-weight: 700;
  color: #409eff;
  font-family: monospace;
}

.timer-label {
  font-size: 11px;
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

.timeout-card.escalated {
  background: #fef0f0;
  border-color: #f56c6c;
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

.escalated-info {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #fbc4c4;
  font-size: 12px;
  color: #f56c6c;
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

.eta-info {
  font-size: 11px;
  color: #67c23a;
  margin-top: 2px;
  text-align: right;
}

.dispatch-info p {
  margin: 6px 0;
  font-size: 14px;
}

.rescuer-select-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.rescuer-select-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.rescuer-select-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.rescuer-select-item.selected {
  border-color: #409eff;
  background: #ecf5ff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.rescuer-select-info {
  flex: 1;
}

.rescuer-select-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.rescuer-select-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  justify-content: space-between;
}

.eta {
  color: #67c23a;
  font-weight: 500;
}
</style>
