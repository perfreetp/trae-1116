<template>
  <div class="page-container">
    <div class="card-section">
      <div class="workbench-header">
        <div class="header-left">
          <h2 class="page-title">
            <el-icon><DataBoard /></el-icon>
            事件协同工作台
          </h2>
          <div class="role-switcher">
            <span class="role-label">当前视角：</span>
            <el-radio-group v-model="currentRole" size="small" @change="handleRoleChange">
              <el-radio-button value="supervisor">
                <el-icon><Monitor /></el-icon>
                市场监管
              </el-radio-button>
              <el-radio-button value="property">
                <el-icon><OfficeBuilding /></el-icon>
                物业公司
              </el-radio-button>
              <el-radio-button value="maintenance">
                <el-icon><Tools /></el-icon>
                维保单位
              </el-radio-button>
              <el-radio-button value="rescuer">
                <el-icon><User /></el-icon>
                救援人员
              </el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="header-right">
          <el-tag size="large" type="primary">进行中：{{ store.processingCount }}</el-tag>
          <el-tag size="large" type="danger" style="margin-left: 10px">需支援：{{ store.escalatedAlarms.length }}</el-tag>
        </div>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <div class="card-section">
          <div class="card-title">
            <el-icon><List /></el-icon>
            事件列表
            <el-tag size="small" type="info" style="margin-left: 8px">{{ filteredEvents.length }} 件</el-tag>
          </div>
          <div class="event-list">
            <div
              v-for="alarm in filteredEvents"
              :key="alarm.id"
              class="event-item"
              :class="{ active: currentEvent?.id === alarm.id, 'escalated': alarm.isEscalated }"
              @click="selectEvent(alarm)"
            >
              <div class="event-header">
                <span class="event-no">{{ alarm.alarmNo }}</span>
                <el-tag size="small" :type="statusType(alarm.status)">
                  {{ statusLabel(alarm.status) }}
                </el-tag>
              </div>
              <div class="event-building">{{ alarm.elevator?.buildingName }}</div>
              <div class="event-meta">
                <span>被困 {{ alarm.trappedCount }} 人</span>
                <span>{{ alarm.alarmTime.slice(11) }}</span>
              </div>
              <div v-if="alarm.isEscalated" class="event-escalated">
                <el-icon><WarningFilled /></el-icon>
                {{ store.getEscalationStatusLabel(alarm.escalationStatus) || '已升级支援' }}
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="18">
        <div v-if="!currentEvent" class="empty-state card-section">
          <el-empty description="请从左侧选择一个事件查看协同详情" :image-size="120" />
        </div>

        <template v-else>
          <el-row :gutter="20">
            <el-col :span="14">
              <div class="card-section">
                <div class="card-title">
                  <el-icon><TimeLine /></el-icon>
                  事件时间线
                  <span v-if="currentRole === 'supervisor'" style="margin-left: 8px; color: #909399; font-size: 13px;">
                    （监管视角：可查看全流程操作记录）
                  </span>
                </div>
                <div class="timeline-container">
                  <el-timeline>
                    <el-timeline-item
                      v-for="(item, idx) in timeline"
                      :key="idx"
                      :timestamp="item.time"
                      :type="item.type"
                      placement="top"
                      size="large"
                    >
                      <div class="timeline-content-item">
                        <div class="timeline-text">{{ item.content }}</div>
                        <div class="timeline-meta" v-if="item.meta">
                          <span>{{ item.meta }}</span>
                        </div>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </div>

              <div class="card-section" v-if="showRoleContent('property')">
                <div class="card-title">
                  <el-icon><ChatDotRound /></el-icon>
                  安抚记录 & 业主沟通
                  <span v-if="currentRole === 'property'" style="margin-left: 8px; color: #909399; font-size: 13px;">
                    （物业视角：需持续与被困人员保持沟通）
                  </span>
                </div>
                <div class="comfort-records">
                  <div
                    v-for="(record, idx) in currentEvent.comfortRecords"
                    :key="idx"
                    class="comfort-card"
                  >
                    <div class="comfort-time">
                      <el-icon><Clock /></el-icon>
                      {{ record.time }}
                    </div>
                    <div class="comfort-text">{{ record.content }}</div>
                  </div>
                  <div v-if="currentEvent.comfortRecords.length === 0" class="empty-tip">
                    暂无安抚记录，建议每5分钟安抚一次被困人员
                  </div>
                </div>
                <div v-if="currentRole === 'property' && currentEvent.status !== 'closed'" class="add-comfort">
                  <el-input
                    v-model="newComfort"
                    type="textarea"
                    :rows="2"
                    placeholder="记录与被困人员的沟通内容..."
                  />
                  <div class="quick-comfort">
                    <el-tag
                      v-for="(tpl, idx) in store.comfortTemplates"
                      :key="idx"
                      size="small"
                      style="cursor: pointer; margin: 2px"
                      @click="newComfort = tpl"
                    >
                      {{ tpl.slice(0, 12) }}...
                    </el-tag>
                  </div>
                  <el-button type="primary" style="margin-top: 10px" @click="addComfort">
                    记录安抚
                  </el-button>
                </div>
              </div>
            </el-col>

            <el-col :span="10">
              <div class="card-section">
                <div class="card-title">
                  <el-icon><InfoFilled /></el-icon>
                  事件基本信息
                </div>
                <el-descriptions :column="1" border size="small">
                  <el-descriptions-item label="接警编号">{{ currentEvent.alarmNo }}</el-descriptions-item>
                  <el-descriptions-item label="电梯信息">
                    {{ currentEvent.elevator?.elevatorNo }} - {{ currentEvent.elevator?.buildingName }}
                  </el-descriptions-item>
                  <el-descriptions-item label="详细地址">{{ currentEvent.elevator?.address }}</el-descriptions-item>
                  <el-descriptions-item label="报警人">
                    {{ currentEvent.reporterName }} ({{ currentEvent.relation }})
                  </el-descriptions-item>
                  <el-descriptions-item label="被困人数">{{ currentEvent.trappedCount }} 人</el-descriptions-item>
                  <el-descriptions-item label="特殊情况">{{ currentEvent.specialPerson || '无' }}</el-descriptions-item>
                  <el-descriptions-item label="紧急程度">
                    <el-tag :type="emergencyType(currentEvent.emergencyLevel)" size="small">
                      {{ emergencyLabel(currentEvent.emergencyLevel) }}
                    </el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>

              <div class="card-section" v-if="showRoleContent('maintenance')">
                <div class="card-title">
                  <el-icon><Van /></el-icon>
                  救援人员信息
                  <span v-if="currentRole === 'maintenance'" style="margin-left: 8px; color: #909399; font-size: 13px;">
                    （维保视角：关注救援进度和人员状态）
                  </span>
                </div>
                <div v-if="currentEvent.rescuer" class="rescuer-card">
                  <el-avatar :size="48" :icon="User" />
                  <div class="rescuer-info">
                    <div class="rescuer-name">
                      {{ currentEvent.rescuer.name }}
                      <el-tag size="small" type="primary" style="margin-left: 6px">主救援</el-tag>
                    </div>
                    <div class="rescuer-detail">{{ currentEvent.rescuer.company }}</div>
                    <div class="rescuer-detail">
                      <el-icon><Phone /></el-icon>
                      {{ currentEvent.rescuer.phone }}
                    </div>
                  </div>
                </div>
                <div v-else class="empty-tip">
                  尚未派遣救援人员
                </div>

                <div v-if="currentEvent.backupRescuer" class="rescuer-card backup" style="margin-top: 12px">
                  <el-avatar :size="48" :icon="User" />
                  <div class="rescuer-info">
                    <div class="rescuer-name">
                      {{ currentEvent.backupRescuer.name }}
                      <el-tag size="small" type="danger" style="margin-left: 6px">备援支援</el-tag>
                    </div>
                    <div class="rescuer-detail">{{ currentEvent.backupRescuer.company }}</div>
                    <div class="rescuer-detail">
                      <el-icon><Phone /></el-icon>
                      {{ currentEvent.backupRescuer.phone }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-section" v-if="showRoleContent('rescuer') && currentEvent.status !== 'closed'">
                <div class="card-title">
                  <el-icon><Tools /></el-icon>
                  现场处置
                  <span v-if="currentRole === 'rescuer'" style="margin-left: 8px; color: #909399; font-size: 13px;">
                    （救援视角：记录现场处置情况）
                  </span>
                </div>
                <div v-if="currentEvent.status === 'dispatched'">
                  <el-button type="success" size="large" @click="markArrived" style="width: 100%">
                    <el-icon><LocationFilled /></el-icon>
                    我已到场
                  </el-button>
                </div>
                <div v-else-if="currentEvent.status === 'arrived'">
                  <el-form label-width="100px">
                    <el-form-item label="开门结果">
                      <el-radio-group v-model="doorResult">
                        <el-radio value="success">成功开门</el-radio>
                        <el-radio value="assist">需支援</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="故障原因">
                      <el-select v-model="faultReason" placeholder="请选择" style="width: 100%">
                        <el-option
                          v-for="fr in store.faultReasons"
                          :key="fr.value"
                          :label="fr.label"
                          :value="fr.value"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="原因说明">
                      <el-input v-model="faultDetail" type="textarea" :rows="2" placeholder="请输入详细说明" />
                    </el-form-item>
                    <el-button type="primary" @click="closeEvent">提交结案</el-button>
                  </el-form>
                </div>
              </div>

              <div class="card-section" v-if="currentRole === 'supervisor'">
                <div class="card-title">
                  <el-icon><Monitor /></el-icon>
                  监管督办
                  <span style="margin-left: 8px; color: #909399; font-size: 13px;">
                    （监管视角：全局监控和督办）
                  </span>
                </div>
                <div class="supervisor-actions">
                  <el-statistic title="接警到场时长" :value="getResponseTime()" suffix="分钟" />
                  <el-divider direction="vertical" />
                  <el-statistic
                    title="是否超时"
                    :value="isEventTimeout() ? '是' : '否'"
                    :value-style="{ color: isEventTimeout() ? '#f56c6c' : '#67c23a' }"
                  />
                  <el-divider direction="vertical" />
                  <el-statistic
                    title="支援状态"
                    :value="currentEvent.isEscalated ? (store.getEscalationStatusLabel(currentEvent.escalationStatus) || '已升级') : '未升级'"
                    :value-style="{ color: currentEvent.isEscalated ? '#f56c6c' : '#67c23a' }"
                  />
                </div>
                <div style="margin-top: 16px">
                  <el-button type="warning" v-if="!currentEvent.isEscalated && isEventTimeout()" @click="triggerEscalate">
                    <el-icon><Warning /></el-icon>
                    触发升级支援
                  </el-button>
                  <el-button 
                    type="success" 
                    v-if="currentEvent.isEscalated && currentEvent.escalationStatus === 'backup_dispatched'" 
                    @click="markBackupArrived"
                  >
                    <el-icon><LocationFilled /></el-icon>
                    标记备援到场
                  </el-button>
                  <el-button 
                    type="primary" 
                    v-if="currentEvent.isEscalated && currentEvent.escalationStatus === 'backup_arrived' && currentEvent.status !== 'closed'" 
                    @click="completeSupport"
                  >
                    <el-icon><Check /></el-icon>
                    结束支援
                  </el-button>
                  <el-button type="primary" @click="$router.push('/statistics')">
                    <el-icon><TrendCharts /></el-icon>
                    查看统计分析
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </template>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const store = useAppStore()

const currentRole = ref('supervisor')
const currentEvent = ref(null)
const newComfort = ref('')
const doorResult = ref('success')
const faultReason = ref('')
const faultDetail = ref('')
const tickTimer = ref(null)

const roleFilters = {
  supervisor: null,
  property: null,
  maintenance: null,
  rescuer: null
}

const filteredEvents = computed(() => {
  return store.alarms
})

const timeline = computed(() => {
  if (!currentEvent.value) return []
  const logs = store.getFilteredAuditLogs(currentEvent.value.id, currentRole.value)
  return logs.map(log => ({
    time: log.time,
    content: log.content,
    type: logTypeColor(log.actionType),
    meta: `${log.operator}（${roleLabel(log.operatorRole)}）`
  }))
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

const handleRoleChange = (role) => {
  store.setRole(role)
  ElMessage.info(`已切换至${roleLabel(role)}视角`)
}

const roleLabel = (role) => {
  const map = { supervisor: '市场监管', property: '物业公司', maintenance: '维保单位', rescuer: '救援人员' }
  return map[role] || role
}

const showRoleContent = (role) => {
  if (currentRole.value === 'supervisor') return true
  return currentRole.value === role
}

const selectEvent = (alarm) => {
  currentEvent.value = alarm
  doorResult.value = 'success'
  faultReason.value = ''
  faultDetail.value = ''
}

const statusType = (status) => {
  const map = { pending: 'warning', dispatched: 'primary', arrived: 'info', closed: 'success' }
  return map[status] || ''
}

const statusLabel = (status) => {
  const map = { pending: '待派单', dispatched: '已派遣', arrived: '已到场', closed: '已结案' }
  return map[status] || status
}

const emergencyType = (level) => {
  const map = { normal: '', urgent: 'warning', critical: 'danger' }
  return map[level] || ''
}

const emergencyLabel = (level) => {
  const map = { normal: '一般', urgent: '紧急', critical: '特急' }
  return map[level] || '一般'
}

const addComfort = () => {
  if (!newComfort.value.trim()) {
    ElMessage.warning('请输入安抚内容')
    return
  }
  store.addComfortRecord(currentEvent.value.id, newComfort.value)
  newComfort.value = ''
  ElMessage.success('安抚记录已保存')
}

const markArrived = () => {
  store.markArrived(currentEvent.value.id)
  ElMessage.success('已记录到场时间')
}

const closeEvent = async () => {
  if (!faultReason.value) {
    ElMessage.warning('请选择故障原因')
    return
  }
  try {
    await ElMessageBox.confirm('确认提交结案？', '提示', { type: 'info' })
    store.closeAlarm(currentEvent.value.id, {
      doorOpenResult: doorResult.value,
      faultReason: faultReason.value,
      faultReasonDetail: faultDetail.value
    })
    ElMessage.success('案件已结案')
  } catch {}
}

const getResponseTime = () => {
  if (!currentEvent.value?.dispatchTime || !currentEvent.value?.arriveTime) return '-'
  return dayjs(currentEvent.value.arriveTime).diff(dayjs(currentEvent.value.dispatchTime), 'minute')
}

const isEventTimeout = () => {
  if (!currentEvent.value?.dispatchTime) return false
  if (currentEvent.value.status === 'arrived' || currentEvent.value.status === 'closed') {
    return dayjs(currentEvent.value.arriveTime).diff(dayjs(currentEvent.value.dispatchTime), 'minute') > 30
  }
  return dayjs().diff(dayjs(currentEvent.value.dispatchTime), 'minute') > 30
}

const triggerEscalate = async () => {
  try {
    await ElMessageBox.confirm('确认触发升级支援？将通知备援人员前往支援', '提示', { type: 'warning' })
    const backupRescuer = store.rescuers.find(r => r.isBackup && r.status === 'idle')
    if (backupRescuer) {
      store.escalateSupport(currentEvent.value.id, backupRescuer.id)
      ElMessage.success('已触发升级支援，备援人员已派出')
    } else {
      ElMessage.warning('暂无空闲的备援人员')
    }
  } catch {}
}

const markBackupArrived = () => {
  store.markBackupArrived(currentEvent.value.id)
  ElMessage.success('备援人员已到场')
}

const completeSupport = () => {
  store.completeSupport(currentEvent.value.id)
  ElMessage.success('支援任务已结束')
}

const tick = () => {
  store.alarms.forEach(a => {})
}

onMounted(() => {
  tickTimer.value = setInterval(tick, 1000)
})

onUnmounted(() => {
  if (tickTimer.value) clearInterval(tickTimer.value)
})
</script>

<style scoped>
.workbench-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.role-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-label {
  font-size: 14px;
  color: #606266;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 700px;
  overflow-y: auto;
}

.event-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.event-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.event-item.active {
  border-color: #409eff;
  background: #ecf5ff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.event-item.escalated {
  border-color: #f56c6c;
  background: #fef0f0;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.event-no {
  font-weight: 600;
  font-size: 14px;
}

.event-building {
  font-size: 13px;
  margin-bottom: 4px;
}

.event-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  justify-content: space-between;
}

.event-escalated {
  margin-top: 6px;
  padding: 4px 8px;
  background: #f56c6c;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty-state {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-container {
  max-height: 500px;
  overflow-y: auto;
  padding: 10px 0;
}

.timeline-content-item {
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.timeline-text {
  font-size: 14px;
  color: #303133;
}

.timeline-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.comfort-records {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.comfort-card {
  padding: 12px;
  background: #f0f9eb;
  border-radius: 6px;
  border-left: 4px solid #67c23a;
}

.comfort-time {
  font-size: 12px;
  color: #67c23a;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.comfort-text {
  font-size: 14px;
  color: #303133;
}

.empty-tip {
  padding: 30px 0;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.quick-comfort {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.rescuer-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #ecf5ff;
  border-radius: 6px;
  align-items: center;
}

.rescuer-card.backup {
  background: #fef0f0;
}

.rescuer-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.rescuer-detail {
  font-size: 12px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 2px 0;
}

.supervisor-actions {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
}
</style>
