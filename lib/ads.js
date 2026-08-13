'use client'

// Central config for Google AdSense.
// Set the publisher client ID in your .env file:
//   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
//
// Each ad slot is created in your Google AdSense dashboard
// (AdSense → Ads → By ad unit → Create new ad unit → Display ad).
// Copy the 10-digit slot ID it gives you and paste it below.
//
// Slot IDs left blank will render a placeholder (dev only) instead of a real
// ad, so the layout still looks intentional while you set things up.

export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''

export const AD_SLOTS = {
  // Full-width banner right below the hero
  hero: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HERO || '',
  // Sidebar ad, shows below the tool list on desktop
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || '',
  // In-content ad shown between the workspace and the "About" section
  inContent: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT || '',
  // Bottom banner right above the footer
  footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER || '',
}

// Enable ads only after user grants cookie consent.
export const hasConsent = () => {
  if (typeof window === 'undefined') return false
  try { return localStorage.getItem('cf-consent') === 'accepted' } catch { return false }
}
