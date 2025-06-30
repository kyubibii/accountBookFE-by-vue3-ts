<template>
  <div class="billQuery">
    <div>
      <label style="font-weight: bold;">关键词：</label>
      <input v-model="keyword" type="text" placeholder="请输入关键词搜索"
        style="padding: 6px 12px; border-radius: 4px; border: 1px solid;background-color: rgba(255,255,255,0.2);border-color: '#00796b';color:'#00796b';" />
      <button :style="{
        border: '2px solid #ccc',
        borderRadius: '4px',
        padding: '4px 12px',
        cursor: 'pointer',
        background: 'rgba(0,0,0,0)',
        borderColor: '#00796b',
        color: '#00796b',
        fontWeight: 'bold'
      }" @click="() => {
          keyword = ''
        }">
        清空
      </button>
    </div>
    <div>
      <label style="font-weight: bold;">账户：</label>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        <button v-for="account in accounts" :key="account.id" :style="{
          border: '2px solid #ccc',
          borderRadius: '4px',
          padding: '4px 12px',
          cursor: 'pointer',
          background: selectedAccounts.includes(account.id) ? '#00796b' : 'rgba(0,0,0,0)',
          borderColor: '#00796b',
          color: selectedAccounts.includes(account.id) ? '#fff' : '#00796b',
          fontWeight: 'bold'
        }" @click="toggleAccount(account.id)">
          {{ account.name }}
          {{ getAccountBalance(account.id) / 100 }}元
        </button>
        <button :style="{
          border: '2px solid #ccc',
          borderRadius: '4px',
          padding: '4px 12px',
          cursor: 'pointer',
          background: 'rgba(0,0,0,0)',
          borderColor: '#00796b',
          color: '#00796b',
          fontWeight: 'bold'
        }" @click="() => {
          selectedAccounts = []
        }">
          清空
        </button>
      </div>
    </div>
    <div>
      <label style="font-weight: bold;">标签：</label>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        <button v-for="tag in tags" :key="tag.id" :style="{
          background: selectedTags.includes(tag.id) ? tag.color : 'rgba(0,0,0,0)',
          color: selectedTags.includes(tag.id) ? '#fff' : tag.color,
          fontWeight: 'bold',
          textShadow: selectedTags.includes(tag.id) ? 'none' : '1px 1px 3px #333',
          border: '2px solid',
          borderColor: tag.color,
          borderRadius: '4px',
          padding: '4px 12px',
          cursor: 'pointer'
        }" @click="toggleTag(tag.id)">
          {{ tag.name }}
        </button>
        <button :style="{
          border: '2px solid',
          borderRadius: '4px',
          padding: '4px 12px',
          cursor: 'pointer',
          background: 'rgba(0,0,0,0)',
          borderColor: '#00796b',
          color: '#00796b',
          fontWeight: 'bold'
        }" @click="() => {
          selectedTags = []
        }">
          清空
        </button>
      </div>
    </div>
    <div>
      <label style="font-weight: bold;">日期：</label>
      <div>
        <div>
          <label>单日：</label>
          <input v-model="selectedDate" type="date" @change="() => {
            startDate = ''
            endDate = ''
          }"
            style="margin-right: 8px;padding: 6px 0; border-radius: 4px; border: 1px solid; background-color: rgba(255,255,255,0.2); color: '#00796b';" />
          <button :style="{
            border: '2px solid',
            borderRadius: '4px',
            padding: '4px 12px',
            cursor: 'pointer',
            background: 'rgba(0,0,0,0)',
            borderColor: '#00796b',
            color: '#00796b',
            fontWeight: 'bold'
          }" @click="() => {
            selectedDate = '',
              startDate = '',
              endDate = ''
          }" title="清空单日和多日内的全部日期数据">
            清空
          </button>
        </div>
        <div>
          <label>多日：</label>
          <input v-model="startDate" type="date" @change="() => {
            selectedDate = ''
          }"
            style="padding: 6px 0; border-radius: 4px; border: 1px solid; background-color: rgba(255,255,255,0.2); color: '#00796b';" />
          <label>至</label>
          <input v-model="endDate" type="date" @change="() => {
            selectedDate = ''
          }"
            style="padding: 6px 0; border-radius: 4px; border: 1px solid; background-color: rgba(255,255,255,0.2); color: '#00796b';" />
        </div>
      </div>
    </div>
    <div>
      <label style="font-weight: bold;">收支：</label>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        <button :style="{
          background: billType === 'positive' ? '#00796b' : 'rgba(0,0,0,0)',
          color: billType === 'positive' ? '#fff' : '#00796b',
          fontWeight: 'bold',
          border: '2px solid',
          borderColor: '#00796b',
          borderRadius: '4px',
          padding: '4px 12px',
          cursor: 'pointer'
        }" @click="billType = 'positive'">
          收入
        </button>
        <button :style="{
          background: billType === 'negative' ? '#00796b' : 'rgba(0,0,0,0)',
          color: billType === 'negative' ? '#fff' : '#00796b',
          fontWeight: 'bold',
          border: '2px solid',
          borderColor: '#00796b',
          borderRadius: '4px',
          padding: '4px 12px',
          cursor: 'pointer'
        }" @click="billType = 'negative'">
          支出
        </button>
        <button :style="{
          background: 'rgba(0,0,0,0)',
          color: '#00796b',
          fontWeight: 'bold',
          border: '2px solid',
          borderColor: '#00796b',
          borderRadius: '4px',
          padding: '4px 12px',
          cursor: 'pointer'
        }" @click="billType = ''">
          清空
        </button>
      </div>
    </div>
    <div>
      <label style="font-weight: bold;">金额：</label>
      <div>
        <input v-model.number="minAmount" type="number" placeholder="最小金额" step="0.01" min="0"
          style="padding: 6px 12px; border-radius: 4px; border: 1px solid; background-color: rgba(255,255,255,0.2); color: '#00796b';" />
        <span>至</span>
        <input v-model.number="maxAmount" type="number" placeholder="最大金额" step="0.01" min="0"
          style="padding: 6px 12px; border-radius: 4px; border: 1px solid; background-color: rgba(255,255,255,0.2); color: '#00796b';" />
        <button :style="{
          border: '2px solid',
          borderRadius: '4px',
          padding: '4px 12px',
          cursor: 'pointer',
          background: 'rgba(0,0,0,0)',
          borderColor: '#00796b',
          color: '#00796b',
          fontWeight: 'bold'
        }" @click="() => {
            minAmount = 0
            maxAmount = Infinity
          }">
          清空
        </button>
      </div>
    </div>
    <div style="margin-top: 4px;margin-bottom: 4px;">
      <button :style="{
        border: '2px solid',
        borderRadius: '4px',
        padding: '4px 12px',
        cursor: 'pointer',
        background: 'rgba(0,0,0,0)',
        borderColor: '#d32f2f',
        color: '#d32f2f',
        fontWeight: 'bold',
        marginRight: '12px'
      }" @click="() => {
          keyword = ''
          selectedAccounts = []
          selectedTags = []
          selectedDate = ''
          startDate = ''
          endDate = ''
          billType = ''
          minAmount = 0
          maxAmount = Infinity
        }">
        清空所有筛选条件
      </button>
      <button :style="{
        border: '2px solid',
        borderRadius: '4px',
        padding: '4px 12px',
        cursor: 'pointer',
        background: '#00796b',
        borderColor: '#00796b',
        color: '#fff',
        fontWeight: 'bold'
      }" @click="searchRecords">
        查询
      </button>
    </div>
    <div>
      <recordDisplay
        v-for="record in [...(recordsDisplay.length > 0 ? recordsDisplay : records)]
          .sort((a, b) => {
            if (a.date !== b.date) {
              return b.date.localeCompare(a.date)
            }
            return b.id - a.id
          })"
        :key="record.id"
        :record="record"
        :accounts="accounts"
        :tags="tags"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import recordDisplay from './recordDisplay.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { authFetch } from '@/utils/authFetch'

