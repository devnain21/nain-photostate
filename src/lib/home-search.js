const CATEGORY_TAGS = {
  id: ['id', 'document', 'card', 'certificate', 'proof'],
  kisan: ['kisan', 'farmer', 'agriculture', 'subsidy', 'crop', 'mandi'],
  student: ['student', 'education', 'college', 'scholarship', 'career', 'job'],
  welfare: ['yojana', 'scheme', 'subsidy', 'benefit', 'help', 'pension'],
  utility: ['bill', 'status', 'tracking', 'certificate', 'service', 'online'],
  tools: ['tool', 'utility', 'download', 'maker', 'online'],
}

const URL_TAGS = {
  '/services/family-id': ['ppp', 'parivar pehchan patra', 'family id haryana'],
  '/services/mera-pariwar': ['mera pariwar', 'mera parivar', 'meraparivar', 'family id update', 'forgot family id', 'ppp status', 'parivar pehchan patra update'],
  '/services/ayushman-card': ['health card', 'hospital', 'medical', 'pmjay'],
  '/services/ration-card': ['ration', 'food', 'gehun', 'chawal'],
  '/services/pension-status': ['old age pension', 'widow pension', 'vridha pension', 'pension payment'],
  '/services/pension-list': ['pension beneficiary', 'old age pension list', 'widow pension list'],
  '/services/pm-kisan': ['farmer subsidy', 'kisan samman nidhi', '6000 scheme'],
  '/services/ujjwala-yojana': ['free gas', 'gas connection', 'lpg subsidy', 'cylinder yojana'],
  '/services/dhbvn-apply': ['new bijli connection', 'electricity connection', 'meter apply'],
  '/services/dhbvn-login': ['light bill', 'electricity bill', 'power bill', 'bijli status'],
  '/services/bijli-bill-pay': ['light bill', 'electricity payment', 'power bill', 'bijli bill'],
  '/services/har-chhatravratti': ['scholarship', 'student scholarship', 'fee help'],
  '/services/nsp-scholarship': ['scholarship', 'student scholarship', 'national scholarship'],
  '/services/hssc-cet': ['haryana jobs', 'cet', 'government job', 'sarkari naukri'],
  '/services/ssc-portal': ['central jobs', 'ssc jobs', 'sarkari naukri'],
  '/services/hkrn': ['haryana jobs', 'contract jobs', 'kaushal rojgar'],
  '/services/employment-exchange': ['rojgar registration', 'job registration', 'employment'],
  '/services/police-verification': ['character certificate', 'tenant verification'],
  '/services/janganna': ['janganna', 'jangana', 'jan ganana', 'census', 'digital census', 'self enumeration', 'se id', 'house listing', 'haryana census'],
  '/lpg': ['gas', 'lpg', 'subsidy', 'gas subsidy', 'consumer number', 'gas id', 'hp gas', 'bharat gas', 'indan gas', 'cylinder'],
  '/college-forms': ['college', 'admission form', 'student form'],
  '/resume': ['cv', 'bio data', 'job resume'],
  '/age-calculator': ['dob', 'date of birth', 'age finder'],
}

const SPELLING_TAGS = {
  '/services/aadhaar-card': ['aadhar', 'adhar', 'aadhaar', 'uidai', 'aadhar update'],
  '/services/aadhaar-pan-link': ['aadhar pan', 'aadhaar pan link'],
  '/services/ration-card': ['rashan', 'raashan', 'ration card'],
  '/services/ration-details': ['rashan status', 'ration details'],
  '/services/jamabandi': ['jamabandi', 'jama bandi', 'jamaabandi', 'nakal', 'fard'],
  '/services/sarathi-parivahan': ['parivahan', 'parivahn', 'privahan', 'sarthi', 'sarathi', 'driving licence', 'learning licence'],
  '/services/bijli-bill-pay': ['bijlee', 'bijli bill', 'light bill'],
  '/services/voter-id': ['voter', 'matdata', 'vote card'],
  '/services/pension-status': ['pention', 'penshan', 'pension'],
  '/services/pension-list': ['pention list', 'penshan list'],
  '/services/har-chhatravratti': ['scholership', 'scolarship'],
  '/services/nsp-scholarship': ['scholership', 'scolarship'],
  '/services/janganna': ['janaganana', 'jan ganana'],
}

