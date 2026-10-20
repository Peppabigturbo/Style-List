CREATE TABLE `follows` (
	`follower_user_id` text NOT NULL,
	`followed_user_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`follower_user_id`, `followed_user_id`),
	FOREIGN KEY (`follower_user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`followed_user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `follows_followed_user_idx` ON `follows` (`followed_user_id`);