import http from 'k6/http'
import { check, sleep } from 'k6'

// Spike test — pic soudain de trafic pour tester la résilience
export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '5s', target: 200 },   // pic brutal
    { duration: '20s', target: 200 },
    { duration: '5s', target: 5 },     // retour au calme
    { duration: '15s', target: 5 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.20'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001'

export default function () {
  check(http.get(`${BASE_URL}/api/stats`), {
    'stats accessible': (r) => r.status < 500,
  })

  check(http.get(`${BASE_URL}/api/resources`), {
    'resources accessible': (r) => r.status < 500,
  })

  sleep(0.2)
}