const QUERY_FIXES = [
  [/aadhar/g, 'aadhaar'],
  [/adhar/g, 'aadhaar'],
  [/raashan/g, 'ration'],
  [/rashan/g, 'ration'],
  [/jama\s*bandi/g, 'jamabandi'],
  [/jamaabandi/g, 'jamabandi'],
  [/parivahn/g, 'parivahan'],
  [/privahan/g, 'parivahan'],
  [/sarthi/g, 'sarathi'],
  [/bijlee/g, 'bijli'],
  [/pention/g, 'pension'],
  [/penshan/g, 'pension'],
  [/scholership/g, 'scholarship'],
  [/scolarship/g, 'scholarship'],
  [/janaganana/g, 'janganna'],
  [/jan ganana/g, 'janganna'],
]

function rewriteQuery(value = '') {
  let next = normalizeSearchValue(value)
  QUERY_FIXES.forEach(([pattern, replacement]) => {
    next = next.replace(pattern, replacement)
  })
  return next
}

export function normalizeSearchValue(value = '') {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean)))
}

function expandTags(tags) {
  return uniqueValues(
    tags.flatMap((tag) => {
      const normalized = normalizeSearchValue(tag)
      if (!normalized) {
        return []
      }

      const parts = normalized.split(' ')
      return [normalized, ...parts]
    }),
  )
}

export function buildSearchableServices(services) {
  return services.map((service) => {
    const tags = uniqueValues([
      ...(service.searchTags || []),
      ...(CATEGORY_TAGS[service.category] || []),
      ...(URL_TAGS[service.url] || []),
      ...(SPELLING_TAGS[service.url] || []),
      service.title,
      service.category,
    ])

    const normalizedTitle = normalizeSearchValue(service.title)
    const normalizedTags = expandTags(tags)

    return {
      ...service,
      normalizedTitle,
      normalizedTags,
      searchBlob: uniqueValues([normalizedTitle, ...normalizedTags]).join(' '),
    }
  })
}

function rankMatch(service, query) {
  const normalizedQuery = rewriteQuery(query)

  if (!normalizedQuery) {
    return null
  }

  const queryTerms = normalizedQuery.split(' ')
  const titleTerms = service.normalizedTitle.split(' ')
  let score = 0
  let matchedTag = ''

  if (service.normalizedTitle === normalizedQuery) {
    score += 120
  } else if (service.normalizedTitle.startsWith(normalizedQuery)) {
    score += 90
  } else if (service.normalizedTitle.includes(normalizedQuery)) {
    score += 70
  }

  if (service.searchBlob.includes(normalizedQuery)) {
    score += 10
  }

  queryTerms.forEach((term) => {
    if (titleTerms.includes(term)) {
      score += 24
      return
    }

    if (service.normalizedTitle.includes(term)) {
      score += 12
    }

    const tagMatch = service.normalizedTags.find((tag) => tag.includes(term))
    if (tagMatch) {
      score += 16
      if (!matchedTag && tagMatch !== service.normalizedTitle) {
        matchedTag = tagMatch
      }
    }
  })

  if (!score) {
    return null
  }

  return {
    score,
    matchedTag,
  }
}

export function findServiceMatches(services, query) {
  return services
    .map((service) => {
      const result = rankMatch(service, query)
      if (!result) {
        return null
      }

      return {
        ...service,
        matchScore: result.score,
        matchLabel: result.matchedTag ? `Related: ${result.matchedTag}` : `Category: ${service.category}`,
      }
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (right.matchScore !== left.matchScore) {
        return right.matchScore - left.matchScore
      }

      return left.title.localeCompare(right.title)
    })
}