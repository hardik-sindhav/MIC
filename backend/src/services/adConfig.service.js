import { AdConfig } from '../models/AdConfig.js'

export const AD_NETWORK_KEYS = ['meta', 'google', 'applovin', 'unity']

const defaultNetwork = () => ({
  enabled: false,
  bannerAdUnitId: '',
  interstitialAdUnitId: '',
  rewardedAdUnitId: '',
})

function mergeDoc(doc) {
  const raw = doc?.toObject?.() ?? doc ?? {}
  const out = {}
  for (const key of AD_NETWORK_KEYS) {
    out[key] = { ...defaultNetwork(), ...(raw[key] || {}) }
  }
  return {
    ...out,
    updatedAt: raw.updatedAt ?? null,
  }
}

export async function getAdConfig() {
  const doc = await AdConfig.findOne().sort({ updatedAt: -1 }).lean()
  if (!doc) {
    const empty = {}
    for (const key of AD_NETWORK_KEYS) empty[key] = defaultNetwork()
    return { ...empty, updatedAt: null }
  }
  return mergeDoc(doc)
}

export async function replaceAdConfig(payload) {
  const update = {}
  for (const key of AD_NETWORK_KEYS) {
    const n = payload[key]
    update[key] = {
      enabled: Boolean(n?.enabled),
      bannerAdUnitId: (n?.bannerAdUnitId ?? '').toString().trim(),
      interstitialAdUnitId: (n?.interstitialAdUnitId ?? '').toString().trim(),
      rewardedAdUnitId: (n?.rewardedAdUnitId ?? '').toString().trim(),
    }
  }

  let doc = await AdConfig.findOne()
  if (!doc) {
    doc = await AdConfig.create(update)
  } else {
    for (const key of AD_NETWORK_KEYS) {
      doc[key] = update[key]
    }
    await doc.save()
  }
  return mergeDoc(doc)
}
