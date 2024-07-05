API Documentation

Airport API
The Airport API is a RESTful API that provides information about airports around the world. It allows users to retrieve airport data by providing the IATA code of the airport.

Setup
To use the API, you need to make a GET request to the API endpoint. You can use any HTTP client or a tool like Postman to make the request.

Endpoints
The API has a single endpoint:

GET /airport/:iata_code

Request Parameters
iata_code: The IATA code of the airport (required)

Response Format:
We are checking if the Country data is available for the airport's city before including it in the response. If Country data is not available, we are setting it to null in the response. This ensures that the response is always in the required JSON structure, even if the Country data is not available.

Error Handling
If the API encounters an error, it returns a JSON response with an error message:
Sure, testing and debugging the API is an important step to ensure that it returns the correct data and handles edge cases properly. Here are some test cases that you can use to test the API:

Test with a valid "iata_code" parameter that exists in the database. Verify that the API returns the correct airport data, including the related city and country data.

Test with an invalid "iata_code" parameter that does not exist in the database. Verify that the API returns a 404 error message.

Test with a valid "iata_code" parameter that exists in the database, but the related city data is missing. Verify that the API returns the correct airport data, but with null in the address.city field.

Test with a valid "iata_code" parameter that exists in the database, but the related country data is missing. Verify that the API returns the correct airport data, but with null in the address.country field.

Test with an invalid route parameter. Verify that the API returns a 404 error message.

Test with an empty route parameter. Verify that the API returns a 404 error message.

Test with a route parameter that contains spaces. Verify that the API returns a 404 error message.

Test with a route parameter that contains special characters. Verify that the API returns a 404 error message.

Make sure to thoroughly test the API with different inputs and edge cases to ensure that it works as expected. If you encounter any issues, you can use console.log statements and debugging tools to identify and fix the problem.

Note
If the country is not available for a particular airport, the API returns null for the country object.
