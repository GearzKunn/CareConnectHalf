SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS care_requests;
DROP TABLE IF EXISTS `users`;


CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('elderly','caretaker','ngo','admin') NOT NULL,
  `status` enum('pending','approved') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;


-- Elders
INSERT INTO users (name, email, password, role, status) VALUES
('Elder One', 'elder1@example.com', 'hashed_password_here', 'elderly', 'pending'),
('Elder Two', 'elder2@example.com', 'hashed_password_here', 'elderly', 'pending');

-- Caretakers
INSERT INTO users (name, email, password, role, status) VALUES
('Caretaker One', 'caretaker1@example.com', 'hashed_password_here', 'caretaker', 'pending'),
('Caretaker Two', 'caretaker2@example.com', 'hashed_password_here', 'caretaker', 'pending');

-- NGOs
INSERT INTO users (name, email, password, role, status) VALUES
('NGO One', 'ngo1@example.com', 'hashed_password_here', 'ngo', 'pending');

-- Admins
INSERT INTO users (name, email, password, role, status) VALUES
('Admin One', 'admin1@example.com', 'hashed_password_here', 'admin', 'pending');

CREATE TABLE otp_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

