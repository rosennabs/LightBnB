-- Insert rows in the users table
INSERT INTO users (name, email, password)
VALUES ('Onyeka Juss', 'o.juss@gmail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'),
('Tiva Helmes', 't.helmes@gmail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'),
('Grace Cut', 'g.cut@gmail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.');

-- Insert rows in the properties table
INSERT INTO properties (owner_id, title, thumbnail_photo_url, cover_photo_url, country, street, city, province, post_code)
VALUES (1, 'The Ranch', 'https://images.pexels.com/photos/2086676/pexels-photo-2086676.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/2086676/pexels-photo-2086676.jpeg', 'Canada', 'beaver street', 'Ottawa', 'Ontario', 'T6Q 2U3'),
(2, 'The Cascade Garden', 'https://images.pexels.com/photos/2086676/pexels-photo-2086676.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/2086676/pexels-photo-2086676.jpeg', 'Canada', 'Elf street', 'Banff', 'Alberta', 'f6Q 4U2'),
(3, 'The Elk Island', 'https://images.pexels.com/photos/2086676/pexels-photo-2086676.jpeg?auto=compress&cs=tinysrgb&h=350', 'https://images.pexels.com/photos/2086676/pexels-photo-2086676.jpeg', 'Canada', '121 street', 'Edmonton', 'Alberta', 'T6H 2V3');

-- Insert rows in the reservations table
INSERT INTO reservations (start_date, end_date, property_id, guest_id)
VALUES ('2018-09-11', '2018-09-26', 1, 1),
('2019-01-04', '2019-02-01', 2, 2),
('2021-10-01', '2021-10-14', 3, 3);

-- Insert rows in the property_reviews table
INSERT INTO property_reviews (guest_id, property_id, reservation_id, message)
VALUES (1, 3, 2, 'messages'),
(2, 2, 2, 'messages'),
(3, 1, 1, 'messages');