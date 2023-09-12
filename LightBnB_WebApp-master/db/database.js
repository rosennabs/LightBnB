const properties = require("./json/properties.json");
const users = require("./json/users.json");

// Connect to the lightbnb database. Require pool connection for a multi-user purpose app 
const { Pool } = require('pg');

//Require the dotenv package to load variables from the .env file containing sensitive login info
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
}; 

const pool = new Pool(config);

//___________________________________________________________________________________________________________________
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
      
      return res.rows[0]; //returns the user object in the rows array
      
    })
    .catch((err) => console.error(err.message));
};


//___________________________________________________________________________________________________________________


/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {

  return pool.query(`SELECT * FROM users WHERE id = $1`, [id]) // Execute query using a refactored version of the queryString and value variables format above
    .then((res) => {
      //Checks if any user was found
      if (res.rows.length === 0) {
        return null;
      } 
      return res.rows[0]; // return user if found
       
    })
    .catch((err) => console.error(err.message));
};


//___________________________________________________________________________________________________________________


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  //Assign user table columns to a variable
  const userKeys = 'name, email, password';

  //Extract object values provided by user into an array
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
      return res.rows[0];
    })
    .catch((err) => console.error(err.message));

};
//___________________________________________________________________________________________________________________


/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  
  const queryString = `
  SELECT reservations.id, properties.*, avg(property_reviews.rating) as average_rating
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
      console.log(res.rows);
      return res.rows;
    })
    .catch((err) => console.error(err.message));
};  

 //___________________________________________________________________________________________________________________

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {

  const values = []; // Stores user's filters
  const filters = []; // Stores parameterized version of user's filters
  
  //Dynamically develop and parameterize query to prevent SQL injection
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON property_id = properties.id
  `; 

  // Filter by city
  if (options.city) {
    values.push(`%${options.city.charAt(0).toUpperCase() + options.city.slice(1).toLowerCase()}%`); // Convert city to sentence case and push it to values
    filters.push(`city LIKE $${values.length} `); // Push the query with the new length of filters as a placeholder for city
  }

  //Filter by owner_id
  if (options.owner_id) {
    values.push(options.owner_id); 
    filters.push(`owner_id = $${values.length} `);
  }

  //Filter by cost per night
  if (options.minimum_price_per_night && options.maximum_price_per_night) {
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

  //Filter by average rating
  if (options.minimum_rating) {
    values.push(options.minimum_rating);
    queryString += `
    HAVING avg(property_reviews.rating) >= $${values.length}`;
  }

  values.push(limit); // Specify limit of data to be returned
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${values.length};
  `; 

  //Execute query
  return pool.query(queryString, values)
    .then((res) => {
    return res.rows;
  })
  .catch((err) => console.error(err.message));
};


//___________________________________________________________________________________________________________________


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {

  //Assign the property keys to a variable as just strings
  const propertyKeys = Object.keys(property).join(", ");
  
  //Extract property object values provided by the user
  const propertyValues = Object.values(property);
 

  // Create placeholders for values by adding 1 to each index in the propertyValues array to match PostgreSQL parameterization indexing
  const valuesPlaceholders = propertyValues.map((_, index) => `$${index + 1}`).join(', ');

  const queryString = `
  INSERT INTO properties (${propertyKeys})
  VALUES (${valuesPlaceholders})
  RETURNING *;
  `;

  //Execute the query
  return pool.query(queryString, propertyValues)
    
    .then((res) => {
    return res.rows[0];
  })
  .catch((err) => console.error(err.message));
    
};

//___________________________________________________________________________________________________________________



module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
