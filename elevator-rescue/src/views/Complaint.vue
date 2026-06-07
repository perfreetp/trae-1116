<template>
  <div class="page-container">
    <div class="card-section">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="待回访" name="pending">
          <el-table :data="pendingComplaints" stripe>
            <el-table-column prop="complaintNo" label="投诉编号" width="140" />
            <el-table-column prop="alarmNo" label="关联接警" width="140" />
            <el-table-column label="涉事电梯" width="180">
              <template #default="{ row }">
                <div>{{ row.buildingName }}</div>
                <div style="color: #909399; font-size: 12px">{{ row.elevatorNo }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="complainant" label="投诉人" width="90" />
            <el-table-column prop="phone" label="联系电话" width="120" />
            <el-table-column prop="complaintTime" label="投诉时间" width="140" />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag size="small" type="warning">待回访</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="openVisitDialog(row)">
                  回访登记
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="已回访" name="done">
          <el-table :data="doneComplaints" stripe>
            <el-table-column prop="complaintNo" label="投诉编号" width="140" />
            <el-table-column prop="alarmNo" label="关联接警" width="140" />
            <el-table-column label="涉事电梯" width="180">
              <template #default="{ row }">
                <div>{{ row.buildingName }}</div>
                <div style="color: #909399; font-size: 12px">{{ row.elevatorNo }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="complainant" label="投诉人" width="90" />
            <el-table-column label="业主评价" width="120" align="center">
              <template #default="{ row }">
                <el-rate v-model="row.score" disabled :size="15" />
              </template>
            </el-table-column>
            <el-table-column prop="visitTime" label="回访时间" width="140" />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag size="small" type="success">已回访</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewDetail(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="visitDialogVisible" title="回访登记" width="600px">
      <template v-if="currentComplaint">
        <el-descriptions :column="2" border size="small" style="margin-bottom: 20px">
          <el-descriptions-item label="投诉编号">{{ currentComplaint.complaintNo }}</el-descriptions-item>
          <el-descriptions-item label="关联接警">{{ currentComplaint.alarmNo }}</el-descriptions-item>
          <el-descriptions-item label="投诉人">{{ currentComplaint.complainant }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentComplaint.phone }}</el-descriptions-item>
          <el-descriptions-item label="投诉内容" :span="2">{{ currentComplaint.content }}</el-descriptions-item>
        </el-descriptions>

        <el-form :model="visitForm" label-width="100px">
          <el-form-item label="回访人员">
            <el-input v-model="visitForm.visitor" placeholder="请输入回访人员姓名" />
          </el-form-item>
          <el-form-item label="业主评分">
            <el-rate v-model="visitForm.score" />
          </el-form-item>
          <el-form-item label="业主评价">
            <el-input
              v-model="visitForm.comment"
              type="textarea"
              :rows="3"
              placeholder="请输入业主评价内容"
            />
          </el-form-item>
          <el-form-item label="处理结果">
            <el-input
              v-model="visitForm.result"
              type="textarea"
              :rows="3"
              placeholder="请输入处理结果说明"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="visitDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveVisit">保存</el-button>
        </template>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="回访详情" width="600px">
      <template v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="投诉编号">{{ currentDetail.complaintNo }}</el-descriptions-item>
          <el-descriptions-item label="关联接警">{{ currentDetail.alarmNo }}</el-descriptions-item>
          <el-descriptions-item label="投诉人">{{ currentDetail.complainant }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentDetail.phone }}</el-descriptions-item>
          <el-descriptions-item label="投诉内容" :span="2">{{ currentDetail.content }}</el-descriptions-item>
          <el-descriptions-item label="投诉时间">{{ currentDetail.complaintTime }}</el-descriptions-item>
          <el-descriptions-item label="回访时间">{{ currentDetail.visitTime }}</el-descriptions-item>
          <el-descriptions-item label="回访人员">{{ currentDetail.visitor }}</el-descriptions-item>
          <el-descriptions-item label="业主评分">
            <el-rate v-model="currentDetail.score" disabled :size="15" />
          </el-descriptions-item>
          <el-descriptions-item label="业主评价" :span="2">{{ currentDetail.comment }}</el-descriptions-item>
          <el-descriptions-item label="处理结果" :span="2">{{ currentDetail.result }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const activeTab = ref('pending')
const visitDialogVisible = ref(false)
const detailVisible = ref(false)
const currentComplaint = ref(null)
const currentDetail = ref(null)

const visitForm = reactive({
  visitor: '',
  score: 3,
  comment: '',
  result: ''
})

const pendingComplaints = ref([
  {
    complaintNo: 'TS20260607001',
    alarmNo: 'JJ20260607002',
    buildingName: '翠湖苑2号楼',
    elevatorNo: 'DT-002-B01',
    complainant: '张女士',
    phone: '139****2002',
    content: '电梯困人半个多小时，救援速度太慢，老人受到惊吓',
    complaintTime: '2026-06-07 09:45:00'
  }
])

const doneComplaints = ref([
  {
    complaintNo: 'TS20260605001',
    alarmNo: 'JJ20260605003',
    buildingName: '阳光花园1号楼',
    elevatorNo: 'DT-001-A01',
    complainant: '李先生',
    phone: '139****2003',
    content: '电梯运行时有异响，乘坐体验差',
    complaintTime: '2026-06-05 14:20:00',
    visitor: '王客服',
    score: 4,
    comment: '处理还算及时，希望以后能定期检查',
    result: '已安排维保人员上门检查，对电梯进行了全面检修，异响问题已解决',
    visitTime: '2026-06-05 16:30:00'
  },
  {
    complaintNo: 'TS20260603001',
    alarmNo: 'JJ20260603001',
    buildingName: '银河广场4号楼',
    elevatorNo: 'DT-004-D01',
    complainant: '赵先生',
    phone: '139****2004',
    content: '被困20分钟，无人安抚',
    complaintTime: '2026-06-03 10:15:00',
    visitor: '张客服',
    score: 3,
    comment: '救援速度还行，但希望困在里面时能有人说话安抚',
    result: '已对物业人员进行培训，要求接警后持续与被困人员保持沟通',
    visitTime: '2026-06-03 15:00:00'
  }
])

const openVisitDialog = (row) => {
  currentComplaint.value = row
  visitForm.visitor = ''
  visitForm.score = 3
  visitForm.comment = ''
  visitForm.result = ''
  visitDialogVisible.value = true
}

const saveVisit = () => {
  if (!visitForm.visitor) {
    ElMessage.warning('请输入回访人员姓名')
    return
  }
  const idx = pendingComplaints.value.findIndex(c => c.complaintNo === currentComplaint.value.complaintNo)
  if (idx > -1) {
    const item = {
      ...pendingComplaints.value[idx],
      visitor: visitForm.visitor,
      score: visitForm.score,
      comment: visitForm.comment,
      result: visitForm.result,
      visitTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    pendingComplaints.value.splice(idx, 1)
    doneComplaints.value.unshift(item)
  }
  visitDialogVisible.value = false
  ElMessage.success('回访记录已保存')
}

const viewDetail = (row) => {
  currentDetail.value = row
  detailVisible.value = true
}
</script>
