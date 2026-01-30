import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    dailyRevisionTarget: integer("daily_revision_target").default(10).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const confidenceHistory = pgTable("confidence_history", {
    id: uuid("id").primaryKey().defaultRandom(),
    knowledgeId: text("knowledge_id").references(() => knowledge.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    confidence: integer("confidence").notNull(),
    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const collections = pgTable("collections", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collectionKnowledge = pgTable("collection_knowledge", {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id").references(() => collections.id, { onDelete: 'cascade' }).notNull(),
    knowledgeId: text("knowledge_id").references(() => knowledge.id, { onDelete: 'cascade' }).notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    title: text("title").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").references(() => chatSessions.id, { onDelete: 'cascade' }).notNull(),
    role: text("role").notNull(), // 'user' or 'assistant'
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const knowledge = pgTable("knowledge", {
    id: text("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    title: text("title").notNull(),
    type: text("type").notNull(),
    domain: text("domain"),
    technology: text("technology"),
    difficulty: text("difficulty"),
    content: jsonb("content").notNull(),
    tags: jsonb("tags").default([]),
    confidenceLevel: integer("confidence_level").default(0),
    revision: jsonb("revision"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const revisionHistory = pgTable("revision_history", {
    id: uuid("id").primaryKey().defaultRandom(),
    knowledgeId: text("knowledge_id").references(() => knowledge.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    confidenceGiven: integer("confidence_given").notNull(),
    revisedAt: timestamp("revised_at").defaultNow().notNull(),
    timeTakenSeconds: integer("time_taken_seconds"),
});

export const aiSettings = pgTable("ai_settings", {
    userId: uuid("user_id").primaryKey().references(() => users.id).notNull(),
    primaryProvider: text("primary_provider"),
    fallbackProvider: text("fallback_provider"),
    encryptedKeys: jsonb("encrypted_keys"),
});

export const usersRelations = relations(users, ({ many, one }) => ({
    knowledge: many(knowledge),
    revisions: many(revisionHistory),
    confidenceHistory: many(confidenceHistory),
    collections: many(collections),
    chatSessions: many(chatSessions),
    aiSettings: one(aiSettings, {
        fields: [users.id],
        references: [aiSettings.userId],
    }),
}));

export const knowledgeRelations = relations(knowledge, ({ one, many }) => ({
    user: one(users, {
        fields: [knowledge.userId],
        references: [users.id],
    }),
    revisions: many(revisionHistory),
    confidenceHistory: many(confidenceHistory),
    collections: many(collectionKnowledge),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
    user: one(users, {
        fields: [collections.userId],
        references: [users.id],
    }),
    knowledge: many(collectionKnowledge),
}));

export const collectionKnowledgeRelations = relations(collectionKnowledge, ({ one }) => ({
    collection: one(collections, {
        fields: [collectionKnowledge.collectionId],
        references: [collections.id],
    }),
    knowledge: one(knowledge, {
        fields: [collectionKnowledge.knowledgeId],
        references: [knowledge.id],
    }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
    user: one(users, {
        fields: [chatSessions.userId],
        references: [users.id],
    }),
    messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
    session: one(chatSessions, {
        fields: [chatMessages.sessionId],
        references: [chatSessions.id],
    }),
}));

export const confidenceHistoryRelations = relations(confidenceHistory, ({ one }) => ({
    knowledge: one(knowledge, {
        fields: [confidenceHistory.knowledgeId],
        references: [knowledge.id],
    }),
    user: one(users, {
        fields: [confidenceHistory.userId],
        references: [users.id],
    }),
}));

export const revisionHistoryRelations = relations(revisionHistory, ({ one }) => ({
    knowledge: one(knowledge, {
        fields: [revisionHistory.knowledgeId],
        references: [knowledge.id],
    }),
    user: one(users, {
        fields: [revisionHistory.userId],
        references: [users.id],
    }),
}));

export const courses = pgTable("courses", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courseModules = pgTable("course_modules", {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").references(() => courses.id, { onDelete: 'cascade' }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courseLessons = pgTable("course_lessons", {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id").references(() => courseModules.id, { onDelete: 'cascade' }).notNull(),
    title: text("title").notNull(),
    content: text("content"), // Markdown content
    orderIndex: integer("order_index").notNull(),
    knowledgeId: text("knowledge_id").references(() => knowledge.id, { onDelete: 'set null' }), // Link to existing knowledge
    durationSeconds: integer("duration_seconds"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userKnowledgeState = pgTable("user_knowledge_state", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    knowledgeId: text("knowledge_id").references(() => knowledge.id, { onDelete: 'cascade' }).notNull(),
    status: text("status").notNull(), // 'gap', 'learning', 'mastered'
    score: integer("score").default(0).notNull(), // 0-100
    lastAnalyzedAt: timestamp("last_analyzed_at").defaultNow().notNull(),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
    user: one(users, {
        fields: [courses.userId],
        references: [users.id],
    }),
    modules: many(courseModules),
}));

export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
    course: one(courses, {
        fields: [courseModules.courseId],
        references: [courses.id],
    }),
    lessons: many(courseLessons),
}));

export const courseLessonsRelations = relations(courseLessons, ({ one }) => ({
    module: one(courseModules, {
        fields: [courseLessons.moduleId],
        references: [courseModules.id],
    }),
    knowledge: one(knowledge, {
        fields: [courseLessons.knowledgeId],
        references: [knowledge.id],
    }),
}));

export const userKnowledgeStateRelations = relations(userKnowledgeState, ({ one }) => ({
    user: one(users, {
        fields: [userKnowledgeState.userId],
        references: [users.id],
    }),
    knowledge: one(knowledge, {
        fields: [userKnowledgeState.knowledgeId],
        references: [knowledge.id],
    }),
}));
