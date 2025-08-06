import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hairstyles = pgTable("hairstyles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  image: text("image").notNull(),
  categories: text("categories").array().notNull(),
  difficulty: text("difficulty").notNull(),
  trending: boolean("trending").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userStyles = pgTable("user_styles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  hairstyleId: varchar("hairstyle_id").references(() => hairstyles.id),
  colorValue: text("color_value"),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertHairstyleSchema = createInsertSchema(hairstyles).omit({
  id: true,
  createdAt: true,
});

export const insertUserStyleSchema = createInsertSchema(userStyles).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertHairstyle = z.infer<typeof insertHairstyleSchema>;
export type Hairstyle = typeof hairstyles.$inferSelect;
export type InsertUserStyle = z.infer<typeof insertUserStyleSchema>;
export type UserStyle = typeof userStyles.$inferSelect;
