import { defineStore } from 'pinia'
import dayjs from 'dayjs'

const generateId = () => Math.random().toString(36).substr(2, 9)

const initialElevators = [
  {
    id: 'DT-001-A01',
    elevatorNo: 'DT-001-A01',
    brand: '三菱',
    model: 'LEHY-III',
    floors: 32,
    capacity: '1000kg',
    speed: '2.0m/s',
    buildingName: '阳光花园1号楼',
    address: '朝阳区建国路88号',
    propertyCompany: '阳光物业有限公司',
    maintenanceCompany: '安捷电梯维保有限公司',
    installDate: '2018-05-20',
    acceptanceDate: '2018-08-15',
    warrantyEnd: '2026-08-15',
    status: 'normal',
    lastMaintenance: '2026-05-20',
    nextMaintenance: '2026-06-20'
  },
  {
    id: 'DT-001-A02',
    elevatorNo: 'DT-001-A02',
    brand: '三菱',
    model: 'LEHY-III',
    floors: 32,
    capacity: '1000kg',
    speed: '2.0m/s',
    buildingName: '阳光花园1号楼',
    address: '朝阳区建国路88号',
    propertyCompany: '阳光物业有限公司',
    maintenanceCompany: '安捷电梯维保有限公司',
    installDate: '2018-05-20',
    acceptanceDate: '2018-08-15',
    warrantyEnd: '2026-08-15',
    status: 'normal',
    lastMaintenance: '2026-05-20',
    nextMaintenance: '2026-06-20'
  },
  {
    id: 'DT-002-B01',
    elevatorNo: 'DT-002-B01',
    brand: '奥的斯',
    model: 'Gen2',
    floors: 24,
    capacity: '800kg',
    speed: '1.75m/s',
    buildingName: '翠湖苑2号楼',
    address: '海淀区中关村大街100号',
    propertyCompany: '翠湖物业管理公司',
    maintenanceCompany: '奥的斯机电服务有限公司',
    installDate: '2019-03-10',
    acceptanceDate: '2019-06-20',
    warrantyEnd: '2027-06-20',
    status: 'normal',
    lastMaintenance: '2026-06-01',
    nextMaintenance: '2026-07-01'
  },
  {
    id: 'DT-003-C01',
    elevatorNo: 'DT-003-C01',
    brand: '日立',
    model: 'HGP',
    floors: 18,
    capacity: '1000kg',
    speed: '1.5m/s',
    buildingName: '金域华府3号楼',
    address: '丰台区南四环西路16号',
    propertyCompany: '金域物业',
    maintenanceCompany: '日立电梯服务北京分公司',
    installDate: '2017-11-05',
    acceptanceDate: '2018-02-28',
    warrantyEnd: '2025-02-28',
    status: 'maintenance',
    lastMaintenance: '2026-06-05',
    nextMaintenance: '2026-07-05'
  },
  {
    id: 'DT-004-D01',
    elevatorNo: 'DT-004-D01',
    brand: '通力',
    model: 'MonoSpace',
    floors: 28,
    capacity: '1000kg',
    speed: '2.0m/s',
    buildingName: '银河广场4号楼',
    address: '西城区金融街15号',
    propertyCompany: '银河商业物业管理公司',
    maintenanceCompany: '通力电梯北京服务中心',
    installDate: '2020-08-15',
    acceptanceDate: '2020-12-01',
    warrantyEnd: '2028-12-01',
    status: 'normal',
    lastMaintenance: '2026-05-28',
    nextMaintenance: '2026-06-28'
  }
]

const initialRescuers = [
  { id: 'R001', name: '张工', phone: '138****1001', company: '安捷电梯维保有限公司', status: 'idle', currentTask: null },
  { id: 'R002', name: '李工', phone: '138****1002', company: '安捷电梯维保有限公司', status: 'busy', currentTask: null },
  { id: 'R003', name: '王工', phone: '138****1003', company: '奥的斯机电服务有限公司', status: 'idle', currentTask: null },
  { id: 'R004', name: '赵工', phone: '138****1004', company: '日立电梯服务北京分公司', status: 'idle', currentTask: null },
  { id: 'R005', name: '刘工', phone: '138****1005', company: '通力电梯北京服务中心', status: 'busy', currentTask: null }
]

