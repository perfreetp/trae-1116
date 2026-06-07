<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="card-section">
          <div class="card-title">
            <el-icon><Search /></el-icon>
            电梯检索
          </div>
          <el-form :inline="true">
            <el-form-item label="电梯编号/楼盘">
              <el-input
                v-model="searchKeyword"
                placeholder="请输入电梯编号或楼盘名称"
                style="width: 280px"
                clearable
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
          
          <div v-if="searchResults.length > 0" class="search-results">
            <div
              v-for="elevator in searchResults"
              :key="elevator.id"
              class="elevator-item"
              :class="{ active: selectedElevator?.id === elevator.id }"
              @click="selectElevator(elevator)"
            >
              <div class="elevator-header">
                <el-tag size="small">{{ elevator.elevatorNo }}</el-tag>
                <el-tag size="small" type="info">{{ elevator.brand }}</el-tag>
              </div>
              <div class="elevator-building">{{ elevator.buildingName }}</div>
              <div class="elevator-address">
                <el-icon><Location /></el-icon>
                {{ elevator.address }}
              </div>
              <div class="elevator-info">
                <span>{{ elevator.floors }}层</span>
                <span>{{ elevator.capacity }}</span>
                <span>{{ elevator.speed }}</span>
              </div>
            </div>
          </div>
          
          <div v-else-if="searchKeyword && searchResults.length === 0" class="empty-tip">
            <el-empty description="未找到匹配的电梯" :image-size="80" />
          </div>
        </div>

        <div class="card-section" v-if="selectedElevator">
          <div class="card-title">
            <el-icon><InfoFilled /></el-icon>
            电梯档案详情
          </div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="电梯编号">{{ selectedElevator.elevatorNo }}</el-descriptions-item>
            <el-descriptions-item label="品牌型号">{{ selectedElevator.brand }} {{ selectedElevator.model }}</el-descriptions-item>
            <el-descriptions-item label="所在楼盘">{{ selectedElevator.buildingName }}</el-descriptions-item>
            <el-descriptions-item label="详细地址">{{ selectedElevator.address }}</el-descriptions-item>
            <el-descriptions-item label="物业公司">{{ selectedElevator.propertyCompany }}</el-descriptions-item>
            <el-descriptions-item label="维保单位">{{ selectedElevator.maintenanceCompany }}</el-descriptions-item>
            <el-descriptions-item label="安装日期">{{ selectedElevator.installDate }}</el-descriptions-item>
            <el-descriptions-item label="设备状态">
              <el-tag :type="selectedElevator.status === 'normal' ? 'success' : 'warning'">
                {{ selectedElevator.status === 'normal' ? '正常' : '维保中' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="card-section">
          <div class="card-title">
            <el-icon><Edit /></el-icon>
            接警登记
          </div>
          <el-form :model="alarmForm" label-width="100px" ref="alarmFormRef">
            <el-alert
              v-if="!selectedElevator"
              title="请先在左侧选择电梯"
              type="warning"
              show-icon
              style="margin-bottom: 20px"
            />
            
            <el-form-item label="报警人姓名" required>
              <el-input v-model="alarmForm.reporterName" placeholder="请输入报警人姓名" />
            </el-form-item>
            
            <el-form-item label="联系电话" required>
              <el-input v-model="alarmForm.reporterPhone" placeholder="请输入联系电话" />
            </el-form-item>
            
            <el-form-item label="与被困人员关系">
              <el-select v-model="alarmForm.relation" placeholder="请选择" style="width: 100%">
                <el-option label="被困人员本人" value="被困人员" />
                <el-option label="家属" value="家属" />
                <el-option label="邻居" value="邻居" />
                <el-option label="物业人员" value="物业人员" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="被困人数" required>
              <el-input-number v-model="alarmForm.trappedCount" :min="1" :max="20" />
              <span style="margin-left: 10px; color: #909399">人</span>
            </el-form-item>
            
            <el-form-item label="特殊人员">
              <el-input
                v-model="alarmForm.specialPerson"
                type="textarea"
                :rows="2"
                placeholder="如：老人、孕妇、病人等情况说明"
              />
            </el-form-item>
            
            <el-form-item label="紧急程度" required>
              <el-radio-group v-model="alarmForm.emergencyLevel">
                <el-radio value="normal">一般</el-radio>
                <el-radio value="urgent">紧急</el-radio>
                <el-radio value="critical">特急</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="submitAlarm" :disabled="!selectedElevator" :loading="submitting">
                <el-icon><Check /></el-icon>
                生成处置单
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="card-section">
          <div class="card-title">
            <el-icon><List /></el-icon>
            今日接警记录
          </div>
          <el-table :data="todayAlarms" stripe size="small" max-height="300">
            <el-table-column prop="alarmNo" label="编号" width="130" />
            <el-table-column label="电梯" width="120">
              <template #default="{ row }">{{ row.elevator?.elevatorNo }}</template>
            </el-table-column>
            <el-table-column prop="trappedCount" label="人数" width="60" align="center" />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="alarmTime" label="时间" width="130" />
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import dayjs from 'dayjs'

const router = useRouter()
const store = useAppStore()
const alarmFormRef = ref(null)

const searchKeyword = ref('')
const searchResults = ref([])
const selectedElevator = ref(null)
const submitting = ref(false)

const alarmForm = reactive({
  reporterName: '',
  reporterPhone: '',
  relation: '被困人员',
  trappedCount: 1,
  specialPerson: '',
  emergencyLevel: 'normal'
})

const todayAlarms = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return store.alarms.filter(a => dayjs(a.alarmTime).format('YYYY-MM-DD') === today)
})

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    searchResults.value = store.searchElevators(searchKeyword.value)
  } else {
    searchResults.value = []
  }
}

