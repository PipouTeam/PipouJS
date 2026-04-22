import http from 'k6/http'
import { check, sleep } from 'k6'

// Stress test — pousse l'API jusqu'à trouver ses limites
export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '20s', target: 50 },
    { duration: '20s', target: 100 },
    { duration: '20s', target: 150 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.15'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001'

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/stats`],
    ['GET', `${BASE_URL}/api/categories`],
    ['GET', `${BASE_URL}/api/resources`],
    ['GET', `${BASE_URL}/api/resource-types`],
    ['GET', `${BASE_URL}/api/relation-types`],
  ])

  responses.forEach((res, i) => {
    check(res, {
      [`batch[${i}] → status < 500`]: (r) => r.status < 500,
    })
  })

  sleep(0.3)
}
