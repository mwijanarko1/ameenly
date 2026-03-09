import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
  })
    .index("by_clerkId", ["clerkId"]),

  siteAdmins: defineTable({
    clerkId: v.string(),
    createdAt: v.number(),
    note: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),

  groups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    creatorId: v.id("users"),
    inviteCode: v.string(),
    createdAt: v.number(),
  })
    .index("by_inviteCode", ["inviteCode"])
    .index("by_creator", ["creatorId"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_and_user", ["groupId", "userId"]),

  duas: defineTable({
    text: v.string(),
    groupId: v.optional(v.id("groups")),
    name: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    isSeedDua: v.optional(v.boolean()),
    ipHash: v.optional(v.string()),
    authorId: v.optional(v.id("users")),
    createdAt: v.number(),
    ameen: v.number(),
    moderationStatus: v.optional(
      v.union(
        v.literal("approved"),
        v.literal("pending_review"),
        v.literal("rejected")
      )
    ),
    moderationReasons: v.optional(v.array(v.string())),
    moderatedAt: v.optional(v.number()),
    moderatedByAdminId: v.optional(v.id("siteAdmins")),
    reportCount: v.optional(v.number()),
    reportReasons: v.optional(v.array(v.string())),
  })
    .index("by_group_wall", ["groupId", "createdAt"])
    .index("by_report_count", ["reportCount"])
    .index("by_ip_and_time", ["ipHash", "createdAt"])
    .index("by_author_and_time", ["authorId", "createdAt"])
    .index("by_moderation_status_and_time", ["moderationStatus", "createdAt"]),

  ameens: defineTable({
    duaId: v.id("duas"),
    userId: v.id("users"),
  })
    .index("by_dua_and_user", ["duaId", "userId"])
    .index("by_dua", ["duaId"])
    .index("by_user", ["userId"]),

  reports: defineTable({
    duaId: v.id("duas"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_dua_and_user", ["duaId", "userId"])
    .index("by_dua", ["duaId"])
    .index("by_user", ["userId"]),
});
