import { z } from "zod";

const base = {
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(40),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
  /** Hidden field. Real users never fill it; bots usually do. */
  website: z.string().max(0).optional(),
};

export const hugEnquirySchema = z.object({
  type: z.literal("hug"),
  ...base,
  organization: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(120),
  setting: z.string().trim().min(2).max(60),
  units: z.string().trim().max(20).optional().or(z.literal("")),
});

export const projectEnquirySchema = z.object({
  type: z.literal("project"),
  ...base,
  organization: z.string().trim().min(2).max(160),
  city: z.string().trim().min(2).max(160),
  projectType: z.string().trim().min(2).max(80),
  space: z.string().trim().max(80).optional().or(z.literal("")),
  challenge: z.string().trim().min(10).max(4000),
  timeline: z.string().trim().max(80).optional().or(z.literal("")),
});

export const enquirySchema = z.discriminatedUnion("type", [
  hugEnquirySchema,
  projectEnquirySchema,
]);

export type Enquiry = z.infer<typeof enquirySchema>;
export type EnquiryType = Enquiry["type"];
