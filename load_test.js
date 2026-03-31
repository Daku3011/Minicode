import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],    // less than 1% errors
  },
};

const BASE_URL = 'http://localhost:8000';

export default function () {
  const problemsRes = http.get(`${BASE_URL}/problems`);
  check(problemsRes, {
    'problems fetched successfully': (r) => r.status === 200,
  });

  const leaderboardRes = http.get(`${BASE_URL}/leaderboard`);
  check(leaderboardRes, {
    'leaderboard fetched successfully': (r) => r.status === 200,
  });

  sleep(1);
}
