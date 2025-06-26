<template>
  <div class="latestBills">
    <span>最近记录：</span>
    <button class="refresh-button" @click="loadRecords">刷新</button>
    <div>
      <div v-for="record in records">
        <span class="record-display">{{ record.date }} </span>
        <span
          class="record-display"
          :style="{ color: getTagColor(record.tag),
            textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
          }"
        >{{ record.name }}</span>
        <span class="record-display">{{ record.amount / 100 }}元</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { authFetch } from '@/utils/authFetch';
import { ref, onMounted } from 'vue';
const baseUrl = import.meta.env.VITE_API_BASE_URL
const records = ref<{ id: number; account: number; tag: number; date: string; amount: number; name: string }[]>([])
const getTagColor = (tagId: number) => {
  const tags = JSON.parse(localStorage.getItem('tags') || '[]');
  const tag = tags.find((t: any) => t.id === tagId);
  return tag ? tag.color : 'black';
}
const loadRecords = async () => {
  const getLatestTen = (list: any[]) => list.slice().reverse().slice(0, 10);
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
onMounted(() => {
  loadRecords();
});
</script>

<style scoped>
.latestBills {
  font-weight: bold;
  margin-right: 8px;
  user-select: none;
  color: darkslategray;
  font-size: clamp(15px, 1vw, 50px);
}

.latestBills span {
  font-size: 1.5em;
}
.latestBills div {
  font-size: 0.9em;
}

.refresh-button {
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

.refresh-button:hover {
  background: #b2ebf2;
}

.record-display {
  display: inline-block;
  width: 30%;
  box-sizing: border-box;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
