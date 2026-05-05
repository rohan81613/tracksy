import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiRefresh, HiEye, HiEyeOff, HiMail, HiLockClosed, HiUser, HiOfficeBuilding } from 'react-icons/hi';

export default function Signup({ onSwitch }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', company: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await signup(form.name.trim(), form.email.trim(), form.password, form.company.trim());
    } catch (err) {
      setServerError(err.message ?? 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 6) return { label: 'Too short', color: 'bg-red-400', width: 'w-1/4' };
    if (pwd.length < 8) return { label: 'Weak', color: 'bg-amber-400', width: 'w-2/4' };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
    return { label: 'Fair', color: 'bg-blue-400', width: 'w-3/4' };
  };

  const strength = passwordStrength(form.password);

  const fields = [
    { name: 'name', label: 'Full name', type: 'text', placeholder: 'John Doe', icon: HiUser, autoComplete: 'name' },
    { name: 'email', label: 'Email address', type: 'email', placeholder: 'you@company.com', icon: HiMail, autoComplete: 'email' },
    { name: 'company', label: 'Company (optional)', type: 'text', placeholder: 'Acme Corp', icon: HiOfficeBuilding, autoComplete: 'organization' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
            <HiRefresh className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tracksy</h1>
          <p className="text-sm text-gray-500 mt-1">Renewal Management Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Create your account</h2>
            <p className="text-sm text-gray-500 mt-0.5">Start managing your renewals in minutes</p>
          </div>

          {serverError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Text fields */}
            {fields.map(({ name, label, type, placeholder, icon: Icon, autoComplete }) => (
              <div key={name} className="flex flex-col gap-1">
                <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    id={name}
                    name={name}
                    type={type}
                    autoComplete={autoComplete}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                </div>
                {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
              </div>
            ))}

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {strength && (
                <div className="mt-1 space-y-1">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className={`text-xs ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 shadow-sm mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account...
                </>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        {/* Switch to login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <button
            onClick={onSwitch}
            className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
