import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Phone,
  ArrowLeft,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Sparkles,
  AlertTriangle,
  Clock,
  UserCheck,
  Lock,
  Key,
  History,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchAdminDriversApi,
  approveDriverApi,
  rejectDriverApi,
  blockDriverApi,
  unblockDriverApi,
  restoreDriverApi,
  fetchAdminHistoryApi,
  fetchAdminBookingsApi,
  createDriverApi,
  updateDriverApi,
  deleteDriverApi,
  extendSubscriptionApi,
  fetchPricingSettingsApi,
  updatePricingSettingsApi,
} from '../utils/api';
import { HYDERABAD_LOCALITIES } from '../data/mockDrivers';

export default function AdminPortal({ onBackToHome, pricingSettings, onPricingUpdated }) {
  // Admin PIN Auth Security State
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');

  // Tabs: 'all' | 'trial' | 'paid' | 'expired' | 'pending' | 'bookings' | 'pricing' | 'history'
  const [activeTab, setActiveTab] = useState('all');
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocModal, setSelectedDocModal] = useState(null);

  // Admin Action History / Audit Log State
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');

  // Modals for CRUD
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [deletingDriverId, setDeletingDriverId] = useState(null);

  // Form State for Add / Edit
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    driverType: 'freelance',
    hourlyRate: '180',
    location: HYDERABAD_LOCALITIES[0],
    experience: '5',
    status: 'Available',
    languages: 'Telugu, Hindi, English',
    licenseNo: 'TS-09-2023-0098765',
    aadhaarNo: '9030-2604-1717',
    photo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239CA3AF"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.06-1.68 3.37-2.6 5.05-2.6s4.99.92 5.05 2.6c-1.25 1.35-3.02 2.2-5.05 2.2z"/%3E%3C/svg%E2%80%9D',
    subscriptionPlan: 'free_trial',
  });

  // Rejection, Blocking & Pricing state
  const [rejectingDriver, setRejectingDriver] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [blockingDriver, setBlockingDriver] = useState(null);
  const [blockReasonInput, setBlockReasonInput] = useState('');

  const [pricingForm, setPricingForm] = useState(() => ({
    freelanceSubscriptionPrice: 49,
    permanentSubscriptionPrice: 99,
    combinationSubscriptionPrice: 149,
    cityBaseHours: 4,
    cityBaseFare: 700,
    cityExtraHourlyRate: 100,
    nightSurchargePerHour: 150,
    outstationFlatRate: 2000,
    outstationInterstateRate: 2500,
    monthly8hSalary: 25000,
    monthly10hSalary: 28000,
    monthly12hSalary: 30000,
    ...(pricingSettings || {}),
  }));
  const [pricingLoading, setPricingLoading] = useState(false);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [driversRes, bookingsRes, historyData] = await Promise.all([
        fetchAdminDriversApi(),
        fetchAdminBookingsApi().catch(() => ({ success: false, data: [] })),
        fetchAdminHistoryApi().catch(() => []),
      ]);
      if (driversRes.success) {
        setDrivers(driversRes.data);
      }
      if (bookingsRes.success) {
        setBookings(bookingsRes.data);
      }
      if (Array.isArray(historyData)) {
        setHistoryList(historyData);
      }
    } catch {
      toast.error('Failed to connect to backend admin API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const [driversRes, bookingsRes, historyData] = await Promise.all([
          fetchAdminDriversApi(),
          fetchAdminBookingsApi().catch(() => ({ success: false, data: [] })),
          fetchAdminHistoryApi().catch(() => []),
        ]);
        if (mounted && driversRes.success) setDrivers(driversRes.data);
        if (mounted && bookingsRes.success) setBookings(bookingsRes.data);
        if (mounted && Array.isArray(historyData)) setHistoryList(historyData);
      } catch {
        if (mounted) toast.error('Failed to connect to backend admin API');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchInitial();
    return () => { mounted = false; };
  }, []);

  const handleApprove = async (driverId, name) => {
    try {
      const res = await approveDriverApi(driverId);
      if (res.success) {
        toast.success(`${name} approved! Granted 90-Day Free Trial on homepage.`);
        loadAdminData();
      } else {
        toast.error(res.message || 'Failed to approve driver');
      }
    } catch {
      toast.error('Error approving driver');
    }
  };

  const loadAdminHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const logs = await fetchAdminHistoryApi();
      if (Array.isArray(logs)) setHistoryList(logs);
    } catch {
      toast.error('Failed to load admin audit history');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const handleUnblockDriver = async (driverId, name) => {
    try {
      const res = await unblockDriverApi(driverId);
      if (res.success) {
        toast.success(`${name || 'Driver'} unblocked successfully! Status restored to Available.`);
        loadAdminData();
        loadAdminHistory();
      } else {
        toast.error(res.message || 'Failed to unblock driver');
      }
    } catch {
      toast.error('Error unblocking driver');
    }
  };

  const handleRestoreDriver = async (snapshot) => {
    if (!snapshot) return;
    try {
      const res = await restoreDriverApi(snapshot);
      if (res.success) {
        toast.success(`Driver ${snapshot.name} restored to database roster successfully!`);
        loadAdminData();
        loadAdminHistory();
      } else {
        toast.error(res.message || 'Failed to restore driver');
      }
    } catch {
      toast.error('Error restoring driver');
    }
  };

  const loadPricingData = useCallback(async () => {
    setPricingLoading(true);
    try {
      const data = await fetchPricingSettingsApi();
      if (data) setPricingForm(data);
    } catch {
      toast.error('Failed to load pricing settings');
    } finally {
      setPricingLoading(false);
    }
  }, []);

  const handleSavePricing = async (e) => {
    e.preventDefault();
    setPricingLoading(true);
    try {
      const res = await updatePricingSettingsApi(pricingForm);
      if (res) {
        toast.success('Duty & Subscription pricing rates updated successfully!');
        if (onPricingUpdated) {
          onPricingUpdated(res.data || pricingForm);
        }
        loadAdminHistory();
      }
    } catch {
      toast.error('Failed to save pricing settings');
    } finally {
      setPricingLoading(false);
    }
  };

  const handleOpenRejectModal = (driverId, name) => {
    setRejectingDriver({ id: driverId, name });
    setRejectionReasonInput('');
  };

  const confirmRejectWithReason = async () => {
    if (!rejectingDriver) return;
    try {
      const res = await rejectDriverApi(
        rejectingDriver.id,
        rejectionReasonInput.trim() || 'Verification details incomplete. Please provide valid documents.'
      );
      if (res.success) {
        toast.info(`${rejectingDriver.name}'s application was rejected. Driver can reapply after 3 days.`);
        setRejectingDriver(null);
        setRejectionReasonInput('');
        loadAdminData();
      } else {
        toast.error(res.message || 'Failed to reject driver');
      }
    } catch {
      toast.error('Error rejecting driver');
    }
  };

  const handleOpenBlockModal = (driverId, name) => {
    setBlockingDriver({ id: driverId, name });
    setBlockReasonInput('');
  };

  const confirmBlockWithReason = async () => {
    if (!blockingDriver) return;
    try {
      const res = await blockDriverApi(
        blockingDriver.id,
        blockReasonInput.trim() || 'Blocked permanently by admin due to platform policy violations.'
      );
      if (res.success) {
        toast.error(`${blockingDriver.name}'s account has been permanently BLOCKED.`);
        setBlockingDriver(null);
        setBlockReasonInput('');
        loadAdminData();
      } else {
        toast.error(res.message || 'Failed to block driver');
      }
    } catch {
      toast.error('Error blocking driver');
    }
  };

  // CRUD 1: Extend Subscription Days (+30 Bonus Days)
  const handleExtendDays = async (driverId, currentName) => {
    try {
      const res = await extendSubscriptionApi(driverId, 30);
      if (res.success) {
        toast.success(`Granted +30 bonus days to ${currentName}'s subscription!`);
        loadAdminData();
      }
    } catch {
      toast.error('Failed to extend subscription');
    }
  };

  // CRUD 2: Create Driver
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createDriverApi(driverForm);
      if (res.success) {
        toast.success(`Driver ${driverForm.name} created successfully!`);
        setIsAddModalOpen(false);
        resetForm();
        loadAdminData();
      }
    } catch {
      toast.error('Failed to create driver');
    }
  };

  // CRUD 3: Open Edit Driver
  const handleOpenEdit = (driver) => {
    setEditingDriver(driver);
    setDriverForm({
      name: driver.name || '',
      phone: driver.phone || driver.rawPhone || '',
      driverType: driver.driverType || 'freelance',
      hourlyRate: driver.hourlyRate || 180,
      location: driver.location || HYDERABAD_LOCALITIES[0],
      experience: driver.experience || 3,
      status: driver.status || 'Available',
      languages: driver.languages || 'Telugu, Hindi',
      licenseNo: driver.licenseNo || '',
      aadhaarNo: driver.aadhaarNo || '',
      photo: driver.photo || '',
      subscriptionPlan: driver.subscriptionPlan || 'starter',
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingDriver) return;
    try {
      const res = await updateDriverApi(editingDriver.id, driverForm);
      if (res.success) {
        toast.success(`Updated driver ${driverForm.name}!`);
        setEditingDriver(null);
        resetForm();
        loadAdminData();
      }
    } catch {
      toast.error('Failed to update driver');
    }
  };

  // CRUD 4: Delete Driver
  const handleDeleteConfirm = async () => {
    if (!deletingDriverId) return;
    try {
      const res = await deleteDriverApi(deletingDriverId);
      if (res.success) {
        toast.success('Driver record deleted from database');
        setDeletingDriverId(null);
        loadAdminData();
      }
    } catch {
      toast.error('Failed to delete driver');
    }
  };

  const resetForm = () => {
    setDriverForm({
      name: '',
      phone: '',
      driverType: 'freelance',
      hourlyRate: '180',
      location: HYDERABAD_LOCALITIES[0],
      experience: '5',
      status: 'Available',
      languages: 'Telugu, Hindi, English',
      licenseNo: 'TS-09-2023-0098765',
      aadhaarNo: '9030-2604-1717',
      photo: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239CA3AF"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.06-1.68 3.37-2.6 5.05-2.6s4.99.92 5.05 2.6c-1.25 1.35-3.02 2.2-5.05 2.2z"/%3E%3C/svg%E2%80%9D',
      subscriptionPlan: 'free_trial',
    });
  };

  // Categories
  const pendingDrivers = drivers.filter((d) => !d.isApproved);
  const trialDrivers = drivers.filter((d) => d.isApproved && d.subscriptionPlan === 'free_trial' && d.remainingDays > 0);
  const paidDrivers = drivers.filter((d) => d.isApproved && d.subscriptionPlan !== 'free_trial' && d.remainingDays > 0);
  const expiredDrivers = drivers.filter((d) => d.isApproved && d.remainingDays <= 0);

  // Filtered List wrapped in useMemo for performance (P-03)
  const displayedDrivers = useMemo(() => {
    return drivers.filter((d) => {
      if (activeTab === 'pending') return !d.isApproved;
      if (activeTab === 'trial') return d.isApproved && d.subscriptionPlan === 'free_trial' && d.remainingDays > 0;
      if (activeTab === 'paid') return d.isApproved && d.subscriptionPlan !== 'free_trial' && d.remainingDays > 0;
      if (activeTab === 'expired') return d.isApproved && d.remainingDays <= 0;
      return true; // 'all'
    });
  }, [drivers, activeTab]);

  // Filtered History Audit Logs
  const filteredHistory = useMemo(() => {
    return historyList.filter((item) => {
      if (historyFilter === 'all') return true;
      return item.actionType === historyFilter;
    });
  }, [historyList, historyFilter]);

  if (!adminAuthed) {
    return (
      <div className="max-w-md mx-auto px-4 pt-36 pb-20 font-sans">
        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 bg-neutral-950 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[10px] font-extrabold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ADMIN ACCESS RESTRICTED</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-950 font-sans">
              Admin Console Authorization
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Enter the security PIN or password to authorize admin operations and driver approvals.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (adminPinInput === '261125' || adminPinInput === '2026' || adminPinInput.toLowerCase() === 'admin') {
                setAdminAuthed(true);
                toast.success('Admin authorization granted');
              } else {
                toast.error('Invalid Admin Password');
              }
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <input
                type="password"
                placeholder="Enter Admin Password"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 rounded-2xl text-center text-sm font-bold tracking-widest text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span>Authorize Admin Access</span>
            </button>

            <button
              type="button"
              onClick={onBackToHome}
              className="w-full text-center text-xs font-semibold text-neutral-500 hover:text-neutral-900 pt-2 cursor-pointer"
            >
              ← Return to Mana Drivers
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 space-y-8 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 mb-2 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Mana Drivers Homepage
          </button>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-neutral-900 text-white rounded-2xl shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950 font-sans">
                Admin Driver Management & Subscriptions
              </h1>
              <p className="text-xs text-neutral-500">
                Perform driver CRUD operations, verify KYC documents & track remaining subscription days
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Driver</span>
          </button>

          <button
            type="button"
            onClick={loadAdminData}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 rounded-full text-xs font-medium text-neutral-800 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Stat Cards with Highlighting */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          onClick={() => setActiveTab('all')}
          className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs cursor-pointer hover:border-neutral-400 transition-all"
        >
          <div className="text-xs font-semibold text-neutral-600 mb-1">
            All Drivers
          </div>
          <div className="text-3xl font-bold tracking-tight text-neutral-950 font-sans">{drivers.length}</div>
          <div className="text-xs text-neutral-400 mt-1">Total in roster</div>
        </div>

        <div
          onClick={() => setActiveTab('trial')}
          className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="text-xs font-semibold text-emerald-700 mb-1 flex items-center justify-between">
            <span>Free Trial Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-emerald-950 font-sans">{trialDrivers.length}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">3-Month Trial</div>
        </div>

        <div
          onClick={() => setActiveTab('paid')}
          className="bg-white p-5 rounded-2xl border border-indigo-200 bg-indigo-50/30 shadow-xs cursor-pointer hover:border-indigo-400 transition-all"
        >
          <div className="text-xs font-semibold text-indigo-700 mb-1">
            Paid Plan Active
          </div>
          <div className="text-3xl font-bold tracking-tight text-indigo-950 font-sans">{paidDrivers.length}</div>
          <div className="text-xs text-indigo-600 font-medium mt-1">₹49 & ₹99 Plans</div>
        </div>

        <div
          onClick={() => setActiveTab('expired')}
          className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/30 shadow-xs cursor-pointer hover:border-red-400 transition-all"
        >
          <div className="text-xs font-semibold text-red-600 mb-1">
            Expired Listing
          </div>
          <div className="text-3xl font-bold tracking-tight text-red-950 font-sans">{expiredDrivers.length}</div>
          <div className="text-xs text-red-600 font-medium mt-1">Overdue</div>
        </div>

        <div
          onClick={() => setActiveTab('pending')}
          className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="text-xs font-semibold text-amber-700 mb-1">
            Pending KYC
          </div>
          <div className="text-3xl font-bold tracking-tight text-amber-950 font-sans">{pendingDrivers.length}</div>
          <div className="text-xs text-amber-600 font-medium mt-1">Needs Approval</div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-neutral-950 text-white shadow-xs'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
          }`}
        >
          All Drivers ({drivers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
          }`}
        >
          <span>Pending Approval</span>
          {pendingDrivers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold animate-pulse">
              {pendingDrivers.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trial')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'trial'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
          }`}
        >
          <span>Free Trial (90 Days)</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
            {trialDrivers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('paid')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'paid'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
          }`}
        >
          <span>Paid Active</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
            {paidDrivers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expired')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'expired'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
          }`}
        >
          <span>Listing Expired</span>
          {expiredDrivers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
              {expiredDrivers.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'bookings'
              ? 'bg-neutral-950 text-white shadow-xs'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
          }`}
        >
          Bookings ({bookings.length})
        </button>

        <button
          type="button"
          onClick={() => {
            loadPricingData();
            setActiveTab('pricing');
          }}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'pricing'
              ? 'bg-[#FF5500] text-white shadow-xs'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
          }`}
        >
          <span>⚙ Duty Pricing Rates</span>
        </button>

        <button
          type="button"
          onClick={() => {
            loadAdminHistory();
            setActiveTab('history');
          }}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-neutral-950 text-white shadow-xs'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
          }`}
        >
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>Action History ({historyList.length})</span>
        </button>
      </div>

      {/* DRIVER TABLE & CRUD LIST */}
      {activeTab !== 'bookings' && activeTab !== 'pricing' && activeTab !== 'history' && (
        <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-950 font-sans">
              Driver Records Directory ({displayedDrivers.length})
            </h2>
            <p className="text-xs text-neutral-400">
              Hover on subscription badges to view expiry dates
            </p>
          </div>

          {displayedDrivers.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <UserCheck className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="text-base font-bold text-neutral-800">No Drivers Found in This Filter</h3>
              <p className="text-xs text-neutral-500">Switch tabs or add a new driver using the button above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-100 uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Driver</th>
                    <th className="py-3.5 px-4">Type & Pricing</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Subscription Status</th>
                    <th className="py-3.5 px-4 text-center">Remaining Days</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {displayedDrivers.map((driver) => {
                    const remaining = driver.remainingDays !== undefined ? driver.remainingDays : 0;
                    const isApproved = driver.isApproved;
                    const isExpired = isApproved && remaining <= 0;
                    const isFeatured = driver.subscriptionPlan === 'featured';

                    return (
                      <tr key={driver.id} className="hover:bg-neutral-50/80 transition-colors">
                        {/* Driver Name & Photo */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={driver.photo || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239CA3AF"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.06-1.68 3.37-2.6 5.05-2.6s4.99.92 5.05 2.6c-1.25 1.35-3.02 2.2-5.05 2.2z"/%3E%3C/svg%E2%80%9D'}
                              alt={driver.name}
                              className="w-10 h-10 rounded-xl object-cover bg-neutral-100 border border-neutral-200 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedDocModal({ title: `${driver.name} - Profile Headshot`, url: driver.photo, type: 'Headshot' })}
                            />
                            <div>
                              <div className="font-bold text-neutral-950 text-sm font-sans flex items-center gap-1.5">
                                <span>{driver.name}</span>
                                {isFeatured && (
                                  <span className="p-0.5 bg-amber-100 text-amber-800 rounded-md text-[9px] font-extrabold flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                    Featured
                                  </span>
                                )}
                              </div>
                              <div className="text-neutral-500 text-[11px] flex items-center gap-1">
                                <Phone className="w-3 h-3 text-neutral-400" />
                                {driver.phone || driver.rawPhone}
                              </div>
                              {/* KYC Quick Document View Buttons */}
                              <div className="flex items-center gap-1 mt-1">
                                {driver.licensePhoto ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedDocModal({ title: `${driver.name} - Driving License Verification`, url: driver.licensePhoto, type: 'Driving License', driver })}
                                    className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded text-[9px] font-bold border border-neutral-200 cursor-pointer"
                                  >
                                    🪪 License
                                  </button>
                                ) : (
                                  <span className="text-[9px] text-neutral-400 italic">No License</span>
                                )}
                                {driver.aadhaarPhoto ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedDocModal({ title: `${driver.name} - Aadhaar Card Verification`, url: driver.aadhaarPhoto, type: 'Aadhaar Card', driver })}
                                    className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded text-[9px] font-bold border border-neutral-200 cursor-pointer"
                                  >
                                    🆔 Aadhaar
                                  </button>
                                ) : (
                                  <span className="text-[9px] text-neutral-400 italic">No Aadhaar</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type & Rate (Standard Rates) */}
                        <td className="py-4 px-4 font-medium text-neutral-800">
                          <div className="font-bold text-neutral-900">
                            {driver.driverType === 'combined'
                              ? '₹700 / 4h · ₹25k - ₹30k/mo'
                              : driver.driverType === 'permanent'
                              ? '₹25,000 – ₹30,000 / mo'
                              : '₹700 / 4h (Standard Rate)'}
                          </div>
                          <div className="text-[10px] text-neutral-400 uppercase font-semibold">
                            {driver.driverType === 'combined' ? 'Combined Mode' : driver.driverType === 'permanent' ? 'Monthly Driver' : 'Freelance (Hourly)'}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-4 font-medium text-neutral-700">
                          {driver.location}
                        </td>

                        {/* Plan Badge */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            {!isApproved ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Pending Verification
                              </span>
                            ) : isExpired ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                Listing Expired
                              </span>
                            ) : driver.subscriptionPlan === 'featured' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-extrabold uppercase">
                                <Sparkles className="w-3 h-3 text-amber-600" />
                                Featured (Active)
                              </span>
                            ) : driver.subscriptionPlan === 'starter' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold uppercase">
                                Paid Active Plan
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase">
                                Active 90-Day Free Trial
                              </span>
                            )}
                            {driver.premiumActivatedAt && (
                              <div className="text-[10px] text-neutral-400 font-mono">
                                Activated: {new Date(driver.premiumActivatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Subscription Remaining Days Highlighting */}
                        <td className="py-4 px-4 text-center">
                          {!isApproved ? (
                            <span className="text-neutral-400 font-mono italic">--</span>
                          ) : remaining > 0 ? (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono font-extrabold text-xs">
                              <span>{remaining} days remaining</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-900 font-mono font-extrabold text-xs">
                              <span>{Math.abs(remaining)} days expired</span>
                            </div>
                          )}
                        </td>

                        {/* Actions (Full CRUD) */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isApproved ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(driver.id, driver.name)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                  title="Approve driver application"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenRejectModal(driver.id, driver.name)}
                                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                  title="Reject application with reason (reapply allowed after 3 days)"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                                  Reject
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isExpired
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : driver.subscriptionPlan === 'featured' || driver.subscriptionPlan === 'starter'
                                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  }`}
                                >
                                  {isExpired
                                    ? 'Expired'
                                    : driver.subscriptionPlan === 'featured'
                                    ? 'Featured'
                                    : driver.subscriptionPlan === 'starter'
                                    ? 'Paid Plan'
                                    : 'Free Trial'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleExtendDays(driver.id, driver.name)}
                                  className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded text-[10px] font-bold border border-neutral-200 cursor-pointer"
                                  title="Extend +30 Bonus Days"
                                >
                                  +30d
                                </button>
                              </div>
                            )}

                            {/* Edit Driver */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(driver)}
                              className="p-2 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-all cursor-pointer"
                              title="Edit Driver Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Block Driver */}
                            <button
                              type="button"
                              onClick={() => handleOpenBlockModal(driver.id, driver.name)}
                              className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-full transition-all cursor-pointer"
                              title="Block Driver Account"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Driver */}
                            <button
                              type="button"
                              onClick={() => setDeletingDriverId(driver.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all cursor-pointer"
                              title="Delete Driver Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* BOOKINGS TAB CONTENT */}
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
                <div key={bk.id} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-neutral-400">{bk.id}</span>
                      <span className="font-bold text-neutral-950 text-sm">{bk.customerName || 'Customer'} {bk.customerPhone ? `(${bk.customerPhone})` : ''}</span>
                    </div>
                    <div className="text-neutral-600">
                      Driver Assigned: <span className="font-bold text-neutral-900">{bk.driverName || 'Verified Driver'}</span>
                    </div>
                    <div className="text-neutral-500">
                      Pickup Address: <span className="font-medium text-neutral-800">{bk.pickupAddress || bk.pickupLocation || 'Hyderabad'}</span>
                    </div>
                  </div>
                  <div className="sm:text-right shrink-0 space-y-1">
                    <div className="font-bold text-neutral-950 text-base">₹{(bk.totalCost || bk.totalFare || 540).toLocaleString('en-IN')}</div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-block">
                      {bk.status || 'Confirmed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DYNAMIC DUTY PRICING RATES TAB CONTENT */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-100 pb-4 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5500]/10 text-[#FF5500] text-xs font-bold uppercase mb-1">
                <span>Association & Custom Duty Rates</span>
              </div>
              <h2 className="text-xl font-extrabold text-neutral-950 font-sans">
                Dynamic Driver Duty Pricing Configuration
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Update driver duty rates across City, Outstation, and Monthly duties. Updates are instantly applied on homepage calculations.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSavePricing}
              disabled={pricingLoading}
              className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{pricingLoading ? 'Saving...' : 'Save Pricing Rates'}</span>
            </button>
          </div>

          <form onSubmit={handleSavePricing} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* 1. Temporary In-City Duties */}
            <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
              <div className="border-b border-neutral-200 pb-2">
                <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Section 1</span>
                <h3 className="font-bold text-sm text-neutral-950 font-sans">City Duties (In-City & Round Trip)</h3>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Base Hours (First N Hours)</label>
                <input
                  type="number"
                  value={pricingForm.cityBaseHours}
                  onChange={(e) => setPricingForm({ ...pricingForm, cityBaseHours: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Base Fare (First {pricingForm.cityBaseHours} Hours) in ₹</label>
                <input
                  type="number"
                  value={pricingForm.cityBaseFare}
                  onChange={(e) => setPricingForm({ ...pricingForm, cityBaseFare: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Additional Hourly Rate (₹ / hr)</label>
                <input
                  type="number"
                  value={pricingForm.cityExtraHourlyRate}
                  onChange={(e) => setPricingForm({ ...pricingForm, cityExtraHourlyRate: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Night Surcharge (₹ / hr after 10 PM)</label>
                <input
                  type="number"
                  value={pricingForm.nightSurchargePerHour}
                  onChange={(e) => setPricingForm({ ...pricingForm, nightSurchargePerHour: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>
            </div>

            {/* 2. Outstation Duties */}
            <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
              <div className="border-b border-neutral-200 pb-2">
                <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Section 2</span>
                <h3 className="font-bold text-sm text-neutral-950 font-sans">Outstation Duties</h3>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Single Day Outstation (Up to 200 km) in ₹</label>
                <input
                  type="number"
                  value={pricingForm.outstationFlatRate}
                  onChange={(e) => setPricingForm({ ...pricingForm, outstationFlatRate: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">+ Customer provides food expenses</span>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Interstate / Multi-Day Rate (₹ / day)</label>
                <input
                  type="number"
                  value={pricingForm.outstationInterstateRate}
                  onChange={(e) => setPricingForm({ ...pricingForm, outstationInterstateRate: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">+ Customer provides food & room accommodation</span>
              </div>
            </div>

            {/* 3. Permanent Duties */}
            <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
              <div className="border-b border-neutral-200 pb-2">
                <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Section 3</span>
                <h3 className="font-bold text-sm text-neutral-950 font-sans">Permanent Duties (Monthly Salary)</h3>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">8 Hours / Day Tier (₹ / month)</label>
                <input
                  type="number"
                  value={pricingForm.monthly8hSalary}
                  onChange={(e) => setPricingForm({ ...pricingForm, monthly8hSalary: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">10 Hours / Day Tier (₹ / month)</label>
                <input
                  type="number"
                  value={pricingForm.monthly10hSalary}
                  onChange={(e) => setPricingForm({ ...pricingForm, monthly10hSalary: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">12 Hours / Day Tier (₹ / month)</label>
                <input
                  type="number"
                  value={pricingForm.monthly12hSalary}
                  onChange={(e) => setPricingForm({ ...pricingForm, monthly12hSalary: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                />
              </div>
            </div>

            {/* 4. Driver Subscription / Premium Pricing (Requirement 1) */}
            <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-300 md:col-span-3 space-y-4">
              <div className="border-b border-amber-200 pb-2">
                <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block">Section 4</span>
                <h3 className="font-bold text-sm text-neutral-950 font-sans">Driver Subscription Pricing (Applied After 3 Months Free)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">Freelance Driver Plan (₹ / month)</label>
                  <input
                    type="number"
                    value={pricingForm.freelanceSubscriptionPrice || 49}
                    onChange={(e) => setPricingForm({ ...pricingForm, freelanceSubscriptionPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Standard hourly/outstation freelance drivers</span>
                </div>

                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">Permanent Driver Plan (₹ / month)</label>
                  <input
                    type="number"
                    value={pricingForm.permanentSubscriptionPrice || 99}
                    onChange={(e) => setPricingForm({ ...pricingForm, permanentSubscriptionPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Full-time monthly salary drivers</span>
                </div>

                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">Combination Dual-Duty Plan (₹ / month)</label>
                  <input
                    type="number"
                    value={pricingForm.combinationSubscriptionPrice || 149}
                    onChange={(e) => setPricingForm({ ...pricingForm, combinationSubscriptionPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-900"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Dual listing for both hourly & monthly duties</span>
                </div>
              </div>

              {/* Grandfathering Protection Disclaimer */}
              <div className="p-3.5 bg-white rounded-xl border border-amber-300 flex items-start gap-2.5 text-xs text-amber-950 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-neutral-950 block">Grandfathering Price-Lock Policy (Existing Drivers Keep Their Plan)</span>
                  <p className="text-[11px] text-neutral-600 leading-relaxed font-normal">
                    If an existing driver registered when the subscription plan was ₹49, they stick with the ₹49 renewal rate permanently. Any rate increase configured here (e.g., to ₹55) applies strictly to new driver signups.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ADMIN ACTION HISTORY & AUDIT LOG TAB CONTENT */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold uppercase mb-1">
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Audit Log & Change History</span>
              </div>
              <h2 className="text-xl font-extrabold text-neutral-950 font-sans">
                Admin Action History & Mistake Recovery
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Review all admin actions (blocks, deletions, rejections, approvals, pricing updates). If you made a mistake like accidentally blocking or deleting a user, click Unblock or Restore below.
              </p>
            </div>
            <button
              type="button"
              onClick={loadAdminHistory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-full text-xs font-medium text-neutral-800 transition-all cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
              Refresh Logs
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-2 border-b border-neutral-100">
            <span className="text-xs font-semibold text-neutral-500 mr-2">Filter Log:</span>
            {[
              { id: 'all', label: `All Events (${historyList.length})` },
              { id: 'BLOCK_DRIVER', label: 'Blocked Drivers' },
              { id: 'DELETE_DRIVER', label: 'Deleted Drivers' },
              { id: 'UNBLOCK_DRIVER', label: 'Unblocks' },
              { id: 'RESTORE_DRIVER', label: 'Restorations' },
              { id: 'REJECT_DRIVER', label: 'Rejections' },
              { id: 'APPROVE_DRIVER', label: 'Approvals' },
              { id: 'UPDATE_PRICING', label: 'Pricing Updates' },
              { id: 'CREATE_DRIVER', label: 'Created Drivers' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setHistoryFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  historyFilter === f.id
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* History List or Empty State */}
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-neutral-50 rounded-2xl border border-neutral-200">
              <History className="w-10 h-10 text-neutral-300 mx-auto" />
              <h3 className="text-sm font-bold text-neutral-800">No Action History Found</h3>
              <p className="text-xs text-neutral-500">No actions recorded matching this filter category.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => {
                const isBlock = item.actionType === 'BLOCK_DRIVER';
                const isDelete = item.actionType === 'DELETE_DRIVER';
                const isUnblock = item.actionType === 'UNBLOCK_DRIVER';
                const isRestore = item.actionType === 'RESTORE_DRIVER';
                const isApprove = item.actionType === 'APPROVE_DRIVER';
                const isPricing = item.actionType === 'UPDATE_PRICING';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isBlock
                        ? 'bg-amber-50/60 border-amber-300'
                        : isDelete
                        ? 'bg-red-50/50 border-red-300'
                        : isUnblock || isRestore || isApprove
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : isPricing
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isBlock
                              ? 'bg-amber-200 text-amber-900'
                              : isDelete
                              ? 'bg-red-200 text-red-900'
                              : isUnblock || isRestore || isApprove
                              ? 'bg-emerald-200 text-emerald-900'
                              : isPricing
                              ? 'bg-blue-200 text-blue-900'
                              : 'bg-neutral-200 text-neutral-800'
                          }`}
                        >
                          {item.actionType.replace(/_/g, ' ')}
                        </span>
                        <span className="font-bold text-neutral-950 text-sm font-sans">
                          {item.targetName}
                        </span>
                        <span className="text-neutral-400 font-mono text-[11px]">
                          ({item.targetType}: {item.targetId})
                        </span>
                      </div>

                      <p className="text-neutral-700 leading-relaxed font-normal">
                        {item.details}
                      </p>

                      <div className="text-[11px] text-neutral-400 font-mono">
                        Timestamp: {new Date(item.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </div>

                    {/* Undo / Mistake Recovery Action Buttons */}
                    <div className="shrink-0 flex items-center gap-2">
                      {isBlock && (
                        <button
                          type="button"
                          onClick={() => handleUnblockDriver(item.targetId, item.targetName)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Unblock Driver (Mistake Fix)</span>
                        </button>
                      )}

                      {isDelete && item.previousState && (
                        <button
                          type="button"
                          onClick={() => handleRestoreDriver(item.previousState)}
                          className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Restore Deleted Driver</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* REJECTION REASON MODAL (Requirement 5) */}
      {rejectingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 border border-neutral-200 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-950 font-sans flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Reject Application: {rejectingDriver.name}
              </h3>
              <button
                type="button"
                onClick={() => setRejectingDriver(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 block">
                Reason for Application Rejection:
              </label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. License photo blurry, Aadhaar verification failed, details mismatch..."
                className="w-full p-3 text-xs bg-neutral-50 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-red-500 font-sans"
              />
              <p className="text-[11px] text-neutral-500 leading-normal">
                The driver will see this rejection reason when logging in and will be allowed to re-apply after 3 days.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setRejectingDriver(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRejectWithReason}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-full shadow-xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK DRIVER MODAL (Requirement 5) */}
      {blockingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 border border-amber-300 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-950 font-sans flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" />
                Block Driver Account: {blockingDriver.name}
              </h3>
              <button
                type="button"
                onClick={() => setBlockingDriver(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 block">
                Reason for Permanent Block:
              </label>
              <textarea
                rows={3}
                value={blockReasonInput}
                onChange={(e) => setBlockReasonInput(e.target.value)}
                placeholder="e.g. Abusive behavior, policy violations, safety complaints..."
                className="w-full p-3 text-xs bg-amber-50/50 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
              />
              <p className="text-[11px] text-amber-900 leading-normal font-medium">
                Blocked driver accounts are suspended immediately and cannot log in or re-apply.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setBlockingDriver(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBlockWithReason}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-full shadow-xs cursor-pointer"
              >
                Block Driver Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW DRIVER (CRUD CREATE) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-neutral-950 text-base font-sans flex items-center gap-2">
                <Plus className="w-5 h-5 text-neutral-900" />
                Add New Driver Profile
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close modal"
                className="text-neutral-400 hover:text-neutral-950 p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={driverForm.name}
                    onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Driver Type</label>
                  <select
                    value={driverForm.driverType}
                    onChange={(e) => setDriverForm({ ...driverForm, driverType: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  >
                    <option value="freelance">Freelance (Hourly & Outstation)</option>
                    <option value="permanent">Permanent (Monthly Driver)</option>
                    <option value="combined">Combined (Both Duties)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Primary Area</label>
                  <select
                    value={driverForm.location}
                    onChange={(e) => setDriverForm({ ...driverForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  >
                    {HYDERABAD_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Official Standard Rate Card Note */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Official Fixed Pricing Model
                </span>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  {driverForm.driverType === 'permanent'
                    ? 'Monthly Duty: 4h (₹20k–₹25k) · 8h (₹25k–₹30k) · 12h (₹30k–₹40k) Negotiable + 1 weekly off.'
                    : driverForm.driverType === 'combined'
                    ? 'Hourly: ₹700 (4h), ₹900 (6h), ₹1,100 (8h) · Outstation: ₹2,000 / ₹2,500 · Monthly: ₹20k–₹40k Negotiable.'
                    : 'City Duty: Strictly 4, 6, 8 hrs (₹700 for 4h + ₹100/hr extra). Outstation: Flat ₹2,000 / ₹2,500 round trip.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Subscription Plan</label>
                  <select
                    value={driverForm.subscriptionPlan}
                    onChange={(e) => setDriverForm({ ...driverForm, subscriptionPlan: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  >
                    <option value="free_trial">3-Month Free Trial</option>
                    <option value="starter">Starter Plan (₹49/mo)</option>
                    <option value="featured">Featured Driver (₹99/mo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={driverForm.experience}
                    onChange={(e) => setDriverForm({ ...driverForm, experience: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-full text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-neutral-950 text-white rounded-full text-xs font-bold"
                >
                  Save & Publish Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT DRIVER (CRUD UPDATE) */}
      {editingDriver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-neutral-950 text-base font-sans flex items-center gap-2">
                <Edit className="w-5 h-5 text-neutral-900" />
                Edit Driver Profile: {editingDriver.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingDriver(null)}
                className="text-neutral-400 hover:text-neutral-900 p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={driverForm.name}
                    onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Driver Type</label>
                  <select
                    value={driverForm.driverType}
                    onChange={(e) => setDriverForm({ ...driverForm, driverType: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  >
                    <option value="freelance">Freelance (Hourly & Outstation)</option>
                    <option value="permanent">Permanent (Monthly Driver)</option>
                    <option value="combined">Combined (Both Duties)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Primary Area</label>
                  <select
                    value={driverForm.location}
                    onChange={(e) => setDriverForm({ ...driverForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  >
                    {HYDERABAD_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Official Standard Rate Card Note */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Official Fixed Pricing Model
                </span>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  {driverForm.driverType === 'permanent'
                    ? 'Monthly Duty: 4h (₹20k–₹25k) · 8h (₹25k–₹30k) · 12h (₹30k–₹40k) Negotiable + 1 weekly off.'
                    : driverForm.driverType === 'combined'
                    ? 'Hourly: ₹700 (4h), ₹900 (6h), ₹1,100 (8h) · Outstation: ₹2,000 / ₹2,500 · Monthly: ₹20k–₹40k Negotiable.'
                    : 'City Duty: Strictly 4, 6, 8 hrs (₹700 for 4h + ₹100/hr extra). Outstation: Flat ₹2,000 / ₹2,500 round trip.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Subscription Plan</label>
                  <select
                    value={driverForm.subscriptionPlan}
                    onChange={(e) => setDriverForm({ ...driverForm, subscriptionPlan: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  >
                    <option value="free_trial">3-Month Free Trial</option>
                    <option value="starter">Starter Plan (₹49/mo)</option>
                    <option value="featured">Featured Driver (₹99/mo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Duty Status</label>
                  <select
                    value={driverForm.status}
                    onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  >
                    <option value="Available">Available</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingDriver(null)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-full text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-neutral-950 text-white rounded-full text-xs font-bold"
                >
                  Update Driver Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE DRIVER (CRUD DELETE) */}
      {deletingDriverId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="font-bold text-neutral-950 text-base">Delete Driver Record?</h3>
                <p className="text-xs text-neutral-500">
                  This action cannot be undone. Driver profile and subscription records will be permanently removed.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDriverId(null)}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-full text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIGH-RES DOCUMENT INSPECTION MODAL WITH SIDE-BY-SIDE VERIFICATION DETAILS */}
      {selectedDocModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-neutral-900" />
                <h3 className="font-bold text-neutral-950 text-base font-sans">{selectedDocModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocModal(null)}
                className="p-2 text-neutral-400 hover:text-neutral-950 rounded-full bg-neutral-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 overflow-auto max-h-[60vh]">
              {/* Document Image Display */}
              <div className="md:col-span-7 bg-neutral-900 rounded-2xl p-4 border border-neutral-800 flex items-center justify-center h-full min-h-[260px]">
                <img
                  src={selectedDocModal.url}
                  alt={selectedDocModal.title}
                  className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-lg border border-neutral-700"
                />
              </div>

              {/* Side-by-Side Entered Details Panel for Instant Verification */}
              <div className="md:col-span-5 bg-neutral-50 rounded-2xl p-5 border border-neutral-200 space-y-4 text-xs">
                <div className="border-b border-neutral-200 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 block">
                    VERIFICATION COMPARISON
                  </span>
                  <p className="text-sm font-bold text-neutral-950 font-sans mt-0.5">
                    {selectedDocModal.driver?.name || 'Driver Document'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-xl border border-neutral-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                      Entered Phone Number
                    </span>
                    <span className="text-sm font-bold text-neutral-900 font-mono flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-500" />
                      {selectedDocModal.driver?.phone || selectedDocModal.driver?.rawPhone || 'Not provided'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-neutral-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                      Entered Aadhaar Card Number
                    </span>
                    <span className="text-sm font-bold text-neutral-900 font-mono mt-0.5 block">
                      {selectedDocModal.driver?.aadhaarNo || 'Verified Aadhaar ID'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-neutral-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                      Entered Driving License Number
                    </span>
                    <span className="text-sm font-bold text-neutral-900 font-mono mt-0.5 block">
                      {selectedDocModal.driver?.licenseNo || 'Verified License ID'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-neutral-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                      Operating Area & Status
                    </span>
                    <span className="text-xs font-semibold text-neutral-800 mt-0.5 block">
                      {selectedDocModal.driver?.location || 'Hyderabad'} · {selectedDocModal.driver?.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
              <span className="text-neutral-500 font-medium">Document Type: <strong className="text-neutral-900">{selectedDocModal.type}</strong></span>
              <a
                href={selectedDocModal.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full font-bold transition-all text-xs"
              >
                Open Original Image ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
