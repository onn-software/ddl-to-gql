-- Adminer 4.8.1 MySQL 8.0.32 dump

SET NAMES utf8;
SET time_zone = '' + 00:00'';
SET foreign_key_checks = 0;
SET sql_mode = ''NO_AUTO_VALUE_ON_ZERO'';

CREATE DATABASE `classicmodels` /*!40100 DEFAULT CHARACTER SET latin1 */ /*!80016 DEFAULT ENCRYPTION='' N'' */;
USE `classicmodels`;

DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers`
(
    `customerNumber`         int         NOT NULL,
    `customerName`           varchar(50) NOT NULL,
    `contactLastName`        varchar(50) NOT NULL,
    `contactFirstName`       varchar(50) NOT NULL,
    `phone`                  varchar(50) NOT NULL,
    `addressLine1`           varchar(50) NOT NULL,
    `addressLine2`           varchar(50)    DEFAULT NULL,
    `city`                   varchar(50) NOT NULL,
    `state`                  varchar(50)    DEFAULT NULL,
    `postalCode`             varchar(15)    DEFAULT NULL,
    `country`                varchar(50) NOT NULL,
    `salesRepEmployeeNumber` int            DEFAULT NULL,
    `creditLimit`            decimal(10,2) DEFAULT NULL,
    PRIMARY KEY (`customerNumber`),
    KEY `salesRepEmployeeNumber` (`salesRepEmployeeNumber`),
    CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`salesRepEmployeeNumber`) REFERENCES `employees` (`employeeNumber`)
) ENGINE = InnoDB
  DEFAULT CHARSET = latin1;


DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees`
(
    `employeeNumber` int          NOT NULL,
    `lastName`       varchar(50)  NOT NULL,
    `firstName`      varchar(50)  NOT NULL,
    `extension`      varchar(10)  NOT NULL,
    `email`          varchar(100) NOT NULL,
    `officeCode`     varchar(10)  NOT NULL,
    `reportsTo`      int DEFAULT NULL,
    `jobTitle`       varchar(50)  NOT NULL,
    PRIMARY KEY (`employeeNumber`),
    KEY `reportsTo` (`reportsTo`),
    KEY `officeCode` (`officeCode`),
    CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`reportsTo`) REFERENCES `employees` (`employeeNumber`),
    CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`officeCode`) REFERENCES `offices` (`officeCode`)
) ENGINE = InnoDB
  DEFAULT CHARSET = latin1;


DROP TABLE IF EXISTS `offices`;
CREATE TABLE `offices`
(
    `officeCode`   varchar(10) NOT NULL,
    `city`         varchar(50) NOT NULL,
    `phone`        varchar(50) NOT NULL,
    `addressLine1` varchar(50) NOT NULL,
    `addressLine2` varchar(50) DEFAULT NULL,
    `state`        varchar(50) DEFAULT NULL,
    `country`      varchar(50) NOT NULL,
    `postalCode`   varchar(15) NOT NULL,
    `territory`    varchar(10) NOT NULL,
    PRIMARY KEY (`officeCode`)
) ENGINE = InnoDB
  DEFAULT CHARSET = latin1;


DROP TABLE IF EXISTS `orderdetails`;
CREATE TABLE `orderdetails`
(
    `orderNumber`     int            NOT NULL,
    `productCode`     varchar(15)    NOT NULL,
    `quantityOrdered` int            NOT NULL,
    `priceEach`       decimal(10, 2) NOT NULL,
    `orderLineNumber` smallint       NOT NULL,
    PRIMARY KEY (`orderNumber`, `productCode`),
    KEY `productCode` (`productCode`),
    CONSTRAINT `orderdetails_ibfk_1` FOREIGN KEY (`orderNumber`) REFERENCES `orders` (`orderNumber`),
    CONSTRAINT `orderdetails_ibfk_2` FOREIGN KEY (`productCode`) REFERENCES `products` (`productCode`)
) ENGINE = InnoDB
  DEFAULT CHARSET = latin1;


DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`
(
    `orderNumber`    int         NOT NULL,
    `orderDate`      date        NOT NULL,
    `requiredDate`   date        NOT NULL,
    `shippedDate`    date DEFAULT NULL,
    `status`         varchar(15) NOT NULL,
    `comments`       text,
    `customerNumber` int         NOT NULL,
    PRIMARY KEY (`orderNumber`),
    KEY `customerNumber` (`customerNumber`),
    CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customerNumber`) REFERENCES `customers` (`customerNumber`)
) ENGINE = InnoDB
  DEFAULT CHARSET = latin1;


DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments`
(
    `customerNumber` int            NOT NULL,
    `checkNumber`    varchar(50)    NOT NULL,
    `paymentDate`    date           NOT NULL,
    `amount`         decimal(10, 2) NOT NULL,
    PRIMARY KEY (`customerNumber`, `checkNumber`),
    CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`customerNumber`) REFERENCES `customers` (`customerNumber`)
) ENGINE = InnoDB
  DEFAULT CHARSET = latin1;


DROP TABLE IF EXISTS `productlines`;
CREATE TABLE `productlines`
(
    `productLine`     varchar(50) NOT NULL,
    `textDescription` varchar(4000) DEFAULT NULL,
    `htmlDescription` mediumtext,
    `image`           mediumblob,
    PRIMARY KEY (`productLine`)
) ENGINE = InnoDB
  DEFAULT CHARSET = latin1;


drop table if exists products;
create table products
(
    productCode        varchar(15)    not null
        primary key,
    productName        varchar(70)    not null,
    productLine        varchar(50)    not null,
    productScale       varchar(10)    not null,
    productVendor      varchar(50)    not null,
    `order` text           not null,
    123text text           not null,
    `567text` text           not null,
    productDescription text           not null,
    quantityInStock    smallint       not null,
    buyPrice           decimal(10, 2) not null,
    MSRP               decimal(10, 2) not null,
    key productLine (productLine),
    constraint products_ibfk_1 foreign key (productLine) references productlines (productLine)
) engine = InnoDB
  default charset = latin1;
