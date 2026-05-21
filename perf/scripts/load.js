import http from 'k6/http'
import { check, group, sleep } from 'k6'

// Load test — simule une charge réaliste avec utilisateurs authentifiés
export const options = {
  stages: [
    { duration: '15s', target: 20 },
    { duration: '30s', target: 20 },
    { duration: '10s', target: 50 },
    { duration: '30s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'],
    'http_req_duration{group:::Endpoints publics}': ['p(95)<500'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001'

// Crée un utilisateur unique par VU au démarrage
export function setup() {
  const users = []
  for (let i = 0; i < 50; i++) {
    const payload = JSON.stringify({
      username: `perfuser_${i}_${Date.now()}`,
      email: `perf_${i}_${Date.now()}@test.com`,
      password: 'TestPerf123!',
    })

    const res = http.post(`${BASE_URL}/api/auth/register`, payload, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.status === 201 || res.status === 200) {
      const body = res.json()
      users.push({ token: body.token })
    }
  }
  return { users }
}

export default function (data) {
  const user = data.users[__VU % data.users.length]
  const authHeaders = user
    ? { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' } }
    : { headers: { 'Content-Type': 'application/json' } }

  group('Endpoints publics', () => {
    check(http.get(`${BASE_URL}/api/stats`), {
      'stats → 200': (r) => r.status === 200,
    })

    check(http.get(`${BASE_URL}/api/categories`), {
      'categories → 200': (r) => r.status === 200,
    })

    check(http.get(`${BASE_URL}/api/resources`), {
      'resources → 200': (r) => r.status === 200,
    })

    check(http.get(`${BASE_URL}/api/resources?page=1&limit=10`), {
      'resources paginées → 200': (r) => r.status === 200,
    })
  })

  if (user) {
    group('Endpoints authentifiés', () => {
      check(http.get(`${BASE_URL}/api/auth/me`, authHeaders), {
        'profil → 200': (r) => r.status === 200,
      })

      check(http.get(`${BASE_URL}/api/progress/dashboard`, authHeaders), {
        'dashboard → 200': (r) => r.status === 200,
      })

      check(http.get(`${BASE_URL}/api/resources/mine`, authHeaders), {
        'mes ressources → 200': (r) => r.status === 200,
      })
    })
  }

  sleep(0.5 + Math.random())
}
