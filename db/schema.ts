import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable(
  'profiles',
  {
    userId: text('user_id').primaryKey(),
    email: text('email').notNull(),
    username: text('username').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    birthDate: text('birth_date').notNull(),
    city: text('city').notNull(),
    region: text('region').notNull(),
    country: text('country').notNull(),
    interests: text('interests').notNull().default('[]'),
    discoverable: integer('discoverable', { mode: 'boolean' })
      .notNull()
      .default(true),
    updatesAccepted: integer('updates_accepted', { mode: 'boolean' })
      .notNull()
      .default(false),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex('profiles_username_unique').on(table.username)],
);

export const looks = sqliteTable(
  'looks',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    imageKey: text('image_key').notNull(),
    imageMimeType: text('image_mime_type').notNull(),
    caption: text('caption').notNull(),
    location: text('location').notNull(),
    area: text('area').notNull(),
    placeRating: integer('place_rating').notNull().default(5),
    outfit: text('outfit').notNull().default('[]'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex('looks_image_key_unique').on(table.imageKey),
    index('looks_user_idx').on(table.userId),
    index('looks_created_at_idx').on(table.createdAt),
  ],
);

export const follows = sqliteTable(
  'follows',
  {
    followerUserId: text('follower_user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    followedUserId: text('followed_user_id')
      .notNull()
      .references(() => profiles.userId, { onDelete: 'cascade' }),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.followerUserId, table.followedUserId] }),
    index('follows_followed_user_idx').on(table.followedUserId),
  ],
);
