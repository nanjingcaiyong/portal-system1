import type { MenuDTO, Menu } from './MenuModal'

declare global {
  type MenuModal = MenuDTO
  type Menu = MenuInfo
}