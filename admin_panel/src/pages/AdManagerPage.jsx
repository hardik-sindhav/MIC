import { useCallback, useEffect, useId, useState } from 'react'
import { toast } from 'sonner'
import { fetchAdConfig, saveAdConfig } from '../api/ads.js'
import { SectionHeader } from '../components/layout/SectionHeader.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Loader } from '../components/ui/Loader.jsx'
import { useAuth } from '../hooks/useAuth.js'

const NETWORK_KEYS = ['meta', 'google', 'applovin', 'unity']

const PLATFORM_META = {
  meta: { title: 'Meta Ads', subtitle: 'Meta Audience Network — use your placement / ad unit IDs from Meta.' },
  google: { title: 'Google Ads', subtitle: 'Google AdMob — banner, interstitial, and rewarded ad unit IDs.' },
  applovin: { title: 'AppLovin', subtitle: 'AppLovin MAX — banner, interstitial, and rewarded placements.' },
  unity: { title: 'Unity Ads', subtitle: 'Unity Ads — Game IDs / placement IDs as configured in the Unity dashboard.' },
}

function emptyNetwork() {
  return {
    enabled: false,
    bannerAdUnitId: '',
    interstitialAdUnitId: '',
    rewardedAdUnitId: '',
  }
}

function normalizeConfig(raw) {
  const out = {}
  for (const key of NETWORK_KEYS) {
    out[key] = { ...emptyNetwork(), ...(raw?.[key] || {}) }
  }
  return out
}

function formatUpdatedAt(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function AdManagerPage() {
  const { accessToken } = useAuth()
  const formPrefix = useId()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [config, setConfig] = useState(() => normalizeConfig(null))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdConfig()
      setConfig(normalizeConfig(data))
      setUpdatedAt(data?.updatedAt ?? null)
    } catch (e) {
      toast.error(e.message || 'Could not load ad configuration.')
      setConfig(normalizeConfig(null))
      setUpdatedAt(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function setNetworkField(netKey, field, value) {
    setConfig((prev) => ({
      ...prev,
      [netKey]: { ...prev[netKey], [field]: value },
    }))
  }

  function toggleNetwork(netKey) {
    setConfig((prev) => ({
      ...prev,
      [netKey]: { ...prev[netKey], enabled: !prev[netKey].enabled },
    }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!accessToken) {
      toast.error('Sign in again to save.')
      return
    }
    setSaving(true)
    try {
      const data = await saveAdConfig(accessToken, config)
      setConfig(normalizeConfig(data))
      setUpdatedAt(data?.updatedAt ?? null)
      toast.success('Ad configuration saved.')
    } catch (err) {
      toast.error(err.message || 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  const updatedLabel = formatUpdatedAt(updatedAt)

  return (
    <>
      <SectionHeader
        title="Ad Manager"
        description="Turn each network on or off and paste ad unit IDs for banner, interstitial, and rewarded ads."
      />

      {loading ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-6 py-16 dark:bg-surface-elevated">
          <Loader size="lg" label="Loading ad settings…" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {updatedLabel ? (
            <p className="text-small text-foreground-muted">
              Last saved: <span className="font-medium text-foreground">{updatedLabel}</span>
            </p>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            {NETWORK_KEYS.map((key) => {
              const meta = PLATFORM_META[key]
              const n = config[key]
              const switchId = `${formPrefix}-${key}-enabled`
              return (
                <section
                  key={key}
                  className="rounded-2xl border border-border bg-surface p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] dark:border-border-strong dark:bg-surface-elevated dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.35)] dark:ring-white/[0.06]"
                >
                  <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-semibold text-foreground">{meta.title}</h2>
                      <p className="mt-1 text-small text-foreground-muted">{meta.subtitle}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border bg-surface-muted/50 px-3 py-2 dark:bg-surface-muted/25">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
                        Show ads
                      </span>
                      <button
                        type="button"
                        id={switchId}
                        role="switch"
                        aria-checked={n.enabled}
                        onClick={() => toggleNetwork(key)}
                        className={`inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 px-1 py-0 leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                          n.enabled
                            ? 'border-accent/50 bg-accent shadow-md'
                            : 'border-foreground/30 bg-surface-muted shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] dark:border-white/35 dark:bg-surface-muted/90 dark:shadow-[inset_0_1px_4px_rgba(0,0,0,0.45)]'
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`pointer-events-none block h-6 w-6 shrink-0 rounded-full border border-foreground/25 bg-surface shadow transition-transform duration-200 ease-out dark:border-white/30 dark:bg-surface-elevated ${
                            n.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <Input
                      id={`${formPrefix}-${key}-banner`}
                      label="Banner ad unit ID"
                      value={n.bannerAdUnitId}
                      onChange={(e) => setNetworkField(key, 'bannerAdUnitId', e.target.value)}
                      placeholder="e.g. ca-app-pub-… / placement ID"
                      autoComplete="off"
                    />
                    <Input
                      id={`${formPrefix}-${key}-interstitial`}
                      label="Interstitial ad unit ID"
                      value={n.interstitialAdUnitId}
                      onChange={(e) => setNetworkField(key, 'interstitialAdUnitId', e.target.value)}
                      placeholder="Interstitial placement"
                      autoComplete="off"
                    />
                    <Input
                      id={`${formPrefix}-${key}-rewarded`}
                      label="Rewarded ad unit ID"
                      value={n.rewardedAdUnitId}
                      onChange={(e) => setNetworkField(key, 'rewardedAdUnitId', e.target.value)}
                      placeholder="Rewarded placement"
                      autoComplete="off"
                    />
                  </div>
                </section>
              )
            })}
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="w-full sm:w-auto" loading={saving} disabled={saving || !accessToken}>
              Save configuration
            </Button>
          </div>
        </form>
      )}
    </>
  )
}
