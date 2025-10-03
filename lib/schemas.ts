import { z } from 'zod';

// Enums
export const GoalEnum = z.enum(['awareness', 'foot_traffic', 'leads', 'online_sales']);
export const ChannelEnum = z.enum(['billboards', 'facebook_instagram', 'google_search']);
export const RetargetingSourceEnum = z.enum(['site_visitors_30d', 'ig_engagers_30d', 'fb_engagers_30d']);

// Client Schema
export const ClientSchema = z.object({
  business_name: z.string(),
  industry: z.string(),
  city: z.string(),
  zip: z.string(),
  goal: GoalEnum,
  monthly_budget_usd: z.number().int().min(0),
});

// Billboard Placement
export const BillboardPlacementSchema = z.object({
  name: z.string(),
  why: z.string(),
});

// Billboards
export const BillboardsSchema = z.object({
  placement_ideas: z.array(BillboardPlacementSchema),
  est_impressions_range: z.string(),
});

// Facebook/Instagram Audience - Cold
export const ColdAudienceSchema = z.object({
  name: z.string(),
  geo: z.string(),
  interests: z.array(z.string()),
  age_range: z.string(),
});

// Facebook/Instagram Audience - Retargeting
export const RetargetingAudienceSchema = z.object({
  name: z.string(),
  source: RetargetingSourceEnum,
});

// Facebook/Instagram Creative
export const CreativeSchema = z.object({
  hooks: z.array(z.string()),
  primary_texts: z.array(z.string()),
  headlines: z.array(z.string()),
  descriptions: z.array(z.string()),
  ctas: z.array(z.string()),
});

// Facebook/Instagram
export const FacebookInstagramSchema = z.object({
  objectives: z.array(z.string()),
  audiences: z.object({
    cold: z.array(ColdAudienceSchema),
    retargeting: z.array(RetargetingAudienceSchema),
  }),
  creative: CreativeSchema,
});

// Google Search
export const GoogleSearchSchema = z.object({
  when_to_use: z.string(),
  core_keywords: z.array(z.string()),
});

// Channel Mix Item
export const ChannelMixItemSchema = z.object({
  channel: ChannelEnum,
  allocation_percent: z.number().int().min(0).max(100),
});

// Budget Split Item
export const BudgetSplitItemSchema = z.object({
  channel: ChannelEnum,
  amount_usd: z.number().int().min(0),
});

// KPI
export const KPISchema = z.object({
  name: z.string(),
  target: z.string(),
});

// Recommendations
export const RecommendationsSchema = z.object({
  channel_mix: z.array(ChannelMixItemSchema),
  billboards: BillboardsSchema.optional(),
  facebook_instagram: FacebookInstagramSchema.optional(),
  google_search: GoogleSearchSchema.optional(),
  budget_split_usd: z.array(BudgetSplitItemSchema),
  kpis: z.array(KPISchema),
  test_plan_30d: z.array(z.string()),
});

// Complete Plan Schema
export const PlanSchema = z.object({
  client: ClientSchema,
  recommendations: RecommendationsSchema,
  assumptions: z.array(z.string()),
  risks: z.array(z.string()),
});

// Input YAML Schema
export const InputYAMLSchema = z.object({
  client: z.object({
    business_name: z.string(),
    industry: z.string(),
    city: z.string(),
    zip: z.string(),
    goal: GoalEnum,
    monthly_budget_usd: z.number().int().min(0),
  }),
  constraints: z.object({
    channels: z.array(ChannelEnum),
    tone: z.string().optional(),
    max_billboard_locations: z.number().int().optional(),
    require_json_then_markdown: z.boolean().optional(),
  }),
});

// Export types
export type Goal = z.infer<typeof GoalEnum>;
export type Channel = z.infer<typeof ChannelEnum>;
export type Client = z.infer<typeof ClientSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type InputYAML = z.infer<typeof InputYAMLSchema>;

// Validation function with business rules
export function validatePlan(plan: Plan): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check channel_mix percentages sum to 100
  const totalPercent = plan.recommendations.channel_mix.reduce(
    (sum, item) => sum + item.allocation_percent,
    0
  );
  if (totalPercent !== 100) {
    errors.push(
      `Channel mix allocation must sum to 100%, got ${totalPercent}%`
    );
  }

  // Check budget_split sums to monthly_budget_usd
  const totalBudget = plan.recommendations.budget_split_usd.reduce(
    (sum, item) => sum + item.amount_usd,
    0
  );
  if (totalBudget !== plan.client.monthly_budget_usd) {
    errors.push(
      `Budget split must sum to ${plan.client.monthly_budget_usd}, got ${totalBudget}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
