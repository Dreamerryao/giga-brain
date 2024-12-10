export function getHomeRoute() {
  return '/';
}

export function getAgentRoute(id: string) {
  return `/agents/${id}`;
}

export function getLeaderboardRoute() {
  return '/leaderboard';
}

export function getCreateAgentRoute() {
  return '/agents/new';
}

export function getPrivacyPolicyRoute() {
  return '/privacy-policy';
}

export function getTermsOfUseRoute() {
  return '/terms-of-use';
}

export function getLoreRoute() {
  return '/lore';
}

export function getHowItWorksRoute() {
  return '/how-it-works';
}

export function getPlayerRoute(address: string) {
  return `/player/${address}`;
}

export function getFaqsRoute() {
  return '/faqs';
}

export function getTokenomicsRoute() {
  return '/tokenomics';
}

export function getPromptingGuideRoute() {
  return '/prompting-guide';
}

export function getRoadmapRoute() {
  return '/roadmap';
}
