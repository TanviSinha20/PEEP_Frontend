import React from 'react';
import { Card } from '@/components/ui/Card';
import { MealDay, MealItem } from '@/types/meal';

interface MealDayCardProps {
  dayData: MealDay;
  onToggleComplete?: (day: number, completed: boolean) => void;
  isActive?: boolean;
}

export function MealDayCard({ dayData, onToggleComplete, isActive = false }: MealDayCardProps) {
  const { day, completed, breakfast, lunch, snack, dinner } = dayData;

  const renderMealSection = (title: string, icon: string, items: MealItem[]) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="mb-4 last:mb-0">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-text-primary mb-2 bg-bg-card-secondary px-3 py-1.5 rounded-lg">
          <i className={`fa-solid ${icon} text-accent`}></i> {title}
        </div>
        <div className="space-y-2 px-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-[13px]">
              <div className="flex-1">
                <span className="text-text-primary font-medium">{item.name}</span>
                <span className="text-text-secondary ml-1">({item.portion})</span>
              </div>
              <div className="text-text-muted text-[12px] font-medium w-12 text-right">
                {item.calories} <span className="text-[10px]">cal</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalCalories = [
    ...(breakfast || []), 
    ...(lunch || []), 
    ...(snack || []), 
    ...(dinner || [])
  ].reduce((acc, curr) => acc + curr.calories, 0);

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-accent shadow-md' : 'opacity-80 hover:opacity-100'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[16px] ${
            completed ? 'bg-success text-white' : isActive ? 'bg-accent text-white' : 'bg-bg-input text-text-primary'
          }`}>
            {completed ? <i className="fa-solid fa-check"></i> : `D${day}`}
          </div>
          <div>
            <div className="text-[15px] font-bold text-text-primary">Day {day}</div>
            <div className="text-[12px] text-text-secondary">{totalCalories} total kcal</div>
          </div>
        </div>
        
        {onToggleComplete && (
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={completed} 
                onChange={(e) => onToggleComplete(day, e.target.checked)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${completed ? 'bg-success' : 'bg-border'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${completed ? 'transform translate-x-4' : ''}`}></div>
            </div>
          </label>
        )}
      </div>

      {/* Meals */}
      <div className="space-y-1">
        {renderMealSection('Breakfast', 'fa-mug-saucer', breakfast)}
        {renderMealSection('Lunch', 'fa-bowl-food', lunch)}
        {renderMealSection('Snack', 'fa-apple-whole', snack)}
        {renderMealSection('Dinner', 'fa-utensils', dinner)}
      </div>
      
      {completed && (
        <div className="absolute inset-0 bg-success/5 pointer-events-none"></div>
      )}
    </Card>
  );
}
