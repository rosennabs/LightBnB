-- Insert rows in the users table
INSERT INTO users (name, email)
VALUES ('Onyeka Juss', 'o.juss@gmail.com'),
('Tiva Helmes', 't.helmes@gmail.com'),
('Grace Cut', 'g.cut@gmail.com');

-- Insert rows in the properties table
INSERT INTO properties (owner_id, title, street, city, province, post_code)
VALUES (1, 'The Ranch', 'beaver street', 'Ottawa', 'Ontario', 'T6Q 2U3'),
(2, 'The Cascade Garden', 'Elf street', 'Banff', 'Alberta', 'f6Q 4U2'),
(3, 'The Elk Island', '121 street', 'Edmonton', 'Alberta', 'T6H 2V3');

-- Insert rows in the reservations table
INSERT INTO reservations (start_date, end_date, property_id, guest_id)
VALUES ('2018-09-11', '2018-09-26', 1, 1),
('2019-01-04', '2019-02-01', 2, 2),
('2021-10-01', '2021-10-14', 3, 3);

-- Insert rows in the property_reviews table
INSERT INTO property_reviews (guest_id, property_id, reservation_id)
VALUES (1, 3, 2),
(2, 2, 2),
(3, 1, 1);