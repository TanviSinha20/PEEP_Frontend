'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { MealPlan, MealDay, ShoppingList } from '@/types/meal';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { MealDayCard } from '@/components/shared/MealDayCard';
import toast from 'react-hot-toast';

const MOCK_MEAL_PLAN: MealPlan = {
  generated_from_report_id: 'r1',
  created_at: new Date().toISOString(),
  days: [1, 2, 3, 4, 5, 6, 7].map(day => ({
    day,
    completed: day < 3,
    breakfast: [
      { name: 'Oats with berries', portion: '1 bowl', calories: 280 },
      { name: 'Boiled egg', portion: '2 eggs', calories: 140 },
      { name: 'Green tea', portion: '1 cup', calories: 5 },
    ],
    lunch: [
      { name: 'Brown rice', portion: '1 cup cooked', calories: 215 },
      { name: 'Dal (lentils)', portion: '1 cup', calories: 230 },
      { name: 'Mixed vegetable sabji', portion: '1 cup', calories: 120 },
      { name: 'Curd', portion: '100g', calories: 60 },
    ],
    snack: [
      { name: 'Mixed nuts', portion: '30g', calories: 180 },
      { name: 'Banana', portion: '1 medium', calories: 90 },
    ],
    dinner: [
      { name: 'Chapati (whole wheat)', portion: '2 rotis', calories: 200 },
      { name: 'Paneer bhurji', portion: '150g', calories: 270 },
      { name: 'Cucumber raita', portion: '100g', calories: 45 },
    ],
  })),
};

const MOCK_SHOPPING_LIST: ShoppingList = {
  items: [
    { name: 'Rolled Oats', quantity: '500g', category: 'Grains' },
    { name: 'Brown Rice', quantity: '1 kg', category: 'Grains' },
    { name: 'Whole Wheat Flour', quantity: '1 kg', category: 'Grains' },
    { name: 'Moong Dal', quantity: '500g', category: 'Protein' },
    { name: 'Paneer', quantity: '400g', category: 'Protein' },
    { name: 'Eggs', quantity: '1 dozen', category: 'Protein' },
    { name: 'Mixed Nuts (almonds, walnuts)', quantity: '200g', category: 'Healthy Fats' },
    { name: 'Olive Oil', quantity: '500ml', category: 'Healthy Fats' },
    { name: 'Spinach', quantity: '500g', category: 'Vegetables' },
    { name: 'Broccoli', quantity: '1 head', category: 'Vegetables' },
    { name: 'Cucumber', quantity: '4 pcs', category: 'Vegetables' },
    { name: 'Bananas', quantity: '6 pcs', category: 'Fruits' },
    { name: 'Berries (mixed)', quantity: '200g', category: 'Fruits' },
    { name: 'Greek Yogurt', quantity: '500g', category: 'Dairy' },
    { name: 'Vitamin D supplement', quantity: '1 bottle', category: 'Supplements' },
    { name: 'Omega-3 capsules', quantity: '1 bottle', category: 'Supplements' },
  ],
};

