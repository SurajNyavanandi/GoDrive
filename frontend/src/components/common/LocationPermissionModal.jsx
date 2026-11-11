import { useState } from 'react';
import { MapPin, Navigation, AlertTriangle, ShieldCheck, X, Settings } from 'lucide-react';

export default function LocationPermissionModal({
  isOpen,
  onClose,
  onAllow,
  onManualSelect,
  permissionState = 'prompt', // 'prompt' | 'requesting' | 'denied'
  errorMessage = '',
  onRetry,
}) {
  const [activeTab, setActiveTab] = useState('android'); // 'android' | 'ios' | 'desktop'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-3xl border border-neutral-200 text-neutral-950 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-2xl ${permissionState === 'denied' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-800'}`}>
              {permissionState === 'denied' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Navigation className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 id="location-modal-title" className="text-base font-bold text-neutral-950 font-sans">
                {permissionState === 'denied' ? 'Location Permission Needed' : 'Enable Location Access'}
              </h2>
              <p className="text-[11px] text-neutral-500">
                {permissionState === 'denied' ? 'Permission is currently blocked' : 'Accurate Doorstep Pickup'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {permissionState !== 'denied' ? (
            /* STATE 1: INITIAL PERMISSION PROMPT */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Why Mana Drivers needs your location</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  We detect your current GPS coordinates to automatically fill your doorstep pickup address in Hyderabad and assign the closest verified driver.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-neutral-600">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-800 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span>Tap <strong>Allow Location Access</strong> below.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-800 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span>When your browser prompts <em>"Allow this site to access your location?"</em>, select <strong>Allow</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-800 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span>If you prefer privacy, you can choose <strong>Enter Address Manually</strong> at any time.</span>
                </div>
              </div>

              {permissionState === 'requesting' && (
                <div className="p-3 bg-neutral-100 rounded-xl text-center text-xs font-semibold text-neutral-700 flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                  <span>Requesting GPS permission from device...</span>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={onAllow}
                  disabled={permissionState === 'requesting'}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Allow Location Access</span>
                </button>

                <button
                  type="button"
                  onClick={onManualSelect}
                  className="w-full py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs rounded-2xl border border-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-neutral-500" />
                  <span>Enter Address Manually</span>
                </button>
              </div>
            </div>
          ) : (
            /* STATE 2: PERMISSION DENIED / BLOCKED - SHOW SETTINGS INSTRUCTIONS */
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1 text-amber-950">
                <p className="text-xs font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{errorMessage || 'Location permission was denied in your browser.'}</span>
                </p>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  You can still easily book a driver by selecting your area manually, or enable location in device settings below.
                </p>
              </div>

              {/* Instructions Tab by Platform */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
                  <span className="flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5 text-neutral-500" />
                    How to enable in settings:
                  </span>
                </div>

                <div className="flex rounded-xl bg-neutral-100 p-1 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('android')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'android' ? 'bg-white text-neutral-950 shadow-2xs' : 'text-neutral-500'
                    }`}
                  >
                    Android / Chrome
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ios')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'ios' ? 'bg-white text-neutral-950 shadow-2xs' : 'text-neutral-500'
                    }`}
                  >
                    iPhone / Safari
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('desktop')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'desktop' ? 'bg-white text-neutral-950 shadow-2xs' : 'text-neutral-500'
                    }`}
                  >
                    Desktop
                  </button>
                </div>

                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs text-neutral-700 space-y-2">
                  {activeTab === 'android' && (
                    <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed">
                      <li>Tap the <strong>🔒 Lock icon</strong> (or Tune icon) on the left of the address bar.</li>
                      <li>Tap <strong>Permissions</strong> → <strong>Location</strong>.</li>
                      <li>Switch toggle to <strong>Allow</strong>.</li>
                      <li>Alternatively: Open <em>Phone Settings → Apps → Chrome → Permissions → Location → Allow</em>.</li>
                    </ol>
                  )}
                  {activeTab === 'ios' && (
                    <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed">
                      <li>Tap the <strong>aA or 🔒 icon</strong> on the left side of the Safari address bar.</li>
                      <li>Select <strong>Website Settings</strong>.</li>
                      <li>Under <strong>Location</strong>, choose <strong>Allow</strong>.</li>
                      <li>Alternatively: Open <em>iPhone Settings → Privacy &amp; Security → Location Services → Safari Websites → While Using the App</em>.</li>
                    </ol>
                  )}
                  {activeTab === 'desktop' && (
                    <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed">
                      <li>Click the <strong>🔒 View site information icon</strong> to the left of the address bar.</li>
                      <li>Find <strong>Location</strong> and change from <em>Block</em> to <strong>Allow</strong>.</li>
                      <li>Refresh the page to apply changes.</li>
                    </ol>
                  )}
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={onManualSelect}
                  className="w-full py-3.5 px-4 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Select Hyderabad Area Manually (Recommended)</span>
                </button>

                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs rounded-2xl border border-neutral-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Try Location Again</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
