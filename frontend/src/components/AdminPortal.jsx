import { useState, useEffect } from 'react';
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
  Calendar,
  Sparkles,
  AlertTriangle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchAdminDriversApi,
  approveDriverApi,
  rejectDriverApi,
  fetchAdminBookingsApi,
  createDriverApi,
  updateDriverApi,
  deleteDriverApi,
  extendSubscriptionApi,
} from '../utils/api';
import { HYDERABAD_LOCALITIES } from '../data/mockDrivers';

export default function AdminPortal({ onBackToHome }) {
  // Tabs: 'all' | 'trial' | 'paid' | 'expired' | 'pending' | 'bookings'
  const [activeTab, setActiveTab] = useState('all');
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocModal, setSelectedDocModal] = useState(null);

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
    monthlySalary: '20000',
    location: HYDERABAD_LOCALITIES[0],
    experience: '5',
    status: 'Available',
    languages: 'Telugu, Hindi, English',
    licenseNo: 'TS09-2023-0098765',
    aadhaarNo: '9030-2604-1717',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    subscriptionPlan: 'free_trial',
  });

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
    loadAdminData();
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

  const handleReject = async (driverId, name) => {
    if (!window.confirm(`Are you sure you want to reject ${name}'s application?`)) return;
    try {
      const res = await rejectDriverApi(driverId);
      if (res.success) {
        toast.info(`${name}'s application was removed.`);
        loadAdminData();
      } else {
        toast.error(res.message || 'Failed to reject driver');
      }
    } catch {
      toast.error('Error rejecting driver');
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
      monthlySalary: driver.monthlySalary || 20000,
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
      monthlySalary: '20000',
      location: HYDERABAD_LOCALITIES[0],
      experience: '5',
      status: 'Available',
      languages: 'Telugu, Hindi, English',
      licenseNo: 'TS09-2023-0098765',
      aadhaarNo: '9030-2604-1717',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      subscriptionPlan: 'free_trial',
    });
  };

  // Categories
  const pendingDrivers = drivers.filter((d) => !d.isApproved);
  const trialDrivers = drivers.filter((d) => d.isApproved && d.subscriptionPlan === 'free_trial' && d.remainingDays > 0);
  const paidDrivers = drivers.filter((d) => d.isApproved && d.subscriptionPlan !== 'free_trial' && d.remainingDays > 0);
  const expiredDrivers = drivers.filter((d) => d.isApproved && d.remainingDays <= 0);

  // Filtered List
  const displayedDrivers = drivers.filter((d) => {
    if (activeTab === 'pending') return !d.isApproved;
    if (activeTab === 'trial') return d.isApproved && d.subscriptionPlan === 'free_trial' && d.remainingDays > 0;
    if (activeTab === 'paid') return d.isApproved && d.subscriptionPlan !== 'free_trial' && d.remainingDays > 0;
    if (activeTab === 'expired') return d.isApproved && d.remainingDays <= 0;
    return true; // 'all'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 pb-16">
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
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
            All Drivers
          </div>
          <div className="text-3xl font-bold text-neutral-950 font-sans">{drivers.length}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Total in database</div>
        </div>

        <div
          onClick={() => setActiveTab('trial')}
          className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1 flex items-center justify-between">
            <span>Free Trial Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-3xl font-bold text-emerald-950 font-sans">{trialDrivers.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">3-Mo Trial (+ Days)</div>
        </div>

        <div
          onClick={() => setActiveTab('paid')}
          className="bg-white p-5 rounded-2xl border border-indigo-200 bg-indigo-50/30 shadow-xs cursor-pointer hover:border-indigo-400 transition-all"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700 mb-1">
            Paid Plan Active
          </div>
          <div className="text-3xl font-bold text-indigo-950 font-sans">{paidDrivers.length}</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">₹49 & ₹99 Plans</div>
        </div>

        <div
          onClick={() => setActiveTab('expired')}
          className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/30 shadow-xs cursor-pointer hover:border-red-400 transition-all"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-1">
            Expired Listing
          </div>
          <div className="text-3xl font-bold text-red-950 font-sans">{expiredDrivers.length}</div>
          <div className="text-[11px] text-red-600 font-medium mt-1">Overdue (- Days)</div>
        </div>

        <div
          onClick={() => setActiveTab('pending')}
          className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
            Pending KYC
          </div>
          <div className="text-3xl font-bold text-amber-950 font-sans">{pendingDrivers.length}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Needs Approval</div>
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
          onClick={() => setActiveTab('trial')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'trial'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
          }`}
        >
          <span>Free Trial (+ Days)</span>
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
          <span>Paid Active (+ Days)</span>
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
          <span>Expired (- Days)</span>
          {expiredDrivers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
              {expiredDrivers.length}
            </span>
          )}
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
          <span>Pending KYC</span>
          {pendingDrivers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {pendingDrivers.length}
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
      </div>

      {/* DRIVER TABLE & CRUD LIST */}
      {activeTab !== 'bookings' && (
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
                              src={driver.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                              alt={driver.name}
                              className="w-10 h-10 rounded-xl object-cover bg-neutral-100 border border-neutral-200"
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
                            </div>
                          </div>
                        </td>

                        {/* Type & Rate */}
                        <td className="py-4 px-4 font-medium text-neutral-800">
                          <div className="font-bold text-neutral-900">
                            {driver.driverType === 'permanent'
                              ? `₹${(driver.monthlySalary || 20000).toLocaleString('en-IN')}/mo`
                              : `₹${driver.hourlyRate || 180}/hr`}
                          </div>
                          <div className="text-[10px] text-neutral-400 uppercase font-semibold">
                            {driver.driverType === 'permanent' ? 'Monthly Chauffeur' : 'Hourly Freelance'}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-4 font-medium text-neutral-700">
                          {driver.location}
                        </td>

                        {/* Plan Badge */}
                        <td className="py-4 px-4">
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
                              Featured (₹99/mo)
                            </span>
                          ) : driver.subscriptionPlan === 'starter' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold uppercase">
                              Starter Plan (₹49/mo)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase">
                              3-Month Free Trial
                            </span>
                          )}
                        </td>

                        {/* Subscription Remaining Days Highlighting */}
                        <td className="py-4 px-4 text-center">
                          {!isApproved ? (
                            <span className="text-neutral-400 font-mono italic">--</span>
                          ) : remaining > 0 ? (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono font-extrabold text-xs">
                              <span>+{remaining} days left</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-900 font-mono font-extrabold text-xs">
                              <span>{remaining} days expired</span>
                            </div>
                          )}
                        </td>

                        {/* Actions (Full CRUD) */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isApproved ? (
                              <button
                                type="button"
                                onClick={() => handleApprove(driver.id, driver.name)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Approve driver application"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approve
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleExtendDays(driver.id, driver.name)}
                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Add +30 Bonus Days to Driver Subscription"
                              >
                                <Calendar className="w-3 h-3" />
                                +30 Days
                              </button>
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
                      <span className="font-bold text-neutral-950 text-sm">{bk.customerName || 'Customer'} ({bk.customerPhone || '+91 99632 54183'})</span>
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
                className="text-neutral-400 hover:text-neutral-900 p-1 rounded-full"
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
                    <option value="freelance">Freelance (Hourly)</option>
                    <option value="permanent">Permanent (Monthly)</option>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={driverForm.hourlyRate}
                    onChange={(e) => setDriverForm({ ...driverForm, hourlyRate: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={driverForm.monthlySalary}
                    onChange={(e) => setDriverForm({ ...driverForm, monthlySalary: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  />
                </div>
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
                    <option value="featured">Featured Chauffeur (₹99/mo)</option>
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
                    <option value="freelance">Freelance (Hourly)</option>
                    <option value="permanent">Permanent (Monthly)</option>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={driverForm.hourlyRate}
                    onChange={(e) => setDriverForm({ ...driverForm, hourlyRate: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={driverForm.monthlySalary}
                    onChange={(e) => setDriverForm({ ...driverForm, monthlySalary: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  />
                </div>
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
                    <option value="featured">Featured Chauffeur (₹99/mo)</option>
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
    </div>
  );
}