const initialAlarms = [
  {
    id: 'JJ20260607001',
    alarmNo: 'JJ20260607001',
    alarmTime: '2026-06-07 08:30:00',
    reporterName: '王先生',
    reporterPhone: '139****2001',
    relation: '被困人员',
    elevatorId: 'DT-001-A01',
    elevator: initialElevators[0],
    trappedCount: 2,
    specialPerson: '无',
    emergencyLevel: 'normal',
    status: 'dispatched',
    dispatchTime: '2026-06-07 08:31:00',
    rescuerId: 'R001',
    rescuer: initialRescuers[0],
    arriveTime: '2026-06-07 08:55:00',
    finishTime: '2026-06-07 09:15:00',
    closeTime: '2026-06-07 09:30:00',
    trappedPersons: [
      { name: '王先生', gender: '男', age: 35, health: '良好' },
      { name: '李女士', gender: '女', age: 28, health: '良好' }
    ],
    comfortRecords: [
      { time: '2026-06-07 08:35:00', content: '安抚被困人员不要慌张，救援人员已在途中' },
      { time: '2026-06-07 08:50:00', content: '告知救援人员已到楼下，正在准备工具' }
    ],
    doorOpenResult: 'success',
    faultReason: 'door_system',
    faultReasonDetail: '门锁触点接触不良',
    evaluation: { score: 5, comment: '救援及时，态度很好', time: '2026-06-07 10:00:00' }
  },
  {
    id: 'JJ20260607002',
    alarmNo: 'JJ20260607002',
    alarmTime: '2026-06-07 09:20:00',
    reporterName: '张女士',
    reporterPhone: '139****2002',
    relation: '被困人员家属',
    elevatorId: 'DT-002-B01',
    elevator: initialElevators[2],
    trappedCount: 3,
    specialPerson: '有1名70岁老人',
    emergencyLevel: 'urgent',
    status: 'dispatched',
    dispatchTime: '2026-06-07 09:21:00',
    rescuerId: 'R003',
    rescuer: initialRescuers[2],
    arriveTime: null,
    finishTime: null,
    closeTime: null,
    trappedPersons: [],
    comfortRecords: [],
    doorOpenResult: null,
    faultReason: null
  }
]