export default function DietPlanPage() {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [shopping, setShopping] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [activeTab, setActiveTab] = useState<'plan' | 'shopping'>('plan');

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    try {
      const [planRes, shopRes] = await Promise.all([
        apiClient.get<MealPlan>('/meal-plan'),
        apiClient.get<ShoppingList>('/meal-plan/shopping-list'),
      ]);
      setPlan(planRes.data);
      setShopping(shopRes.data);
    } catch {
      setPlan(MOCK_MEAL_PLAN);
      setShopping(MOCK_SHOPPING_LIST);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const handleToggleDay = async (day: number, completed: boolean) => {
    if (!plan) return;
    const updated = { ...plan, days: plan.days.map(d => d.day === day ? { ...d, completed } : d) };
    setPlan(updated);
    try {
      await apiClient.patch(`/meal-plan/day/${day}`, { completed });
      toast.success(completed ? `Day ${day} marked complete! 🎉` : `Day ${day} unmarked.`);
    } catch {
      toast.success(completed ? `Day ${day} marked complete! (Mock)` : `Day ${day} unmarked.`);
    }
  };

  const categoryColors: Record<string, string> = {
    'Grains': 'bg-[rgba(245,158,11,0.12)] text-warning',
    'Protein': 'bg-[rgba(16,185,129,0.12)] text-success',
    'Healthy Fats': 'bg-[rgba(108,99,255,0.12)] text-accent',
    'Vegetables': 'bg-[rgba(16,185,129,0.12)] text-success',
    'Fruits': 'bg-[rgba(245,158,11,0.12)] text-warning',
    'Dairy': 'bg-[rgba(14,165,233,0.12)] text-info',
    'Supplements': 'bg-[rgba(239,68,68,0.12)] text-danger',
  };

  const completedDays = plan?.days.filter(d => d.completed).length ?? 0;
  const progress = plan ? Math.round((completedDays / plan.days.length) * 100) : 0;

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-7 gap-2">
        {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-14" />)}
      </div>
      <Skeleton className="h-80" />
    </div>
  );

  if (!plan) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-bg-input text-text-muted flex items-center justify-center text-[32px]">
        <i className="fa-solid fa-bowl-food"/>
      </div>
      <h2 className="text-[20px] font-bold text-text-primary">No Diet Plan Yet</h2>
      <p className="text-text-secondary max-w-sm">Upload and complete a pathology report — the AI will generate a personalized 7-day diet plan for you.</p>
      <Button onClick={() => window.location.href = '/patient/dashboard'}>
        <i className="fa-solid fa-arrow-left"/> Go to Dashboard
      </Button>
    </div>
  );

  const activeDay_data = plan.days.find(d => d.day === activeDay) ?? plan.days[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold text-text-primary">My Diet Plan</h1>
          <p className="text-text-secondary text-[14px] mt-1">Your personalized 7-day meal plan based on your health analysis.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPlan}>
          <i className="fa-solid fa-rotate-right"/> Refresh
        </Button>
      </div>

      {/* Progress Bar */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-text-primary text-[15px]">Weekly Progress</div>
          <div className="text-[13px] font-bold text-accent">{completedDays}/{plan.days.length} days</div>
        </div>
        <div className="h-3 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-success rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[12px] text-text-secondary mt-2">{progress}% of weekly plan complete</div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: 'plan', label: 'Meal Plan', icon: 'fa-utensils' },
          { id: 'shopping', label: 'Shopping List', icon: 'fa-cart-shopping' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t.id ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <i className={`fa-solid ${t.icon}`}/> {t.label}
          </button>
        ))}
      </div>

      {/* Plan Tab */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          {/* Day Selector */}
          <div className="grid grid-cols-7 gap-2">
            {plan.days.map(d => (
              <button
                key={d.day}
                onClick={() => setActiveDay(d.day)}
                className={`py-3 rounded-xl text-center text-[13px] font-bold transition-all border ${
                  activeDay === d.day
                    ? 'bg-accent text-white border-accent shadow-md'
                    : d.completed
                    ? 'bg-[rgba(16,185,129,0.12)] text-success border-[rgba(16,185,129,0.3)]'
                    : 'bg-bg-input text-text-secondary border-border hover:border-accent'
                }`}
              >
                <div className="text-[11px] font-medium mb-0.5 opacity-70">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d.day - 1]}
                </div>
                {d.completed ? <i className="fa-solid fa-check"/> : `D${d.day}`}
              </button>
            ))}
          </div>

          {/* Active Day Card */}
          <MealDayCard
            dayData={activeDay_data}
            onToggleComplete={handleToggleDay}
            isActive={true}
          />
        </div>
      )}

      {/* Shopping List Tab */}
      {activeTab === 'shopping' && shopping && (
        <Card>
          <CardTitle icon={<i className="fa-solid fa-cart-shopping"/>}>Weekly Shopping List</CardTitle>
          <div className="space-y-2">
            {Object.entries(
              shopping.items.reduce((acc, item) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(item);
                return acc;
              }, {} as Record<string, typeof shopping.items>)
            ).map(([cat, items]) => (
              <div key={cat} className="mb-5">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3 ${categoryColors[cat] ?? 'bg-bg-input text-text-secondary'}`}>
                  {cat}
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <div className="w-5 h-5 border-2 border-border rounded flex-shrink-0 cursor-pointer hover:border-accent transition-colors"/>
                      <div className="flex-1 text-[14px] text-text-primary">{item.name}</div>
                      <div className="text-[13px] text-text-secondary">{item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