const baseUrl = import.meta.env.VITE_API_BASE_URL
const accounts = ref<{ id: number; name: string }[]>([])
const tags = ref<{ id: number; name: string; color: string }[]>([])
const records = ref<{ id: number; account: number; tag: number; date: string; amount: number; name: string }[]>([])
const recordsDisplay = ref<{ id: number; account: number; tag: number; date: string; amount: number; name: string }[]>([])
const selectedTags = ref<number[]>([])
const selectedAccounts = ref<number[]>([])
const keyword = ref('')
const selectedDate = ref('')
const startDate = ref('')
const endDate = ref('')
const minAmount = ref(0)
const maxAmount = ref(Infinity)
let keyHandler: ((e: KeyboardEvent) => void) | null = null

// 账单类型：'positive' | 'negative' | ''
const billType = ref('')

const loadAccounts = async () => {
  try {
    const response = await authFetch(`${baseUrl}/api/accounts/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
      },
    })
    if (!response.ok) throw new Error('获取账户失败')
    const data = await response.json()
    localStorage.setItem('accounts', JSON.stringify(data))
    accounts.value = data
  } catch (e: any) {
    alert(e.message || '当前无账户，请新建账户')
  }
}
const loadTag = () => {
  authFetch(`${baseUrl}/api/tags/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
    },
  })
    .then(async (response) => {
      if (!response.ok) throw new Error('获取标签失败')
      const data = await response.json()
      localStorage.setItem('tags', JSON.stringify(data))
      tags.value = data
    })
    .catch((e: any) => {
      alert(e.message || '获取标签失败')
    })
}
const loadRecords = async () => {
  try {
    const response = await authFetch(`${baseUrl}/api/records`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
      }
    })
    if (!response.ok) throw new Error('获取记录失败')
    const data = await response.json()
    records.value = data;
    localStorage.setItem('records', JSON.stringify(data))
  } catch (e: any) {
    alert(e.message || '获取记录失败')
  }
}
const searchRecords = async () => {
  const qpGenerator = () => {
    const params: Record<string, string | string[]> = {}
    if (keyword.value) params.keyword = keyword.value
    if (selectedDate.value) params.date = selectedDate.value
    if (startDate.value) params.start_date = startDate.value
    if (endDate.value) params.end_date = endDate.value
    if (minAmount.value > 0) params.min_amount = (minAmount.value * 100).toString()
    if (maxAmount.value < Infinity) params.max_amount = (maxAmount.value * 100).toString()
    if (billType.value) params.amount_type = billType.value
    // 多个 tag/account 用多个同名参数
    if (selectedTags.value.length > 0) params.tag = selectedTags.value.map(String)
    if (selectedAccounts.value.length > 0) params.account = selectedAccounts.value.map(String)

    const usp = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => usp.append(key, v))
      } else {
        usp.append(key, value)
      }
    })
    return usp.toString()
  }
  try {
    const response = await authFetch(`${baseUrl}/api/records/search/?${qpGenerator()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
      }
    })
    if (!response.ok) throw new Error('查询记录失败')
    const data = await response.json()
    recordsDisplay.value = data
  } catch (e: any) {
    alert(e.message || '查询记录失败')
  }
  // 如果没有查询结果，显示所有记录
  if (recordsDisplay.value.length === 0) {
    recordsDisplay.value = records.value
  }
}
// 获取账户余额
const getAccountBalance = (accountId: number) => {
  return records.value
    .filter(record => record.account === accountId)
    .reduce((sum, record) => sum + record.amount, 0)
}

// 切换标签选中状态
const toggleTag = (tagId: number) => {
  const idx = selectedTags.value.indexOf(tagId)
  if (idx === -1) {
    selectedTags.value.push(tagId)
  } else {
    selectedTags.value.splice(idx, 1)
  }
}
const toggleAccount = (accountsId: number) => {
  const idx = selectedAccounts.value.indexOf(accountsId)
  if (idx === -1) {
    selectedAccounts.value.push(accountsId)
  } else {
    selectedAccounts.value.splice(idx, 1)
  }
}

onMounted(() => {
  loadAccounts()
  loadTag()
  loadRecords()

  keyHandler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'enter') {
      searchRecords()
    } else if (e.ctrlKey && e.key === 'Escape') {
      keyword.value = ''
      selectedAccounts.value = []
      selectedTags.value = []
      selectedDate.value = ''
      startDate.value = ''
      endDate.value = ''
      billType.value = ''
      minAmount.value = 0
      maxAmount.value = Infinity
    }
  }
  window.addEventListener('keydown', keyHandler)
})

onBeforeUnmount(() => {
  if (keyHandler) {
    window.removeEventListener('keydown', keyHandler)
    keyHandler = null
  }
})
</script>

<style scoped>
.billQuery {
  color: darkslategray;
  font-size: clamp(15px, 1vw, 50px);
}
</style>