export const useAppStore = defineStore('app', {
  state: () => ({
    elevators: initialElevators,
    rescuers: initialRescuers,
    alarms: initialAlarms,
    comfortTemplates: [
      '您好，我们已经接到您的求助电话，请不要慌张，保持冷静。',
      '救援人员正在赶来的路上，请耐心等待，不要强行扒门。',
      '请靠在电梯轿厢壁上，保持呼吸平稳，我们会尽快救出您。',
      '如果您感到身体不适，请告诉我们，我们会提前准备医疗援助。',
      '感谢您的配合，救援人员很快就到。'
    ],
    faultReasons: [
      { value: 'door_system', label: '门系统故障' },
      { value: 'control_system', label: '控制系统故障' },
      { value: 'safety_device', label: '安全保护装置动作' },
      { value: 'power_fault', label: '电源故障' },
      { value: 'human_factor', label: '人为因素' },
      { value: 'other', label: '其他' }
    ]
  }),

  getters: {
    pendingDispatchAlarms: (state) => state.alarms.filter(a => a.status === 'pending'),
    dispatchedAlarms: (state) => state.alarms.filter(a => a.status === 'dispatched' || a.status === 'arrived'),
    closedAlarms: (state) => state.alarms.filter(a => a.status === 'closed'),
    
    timeoutAlarms: (state) => {
      return state.alarms.filter(a => {
        if (a.status === 'dispatched' && a.dispatchTime) {
          const dispatchTime = dayjs(a.dispatchTime)
          const now = dayjs()
          const diffMinutes = now.diff(dispatchTime, 'minute')
          return diffMinutes > 30
        }
        return false
      })
    },

    idleRescuers: (state) => state.rescuers.filter(r => r.status === 'idle'),

    todayAlarmCount: (state) => {
      const today = dayjs().format('YYYY-MM-DD')
      return state.alarms.filter(a => dayjs(a.alarmTime).format('YYYY-MM-DD') === today).length
    },

    processingCount: (state) => {
      return state.alarms.filter(a => ['pending', 'dispatched', 'arrived'].includes(a.status)).length
    },

    todayClosedCount: (state) => {
      const today = dayjs().format('YYYY-MM-DD')
      return state.alarms.filter(a => a.status === 'closed' && dayjs(a.closeTime).format('YYYY-MM-DD') === today).length
    },

    avgResponseTime: (state) => {
      const closed = state.alarms.filter(a => a.dispatchTime && a.arriveTime)
      if (closed.length === 0) return 0
      const total = closed.reduce((sum, a) => {
        return sum + dayjs(a.arriveTime).diff(dayjs(a.dispatchTime), 'minute')
      }, 0)
      return Math.round(total / closed.length)
    },

    monthlyRanking: (state) => {
      const companyStats = {}
      state.alarms.filter(a => a.status === 'closed').forEach(alarm => {
        const company = alarm.elevator.maintenanceCompany
        if (!companyStats[company]) {
          companyStats[company] = { total: 0, onTime: 0, totalResponseTime: 0, avgScore: 0, scoreCount: 0 }
        }
        companyStats[company].total++
        if (alarm.dispatchTime && alarm.arriveTime) {
          const responseTime = dayjs(alarm.arriveTime).diff(dayjs(alarm.dispatchTime), 'minute')
          if (responseTime <= 30) companyStats[company].onTime++
          companyStats[company].totalResponseTime += responseTime
        }
        if (alarm.evaluation) {
          companyStats[company].avgScore += alarm.evaluation.score
          companyStats[company].scoreCount++
        }
      })
      return Object.entries(companyStats).map(([company, stats]) => ({
        company,
        total: stats.total,
        onTimeRate: stats.total > 0 ? Math.round((stats.onTime / stats.total) * 100) : 0,
        avgResponseTime: stats.total > 0 ? Math.round(stats.totalResponseTime / stats.total) : 0,
        avgScore: stats.scoreCount > 0 ? (stats.avgScore / stats.scoreCount).toFixed(1) : '0.0'
      })).sort((a, b) => b.onTimeRate - a.onTimeRate)
    },

    faultTypeStats: (state) => {
      const stats = {}
      state.alarms.filter(a => a.faultReason).forEach(alarm => {
        const reason = alarm.faultReason
        stats[reason] = (stats[reason] || 0) + 1
      })
      return state.faultReasons.map(fr => ({
        name: fr.label,
        value: stats[fr.value] || 0
      }))
    },

    avgResponseTimeTrend: () => {
      return [
        { date: '06-01', time: 25 },
        { date: '06-02', time: 28 },
        { date: '06-03', time: 22 },
        { date: '06-04', time: 30 },
        { date: '06-05', time: 24 },
        { date: '06-06', time: 26 },
        { date: '06-07', time: 23 }
      ]
    },

    evaluationStats: (state) => {
      const scores = [0, 0, 0, 0, 0]
      let total = 0
      let sum = 0
      state.alarms.filter(a => a.evaluation).forEach(alarm => {
        const score = alarm.evaluation.score
        scores[score - 1]++
        total++
        sum += score
      })
      return {
        total,
        avgScore: total > 0 ? (sum / total).toFixed(1) : '0.0',
        distribution: scores.map((count, i) => ({
          score: i + 1,
          count,
          percent: total > 0 ? Math.round((count / total) * 100) : 0
        })).reverse()
      }
    }
  },

  actions: {
    addAlarm(alarmData) {
      const newAlarm = {
        id: generateId(),
        alarmNo: 'JJ' + dayjs().format('YYYYMMDDHHmmss'),
        alarmTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        status: 'pending',
        dispatchTime: null,
        rescuerId: null,
        rescuer: null,
        arriveTime: null,
        finishTime: null,
        closeTime: null,
        trappedPersons: [],
        comfortRecords: [],
        doorOpenResult: null,
        faultReason: null,
        faultReasonDetail: '',
        evaluation: null,
        ...alarmData
      }
      this.alarms.unshift(newAlarm)
      return newAlarm
    },

    dispatchAlarm(alarmId, rescuerId) {
      const alarm = this.alarms.find(a => a.id === alarmId)
      const rescuer = this.rescuers.find(r => r.id === rescuerId)
      if (alarm && rescuer) {
        alarm.status = 'dispatched'
        alarm.dispatchTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        alarm.rescuerId = rescuerId
        alarm.rescuer = rescuer
        rescuer.status = 'busy'
        rescuer.currentTask = alarmId
      }
    },

    markArrived(alarmId) {
      const alarm = this.alarms.find(a => a.id === alarmId)
      if (alarm) {
        alarm.status = 'arrived'
        alarm.arriveTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
    },

    updateTrappedPersons(alarmId, persons) {
      const alarm = this.alarms.find(a => a.id === alarmId)
      if (alarm) {
        alarm.trappedPersons = persons
      }
    },

    addComfortRecord(alarmId, content) {
      const alarm = this.alarms.find(a => a.id === alarmId)
      if (alarm) {
        alarm.comfortRecords.push({
          time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          content
        })
      }
    },

    closeAlarm(alarmId, data) {
      const alarm = this.alarms.find(a => a.id === alarmId)
      if (alarm) {
        alarm.doorOpenResult = data.doorOpenResult
        alarm.faultReason = data.faultReason
        alarm.faultReasonDetail = data.faultReasonDetail
        alarm.status = 'closed'
        alarm.finishTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        alarm.closeTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        if (alarm.rescuerId) {
          const rescuer = this.rescuers.find(r => r.id === alarm.rescuerId)
          if (rescuer) {
            rescuer.status = 'idle'
            rescuer.currentTask = null
          }
        }
      }
    },

    addEvaluation(alarmId, score, comment) {
      const alarm = this.alarms.find(a => a.id === alarmId)
      if (alarm) {
        alarm.evaluation = {
          score,
          comment,
          time: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
      }
    },

    searchElevators(keyword) {
      if (!keyword) return []
      const lowerKeyword = keyword.toLowerCase()
      return this.elevators.filter(e => 
        e.elevatorNo.toLowerCase().includes(lowerKeyword) ||
        e.buildingName.toLowerCase().includes(lowerKeyword) ||
        e.address.toLowerCase().includes(lowerKeyword)
      )
    },

    getFaultReasonLabel(value) {
      const fr = this.faultReasons.find(f => f.value === value)
      return fr ? fr.label : value
    }
  }
})
