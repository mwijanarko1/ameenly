import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
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
    ipHash: v.optional(v.string()),
    authorId: v.optional(v.id("users")),
    createdAt: v.number(),
    ameen: v.number(),
  })
    .index("by_group_wall", ["groupId", "createdAt"])
    .index("by_ip_and_time", ["ipHash", "createdAt"])
    .index("by_author_and_time", ["authorId", "createdAt"]),

  ameens: defineTable({
    duaId: v.id("duas"),
    userId: v.id("users"),
  })
    .index("by_dua_and_user", ["duaId", "userId"])
    .index("by_dua", ["duaId"]),
});
