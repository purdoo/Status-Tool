DROP SCHEMA IF EXISTS `status`;
CREATE DATABASE `status`;

CREATE TABLE `status`.`Users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(45) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `hash` VARCHAR(128) NOT NULL,
  `salt` VARCHAR(16) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC));


CREATE TABLE `status`.`Status` (
  `status_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `body` VARCHAR(255) NOT NULL,
  `created` DATETIME NULL DEFAULT now(),
  PRIMARY KEY (`status_id`, `user_id`),
  INDEX `user_id_idx` (`user_id` ASC),
  CONSTRAINT `user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `status`.`Users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
