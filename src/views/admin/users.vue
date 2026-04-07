<template>
  <section class="user-page">
    <header class="page-hero">
      <div class="hero-copy">
        <div class="hero-kicker">User Management</div>
        <h2>用户管理</h2>
        <p>在这里可以查看站内用户、按条件筛选、编辑基础资料，或者删除无效账号。</p>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-label">当前页用户</div>
          <div class="stat-value">{{ tableData.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">用户总数</div>
          <div class="stat-value">{{ total }}</div>
        </div>
      </div>
    </header>

    <section class="toolbar-card">
      <el-form :model="queryForm" label-position="top" class="query-form">
        <div class="query-grid">
          <el-form-item label="用户名称">
            <el-input v-model="queryForm.userName" clearable placeholder="按名称搜索" />
          </el-form-item>

          <el-form-item label="用户账号">
            <el-input v-model="queryForm.userAccount" clearable placeholder="按账号搜索" />
          </el-form-item>

          <el-form-item label="角色">
            <el-select v-model="queryForm.userRole" clearable placeholder="全部角色">
              <el-option label="管理员" value="admin" />
              <el-option label="普通用户" value="user" />
              <el-option label="VIP 会员" value="vip" />
            </el-select>
          </el-form-item>
        </div>
      </el-form>

      <div class="toolbar-actions">
        <el-button type="primary" :loading="loading" @click="handleSearch">查询用户</el-button>
        <el-button @click="handleReset">重置条件</el-button>
        <el-button :loading="loading" @click="fetchUsers">刷新列表</el-button>
      </div>
    </section>

    <section class="table-card">
      <el-table v-loading="loading" :data="tableData" stripe class="user-table">
        <el-table-column label="用户信息" min-width="280">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="42" class="user-avatar">
                {{ (row.userName || row.userAccount || 'U').slice(0, 1).toUpperCase() }}
              </el-avatar>
              <div class="user-meta">
                <div class="user-name">{{ row.userName || '未命名用户' }}</div>
                <div class="user-account">@{{ row.userAccount || 'unknown' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="userProfile" label="个人简介" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.userProfile || '暂无简介' }}
          </template>
        </el-table-column>

        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.userRole || 'user')" effect="light" round>
              {{ getRoleLabel(row.userRole || 'user') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="200">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="200">
          <template #default="{ row }">
            {{ formatDate(row.editTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" fixed="right" width="180">
          <template #default="{ row }">
            <div class="action-group">
              <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
              <el-button
                link
                type="danger"
                :disabled="row.id === loginUserStore.loginUser.id"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="prev, pager, next, jumper, ->, total"
          :current-page="pagination.current"
          :page-size="pagination.pageSize"
          :total="total"
          @current-change="handleCurrentChange"
        />
      </div>
    </section>

    <el-dialog v-model="editDialogVisible" width="540px" class="user-dialog">
      <template #header>
        <div class="dialog-hero">
          <div class="dialog-kicker">Edit User</div>
          <h3>编辑用户信息</h3>
          <p>这里只修改展示名称和个人简介，保存后会立即刷新当前列表。</p>
        </div>
      </template>

      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-position="top">
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="editForm.userName" placeholder="请输入用户名称" />
        </el-form-item>

        <el-form-item label="个人简介" prop="userProfile">
          <el-input
            v-model="editForm.userProfile"
            type="textarea"
            :rows="5"
            resize="none"
            placeholder="请输入该用户的个人简介"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitEdit">保存修改</el-button>
        </div>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { deleteUserVoById, editUser, getUserListByPage } from '@/api/userController'
import { getRoleLabel, getRoleType } from '@/constants/userRoles'
import { useLoginUserStore } from '@/stores/loginUser'

const loginUserStore = useLoginUserStore()

const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const tableData = ref<API.LoginUserVo[]>([])
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()

const pagination = reactive({
  current: 1,
  pageSize: 10,
})

const queryForm = reactive<API.UserQueryRequest>({
  userName: '',
  userAccount: '',
  userRole: '',
})

const editForm = reactive<API.UserUpdateRequest>({
  id: undefined,
  userName: '',
  userProfile: '',
})

const editRules = {
  userName: [
    { required: true, message: '请输入用户名称', trigger: 'blur' },
    { min: 1, max: 20, message: '用户名称长度在 1 到 20 个字符', trigger: 'blur' },
  ],
  userProfile: [{ max: 200, message: '个人简介不能超过 200 个字符', trigger: 'blur' }],
}

const formatDate = (value?: string) => {
  if (!value) return '未知'
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const fetchUsers = async () => {
  loading.value = true

  try {
    const res = await getUserListByPage({
      current: pagination.current,
      pageSize: pagination.pageSize,
      userName: queryForm.userName || undefined,
      userAccount: queryForm.userAccount || undefined,
      userRole: queryForm.userRole || undefined,
      sortField: 'createTime',
      sortOrder: 'desc',
    })

    if (res.data.code === 0) {
      tableData.value = res.data.data?.records || []
      total.value = Number(res.data.data?.total || 0)
      return
    }

    ElMessage.error(res.data.msg || '获取用户列表失败')
  } catch {
    ElMessage.error('获取用户列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  pagination.current = 1
  await fetchUsers()
}

const handleReset = async () => {
  queryForm.userName = ''
  queryForm.userAccount = ''
  queryForm.userRole = ''
  pagination.current = 1
  await fetchUsers()
}

const handleCurrentChange = async (page: number) => {
  pagination.current = page
  await fetchUsers()
}

const openEditDialog = (user: API.LoginUserVo) => {
  editForm.id = user.id
  editForm.userName = user.userName || ''
  editForm.userProfile = user.userProfile || ''
  editDialogVisible.value = true
}

const submitEdit = async () => {
  if (!editFormRef.value) return

  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true

  try {
    const res = await editUser(editForm)

    if (res.data.code === 0) {
      ElMessage.success('用户信息更新成功')
      editDialogVisible.value = false
      await fetchUsers()
      return
    }

    ElMessage.error(res.data.msg || '更新失败')
  } catch {
    ElMessage.error('更新失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (user: API.LoginUserVo) => {
  if (!user.id) return

  try {
    await ElMessageBox.confirm(
      `确定要删除用户“${user.userName || user.userAccount || user.id}”吗？`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const res = await deleteUserVoById({ id: user.id })

    if (res.data.code === 0 && res.data.data) {
      ElMessage.success('用户删除成功')

      if (tableData.value.length === 1 && pagination.current > 1) {
        pagination.current -= 1
      }

      await fetchUsers()
      return
    }

    ElMessage.error(res.data.msg || '删除失败')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.page-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.85fr);
  gap: 18px;
  padding: 24px;
  border: 1px solid rgba(208, 216, 229, 0.72);
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(84, 156, 255, 0.14), transparent 24%),
    rgba(255, 255, 255, 0.82);
  box-shadow: 0 20px 44px rgba(47, 78, 126, 0.1);
}

.hero-kicker,
.dialog-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(72, 112, 255, 0.1);
  color: #4064f6;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h2 {
  margin: 16px 0 12px;
  color: #1d2b47;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.hero-copy p {
  max-width: 760px;
  color: #60708f;
  font-size: 15px;
  line-height: 1.8;
}

.hero-stats {
  display: grid;
  gap: 14px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 120px;
  padding: 18px 20px;
  border-radius: 22px;
  background: linear-gradient(180deg, #f9fbff, #eef4ff);
  border: 1px solid rgba(204, 216, 235, 0.86);
}

.stat-label {
  color: #7d8ba6;
  font-size: 13px;
}

.stat-value {
  margin-top: 10px;
  color: #233553;
  font-size: 28px;
  font-weight: 700;
}

.toolbar-card,
.table-card {
  padding: 22px;
  border: 1px solid rgba(208, 216, 229, 0.72);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 18px 36px rgba(47, 78, 126, 0.08);
}

.query-form {
  margin-bottom: 6px;
}

.query-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  background: linear-gradient(135deg, #4c74ff, #53b0ff);
  color: #fff;
  font-weight: 700;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.user-name {
  color: #223452;
  font-size: 14px;
  font-weight: 700;
}

.user-account {
  color: #7c8aa4;
  font-size: 12px;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.dialog-hero {
  margin: -22px -24px 0;
  padding: 24px 24px 18px;
  background:
    radial-gradient(circle at top left, rgba(103, 145, 243, 0.18), transparent 30%),
    linear-gradient(135deg, rgba(247, 250, 255, 0.98), rgba(239, 246, 255, 0.96));
  border-bottom: 1px solid rgba(197, 211, 231, 0.5);
}

.dialog-hero h3 {
  margin-top: 10px;
  color: #183255;
  font-size: 24px;
  font-weight: 800;
}

.dialog-hero p {
  margin-top: 8px;
  color: #6480a4;
  font-size: 14px;
  line-height: 1.75;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.user-table .el-table__cell) {
  padding-top: 14px;
  padding-bottom: 14px;
}

:deep(.user-dialog .el-dialog) {
  border-radius: 24px;
  overflow: hidden;
}

:deep(.user-dialog .el-dialog__header) {
  padding: 22px 24px 0;
  margin-right: 0;
}

:deep(.user-dialog .el-dialog__body) {
  padding: 18px 24px 12px;
}

:deep(.user-dialog .el-dialog__footer) {
  padding: 12px 24px 22px;
  border-top: 1px solid rgba(225, 233, 243, 0.72);
  background: rgba(250, 252, 255, 0.86);
}

@media (max-width: 960px) {
  .page-hero,
  .query-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .toolbar-card,
  .table-card,
  .page-hero {
    padding: 18px;
    border-radius: 22px;
  }

  .hero-copy h2 {
    font-size: 26px;
  }

  .toolbar-actions,
  .pagination-wrap {
    justify-content: stretch;
  }

  .pagination-wrap {
    overflow-x: auto;
  }
}
</style>
