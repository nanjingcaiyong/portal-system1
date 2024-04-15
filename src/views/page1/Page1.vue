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
    :defaultExpandedRowKeys="['1']"
    v-model:expandedRowKeys="store.expandedRowKeys"
    row-key="id"
  >
    <template #bodyCell="{ column, record, index }">

      <template v-if="['menuName', 'path' ,'description', 'address'].includes(column.dataIndex)">
        <a-input v-model:value="record[column.dataIndex]" v-if="record.isEdit"></a-input>
        <span v-else>{{ record[column.dataIndex] }}</span>
      </template>

      <template v-if="column.key === 'updateAt'">
        <span>{{ moment(record.updateAt).format('YYYY/MM/DD HH:mm:ss') }}</span>
      </template>
      <template v-if="column.key === 'operation'">
        <a-space v-if="record.isEdit">
          <a-button type="primary" @click="onSave(record)">保存</a-button>
          <a-button @click="onCancelEdit(index)">取消</a-button>
        </a-space>
        <a-space v-else>
          <a-button v-if="record.type === 0" @click="onAddSubMenuItem(record)" >新增</a-button>
          <a-button @click="onEdit(record)">编辑</a-button>
          <a-popconfirm
            v-if="store.dataSource.length"
            title="是否删除吗?"
            ok-text="是" 
            cancel-text="否"
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
import columns from './columns';
import moment from 'moment';
import { cloneDeep } from 'lodash-es'
const defaultRow = {
  menuName: '',
  description: '',
  pid: 0,
  type: 0,
  isEdit: true,
  creator: ''
}
const store = reactive<{
  dataSource: IMenu[],
  advanced: boolean,
  columns: TableColumnType[],
  deleteModalState: boolean,
  expandedRowKeys: number[],
  editMenu?: IMenu
}>({
  advanced: false,
  columns: columns,
  dataSource: [],
  deleteModalState: false,
  expandedRowKeys: [],
  editMenu: {}
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

/**
 * @description 新增系统
 */
const onAddMenuItem = () => {
  store.dataSource.unshift(JSON.parse(JSON.stringify(defaultRow)))
}

/**
 * @description 新增子菜单
 * @param pid 系统id
 */
const onAddSubMenuItem = (menu: IMenu) => {
  store.expandedRowKeys.push(menu.id);
  debugger;
  menu.children = menu.children || [];
  menu.children.unshift(cloneDeep(Object.assign({}, defaultRow, {pid: menu.id, type: 1})));
}

/**
 * @description 删除菜单项
 * @param record 菜单数据
 */
const onDeleteMenuItem = async (record: IMenu) => {
  const res = await $API.MENU.delete({id: record.id}) as any;
  if (res.success) {
    record.deleteModalState = false;
    message.success('删除成功');
    queryList()
  }
}

/**
 * @description 编辑菜单
 * @param index 行号
 */
const onEdit = (menu: IMenu) => {
  store.editMenu = cloneDeep(menu);
  if (menu) {
    menu.isEdit = true;
  }
}

/**
 * @description 取消编辑
 * @param index 行号
 */
const onCancelEdit = (index: number) => {
  store.dataSource[index] = cloneDeep(store.editMenu)
}


/**
 * @description 请求菜单数据
 */
const queryList = async () => {
  const res = await $API.MENU.queryList<IMenuModel>();
  if (res.success && res.data.length) {
    store.dataSource = res.data
  }
}

const onSave = async (menu: IMenu) => {
  // update
  if (menu.id) {

  } else { // add
    let i = -1;
    let editMenu = undefined;
    while(++i < store.dataSource.length) {
      const menu = store.dataSource[i]
      if (menu.isEdit) {
        editMenu = menu;
        delete menu.isEdit;
        break;
      }
      let j = -1;
      while(++j < menu.children?.length) {
        let subMenu = menu.children[j]
        if (subMenu.isEdit) {
          editMenu = subMenu;
          delete subMenu.isEdit;
          break;
        }
      }
    }
    const res = await $API.MENU.create<any>(editMenu);
    if (res.success) {
      message.success('新增成功')
      queryList()
    }
  }

}

queryList()
const toggleAdvanced = () => {
  store.advanced = !store.advanced
}
</script>


<style>
.ant-popover .ant-popover-title{
  min-width: 100px;
}
</style>