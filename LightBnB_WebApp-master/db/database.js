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

  const values = [id];

  return pool.query(`SELECT * FROM users WHERE id = $1`, values)
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
  const queryString = `INSERT INTO users (name, email, password)
  VALUES($1, $2, $3)
  RETURNING *`; // Returns the object that was inserted

  const values = [user.name, user.email, user.password];

  return pool.query(queryString, values)
    .then((res) => {
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
  
  const queryString = `SELECT reservations.*, properties.title as property_title, cost_per_night, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN reservations ON property_id = properties.id
  JOIN property_reviews ON reservation_id = reservations.id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2`;

  const values = [guest_id, limit];

  return pool.query(queryString, values)
    .then((res) => {
      return res.rows;
    })
    .catch((err) => console.error(err.message));
}; 
// getAllReservations (7, 10)

 

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  
  //Parameterize query to prevent SQL injection
  const queryString = `
  SELECT * FROM properties
  LIMIT $1;
  `;

  const values = [limit];

  return pool.query(queryString, values)
  .then((res) => {
    return res.rows;
  })
  .catch((err) => console.error(err.message));
};



/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};




module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
