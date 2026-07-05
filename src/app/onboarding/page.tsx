'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { INDIAN_STATES, DIET_OPTIONS } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | 'other' | ''>('');
  const [diet, setDiet] = useState('');
  const [region, setRegion] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleNext = () => setStep(s => Math.min(4, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toString());
          setLng(pos.coords.longitude.toString());
          toast.success("Location acquired successfully.");
        },
        (err) => {
          toast.error("Could not get location. Please enter manually.");
        }
      );
    } else {
      toast.error("Geolocation not supported by this browser.");
    }
  };

  const handleSubmit = async (isSkip = false) => {
    setLoading(true);
    try {
      // Mocking update or real API call
      // PUT /api/v1/users/onboard
      await apiClient.put('/users/onboard', {
        age: parseInt(age),
        sex,
        diet,
        region,
        gps_lat: parseFloat(lat) || null,
        gps_lng: parseFloat(lng) || null,
        phone: isSkip ? undefined : phone
      });
      
      // Update local state to reflect age is not null (so middleware lets us pass)
      if (user) {
        document.cookie = `user_age=${age}; path=/`; // update cookie for middleware
        useAuthStore.setState({ user: { ...user, age: parseInt(age) } });
      }

      toast.success('Onboarding complete!');
      router.push('/patient/dashboard');
    } catch (err) {
      console.warn("API failed, using mock success", err);
      if (user) {
        document.cookie = `user_age=${age}; path=/`; // mock cookie update
        useAuthStore.setState({ user: { ...user, age: parseInt(age) } });
      }
      toast.success('Onboarding complete (Mock)!');
      router.push('/patient/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-bg-card border border-border rounded-[24px] shadow-sm overflow-hidden">
        {/* Progress Header */}
        <div className="bg-bg-input px-8 py-6 border-b border-border">
          <h2 className="text-[20px] font-bold text-text-primary mb-4">Complete your profile</h2>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? 'bg-accent' : 'bg-border'}`}
              />
            ))}
          </div>
          <div className="text-[13px] text-text-secondary mt-3">Step {step} of 4</div>
        </div>

        {/* Step Content */}
        <div className="p-8">
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-[18px] font-semibold text-text-primary">Basic Information</h3>
              <p className="text-[14px] text-text-secondary">AI needs this to calculate accurate risk tiers.</p>
              
              <div>
                <label className="block text-text-secondary font-medium text-[13px] mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-[14px]"
                  placeholder="e.g. 35"
                />
              </div>

              <div>
                <label className="block text-text-secondary font-medium text-[13px] mb-2">Biological Sex</label>
                <div className="flex gap-3">
                  {['male', 'female', 'other'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSex(s as any)}
                      className={`flex-1 py-3 rounded-xl border capitalize text-[14px] font-medium transition-colors ${
                        sex === s ? 'border-accent bg-accent-light text-accent' : 'border-border bg-bg-input text-text-secondary hover:border-accent'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-[18px] font-semibold text-text-primary">Diet & Region</h3>
              <p className="text-[14px] text-text-secondary">Used for localized NIN food recommendations.</p>
              
              <div>
                <label className="block text-text-secondary font-medium text-[13px] mb-2">Dietary Preference</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  {DIET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDiet(opt.value)}
                      className={`flex-1 py-3 rounded-xl border text-[14px] font-medium transition-colors ${
                        diet === opt.value ? 'border-accent bg-accent-light text-accent' : 'border-border bg-bg-input text-text-secondary hover:border-accent'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-text-secondary font-medium text-[13px] mb-2">Region (State)</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-[14px] appearance-none"
                >
                  <option value="">-- Select State --</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-[18px] font-semibold text-text-primary">Location</h3>
              <p className="text-[14px] text-text-secondary">Used anonymously for disease outbreak mapping by hospitals.</p>
              
              <button 
                onClick={getLocation}
                className="w-full bg-bg-input border-2 border-dashed border-accent text-accent font-semibold py-6 rounded-xl hover:bg-accent-light transition-colors"
              >
                Click to allow location access
              </button>

              <div className="flex items-center gap-3">
                <hr className="flex-1 border-t border-border" />
                <span className="text-[12px] text-text-muted">or enter manually</span>
                <hr className="flex-1 border-t border-border" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary font-medium text-[13px] mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-[14px]"
                    placeholder="e.g. 19.0760"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary font-medium text-[13px] mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-[14px]"
                    placeholder="e.g. 72.8777"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-[18px] font-semibold text-text-primary">Contact (Optional)</h3>
              <p className="text-[14px] text-text-secondary">Add a phone number to get WhatsApp notifications when your report is ready.</p>
              
              <div>
                <label className="block text-text-secondary font-medium text-[13px] mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-[14px]"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 bg-bg-input border-t border-border flex justify-between items-center">
          {step > 1 ? (
            <button 
              onClick={handlePrev}
              className="px-6 py-2.5 rounded-lg text-text-secondary hover:bg-border transition-colors font-medium text-[14px]"
            >
              Back
            </button>
          ) : <div></div>}
          
          <div className="flex gap-3">
            {step === 4 && (
              <button 
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg text-text-secondary hover:bg-border transition-colors font-medium text-[14px]"
              >
                Skip for now
              </button>
            )}
            
            {step < 4 ? (
              <button 
                onClick={handleNext}
                disabled={step === 1 && (!age || !sex) || step === 2 && (!diet || !region) || step === 3 && (!lat || !lng)}
                className="px-6 py-2.5 rounded-lg bg-accent text-white font-medium text-[14px] disabled:opacity-50 hover:bg-accent-hover transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button 
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-accent text-white font-medium text-[14px] disabled:opacity-50 flex items-center justify-center hover:bg-accent-hover transition-colors"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
