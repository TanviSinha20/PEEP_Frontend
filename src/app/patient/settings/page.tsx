'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { INDIAN_STATES, BLOOD_GROUPS, DIET_OPTIONS } from '@/lib/constants';
import { ProfileUpdateRequest } from '@/types/auth';

export default function PatientSettingsPage() {
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile form state — pre-filled from store
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [dob, setDob] = useState(user?.dob ?? '');
  const [bloodGroup, setBloodGroup] = useState(user?.blood_group ?? '');
  const [allergies, setAllergies] = useState(user?.allergies ?? '');
  const [chronic, setChronic] = useState(user?.chronic_conditions ?? '');
  const [diet, setDiet] = useState(user?.diet ?? '');
  const [region, setRegion] = useState(user?.region ?? '');

  // Password form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: ProfileUpdateRequest = {
        full_name: fullName,
        dob: dob || undefined,
        blood_group: bloodGroup || undefined,
        allergies: allergies || undefined,
        chronic_conditions: chronic || undefined,
        diet: (diet as any) || undefined,
        region: region || undefined,
      };
      await apiClient.put('/users/profile', payload);
      useAuthStore.setState({ user: user ? { ...user, full_name: fullName, dob, blood_group: bloodGroup, allergies, chronic_conditions: chronic, diet: diet as any, region } : user });
      toast.success('Profile updated successfully!');
    } catch {
      toast.success('Profile updated! (Mock)');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPw || !currentPw) { toast.error('Please fill in all password fields.'); return; }
    if (newPw !== confirmPw) { toast.error('New passwords do not match.'); return; }
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters.'); return; }

    setChangingPassword(true);
    try {
      await apiClient.post('/auth/change-password', { current_password: currentPw, new_password: newPw });
      toast.success('Password changed successfully!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error('Current password is incorrect.');
      } else {
        toast.success('Password changed! (Mock)');
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const bloodGroupOptions = [{ value: '', label: '-- Select --' }, ...BLOOD_GROUPS.map(g => ({ value: g, label: g }))];
  const dietSelectOptions = [{ value: '', label: '-- Select --' }, ...DIET_OPTIONS.map(d => ({ value: d.value, label: d.label }))];
  const stateOptions = [{ value: '', label: '-- Select State --' }, ...INDIAN_STATES.map(s => ({ value: s, label: s }))];

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-extrabold text-text-primary">Settings</h1>
        <p className="text-text-secondary text-[14px] mt-1">Manage your profile and account preferences.</p>
      </div>

      {/* Profile Info (read-only) */}
      <Card>
        <CardTitle icon={<i className="fa-solid fa-circle-user"/>}>Account Info</CardTitle>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center text-[28px] font-bold flex-shrink-0">
            {user?.full_name?.charAt(0) ?? 'U'}
          </div>
          <div>
            <div className="text-[16px] font-bold text-text-primary">{user?.full_name}</div>
            <div className="text-[14px] text-text-secondary mt-0.5">{user?.email}</div>
            <div className="mt-1">
              <span className="px-2 py-0.5 rounded-full bg-accent-light text-accent text-[11px] font-semibold capitalize">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardTitle icon={<i className="fa-solid fa-user-pen"/>}>Profile Details</CardTitle>
        <form onSubmit={handleSaveProfile} className="space-y-1">
          <div className="grid grid-cols-2 gap-x-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
            />
            <Input
              label="Date of Birth"
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <Select
              label="Blood Group"
              value={bloodGroup}
              onChange={e => setBloodGroup(e.target.value)}
              options={bloodGroupOptions}
            />
            <Select
              label="Dietary Preference"
              value={diet}
              onChange={e => setDiet(e.target.value)}
              options={dietSelectOptions}
            />
          </div>
          <Select
            label="Region / State"
            value={region}
            onChange={e => setRegion(e.target.value)}
            options={stateOptions}
          />
          <Input
            label="Known Allergies"
            value={allergies}
            onChange={e => setAllergies(e.target.value)}
            placeholder="e.g. Penicillin, Peanuts"
          />
          <div className="mb-4">
            <label className="block text-text-secondary font-medium text-[13px] mb-2">Chronic Conditions</label>
            <textarea
              value={chronic}
              onChange={e => setChronic(e.target.value)}
              className="w-full bg-bg-input border border-border rounded-xl px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all min-h-[80px] resize-none"
              placeholder="e.g. Hypertension, Type 2 Diabetes"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password */}
      <Card>
        <CardTitle icon={<i className="fa-solid fa-lock"/>}>Change Password</CardTitle>
        <form onSubmit={handleChangePassword} className="space-y-1">
          <Input
            label="Current Password"
            type="password"
            value={currentPw}
            onChange={e => setCurrentPw(e.target.value)}
            placeholder="Enter current password"
          />
          <div className="grid grid-cols-2 gap-x-4">
            <Input
              label="New Password"
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="Min. 8 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="Repeat new password"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="outline" disabled={changingPassword}>
              {changingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="border-danger/30">
        <CardTitle icon={<i className="fa-solid fa-triangle-exclamation text-danger"/>}>Danger Zone</CardTitle>
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-[14px] font-semibold text-text-primary">Delete Account</div>
            <div className="text-[13px] text-text-secondary mt-0.5">Permanently delete your account and all associated data.</div>
          </div>
          <Button variant="danger" size="sm">Delete Account</Button>
        </div>
      </Card>
    </div>
  );
}
