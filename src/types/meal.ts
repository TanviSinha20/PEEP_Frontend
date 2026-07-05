// ============================================================
// MEAL PLAN TYPES
// ============================================================

export interface MealItem {
  name: string;
  portion: string;
  calories: number;
}

export interface MealDay {
  day: number;           // 1–7
  completed: boolean;
  breakfast: MealItem[];
  lunch: MealItem[];
  snack: MealItem[];
  dinner: MealItem[];
}

export interface MealPlan {
  days: MealDay[];
  generated_from_report_id: string;
  created_at: string;
}

export interface ShoppingItem {
  name: string;
  quantity: string;
  category: string;
}

export interface ShoppingList {
  items: ShoppingItem[];
}

export interface MarkDayRequest {
  completed: boolean;
}
