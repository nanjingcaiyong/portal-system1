import type { TableColumnType } from 'ant-design-vue';
const columns: TableColumnType[] = [{
  title: '序号',
  dataIndex: 'id',
  key: 'id',
  width: 100
}, {
  title: '菜单名称',
  dataIndex: 'menuName',
  key: 'menuName',
  width: 100
}, {
  title: '地址',
  dataIndex: 'path',
  key: 'path',
  width: 200
}, {
  title: '描述',
  dataIndex: 'description',
  key: 'description',
  width: 300
}, {
  title: '更新时间',
  dataIndex: 'updateAt',
  key: 'updateAt',
  width: 200
}, {
  title: '操作',
  key: 'operation',
  fixed: 'right',
  width: 100
}];

export default columns;