export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  onboarding: "/onboarding",
  discover: "/discover",
  recommendations: "/recommendations",
  tasteDNA: "/taste-dna",
  saved: "/saved",
  history: "/history",
  profile: "/profile",
  settings: "/settings",
  seasonal: "/seasonal",
  surprise: "/surprise-me",
  meal: (id: string) => `/meal/${id}`,
} as const;

export const knownStaticRoutes = new Set<string>([
  routes.login, routes.dashboard, routes.onboarding, routes.discover,
  routes.recommendations, routes.tasteDNA, routes.saved, routes.history,
  routes.profile, routes.settings, routes.seasonal, routes.surprise,
]);

export const protectedRoutes = new Set<string>([
  routes.dashboard, routes.onboarding, routes.recommendations, routes.tasteDNA,
  routes.saved, routes.history, routes.profile, routes.settings,
  routes.discover, routes.seasonal, routes.surprise,
]);
