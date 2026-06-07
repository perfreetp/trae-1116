<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <div class="card-section">
          <div class="card-title">处置单列表</div>
          <div class="order-list">
            <div
              v-for="alarm in activeAlarms"
              :key="alarm.id"
              class="order-item"
              :class="{ active: currentAlarm?.id === alarm.id }"
              @click="selectAlarm(alarm)"
            >
              <div class="order-header">
                <span class="order-no">{{ alarm.alarmNo }}</span>
                <el-tag size="small" :type="statusType(alarm.status)">
                  {{ statusLabel(alarm.status) }}
                </el-tag>
              </div>
              <div class="order-building">{{ alarm.elevator?.buildingName }}</div>
              <div class="order-info">
                <span>被困 {{ alarm.trappedCount }} 人</span>
                <span>{{ alarm.alarmTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="16">
        <div v-if="!currentAlarm" class="empty-state card-section">
          <el-empty description="请从左侧选择一个处置单查看详情" :image-size="120" />
        </div>

        <template v-else>
          <div class="card-section">
            <div class="card-title">
              <el-icon><Document /></el-icon>
              处置单详情 - {{ currentAlarm.alarmNo }}
            </div>
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item label="电梯编号">{{ currentAlarm.elevator?.elevatorNo }}</el-descriptions-item>
              <el-descriptions-item label="所在楼盘">{{ currentAlarm.elevator?.buildingName }}</el-descriptions-item>
              <el-descriptions-item label="详细地址">{{ currentAlarm.elevator?.address }}</el-descriptions-item>
              <el-descriptions-item label="报警人">{{ currentAlarm.reporterName }}</el-descriptions-item>
              <el-descriptions-item label="被困人数">{{ currentAlarm.trappedCount }} 人</el-descriptions-item>
              <el-descriptions-item label="紧急程度">
                <el-tag :type="emergencyType(currentAlarm.emergencyLevel)" size="small">
                  {{ emergencyLabel(currentAlarm.emergencyLevel) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="救援人员">{{ currentAlarm.rescuer?.name }}</el-descriptions-item>
              <el-descriptions-item label="维保单位">{{ currentAlarm.elevator?.maintenanceCompany }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="statusType(currentAlarm.status)" size="small">
                  {{ statusLabel(currentAlarm.status) }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <el-row :gutter="20">
            <el-col :span="12">
              <div class="card-section">
                <div class="card-title">
                  <el-icon><User /></el-icon>
                  被困人员登记
                  <el-button
                    v-if="currentAlarm.status !== 'closed'"
                    type="primary"
                    text
                    size="small"
                    style="float: right"
                    @click="showPersonDialog = true"
                  >
                    + 添加
                  </el-button>
                </div>
                <div v-if="currentAlarm.trappedPersons.length === 0" class="empty-tip">
                  暂无登记信息
                </div>
                <div v-else>
                  <div v-for="(p, idx) in currentAlarm.trappedPersons" :key="idx" class="person-item">
                    <el-avatar :size="32" :icon="User" />
                    <div class="person-info">
                      <div class="person-name">{{ p.name }} ({{ p.gender }}, {{ p.age }}岁)</div>
                      <div class="person-health">身体状况：{{ p.health }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-section">
                <div class="card-title">
                  <el-icon><ChatDotRound /></el-icon>
                  安抚话术记录
                </div>
                <div v-if="currentAlarm.status !== 'closed'" class="comfort-input">
                  <div class="template-tags">
                    <span class="template-label">快捷话术：</span>
                    <el-tag
                      v-for="(tpl, idx) in store.comfortTemplates"
                      :key="idx"
                      size="small"
                      style="cursor: pointer; margin: 2px"
                      @click="useTemplate(tpl)"
                    >
                      {{ tpl.slice(0, 10) }}...
                    </el-tag>
                  </div>
                  <el-input
                    v-model="comfortContent"
                    type="textarea"
                    :rows="3"
                    placeholder="输入安抚话术内容..."
                    style="margin-top: 10px"
                  />
                  <el-button type="primary" style="margin-top: 10px" @click="addComfort">
                    记录
                  </el-button>
                </div>
                <div class="comfort-records">
                  <div
                    v-for="(record, idx) in currentAlarm.comfortRecords"
                    :key="idx"
                    class="comfort-item"
                  >
                    <div class="comfort-time">{{ record.time }}</div>
                    <div class="comfort-content">{{ record.content }}</div>
                  </div>
                  <div v-if="currentAlarm.comfortRecords.length === 0" class="empty-tip">
                    暂无安抚记录
                  </div>
                </div>
              </div>
            </el-col>

            <el-col :span="12">
              <div class="card-section">
                <div class="card-title">
                  <el-icon><TimeLine /></el-icon>
                  处置时间轴
                </div>
                <el-timeline>
                  <el-timeline-item
                    v-if="currentAlarm.closeTime"
                    :timestamp="currentAlarm.closeTime"
                    type="success"
                    placement="top"
                  >
                    案件已结案
                  </el-timeline-item>
                  <el-timeline-item
                    v-if="currentAlarm.arriveTime"
                    :timestamp="currentAlarm.arriveTime"
                    type="primary"
                    placement="top"
                  >
                    救援人员到场
                  </el-timeline-item>
                  <el-timeline-item
                    v-if="currentAlarm.dispatchTime"
                    :timestamp="currentAlarm.dispatchTime"
                    type="warning"
                    placement="top"
                  >
                    已派遣 {{ currentAlarm.rescuer?.name }}
                  </el-timeline-item>
                  <el-timeline-item
                    :timestamp="currentAlarm.alarmTime"
                    placement="top"
                  >
                    接警登记
                  </el-timeline-item>
                </el-timeline>
              </div>

              <div class="card-section" v-if="currentAlarm.status !== 'closed'">
                <div class="card-title">
                  <el-icon><Check /></el-icon>
                  结案确认
                </div>
                <el-form :model="closeForm" label-width="100px">
                  <el-form-item label="开门结果" required>
                    <el-radio-group v-model="closeForm.doorOpenResult">
                      <el-radio value="success">成功开门</el-radio>
                      <el-radio value="assist">需支援</el-radio>
                      <el-radio value="other">其他</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="故障原因" required>
                    <el-select v-model="closeForm.faultReason" placeholder="请选择故障原因" style="width: 100%">
                      <el-option
                        v-for="fr in store.faultReasons"
                        :key="fr.value"
                        :label="fr.label"
                        :value="fr.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="原因说明">
                    <el-input
                      v-model="closeForm.faultReasonDetail"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入详细故障原因说明"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="closeAlarm" :disabled="!canClose">
                      确认结案
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>

              <div class="card-section" v-else>
                <div class="card-title">
                  <el-icon><CircleCheck /></el-icon>
                  处置结果
                </div>
                <el-descriptions :column="1" border size="small">
                  <el-descriptions-item label="开门结果">
                    {{ closeForm.doorOpenResult === 'success' ? '成功开门' : closeForm.doorOpenResult === 'assist' ? '需支援' : '其他' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="故障原因">
                    {{ currentAlarm.faultReason ? store.getFaultReasonLabel(currentAlarm.faultReason) : '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="原因说明">
                    {{ currentAlarm.faultReasonDetail || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="结案时间">
                    {{ currentAlarm.closeTime }}
                  </el-descriptions-item>
                </el-descriptions>
                <el-alert
                  title="案件已结案，数据已同步至考核统计"
                  type="success"
                  show-icon
                  style="margin-top: 16px"
                >
                  <template #title>
                    <span>案件已结案，数据已同步至考核统计</span>
                    <el-button type="success" text size="small" @click="$router.push('/statistics')">
                      查看统计
                    </el-button>
                  </template>
                </el-alert>
              </div>
            </el-col>
          </el-row>
        </template>
      </el-col>
    </el-row>

    <el-dialog v-model="showPersonDialog" title="添加被困人员" width="450px">
      <el-form :model="personForm" label-width="100px">
        <el-form-item label="姓名" required>
          <el-input v-model="personForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" required>
          <el-radio-group v-model="personForm.gender">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" required>
          <el-input-number v-model="personForm.age" :min="1" :max="120" />
        </el-form-item>
        <el-form-item label="身体状况">
          <el-input v-model="personForm.health" placeholder="如：良好、头晕等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPersonDialog = false">取消</el-button>
        <el-button type="primary" @click="addPerson">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'

const store = useAppStore()

const currentAlarm = ref(null)
const showPersonDialog = ref(false)
const comfortContent = ref('')

const personForm = reactive({
  name: '',
  gender: '男',
  age: 30,
  health: '良好'
})

const closeForm = reactive({
  doorOpenResult: 'success',
  faultReason: '',
  faultReasonDetail: ''
})

const activeAlarms = computed(() => {
  return store.alarms.filter(a => ['dispatched', 'arrived', 'closed'].includes(a.status))
})

const canClose = computed(() => {
  return closeForm.doorOpenResult && closeForm.faultReason
})

watch(currentAlarm, (val) => {
  if (val) {
    closeForm.doorOpenResult = val.doorOpenResult || 'success'
    closeForm.faultReason = val.faultReason || ''
    closeForm.faultReasonDetail = val.faultReasonDetail || ''
  }
})

const selectAlarm = (alarm) => {
  currentAlarm.value = alarm
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

const useTemplate = (tpl) => {
  comfortContent.value = tpl
}

const addComfort = () => {
  if (!comfortContent.value.trim()) {
    ElMessage.warning('请输入安抚话术内容')
    return
  }
  store.addComfortRecord(currentAlarm.value.id, comfortContent.value)
  comfortContent.value = ''
  ElMessage.success('安抚记录已保存')
}

const addPerson = () => {
  if (!personForm.name) {
    ElMessage.warning('请输入姓名')
    return
  }
  const newPersons = [...currentAlarm.value.trappedPersons, { ...personForm }]
  store.updateTrappedPersons(currentAlarm.value.id, newPersons)
  showPersonDialog.value = false
  personForm.name = ''
  personForm.gender = '男'
  personForm.age = 30
  personForm.health = '良好'
  ElMessage.success('被困人员信息已添加')
}

const closeAlarm = () => {
  if (!closeForm.doorOpenResult) {
    ElMessage.warning('请选择开门结果')
    return
  }
  if (!closeForm.faultReason) {
    ElMessage.warning('请选择故障原因')
    return
  }
  store.closeAlarm(currentAlarm.value.id, {
    doorOpenResult: closeForm.doorOpenResult,
    faultReason: closeForm.faultReason,
    faultReasonDetail: closeForm.faultReasonDetail
  })
  ElMessage.success('案件已结案，数据已同步至统计分析')
}
</script>

<style scoped>
.order-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 700px;
  overflow-y: auto;
}

.order-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.order-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.order-item.active {
  border-color: #409eff;
  background: #ecf5ff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.order-no {
  font-weight: 600;
  font-size: 14px;
}

.order-building {
  font-size: 13px;
  margin-bottom: 4px;
}

.order-info {
  font-size: 12px;
  color: #909399;
  display: flex;
  justify-content: space-between;
}

.empty-state {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-tip {
  padding: 30px 0;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.person-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.person-name {
  font-weight: 500;
  font-size: 14px;
}

.person-health {
  font-size: 12px;
  color: #909399;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.template-label {
  font-size: 12px;
  color: #909399;
  margin-right: 4px;
}

.comfort-records {
  margin-top: 16px;
}

.comfort-item {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.comfort-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.comfort-content {
  font-size: 13px;
  color: #303133;
}
</style>
