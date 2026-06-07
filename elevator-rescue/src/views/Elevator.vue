<template>
  <div class="page-container">
    <div class="card-section">
      <div class="search-bar">
        <el-form :inline="true">
          <el-form-item label="电梯编号">
            <el-input v-model="searchForm.elevatorNo" placeholder="请输入" clearable style="width: 180px" />
          </el-form-item>
          <el-form-item label="楼盘名称">
            <el-input v-model="searchForm.buildingName" placeholder="请输入" clearable style="width: 180px" />
          </el-form-item>
          <el-form-item label="维保单位">
            <el-select v-model="searchForm.maintenanceCompany" placeholder="全部" clearable style="width: 200px">
              <el-option
                v-for="item in maintenanceCompanies"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
              <el-option label="正常" value="normal" />
              <el-option label="维保中" value="maintenance" />
              <el-option label="故障" value="fault" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>查询
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="filteredElevators" stripe>
        <el-table-column prop="elevatorNo" label="电梯编号" width="130" fixed />
        <el-table-column label="楼盘信息" width="200">
          <template #default="{ row }">
            <div style="font-weight: 500">{{ row.buildingName }}</div>
            <div style="color: #909399; font-size: 12px">{{ row.address }}</div>
          </template>
        </el-table-column>
        <el-table-column label="品牌型号" width="150">
          <template #default="{ row }">{{ row.brand }} {{ row.model }}</template>
        </el-table-column>
        <el-table-column prop="floors" label="楼层" width="80" align="center" />
        <el-table-column prop="capacity" label="载重" width="90" align="center" />
        <el-table-column prop="speed" label="速度" width="90" align="center" />
        <el-table-column prop="propertyCompany" label="物业公司" show-overflow-tooltip />
        <el-table-column prop="maintenanceCompany" label="维保单位" show-overflow-tooltip />
        <el-table-column label="下次维保" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="isOverdue(row.nextMaintenance) ? 'danger' : ''" size="small">
              {{ row.nextMaintenance }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailVisible" title="电梯档案详情" width="700px">
      <template v-if="currentElevator">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="电梯编号">{{ currentElevator.elevatorNo }}</el-descriptions-item>
          <el-descriptions-item label="设备状态">
            <el-tag :type="statusType(currentElevator.status)">
              {{ statusLabel(currentElevator.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="品牌">{{ currentElevator.brand }}</el-descriptions-item>
          <el-descriptions-item label="型号">{{ currentElevator.model }}</el-descriptions-item>
          <el-descriptions-item label="所在楼盘">{{ currentElevator.buildingName }}</el-descriptions-item>
          <el-descriptions-item label="楼层数">{{ currentElevator.floors }} 层</el-descriptions-item>
          <el-descriptions-item label="载重">{{ currentElevator.capacity }}</el-descriptions-item>
          <el-descriptions-item label="速度">{{ currentElevator.speed }}</el-descriptions-item>
          <el-descriptions-item label="详细地址" :span="2">{{ currentElevator.address }}</el-descriptions-item>
          <el-descriptions-item label="物业公司">{{ currentElevator.propertyCompany }}</el-descriptions-item>
          <el-descriptions-item label="维保单位">{{ currentElevator.maintenanceCompany }}</el-descriptions-item>
          <el-descriptions-item label="安装日期">{{ currentElevator.installDate }}</el-descriptions-item>
          <el-descriptions-item label="验收日期">{{ currentElevator.acceptanceDate }}</el-descriptions-item>
          <el-descriptions-item label="质保到期">{{ currentElevator.warrantyEnd }}</el-descriptions-item>
          <el-descriptions-item label="上次维保">{{ currentElevator.lastMaintenance }}</el-descriptions-item>
          <el-descriptions-item label="下次维保">
            <el-tag :type="isOverdue(currentElevator.nextMaintenance) ? 'danger' : ''">
              {{ currentElevator.nextMaintenance }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="fault-history" style="margin-top: 20px">
          <h4 style="margin-bottom: 12px">历史故障记录</h4>
          <el-table :data="elevatorFaultHistory" size="small" border>
            <el-table-column prop="alarmNo" label="接警编号" width="130" />
            <el-table-column prop="alarmTime" label="故障时间" width="150" />
            <el-table-column prop="faultReason" label="故障原因" />
            <el-table-column prop="status" label="处置状态" width="80" />
          </el-table>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import dayjs from 'dayjs'

const store = useAppStore()

const searchForm = reactive({
  elevatorNo: '',
  buildingName: '',
  maintenanceCompany: '',
  status: ''
})

const detailVisible = ref(false)
const currentElevator = ref(null)

const maintenanceCompanies = computed(() => {
  return [...new Set(store.elevators.map(e => e.maintenanceCompany))]
})

const filteredElevators = computed(() => {
  return store.elevators.filter(e => {
    if (searchForm.elevatorNo && !e.elevatorNo.toLowerCase().includes(searchForm.elevatorNo.toLowerCase())) return false
    if (searchForm.buildingName && !e.buildingName.includes(searchForm.buildingName)) return false
    if (searchForm.maintenanceCompany && e.maintenanceCompany !== searchForm.maintenanceCompany) return false
    if (searchForm.status && e.status !== searchForm.status) return false
    return true
  })
})

const elevatorFaultHistory = computed(() => {
  if (!currentElevator.value) return []
  return store.alarms
    .filter(a => a.elevatorId === currentElevator.value.id)
    .map(a => ({
      alarmNo: a.alarmNo,
      alarmTime: a.alarmTime,
      faultReason: a.faultReason ? store.getFaultReasonLabel(a.faultReason) : '-',
      status: a.status === 'closed' ? '已结案' : '处置中'
    }))
})

const statusType = (status) => {
  const map = { normal: 'success', maintenance: 'warning', fault: 'danger' }
  return map[status] || ''
}

const statusLabel = (status) => {
  const map = { normal: '正常', maintenance: '维保中', fault: '故障' }
  return map[status] || status
}

const isOverdue = (date) => {
  return dayjs(date).isBefore(dayjs())
}

const handleSearch = () => {}

const resetSearch = () => {
  searchForm.elevatorNo = ''
  searchForm.buildingName = ''
  searchForm.maintenanceCompany = ''
  searchForm.status = ''
}

const viewDetail = (row) => {
  currentElevator.value = row
  detailVisible.value = true
}
</script>

<style scoped>
.search-bar {
  margin-bottom: 16px;
}
</style>
