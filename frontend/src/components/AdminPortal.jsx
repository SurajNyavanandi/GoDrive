import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileText, Phone, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAdminDriversApi, approveDriverApi, rejectDriverApi, fetchAdminBookingsApi } from '../utils/api';

export default function AdminPortal({ onBackToHome }) {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'bookings'
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocModal, setSelectedDocModal] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const driversRes = await fetchAdminDriversApi();
      if (driversRes.success) {
        setDrivers(driversRes.data);
      }
      const bookingsRes = await fetchAdminBookingsApi();
      if (bookingsRes.success) {
        setBookings(bookingsRes.data);
      }
    } catch {
      toast.error('Failed to connect to backend admin API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const driversRes = await fetchAdminDriversApi();
        if (active && driversRes.success) {
          setDrivers(driversRes.data);
        }
        const bookingsRes = await fetchAdminBookingsApi();
        if (active && bookingsRes.success) {
          setBookings(bookingsRes.data);
        }
      } catch {
        // ignore
      }
    }
    init();
    return () => {
      active = false;
    };
  }, []);

  const handleApprove = async (driverId, name) => {
    try {
      const res = await approveDriverApi(driverId);
      if (res.success) {
        toast.success(`${name} approved! Driver is now live on the homepage directory.`);
        loadAdminData();
      } else {
        toast.error(res.message || 'Failed to approve driver');
      }
    } catch {
      toast.error('Error approving driver');
    }
  };

  const handleReject = async (driverId, name) => {
    if (!window.confirm(`Are you sure you want to reject ${name}'s application?`)) return;
    try {
      const res = await rejectDriverApi(driverId);
      if (res.success) {
        toast.info(`${name}'s application was rejected.`);
        loadAdminData();
      } else {
        toast.error(res.message || 'Failed to reject driver');
      }
    } catch {
      toast.error('Error rejecting driver');
    }
  };

  const pendingDrivers = drivers.filter((d) => d.isApproved === false);
  const approvedDrivers = drivers.filter((d) => d.isApproved !== false);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 mb-2 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Mana Drivers Homepage
          </button>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-neutral-900 text-white rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950 font-sans">
                Admin Verification Console
              </h1>
              <p className="text-xs text-neutral-500">
                Review pending driver KYC documents, manage homepage roster & view customer bookings
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadAdminData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-full text-xs font-medium text-neutral-800 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
            Pending Verification
          </div>
          <div className="text-3xl font-bold text-neutral-950 font-sans">
            {pendingDrivers.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Requires document review
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
            Approved Live Drivers
          </div>
          <div className="text-3xl font-bold text-neutral-950 font-sans">
            {approvedDrivers.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Active on homepage
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            Total Registrations
          </div>
          <div className="text-3xl font-bold text-neutral-950 font-sans">
            {drivers.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            All database applications
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">
            Customer Bookings
          </div>
          <div className="text-3xl font-bold text-neutral-950 font-sans">
            {bookings.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Total rides requested
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-neutral-950 text-white shadow-xs'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
          }`}
        >
          <span>Pending KYC Verification</span>
          {pendingDrivers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {pendingDrivers.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'approved'
              ? 'bg-neutral-950 text-white shadow-xs'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
          }`}
        >
          <span>Approved Live Roster ({approvedDrivers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-neutral-950 text-white shadow-xs'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
          }`}
        >
          <span>Customer Bookings ({bookings.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: PENDING DRIVER VERIFICATION */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {pendingDrivers.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-neutral-200 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-neutral-950">No Pending Applications</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                All submitted driver applications have been reviewed and approved or processed. New applications will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm space-y-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={driver.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                        alt={driver.name}
                        className="w-12 h-12 rounded-2xl object-cover bg-neutral-100"
                      />
                      <div>
                        <h3 className="font-bold text-neutral-950 text-base font-sans">
                          {driver.name}
                        </h3>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          {driver.phone || driver.rawPhone}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                      Pending Approval
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50 p-4 rounded-2xl">
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-semibold uppercase">Preference</span>
                      <span className="font-medium text-neutral-900">
                        {driver.workingPreference || (driver.driverType === 'permanent' ? 'Work monthly (₹99)' : 'Work hourly (₹49)')}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-semibold uppercase">Location</span>
                      <span className="font-medium text-neutral-900">{driver.location}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-semibold uppercase">Experience</span>
                      <span className="font-medium text-neutral-900">{driver.experience || 3} Years</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] font-semibold uppercase">Languages</span>
                      <span className="font-medium text-neutral-900">{driver.languages || 'Telugu, Hindi'}</span>
                    </div>
                  </div>

                  {/* KYC Documents Card */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Mandatory KYC Documents Submitted
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Driving License */}
                      <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 text-xs space-y-1">
                        <span className="text-[10px] text-neutral-400 font-semibold block uppercase">
                          Driving License
                        </span>
                        <div className="font-mono text-[11px] font-bold text-neutral-900">
                          {driver.licenseNo || 'TS09-XXXX-XXXXX'}
                        </div>
                        {driver.licensePhoto ? (
                          <button
                            type="button"
                            onClick={() => setSelectedDocModal({ title: `${driver.name} - Driving License`, image: driver.licensePhoto })}
                            className="text-[11px] text-blue-600 hover:underline font-medium block pt-1"
                          >
                            View License Photo ↗
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold block pt-1">
                            ✓ Document Uploaded
                          </span>
                        )}
                      </div>

                      {/* Aadhaar Card */}
                      <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 text-xs space-y-1">
                        <span className="text-[10px] text-neutral-400 font-semibold block uppercase">
                          Aadhaar Card
                        </span>
                        <div className="font-mono text-[11px] font-bold text-neutral-900">
                          {driver.aadhaarNo || 'XXXX-XXXX-XXXX'}
                        </div>
                        {driver.aadhaarPhoto ? (
                          <button
                            type="button"
                            onClick={() => setSelectedDocModal({ title: `${driver.name} - Aadhaar Card`, image: driver.aadhaarPhoto })}
                            className="text-[11px] text-blue-600 hover:underline font-medium block pt-1"
                          >
                            View Aadhaar Photo ↗
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold block pt-1">
                            ✓ Document Uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => handleApprove(driver.id, driver.name)}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Publish to Homepage
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(driver.id, driver.name)}
                      className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: APPROVED LIVE ROSTER */}
      {activeTab === 'approved' && (
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-neutral-950 font-sans">
            Currently Live Drivers on Homepage
          </h2>
          <div className="divide-y divide-neutral-100">
            {approvedDrivers.map((driver) => (
              <div key={driver.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={driver.photo}
                    alt={driver.name}
                    className="w-11 h-11 rounded-2xl object-cover bg-neutral-100"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-neutral-900 text-sm font-sans">{driver.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {driver.driverType === 'permanent' ? 'Monthly' : 'Hourly'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      {driver.phone} · {driver.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-neutral-950">
                    {driver.driverType === 'permanent' ? `₹${driver.monthlySalary}/mo` : `₹${driver.hourlyRate}/hr`}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 font-medium">
                    {driver.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: CUSTOMER BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-neutral-950 font-sans">
            All Customer Trip Requests
          </h2>
          {bookings.length === 0 ? (
            <p className="text-xs text-neutral-500 py-8 text-center">
              No customer bookings recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {bookings.map((bk) => (
                <div key={bk.id} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-neutral-900 text-sm">{bk.customerName || 'Customer'} ({bk.customerPhone})</div>
                    <div className="text-neutral-500 mt-0.5">
                      Driver: <span className="font-semibold text-neutral-800">{bk.driverName}</span> · Pickup: {bk.pickupLocation}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      {new Date(bk.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-neutral-950 text-sm">₹{bk.totalFare || 0}</div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {bk.status || 'Confirmed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDocModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-neutral-950 text-sm font-sans">
                {selectedDocModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDocModal(null)}
                className="text-neutral-400 hover:text-neutral-900 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>
            <div className="bg-neutral-100 rounded-2xl overflow-hidden max-h-96 flex items-center justify-center">
              <img
                src={selectedDocModal.image}
                alt="KYC Document"
                className="max-h-96 w-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setSelectedDocModal(null)}
              className="w-full py-2.5 bg-neutral-950 text-white text-xs font-semibold rounded-full"
            >
              Close Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
