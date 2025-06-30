<template>
  <div class="billRecords">
    <div class="tag-selector">
      <button class="load-button" @click="loadAccounts">选择账户:</button>
      <span v-if="!accounts.length" class="no-accounts">当前无账户，请新建账户</span>
      <span v-for="account in accounts" :key="account.id" class="tag-option"
        :class="{ selected: selectedAccountId === account.id }" @click="selectedAccountId = account.id">
        {{ account.name }}
      </span>
      <button class="add-tag" @click="addAccount">+</button>
    </div>
    <div class="tag-selector">
      <button class="load-button" @click="loadTag">选择标签:</button>
      <span v-if="!tags.length" class="no-accounts">当前无标签，请新建标签</span>
      <span v-for="tag in tags" :key="tag.id" class="tag-option" :style="{
        color: selectedTagId === tag.id ? '#FFFFFF' : tag.color,
        borderColor: tag.color,
        textShadow: `0 0 2px ${getTextColor(tag.color)}`,
        backgroundColor: selectedTagId === tag.id ? tag.color : ''
      }" @click="selectedTagId = tag.id" :class="{ selected: selectedTagId === tag.id }">
        {{ tag.name }}
      </span>
      <button class="add-tag" @click="showTagDialog = true">+</button>
    </div>
    <div v-if="showTagDialog" class="tag-dialog">
      <div class="tag-dialog-content">
        <label>标签名：<input v-model="newTagName" /></label>
        <label>标签颜色：<input type="color" v-model="newTagColor" /></label>
        <button @click="confirmAddTag">确定</button>
        <button @click="showTagDialog = false">取消</button>
      </div>
    </div>
    <div class="tag-selector">
      <label class="tag-label">选择日期:</label>
      <input type="date" v-model="selectedDate" @change="saveDate" style="width: 70%;" />
    </div>
    <div class="tag-selector">
      <label class="tag-label">收支金额:</label>
      <input
        type="number"
        v-model="amount"
        min="0"
        step="0.01"
        placeholder="0.00"
        style="width: 70%;"
        ref="amountInput"
      />
    </div>
    <div class="tag-selector">
      <label class="tag-label">详细信息:</label>
      <input type="text" v-model="detailInfo" placeholder="请输入详细信息" style="width: 70%;" />
    </div>
  </div>
  <div>
    <button class="add-tag" @click="outcome1" style="width: 20%; height: 2.5em;">上一天</button>
    <button class="add-tag" @click="income0" style="width: 20%; height: 2.5em;">收入</button>
    <button class="add-tag" @click="outcome0" style="width: 20%; height: 2.5em;">支出</button>
    <button class="add-tag" @click="outcome2" style="width: 20%; height: 2.5em;">下一天</button>
  </div>
  <div>
    <span class="load-button" @click="loadlastRecords">加载最近20条记录</span>
  </div>
  <div>
    <recordDisplay
      v-for="record in records"
      :key="record.id"
      :record="record"
      :accounts="accounts"
      :tags="tags"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { authFetch } from '@/utils/authFetch';
import recordDisplay from './recordDisplay.vue'; // 引入新的recordDisplay组件

const baseUrl = import.meta.env.VITE_API_BASE_URL
const accounts = ref<{ id: number; name: string }[]>([])
const selectedAccountId = ref<number | null>(null)

const tags = ref<{ id: number; name: string; color: string }[]>([])
const selectedTagId = ref<number | null>(null)
const records = ref<{ id: number; account: number; tag: number; date: string; amount: number; name: string }[]>([])
watch([tags, selectedTagId], ([newTags, newSelectedTagId]) => {
  if (newTags.length > 0 && (newSelectedTagId === null || newSelectedTagId === undefined)) {
    selectedTagId.value = newTags[0].id
  }
})
const getTextColor = (bgColor: string) => {
  // 简单判断背景色亮度，返回黑或白
  if (!bgColor) return '#000'
  const color = bgColor.replace('#', '')
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 180 ? '#222' : '#fff'
}
const loadlastRecords = async () => {
  const getLatestTen = (list: any[]) => list.slice().reverse().slice(0, 20);
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
    records.value = getLatestTen(data);
  } catch (e: any) {
    alert(e.message || '获取记录失败')
  }
}
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
    if (data.length > 0) {
      selectedAccountId.value = data[0].id
    }
  } catch (e: any) {
    alert(e.message || '当前无账户，请新建账户')
  }
}
const addAccount = () => {
  const accountName = prompt('请输入新账户名称(为保障显示效果，建议不超过4个汉字)')
  if (!accountName) return
  authFetch(`${baseUrl}/api/accounts/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
    },
    body: JSON.stringify({ name: accountName }),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error('创建账户失败')
      const newAccount = await response.json()
      await loadAccounts()
      selectedAccountId.value = newAccount.id
    })
    .catch((e: any) => {
      alert(e.message || '创建账户失败')
    })
  loadAccounts()
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
const showTagDialog = ref(false)
const newTagName = ref('')
const newTagColor = ref('#ffff00')

const confirmAddTag = () => {
  if (!newTagName.value || !newTagColor.value) return
  authFetch(`${baseUrl}/api/tags/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
    },
    body: JSON.stringify({
      name: newTagName.value,
      color: newTagColor.value,
    }),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error('创建标签失败')
      const newTag = await response.json()
      await loadTag()
      selectedTagId.value = newTag.id
      showTagDialog.value = false
      newTagName.value = ''
    })
    .catch((e: any) => {
      alert(e.message || '创建标签失败')
    })

}
const saveDate = () => {
  localStorage.setItem('selectedDate', selectedDate.value)
}
const selectedDate = ref(localStorage.getItem('selectedDate') || new Date().toISOString().split('T')[0])

