<template>
  <div class="rDisplay" @mouseenter="hover = true" @mouseleave="hover = false" @click="showEditDialog = true"
    :class="{ hovered: hover }">
    <span class="r-date">{{ record.date }}</span>
    <span class="r-amount" :class="{ income: record.amount > 0, outcome: record.amount < 0 }">
      {{ (record.amount / 100).toFixed(2) }}
    </span>
    <span
      class="r-name"
      :style="{ color: tags.find(t => t.id === record.tag)?.color || '#888' }"
    >
      {{ record.name }}
    </span>
    <span class="r-account">
      {{ accounts.find(a => a.id === record.account)?.name || '未知账户' }}
    </span>
  </div>

  <div v-if="showEditDialog" class="edit-dialog">
    <div class="edit-dialog-content">
      <label>日期：<input type="date" v-model="editDate" /></label>
      <label>金额：<input type="number" step="0.01" v-model.number="editAmount" /></label>
      <label>名称：<input type="text" v-model="editName" /></label>
      <label>账户：
        <select v-model.number="editAccount">
          <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
      </label>
      <label>标签：
        <select v-model.number="editTag">
          <option v-for="t in tags" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
      </label>
      <div style="margin-top:1em; display: flex; gap: 1em;">
        <button @click="confirmEdit">确定</button>
        <button @click="showEditDialog = false">取消</button>
        <button @click="deleteRecord" style="color: #fff; background: #d32f2f;">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { authFetch } from '@/utils/authFetch';
import { ref, watch } from 'vue'
const baseUrl = import.meta.env.VITE_API_BASE_URL

const hover = ref(false)
const showEditDialog = ref(false)

const props = defineProps<{
  record: any,
  accounts: any[],
  tags: any[]
}>()

const editDate = ref(props.record.date)
const editAmount = ref(props.record.amount / 100)
const editName = ref(props.record.name)
const editAccount = ref(props.record.account)
const editTag = ref(props.record.tag)

watch(showEditDialog, (val) => {
  if (val) {
    editDate.value = props.record.date
    editAmount.value = props.record.amount / 100
    editName.value = props.record.name
    editAccount.value = props.record.account
    editTag.value = props.record.tag
  }
})

const confirmEdit = async () => {
  // 这里假设有一个 updateRecord 的 API
  try {
    // 你可以根据实际情况替换为 authFetch 或 emit 事件
    await authFetch(`${baseUrl}/api/records/update/${props.record.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
      },
      body: JSON.stringify({
        date: editDate.value,
        amount: Math.round(editAmount.value * 100),
        name: editName.value,
        account: editAccount.value,
        tag: editTag.value,
      }),
    })
    alert('修改成功')
    showEditDialog.value = false
    // 可选：emit事件通知父组件刷新
  } catch (e) {
    alert('修改失败')
  }
}

const deleteRecord = async () => {
  if (!confirm('确定要删除这条记录吗？')) return
  try {
    await authFetch(`${baseUrl}/api/records/delete/${props.record.id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
      }
    })
    alert('删除成功')
    showEditDialog.value = false
    // 可选：emit事件通知父组件刷新
  } catch (e) {
    alert('删除失败')
  }
}
</script>

<style scoped>
.rDisplay {
  display: flex;
  gap: 1.5em;
  align-items: center;
  padding: 0.3em 0;
  border-bottom: 1px solid #b8d0b9;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s;
}

.rDisplay.hovered,
.rDisplay:hover {
  background: #e0f7fa;
}

.r-date {
  min-width: 6em;
  color: #666;
}

.r-amount {
  min-width: 5em;
  font-weight: bold;
}

.r-amount.income {
  color: #388e3c;
}

.r-amount.outcome {
  color: #d32f2f;
}

.r-name {
  min-width: 6em;
  font-weight: bold;
}

.r-account {
  min-width: 5em;
  color: #1976d2;
}

.edit-dialog {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.edit-dialog-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px 32px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 1em;
}
</style>
