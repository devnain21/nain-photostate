const CATEGORY_DOCUMENTS = {
  id: [
    'Aadhaar card',
    'Aadhaar se linked mobile number',
    'Passport size photo',
    'Purana card ya acknowledgement, agar update hai',
  ],
  kisan: [
    'Aadhaar card',
    'Family ID',
    'Jamabandi / khasra ya land papers',
    'Bank passbook',
  ],
  student: [
    'Aadhaar card',
    'Family ID',
    '10th ya 12th marksheet',
    'Passport size photo',
    'Bank passbook',
  ],
  welfare: [
    'Aadhaar card',
    'Family ID',
    'Bank passbook',
    'Income ya caste certificate, agar form maange',
  ],
  utility: [
    'Aadhaar card',
    'Registered mobile number',
    'Purana bill, consumer number ya reference number',
  ],
  tools: [
    'Jo document banana ya edit karna hai, uski clear photo ya PDF',
  ],
}

const SERVICE_DOCUMENTS = {
  'family-id': [
    'Sabhi family members ka Aadhaar',
    'Family head ka Aadhaar-linked mobile',
    'Passport size photo',
    'Purani Family ID, agar update hai',
  ],
  'mera-pariwar': [
    'Family ID',
    'Family head ka Aadhaar',
    'Registered mobile jis par OTP aata hai',
  ],
  'ayushman-card': [
    'Aadhaar card',
    'Family ID ya ration card',
    'Mobile number',
    'Passport size photo',
  ],
  'aadhaar-card': [
    'Purana Aadhaar ya enrolment slip',
    'Mobile number jo link karna hai',
    'Passport size photo, agar update hai',
  ],
  'ration-card': [
    'Family ID',
    'Sabhi members ka Aadhaar',
    'Purana ration card, agar hai',
    'Bank passbook',
  ],
  'jamabandi': [
    'Owner ka naam',
    'Khasra / khewat number, agar pata ho',
    'Aadhaar card',
  ],
  'farmer-id': [
    'Aadhaar card',
    'Family ID',
    'Land papers ya jamabandi',
    'Bank passbook',
  ],
  'sarathi-parivahan': [
    'Aadhaar card',
    'Learning licence ya purani driving licence',
    'Passport size photo',
    'Mobile number',
  ],
  'pan-card': [
    'Aadhaar card',
    'Mobile number aur email',
    'Passport size photo',
    'Signature ki scan ya photo',
  ],
  'voter-id': [
    'Aadhaar card',
    'Passport size photo',
    'Address proof',
    'Mobile number',
  ],
  'passport': [
    'Aadhaar card',
    'Passport size photo',
    'Address proof',
    'Birth proof ya 10th certificate',
  ],
  'pension-status': [
    'Aadhaar card',
    'Family ID',
    'Pension ID ya bank passbook',
  ],
  'pm-kisan': [
    'Aadhaar card',
    'Family ID',
    'Land papers',
    'Bank passbook jo Aadhaar se linked ho',
  ],
  'hssc-cet': [
    'Aadhaar card',
    'Photo aur signature',
    '10th / 12th certificate',
    'Category certificate, agar lagta ho',
  ],
  'college-admission': [
    '10th aur 12th marksheet',
    'Aadhaar card',
    'Family ID',
    'Passport size photo',
    'Category ya income certificate, agar maanga jaye',
  ],
}

export function getServiceDocuments(service) {
  if (!service) return CATEGORY_DOCUMENTS.id
  return SERVICE_DOCUMENTS[service.slug] || CATEGORY_DOCUMENTS[service.category] || CATEGORY_DOCUMENTS.id
}
