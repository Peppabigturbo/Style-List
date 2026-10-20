CREATE TABLE `looks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`image_key` text NOT NULL,
	`image_mime_type` text NOT NULL,
	`caption` text NOT NULL,
	`location` text NOT NULL,
	`area` text NOT NULL,
	`place_rating` integer DEFAULT 5 NOT NULL,
	`outfit` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `looks_image_key_unique` ON `looks` (`image_key`);--> statement-breakpoint
CREATE INDEX `looks_user_idx` ON `looks` (`user_id`);--> statement-breakpoint
CREATE INDEX `looks_created_at_idx` ON `looks` (`created_at`);