const detailInfo = ref('')

const amount = ref<number | null>(null)

const amountInput = ref<HTMLInputElement | null>(null)

// 修改income0和outcome0，在最后聚焦
const income0 = () => {
  if (!selectedAccountId.value || !selectedTagId.value || selectedDate === null || amount.value === null) {
    alert('请先选择账户、标签、日期和输入金额')
    nextTick(() => amountInput.value?.focus())
    return false
  } else if (amount.value <= 0) {
    alert('金额必须大于0')
    nextTick(() => amountInput.value?.focus())
    return false
  }
  const amount1 = Math.round(amount.value * 100)
  const data = {
    account: selectedAccountId.value,
    tag: selectedTagId.value,
    amount: amount1,
    date: selectedDate.value,
    name: detailInfo.value,
  }
  authFetch(`${baseUrl}/api/records/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
    },
    body: JSON.stringify(data),
  }).then(async (response) => {
    if (!response.ok) throw new Error('创建记录失败')
    const newRecord = await response.json()
    alert(`${newRecord.name}于${newRecord.date}收入${newRecord.amount / 100}元`)
    amount.value = null
    nextTick(() => amountInput.value?.focus())
  }).catch((e: any) => {
    alert(e.message || '创建记录失败')
    nextTick(() => amountInput.value?.focus())
  })
  return true
}

const income1 = () => {
  if (!income0()) return
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() - 1)
  selectedDate.value = date.toISOString().split('T')[0]
  saveDate()
}
const income2 = () => {
  if (!income0()) return
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + 1)
  selectedDate.value = date.toISOString().split('T')[0]
  saveDate()
}
const outcome0 = () => {
  if (!selectedAccountId.value || !selectedTagId.value || selectedDate === null || amount.value === null) {
    alert('请先选择账户、标签、日期和输入金额')
    nextTick(() => amountInput.value?.focus())
    return false
  } else if (amount.value <= 0) {
    alert('金额必须大于0')
    nextTick(() => amountInput.value?.focus())
    return false
  }
  const amount1 = Math.round(-amount.value * 100)
  const data = {
    account: selectedAccountId.value,
    tag: selectedTagId.value,
    amount: amount1,
    date: selectedDate.value,
    name: detailInfo.value,
  }
  authFetch(`${baseUrl}/api/records/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
    },
    body: JSON.stringify(data),
  }).then(async (response) => {
    if (!response.ok) throw new Error('创建记录失败')
    const newRecord = await response.json()
    alert(`${newRecord.name}于${newRecord.date}支出${-newRecord.amount / 100}元`)
    amount.value = null
    nextTick(() => amountInput.value?.focus())
  }).catch((e: any) => {
    alert(e.message || '创建记录失败')
    nextTick(() => amountInput.value?.focus())
  })
  return true
}
const outcome1 = () => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() - 1)
  selectedDate.value = date.toISOString().split('T')[0]
  saveDate()
  alert(`已切换到${selectedDate.value}，请继续输入支出记录`)
  nextTick(() => amountInput.value?.focus())
}
const outcome2 = () => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + 1)
  selectedDate.value = date.toISOString().split('T')[0]
  saveDate()
  alert(`已切换到${selectedDate.value}，请继续输入支出记录`)
  nextTick(() => amountInput.value?.focus())
}

// 快捷键处理
let keyHandler: ((e: KeyboardEvent) => void) | null = null

onMounted(async () => {
  await loadAccounts()
  await loadTag()
  await loadlastRecords()

  keyHandler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'ArrowUp') {
      if (!income0()) return
    }
    if (e.ctrlKey && e.key === 'ArrowDown') {
      if (!outcome0()) return
    }
    if (e.ctrlKey && e.key === 'ArrowLeft') {
      outcome1()
    }
    if (e.ctrlKey && e.key === 'ArrowRight') {
      outcome2()
    }
  }
  window.addEventListener('keydown', keyHandler)
})

onBeforeUnmount(() => {
  if (keyHandler) {
    window.removeEventListener('keydown', keyHandler)
  }
})
</script>

<style scoped>
.billRecords {
  color: rgb(0, 0, 0);
  font-size: clamp(15px, 1vw, 50px);
}

.tag-label {
  font-weight: bold;
  margin-right: 8px;
  user-select: none;
  color: darkslategray;
}

.load-button {
  border: none;
  background: none;
  color: darkslategray;
  font-weight: bold;
  margin-right: 8px;
  user-select: none;
  font-size: inherit;
  padding: 0;
  line-height: 1.2;
  vertical-align: middle;
}

.load-button:hover {
  cursor: pointer;
  text-decoration: underline;
  background-color: rgba(0, 0, 0, 0.1);
}

.tag-selector {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 0.4em;
  flex-wrap: wrap;
}

.tag-option {
  color: #00796b;
  padding: 0 0.1em;
  border-radius: 16px;
  border: 2px solid;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  user-select: none;
  font-weight: 500;
}

.tag-option.selected {
  border-width: 3px;
  background-color: #b2ebf2;
}

.add-tag {
  margin-left: 2px;
  padding: 0 2px;
  font-size: 1em;
  border: 1px solid #00796b;
  background: #e0f7fa;
  color: #00796b;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-tag:hover {
  background: #b2ebf2;
}

.tag-dialog {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.tag-dialog-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px 32px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
