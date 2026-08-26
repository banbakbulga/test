/* =========================================================
   그림 · 소리 경로 만들기

   - 한글 파일명이라 주소로 쓰려면 encodeURI 가 필요함
   - GitHub Pages 처럼 하위 경로(/test/)에 올라가도 깨지지 않게
     빌드할 때 정해지는 BASE_URL 을 앞에 붙임

   그래서 코드에서는 '/집사2.jpg' 처럼 편하게 쓰고,
   실제 주소는 여기서 한 번에 만든다.
   ========================================================= */

export function asset(path: string) {
  return import.meta.env.BASE_URL + encodeURI(path.replace(/^\//, ''))
}
