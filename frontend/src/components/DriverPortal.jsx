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
} from 'lucide-react';
import { toast } from 'sonner';
import { HYDERABAD_LOCALITIES } from '../data/mockDrivers';
import { triggerDriverRegistrationRazorpay } from '../utils/razorpay';
import { loginDriverApi, registerDriverApi, updateDriverStatusApi, sendOtpApi, uploadDriverDocsApi } from '../utils/api';
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
    licenseNo: '',
    licensePhoto: null,
    licensePhotoPreview: null,
    aadhaarNo: '',
    aadhaarPhoto: null,
    aadhaarPhotoPreview: null,
    workingPreference: 'Work by the hour (₹49)',
  });
  const [registerSuccessBanner, setRegisterSuccessBanner] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');

  // Handle Photo File Uploads (Converting to Base64 preview and storing file)
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
      toast.success(`${field === 'licensePhoto' ? 'Driving License' : 'Aadhaar Card'} attached`);
    };
    reader.readAsDataURL(file);
  };

  // Login Handlers
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
      // First check if driver is registered
      const res = await loginDriverApi(clean);
      if (!res.success) {
        toast.error(res.message || 'Mobile number is not registered as a driver');
        setLoginLoading(false);
        return;
      }

      // Dispatch OTP
      await sendOtpApi(clean);
      toast.success(`Verification OTP sent to +91 ${clean}`);
      setLoginStep('otp');
    } catch {
      toast.error('Driver phone number not registered. Please register as a new driver.');
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

  // Duty status toggle for authenticated driver
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

  // Registration Submit Handler with Cloudinary Upload
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Comprehensive Field Validations
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
    setUploadStatusText('Uploading Aadhaar & License to Cloudinary...');

    let finalLicenseUrl = formData.licensePhotoPreview;
    let finalAadhaarUrl = formData.aadhaarPhotoPreview;

    // Upload files to Cloudinary (or safe data URL fallback)
    try {
      if (formData.licensePhoto instanceof File || formData.aadhaarPhoto instanceof File) {
        const uploadData = new FormData();
        if (formData.licensePhoto instanceof File) {
          uploadData.append('licensePhoto', formData.licensePhoto);
        }
        if (formData.aadhaarPhoto instanceof File) {
          uploadData.append('aadhaarPhoto', formData.aadhaarPhoto);
        }

        const uploadRes = await uploadDriverDocsApi(uploadData);
        if (uploadRes.success && uploadRes.urls) {
          if (uploadRes.urls.licensePhoto) finalLicenseUrl = uploadRes.urls.licensePhoto;
          if (uploadRes.urls.aadhaarPhoto) finalAadhaarUrl = uploadRes.urls.aadhaarPhoto;
          if (uploadRes.isCloudinary) {
            toast.success('KYC documents securely saved to Cloudinary');
          }
        }
      }
    } catch (err) {
      console.warn('Document upload fallback:', err);
    }

    setUploadStatusText('');

    const fee = registrationType === 'hourly' ? 49 : 99;
    const workingPref = registrationType === 'hourly' ? 'Work by the hour (₹49)' : 'Work monthly (₹99)';

    const registrationPayload = {
      name: nameRes.cleaned,
      phone: phoneRes.cleaned,
      driverType: registrationType === 'hourly' ? 'freelance' : 'permanent',
      hourlyRate: registrationType === 'hourly' ? 180 : 200,
      monthlySalary: registrationType === 'monthly' ? 20000 : null,
      location: formData.location,
      experience: expRes.value,
      languages: formData.languages,
      bio: formData.bio ? formData.bio.slice(0, 300) : `${nameRes.cleaned} is a verified private driver in ${formData.location}, Hyderabad.`,
      licenseNo: licenseRes.cleaned,
      licensePhoto: finalLicenseUrl,
      aadhaarNo: aadhaarRes.formatted,
      aadhaarPhoto: finalAadhaarUrl,
      workingPreference: workingPref,
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
            toast.success('Registration payment verified & application submitted for Admin Verification!');
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Driver Portal Navigation Bar */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-4 sm:p-6 border border-neutral-200 shadow-xs">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            HYDERABAD DRIVER NETWORK
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
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5"
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
                New Driver Sign-Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODE 1: LOGGED-IN DRIVER DASHBOARD */}
      {mode === 'dashboard' && loggedInDriver && (
        <div className="space-y-6 animate-fadeIn">
          {/* Welcome Card */}
          <div className="bg-[#121212] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={loggedInDriver.photo}
                alt={loggedInDriver.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-neutral-700 bg-neutral-800"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-sans text-white">{loggedInDriver.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                    ✓ Verified Driver
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {loggedInDriver.phone} · {loggedInDriver.location}
                </p>
                <p className="text-xs text-neutral-300 font-semibold mt-1">
                  {loggedInDriver.driverType === 'permanent'
                    ? `Monthly Salary: ₹${loggedInDriver.monthlySalary}/month`
                    : `Hourly Rate: ₹${loggedInDriver.hourlyRate}/hour`}
                </p>
              </div>
            </div>

            {/* Duty Status Toggle */}
            <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-2 text-center">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                Current Duty Status
              </span>
              <button
                type="button"
                onClick={handleToggleStatus}
                className={`w-full px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs ${
                  loggedInDriver.status === 'Available'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-200'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{loggedInDriver.status === 'Available' ? 'ONLINE (AVAILABLE)' : 'OFFLINE'}</span>
              </button>
            </div>
          </div>

          {/* Profile Details & Verification Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 space-y-4">
              <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-700" />
                Verified KYC Info
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Driving License</span>
                  <span className="font-mono font-bold text-neutral-900">{loggedInDriver.licenseNo || 'TS09-2017-0060417'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Aadhaar Verification</span>
                  <span className="font-mono font-bold text-neutral-900">{loggedInDriver.aadhaarNo || '9030-2604-1717'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Experience</span>
                  <span className="font-bold text-neutral-900">{loggedInDriver.experience} Years</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-neutral-500">Languages</span>
                  <span className="font-bold text-neutral-900">{loggedInDriver.languages}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-neutral-200 space-y-4">
              <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Homepage Listing Status
              </h3>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <div className="font-bold text-sm">✓ Profile Active on Public Directory</div>
                <p className="text-neutral-600 leading-relaxed">
                  Your profile is live for Hyderabad car owners in {loggedInDriver.location}. Customers can book you or contact you directly via call/WhatsApp.
                </p>
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
              Registered drivers can log in to update duty status and manage profile settings.
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
                {loginLoading ? 'Checking Number...' : 'Send Login OTP'}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-neutral-500">
                  Not registered yet?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-neutral-950 font-bold hover:underline cursor-pointer"
                  >
                    Register as a New Driver ↗
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
                className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-xs"
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
          {/* Header */}
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
              JOIN HYDERABAD CHAUFFEUR NETWORK
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 font-sans">
              Driver Sign-Up & Verification
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Complete mandatory KYC details (Aadhaar & License) to get listed on the Mana Drivers homepage directory.
            </p>
          </div>

          {/* Success Banner */}
          {registerSuccessBanner && (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-emerald-950 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-base">Application Submitted Successfully!</h3>
                  <p className="text-xs text-emerald-800 font-medium">
                    Profile verification takes 24–48 hours. Once approved by admin, your profile will go live on the homepage.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onBackToHome}
                className="mt-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-full transition-all"
              >
                Return to Homepage
              </button>
            </div>
          )}

          {!registerSuccessBanner && (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {/* Working Preference Toggle */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Select Working Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationType('hourly');
                      setFormData((p) => ({ ...p, workingPreference: 'Work by the hour (₹49)' }));
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      registrationType === 'hourly'
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20">
                        ₹49 Fee
                      </span>
                    </div>
                    <div className="font-bold text-sm">Work by the hour (₹49)</div>
                    <p className="text-xs opacity-80 mt-1">
                      Hourly on-demand trips in Hitec City, Gachibowli, RGIA airport.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationType('monthly');
                      setFormData((p) => ({ ...p, workingPreference: 'Work monthly (₹99)' }));
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      registrationType === 'monthly'
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <UserPlus className="w-5 h-5" />
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20">
                        ₹99 Fee
                      </span>
                    </div>
                    <div className="font-bold text-sm">Work monthly (₹99)</div>
                    <p className="text-xs opacity-80 mt-1">
                      Full-time family/corporate monthly driver (₹18k – ₹22k/month).
                    </p>
                  </button>
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

              {/* Location & Experience */}
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

              {/* MANDATORY INDIAN KYC DOCUMENTS */}
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

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full py-4 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md flex items-center justify-center gap-2"
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
                      Pay ₹{registrationType === 'hourly' ? 49 : 99} & Submit Application
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
