const properties = require("./json/properties.json");
const users = require("./json/users.json");


// Connect to the lightbnb database
const { Pool } = require('pg');

const pool = new Pool({
  user: 'rosennabs',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  
  //Retrieve data from lightbnb database and Parameterize query to prevent SQL injection
  const queryString = `
  SELECT * FROM users
  WHERE email = $1
  `;

  const values = [email]; //Email as the first element is represented by $1 above

  return pool.query(queryString, values)
    .then((res) => {
      //Checks if any user was found
      if (res.rows.length === 0) {
        return null;
      } 
      // console.log(res.rows);
      return res.rows;
      
    })
    .catch((err) => console.error(err.message));
};
// getUserWithEmail('rosennabs@gmail.com')




/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {

  return pool.query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((res) => {
      //Checks if any user was found
      if (res.rows.length === 0) {
        return null;
      } 
      return res.rows;
       
    })
    .catch((err) => console.error(err.message));
};




/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  //Assign user table columns to a variable
  const userKeys = 'name, email, password';

  //Extract object values provided by user
  const userValues = Object.values(user);

  //Create a placeholder for the userValues to be used for parameterization. Add 1 to the index of each element in the userValues array
  const valuesPlaceholders = userValues.map((_, index) => `$${index + 1}`).join(', ');

  // Define the query
  const queryString = `
  INSERT INTO users (${userKeys})
  VALUES(${valuesPlaceholders})
  RETURNING *;
  `; // Returns the object that was inserted

  return pool.query(queryString, userValues)
    .then((res) => {
      console.log(res.rows);
      return res.rows;
    })
    .catch((err) => console.error(err.message));

};

// const user = {
//   name: 'John Doe',
//   email: 'johndoe@outlook.com',
//   password: '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'
// }
// addUser(user);




/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  
  const queryString = `
  SELECT reservations.*, properties.title as property_title, cost_per_night, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN reservations ON property_id = properties.id
  JOIN property_reviews ON reservation_id = reservations.id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2;
  `;

  const values = [guest_id, limit];

  return pool.query(queryString, values)
    .then((res) => {
      return res.rows;
    })
    .catch((err) => console.error(err.message));
}; 
// getAllReservations (7,)

 

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {

  const values = []; // User's selected options used to parameterize queryString
  const filters = []; // Stores user's filters
  
  //Dynamically develop and parameterize query to prevent SQL injection
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON property_id = properties.id
  `; 

  if (options.city) { // Checks if the options object has a city property as filtered by the user
    values.push(`%${options.city}%`) // Adds the specified city name to values
    filters.push(`city LIKE $${values.length} `); // Push the query with the new length of filters as a placeholder for city name
  }

  if (options.owner_id) { //Only return properties belonging to filtered owner
    values.push(options.owner_id) // Push owner id to values
    filters.push(`owner_id = $${values.length} `); // Push the query with the new length of filters as a placeholder for owner_id
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) { // Return properties within the price range provided by user
    values.push(options.minimum_price_per_night);
    filters.push(`cost_per_night >= $${values.length}`);

    values.push(options.maximum_price_per_night);
    filters.push(`cost_per_night <= $${values.length}`);

  } else if (options.minimum_price_per_night) { //Return properties at only a minimum cost provided by user
    values.push(options.minimum_price_per_night);
    filters.push(`cost_per_night >= $${values.length}`);

  } else if (options.maximum_price_per_night) { //Return properties at only a maximum cost provided by user
    values.push(options.maximum_price_per_night);
    filters.push(`cost_per_night <= $${values.length}`);
  }
  
  // Concatenate the WHERE clause to queryString if any of the filters above is specified by user
  if (filters.length > 0) {
    queryString += `WHERE ${filters.join(' AND ')}`;
  }

  queryString += `
  GROUP BY properties.id`

  if (options.minimum_rating) { // Returns the minimum average rating specified by user
    values.push(options.minimum_rating);
    queryString += `
    HAVING avg(property_reviews.rating) >= $${values.length}`;
  }

  values.push(limit); // Specify limit of data to be returned
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${values.length};
  `; 

  return pool.query(queryString, values)
  .then((res) => { 
    console.log(res.rows)
    return res.rows;
  })
  .catch((err) => console.error(err.message));
};
//getAllProperties({ city: 'Birtle', minimum_price_per_night: 50360, maximum_price_per_night: 90224, minimum_rating: 3}); 


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {

  //Assign the property columns to a variable
  const propertyKeys = 'owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms';

  //Extract property object values provided by user into an array
  const propertyValues = Object.values(property);

  // Create placeholders for values by adding 1 to each index in the propertyValues array to match PostgreSQL parameterization indexes
  const valuesPlaceholders = propertyValues.map((_, index) => `$${index + 1}`).join(', ');

  const queryString = `
  INSERT INTO properties (${propertyKeys})
  VALUES (${valuesPlaceholders})
  RETURNING *;
  `;

  //Execute the query
  return pool.query(queryString, propertyValues)
  .then((res) => {
    console.log(res.rows);
    return res.rows;
  })
  .catch((err) => console.error(err.message));
    
};

// addProperty({
//   owner_id: 1,
//   title: 'Lay Castle',
//   description: 'Where all the magic happens',
//   thumbnail_photo_url: 'www.image.com',
//   cover_photo_url: 'www.photo.com',
//   cost_per_night: 34562,
//   street: 'Love',
//   city: 'The city of love',
//   province: 'Yukon',
//   post_code: 'T6E',
//   country: 'Canada',
//   parking_spaces: 2,
//   number_of_bathrooms: 3,
//   number_of_bedrooms: 4
// })



module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
