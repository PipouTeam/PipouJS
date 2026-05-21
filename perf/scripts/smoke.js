import http from 'k6/http'
import { check, sleep } from 'k6'

// Smoke test — vérifie que les endpoints répondent sous charge minimale
export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 5 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001'

export default function () {
  const stats = http.get(`${BASE_URL}/api/stats`)
  check(stats, {
    'GET /api/stats → 200': (r) => r.status === 200,
  })

  const categories = http.get(`${BASE_URL}/api/categories`)
  check(categories, {
    'GET /api/categories → 200': (r) => r.status === 200,
  })

  const resourceTypes = http.get(`${BASE_URL}/api/resource-types`)
  check(resourceTypes, {
    'GET /api/resource-types → 200': (r) => r.status === 200,
  })

  const resources = http.get(`${BASE_URL}/api/resources`)
  check(resources, {
    'GET /api/resources → 200': (r) => r.status === 200,
  })

  sleep(1)
}
