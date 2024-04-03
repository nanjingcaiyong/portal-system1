<template>
  <a-form>
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
    <a-button type="primary"><PlusOutlined/>新增</a-button>
  </div>
  <div class="mb-[16px]">
    <a-alert type="info" :showIcon="true" class="flex items-center px-[8px]" >
      <template #message>
        <span style="margin-right: 12px">
          已选择： <a class="text-[#1890ff]">2</a> 项
        </span>
        <span>服务调用次数总计： <a class="text-[#1890ff]"> 222  </a> 次</span>
      </template>
    </a-alert>
  </div>
  <a-table :dataSource="store.dataSource" :columns="store.columns" :custom-row="store.customRow">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <a-button danger>删除</a-button>
      </template>
    </template>
  </a-table>
</template>
<script lang="ts" setup>
import { reactive } from 'vue';
import {UpOutlined, DownOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
const store = reactive({
  advanced: false,
  sourceCode: '', // 源目标code
  targetCode: '', // 目标code
  customRow: (record: any, index: number) => {

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
  },
  columns: [{
    title: '序号',
    dataIndex: 'id',
    key: 'id',
    width: 150
  }, {
    title: '菜单名称',
    dataIndex: 'menuName',
    key: 'menuName',
    width: 200
  }, {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 500
  }, {
    title: '更新时间',
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 200
  }, {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 100
  }],
  dataSource: []
})

const main = async () => {
  const res = await $API.MENU.queryList<any>();
  if (res.success && res.data.length) {
    store.dataSource = res.data
  }
}

main()
const toggleAdvanced = () => {
  store.advanced = !store.advanced
}
</script>