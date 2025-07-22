export function formatTime(val: string | number | Date | undefined | null): string {
  if (!val) return ''
  const date = new Date(val)
  if (isNaN(date.getTime())) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function formatDate(val: string | number | Date | undefined | null): string {
  if (!val) return ''
  const date = new Date(val)
  if (isNaN(date.getTime())) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function formatField(val: any, dict: Array<{ value: any, label: string }>): string {
  const item = dict.find(item => item.value === val)
  return item ? item.label : val
}

export function findOneValue(arr: any[], key: any, keyName = 'key', valueName = 'value') {
  const item = arr.find(obj => obj[keyName] === key)
  return item ? item[valueName] : undefined
}
