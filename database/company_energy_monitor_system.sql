-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 12, 2025 at 07:07 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `company_energy_monitor_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `consultation`
--

CREATE TABLE `consultation` (
  `Consultation_ID` int(11) NOT NULL,
  `User_Email` varchar(30) NOT NULL,
  `DateTime` datetime NOT NULL,
  `Details` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `energy_consumption`
--

CREATE TABLE `energy_consumption` (
  `Consumption_ID` int(11) NOT NULL,
  `Monitor_ID` int(11) NOT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `Consumption_Value` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `energy_production`
--

CREATE TABLE `energy_production` (
  `Production_ID` int(11) NOT NULL,
  `Monitor_ID` int(11) NOT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `Production_Value` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `energy_reserves`
--

CREATE TABLE `energy_reserves` (
  `EnergyReserves_ID` int(11) NOT NULL,
  `Monitor_ID` int(11) NOT NULL,
  `EnergyConsumption_ID` int(11) NOT NULL,
  `EnergyProduction_ID` int(11) NOT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `Reserve_Amount` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `environmental_data`
--

CREATE TABLE `environmental_data` (
  `EnvData_ID` int(11) NOT NULL,
  `Monitor_ID` int(11) NOT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `Light_Intensity` int(11) NOT NULL,
  `Temperature` float NOT NULL,
  `Humidity` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenance`
--

