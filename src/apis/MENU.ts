const config: ApiConfig[] = [{
  name: 'queryList',
  path: '/menu/queryList',
  type: "get"
}, {
  name: 'create',
  path: '/menu/create',
  type: "post"
}, {
  name: 'delete',
  path: '/menu/delete',
  type: "post"
}];

export default config;