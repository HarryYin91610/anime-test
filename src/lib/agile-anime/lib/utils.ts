/* ___ @HarryYin __ */
import { unitList } from '../setting'

/* 获取属性值单位，格式：1px */
export const getUnit = (val: number | string): string => {
  if (typeof val === 'number') { return '' }
  const unit = val.replace(/-?\d+\.?\d*(\D*)/, '$1')
  if (unitList.indexOf(unit) > -1) {
    return unit
  } else {
    console.log('不支持该数值单位：', unit)
  }
  return ''
}

/* 自动补充单位 */
export const getDefaultUnit = (key: string): string => {
  switch (key) {
    case 'translateX':
    case 'translateY':
    case 'translateZ':
      return 'px'
    case 'rotate':
    case 'rotateX':
    case 'rotateY':
    case 'rotateZ':
      return 'deg'
    default:
      return ''
  }
}

/* 获取属性值数字，格式：1px */
export const getPureNumber = (val: number | string): number => {
  if (typeof val === 'number') { return val }
  return Number(val.replace(/(-?\d+\.?\d*)\D*/, '$1'))
}

/* 获取样式key，格式：translateX(1px) => translateX */
export const getKeyFromStyle = (style: string): string => {
  return style.replace(/(\D+)\(-?\d+\.?\d*\D*\)/, '$1')
}

/* 获取样式value，格式：translateX(1px) => 1px */
export const getValueFromStyle = (style: string): string => {
  return style.replace(/\D+\((-?\d+\.?\d*\D*)\)/, '$1')
}

/* 获取key值映射的属性列表：scale会拆分为scaleX和scaleY，避免效果叠加 */
export const getKeyList = (key: string): string[] => {
  const list: string[] = []
  switch (key) {
    case 'scale':
      list.push('scaleX')
      list.push('scaleY')
      break
    default:
      list.push(key)
      break
  }
  return list
}

