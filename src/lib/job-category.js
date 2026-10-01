const CATEGORY_CONTENT = {
  job: {
    key: 'job',
    label: 'Latest Jobs',
    hasDeadline: true,
    descriptionFallback: 'Eligibility aur application details add karein.',
    postdateLabel: 'Notice',
    lastdateLabel: 'Last Date',
    primaryLinkLabel: 'Apply link',
    primaryLinkShortLabel: 'Apply',
    primaryActionLabel: 'Apply Now',
    primaryActionFallbackLabel: 'View Notice',
    pendingActionLabel: 'Link Soon',
    closedActionLabel: 'Apply Closed',
    primaryActionIcon: 'fa-paper-plane',
    noticeLabel: 'Notice link',
    noticeActionLabel: 'Notice',
    visibleFields: ['eligibility', 'fees', 'posts', 'postdate', 'lastdate', 'department', 'location', 'applylink', 'notification', 'note'],
  },
  college: {
    key: 'college',
    label: 'College Forms',
    hasDeadline: true,
    descriptionFallback: 'Course eligibility, fees aur admission dates add karein.',
    postdateLabel: 'Opening',
    lastdateLabel: 'Last Date',
    primaryLinkLabel: 'Admission link',
    primaryLinkShortLabel: 'Apply',
    primaryActionLabel: 'Apply Now',
    primaryActionFallbackLabel: 'View Prospectus',
    pendingActionLabel: 'Admission Soon',
    closedActionLabel: 'Admission Closed',
    primaryActionIcon: 'fa-user-graduate',
    noticeLabel: 'Prospectus / notice link',
    noticeActionLabel: 'Prospectus',
    visibleFields: ['eligibility', 'fees', 'postdate', 'lastdate', 'department', 'location', 'applylink', 'notification', 'note'],
  },
  admit: {
    key: 'admit',
    label: 'Admit Cards',
    hasDeadline: false,
    descriptionFallback: 'Download link aur exam notice add karein.',
    postdateLabel: 'Released',
    lastdateLabel: '',
    primaryLinkLabel: 'Admit card link',
    primaryLinkShortLabel: 'Download',
    primaryActionLabel: 'Download Admit Card',
    primaryActionFallbackLabel: 'View Admit Notice',
    pendingActionLabel: 'Admit Soon',
    closedActionLabel: 'Download Closed',
    primaryActionIcon: 'fa-download',
    noticeLabel: 'Exam notice link',
    noticeActionLabel: 'Exam Notice',
    visibleFields: ['postdate', 'department', 'location', 'applylink', 'notification', 'note'],
  },
  result: {
    key: 'result',
    label: 'Results',
    hasDeadline: false,
    descriptionFallback: 'Result link aur official notice add karein.',
    postdateLabel: 'Declared',
    lastdateLabel: '',
    primaryLinkLabel: 'Result link',
    primaryLinkShortLabel: 'Result',
    primaryActionLabel: 'Check Result',
    primaryActionFallbackLabel: 'View Result Notice',
    pendingActionLabel: 'Result Soon',
    closedActionLabel: 'Result Closed',
    primaryActionIcon: 'fa-square-poll-vertical',
    noticeLabel: 'Official result notice',
    noticeActionLabel: 'Result Notice',
    visibleFields: ['postdate', 'department', 'location', 'applylink', 'notification', 'note'],
  },
  other: {
    key: 'other',
    label: 'Other Updates',
    hasDeadline: false,
    descriptionFallback: 'Latest update details aur working link add karein.',
    postdateLabel: 'Updated',
    lastdateLabel: '',
    primaryLinkLabel: 'Action link',
    primaryLinkShortLabel: 'Link',
    primaryActionLabel: 'Open Update',
    primaryActionFallbackLabel: 'View Notice',
    pendingActionLabel: 'Update Soon',
    closedActionLabel: 'Closed',
    primaryActionIcon: 'fa-arrow-up-right-from-square',
    noticeLabel: 'Notice link',
    noticeActionLabel: 'Notice',
    visibleFields: ['postdate', 'department', 'location', 'applylink', 'notification', 'note'],
  },
}

export function getJobCategoryKey(value = '') {
  const normalized = String(value || '').trim().toLowerCase()

  if (!normalized) {
    return 'other'
  }
  if (normalized.includes('admit')) {
    return 'admit'
  }
  if (normalized.includes('result')) {
    return 'result'
  }
  if (normalized.includes('college')) {
    return 'college'
  }
  if (normalized.includes('job')) {
    return 'job'
  }

  return 'other'
}

export function getJobCategoryContent(value = '') {
  const key = getJobCategoryKey(value)
  return CATEGORY_CONTENT[key] || CATEGORY_CONTENT.other
}

export function hasDeadlineCategory(value) {
  const target = typeof value === 'object' && value !== null ? value.category : value
  return getJobCategoryContent(target).hasDeadline
}

export function shouldShowCategoryField(categoryValue, fieldKey) {
  const content = getJobCategoryContent(categoryValue)
  return content.visibleFields.includes(fieldKey)
}