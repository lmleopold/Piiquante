## Piiquante – 6th project of the OpenClassrooms web-developer path
## Table of Contents
1. [General Info](#general-info)
2. [Technologies](#technologies)
3. [Installation](#installation)
## General Info
***
[![Project Status: Inactive – The project has reached a stable, usable state but is no longer being actively developed; support/maintenance will be provided as time allows.](https://www.repostatus.org/badges/latest/inactive.svg)](https://www.repostatus.org/#inactive)

The objective is to develop a hot sauce review web application (named Hot Sauces), allowing users to upload their favorite hot sauces and to like or dislike those shared by others
The different parts of this project were:
* build a noSQL database with MongoDB
* create a CRUD API with Node.JS and Express library in response to the specifications provided.
* manage image import when creating a sauce with the multer package
* manage user anthentication securely with JSON Webtoken
* improve API security with the Helmet module

Checkout here for more details about the technical specifications and mockups of this project :
* [technical_sepcifications]( Requirements_DW_P6.pdf)

Checkout the URL to take a look : https://lmleopold.github.io/Ohmyfood/
### Screenshots
|![Log in Page](login.png)|![Home Page]( Page_acceuil.png)|
|![Create / modify a sauce](Add_Sauce.png)|![Like/dislike a sauce]( Like_Sauce.png)|
## Technologies
***
A list of technologies used within the project:
* ![Node.JS](https://nodejs.org/)
* ![MongoDB](https://www.mongodb.com/)

|Libraries                                    |
|:--------------------------------------------|
|![bcrypt:^5.1.0](https://www.bcrypt.fr/)     |
|![dotenv:^16.0.3](https://www.npmjs.com/package/dotenv)|
|![express:^4.18.1](https://expressjs.com/)   |
|![jsonwebtoken:^8.5.1]( https://jwt.io/)     |
|![mongoose:^6.6.5]( https://mongoosejs.com/) |
|![mongoose-unique-validator:^3.1.0](https://www.npmjs.com/package/mongoose-unique-validator)|
|![multer:^1.4.5]( https://www.npmjs.com/package/multer)|

## Installation
***
### Back end prerequisites

You will need to have `Node` and `npm` installed locally on your machine. 
You will need a `MongoDB` Account

This project uses `.dotenv` to protect sensitive data related to the use of the MongoDB database. You must create a `.env`file at the root of the "backend" folder and add the following informations:
>IDENTIFIANT="enter your MongoDB username"
>PASSWORD="enter your MongoDB password"
>SECRET_KEY="enter your random secret token"

### Back end Installation ###

Clone this repo. From the "backend" folder of the project, run `npm install`. You can then run the server with `node server`. 
The server should run on `localhost` with default port `3000`. If the
server runs on another port for any reason, this is printed to the
console when the server starts, e.g. `Listening on port 3001`.

### Front end installation ###
From the "front" folder of the project, run `npm install`
run `npm run start`