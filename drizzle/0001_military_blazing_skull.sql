CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceId` int NOT NULL,
	`fanId` int NOT NULL,
	`creatorId` int NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`status` enum('pending','accepted','declined','completed','cancelled') NOT NULL DEFAULT 'pending',
	`tokenAmount` decimal(18,6) NOT NULL,
	`transactionHash` varchar(128),
	`notes` text,
	`meetingLink` text,
	`calendarEventId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creator_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`date` timestamp NOT NULL,
	`tokensSold` decimal(30,6) DEFAULT '0',
	`revenue` decimal(18,6) DEFAULT '0',
	`bookingsCount` int DEFAULT 0,
	`newFans` int DEFAULT 0,
	`tokenVelocity` decimal(10,4) DEFAULT '0',
	`avgTransactionSize` decimal(18,6) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creator_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creator_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bio` text,
	`profilePhoto` text,
	`coverPhoto` text,
	`twitterHandle` varchar(255),
	`instagramHandle` varchar(255),
	`youtubeChannel` varchar(255),
	`discordServer` varchar(255),
	`website` varchar(500),
	`category` varchar(100),
	`featured` boolean NOT NULL DEFAULT false,
	`verified` boolean NOT NULL DEFAULT false,
	`followerCount` int NOT NULL DEFAULT 0,
	`totalBookings` int NOT NULL DEFAULT 0,
	`rating` decimal(3,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creator_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creator_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`tokenName` varchar(100) NOT NULL,
	`tokenSymbol` varchar(10) NOT NULL,
	`contractAddress` varchar(128),
	`initialPrice` decimal(18,6) NOT NULL,
	`currentPrice` decimal(18,6) NOT NULL,
	`totalSupply` decimal(30,0) DEFAULT '0',
	`circulatingSupply` decimal(30,0) DEFAULT '0',
	`liquidityPoolAddress` varchar(128),
	`settlementListingId` varchar(100),
	`deployedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creator_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `liquidity_pools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenId` int NOT NULL,
	`poolAddress` varchar(128),
	`tokenReserve` decimal(30,6) DEFAULT '0',
	`usdtReserve` decimal(30,6) DEFAULT '0',
	`totalLiquidity` decimal(30,6) DEFAULT '0',
	`volume24h` decimal(30,6) DEFAULT '0',
	`fees24h` decimal(30,6) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `liquidity_pools_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`tokenPrice` decimal(18,6) NOT NULL,
	`duration` int NOT NULL,
	`availability` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`category` varchar(100),
	`imageUrl` text,
	`maxBookingsPerDay` int,
	`totalBookings` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `token_holdings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenId` int NOT NULL,
	`balance` decimal(30,6) NOT NULL DEFAULT '0',
	`averageBuyPrice` decimal(18,6),
	`totalInvested` decimal(18,6) DEFAULT '0',
	`totalSpent` decimal(18,6) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `token_holdings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenId` int NOT NULL,
	`type` enum('buy','sell','transfer','payment','cashout') NOT NULL,
	`amount` decimal(18,6) NOT NULL,
	`pricePerToken` decimal(18,6),
	`totalValue` decimal(18,6),
	`fromAddress` varchar(128),
	`toAddress` varchar(128),
	`transactionHash` varchar(128),
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','creator','fan') NOT NULL DEFAULT 'fan';--> statement-breakpoint
ALTER TABLE `users` ADD `walletAddress` varchar(128);--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_serviceId_services_id_fk` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_fanId_users_id_fk` FOREIGN KEY (`fanId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_creatorId_users_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `creator_analytics` ADD CONSTRAINT `creator_analytics_creatorId_users_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `creator_profiles` ADD CONSTRAINT `creator_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `creator_tokens` ADD CONSTRAINT `creator_tokens_creatorId_users_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `liquidity_pools` ADD CONSTRAINT `liquidity_pools_tokenId_creator_tokens_id_fk` FOREIGN KEY (`tokenId`) REFERENCES `creator_tokens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `services` ADD CONSTRAINT `services_creatorId_users_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `token_holdings` ADD CONSTRAINT `token_holdings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `token_holdings` ADD CONSTRAINT `token_holdings_tokenId_creator_tokens_id_fk` FOREIGN KEY (`tokenId`) REFERENCES `creator_tokens`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_tokenId_creator_tokens_id_fk` FOREIGN KEY (`tokenId`) REFERENCES `creator_tokens`(`id`) ON DELETE cascade ON UPDATE no action;