const selectElevator = (elevator) => {
  selectedElevator.value = elevator
}

const statusType = (status) => {
  const map = { pending: 'warning', dispatched: 'primary', arrived: 'info', closed: 'success' }
  return map[status] || ''
}

const statusLabel = (status) => {
  const map = { pending: '待派单', dispatched: '已派遣', arrived: '已到场', closed: '已结案' }
  return map[status] || status
}

const submitAlarm = async () => {
  if (!alarmForm.reporterName || !alarmForm.reporterPhone) {
    ElMessage.warning('请填写报警人姓名和电话')
    return
  }
  if (!selectedElevator.value) {
    ElMessage.warning('请先选择电梯')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确认生成处置单并推送至救援调度？',
      '提示',
      { type: 'info' }
    )
    
    submitting.value = true
    
    const newAlarm = store.addAlarm({
      reporterName: alarmForm.reporterName,
      reporterPhone: alarmForm.reporterPhone,
      relation: alarmForm.relation,
      elevatorId: selectedElevator.value.id,
      elevator: selectedElevator.value,
      trappedCount: alarmForm.trappedCount,
      specialPerson: alarmForm.specialPerson || '无',
      emergencyLevel: alarmForm.emergencyLevel
    })

    submitting.value = false
    ElMessage.success(`处置单 ${newAlarm.alarmNo} 已生成，请前往救援调度派单`)
    
    setTimeout(() => {
      router.push('/dispatch')
    }, 1500)
  } catch {
    submitting.value = false
  }
}

const resetForm = () => {
  alarmForm.reporterName = ''
  alarmForm.reporterPhone = ''
  alarmForm.relation = '被困人员'
  alarmForm.trappedCount = 1
  alarmForm.specialPerson = ''
  alarmForm.emergencyLevel = 'normal'
  selectedElevator.value = null
  searchKeyword.value = ''
  searchResults.value = []
}
</script>

<style scoped>
.search-results {
  max-height: 350px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.elevator-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.elevator-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.elevator-item.active {
  border-color: #409eff;
  background: #ecf5ff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.elevator-header {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.elevator-building {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.elevator-address {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.elevator-info {
  font-size: 12px;
  color: #606266;
  display: flex;
  gap: 12px;
}

.empty-tip {
  padding: 30px 0;
}
</style>
