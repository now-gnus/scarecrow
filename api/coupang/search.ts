// api/coupang/search.ts (React Native 버전)
const COUPANG_BASE = 'https://api-gateway.coupang.com'; // 실제 엔드포인트 필요

export async function searchCoupang(keyword: string) {
  try {
    const res = await fetch(`${COUPANG_BASE}/search?query=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 쿠팡 API 키 필요 시 여기 추가
      },
    });
    if (!res.ok) throw new Error('API 요청 실패');
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}
