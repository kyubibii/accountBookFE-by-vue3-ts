<template>
  <div class="managemnet">
    <div>
      <h2>账户：</h2>
      <div v-for="account in accounts" :key="account.id" class="account-row">
        <span class="span-display">{{ account.name }}</span>
        <span class="span-display">{{ getAccountBalance(account.id) / 100 }}元</span>
        <button class="add-tag" @click="uA(account.id)">修改</button>
        <button class="add-tag" @click="dA(account.id)">删除</button>
      </div>
    </div>
    <div>
      <h2>标签：</h2>
      <div v-for="tag in tags" :key="tag.id" class="tag-row">
        <span class="tag-display" :style="{ color: `${tag.color}` }">{{ tag.name }}</span>
        <button class="add-tag" @click="uT(tag.id)">修改</button>
        <button class="add-tag" @click="dT(tag.id)">删除</button>
      </div>
    </div>
    <div v-if="showTagEditDialog" class="tag-dialog">
      <div class="tag-dialog-content">
        <label>标签名：<input v-model="editTagName" /></label>
        <label>标签颜色：<input type="color" v-model="editTagColor" /></label>
        <button @click="confirmEditTag">确定</button>
        <button @click="showTagEditDialog = false">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authFetch } from '@/utils/authFetch'

const baseUrl = import.meta.env.VITE_API_BASE_URL
const accounts = ref<{ id: number; name: string }[]>([])
const tags = ref<{ id: number; name: string; color: string }[]>([])
const records = ref<{ id: number; account: number; tag: number; date: string; amount: number; name: string }[]>([])

const uA = (account: number) => {
  const newName = prompt('请输入新的账户名称：')
  if (!newName) throw new Error('账户名称不能为空')
  authFetch(`${baseUrl}/api/accounts/update/${account}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
    },
    body: JSON.stringify({ name: newName }),
  }).then(async (response) => {
    if (!response.ok) throw new Error('修改账户失败')
    loadAccounts()
    alert('账户修改成功, 新的账户名称为：' + newName)
  }).catch((e: any) => {
    alert(e.message || '修改账户失败')
  })
}
const dA = (account: number) => {
  if (!confirm('确定删除该账户吗？删除账户将导致该账户下所有记录丢失')) return
  authFetch(`${baseUrl}/api/accounts/delete/${account}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
    },
  }).then(async (response) => {
    if (!response.ok) throw new Error('删除账户失败')
    loadAccounts()
    alert('账户删除成功')
  }).catch((e: any) => {
    alert(e.message || '删除账户失败')
  })
}
const dT = (tag: number) => {
  if (!confirm('确定删除该标签吗？删除标签将导致该标签下所有记录丢失')) return
  authFetch(`${baseUrl}/api/tags/delete/${tag}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
    },
  }).then(async (response) => {
    if (!response.ok) throw new Error('删除标签失败')
    await loadTag()
    alert('标签删除成功')
  }).catch((e: any) => {
    alert(e.message || '删除标签失败')
  })
}
// 弹窗相关
const showTagEditDialog = ref(false)
const editTagName = ref('')
const editTagColor = ref('#ffff00')
const editingTagId = ref<number | null>(null)

const uT = (tagId: number) => {
  const tag = tags.value.find(t => t.id === tagId)
  if (!tag) return
  editingTagId.value = tagId
  editTagName.value = tag.name
  editTagColor.value = tag.color
  showTagEditDialog.value = true
}

const confirmEditTag = () => {
  if (!editingTagId.value || !editTagName.value || !editTagColor.value) return
  authFetch(`${baseUrl}/api/tags/update/${editingTagId.value}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
    },
    body: JSON.stringify({
      name: editTagName.value,
      color: editTagColor.value,
    }),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error('修改标签失败')
      await loadTag()
      showTagEditDialog.value = false
      editingTagId.value = null
    })
    .catch((e: any) => {
      alert(e.message || '修改标签失败')
    })
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
  } catch (e: any) {
    alert(e.message || '获取记录失败')
  }
}
const getAccountBalance = (accountId: number) => {
  return records.value
    .filter(record => record.account === accountId)
    .reduce((sum, record) => sum + record.amount, 0)
}

onMounted(() => {
  loadAccounts()
  loadTag()
  loadRecords()
})
</script>

<style scoped>
.managemnet {
  color: darkslategray;
  font-size: clamp(15px, 1vw, 50px);
}

.span-display {
  display: inline-block;
  width: 20%;
  box-sizing: border-box;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1em;
}

.tag-display {
  display: inline-block;
  width: 50%;
  box-sizing: border-box;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1.2em;
  text-shadow: 0.1em 0.1em 0.2em rgba(0, 0, 0, 0.75);

}

.add-tag {
  margin-left: 1em;
  padding: 0 1em;
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

.account-row,
.tag-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em;
  border-bottom: 1px solid #ddd;
  font-weight: bold;

}

.account-row:hover,
.tag-row:hover {
  background-color: #b2ebf2;
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
