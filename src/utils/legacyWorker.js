// Temporary migration, through 2027-04-16. Do not touch unrelated workers on this origin.
export async function retireLegacyWorker() {
  if (Date.now() >= Date.parse('2027-04-17T00:00:00Z') || !('serviceWorker' in navigator)) return
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      const script = registration.active?.scriptURL || registration.waiting?.scriptURL
      if (registration.scope === `${location.origin}/` && script && new URL(script).pathname === '/sw.js') await registration.update()
    }
  } catch { /* Offline use must not prevent the app from starting. */ }
}
