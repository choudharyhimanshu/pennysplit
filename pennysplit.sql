-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jun 01, 2016 at 03:25 AM
-- Server version: 5.7.12-0ubuntu1
-- PHP Version: 7.0.4-7ubuntu2.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pennysplit`
--

-- --------------------------------------------------------

--
-- Table structure for table `buddies`
--

CREATE TABLE `buddies` (
  `fk_eid` int(11) NOT NULL,
  `mid` int(11) NOT NULL,
  `name` varchar(60) NOT NULL,
  `added_on` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `event`
--

CREATE TABLE `event` (
  `eid` int(11) NOT NULL,
  `slug` varchar(60) NOT NULL,
  `view_slug` varchar(60) NOT NULL,
  `title` varchar(50) NOT NULL,
  `currency` varchar(3) NOT NULL,
  `created_by` varchar(60) NOT NULL,
  `created_on` int(11) NOT NULL,
  `user_ip` varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `exid` int(11) NOT NULL,
  `fk_eid` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `fk_added_by` int(11) DEFAULT NULL,
  `created_on` int(11) NOT NULL,
  `tot_amount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `payees`
--

CREATE TABLE `payees` (
  `fk_exid` int(11) NOT NULL,
  `mid` int(11) NOT NULL,
  `amount` float NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `payers`
--

CREATE TABLE `payers` (
  `fk_exid` int(11) NOT NULL,
  `mid` int(11) NOT NULL,
  `amount` float NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `email` varchar(90) NOT NULL,
  `subscribed_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_ip` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `buddies`
--
ALTER TABLE `buddies`
  ADD KEY `fk_eid` (`fk_eid`);

--
-- Indexes for table `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`eid`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`exid`,`fk_eid`),
  ADD KEY `fk_eid` (`fk_eid`);

--
-- Indexes for table `payees`
--
ALTER TABLE `payees`
  ADD KEY `fk_exid` (`fk_exid`);

--
-- Indexes for table `payers`
--
ALTER TABLE `payers`
  ADD KEY `fk_exid` (`fk_exid`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `event`
--
ALTER TABLE `event`
  MODIFY `eid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `exid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `buddies`
--
ALTER TABLE `buddies`
  ADD CONSTRAINT `fk_eid` FOREIGN KEY (`fk_eid`) REFERENCES `event` (`eid`);

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`fk_eid`) REFERENCES `event` (`eid`);

--
-- Constraints for table `payees`
--
ALTER TABLE `payees`
  ADD CONSTRAINT `payees_ibfk_1` FOREIGN KEY (`fk_exid`) REFERENCES `expenses` (`exid`);

--
-- Constraints for table `payers`
--
ALTER TABLE `payers`
  ADD CONSTRAINT `payers_ibfk_1` FOREIGN KEY (`fk_exid`) REFERENCES `expenses` (`exid`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
