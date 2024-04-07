import { BaseModel } from './BaseModal';

export type MenuInfo = {
  id: number
  name: string
  path: string
  icon: string
  parentId: number
  children: MenuInfo[]
  [key: string]: any
}

export type MenuDTO = BaseModel<MenuInfo[]>