// RapidAPI endpoints configuration for Police-Raider
export interface RapidAPIEndpoint {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  baseUrl: string;
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  parameters: APIParameter[];
  response: any;
}

export interface APIParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

export const POLICE_RAIDER_APIS: RapidAPIEndpoint[] = [
  {
    id: 'search-business-license',
    name: 'Search Business License API',
    description: 'Search and verify business licenses and registrations',
    category: 'Business Verification',
    url: 'https://rapidapi.com/IgorMicrobilt/api/search-business-license-api/',
    baseUrl: 'https://search-business-license-api.p.rapidapi.com',
    endpoint: '/business/license/search',
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'search-business-license-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    parameters: [
      { name: 'businessName', type: 'string', required: true, description: 'Name of the business to search' },
      { name: 'state', type: 'string', required: false, description: 'State where business is registered' },
      { name: 'city', type: 'string', required: false, description: 'City where business is located' }
    ],
    response: {}
  },
  {
    id: 'id-verify',
    name: 'ID Verify API',
    description: 'Verify personal identification documents and information',
    category: 'Identity Verification',
    url: 'https://rapidapi.com/IgorMicrobilt/api/id-verify/',
    baseUrl: 'https://id-verify.p.rapidapi.com',
    endpoint: '/verify',
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'id-verify.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    parameters: [
      { name: 'firstName', type: 'string', required: true, description: 'First name of the person' },
      { name: 'lastName', type: 'string', required: true, description: 'Last name of the person' },
      { name: 'ssn', type: 'string', required: false, description: 'Social Security Number' },
      { name: 'dateOfBirth', type: 'string', required: false, description: 'Date of birth (YYYY-MM-DD)' }
    ],
    response: {}
  },
  {
    id: 'sex-offender',
    name: 'Sex Offender API',
    description: 'Search sex offender registries and databases',
    category: 'Criminal Background',
    url: 'https://rapidapi.com/IgorMicrobilt/api/sex-offender-api/',
    baseUrl: 'https://sex-offender-api.p.rapidapi.com',
    endpoint: '/search',
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'sex-offender-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    parameters: [
      { name: 'firstName', type: 'string', required: true, description: 'First name to search' },
      { name: 'lastName', type: 'string', required: true, description: 'Last name to search' },
      { name: 'state', type: 'string', required: false, description: 'State to search in' }
    ],
    response: {}
  },
  {
    id: 'criminal-history',
    name: 'Criminal History API',
    description: 'Access criminal history and background check data',
    category: 'Criminal Background',
    url: 'https://rapidapi.com/IgorMicrobilt/api/criminal-history-api/',
    baseUrl: 'https://criminal-history-api.p.rapidapi.com',
    endpoint: '/criminal/history',
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'criminal-history-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    parameters: [
      { name: 'firstName', type: 'string', required: true, description: 'First name of the person' },
      { name: 'lastName', type: 'string', required: true, description: 'Last name of the person' },
      { name: 'dateOfBirth', type: 'string', required: false, description: 'Date of birth (YYYY-MM-DD)' },
      { name: 'ssn', type: 'string', required: false, description: 'Social Security Number' }
    ],
    response: {}
  },
  {
    id: 'verify-previous-employment',
    name: 'Verify Previous Employment API',
    description: 'Verify previous employment history and records',
    category: 'Employment Verification',
    url: 'https://rapidapi.com/IgorMicrobilt/api/verify-previous-employment/',
    baseUrl: 'https://verify-previous-employment.p.rapidapi.com',
    endpoint: '/employment/verify/previous',
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'verify-previous-employment.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    parameters: [
      { name: 'firstName', type: 'string', required: true, description: 'Employee first name' },
      { name: 'lastName', type: 'string', required: true, description: 'Employee last name' },
      { name: 'employerName', type: 'string', required: true, description: 'Previous employer name' },
      { name: 'ssn', type: 'string', required: false, description: 'Social Security Number' }
    ],
    response: {}
  },
  {
    id: 'verify-employment',
    name: 'Verify Employment API',
    description: 'Verify current employment status and information',
    category: 'Employment Verification',
    url: 'https://rapidapi.com/IgorMicrobilt/api/verify-employment/',
    baseUrl: 'https://verify-employment.p.rapidapi.com',
    endpoint: '/employment/verify',
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'verify-employment.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    parameters: [
      { name: 'firstName', type: 'string', required: true, description: 'Employee first name' },
      { name: 'lastName', type: 'string', required: true, description: 'Employee last name' },
      { name: 'employerName', type: 'string', required: true, description: 'Current employer name' },
      { name: 'ssn', type: 'string', required: false, description: 'Social Security Number' }
    ],
    response: {}
  },
  {
    id: 'email-search',
    name: 'Email Search API',
    description: 'Search and verify email addresses and associated information',
    category: 'Contact Verification',
    url: 'https://rapidapi.com/IgorMicrobilt/api/email-search-api/',
    baseUrl: 'https://email-search-api.p.rapidapi.com',
    endpoint: '/email/search',
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'email-search-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    parameters: [
      { name: 'email', type: 'string', required: true, description: 'Email address to search' },
      { name: 'firstName', type: 'string', required: false, description: 'First name associated with email' },
      { name: 'lastName', type: 'string', required: false, description: 'Last name associated with email' }
    ],
    response: {}
  },
  {
    id: 'validate-dl',
    name: 'Validate Driver License API',
    description: 'Validate and verify driver license information',
    category: 'License Verification',
    url: 'https://rapidapi.com/IgorMicrobilt/api/validate-dl/',
    baseUrl: 'https://validate-dl.p.rapidapi.com',
    endpoint: '/license/validate',
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'validate-dl.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    parameters: [
      { name: 'licenseNumber', type: 'string', required: true, description: 'Driver license number' },
      { name: 'state', type: 'string', required: true, description: 'State that issued the license' },
      { name: 'firstName', type: 'string', required: false, description: 'License holder first name' },
      { name: 'lastName', type: 'string', required: false, description: 'License holder last name' }
    ],
    response: {}
  },
  {
    id: 'verify-vehicle-history',
    name: 'Verify Vehicle History API',
    description: 'Access vehicle history reports and records',
    category: 'Vehicle Verification',
    url: 'https://rapidapi.com/IgorMicrobilt/api/verify-vehicle-history-api/',
    baseUrl: 'https://verify-vehicle-history-api.p.rapidapi.com',
    endpoint: '/vehicle/history',
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'verify-vehicle-history-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    parameters: [
      { name: 'vin', type: 'string', required: true, description: 'Vehicle Identification Number' },
      { name: 'licensePlate', type: 'string', required: false, description: 'License plate number' },
      { name: 'state', type: 'string', required: false, description: 'State where vehicle is registered' }
    ],
    response: {}
  },
  {
    id: 'military-api',
    name: 'Military Verification API',
    description: 'Verify military service and records',
    category: 'Military Verification',
    url: 'https://rapidapi.com/IgorMicrobilt/api/military-api/',
    baseUrl: 'https://military-api.p.rapidapi.com',
    endpoint: '/military/verify',
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'military-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    parameters: [
      { name: 'firstName', type: 'string', required: true, description: 'Service member first name' },
      { name: 'lastName', type: 'string', required: true, description: 'Service member last name' },
      { name: 'serviceNumber', type: 'string', required: false, description: 'Military service number' },
      { name: 'branch', type: 'string', required: false, description: 'Military branch' }
    ],
    response: {}
  },
  {
    id: 'state-license-verification',
    name: 'State License Verification API',
    description: 'Verify professional licenses and certifications',
    category: 'License Verification',
    url: 'https://rapidapi.com/IgorMicrobilt/api/state-license-verification-api/',
    baseUrl: 'https://state-license-verification-api.p.rapidapi.com',
    endpoint: '/license/state/verify',
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'state-license-verification-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    parameters: [
      { name: 'licenseNumber', type: 'string', required: true, description: 'Professional license number' },
      { name: 'state', type: 'string', required: true, description: 'State that issued the license' },
      { name: 'licenseType', type: 'string', required: false, description: 'Type of professional license' },
      { name: 'firstName', type: 'string', required: false, description: 'License holder first name' },
      { name: 'lastName', type: 'string', required: false, description: 'License holder last name' }
    ],
    response: {}
  },
  {
    id: 'vehicle-lookup',
    name: 'Vehicle Lookup API',
    description: 'Look up vehicle information and specifications',
    category: 'Vehicle Verification',
    url: 'https://rapidapi.com/IgorMicrobilt/api/vehicle-lookup-api/',
    baseUrl: 'https://vehicle-lookup-api.p.rapidapi.com',
    endpoint: '/vehicle/lookup',
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'vehicle-lookup-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    parameters: [
      { name: 'vin', type: 'string', required: true, description: 'Vehicle Identification Number' },
      { name: 'year', type: 'number', required: false, description: 'Vehicle year' },
      { name: 'make', type: 'string', required: false, description: 'Vehicle make' },
      { name: 'model', type: 'string', required: false, description: 'Vehicle model' }
    ],
    response: {}
  },
  {
    id: 'deed-search',
    name: 'Deed Search API',
    description: 'Search property deeds and real estate records',
    category: 'Property Verification',
    url: 'https://rapidapi.com/IgorMicrobilt/api/deed-search-api/',
    baseUrl: 'https://deed-search-api.p.rapidapi.com',
    endpoint: '/deed/search',
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
      'X-RapidAPI-Host': 'deed-search-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    parameters: [
      { name: 'ownerName', type: 'string', required: true, description: 'Property owner name' },
      { name: 'address', type: 'string', required: false, description: 'Property address' },
      { name: 'city', type: 'string', required: false, description: 'City where property is located' },
      { name: 'state', type: 'string', required: false, description: 'State where property is located' }
    ],
    response: {}
  }
];

// Categories for organizing APIs
export const API_CATEGORIES = [
  'Identity Verification',
  'Criminal Background', 
  'Employment Verification',
  'Contact Verification',
  'License Verification',
  'Vehicle Verification',
  'Military Verification',
  'Business Verification',
  'Property Verification'
] as const;

export type APICategory = typeof API_CATEGORIES[number];