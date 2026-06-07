<template>
  <div class="page-container">
    <div class="card-section">
      <div class="search-bar">
        <el-form :inline="true">
          <el-form-item label="电梯编号">
            <el-input v-model="searchForm.elevatorNo" placeholder="请输入" clearable style="width: 180px" />
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
          <el-form-item label="维保类型">
            <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 140px">
              <el-option label="半月保" value="half_month" />
              <el-option label="季度保" value="quarter" />
              <el-option label="半年保" value="half_year" />
              <el-option label="年度保" value="year" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
              <el-option label="已完成" value="done" />
              <el-option label="待执行" value="pending" />
              <el-option label="已逾期" value="overdue" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary"><el-icon><Search /></el-icon>查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="maintenanceRecords" stripe>
        <el-table-column prop="recordNo" label="维保单号" width="140" />
        <el-table-column label="电梯信息" width="200">
          <template #default="{ row }">
            <div style="font-weight: 500">{{ row.elevatorNo }}</div>
            <div style="color: #909399; font-size: 12px">{{ row.buildingName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="typeLabel" label="维保类型" width="100" align="center" />
        <el-table-column prop="planDate" label="计划日期" width="110" align="center" />
        <el-table-column prop="actualDate" label="实际日期" width="110" align="center">
          <template #default="{ row }">
            <span v-if="row.actualDate">{{ row.actualDate }}</span>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="maintenanceCompany" label="维保单位" show-overflow-tooltip />
        <el-table-column prop="maintainer" label="维保人员" width="100" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailVisible" title="维保记录详情" width="650px">
      <template v-if="currentRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="维保单号">{{ currentRecord.recordNo }}</el-descriptions-item>
          <el-descriptions-item label="维保类型">{{ currentRecord.typeLabel }}</el-descriptions-item>
          <el-descriptions-item label="电梯编号">{{ currentRecord.elevatorNo }}</el-descriptions-item>
          <el-descriptions-item label="所在楼盘">{{ currentRecord.buildingName }}</el-descriptions-item>
          <el-descriptions-item label="维保单位">{{ currentRecord.maintenanceCompany }}</el-descriptions-item>
          <el-descriptions-item label="维保人员">{{ currentRecord.maintainer }}</el-descriptions-item>
          <el-descriptions-item label="计划日期">{{ currentRecord.planDate }}</el-descriptions-item>
          <el-descriptions-item label="实际日期">{{ currentRecord.actualDate || '-' }}</el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 20px">
          <h4 style="margin-bottom: 12px">维保项目</h4>
          <el-table :data="currentRecord.items" size="small" border>
            <el-table-column prop="name" label="维保项目" />
            <el-table-column prop="result" label="检查结果" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.result === '正常' ? 'success' : 'warning'" size="small">
                  {{ row.result }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-if="currentRecord.remark" style="margin-top: 16px">
          <h4 style="margin-bottom: 8px">备注说明</h4>
          <p style="color: #606266">{{ currentRecord.remark }}</p>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()

const searchForm = reactive({
  elevatorNo: '',
  maintenanceCompany: '',
  type: '',
  status: ''
})

const detailVisible = ref(false)
const currentRecord = ref(null)

const maintenanceCompanies = computed(() => {
  return [...new Set(store.elevators.map(e => e.maintenanceCompany))]
})

const mockRecords = [
  {
    recordNo: 'WB20260601001',
    elevatorNo: 'DT-001-A01',
    buildingName: '阳光花园1号楼',
    type: 'half_month',
    typeLabel: '半月保',
    planDate: '2026-06-01',
    actualDate: '2026-06-01',
    maintenanceCompany: '安捷电梯维保有限公司',
    maintainer: '张工',
    status: 'done',
    statusLabel: '已完成',
    remark: '运行正常，无异常',
    items: [
      { name: '轿厢内选层按钮', result: '正常' },
      { name: '厅门门锁', result: '正常' },
      { name: '安全触板/光幕', result: '正常' },
      { name: '紧急照明', result: '正常' },
      { name: '警铃/对讲', result: '正常' }
    ]
  },
  {
    recordNo: 'WB20260605001',
    elevatorNo: 'DT-003-C01',
    buildingName: '金域华府3号楼',
    type: 'quarter',
    typeLabel: '季度保',
    planDate: '2026-06-05',
    actualDate: '2026-06-05',
    maintenanceCompany: '日立电梯服务北京分公司',
    maintainer: '赵工',
    status: 'done',
    statusLabel: '已完成',
    remark: '更换门机皮带一根',
    items: [
      { name: '限速器', result: '正常' },
      { name: '安全钳', result: '正常' },
      { name: '缓冲器', result: '正常' },
      { name: '门锁装置', result: '正常' },
      { name: '门机系统', result: '异常' }
    ]
  },
  {
    recordNo: 'WB20260620001',
    elevatorNo: 'DT-001-A01',
    buildingName: '阳光花园1号楼',
    type: 'half_month',
    typeLabel: '半月保',
    planDate: '2026-06-20',
    actualDate: null,
    maintenanceCompany: '安捷电梯维保有限公司',
    maintainer: '-',
    status: 'pending',
    statusLabel: '待执行',
    remark: '',
    items: []
  },
  {
    recordNo: 'WB20260628001',
    elevatorNo: 'DT-004-D01',
    buildingName: '银河广场4号楼',
    type: 'half_month',
    typeLabel: '半月保',
    planDate: '2026-06-28',
    actualDate: null,
    maintenanceCompany: '通力电梯北京服务中心',
    maintainer: '-',
    status: 'pending',
    statusLabel: '待执行',
    remark: '',
    items: []
  }
]

const maintenanceRecords = ref(mockRecords)

const statusType = (status) => {
  const map = { done: 'success', pending: 'warning', overdue: 'danger' }
  return map[status] || ''
}

const resetSearch = () => {
  searchForm.elevatorNo = ''
  searchForm.maintenanceCompany = ''
  searchForm.type = ''
  searchForm.status = ''
}

const viewDetail = (row) => {
  currentRecord.value = row
  detailVisible.value = true
}
</script>

<style scoped>
.search-bar {
  margin-bottom: 16px;
}
</style>
