export type Diet = "omnivore" | "vegetarian" | "vegan";
export type InteractionKind = "liked" | "disliked" | "saved" | "unsaved" | "dismissed" | "ordered" | "rated";

export type Meal = {
  id: string; name: string; restaurant: string; cuisine: string; price: number;
  emoji: string; description: string; ingredients: string[]; allergens: string[];
  tags: string[]; protein: number; calories: number; healthScore: number;
  spice: number; diet: Diet; seasonal: boolean; createdAt: number;
};

export type TasteProfile = {
  onboardingCompleted: boolean; favoriteCuisines: string[]; dislikedCuisines: string[];
  diet: Diet; allergies: string[]; exclusions: string[]; spice: number;
  sweet: number; savory: number; texture: number; health: number;
  proteinPreference: "any" | "high"; caloriePreference: "any" | "light";
  mealSize: "light" | "regular" | "hearty";
};

export type Order = { id: string; mealId: string; quantity: number; notes: string; createdAt: number; rating?: number };
export type Interaction = { id: string; mealId: string; kind: InteractionKind; createdAt: number; rating?: number };
export type Settings = { personalization: boolean; animations: boolean; compactUnits: boolean };
export type AppState = { profile: TasteProfile; saved: string[]; liked: string[]; disliked: string[]; dismissed: string[]; orders: Order[]; interactions: Interaction[]; settings: Settings };

export const allergenOptions = ["peanuts", "tree nuts", "milk", "egg", "wheat", "soy", "fish", "shellfish", "sesame"];

export const meals: Meal[] = [
  { id:"miso-salmon", name:"Miso Salmon Glow Bowl", restaurant:"Kumo Kitchen", cuisine:"Japanese", price:520, emoji:"🍣", description:"Miso-glazed salmon, edamame, roasted sweet potato and sesame greens over sushi rice.", ingredients:["salmon","rice","edamame","sweet potato","sesame"], allergens:["soy","fish","sesame"], tags:["high protein","umami","omega-3"], protein:38, calories:610, healthScore:91, spice:1, diet:"omnivore", seasonal:true, createdAt:8 },
  { id:"tantanmen", name:"Midnight Tantanmen", restaurant:"Nori Club", cuisine:"Japanese", price:460, emoji:"🍜", description:"Silky sesame broth, springy noodles, chili crisp and a jammy egg.", ingredients:["wheat noodles","sesame","egg","chili"], allergens:["sesame","wheat","egg"], tags:["spicy","comfort","late night"], protein:24, calories:720, healthScore:72, spice:4, diet:"vegetarian", seasonal:true, createdAt:7 },
  { id:"corn-tacos", name:"Charred Corn Tacos", restaurant:"La Calle", cuisine:"Mexican", price:380, emoji:"🌮", description:"Blue-corn tortillas with charred corn, avocado crema and chipotle mushrooms.", ingredients:["corn","avocado","mushroom","chipotle"], allergens:[], tags:["fresh","smoky","shareable"], protein:16, calories:480, healthScore:86, spice:3, diet:"vegan", seasonal:false, createdAt:6 },
  { id:"paneer", name:"Tandoori Paneer Plate", restaurant:"Mitti", cuisine:"Indian", price:420, emoji:"🍛", description:"Charred paneer, mint chutney, dal makhani and a crisp kachumber salad.", ingredients:["paneer","lentils","mint","tomato"], allergens:["milk"], tags:["tandoor","comfort","high protein"], protein:32, calories:650, healthScore:82, spice:3, diet:"vegetarian", seasonal:true, createdAt:5 },
  { id:"green-crunch", name:"Green Goddess Crunch", restaurant:"Field Notes", cuisine:"Modern", price:340, emoji:"🥗", description:"Little gem, herbs, quinoa, roasted chickpeas and bright tahini dressing.", ingredients:["lettuce","quinoa","chickpeas","tahini"], allergens:["sesame"], tags:["light","crunchy","plant-powered"], protein:22, calories:390, healthScore:96, spice:0, diet:"vegan", seasonal:false, createdAt:4 },
  { id:"hot-honey", name:"Hot Honey Margherita", restaurant:"Dough Theory", cuisine:"Italian", price:490, emoji:"🍕", description:"Slow-fermented crust, tomato, fior di latte, basil and hot honey.", ingredients:["wheat","tomato","mozzarella","honey"], allergens:["milk","wheat"], tags:["cheesy","sweet heat","weekend"], protein:20, calories:780, healthScore:64, spice:2, diet:"vegetarian", seasonal:false, createdAt:3 },
  { id:"peanut-bowl", name:"Satay Peanut Power Bowl", restaurant:"Root & Rice", cuisine:"Thai", price:410, emoji:"🥜", description:"Brown rice, tofu, crunchy vegetables and a rich peanut satay dressing.", ingredients:["peanuts","tofu","brown rice","cabbage"], allergens:["peanuts","soy"], tags:["high protein","nutty","plant-powered"], protein:30, calories:590, healthScore:88, spice:2, diet:"vegan", seasonal:false, createdAt:2 },
  { id:"prawn-curry", name:"Coastal Prawn Curry", restaurant:"Konkan Table", cuisine:"Indian", price:560, emoji:"🍤", description:"Coconut-forward prawn curry with red rice and seasonal greens.", ingredients:["prawns","coconut","red rice","chili"], allergens:["shellfish"], tags:["coastal","comfort","high protein"], protein:35, calories:630, healthScore:84, spice:4, diet:"omnivore", seasonal:true, createdAt:1 },
];

