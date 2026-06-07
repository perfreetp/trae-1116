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
    area: '朝阳区',
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
    area: '朝阳区',
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
    area: '海淀区',
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
    area: '丰台区',
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
    area: '西城区',
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
  { id: 'R001', name: '张工', phone: '138****1001', company: '安捷电梯维保有限公司', area: '朝阳区', status: 'idle', currentTask: null, estimatedArrival: 15, isBackup: false },
  { id: 'R002', name: '李工', phone: '138****1002', company: '安捷电梯维保有限公司', area: '朝阳区', status: 'busy', currentTask: null, estimatedArrival: 20, isBackup: false },
  { id: 'R003', name: '王工', phone: '138****1003', company: '奥的斯机电服务有限公司', area: '海淀区', status: 'idle', currentTask: null, estimatedArrival: 18, isBackup: false },
  { id: 'R004', name: '赵工', phone: '138****1004', company: '日立电梯服务北京分公司', area: '丰台区', status: 'idle', currentTask: null, estimatedArrival: 22, isBackup: false },
  { id: 'R005', name: '刘工', phone: '138****1005', company: '通力电梯北京服务中心', area: '西城区', status: 'busy', currentTask: null, estimatedArrival: 25, isBackup: false },
  { id: 'R006', name: '陈工', phone: '138****1006', company: '应急备援一队', area: '朝阳区', status: 'idle', currentTask: null, isBackup: true, estimatedArrival: 12 },
  { id: 'R007', name: '周工', phone: '138****1007', company: '应急备援一队', area: '海淀区', status: 'idle', currentTask: null, isBackup: true, estimatedArrival: 15 },
  { id: 'R008', name: '吴工', phone: '138****1008', company: '应急备援二队', area: '丰台区', status: 'idle', currentTask: null, isBackup: true, estimatedArrival: 18 }
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
    status: 'closed',
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
    isEscalated: false,
    escalateTime: null,
    escalationStatus: null,
    backupRescuerId: null,
    backupRescuer: null,
    backupArriveTime: null,
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
    faultReason: null,
    isEscalated: false,
    escalateTime: null,
    escalationStatus: null,
    backupRescuerId: null,
    backupRescuer: null,
    backupArriveTime: null,
    evaluation: null
  }
]