CREATE TABLE `maintenance` (
  `Maintenance_ID` int(11) NOT NULL,
  `User_Email` varchar(30) NOT NULL,
  `DateTime` datetime NOT NULL,
  `Details` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `monitors`
--

CREATE TABLE `monitors` (
  `Monitor_ID` int(11) NOT NULL,
  `User_Email` varchar(30) NOT NULL,
  `Location` varchar(50) NOT NULL,
  `Status` varchar(30) NOT NULL,
  `Microprocessor_Type` varchar(20) NOT NULL,
  `Installation_Date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `Notification_ID` int(11) NOT NULL,
  `Monitor_ID` int(11) NOT NULL,
  `EnergyConsumption_ID` int(11) NOT NULL,
  `EnergyProduction_ID` int(11) NOT NULL,
  `EnergyReserves_ID` int(11) NOT NULL,
  `EnvData_ID` int(11) NOT NULL,
  `SellRequest_ID` int(11) NOT NULL,
  `SolarData_ID` int(11) NOT NULL,
  `Timestamp` int(11) NOT NULL,
  `Notification_Type` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sell_request`
--

CREATE TABLE `sell_request` (
  `Request_ID` int(11) NOT NULL,
  `Monitor_ID` int(11) NOT NULL,
  `EnergyReserves_ID` int(11) DEFAULT NULL,
  `Energy_Amount` float NOT NULL,
  `Request_Date` datetime NOT NULL,
  `Status` varchar(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `solar_system_data`
--

CREATE TABLE `solar_system_data` (
  `SolarData_ID` int(11) NOT NULL,
  `Monitor_ID` int(11) NOT NULL,
  `EnergyProduction_ID` int(11) NOT NULL,
  `EnvData_ID` int(11) NOT NULL,
  `Theoretical_Panel_Production` float NOT NULL,
  `Exact_Panel_Production` float NOT NULL,
  `Panel_Efficiency` float NOT NULL,
  `Total_Energy_Generated` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `Staff_ID` int(11) NOT NULL,
  `Name` int(11) NOT NULL,
  `Email` int(11) NOT NULL,
  `Password` int(11) NOT NULL,
  `Address` varchar(50) NOT NULL,
  `Age` int(11) NOT NULL,
  `Role` varchar(25) NOT NULL,
  `Phone Number` varchar(18) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `Email` varchar(30) NOT NULL,
  `Name` varchar(30) NOT NULL,
  `Password` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `consultation`
--
ALTER TABLE `consultation`
  ADD PRIMARY KEY (`Consultation_ID`),
  ADD KEY `User_Email` (`User_Email`);

--
-- Indexes for table `energy_consumption`
--
ALTER TABLE `energy_consumption`
  ADD PRIMARY KEY (`Consumption_ID`) USING BTREE,
  ADD KEY `Monitor_ID` (`Monitor_ID`);

--
-- Indexes for table `energy_production`
--
ALTER TABLE `energy_production`
  ADD PRIMARY KEY (`Production_ID`),
  ADD KEY `Monitor_ID` (`Monitor_ID`);

--
-- Indexes for table `energy_reserves`
--
ALTER TABLE `energy_reserves`
  ADD PRIMARY KEY (`EnergyReserves_ID`),
  ADD KEY `EnergyConsumption_ID` (`EnergyConsumption_ID`),
  ADD KEY `EnergyProduction_ID` (`EnergyProduction_ID`),
  ADD KEY `Monitor_ID` (`Monitor_ID`);

--
-- Indexes for table `environmental_data`
--
ALTER TABLE `environmental_data`
  ADD PRIMARY KEY (`EnvData_ID`),
  ADD KEY `Monitor_ID` (`Monitor_ID`);

--
-- Indexes for table `maintenance`
--
ALTER TABLE `maintenance`
  ADD PRIMARY KEY (`Maintenance_ID`),
  ADD KEY `User_Email` (`User_Email`);

--
-- Indexes for table `monitors`
--
ALTER TABLE `monitors`
  ADD PRIMARY KEY (`Monitor_ID`),
  ADD UNIQUE KEY `Location` (`Location`),
  ADD KEY `User_Email` (`User_Email`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`Notification_ID`),
  ADD KEY `EnergyConsumption_ID` (`EnergyConsumption_ID`),
  ADD KEY `EnergyProduction_ID` (`EnergyProduction_ID`),
  ADD KEY `EnergyReserves_ID` (`EnergyReserves_ID`),
  ADD KEY `EnvData_ID` (`EnvData_ID`),
  ADD KEY `SellRequest_ID` (`SellRequest_ID`),
  ADD KEY `SolarData_ID` (`SolarData_ID`),
  ADD KEY `Monitor_ID` (`Monitor_ID`);

--
-- Indexes for table `sell_request`
--
ALTER TABLE `sell_request`
  ADD PRIMARY KEY (`Request_ID`),
  ADD KEY `EnergyReserves_ID` (`EnergyReserves_ID`),
  ADD KEY `Monitor_ID` (`Monitor_ID`);

--
-- Indexes for table `solar_system_data`
--
ALTER TABLE `solar_system_data`
  ADD PRIMARY KEY (`SolarData_ID`),
  ADD KEY `EnvData_ID` (`EnvData_ID`),
  ADD KEY `EnergyProduction_ID` (`EnergyProduction_ID`),
  ADD KEY `Monitor_ID` (`Monitor_ID`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`Staff_ID`),
  ADD UNIQUE KEY `Phone Number` (`Phone Number`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `consultation`
--
ALTER TABLE `consultation`
  MODIFY `Consultation_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `energy_consumption`
--
ALTER TABLE `energy_consumption`
  MODIFY `Consumption_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `energy_production`
--
ALTER TABLE `energy_production`
  MODIFY `Production_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `energy_reserves`
--
ALTER TABLE `energy_reserves`
  MODIFY `EnergyReserves_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `environmental_data`
--
ALTER TABLE `environmental_data`
  MODIFY `EnvData_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `maintenance`
--
ALTER TABLE `maintenance`
  MODIFY `Maintenance_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `monitors`
--
ALTER TABLE `monitors`
  MODIFY `Monitor_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `Notification_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sell_request`
--
ALTER TABLE `sell_request`
  MODIFY `Request_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `solar_system_data`
--
ALTER TABLE `solar_system_data`
  MODIFY `SolarData_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `Staff_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `consultation`
--
ALTER TABLE `consultation`
  ADD CONSTRAINT `consultation_ibfk_1` FOREIGN KEY (`User_Email`) REFERENCES `users` (`Email`);

--
-- Constraints for table `energy_consumption`
--
ALTER TABLE `energy_consumption`
  ADD CONSTRAINT `energy_consumption_ibfk_1` FOREIGN KEY (`Monitor_ID`) REFERENCES `monitors` (`Monitor_ID`);

--
-- Constraints for table `energy_production`
--
ALTER TABLE `energy_production`
  ADD CONSTRAINT `energy_production_ibfk_1` FOREIGN KEY (`Monitor_ID`) REFERENCES `monitors` (`Monitor_ID`);

--
-- Constraints for table `energy_reserves`
--
ALTER TABLE `energy_reserves`
  ADD CONSTRAINT `energy_reserves_ibfk_1` FOREIGN KEY (`EnergyConsumption_ID`) REFERENCES `energy_consumption` (`Consumption_ID`),
  ADD CONSTRAINT `energy_reserves_ibfk_2` FOREIGN KEY (`EnergyProduction_ID`) REFERENCES `energy_production` (`Production_ID`),
  ADD CONSTRAINT `energy_reserves_ibfk_3` FOREIGN KEY (`Monitor_ID`) REFERENCES `monitors` (`Monitor_ID`);

--
-- Constraints for table `environmental_data`
--
ALTER TABLE `environmental_data`
  ADD CONSTRAINT `environmental_data_ibfk_1` FOREIGN KEY (`Monitor_ID`) REFERENCES `monitors` (`Monitor_ID`);

--
-- Constraints for table `maintenance`
--
ALTER TABLE `maintenance`
  ADD CONSTRAINT `maintenance_ibfk_1` FOREIGN KEY (`User_Email`) REFERENCES `users` (`Email`);

--
-- Constraints for table `monitors`
--
ALTER TABLE `monitors`
  ADD CONSTRAINT `monitors_ibfk_1` FOREIGN KEY (`User_Email`) REFERENCES `users` (`Email`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`EnergyConsumption_ID`) REFERENCES `energy_consumption` (`Consumption_ID`),
  ADD CONSTRAINT `notifications_ibfk_10` FOREIGN KEY (`SellRequest_ID`) REFERENCES `sell_request` (`Request_ID`),
  ADD CONSTRAINT `notifications_ibfk_11` FOREIGN KEY (`SolarData_ID`) REFERENCES `solar_system_data` (`SolarData_ID`),
  ADD CONSTRAINT `notifications_ibfk_12` FOREIGN KEY (`Monitor_ID`) REFERENCES `monitors` (`Monitor_ID`),
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`EnergyProduction_ID`) REFERENCES `energy_production` (`Production_ID`),
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`EnergyConsumption_ID`) REFERENCES `energy_consumption` (`Consumption_ID`),
  ADD CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`EnergyConsumption_ID`) REFERENCES `energy_consumption` (`Consumption_ID`),
  ADD CONSTRAINT `notifications_ibfk_5` FOREIGN KEY (`EnergyProduction_ID`) REFERENCES `energy_production` (`Production_ID`),
  ADD CONSTRAINT `notifications_ibfk_6` FOREIGN KEY (`EnergyConsumption_ID`) REFERENCES `energy_consumption` (`Consumption_ID`),
  ADD CONSTRAINT `notifications_ibfk_7` FOREIGN KEY (`EnergyProduction_ID`) REFERENCES `energy_production` (`Production_ID`),
  ADD CONSTRAINT `notifications_ibfk_8` FOREIGN KEY (`EnergyReserves_ID`) REFERENCES `energy_reserves` (`EnergyReserves_ID`),
  ADD CONSTRAINT `notifications_ibfk_9` FOREIGN KEY (`EnvData_ID`) REFERENCES `environmental_data` (`EnvData_ID`);

--
-- Constraints for table `sell_request`
--
ALTER TABLE `sell_request`
  ADD CONSTRAINT `sell_request_ibfk_1` FOREIGN KEY (`EnergyReserves_ID`) REFERENCES `energy_reserves` (`EnergyReserves_ID`),
  ADD CONSTRAINT `sell_request_ibfk_2` FOREIGN KEY (`Monitor_ID`) REFERENCES `monitors` (`Monitor_ID`);

--
-- Constraints for table `solar_system_data`
--
ALTER TABLE `solar_system_data`
  ADD CONSTRAINT `solar_system_data_ibfk_1` FOREIGN KEY (`EnergyProduction_ID`) REFERENCES `energy_production` (`Production_ID`),
  ADD CONSTRAINT `solar_system_data_ibfk_2` FOREIGN KEY (`EnvData_ID`) REFERENCES `environmental_data` (`EnvData_ID`),
  ADD CONSTRAINT `solar_system_data_ibfk_3` FOREIGN KEY (`EnergyProduction_ID`) REFERENCES `energy_production` (`Production_ID`),
  ADD CONSTRAINT `solar_system_data_ibfk_4` FOREIGN KEY (`Monitor_ID`) REFERENCES `monitors` (`Monitor_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