export const defaultTasteProfile: TasteProfile = { onboardingCompleted:true, favoriteCuisines:["Japanese","Indian"], dislikedCuisines:[], diet:"omnivore", allergies:["peanuts"], exclusions:[], spice:3, sweet:45, savory:92, texture:78, health:72, proteinPreference:"high", caloriePreference:"any", mealSize:"regular" };
export const defaultState: AppState = { profile:defaultTasteProfile, saved:[], liked:["miso-salmon"], disliked:[], dismissed:[], orders:[{id:"seed-1",mealId:"miso-salmon",quantity:1,notes:"",createdAt:Date.now()-86400000,rating:5}], interactions:[], settings:{personalization:true,animations:true,compactUnits:false} };

export function isCompatible(meal: Meal, profile: TasteProfile) {
  if (meal.allergens.some(a => profile.allergies.includes(a))) return false;
  if (meal.ingredients.some(i => profile.exclusions.some(e => i.toLowerCase().includes(e.toLowerCase())))) return false;
  if (profile.diet === "vegan" && meal.diet !== "vegan") return false;
  if (profile.diet === "vegetarian" && meal.diet === "omnivore") return false;
  return true;
}

export function scoreMeal(meal: Meal, state: AppState, mood = "balanced") {
  if (!isCompatible(meal, state.profile) || state.dismissed.includes(meal.id)) return null;
  const p = state.profile;
  const taste = Math.min(100, 55 + (p.favoriteCuisines.includes(meal.cuisine) ? 30 : 8) + (meal.spice <= p.spice ? 10 : 0));
  const dietary = 100;
  const history = state.liked.includes(meal.id) ? 100 : state.orders.some(o => o.mealId === meal.id) ? 88 : 68;
  const seasonal = meal.seasonal ? 100 : 62;
  const context = mood === "light" ? Math.max(20, 110 - meal.calories / 7) : mood === "protein" ? Math.min(100, meal.protein * 2.5) : 78;
  const final = Math.round(taste*.40 + dietary*.20 + history*.15 + seasonal*.10 + meal.healthScore*.10 + context*.05);
  const reasons = [p.favoriteCuisines.includes(meal.cuisine) ? `Matches your ${meal.cuisine} affinity` : `Expands your cuisine range`, meal.protein >= 30 ? `High protein: ${meal.protein}g` : `Fits your regular meal pattern`, meal.seasonal ? "Recommended for the current season" : "Aligned with your current context"];
  if (state.orders.some(o => o.mealId === meal.id)) reasons.unshift("Similar to a meal you previously enjoyed");
  return { meal, score: Math.min(99, final), reasons };
}

export function rankedMeals(state: AppState, mood = "balanced") { return meals.map(m => scoreMeal(m,state,mood)).filter((x): x is NonNullable<typeof x> => Boolean(x)).sort((a,b) => b.score-a.score); }

export function updateTasteFromInteraction(profile: TasteProfile, meal: Meal, kind: InteractionKind) {
  const delta = kind === "liked" || kind === "saved" || kind === "ordered" ? 4 : kind === "disliked" || kind === "dismissed" ? -4 : 0;
  return { ...profile, savory:Math.max(0,Math.min(100,profile.savory+(meal.tags.includes("umami")?delta:0))), texture:Math.max(0,Math.min(100,profile.texture+(meal.tags.includes("crunchy")?delta:0))), health:Math.max(0,Math.min(100,profile.health+(meal.healthScore>85?delta:0))), favoriteCuisines:delta>0&&!profile.favoriteCuisines.includes(meal.cuisine)?[...profile.favoriteCuisines,meal.cuisine]:profile.favoriteCuisines };
}
