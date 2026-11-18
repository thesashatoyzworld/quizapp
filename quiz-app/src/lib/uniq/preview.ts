// Client-side «смотреть как человек без тарифа» for Sasha: open the cabinet with ?as=free,
// it sticks for the Mini App session (?as=off to leave). Servers honour it only for UNIQ_ADMINS
// and it only ever removes access, so a non-admin passing it gets nothing.
export function previewAs(): 'free' | null {
  try {
    const q = new URLSearchParams(window.location.search).get('as');
    if (q === 'off') sessionStorage.removeItem('kb_as');
    if (q === 'free') sessionStorage.setItem('kb_as', 'free');
    return sessionStorage.getItem('kb_as') === 'free' ? 'free' : null;
  } catch {
    return null;
  }
}
