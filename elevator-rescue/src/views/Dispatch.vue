<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="10">
        <div class="card-section">
          <div class="card-title">
            <el-icon><List /></el-icon>
            待派单列表
            <el-tag size="small" type="warning" style="margin-left: 10px">{{ store.pendingDispatchAlarms.length }} 单</el-tag>
          </div>
          <el-table
            :data="store.pendingDispatchAlarms"
            stripe
            empty-text="暂无待派单"
            @row-click="handleSelectAlarm"
            :highlight-current-row="true"
          >
            <el-table-column label="紧急" width="60" align="center">
              <template #default="{ row }">
                <el-icon :size="18" :color="emergencyColor(row.emergencyLevel)">
                  <Warning v-if="row.emergencyLevel !== 'normal'" />
                  <InfoFilled v-else />
                </el-icon>
              </template>
            </el-table-column>
            <el-table-column label="电梯信息">
              <template #default="{ row }">
                <div style="font-weight: 500">{{ row.elevator?.buildingName }}</div>
                <div style="color: #909399; font-size: 12px">{{ row.elevator?.elevatorNo }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="trappedCount" label="被困" width="60" align="center">
              <template #default="{ row }">
                <span style="color: #f56c6c; font-weight: 600">{{ row.trappedCount }}</span>
              </template>
            </el-table-column>
            <el-table-column label="等待" width="70" align="center">
              <template #default="{ row }">
                <span :class="{ 'timeout-text': getWaitMinutes(row) > 15 }">
                  {{ getWaitMinutes(row) }}分
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click.stop="openDispatchDialog(row)">
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
          <div class="task-list">
            <div
              v-for="alarm in store.dispatchedAlarms"
              :key="alarm.id"
              class="task-item"
              :class="{ 'is-timeout': isTimeout(alarm), 'is-escalated': alarm.isEscalated }"
            >
              <div class="task-header">
                <span class="task-no">{{ alarm.alarmNo }}</span>
                <el-tag :type="alarm.isEscalated ? 'danger' : (alarm.status === 'arrived' ? 'success' : 'primary')" size="small">
                  {{ alarm.isEscalated ? store.getEscalationStatusLabel(alarm.escalationStatus) : (alarm.status === 'arrived' ? '已到场' : '已派遣') }}
                </el-tag>
              </div>
              <div class="task-building">{{ alarm.elevator?.buildingName }}</div>
              <div class="task-footer">
                <div class="task-rescuers">
                  <el-avatar :size="24" :icon="User" />
                  <span class="rescuer-name">{{ alarm.rescuer?.name }}</span>
                  <span v-if="alarm.backupRescuer" class="backup-rescuer">
                    + {{ alarm.backupRescuer?.name }}
                  </span>
                </div>
                <div class="task-timer" :class="{ 'timer-danger': isTimeout(alarm) }">
                  {{ formatTimer(alarm) }}
                </div>
              </div>
              <div class="task-actions">
                <el-button v-if="alarm.status === 'dispatched'" type="success" size="small" @click="markArrived(alarm)">
                  到场签到
                </el-button>
                <el-button
                  v-if="isTimeout(alarm) && !alarm.isEscalated"
                  type="danger"
                  size="small"
                  @click="openEscalateDialog(alarm)"
                >
                  升级支援
                </el-button>
                <el-button
                  v-if="alarm.isEscalated && alarm.escalationStatus === 'backup_dispatched'"
                  type="warning"
                  size="small"
                  @click="markBackupArrived(alarm)"
                >
                  备援到场
                </el-button>
                <el-button type="primary" link size="small" @click="goToCollaboration(alarm)">
                  协同处置
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="card-section decision-panel">
          <div class="card-title">
            <el-icon><DataAnalysis /></el-icon>
            调度决策面板
          </div>
          
          <div v-if="!selectedPendingAlarm" class="empty-decision">
            <el-empty description="请从左侧选择待派单查看派遣方案" :image-size="100" />
          </div>

          <template v-else>
            <div class="alarm-summary">
              <div class="summary-title">{{ selectedPendingAlarm.elevator?.buildingName }}</div>
              <div class="summary-info">
                <span><el-icon><User /></el-icon> 被困 {{ selectedPendingAlarm.trappedCount }} 人</span>
                <span><el-icon><Location /></el-icon> {{ selectedPendingAlarm.elevator?.area }}</span>
                <span>
                  <el-tag :type="emergencyType(selectedPendingAlarm.emergencyLevel)" size="small">
                    {{ emergencyLabel(selectedPendingAlarm.emergencyLevel) }}
                  </el-tag>
                </span>
              </div>
              <div v-if="recommendedRescuer" class="recommend-box">
                <div class="recommend-tag">
                  <el-icon><Star /></el-icon>
                  系统推荐
                </div>
                <div class="recommend-rescuer">
                  <el-avatar :size="36" :icon="User" />
                  <div>
                    <div class="name">{{ recommendedRescuer.name }}</div>
                    <div class="detail">
                      {{ recommendedRescuer.company }}
                      <el-tag v-if="recommendedRescuer.isBackup" size="small" type="info">备援</el-tag>
                      <el-tag v-if="isSameCompany(recommendedRescuer)" size="small" type="success" style="margin-left: 4px">同单位</el-tag>
                    </div>
                    <div class="detail-extra">
                      负责区域：{{ recommendedRescuer.area }}
                      <span style="margin-left: 12px">当前任务：{{ getRescuerTaskCount(recommendedRescuer) }} 件</span>
                    </div>
                  </div>
                  <div class="eta">
                    <span class="eta-value">{{ recommendedRescuer.estimatedArrival }}</span>
                    <span class="eta-unit">分钟</span>
                  </div>
                </div>
                <div class="recommend-reason">
                  <el-icon><MagicStick /></el-icon>
                  推荐理由：{{ getRecommendReason(recommendedRescuer) }}
                </div>
              </div>
            </div>

            <el-divider>本单位人员</el-divider>
            <div class="comparison-list">
              <div
                v-for="rescuer in mainRescuers"
                :key="rescuer.id"
                class="comparison-item"
                :class="{ recommended: rescuer.id === recommendedRescuer?.id && !recommendedRescuer?.isBackup }"
                @click="selectedRescuerId = rescuer.id"
              >
                <div class="rescuer-basic">
                  <el-avatar :size="32" :icon="User" />
                  <div class="rescuer-text">
                    <div class="r-name">
                      {{ rescuer.name }}
                      <el-tag v-if="rescuer.id === recommendedRescuer?.id && !recommendedRescuer?.isBackup" size="small" type="success" style="margin-left: 4px">推荐</el-tag>
                    </div>
                    <div class="r-company">{{ rescuer.company }}</div>
                    <div class="r-extra">
                      区域：{{ rescuer.area }}
                      <span style="margin-left: 8px">任务：{{ getRescuerTaskCount(rescuer) }}件</span>
                    </div>
                  </div>
                </div>
                <div class="rescuer-metrics">
                  <div class="metric">
                    <span class="metric-value">{{ rescuer.estimatedArrival }}</span>
                    <span class="metric-label">预计到场(分)</span>
                  </div>
                  <div class="metric">
                    <el-tag :type="rescuer.status === 'idle' ? 'success' : 'info'" size="small">
                      {{ rescuer.status === 'idle' ? '空闲' : '出警' }}
                    </el-tag>
                  </div>
                </div>
              </div>
              <div v-if="mainRescuers.length === 0" class="empty-tip">
                本单位暂无空闲救援人员
              </div>
            </div>

            <el-divider>附近备援人员</el-divider>
            <div class="comparison-list">
              <div
                v-for="rescuer in backupRescuers"
                :key="rescuer.id"
                class="comparison-item backup"
                :class="{ recommended: rescuer.id === recommendedRescuer?.id && recommendedRescuer?.isBackup }"
                @click="selectedRescuerId = rescuer.id"
              >
                <div class="rescuer-basic">
                  <el-avatar :size="32" :icon="User" />
                  <div class="rescuer-text">
                    <div class="r-name">
                      {{ rescuer.name }}
                      <el-tag size="small" type="danger">备援</el-tag>
                      <el-tag v-if="rescuer.id === recommendedRescuer?.id && recommendedRescuer?.isBackup" size="small" type="success" style="margin-left: 4px">推荐</el-tag>
                    </div>
                    <div class="r-company">{{ rescuer.company }}</div>
                    <div class="r-extra">
                      区域：{{ rescuer.area }}
                      <span style="margin-left: 8px">任务：{{ getRescuerTaskCount(rescuer) }}件</span>
                    </div>
                  </div>
                </div>
                <div class="rescuer-metrics">
                  <div class="metric">
                    <span class="metric-value backup-color">{{ rescuer.estimatedArrival }}</span>
                    <span class="metric-label">预计到场(分)</span>
                  </div>
                  <div class="metric">
                    <el-tag :type="rescuer.status === 'idle' ? 'success' : 'info'" size="small">
                      {{ rescuer.status === 'idle' ? '空闲' : '出警' }}
                    </el-tag>
                  </div>
                </div>
              </div>
              <div v-if="backupRescuers.length === 0" class="empty-tip">
                暂无空闲备援人员
              </div>
            </div>

            <div class="dispatch-action" v-if="selectedPendingAlarm">
              <el-button 
                type="primary" 
                size="large" 
                style="width: 100%" 
                :disabled="!selectedRescuerId"
                @click="confirmDispatchFromPanel"
              >
                <el-icon><Check /></el-icon>
                确认派遣{{ selectedRescuerId ? ' (' + getRescuerName(selectedRescuerId) + ')' : '' }}
              </el-button>
              <div v-if="selectedRescuerId" class="dispatch-note">
                <el-icon><InfoFilled /></el-icon>
                派遣依据：{{ getDispatchReason(selectedRescuerId) }}
              </div>
            </div>
          </template>
        </div>
      </el-col>

      <el-col :span="6">
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
                  {{ alarm.isEscalated ? store.getEscalationStatusLabel(alarm.escalationStatus) : '超时预警' }}
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
                <el-avatar :size="36" :icon="User" />
                <div>
                  <div class="rescuer-name">
                    {{ rescuer.name }}
                    <el-tag v-if="rescuer.isBackup" size="small" type="danger" style="margin-left: 6px">备援</el-tag>
                  </div>
                  <div class="rescuer-company">{{ rescuer.company }} · {{ rescuer.area }}</div>
                </div>
              </div>
              <div class="rescuer-status">
                <el-tag :type="rescuer.status === 'idle' ? 'success' : 'warning'" size="small">
                  {{ rescuer.status === 'idle' ? '空闲' : '出警中' }}
                </el-tag>
                <div v-if="rescuer.status === 'idle'" class="eta-info">
                  预计 {{ rescuer.estimatedArrival }} 分钟
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="dispatchDialogVisible" title="派遣救援人员" width="550px">
      <div v-if="currentAlarm">
        <div class="dispatch-info">
          <p><strong>接警编号：</strong>{{ currentAlarm.alarmNo }}</p>
          <p><strong>电梯位置：</strong>{{ currentAlarm.elevator?.buildingName }}</p>
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
                    <span class="eta">预计 {{ rescuer.estimatedArrival }} 分钟</span>
                  </div>
                </div>
                <el-radio :model-value="selectedRescuerId" :label="rescuer.id" />
              </div>
              <div v-if="mainRescuers.length === 0" class="empty-tip">
                本单位暂无空闲救援人员
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
                    <el-tag size="small" type="danger">备援</el-tag>
                  </div>
                  <div class="rescuer-select-meta">
                    <span>{{ rescuer.company }}</span>
                    <span class="eta">预计 {{ rescuer.estimatedArrival }} 分钟</span>
                  </div>
                </div>
                <el-radio :model-value="selectedRescuerId" :label="rescuer.id" />
              </div>
              <div v-if="backupRescuers.length === 0" class="empty-tip">
                暂无空闲备援人员
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
                :label="`${rescuer.name} (${rescuer.company}，预计${rescuer.estimatedArrival}分钟)`"
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
const selectedPendingAlarm = ref(null)
const selectedRescuerId = ref('')
const selectedBackupRescuerId = ref('')
const timer = ref(null)
const tick = ref(0)

const allWarningAlarms = computed(() => {
  const timeout = store.timeoutAlarms.filter(a => !a.isEscalated)
  return [...store.escalatedAlarms, ...timeout]
})

const mainRescuers = computed(() => {
  if (!selectedPendingAlarm.value) return []
  const company = selectedPendingAlarm.value.elevator?.maintenanceCompany
  return store.rescuers.filter(r => r.company === company && r.status === 'idle' && !r.isBackup)
    .sort((a, b) => a.estimatedArrival - b.estimatedArrival)
})

const backupRescuers = computed(() => {
  if (!selectedPendingAlarm.value) return []
  return store.rescuers.filter(r => r.isBackup && r.status === 'idle')
    .sort((a, b) => a.estimatedArrival - b.estimatedArrival)
})

const recommendedRescuer = computed(() => {
  if (!selectedPendingAlarm.value) return null
  return store.getRecommendedRescuer(selectedPendingAlarm.value)
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

const emergencyColor = (level) => {
  const map = { normal: '#909399', urgent: '#e6a23c', critical: '#f56c6c' }
  return map[level] || '#909399'
}

const getWaitMinutes = (alarm) => {
  tick.value
  return dayjs().diff(dayjs(alarm.alarmTime), 'minute')
}

const getTimeoutMinutes = (alarm) => {
  tick.value
  if (!alarm.dispatchTime && !alarm.escalateTime) return 0
  const baseTime = alarm.escalateTime || alarm.dispatchTime
  return Math.max(0, dayjs().diff(dayjs(baseTime), 'minute') - 30)
}

const isTimeout = (alarm) => {
  tick.value
  if (!alarm.dispatchTime || alarm.status === 'arrived') return false
  return dayjs().diff(dayjs(alarm.dispatchTime), 'minute') > 30
}

const formatTimer = (alarm) => {
  tick.value
  if (alarm.status === 'arrived') return '已到场'
  if (!alarm.dispatchTime) return '00:00'
  const diff = dayjs().diff(dayjs(alarm.dispatchTime), 'second')
  const minutes = Math.floor(diff / 60)
  const seconds = diff % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const isSameCompany = (rescuer) => {
  if (!selectedPendingAlarm.value) return false
  return rescuer.company === selectedPendingAlarm.value.elevator?.maintenanceCompany
}

const getRescuerTaskCount = (rescuer) => {
  return store.alarms.filter(a => 
    (a.rescuerId === rescuer.id || a.backupRescuerId === rescuer.id) && 
    a.status !== 'closed'
  ).length
}

const getRecommendReason = (rescuer) => {
  const reasons = []
  if (isSameCompany(rescuer) && !rescuer.isBackup) {
    reasons.push('属于本维保单位，熟悉电梯情况')
  }
  if (rescuer.area === selectedPendingAlarm.value?.elevator?.area) {
    reasons.push('负责同一区域，距离较近')
  }
  if (getRescuerTaskCount(rescuer) === 0) {
    reasons.push('当前无任务，可立即出发')
  }
  reasons.push(`预计${rescuer.estimatedArrival}分钟到达`)
  return reasons.join('；')
}

const getRescuerName = (rescuerId) => {
  const rescuer = store.rescuers.find(r => r.id === rescuerId)
  return rescuer ? rescuer.name : ''
}

const getDispatchReason = (rescuerId) => {
  const rescuer = store.rescuers.find(r => r.id === rescuerId)
  if (!rescuer) return ''
  const reasons = []
  reasons.push(`${rescuer.name}（${rescuer.company}）`)
  reasons.push(`预计${rescuer.estimatedArrival}分钟到达`)
  if (isSameCompany(rescuer)) reasons.push('本单位人员')
  if (rescuer.isBackup) reasons.push('备援支援')
  reasons.push(`负责区域：${rescuer.area}`)
  return reasons.join('，')
}

const confirmDispatchFromPanel = () => {
  if (!selectedPendingAlarm.value || !selectedRescuerId.value) return
  const rescuer = store.rescuers.find(r => r.id === selectedRescuerId.value)
  const reason = getDispatchReason(selectedRescuerId.value)
  store.dispatchAlarm(selectedPendingAlarm.value.id, selectedRescuerId.value)
  store.addAuditLog(
    selectedPendingAlarm.value.id,
    'dispatch',
    `调度决策派遣：${rescuer?.name}，派遣依据：${reason}`,
    '调度员',
    'maintenance'
  )
  ElMessage.success('派遣成功')
  selectedPendingAlarm.value = null
  selectedRescuerId.value = ''
}

const handleSelectAlarm = (alarm) => {
  selectedPendingAlarm.value = alarm
  selectedRescuerId.value = recommendedRescuer.value?.id || ''
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
      alarm.escalationStatus = 'backup_dispatched'
      alarm.backupRescuerId = selectedRescuerId.value
      alarm.backupRescuer = alarm.rescuer
    }
  }
  selectedPendingAlarm.value = null
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

const markBackupArrived = (alarm) => {
  store.markBackupArrived(alarm.id)
  ElMessage.success('备援人员已到场')
}

const goToCollaboration = (alarm) => {
  router.push('/collaboration')
}

const tickFn = () => {
  tick.value++
}

const handleSelectAlarm = (row) => {
  selectedPendingAlarm.value = row
}

onMounted(() => {
  timer.value = setInterval(tickFn, 1000)
  if (store.selectedAlarm) {
    const alarm = store.selectedAlarm
    if (alarm.status === 'pending') {
      selectedPendingAlarm.value = alarm
    }
    store.clearSelectedAlarm()
  }
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

.decision-panel {
  min-height: 500px;
}

.empty-decision {
  padding: 60px 0;
}

.alarm-summary {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: #fff;
  margin-bottom: 16px;
}

.summary-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.summary-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  opacity: 0.95;
}

.summary-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.recommend-box {
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
}

.recommend-tag {
  font-size: 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.recommend-rescuer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recommend-rescuer .name {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
}

.recommend-rescuer .detail {
  font-size: 12px;
  opacity: 0.9;
}

.recommend-rescuer .eta {
  margin-left: auto;
  text-align: right;
}

.recommend-rescuer .eta-value {
  font-size: 28px;
  font-weight: 700;
}

.recommend-rescuer .eta-unit {
  font-size: 12px;
  margin-left: 2px;
}

.recommend-rescuer .detail-extra {
  font-size: 11px;
  opacity: 0.85;
  margin-top: 2px;
}

.recommend-reason {
  margin-top: 10px;
  padding: 8px 12px;
  background: rgba(103, 194, 58, 0.2);
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.comparison-item {
  cursor: pointer;
}

.comparison-item:hover {
  background: #ecf5ff;
  border-color: #409eff;
}

.rescuer-text .r-extra {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.dispatch-action {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.dispatch-note {
  margin-top: 10px;
  padding: 8px 12px;
  background: #ecf5ff;
  border-radius: 4px;
  font-size: 12px;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 6px;
}

.comparison-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comparison-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.comparison-item.recommended {
  border-color: #67c23a;
  background: #f0f9eb;
  position: relative;
}

.comparison-item.recommended::before {
  content: '推荐';
  position: absolute;
  top: 0;
  right: 0;
  background: #67c23a;
  color: #fff;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 0 6px 0 6px;
}

.comparison-item.backup {
  border-left: 3px solid #f56c6c;
}

.rescuer-basic {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rescuer-text .r-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.rescuer-text .r-company {
  font-size: 12px;
  color: #909399;
}

.rescuer-metrics {
  display: flex;
  gap: 16px;
  align-items: center;
}

.metric {
  text-align: center;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
  display: block;
}

.metric-value.backup-color {
  color: #f56c6c;
}

.metric-label {
  font-size: 11px;
  color: #909399;
}

.empty-tip {
  text-align: center;
  padding: 20px 0;
  color: #909399;
  font-size: 13px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.task-item {
  padding: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  transition: all 0.2s;
}

.task-item:hover {
  border-color: #409eff;
}

.task-item.is-timeout {
  border-color: #f56c6c;
  background: #fef0f0;
  animation: blink 2s infinite;
}

.task-item.is-escalated {
  border-color: #ff4d4f;
  background: #fff2f0;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.task-no {
  font-weight: 600;
  font-size: 13px;
}

.task-building {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-rescuers {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.backup-rescuer {
  color: #f56c6c;
}

.task-timer {
  font-size: 18px;
  font-weight: 700;
  color: #409eff;
  font-family: monospace;
}

.task-timer.timer-danger {
  color: #f56c6c;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.task-actions {
  display: flex;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
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
  border-color: #f56c6c;
}

.timeout-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
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
  gap: 10px;
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
  font-size: 13px;
  font-weight: 500;
}

.rescuer-company {
  font-size: 11px;
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
