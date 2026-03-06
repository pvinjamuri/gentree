'use client';

import { useState } from 'react';
import { useApiStore } from '@/lib/api-store';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TreePine, ArrowRight, ArrowLeft, Loader2, Check, Eye, EyeOff } from 'lucide-react';

type Step = 1 | 2 | 3;

export default function StartPage() {
  const createTree = useApiStore((s) => s.createTree);
  const addMember = useApiStore((s) => s.addMember);

  const [step, setStep] = useState<Step>(1);
  const [familyName, setFamilyName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [yourName, setYourName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [email, setEmail] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!yourName.trim()) { setError('Please enter your name'); return; }
    setLoading(true);
    setError('');

    try {
      const slug = await createTree(familyName, pin, email);
      // Token is already set by createTree
      await addMember({
        name: yourName.trim(),
        gender,
        generation: 0,
      });
      // Full navigation (not router.push) because the catch-all page needs to read the real URL
      window.location.href = `/tree/${slug}`;
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Header />

      <div className="max-w-md mx-auto px-4 py-10">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step > s ? 'bg-indigo-600 text-white' :
                step === s ? 'bg-indigo-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          {/* Step 1: Family Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <TreePine className="h-12 w-12 text-indigo-600 mx-auto mb-3" />
                <h1 className="text-2xl font-bold">Start Your Family Tree</h1>
                <p className="text-gray-500 text-sm mt-1">What should we call your family tree?</p>
              </div>
              <div className="space-y-2">
                <Label>Family Name</Label>
                <Input
                  placeholder="e.g., Sharma Family"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="h-12 text-lg"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Your Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-gray-400">So others can contact you about this tree</p>
              </div>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
                disabled={!familyName.trim()}
                onClick={() => setStep(2)}
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: PIN */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Set an Admin PIN</h1>
                <p className="text-gray-500 text-sm mt-1">
                  This PIN protects editing. Anyone can view, but only people with the PIN can make changes.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>PIN (4-6 digits)</Label>
                  <div className="relative">
                    <Input
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="Enter PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-2xl tracking-widest h-12 pr-10"
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm PIN</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPin ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="Confirm PIN"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-2xl tracking-widest h-12 pr-10"
                    />
                    <button type="button" onClick={() => setShowConfirmPin(!showConfirmPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                {pin.length >= 4 && confirmPin.length >= 4 && pin !== confirmPin && (
                  <p className="text-sm text-red-500 text-center">PINs don&apos;t match</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2"
                  disabled={pin.length < 4 || pin !== confirmPin}
                  onClick={() => setStep(3)}
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: First Member */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Add Yourself</h1>
                <p className="text-gray-500 text-sm mt-1">
                  You&apos;ll be the first member of the {familyName} tree.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input
                    placeholder="Full name"
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    className="h-12"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['male', 'female', 'other'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                          gender === g
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2"
                  disabled={loading || !yourName.trim()}
                  onClick={handleCreate}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TreePine className="h-4 w-4" />}
                  Create Tree
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