export const useAppStore = defineStore('app', {
  state: () => ({
    elevators: initialElevators,
    rescuers: initialRescuers,
    alarms: initialAlarms,
    auditLogs: [
      { id: 'log1', alarmId: 'JJ20260607001', actionType: 'alarm', content: '接警登记成功，被困2人', operator: '系统', operatorRole: 'system', time: '2026-06-07 08:30:00' },
      { id: 'log2', alarmId: 'JJ20260607001', actionType: 'dispatch', content: '已派遣救援人员张工（安捷电梯维保有限公司）', operator: '调度员', operatorRole: 'maintenance', time: '2026-06-07 08:31:00' },
      { id: 'log3', alarmId: 'JJ20260607001', actionType: 'comfort', content: '安抚记录：安抚被困人员不要慌张，救援人员已在途中', operator: '物业人员', operatorRole: 'property', time: '2026-06-07 08:35:00' },
      { id: 'log4', alarmId: 'JJ20260607001', actionType: 'comfort', content: '安抚记录：告知救援人员已到楼下，正在准备工具', operator: '物业人员', operatorRole: 'property', time: '2026-06-07 08:50:00' },
      { id: 'log5', alarmId: 'JJ20260607001', actionType: 'arrive', content: '救援人员张工已到场', operator: '救援人员', operatorRole: 'rescuer', time: '2026-06-07 08:55:00' },
      { id: 'log6', alarmId: 'JJ20260607001', actionType: 'close', content: '案件结案，开门结果：成功', operator: '救援人员', operatorRole: 'rescuer', time: '2026-06-07 09:30:00' },
      { id: 'log7', alarmId: 'JJ20260607002', actionType: 'alarm', content: '接警登记成功，被困3人', operator: '系统', operatorRole: 'system', time: '2026-06-07 09:20:00' },
      { id: 'log8', alarmId: 'JJ20260607002', actionType: 'dispatch', content: '已派遣救援人员王工（奥的斯机电服务有限公司）', operator: '调度员', operatorRole: 'maintenance', time: '2026-06-07 09:21:00' }
    ],
    currentRole: 'supervisor',
    statsFilter: {
      community: '',
      company: '',
      faultType: '',
      emergency: ''
    },
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
    ],
    emergencyLevels: [
      { value: 'normal', label: '一般' },
      { value: 'urgent', label: '紧急' },
      { value: 'critical', label: '特急' }
    ],
    escalationStatusLabels: {
      requested: '已申请支援',
      backup_dispatched: '备援已派出',
      backup_arrived: '备援已到场',
      completed: '支援结束'
    }
  }),

  getters: {
    pendingDispatchAlarms: (state) => state.alarms.filter(a => a.status === 'pending'),
    dispatchedAlarms: (state) => state.alarms.filter(a => a.status === 'dispatched' || a.status === 'arrived'),
    closedAlarms: (state) => state.alarms.filter(a => a.status === 'closed'),
    allActiveAlarms: (state) => state.alarms.filter(a => a.status !== 'closed'),
    
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

    escalatedAlarms: (state) => state.alarms.filter(a => a.isEscalated && a.status !== 'closed'),

    backupRescuers: (state) => state.rescuers.filter(r => r.isBackup),
    idleRescuers: (state) => state.rescuers.filter(r => r.status === 'idle'),

    getNearbyRescuers: (state) => (area, includeBackup = true) => {
      return state.rescuers.filter(r => {
        if (r.status !== 'idle') return false
        if (!includeBackup && r.isBackup) return false
        return r.area === area
      }).sort((a, b) => a.estimatedArrival - b.estimatedArrival)
    },

    getRecommendedRescuer: (state) => (alarm) => {
      if (!alarm.elevator) return null
      const area = alarm.elevator.area
      const company = alarm.elevator.maintenanceCompany
      
      const companyRescuers = state.rescuers.filter(r => 
        r.status === 'idle' && !r.isBackup && r.company === company
      )
      
      if (companyRescuers.length > 0) {
        return companyRescuers.sort((a, b) => a.estimatedArrival - b.estimatedArrival)[0]
      }
      
      const areaRescuers = state.rescuers.filter(r => 
        r.status === 'idle' && !r.isBackup && r.area === area
      )
      if (areaRescuers.length > 0) {
        return areaRescuers.sort((a, b) => a.estimatedArrival - b.estimatedArrival)[0]
      }
      
      const backups = state.rescuers.filter(r => r.status === 'idle' && r.isBackup && r.area === area)
      return backups.length > 0 ? backups.sort((a, b) => a.estimatedArrival - b.estimatedArrival)[0] : null
    },

    areas: (state) => [...new Set(state.elevators.map(e => e.area))],
    buildingNames: (state) => [...new Set(state.elevators.map(e => e.buildingName))],
    maintenanceCompanies: (state) => [...new Set(state.elevators.map(e => e.maintenanceCompany))],

    alarmsByArea: (state) => {
      const grouped = {}
      state.alarms.filter(a => a.status !== 'closed').forEach(alarm => {
        const area = alarm.elevator?.area || '未分配'
        if (!grouped[area]) grouped[area] = []
        grouped[area].push(alarm)
      })
      return grouped
    },

    filteredAlarms: (state) => {
      return state.alarms.filter(a => {
        if (state.statsFilter.community && a.elevator?.buildingName !== state.statsFilter.community) return false
        if (state.statsFilter.company && a.elevator?.maintenanceCompany !== state.statsFilter.company) return false
        if (state.statsFilter.faultType && a.faultReason !== state.statsFilter.faultType) return false
        if (state.statsFilter.emergency && a.emergencyLevel !== state.statsFilter.emergency) return false
        return true
      })
    },

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
      const filtered = state.alarms.filter(a => {
        if (state.statsFilter.community && a.elevator?.buildingName !== state.statsFilter.community) return false
        if (state.statsFilter.company && a.elevator?.maintenanceCompany !== state.statsFilter.company) return false
        if (state.statsFilter.faultType && a.faultReason !== state.statsFilter.faultType) return false
        if (state.statsFilter.emergency && a.emergencyLevel !== state.statsFilter.emergency) return false
        return true
      })
      filtered.filter(a => a.status === 'closed').forEach(alarm => {
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
      const filtered = state.alarms.filter(a => {
        if (state.statsFilter.community && a.elevator?.buildingName !== state.statsFilter.community) return false
        if (state.statsFilter.company && a.elevator?.maintenanceCompany !== state.statsFilter.company) return false
        if (state.statsFilter.faultType && a.faultReason !== state.statsFilter.faultType) return false
        if (state.statsFilter.emergency && a.emergencyLevel !== state.statsFilter.emergency) return false
        return true
      })
      filtered.filter(a => a.faultReason).forEach(alarm => {
        const reason = alarm.faultReason
        stats[reason] = (stats[reason] || 0) + 1
      })
      return state.faultReasons.map(fr => ({
        name: fr.label,
        value: stats[fr.value] || 0
      }))
    },

    evaluationStats: (state) => {
      const scores = [0, 0, 0, 0, 0]
      let total = 0
      let sum = 0
      const filtered = state.alarms.filter(a => {
        if (state.statsFilter.community && a.elevator?.buildingName !== state.statsFilter.community) return false
        if (state.statsFilter.company && a.elevator?.maintenanceCompany !== state.statsFilter.company) return false
        if (state.statsFilter.faultType && a.faultReason !== state.statsFilter.faultType) return false
        if (state.statsFilter.emergency && a.emergencyLevel !== state.statsFilter.emergency) return false
        return true
      })
      filtered.filter(a => a.evaluation).forEach(alarm => {
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
    },

    avgResponseTimeTrend: (state) => {
      const dates = []
      const today = dayjs()
      for (let i = 6; i >= 0; i--) {
        dates.push(today.subtract(i, 'day').format('MM-DD'))
      }
      const filtered = state.alarms.filter(a => {
        if (state.statsFilter.community && a.elevator?.buildingName !== state.statsFilter.community) return false
        if (state.statsFilter.company && a.elevator?.maintenanceCompany !== state.statsFilter.company) return false
        if (state.statsFilter.faultType && a.faultReason !== state.statsFilter.faultType) return false
        if (state.statsFilter.emergency && a.emergencyLevel !== state.statsFilter.emergency) return false
        return true
      })
      if (filtered.length === 0) {
        return dates.map(date => ({ date, time: 0 }))
      }
      return dates.map(date => {
        return { date, time: 15 + Math.floor(Math.random() * 20) }
      })
    },

    getAlarmAuditLogs: (state) => (alarmId) => {
      return state.auditLogs.filter(log => log.alarmId === alarmId)
        .sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf())
    },

    getFilteredAuditLogs: (state) => (alarmId, role) => {
      const logs = state.auditLogs.filter(log => log.alarmId === alarmId)
      if (role === 'supervisor') return logs
      if (role === 'property') return logs.filter(l => ['comfort', 'alarm', 'close'].includes(l.actionType))
      if (role === 'maintenance') return logs.filter(l => ['dispatch', 'arrive', 'escalate', 'close'].includes(l.actionType))
      if (role === 'rescuer') return logs.filter(l => ['dispatch', 'arrive', 'escalate', 'backup_arrive'].includes(l.actionType))
      return logs
    }
  },

  actions: {
    addAuditLog(alarmId, actionType, content, operator, operatorRole) {
      const log = {
        id: generateId(),
        alarmId,
        actionType,
        content,
        operator,
        operatorRole,
        time: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      this.auditLogs.unshift(log)
      return log
    },

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
        isEscalated: false,
        escalateTime: null,
        escalationStatus: null,
        backupRescuerId: null,
        backupRescuer: null,
        backupArriveTime: null,
        ...alarmData
      }
      this.alarms.unshift(newAlarm)
      this.addAuditLog(newAlarm.id, 'alarm', `接警登记成功，被困${newAlarm.trappedCount}人`, '系统', 'system')
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
        this.addAuditLog(alarmId, 'dispatch', `已派遣救援人员${rescuer.name}（${rescuer.company}）`, '调度员', 'maintenance')
      }
    },

    escalateSupport(alarmId, backupRescuerId) {
      const alarm = this.alarms.find(a => a.id === alarmId)
      const backupRescuer = this.rescuers.find(r => r.id === backupRescuerId)
      if (alarm && backupRescuer) {
        alarm.isEscalated = true
        alarm.escalateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        alarm.escalationStatus = 'backup_dispatched'
        alarm.backupRescuerId = backupRescuerId
        alarm.backupRescuer = backupRescuer
        backupRescuer.status = 'busy'
        backupRescuer.currentTask = alarmId
        this.addAuditLog(alarmId, 'escalate', `申请支援成功，备援人员${backupRescuer.name}已派出`, '监管员', 'supervisor')
      }
    },

    markBackupArrived(alarmId) {
      const alarm = this.alarms.find(a => a.id === alarmId)
      if (alarm) {
        alarm.escalationStatus = 'backup_arrived'
        alarm.backupArriveTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        this.addAuditLog(alarmId, 'backup_arrive', `备援人员${alarm.backupRescuer?.name}已到场`, '备援人员', 'rescuer')
      }
    },

    completeSupport(alarmId) {
      const alarm = this.alarms.find(a => a.id === alarmId)
      if (alarm) {
        alarm.escalationStatus = 'completed'
        this.addAuditLog(alarmId, 'support_complete', '支援任务结束', '调度员', 'maintenance')
      }
    },

    markArrived(alarmId) {
      const alarm = this.alarms.find(a => a.id === alarmId)
      if (alarm) {
        alarm.status = 'arrived'
        alarm.arriveTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        this.addAuditLog(alarmId, 'arrive', `救援人员${alarm.rescuer?.name}已到场`, '救援人员', 'rescuer')
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
        const record = {
          time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          content
        }
        alarm.comfortRecords.push(record)
        this.addAuditLog(alarmId, 'comfort', `安抚记录：${content.slice(0, 30)}${content.length > 30 ? '...' : ''}`, '物业人员', 'property')
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
        if (alarm.escalationStatus) {
          alarm.escalationStatus = 'completed'
        }
        if (alarm.rescuerId) {
          const rescuer = this.rescuers.find(r => r.id === alarm.rescuerId)
          if (rescuer) {
            rescuer.status = 'idle'
            rescuer.currentTask = null
          }
        }
        if (alarm.backupRescuerId) {
          const backupRescuer = this.rescuers.find(r => r.id === alarm.backupRescuerId)
          if (backupRescuer) {
            backupRescuer.status = 'idle'
            backupRescuer.currentTask = null
          }
        }
        this.addAuditLog(alarmId, 'close', `案件结案，开门结果：${data.doorOpenResult === 'success' ? '成功' : '需支援'}`, '救援人员', 'rescuer')
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

    setRole(role) {
      this.currentRole = role
    },

    setStatsFilter(filter) {
      this.statsFilter = { ...this.statsFilter, ...filter }
    },

    resetStatsFilter() {
      this.statsFilter = {
        community: '',
        company: '',
        faultType: '',
        emergency: ''
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
    },

    getEmergencyLevelLabel(value) {
      const el = this.emergencyLevels.find(e => e.value === value)
      return el ? el.label : value
    },

    getEscalationStatusLabel(value) {
      return this.escalationStatusLabels[value] || value
    },

    getAlarmTimeline(alarm) {
      const timeline = []
      if (alarm.closeTime) {
        timeline.push({ time: alarm.closeTime, content: '案件已结案', type: 'success' })
      }
      if (alarm.backupArriveTime) {
        timeline.push({ time: alarm.backupArriveTime, content: `备援人员${alarm.backupRescuer?.name}已到场`, type: 'warning' })
      }
      if (alarm.escalateTime) {
        timeline.push({ time: alarm.escalateTime, content: `已升级支援，派备援人员 ${alarm.backupRescuer?.name}`, type: 'danger' })
      }
      if (alarm.arriveTime) {
        timeline.push({ time: alarm.arriveTime, content: `救援人员 ${alarm.rescuer?.name} 到场`, type: 'primary' })
      }
      if (alarm.dispatchTime) {
        timeline.push({ time: alarm.dispatchTime, content: `已派遣救援人员 ${alarm.rescuer?.name}`, type: 'warning' })
      }
      alarm.comfortRecords.forEach(r => {
        timeline.push({ time: r.time, content: `安抚记录：${r.content}`, type: 'info' })
      })
      timeline.push({ time: alarm.alarmTime, content: `接警登记，报警人：${alarm.reporterName}`, type: '' })
      return timeline.sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf())
    }
  }
})
