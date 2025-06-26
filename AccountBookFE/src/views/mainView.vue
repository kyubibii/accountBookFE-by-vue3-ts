<template>
  <div class="mainView">
    <nav class="navbar">
      <span class="tab-buttons">
        <button @click="currentTab = 'BillRecords'" :class="{ active: currentTab === 'BillRecords' }">
          账单记录
        </button>
        <button @click="currentTab = 'BillQuery'" :class="{ active: currentTab === 'BillQuery' }">
          账单查询
        </button>
        <button @click="currentTab = 'Management'" :class="{ active: currentTab === 'Management' }">
          管理
        </button>
      </span>
      <div class="username-container">
        <div class="username">
          <button class="username-button" @click="showDropdown = !showDropdown">
            {{ username }}
          </button>
          <div v-if="showDropdown"
            style="position: absolute; right: 0; top: 110%; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border-radius: 4px; min-width: 120px; z-index: 10;">
            <button @click="logout"
              style="width: 100%; padding: 0.7em 1em; border: none; background: none; text-align: left; cursor: pointer;">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </nav>
    <div class="tabs-container">
      <!-- tags 容器，组件写在其他文件 -->
      <BillQuery v-if="currentTab === 'BillQuery'" />
      <BillRecords v-if="currentTab === 'BillRecords'" />
      <Management v-if="currentTab === 'Management'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// 请确保路径正确，以下为示例路径
import BillRecords from '../components/tabs/billRecords.vue'
import BillQuery from '../components/tabs/billQuery.vue'
import Management from '../components/tabs/management.vue'

const router = useRouter()
const currentTab = ref('BillQuery')

onMounted(() => {
  const token = localStorage.getItem('refresh_token')
  if (!token) {
    router.replace('/login')
  }

})

const username = ref(localStorage.getItem('username') || '用户')
const showDropdown = ref(false)
const showTags = ref(true) // 控制 tags 容器显示，可根据需要调整

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  document.cookie.split(';').forEach(cookie => {
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
  })
  router.replace('/login')
  alert('已退出登录')
}
</script>

<style scoped>
.mainView {
  color: rgb(106, 126, 126);
  width: 100vw;
  height: 100vh;
  position: relative;
  background-color: rgba(129, 224, 255, 0.279);
  font-size: clamp(15px, 2vmin, 50px);
}

.navbar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4em;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-buttons {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 2em;
}

.tab-buttons button {
  margin-right: 0.3em;
  padding: 0.5em 1em;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1em;
  color: #00796b;
}

.tab-buttons button.active {
  font-weight: bold;
  color: #fff;
  background: #00796b;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.username-container {
  position: absolute;
  right: 2em;
  top: 50%;
  transform: translateY(-50%);
}

.username {
  position: relative;
  display: inline-block;
}

.username-button {
  padding: 0.5em 1.2em;
  border: none;
  background: #e0f7fa;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  color: #00796b;
}

.tabs-container {
  position: absolute;
  top: 4em;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1em;
  overflow-y: auto;
}
</style>
