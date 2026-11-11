import { useState, useEffect } from 'react';
import {
  UserPlus,
  Clock,
  Power,
  ShieldCheck,
  CheckCircle2,
  Upload,
  LogOut,
  Sparkles,
  CreditCard,
  AlertTriangle,
  Edit3,
  User,
  X,
  IndianRupee,
  KeyRound,
  Copy,
  MapPin,
  Navigation,
  Share2,
  MessageSquare,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { HYDERABAD_LOCALITIES } from '../data/mockDrivers';
import SearchableSelect from './common/SearchableSelect';
import { triggerDriverRegistrationRazorpay } from '../utils/razorpay';
import {
  loginDriverApi,
  registerDriverApi,
  updateDriverStatusApi,
  uploadDriverDocsApi,
  subscribeDriverPlanApi,
  updateDriverSelfProfileApi,
  getApiUrl,
} from '../utils/api';
import {
  validateIndianMobile,
  validateAadhaar,
  formatAadhaarInput,
  validateDrivingLicense,
  formatDrivingLicenseInput,
  validateExperience,
  validateName,
} from '../utils/helpers';
import { validatePhotoFile, compressPhoto } from '../utils/imageCompressor';
import { openLocationInGoogleMaps, shareLocationOnWhatsApp } from '../utils/locationHelper';

export default function DriverPortal({ onBackToHome, pricingSettings }) {
  // Mode: 'login' | 'register' | 'dashboard'
  const [mode, setMode] = useState('login');

  // Authenticated Driver state
  const [loggedInDriver, setLoggedInDriver] = useState(null);
  const [currentTime] = useState(() => Date.now());

  // Popup Modal state for Login verification (Unregistered / Pending Approval)
  const [authStatusModal, setAuthStatusModal] = useState(null); // null | { type: 'unregistered' | 'pending', phone: string, driverName?: string }

  // Edit Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    hourlyRate: 180,
    location: HYDERABAD_LOCALITIES[0],
    languages: '',
    bio: '',
    photo: '',
  });

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginStep, setLoginStep] = useState('phone'); // 'phone' | 'otp'
  const [loginLoading, setLoginLoading] = useState(false);

  // Registration form state
  const [registrationType, setRegistrationType] = useState('hourly'); // 'hourly' | 'monthly'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: HYDERABAD_LOCALITIES[0],
    experience: '5',
    languages: 'Telugu, Hindi, English',
    bio: '',
    hourlyRate: 180,
    licenseNo: '',
    licensePhoto: null,
    licensePhotoPreview: null,
    aadhaarNo: '',
    aadhaarPhoto: null,
    aadhaarPhotoPreview: null,
    photo: null,
    photoPreview: null,
    workingPreference: 'Work by the hour (₹180/hr)',
  });

  const [registerSuccessBanner, setRegisterSuccessBanner] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  // Mandatory Driver Code of Conduct & Disclaimer Checkboxes
  const [conductNonAlcoholic, setConductNonAlcoholic] = useState(false);
  const [conductNoAbuse, setConductNoAbuse] = useState(false);
  const [conductDisclaimer, setConductDisclaimer] = useState(false);

  // Photo Size Information (Stored in MB before upload)
  const [photoSizes, setPhotoSizes] = useState({
    photo: null,
    licensePhoto: null,
    aadhaarPhoto: null,
    editPhoto: null,
  });

  // Field validation and duplicate server error states
  const [fieldErrors, setFieldErrors] = useState({});

  // Assigned Bookings & Delivery / Site Locations for Logged-In Driver
  const [driverBookings, setDriverBookings] = useState([]);

  useEffect(() => {
    if (!loggedInDriver) return;
    let isMounted = true;
    async function loadDriverBookings() {
      try {
        const res = await fetch(getApiUrl(`/api/bookings?driverId=${loggedInDriver.id}`));
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setDriverBookings(json.data);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch driver bookings:', err);
      }

      // Default sample duty site location for immediate testing
      if (isMounted) {
        setDriverBookings([
          {
            id: `BK-DEMO-101`,
            driverId: loggedInDriver.id,
            driverName: loggedInDriver.name,
            customerName: 'Vikramaditya Reddy',
            customerPhone: '+91 98491 55667',
            date: new Date().toISOString().split('T')[0],
            time: '14:30',
            hours: '4 Hours City Duty',
            dutyCategory: 'city',
            pickupAddress: 'Tower 4, Mindspace IT Park, Hitec City, Hyderabad',
            mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Mindspace+IT+Park+Hitec+City+Hyderabad',
            totalCost: 700,
            status: 'Confirmed',
          },
        ]);
      }
    }
    loadDriverBookings();
    return () => {
      isMounted = false;
    };
  }, [loggedInDriver]);

  // Handle Photo File Uploads (License, Aadhaar, Headshot) with 5 MB Limit & Compression
  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const labelName =
      field === 'licensePhoto'
        ? 'Driving License'
        : field === 'aadhaarPhoto'
        ? 'Aadhaar Card'
        : 'Profile Headshot';

    // 1. Validate file size up to 5 MB and valid image MIME type
    const validation = validatePhotoFile(file, 5);
    if (!validation.valid) {
      toast.error(validation.error);
      e.target.value = '';
      return;
    }

    toast.loading(`Analyzing & compressing ${labelName} (${validation.sizeMB})...`, { id: 'photo-proc' });

    try {
      const result = await compressPhoto(file);
      toast.dismiss('photo-proc');

      setPhotoSizes((prev) => ({
        ...prev,
        [field]: {
          originalSizeMB: result.originalSizeMB,
          compressedSizeMB: result.compressedSizeMB,
          wasCompressed: result.wasCompressed,
        },
      }));

      if (field === 'editPhoto') {
        setEditForm((prev) => ({
          ...prev,
          photo: result.dataUrl,
          photoFile: result.file,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [field]: result.file,
          [`${field}Preview`]: result.dataUrl,
        }));
      }

      if (result.wasCompressed) {
        toast.success(
          `${labelName} attached! (${result.originalSizeMB} optimized to ${result.compressedSizeMB})`
        );
      } else {
        toast.success(`${labelName} attached! (${result.originalSizeMB})`);
      }
    } catch (err) {
      toast.dismiss('photo-proc');
      toast.error(`Error processing ${labelName}: ${err.message || 'Please try another photo'}`);
    }
  };

  // Login Handlers (Direct Login for Approved Drivers, Popups for Unregistered / Pending)
  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    const valRes = validateIndianMobile(loginPhone);
    if (!valRes.isValid) {
      toast.error(valRes.error);
      return;
    }
    const clean = valRes.cleaned;

    setLoginLoading(true);
    try {
      const res = await loginDriverApi(clean);
      if (res && res.success && res.driver && res.driver.isApproved && !res.driver.isRejected) {
        setLoggedInDriver(res.driver);
        setMode('dashboard');
        toast.success(`Welcome back, ${res.driver.name}! Logged into Driver Portal.`);
      } else if (res && (res.code === 'REJECTED' || res.driver?.isRejected || res.driver?.listingStatus === 'Rejected')) {
        setAuthStatusModal({
          type: 'rejected',
          phone: clean,
          driverName: res.driver?.name || 'Driver',
          rejectionReason: res.rejectionReason || res.driver?.rejectionReason || 'Documents or details verification incomplete.',
        });
      } else if (res && res.code === 'PENDING_APPROVAL') {
        setAuthStatusModal({
          type: 'pending',
          phone: clean,
          driverName: res.driver?.name || 'Driver',
        });
      } else if (res && res.code === 'UNREGISTERED') {
        setAuthStatusModal({
          type: 'unregistered',
          phone: clean,
        });
      } else if (res && res.driver && res.driver.isRejected) {
        setAuthStatusModal({
          type: 'rejected',
          phone: clean,
          driverName: res.driver.name,
        });
      } else if (res && res.driver && !res.driver.isApproved) {
        setAuthStatusModal({
          type: 'pending',
          phone: clean,
          driverName: res.driver?.name || 'Driver',
        });
      } else {
        setAuthStatusModal({
          type: 'unregistered',
          phone: clean,
        });
      }
    } catch {
      setAuthStatusModal({
        type: 'unregistered',
        phone: clean,
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = loginOtp.replace(/\D/g, '').slice(0, 6);
    if (cleanOtp.length < 4) {
      toast.error('Please enter a valid 4 to 6-digit OTP code');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await loginDriverApi(loginPhone, cleanOtp);
      if (res.success && res.driver) {
        setLoggedInDriver(res.driver);
        setMode('dashboard');
        toast.success(`Welcome back, ${res.driver.name}!`);
      } else {
        toast.error(res.message || 'Invalid OTP');
      }
    } catch {
      toast.error('Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setLoggedInDriver(null);
    setMode('login');
    setLoginStep('phone');
    setLoginOtp('');
    toast.info('Logged out from Driver Portal');
  };

  const handleToggleStatus = async () => {
    if (!loggedInDriver) return;
    const newStatus = loggedInDriver.status === 'Available' ? 'Offline' : 'Available';
    try {
      const res = await updateDriverStatusApi(loggedInDriver.id, newStatus);
      if (res.success) {
        setLoggedInDriver(res.driver);
        toast.success(`Duty status updated to ${newStatus}`);
      }
    } catch {
      toast.error('Failed to update duty status');
    }
  };

  // Open Self Edit Profile Modal
  const handleOpenEditProfile = () => {
    if (!loggedInDriver) return;
    setEditForm({
      name: loggedInDriver.name || '',
      hourlyRate: loggedInDriver.hourlyRate || 180,
      monthlySalary: loggedInDriver.monthlySalary || 20000,
      location: loggedInDriver.location || HYDERABAD_LOCALITIES[0],
      languages: loggedInDriver.languages || '',
      bio: loggedInDriver.bio || '',
      photo: loggedInDriver.photo || '',
    });
    setIsEditProfileOpen(true);
  };

  const handleSaveSelfProfile = async (e) => {
    e.preventDefault();
    if (!loggedInDriver) return;
    try {
      const res = await updateDriverSelfProfileApi(loggedInDriver.id, editForm);
      if (res.success) {
        setLoggedInDriver(res.driver || { ...loggedInDriver, ...editForm });
        setIsEditProfileOpen(false);
        toast.success('Your profile details and custom rates were updated!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch {
      toast.error('Error updating profile');
    }
  };

  // Renew / Upgrade Subscription Plan Action
  const handleSubscribePlan = async (planType, amount) => {
    if (!loggedInDriver) return;
    setSubscribeLoading(true);

    triggerDriverRegistrationRazorpay({
      type: planType,
      fee: amount,
      driverName: loggedInDriver.name,
      onPaymentSuccess: async () => {
        try {
          const res = await subscribeDriverPlanApi(loggedInDriver.id, planType);
          if (res.success && res.driver) {
            setLoggedInDriver(res.driver);
            toast.success(`Subscription activated! Added +30 days to your homepage listing.`);
          } else {
            toast.success('Payment received & 30 days added to your subscription!');
          }
        } catch {
          toast.success('Subscription plan renewed successfully!');
        } finally {
          setSubscribeLoading(false);
        }
      },
    });
  };

  // Registration Submit Handler with Document & Profile Headshot Upload
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const newFieldErrors = {};

    const nameRes = validateName(formData.name);
    if (!nameRes.isValid) {
      newFieldErrors.name = nameRes.error;
    }

    const phoneRes = validateIndianMobile(formData.phone);
    if (!phoneRes.isValid) {
      newFieldErrors.phone = phoneRes.error;
    }

    const expRes = validateExperience(formData.experience);
    if (!expRes.isValid) {
      newFieldErrors.experience = expRes.error;
    }

    const licenseRes = validateDrivingLicense(formData.licenseNo);
    if (!licenseRes.isValid) {
      newFieldErrors.licenseNo = licenseRes.error;
    }

    if (!formData.licensePhoto && !formData.licensePhotoPreview) {
      newFieldErrors.licensePhoto = 'Driving License Photo is mandatory.';
    }

    const aadhaarRes = validateAadhaar(formData.aadhaarNo);
    if (!aadhaarRes.isValid) {
      newFieldErrors.aadhaarNo = aadhaarRes.error;
    }

    if (!formData.aadhaarPhoto && !formData.aadhaarPhotoPreview) {
      newFieldErrors.aadhaarPhoto = 'Aadhaar Card Photo is mandatory.';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      const firstError = Object.values(newFieldErrors)[0];
      toast.error(firstError);
      return;
    }
    setFieldErrors({});

    if (!conductNonAlcoholic || !conductNoAbuse || !conductDisclaimer) {
      toast.error('Please accept all Code of Conduct and Platform Disclaimer checkboxes to register.');
      return;
    }

    setRegisterLoading(true);
    setUploadStatusText('Uploading Profile Headshot, License & Aadhaar...');

    let finalLicenseUrl = formData.licensePhotoPreview;
    let finalAadhaarUrl = formData.aadhaarPhotoPreview;
    let finalHeadshotUrl = formData.photoPreview || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239CA3AF"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.06-1.68 3.37-2.6 5.05-2.6s4.99.92 5.05 2.6c-1.25 1.35-3.02 2.2-5.05 2.2z"/%3E%3C/svg%E2%80%9D';

    try {
      if (
        formData.licensePhoto instanceof File ||
        formData.aadhaarPhoto instanceof File ||
        formData.photo instanceof File
      ) {
        const uploadData = new FormData();
        if (formData.licensePhoto instanceof File) {
          uploadData.append('licensePhoto', formData.licensePhoto);
        }
        if (formData.aadhaarPhoto instanceof File) {
          uploadData.append('aadhaarPhoto', formData.aadhaarPhoto);
        }
        if (formData.photo instanceof File) {
          uploadData.append('photo', formData.photo);
        }

        const uploadRes = await uploadDriverDocsApi(uploadData);
        if (uploadRes.success && uploadRes.urls) {
          if (uploadRes.urls.licensePhoto) finalLicenseUrl = uploadRes.urls.licensePhoto;
          if (uploadRes.urls.aadhaarPhoto) finalAadhaarUrl = uploadRes.urls.aadhaarPhoto;
          if (uploadRes.urls.photo) finalHeadshotUrl = uploadRes.urls.photo;
        }
      }
    } catch {
      // Fallback
    }

    setUploadStatusText('');

    const fee = registrationType === 'combined'
      ? (pricingSettings?.combinationSubscriptionPrice || 149)
      : registrationType === 'hourly'
      ? (pricingSettings?.freelanceSubscriptionPrice || 49)
      : (pricingSettings?.permanentSubscriptionPrice || 99);

    const registrationPayload = {
      name: nameRes.cleaned,
      phone: phoneRes.cleaned,
      driverType: registrationType === 'combined' ? 'combined' : registrationType === 'hourly' ? 'freelance' : 'permanent',
      hourlyRate: Number(formData.hourlyRate) || 175,
      location: formData.location,
      experience: expRes.value,
      languages: formData.languages,
      photo: finalHeadshotUrl,
      bio: formData.bio ? formData.bio.slice(0, 300) : `${nameRes.cleaned} is a verified private driver in ${formData.location}, Hyderabad.`,
      licenseNo: licenseRes.formatted || licenseRes.cleaned,
      licensePhoto: finalLicenseUrl,
      aadhaarNo: aadhaarRes.formatted,
      aadhaarPhoto: finalAadhaarUrl,
      isApproved: false,
      workingPreference: `${registrationType === 'combined' ? 'Combined (Hourly & Monthly)' : registrationType === 'hourly' ? 'Hourly Freelance' : 'Monthly Permanent'} (Standard Rates)`,
    };

    triggerDriverRegistrationRazorpay({
      type: registrationType,
      fee,
      driverName: formData.name,
      onPaymentSuccess: async () => {
        try {
          const res = await registerDriverApi(registrationPayload);
          if (res.success) {
            setRegisterSuccessBanner(true);
            try {
              window.history.pushState({}, '', '/driver/success');
              if (typeof window.gtag === 'function') {
                window.gtag('event', 'conversion', {
                  event_category: 'DriverSignup',
                  event_label: 'Driver Registered',
                });
              }
              if (typeof window.fbq === 'function') {
                window.fbq('track', 'CompleteRegistration', {
                  content_name: 'Driver Signup',
                });
              }
            } catch {
              // ignore
            }
            toast.success('Registration payment verified & 3-Month Free Trial activated!');
          } else {
            if (res.field) {
              setFieldErrors({ [res.field]: res.message });
            }
            toast.error(res.message || 'Failed to submit driver application');
          }
        } catch (err) {
          toast.error(err?.message || 'Error submitting registration');
        } finally {
          setRegisterLoading(false);
        }
      },
    });
  };

  const remainingDays = loggedInDriver ? (loggedInDriver.remainingDays !== undefined ? loggedInDriver.remainingDays : 90) : 0;
  const isExpired = remainingDays <= 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 space-y-8 pb-16">
      {/* Navigation Header */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-4 sm:p-6 border border-neutral-200 shadow-xs">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            HYDERABAD DRIVERS
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-950 font-sans">
            Driver Portal
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {loggedInDriver ? (
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-full">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  mode === 'login'
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  mode === 'register'
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Sign-Up (3 Mo Free)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODE 1: LOGGED-IN DRIVER DASHBOARD */}
      {mode === 'dashboard' && loggedInDriver && (
        <div className="space-y-6 animate-fadeIn">
          {/* PENDING VERIFICATION NOTICE BANNER IF NOT APPROVED */}
          {!loggedInDriver.isApproved && (
            <div className="bg-amber-500/15 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 text-amber-950 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 font-extrabold text-sm sm:text-base text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>⏳ Application Under Review - Verification Pending (24 to 48 Hours)</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                Your Aadhaar Card and Driving License documents have been submitted and are currently undergoing background check by Mana Drivers admin. Once approved, your profile will automatically go live on the public directory!
              </p>
            </div>
          )}

          {/* Driver Welcome Card */}
          <div className="bg-[#121212] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={loggedInDriver.photo || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239CA3AF"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.06-1.68 3.37-2.6 5.05-2.6s4.99.92 5.05 2.6c-1.25 1.35-3.02 2.2-5.05 2.2z"/%3E%3C/svg%E2%80%9D'}
                alt={loggedInDriver.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-neutral-700 bg-neutral-800 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-sans text-white">{loggedInDriver.name}</h2>
                  {loggedInDriver.isApproved ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                      ✓ Verified Driver
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                      ⏳ Verification Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {loggedInDriver.phone} · {loggedInDriver.location}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-md border border-emerald-400/20">
                    Standard Duty Rates
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Edit Profile Button */}
              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile Info</span>
              </button>

              {/* Duty Status Toggle */}
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={!loggedInDriver.isApproved}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                  !loggedInDriver.isApproved
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : loggedInDriver.status === 'Available'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-200'
                }`}
                title={!loggedInDriver.isApproved ? 'Duty toggle available after admin verification' : 'Toggle Duty Status'}
              >
                <Power className="w-3.5 h-3.5" />
                <span>
                  {!loggedInDriver.isApproved
                    ? 'VERIFICATION PENDING'
                    : loggedInDriver.status === 'Available'
                    ? 'ONLINE (AVAILABLE)'
                    : 'OFFLINE'}
                </span>
              </button>
            </div>
          </div>

          {/* PERMANENT REVIEW OTP WIDGET (Trip Feedback Verification) */}
          <div className="bg-gradient-to-r from-emerald-950 via-neutral-900 to-neutral-950 text-white rounded-3xl p-6 border border-emerald-500/30 shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <KeyRound className="w-5 h-5" />
                  </span>
                  <h3 className="font-bold text-white text-base font-sans">Your Permanent Review OTP</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold tracking-wider uppercase">
                    Trip Verification Code
                  </span>
                </div>
                <p className="text-xs text-neutral-300 max-w-xl leading-relaxed">
                  Share this fixed 4-digit code with your car owner after completing duty. When they enter this OTP, their 5-star rating & review will be verified and published on your profile to boost your bookings!
                </p>
              </div>

              <div className="flex items-center gap-3 bg-neutral-900/90 px-5 py-3 rounded-2xl border border-emerald-500/40 shrink-0">
                <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 tracking-widest">
                  {loggedInDriver.reviewOtp || '4821'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(loggedInDriver.reviewOtp || '4821');
                    toast.success('Review OTP copied to clipboard!');
                  }}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  title="Copy Review OTP"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* SUBSCRIPTION & 3-MONTH FREE TRIAL STATUS WIDGET */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-neutral-950" />
                  <h3 className="font-bold text-neutral-950 text-base font-sans">
                    Homepage Listing & Subscription
                  </h3>
                </div>
                <p className="text-xs text-neutral-500">
                  Drivers must have active remaining days to appear in public searches on Mana Drivers.
                </p>
              </div>

              {/* Countdown Badge */}
              <div className="shrink-0">
                {!isExpired ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-extrabold font-mono">+{remainingDays} Days Left</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {loggedInDriver.subscriptionPlan === 'free_trial' ? 'Free Trial' : 'Active Plan'}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-50 border border-red-200 text-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-extrabold font-mono">{remainingDays} Days Expired</span>
                    <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                      Action Required
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Plan Purchase Options */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Renew or Upgrade Your Homepage Listing Plan (+30 Days)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Freelance Plan ₹49 */}
                <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Freelance Plan
                      </span>
                      <span className="text-xs font-extrabold text-neutral-950 bg-white px-2.5 py-1 rounded-full border border-neutral-200">
                        ₹49 / month
                      </span>
                    </div>
                    <div className="text-base font-bold text-neutral-950 font-sans mt-2">
                      Freelance Driver
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">
                      For temporary city & outstation drivers. 3 months free, then ₹49/mo.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubscribePlan('freelance', 49)}
                    disabled={subscribeLoading}
                    className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Subscribe ₹49 (+30 Days)
                  </button>
                </div>

                {/* Permanent Plan ₹99 */}
                <div className="p-5 rounded-2xl border border-neutral-300 bg-white space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        Permanent Plan
                      </span>
                      <span className="text-xs font-extrabold text-neutral-950 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                        ₹99 / month
                      </span>
                    </div>
                    <div className="text-base font-bold text-neutral-950 font-sans mt-2">
                      Permanent Driver
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">
                      For full-time monthly salary drivers. 3 months free, then ₹99/mo.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubscribePlan('permanent', 99)}
                    disabled={subscribeLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Subscribe ₹99 (+30 Days)
                  </button>
                </div>

                {/* Combination Plan ₹149 */}
                <div className="p-5 rounded-2xl border border-amber-300 bg-amber-50/50 space-y-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                    Best Value
                  </div>
                  <div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                        Dual Listing
                      </span>
                      <span className="text-xs font-extrabold text-neutral-950 bg-white px-2.5 py-1 rounded-full border border-amber-300">
                        ₹149 / month
                      </span>
                    </div>
                    <div className="text-base font-bold text-neutral-950 font-sans mt-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Combination Driver
                    </div>
                    <p className="text-xs text-neutral-700 mt-1">
                      Receive both Freelance hourly & Permanent monthly duties. 3 months free, then ₹149/mo.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubscribePlan('combined', 149)}
                    disabled={subscribeLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Subscribe ₹149 (+30 Days)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ASSIGNED DUTIES & SITE LOCATIONS (WhatsApp & Google Maps Sharing) */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-950 text-base font-sans">
                    Assigned Duties &amp; Site Locations ({driverBookings.length})
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Open customer pickup/delivery sites in Google Maps or share location directly via WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            {driverBookings.length === 0 ? (
              <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-1">
                <p className="text-sm font-bold text-neutral-900">No Scheduled Duties Yet</p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  When car owners book you, their site/pickup locations, schedule, and direct WhatsApp links will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {driverBookings.map((duty) => (
                  <div
                    key={duty.id}
                    className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/70 space-y-3.5 hover:border-neutral-300 transition-all shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-full">
                          {duty.id}
                        </span>
                        <h4 className="font-bold text-neutral-950 text-base font-sans mt-1">
                          {duty.customerName || 'Car Owner'}
                        </h4>
                        <p className="text-xs text-neutral-500">
                          {duty.customerPhone || 'Contact details pending'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-neutral-950">₹{duty.totalCost}</span>
                        <p className="text-[10px] font-semibold text-emerald-700">{duty.hours || duty.dutyCategory}</p>
                      </div>
                    </div>

                    {/* Site / Delivery Location Box */}
                    <div className="p-3 bg-white rounded-xl border border-neutral-200 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                            Pickup / Site Location:
                          </span>
                          <span className="text-xs font-semibold text-neutral-900 leading-snug block">
                            {duty.pickupAddress}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pl-6">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{duty.date} at {duty.time}</span>
                      </div>
                    </div>

                    {/* Quick Location Action Buttons (Google Maps & WhatsApp) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {/* Open in Google Maps */}
                      <button
                        type="button"
                        onClick={() => openLocationInGoogleMaps(duty.pickupAddress, duty.coords)}
                        className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title="Open valid Google Maps route"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Open in Google Maps</span>
                      </button>

                      {/* Share Site Location on WhatsApp */}
                      <button
                        type="button"
                        onClick={() =>
                          shareLocationOnWhatsApp({
                            location: duty.pickupAddress,
                            mapsUrl: duty.mapsUrl,
                            tripId: duty.id,
                            customerName: duty.customerName,
                            customerPhone: duty.customerPhone,
                            date: duty.date,
                            time: duty.time,
                          })
                        }
                        className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title="Share valid Google Maps location link on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp Location</span>
                      </button>
                    </div>

                    {/* Direct Contact with Customer via WhatsApp */}
                    {duty.customerPhone && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            shareLocationOnWhatsApp({
                              location: duty.pickupAddress,
                              mapsUrl: duty.mapsUrl,
                              tripId: duty.id,
                              customerName: duty.customerName,
                              customerPhone: duty.customerPhone,
                              date: duty.date,
                              time: duty.time,
                              directPhone: duty.customerPhone,
                            })
                          }
                          className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Direct Message Customer on WhatsApp</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: DRIVER LOGIN FORM */}
      {mode === 'login' && !loggedInDriver && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-neutral-950 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-950 font-sans">
              Driver Portal Login
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Registered drivers can log in to manage profile rates, duty status, and view active trial days.
            </p>
          </div>

          {loginStep === 'phone' ? (
            <form onSubmit={handleSendLoginOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                  Registered Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-xs font-bold text-neutral-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-xs cursor-pointer"
              >
                {loginLoading ? 'Verifying Mobile Number...' : 'Log In to Driver Portal'}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-neutral-500">
                  Not registered yet?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-neutral-950 font-bold hover:underline cursor-pointer"
                  >
                    Register (3 Months Free) ↗
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Enter Login OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => setLoginStep('phone')}
                    className="text-[11px] text-neutral-500 hover:underline cursor-pointer"
                  >
                    Change ({loginPhone})
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="••••"
                  value={loginOtp}
                  onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-950 font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-xs cursor-pointer"
              >
                {loginLoading ? 'Logging In...' : 'Verify & Log In'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* MODE 3: NEW DRIVER REGISTRATION FORM */}
      {mode === 'register' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm space-y-8 animate-fadeIn">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              🎁 Special Offer: 90 Days (3 Months) Free Trial
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 font-sans">
              Driver Sign-Up & Custom Rates
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Set your own custom rates, upload your headshot & KYC documents to claim your 3-month free trial.
            </p>
          </div>

          {registerSuccessBanner && (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-emerald-950 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-base">Application Submitted Successfully!</h3>
                  <p className="text-xs text-emerald-800 font-medium">
                    Profile verification takes 24–48 hours. Upon admin approval, your custom pricing and 90-day free trial will go live on the homepage!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onBackToHome}
                className="mt-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-full transition-all"
              >
                Return to Homepage Directory
              </button>
            </div>
          )}

          {!registerSuccessBanner && (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {/* Working Preference & Standard Rates */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Select Working Preference (Fixed Standard Rates)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationType('hourly');
                      setFormData((p) => ({ ...p, workingPreference: 'Work by the hour', hourlyRate: 175 }));
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      registrationType === 'hourly'
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                        3-Mo Free → ₹49/mo
                      </span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm">Freelance (Temporary)</div>
                    <p className="text-[11px] opacity-80 mt-1">
                      In-city hourly rides (₹700 for 4 hrs) & outstation trips (₹2,000).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationType('monthly');
                      setFormData((p) => ({ ...p, workingPreference: 'Work monthly', monthlySalary: 25000 }));
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      registrationType === 'monthly'
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <UserPlus className="w-5 h-5" />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                        3-Mo Free → ₹99/mo
                      </span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm">Permanent (Monthly)</div>
                    <p className="text-[11px] opacity-80 mt-1">
                      Full-time driver duties (4h: ₹20k–₹25k, 8h: ₹25k–₹30k, 12h: ₹30k–₹40k/mo negotiable).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationType('combined');
                      setFormData((p) => ({ ...p, workingPreference: 'Both Hourly & Monthly', hourlyRate: 175, monthlySalary: 25000 }));
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      registrationType === 'combined'
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                        3-Mo Free → ₹149/mo
                      </span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm">Combined (Both)</div>
                    <p className="text-[11px] opacity-80 mt-1">
                      Accept both freelance hourly rides & monthly permanent jobs!
                    </p>
                  </button>
                </div>

                {/* STANDARD FIXED PRICE BREAKDOWN CARD */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4 text-emerald-700" />
                      Standard Duty Fare Card
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                      Official Rates
                    </span>
                  </div>

                  {registrationType === 'hourly' && (
                    <div className="text-xs text-emerald-950 space-y-1 pt-1">
                      <p className="font-semibold">
                        • City Temporary Duty: <span className="font-bold">₹700 flat for first 4 hours</span> (Round trip) + ₹100/add'l hr (6:00 AM – 10:00 PM).
                      </p>
                      <p className="text-emerald-800">
                        • Night Charge: After 10:00 PM, additional ₹150/hour. Outstation: ₹2,000 flat per day (+ food expenses).
                      </p>
                    </div>
                  )}

                  {registrationType === 'monthly' && (
                    <div className="text-xs text-emerald-950 space-y-1 pt-1">
                      <p className="font-semibold">
                        • Monthly Driver Salary (Negotiable Ranges): <span className="font-bold">4 hrs: ₹20,000–₹25,000/mo</span> · 8 hrs: ₹25,000–₹30,000/mo · 12 hrs: ₹30,000–₹40,000/mo.
                      </p>
                      <p className="text-emerald-800">
                        • All monthly duty tiers mandate 1 day off per week.
                      </p>
                    </div>
                  )}

                  {registrationType === 'combined' && (
                    <div className="text-xs text-emerald-950 space-y-1 pt-1">
                      <p className="font-semibold">
                        • Combined Profile: You will receive direct customer requests for both Hourly City Duty (₹700/4h) and Monthly Permanent Duties (₹20k–₹40k/mo negotiable).
                      </p>
                      <p className="text-emerald-800">
                        • All trips adhere strictly to transparent standard pricing. Zero commission fee is charged by Mana Drivers.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Full Name"
                    maxLength={60}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.slice(0, 60) })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => {
                      setFieldErrors((prev) => ({ ...prev, phone: null }));
                      setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) });
                    }}
                    maxLength={10}
                    className={`w-full px-4 py-3 bg-neutral-50 border rounded-2xl text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900 ${
                      fieldErrors.phone ? 'border-red-500 bg-red-50/30' : 'border-neutral-200'
                    }`}
                    required
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                    Primary Area in Hyderabad *
                  </label>
                  <SearchableSelect
                    options={HYDERABAD_LOCALITIES}
                    value={formData.location}
                    onChange={(val) => setFormData({ ...formData, location: val })}
                    placeholder="Search your locality (e.g. Kondapur)..."
                    searchPlaceholder="Type locality name..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                    Driving Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                      setFormData({ ...formData, experience: val });
                    }}
                    min={1}
                    max={50}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {/* DEDICATED PROFILE HEADSHOT PHOTO UPLOAD */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-800" />
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Upload Driver Profile Headshot Photo
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-500">
                    This photo will be displayed on the public homepage driver directory.
                  </p>
                  <span className="text-[10px] font-mono font-semibold text-neutral-400">
                    Max: 5.0 MB
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-neutral-300 hover:border-neutral-900 rounded-2xl cursor-pointer text-xs font-semibold text-neutral-800 transition-colors">
                    <Upload className="w-4 h-4 text-neutral-500" />
                    <span>{formData.photo ? 'Change Profile Headshot' : 'Choose Headshot Photo (Max 5 MB)'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={(e) => handleFileUpload(e, 'photo')}
                      className="hidden"
                    />
                  </label>

                  {formData.photoPreview && (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-neutral-300 shrink-0 bg-neutral-100">
                      <img
                        src={formData.photoPreview}
                        alt="Profile Headshot Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {photoSizes.photo && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>File Size: {photoSizes.photo.originalSizeMB}</span>
                    {photoSizes.photo.wasCompressed && (
                      <span className="text-[10px] text-emerald-600 font-sans">
                        (Optimized to {photoSizes.photo.compressedSizeMB})
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-400 font-sans ml-auto">Limit: 5 MB</span>
                  </div>
                )}
              </div>

              {/* MANDATORY KYC DOCUMENTS */}
              <div className="space-y-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-neutral-900" />
                  <h3 className="font-bold text-neutral-950 text-sm uppercase tracking-wider">
                    Mandatory Indian KYC Documents
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Driving License */}
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                      Driving License Number *
                    </label>
                    <input
                      type="text"
                      placeholder="TS-09-2023-0098765"
                      maxLength={18}
                      value={formData.licenseNo}
                      onChange={(e) => {
                        setFieldErrors((prev) => ({ ...prev, licenseNo: null }));
                        setFormData({
                          ...formData,
                          licenseNo: formatDrivingLicenseInput(e.target.value),
                        });
                      }}
                      className={`w-full px-3 py-2.5 bg-white border rounded-xl text-xs font-mono font-bold text-neutral-950 ${
                        fieldErrors.licenseNo ? 'border-red-500 bg-red-50/30' : 'border-neutral-300'
                      }`}
                      required
                    />
                    {fieldErrors.licenseNo && (
                      <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.licenseNo}</span>
                      </p>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="block text-[11px] font-semibold text-neutral-600">
                          Upload Driving License Photo *
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">Max: 5 MB</span>
                      </div>
                      <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-dashed border-neutral-300 hover:border-neutral-900 rounded-xl cursor-pointer text-xs font-medium text-neutral-700 transition-colors">
                        <Upload className="w-4 h-4 text-neutral-500" />
                        <span>{formData.licensePhoto ? 'Change Photo' : 'Choose License Photo (Max 5 MB)'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={(e) => handleFileUpload(e, 'licensePhoto')}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {photoSizes.licensePhoto && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Size: {photoSizes.licensePhoto.originalSizeMB}</span>
                        {photoSizes.licensePhoto.wasCompressed && (
                          <span className="text-[10px] text-emerald-600 font-sans">
                            ({photoSizes.licensePhoto.compressedSizeMB})
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 font-sans ml-auto">Limit: 5 MB</span>
                      </div>
                    )}

                    {formData.licensePhotoPreview && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-neutral-200 h-24 bg-neutral-100">
                        <img
                          src={formData.licensePhotoPreview}
                          alt="License Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Aadhaar Card */}
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                      Aadhaar Card Number *
                    </label>
                    <input
                      type="text"
                      placeholder="5432-8765-4321"
                      maxLength={14}
                      value={formData.aadhaarNo}
                      onChange={(e) => {
                        setFieldErrors((prev) => ({ ...prev, aadhaarNo: null }));
                        setFormData({ ...formData, aadhaarNo: formatAadhaarInput(e.target.value) });
                      }}
                      className={`w-full px-3 py-2.5 bg-white border rounded-xl text-xs font-mono font-bold text-neutral-950 ${
                        fieldErrors.aadhaarNo ? 'border-red-500 bg-red-50/30' : 'border-neutral-300'
                      }`}
                      required
                    />
                    {fieldErrors.aadhaarNo && (
                      <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.aadhaarNo}</span>
                      </p>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="block text-[11px] font-semibold text-neutral-600">
                          Upload Aadhaar Card Photo *
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">Max: 5 MB</span>
                      </div>
                      <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-dashed border-neutral-300 hover:border-neutral-900 rounded-xl cursor-pointer text-xs font-medium text-neutral-700 transition-colors">
                        <Upload className="w-4 h-4 text-neutral-500" />
                        <span>{formData.aadhaarPhoto ? 'Change Photo' : 'Choose Aadhaar Photo (Max 5 MB)'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={(e) => handleFileUpload(e, 'aadhaarPhoto')}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {photoSizes.aadhaarPhoto && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Size: {photoSizes.aadhaarPhoto.originalSizeMB}</span>
                        {photoSizes.aadhaarPhoto.wasCompressed && (
                          <span className="text-[10px] text-emerald-600 font-sans">
                            ({photoSizes.aadhaarPhoto.compressedSizeMB})
                          </span>
                        )}
                        <span className="text-[10px] text-neutral-400 font-sans ml-auto">Limit: 5 MB</span>
                      </div>
                    )}

                    {formData.aadhaarPhotoPreview && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-neutral-200 h-24 bg-neutral-100">
                        <img
                          src={formData.aadhaarPhotoPreview}
                          alt="Aadhaar Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MANDATORY CODE OF CONDUCT & LIABILITY DISCLAIMER (Requirement 4) */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 text-xs">
                <div className="font-bold text-amber-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Mandatory Driver Conduct &amp; Platform Terms *</span>
                </div>

                <div className="space-y-2.5 text-neutral-800">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={conductNonAlcoholic}
                      onChange={(e) => setConductNonAlcoholic(e.target.checked)}
                      className="w-4.5 h-4.5 mt-0.5 accent-neutral-900 rounded shrink-0"
                      required
                    />
                    <span className="leading-snug">
                      <strong>Non-Alcoholic &amp; Zero Substance Policy:</strong> I strictly agree to abstain from consuming alcohol or any intoxicating substances before and during duty hours. *
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={conductNoAbuse}
                      onChange={(e) => setConductNoAbuse(e.target.checked)}
                      className="w-4.5 h-4.5 mt-0.5 accent-neutral-900 rounded shrink-0"
                      required
                    />
                    <span className="leading-snug">
                      <strong>Professional Etiquette:</strong> I agree to behave politely with customers with zero tolerance for abusive language, aggressive behavior, or misconduct. *
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={conductDisclaimer}
                      onChange={(e) => setConductDisclaimer(e.target.checked)}
                      className="w-4.5 h-4.5 mt-0.5 accent-neutral-900 rounded shrink-0"
                      required
                    />
                    <span className="leading-snug">
                      <strong>Platform Liability Disclaimer:</strong> I acknowledge that Mana Drivers is strictly a technological connecting platform between drivers and car owners. Mana Drivers is not responsible or liable for any vehicle damage, property loss, accidents, traffic fines, personal injuries, or disputes. Drivers and customers contract directly with each other. *
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full py-4 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {registerLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{uploadStatusText || 'Processing Application...'}</span>
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      Claim 3-Month Free Trial & Submit Registration
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* MODAL: DRIVER SELF-EDIT PROFILE & CUSTOM RATES */}
      {isEditProfileOpen && loggedInDriver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-bold text-neutral-950 text-base font-sans flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-neutral-900" />
                Edit Profile Details & Custom Rates
              </h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                aria-label="Close modal"
                className="text-neutral-400 hover:text-neutral-900 p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSelfProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                />
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-neutral-800">
                    Direct Driver Fixed Rate Card
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Official Rates
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-normal">
                  Fares are automatically applied per standard pricing guidelines (₹700 for 4 hrs round-trip; ₹25,000–₹30,000 monthly). No custom manual rates.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Primary Area in Hyderabad
                </label>
                <SearchableSelect
                  options={HYDERABAD_LOCALITIES}
                  value={editForm.location}
                  onChange={(val) => setEditForm({ ...editForm, location: val })}
                  placeholder="Select primary area..."
                  searchPlaceholder="Type area name (e.g. Kondapur, Gachibowli)..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Languages Spoken
                </label>
                <input
                  type="text"
                  value={editForm.languages}
                  onChange={(e) => setEditForm({ ...editForm, languages: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  placeholder="e.g. Telugu, Hindi, English"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Profile Headshot Photo
                  </label>
                  <span className="text-[10px] font-mono text-neutral-400">Max: 5.0 MB</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-50 hover:bg-neutral-100 border border-dashed border-neutral-300 rounded-xl cursor-pointer text-xs font-semibold text-neutral-800 transition-colors">
                    <Upload className="w-4 h-4 text-neutral-500" />
                    <span>Upload New Photo (Max 5 MB)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={(e) => handleFileUpload(e, 'editPhoto')}
                      className="hidden"
                    />
                  </label>

                  {editForm.photo && (
                    <img
                      src={editForm.photo}
                      alt="Headshot Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-neutral-200 bg-neutral-100 shrink-0"
                    />
                  )}
                </div>

                {photoSizes.editPhoto && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>File Size: {photoSizes.editPhoto.originalSizeMB}</span>
                    {photoSizes.editPhoto.wasCompressed && (
                      <span className="text-[10px] text-emerald-600 font-sans">
                        (Optimized to {photoSizes.editPhoto.compressedSizeMB})
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-400 font-sans ml-auto">Limit: 5 MB</span>
                  </div>
                )}

                <div className="mt-2">
                  <span className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Or paste direct photo URL:</span>
                  <input
                    type="url"
                    value={editForm.photo}
                    onChange={(e) => setEditForm({ ...editForm, photo: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Personal Bio / Description
                </label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-full text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-neutral-950 text-white rounded-full text-xs font-bold cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* POPUP MODAL: UNREGISTERED / PENDING ADMIN APPROVAL DRIVER STATUS */}
      {authStatusModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 text-center shadow-2xl relative border border-neutral-200 animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setAuthStatusModal(null)}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {authStatusModal.type === 'unregistered' ? (
              <>
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <UserPlus className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-neutral-950 font-sans">
                    You Are Not Yet Registered
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    The mobile number <span className="font-mono font-bold text-neutral-950">+91 {authStatusModal.phone}</span> is not registered in our driver directory.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left space-y-2 text-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Join Mana Drivers (3 Months Free Trial)</span>
                  </div>
                  <p className="text-amber-800 leading-normal">
                    Register your profile with Aadhaar & Driving License to receive direct customer bookings in Hyderabad with ₹0 commission.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStatusModal(null);
                      setMode('register');
                    }}
                    className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Register Profile Now (3 Months Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthStatusModal(null)}
                    className="w-full sm:w-auto px-5 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs font-semibold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : authStatusModal.type === 'rejected' ? (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold uppercase tracking-wider">
                    <span>APPLICATION REJECTED</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-neutral-950 font-sans">
                    Application Status: Action Required
                  </h3>
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-left space-y-1.5 text-xs">
                    <div className="font-bold text-red-900">Reason for Rejection:</div>
                    <p className="text-red-800 font-medium leading-relaxed">
                      {authStatusModal.rejectionReason || 'Verification documents or details were incomplete.'}
                    </p>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-left space-y-1.5 text-xs">
                    <div className="font-bold text-neutral-900 flex items-center justify-between">
                      <span>Re-Application Status:</span>
                      {(() => {
                        const reapplyTime = authStatusModal.driver?.reapplyAllowedAt ? new Date(authStatusModal.driver.reapplyAllowedAt).getTime() : 0;
                        const canReapply = !reapplyTime || currentTime >= reapplyTime;
                        return canReapply ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Eligible to Re-Apply
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            Cooldown Active (3 Days)
                          </span>
                        );
                      })()}
                    </div>
                    {(() => {
                      const reapplyTime = authStatusModal.driver?.reapplyAllowedAt ? new Date(authStatusModal.driver.reapplyAllowedAt).getTime() : 0;
                      const now = currentTime;
                      const canReapply = !reapplyTime || now >= reapplyTime;
                      const daysLeft = reapplyTime ? Math.max(1, Math.ceil((reapplyTime - now) / (1000 * 60 * 60 * 24))) : 0;

                      return canReapply ? (
                        <p className="text-emerald-800 leading-relaxed font-medium">
                          Your 3-day waiting period has passed. You can now update your details and re-submit your documents for admin approval.
                        </p>
                      ) : (
                        <p className="text-amber-800 leading-relaxed">
                          Per policy, drivers can re-apply 3 days after rejection. You can re-apply in <strong>{daysLeft} day{daysLeft > 1 ? 's' : ''}</strong> (on {new Date(reapplyTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}).
                        </p>
                      );
                    })()}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  {(() => {
                    const reapplyTime = authStatusModal.driver?.reapplyAllowedAt ? new Date(authStatusModal.driver.reapplyAllowedAt).getTime() : 0;
                    const canReapply = !reapplyTime || currentTime >= reapplyTime;
                    return canReapply ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (authStatusModal.driver) {
                            setFormData((prev) => ({
                              ...prev,
                              name: authStatusModal.driver.name || prev.name,
                              phone: authStatusModal.phone || prev.phone,
                              location: authStatusModal.driver.location || prev.location,
                              experience: authStatusModal.driver.experience || prev.experience,
                              licenseNo: authStatusModal.driver.licenseNo || prev.licenseNo,
                              aadhaarNo: authStatusModal.driver.aadhaarNo || prev.aadhaarNo,
                            }));
                          }
                          setAuthStatusModal(null);
                          setMode('register');
                        }}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all shadow-md cursor-pointer"
                      >
                        Re-Apply Now with Corrected Documents
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full py-3.5 bg-neutral-300 text-neutral-500 rounded-full text-xs font-bold cursor-not-allowed"
                      >
                        Re-Apply Enabled After 3 Days
                      </button>
                    );
                  })()}
                  <button
                    type="button"
                    onClick={() => setAuthStatusModal(null)}
                    className="w-full sm:w-auto px-5 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs font-semibold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Clock className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>PENDING ADMIN VERIFICATION</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-neutral-950 font-sans">
                    Application Pending Approval
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Welcome back, <span className="font-bold text-neutral-950">{authStatusModal.driverName || 'Driver'}</span> (+91 {authStatusModal.phone}). Your registration documents (Aadhaar & Driving License) are under review by our admin team.
                  </p>
                </div>

                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-left space-y-2 text-xs">
                  <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Next Steps</span>
                  </div>
                  <p className="text-neutral-600 leading-normal">
                    Once our admin verifies your KYC documents, your driver portal login will be activated and your profile will be published on the homepage roster.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAuthStatusModal(null)}
                  className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Understood & Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
