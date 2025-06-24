<template>
  <div class="loginView">
    <h2 class="title">这里是一个在线的自用记账本工具</h2>
    <p class="p">您可以使用用户名和密码进行登录，如果需要注册，可以点击注册按钮填写邮箱进行自助注册，或联系管理员：qbb7680@oputlook.com</p>
    <div class="login_container">
      <form>
        <div>
          <label for="username">用户名：</label>
          <input id="username" v-model="username" type="text" autocomplete="username" />
        </div>
        <div v-if="showRepeatPassword">
          <label for="email">邮箱：</label>
          <input id="email" v-model="email" type="email" autocomplete="email" />
        </div>
        <div>
          <label for="password">密码：</label>
          <input id="password" v-model="password" type="password" autocomplete="current-password" />
        </div>
        <div v-if="showRepeatPassword">
          <label for="repeatPassword">再次输入密码：</label>
          <input id="repeatPassword" v-model="repeatPassword" type="password" autocomplete="new-password" />
        </div>
      </form>
      <div style="display: flex; justify-content: center; gap: 16px; margin-top: 16px;">
        <button type="button" @click="handleLogin">登录</button>
        <button type="button" @click="handleRegister">注册</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const username = ref('');
const password = ref('');
const email = ref('');
const repeatPassword = ref('');
const showRepeatPassword = ref(false);

const handleRegister = () => {
  if (showRepeatPassword.value === false) {
    showRepeatPassword.value = true;
    return;
  } else if (password.value !== repeatPassword.value) {
    alert('两次输入的密码不一致，请重新输入！');
    return;
  } else if (username.value === '' || password.value === '' || email.value === '') {
    alert('用户名、密码和邮箱不能为空！');
    return;
  } else if (!validateEmail(email.value)) {
    alert('请输入有效的邮箱地址！');
    return;
  } else if (!validatePasswordComplexity(password.value)) {
    alert('密码必须包含大写字母、小写字母、数字和特殊字符，长度在8到20个字符之间！');
    return;
  } else {
    fetch(`${baseUrl}/api/users/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
        email: email.value
      })
    })
      .then(async response => {
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || '注册失败');
        }
        alert('注册成功，请打开邮件查看激活连接，激活后可刷新该页面登录');
        showRepeatPassword.value = false;
        repeatPassword.value = '';
      })
      .catch(error => {
        alert(`注册失败: ${error.message}`);
      });
  }
}
const handleLogin = () => {
  if (username.value === '' || password.value === '') {
    alert('用户名和密码不能为空！');
    return;
  }
  fetch(`${baseUrl}/api/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  })
    .then(async response => {
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || '登录失败');
      }
      const data = await response.json();
      localStorage.setItem('token', data.access);
      localStorage.setItem('username', username.value);
      alert('登录成功！');
      window.location.href = '/';
    })
    .catch(error => {
      alert(`登录失败: ${error.message}`);
  })
}

function validateEmail(email: string): boolean {
  // Simple email validation regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
function validatePasswordComplexity(password: string): boolean {
  const lengthValid = password.length > 7 && password.length <= 20;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return lengthValid && hasUpper && hasLower && hasNumber && hasSpecial;
}
</script>

<style scoped>
.loginView {
  color: rgb(106, 126, 126);
  width: 100vw;
  height: 100vh;
  position: relative;
  background-color: rgba(129, 224, 255, 0.279);
  font-size: clamp(20px, 2vmin, 50px);
}

.title {
  margin: 0;
  padding: 0;
  font-size: 2em;
}

.p {
  font-size: 1em;
}

.login_container {
  font-size: 1em;
}

.login_container form {
  display: flex;
  flex-direction: column;
  width: 300px;
  margin: auto;
}

.login_container form div input {
  font-size: 1em;
}

.login_container button {
  font-size: 1em;
}
</style>
