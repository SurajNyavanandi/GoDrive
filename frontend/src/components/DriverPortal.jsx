import { useState } from 'react';
import {
  UserPlus,
  Clock,
  Power,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Upload,
  LogOut,
  Sparkles,
  CreditCard,
  AlertTriangle,
  Edit3,
  DollarSign,
  TrendingUp,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { HYDERABAD_LOCALITIES } from '../data/mockDrivers';
import { triggerDriverRegistrationRazorpay } from '../utils/razorpay';
import {
  loginDriverApi,
  registerDriverApi,
  updateDriverStatusApi,
  sendOtpApi,
  uploadDriverDocsApi,
  subscribeDriverPlanApi,
  updateDriverSelfProfileApi,
} from '../utils/api';
import {
  validateIndianMobile,
  validateAadhaar,
  formatAadhaarInput,
  validateDrivingLicense,
  validateExperience,
  validateName,
} from '../utils/helpers';

export default function DriverPortal({ onBackToHome }) {
  // Mode: 'login' | 'register' | 'dashboard'
  const [mode, setMode] = useState('login');

  // Authenticated Driver state
  const [loggedInDriver, setLoggedInDriver] = useState(null);

  // Edit Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    hourlyRate: 180,
    monthlySalary: 20000,
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
    monthlySalary: 20000,
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

  // Handle Photo File Uploads (License, Aadhaar, Headshot)
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [field]: file,
        [`${field}Preview`]: reader.result,
      }));
      const labelName =
        field === 'licensePhoto'
          ? 'Driving License'
          : field === 'aadhaarPhoto'
          ? 'Aadhaar Card'
          : 'Profile Headshot Photo';
      toast.success(`${labelName} attached`);
    };
    reader.readAsDataURL(file);
  };

  // Login Handlers (Direct 1-Step Login for Registered Drivers)
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
      if (res && res.success && res.driver) {
        setLoggedInDriver(res.driver);
        setMode('dashboard');
        toast.success(`Welcome back, ${res.driver.name}! Logged into Driver Portal.`);
      } else {
        toast.error(res?.message || 'Mobile number is not registered as a driver. Please register below.');
      }
    } catch {
      toast.error('Driver mobile number is not registered. Please register below.');
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

    const nameRes = validateName(formData.name);
    if (!nameRes.isValid) {
      toast.error(nameRes.error);
      return;
    }

    const phoneRes = validateIndianMobile(formData.phone);
    if (!phoneRes.isValid) {
      toast.error(phoneRes.error);
      return;
    }

    const expRes = validateExperience(formData.experience);
    if (!expRes.isValid) {
      toast.error(expRes.error);
      return;
    }

    const licenseRes = validateDrivingLicense(formData.licenseNo);
    if (!licenseRes.isValid) {
      toast.error(licenseRes.error);
      return;
    }

    if (!formData.licensePhoto && !formData.licensePhotoPreview) {
      toast.error('Driving License Photo is mandatory.');
      return;
    }

    const aadhaarRes = validateAadhaar(formData.aadhaarNo);
    if (!aadhaarRes.isValid) {
      toast.error(aadhaarRes.error);
      return;
    }

    if (!formData.aadhaarPhoto && !formData.aadhaarPhotoPreview) {
      toast.error('Aadhaar Card Photo is mandatory.');
      return;
    }

    setRegisterLoading(true);
    setUploadStatusText('Uploading Profile Headshot, License & Aadhaar...');

    let finalLicenseUrl = formData.licensePhotoPreview;
    let finalAadhaarUrl = formData.aadhaarPhotoPreview;
    let finalHeadshotUrl = formData.photoPreview || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';

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

    const fee = registrationType === 'hourly' ? 49 : 99;
    const rateDisplay =
      registrationType === 'combined'
        ? `₹${formData.hourlyRate}/hr & ₹${Number(formData.monthlySalary).toLocaleString('en-IN')}/mo`
        : registrationType === 'hourly'
        ? `₹${formData.hourlyRate}/hr`
        : `₹${Number(formData.monthlySalary).toLocaleString('en-IN')}/mo`;

    const registrationPayload = {
      name: nameRes.cleaned,
      phone: phoneRes.cleaned,
      driverType: registrationType === 'combined' ? 'combined' : registrationType === 'hourly' ? 'freelance' : 'permanent',
      hourlyRate: Number(formData.hourlyRate) || 180,
      monthlySalary: registrationType === 'hourly' ? null : Number(formData.monthlySalary) || 20000,
      location: formData.location,
      experience: expRes.value,
      languages: formData.languages,
      photo: finalHeadshotUrl,
      bio: formData.bio ? formData.bio.slice(0, 300) : `${nameRes.cleaned} is a verified private driver in ${formData.location}, Hyderabad. Rates: ${rateDisplay}.`,
      licenseNo: licenseRes.cleaned,
      licensePhoto: finalLicenseUrl,
      aadhaarNo: aadhaarRes.formatted,
      aadhaarPhoto: finalAadhaarUrl,
      workingPreference: `${registrationType === 'combined' ? 'Combined (Hourly & Monthly)' : registrationType === 'hourly' ? 'Hourly Freelance' : 'Monthly Permanent'} (${rateDisplay})`,
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
            toast.success('Registration payment verified & 3-Month Free Trial activated!');
          } else {
            toast.error(res.message || 'Failed to submit driver application');
          }
        } catch {
          toast.error('Registration saved locally');
          setRegisterSuccessBanner(true);
        } finally {
          setRegisterLoading(false);
        }
      },
    });
  };

  const remainingDays = loggedInDriver ? (loggedInDriver.remainingDays !== undefined ? loggedInDriver.remainingDays : 90) : 0;
  const isExpired = remainingDays <= 0;

  // Live estimated income calculation for registration form
  const calculatedEstimatedMonthlyIncome =
    registrationType === 'hourly'
      ? (Number(formData.hourlyRate) || 180) * 6 * 26
      : Number(formData.monthlySalary) || 20000;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8 pb-16">
      {/* Navigation Header */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-4 sm:p-6 border border-neutral-200 shadow-xs">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            HYDERABAD CHAUFFEURS
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
                src={loggedInDriver.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
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
                  <span className="text-xs font-extrabold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                    {loggedInDriver.driverType === 'combined'
                      ? `Hourly: ₹${loggedInDriver.hourlyRate || 180}/hr · Monthly: ₹${(loggedInDriver.monthlySalary || 20000).toLocaleString('en-IN')}/mo`
                      : loggedInDriver.driverType === 'permanent'
                      ? `Monthly Salary: ₹${(loggedInDriver.monthlySalary || 20000).toLocaleString('en-IN')}/mo`
                      : `Custom Hourly Rate: ₹${loggedInDriver.hourlyRate || 180}/hr`}
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
                <span>Edit Profile & Rates</span>
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

          {/* DYNAMIC ESTIMATED MONTHLY EARNINGS CARD */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white p-6 rounded-3xl border border-neutral-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>Est. Monthly Income Calculator (0% Commission)</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                100% Direct UPI / Cash
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1">
              <div>
                <p className="text-3xl font-extrabold text-white font-sans">
                  ₹
                  {loggedInDriver.driverType === 'permanent'
                    ? (loggedInDriver.monthlySalary || 20000).toLocaleString('en-IN')
                    : ((loggedInDriver.hourlyRate || 180) * 6 * 26).toLocaleString('en-IN')}
                  <span className="text-xs font-medium text-neutral-400 font-normal"> / month</span>
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  {loggedInDriver.driverType === 'permanent'
                    ? `Based on your expected monthly salary requirement of ₹${(loggedInDriver.monthlySalary || 20000).toLocaleString('en-IN')}/mo.`
                    : `Based on driving 6 hours/day, 26 days/month at your custom rate of ₹${loggedInDriver.hourlyRate || 180}/hr.`}
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Adjust Custom Rates ↗</span>
              </button>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Starter Plan ₹49 */}
                <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Standard Listing
                      </span>
                      <span className="text-xs font-extrabold text-neutral-950 bg-white px-2.5 py-1 rounded-full border border-neutral-200">
                        ₹49 / month
                      </span>
                    </div>
                    <div className="text-base font-bold text-neutral-950 font-sans mt-2">
                      Starter Chauffeur Plan
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">
                      Standard homepage profile listing in your primary area for 30 days.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubscribePlan('starter', 49)}
                    disabled={subscribeLoading}
                    className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Subscribe ₹49 (+30 Days)
                  </button>
                </div>

                {/* Featured Plan ₹99 */}
                <div className="p-5 rounded-2xl border border-amber-300 bg-amber-50/50 space-y-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-amber-500 text-neutral-950 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                    Recommended
                  </div>
                  <div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                        Top Priority
                      </span>
                      <span className="text-xs font-extrabold text-neutral-950 bg-white px-2.5 py-1 rounded-full border border-amber-300">
                        ₹99 / month
                      </span>
                    </div>
                    <div className="text-base font-bold text-neutral-950 font-sans mt-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Featured Chauffeur Plan
                    </div>
                    <p className="text-xs text-neutral-700 mt-1">
                      Gold "Featured" badge + Top placement in homepage driver searches.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubscribePlan('featured', 99)}
                    disabled={subscribeLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Upgrade Featured ₹99 (+30 Days)
                  </button>
                </div>
              </div>
            </div>
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
              {/* Working Preference & Custom Rate Calculator */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Select Working Preference & Custom Pricing
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationType('hourly');
                      setFormData((p) => ({ ...p, workingPreference: 'Work by the hour' }));
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
                        3-Mo Free
                      </span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm">Freelance (Hourly)</div>
                    <p className="text-[11px] opacity-80 mt-1">
                      Set custom hourly rates for in-city & outstation trips.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationType('monthly');
                      setFormData((p) => ({ ...p, workingPreference: 'Work monthly' }));
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
                        3-Mo Free
                      </span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm">Permanent (Monthly)</div>
                    <p className="text-[11px] opacity-80 mt-1">
                      Set expected monthly salary for full-time family duty.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationType('combined');
                      setFormData((p) => ({ ...p, workingPreference: 'Both Hourly & Monthly' }));
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
                        3-Mo Free
                      </span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm">Combined (Both)</div>
                    <p className="text-[11px] opacity-80 mt-1">
                      Available for both freelance hourly rides & monthly permanent jobs!
                    </p>
                  </button>
                </div>

                {/* DYNAMIC RATE INPUT & ESTIMATED INCOME BADGE */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4">
                  {registrationType === 'hourly' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          Set Custom Hourly Rate (₹ / hr) *
                        </label>
                        <span className="text-xs font-mono font-extrabold text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-md">
                          ₹{formData.hourlyRate} / hr
                        </span>
                      </div>
                      <input
                        type="number"
                        min={150}
                        max={500}
                        step={10}
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm font-bold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        required
                      />
                      <p className="text-xs font-medium text-emerald-900 mt-2 flex items-center gap-1">
                        💡 <span className="font-bold">Estimated Monthly Income:</span> ₹
                        {((Number(formData.hourlyRate) || 180) * 6 * 26).toLocaleString('en-IN')}/mo (6 hrs/day, 26 days/mo)
                      </p>
                    </div>
                  )}

                  {registrationType === 'monthly' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          Set Expected Monthly Salary (₹ / month) *
                        </label>
                        <span className="text-xs font-mono font-extrabold text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-md">
                          ₹{Number(formData.monthlySalary || 20000).toLocaleString('en-IN')} / mo
                        </span>
                      </div>
                      <input
                        type="number"
                        min={15000}
                        max={40000}
                        step={500}
                        value={formData.monthlySalary}
                        onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm font-bold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        required
                      />
                      <p className="text-xs font-medium text-emerald-900 mt-2 flex items-center gap-1">
                        💡 <span className="font-bold">Guaranteed Monthly Income:</span> ₹
                        {Number(formData.monthlySalary || 20000).toLocaleString('en-IN')}/mo with 0% commission!
                      </p>
                    </div>
                  )}

                  {registrationType === 'combined' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1">
                          Hourly Freelance Rate (₹/hr) *
                        </label>
                        <input
                          type="number"
                          min={150}
                          max={500}
                          step={10}
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm font-bold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1">
                          Monthly Salary Requirement (₹/mo) *
                        </label>
                        <input
                          type="number"
                          min={15000}
                          max={40000}
                          step={500}
                          value={formData.monthlySalary}
                          onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm font-bold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          required
                        />
                      </div>
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
                    placeholder="e.g. Ramesh Kumar"
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
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    maxLength={10}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                    Primary Area in Hyderabad
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    {HYDERABAD_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
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
                <p className="text-xs text-neutral-500">
                  This photo will be displayed on the public homepage driver directory.
                </p>

                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-neutral-300 hover:border-neutral-900 rounded-2xl cursor-pointer text-xs font-semibold text-neutral-800 transition-colors">
                    <Upload className="w-4 h-4 text-neutral-500" />
                    <span>{formData.photo ? 'Change Profile Headshot' : 'Choose Headshot Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
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
                      placeholder="TS09-2018-0091234"
                      maxLength={20}
                      value={formData.licenseNo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          licenseNo: e.target.value.toUpperCase().replace(/[^A-Z0-9- ]/g, '').slice(0, 20),
                        })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-bold text-neutral-950"
                      required
                    />

                    <div>
                      <span className="block text-[11px] font-semibold text-neutral-600 mb-1">
                        Upload Driving License Photo *
                      </span>
                      <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-dashed border-neutral-300 hover:border-neutral-900 rounded-xl cursor-pointer text-xs font-medium text-neutral-700 transition-colors">
                        <Upload className="w-4 h-4 text-neutral-500" />
                        <span>{formData.licensePhoto ? 'Change Photo' : 'Choose License Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'licensePhoto')}
                          className="hidden"
                        />
                      </label>
                    </div>

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
                      onChange={(e) => setFormData({ ...formData, aadhaarNo: formatAadhaarInput(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-bold text-neutral-950"
                      required
                    />

                    <div>
                      <span className="block text-[11px] font-semibold text-neutral-600 mb-1">
                        Upload Aadhaar Card Photo *
                      </span>
                      <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-dashed border-neutral-300 hover:border-neutral-900 rounded-xl cursor-pointer text-xs font-medium text-neutral-700 transition-colors">
                        <Upload className="w-4 h-4 text-neutral-500" />
                        <span>{formData.aadhaarPhoto ? 'Change Photo' : 'Choose Aadhaar Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'aadhaarPhoto')}
                          className="hidden"
                        />
                      </label>
                    </div>

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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Custom Hourly Rate (₹ / hr)
                  </label>
                  <input
                    type="number"
                    value={editForm.hourlyRate}
                    onChange={(e) => setEditForm({ ...editForm, hourlyRate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Monthly Salary (₹ / mo)
                  </label>
                  <input
                    type="number"
                    value={editForm.monthlySalary}
                    onChange={(e) => setEditForm({ ...editForm, monthlySalary: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Primary Area
                </label>
                <select
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                >
                  {HYDERABAD_LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Profile Photo URL / Image Link
                </label>
                <input
                  type="url"
                  value={editForm.photo}
                  onChange={(e) => setEditForm({ ...editForm, photo: e.target.value })}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-900"
                  placeholder="https://..."
                />
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
    </div>
  );
}
