--Show all reservations for a user
SELECT reservations.id, properties.title, reservations.start_date, cost_per_night, avg(property_reviews.rating) as average_rating
FROM properties
JOIN reservations ON property_id = properties.id
JOIN property_reviews ON reservation_id = reservations.id
WHERE reservations.guest_id = 1
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date
LIMIT 10;