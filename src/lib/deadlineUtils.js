export function getDeadlineUrgency(dateString) {
  if (!dateString) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadline = new Date(dateString)
  deadline.setHours(0, 0, 0, 0)

  const diffMs = deadline - today
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { label: 'Overdue', colorClass: 'text-red-600 font-semibold', badgeClass: 'bg-red-100 text-red-700', days: diffDays }
  } else if (diffDays === 0) {
    return { label: 'Due today', colorClass: 'text-red-600 font-semibold', badgeClass: 'bg-red-100 text-red-700', days: diffDays }
  } else if (diffDays <= 3) {
    return { label: `${diffDays}d left`, colorClass: 'text-red-600 font-semibold', badgeClass: 'bg-red-100 text-red-700', days: diffDays }
  } else if (diffDays <= 7) {
    return { label: `${diffDays}d left`, colorClass: 'text-yellow-600 font-semibold', badgeClass: 'bg-yellow-100 text-yellow-700', days: diffDays }
  } else {
    return { label: `${diffDays}d left`, colorClass: 'text-gray-500', badgeClass: 'bg-gray-100 text-gray-600', days: diffDays }
  }
}

export function formatDeadlineDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
