<template>
  <a-form class="home">
    <a-row :gutter="48" >
      <a-col :md="8" :sm="24">
        <a-form-item label="规则编号">
          <a-input></a-input>
        </a-form-item>
      </a-col>

      <a-col :md="8" :sm="24">
        <a-form-item label="使用状态">
          <a-input></a-input>
        </a-form-item>
      </a-col>

      <template v-if="store.advanced">
        <a-col :md="8" :sm="24">
        <a-form-item label="调用次数">
          <a-input></a-input>
        </a-form-item>
      </a-col>
      </template>
   
      <a-col :md="!store.advanced && 8 || 24" :sm="24">
        <a-space :size="8" class="justify-end flex">
          <a-button type="primary">查询</a-button>
          <a-button type="default">重置</a-button>
          <a @click="toggleAdvanced" class="cursor-pointer flex items-center h-full">
            {{ store.advanced ? '收起' : '展开' }}
            <UpOutlined v-if="store.advanced"></UpOutlined>
            <DownOutlined v-else></DownOutlined>
          </a>
        </a-space>
      </a-col>
    </a-row>
  </a-form>
  <div class="mb-[18px]">
    <a-button type="primary" @click="onAddMenuItem"><PlusOutlined/>新增</a-button>
  </div>
  <a-table 
    :dataSource="store.dataSource" 
    :columns="store.columns" 
    :custom-row="customRow" 
    v-model:expandedRowKeys="store.expandedRowKeys"
  >
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'description'">
        <a-input v-model:value="record.description" v-if="record.isEdit"></a-input>
        <span v-else>{{ record.description }}</span>
      </template>
      <template v-if="column.key === 'menuName'">
        <a-input v-model:value="record.menuName" v-if="record.isEdit"></a-input>
        <span v-else>{{ record.menuName }}</span>
      </template>
      <template v-if="column.key === 'path'">
        <a-input v-model:value="record.path" v-if="record.isEdit"></a-input>
        <span v-else>{{ record.path }}</span>
      </template>
      <template v-if="column.key === 'updateAt'">
        <span>{{ moment(record.updateAt).format('YYYY/MM/DD HH:mm:ss') }}</span>
      </template>
      <template v-if="column.key === 'operation'">
        <a-span v-if="record.isEdit">
          <a-button type="primary" @click="onSave">保存</a-button>
        </a-span>
        <a-space v-else>
          <a-button v-if="record.type === 0" @click="onAddSubMenuItem(record.id)" >新增</a-button>
          <a-button>编辑</a-button>

          <a-popconfirm
            v-if="store.dataSource.length"
            title="Sure to delete?"
            @confirm="onDeleteMenuItem(record)"
          >
            <a-button danger>删除</a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </template>
  </a-table>
</template>
<script lang="ts" setup>
import { reactive } from 'vue';
import {UpOutlined, DownOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import type { TableColumnType } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import columns from './columns'
import moment from 'moment'
const defaultRow = {
  menuName: '',
  description: '',
  pid: 0,
  type: 0,
  isEdit: true,
  creator: ''
}
const store = reactive<{
  dataSource: Menu[],
  advanced: boolean,
  columns: TableColumnType[],
  deleteModalState: boolean,
  expandedRowKeys: number[]
}>({
  advanced: false,
  columns: columns,
  dataSource: [],
  deleteModalState: false,
  expandedRowKeys: []
})

const customRow = (record: any, index: number) => {
  return {
    // 添加拖动处理函数
    draggable: true,
    onDragstart: (event: any) => {
      event.dataTransfer.setData('index', index);
    },
    onDragover: (event: Event) => {
      event.preventDefault();
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault();
      const firstMenu = store.dataSource.find((menu:any) => menu.id === record.pid) as any;
      const fromIndex = parseInt(event.dataTransfer?.getData?.('index') || '0');
      const toIndex = index;
      // 重新排列数据源中的行顺序
      const newData = firstMenu?.children;
      const item = newData.splice(fromIndex - 1, 1)[0];
      newData.splice(toIndex - 1, 0, item);
      firstMenu.children = newData;
    }
  }
}

const main = async () => {
  const res = await $API.MENU.queryList<MenuModal>();
  if (res.success && res.data.length) {
    store.dataSource = res.data
  }
}

/**
 * @description 新增数据
 */
const onAddMenuItem = () => {
  
  store.dataSource.unshift(JSON.parse(JSON.stringify(defaultRow)))
}

const onAddSubMenuItem = (pid: number) => {
  store.expandedRowKeys.push(pid)
  const menuItem = store.dataSource.find(menu => menu.id === pid)
  menuItem.children.unshift(JSON.parse(JSON.stringify(Object.assign(defaultRow, {pid, type: 1}))))
}

/**
 * @description 删除菜单项
 * @param record 菜单数据
 */
const onDeleteMenuItem = async (record: Menu) => {
  const res = await $API.MENU.delete({id: record.id}) as any;
  if (res.success) {
    record.deleteModalState = false;
    message.success('删除成功');
    main()
  }
}

const onSave = async () => {
  let i = -1, j = -1
  let editMenu = undefined;
  while(++i < store.dataSource.length) {
    const menu = store.dataSource[i]
    if (menu.isEdit) {
      editMenu = menu;
      delete menu.isEdit;
    }
    while(++j < menu.children?.length) {
      let subMenu = menu.children[j]
      if (subMenu.isEdit) {
        editMenu = subMenu;
        delete subMenu.isEdit;
      }
    }
    if (editMenu) break;
  }
  const res = await $API.MENU.create<any>(editMenu);
  if (res.success) {
    message.success('新增成功')
    main()
  }
}

main()
const toggleAdvanced = () => {
  store.advanced = !store.advanced
}
</script>


<style>
.ant-popover .ant-popover-title{
  min-width: 100px;
}
</style>