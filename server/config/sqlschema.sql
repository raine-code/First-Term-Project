CREATE DATABASE IF NOT EXISTS seedtrack_db
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE seedtrack_db;

-- --------------------------------------------------------
-- Table: users
-- Serves Authentication & Role-based Access (ADMIN / STAFF)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    idUser INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    role ENUM('ADMIN', 'STAFF') NOT NULL DEFAULT 'STAFF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: municipalities
-- Location reference data for seed requests
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS municipalities (
    idMunicipality INT AUTO_INCREMENT PRIMARY KEY,
    town VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL DEFAULT 'N/A'
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: requesters
-- Institutional and individual requester profiles
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS requesters (
    idRequester INT AUTO_INCREMENT PRIMARY KEY,
    fName VARCHAR(50) NOT NULL,
    lName VARCHAR(50) NOT NULL,
    agency VARCHAR(150),
    emailAdd VARCHAR(100) NOT NULL,
    municipalityId INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_requesters_municipality 
        FOREIGN KEY (municipalityId) REFERENCES municipalities(idMunicipality) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: active_seeds
-- Active inventory stock, barcodes, viability, and storage location
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS active_seeds (
    idActive INT AUTO_INCREMENT PRIMARY KEY,
    accNo VARCHAR(50),
    name VARCHAR(150) NOT NULL,
    barcode VARCHAR(100) NOT NULL UNIQUE,
    currentWeight DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stockOnhand INT NOT NULL DEFAULT 0,
    viability DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    location VARCHAR(100),
    availability ENUM('AVAILABLE', 'UNAVAILABLE', 'RESERVED') NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: requests
-- Requisition orders containing status and processing deadlines
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS requests (
    idRequest INT AUTO_INCREMENT PRIMARY KEY,
    trackingNo VARCHAR(50) UNIQUE,
    idRequester INT NOT NULL,
    studyTitle VARCHAR(255) NOT NULL,
    weightReq DECIMAL(10, 2) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'DISPATCHED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    deadlineDate DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_requests_requester 
        FOREIGN KEY (idRequester) REFERENCES requesters(idRequester) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: request_line_items
-- Relates requests to specific seed varieties (Active Seeds)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS request_line_items (
    idLineItem INT AUTO_INCREMENT PRIMARY KEY,
    idRequest INT NOT NULL,
    idActive INT NOT NULL,
    weightReq DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_lineitems_request 
        FOREIGN KEY (idRequest) REFERENCES requests(idRequest) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_lineitems_active 
        FOREIGN KEY (idActive) REFERENCES active_seeds(idActive) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Performance Indexes for Optimization
-- --------------------------------------------------------
CREATE INDEX idx_seed_barcode ON active_seeds(barcode);
CREATE INDEX idx_request_status ON requests(status);
CREATE INDEX idx_request_deadline ON requests(deadlineDate);