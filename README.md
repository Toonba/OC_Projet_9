# OC_Projet_9 : Debug and test an HR SaaS 

For this project we are working on a new feature for an app called billed that allow Employee to create new bill and HR to accept or deny these bill. 
Code of this feature has been almost entierly done, our job is to test what has been done and made the correction if necessary. 
We used Jest as testing library. 

Below you will find many details on step needed to check what has been done 


## Project Architecture:
This frontend project is connected to a backend API service, which you also need to run locally.

The backend project can be found here: https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-back

## Setting up your workspace:
For proper organization, you can create a bill-app folder where you'll clone both the backend and frontend projects:

Clone the backend project into the bill-app folder:

`$ git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Back.git` 

`$ git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front.git`

## How to run the application locally?
### Step 1 - Run the backend:
Follow the instructions in the backend project's README.

### Step 2 - Run the frontend:
Go to the cloned frontend repository:

`$ cd Billed-app-FR-Front`

Install the npm packages (described in package.json):

`$ npm install`

Install live-server to launch a local server:

`$ npm install -g live-server`

Launch the application: 

`$ live-server`

Then go to the address: http://127.0.0.1:8080/

## How to run all tests locally with Jest?

## How to view the test coverage?
Go to: http://127.0.0.1:8080/coverage/lcov-report/

## Accounts and Users:
You can sign in using the following accounts:

### Administrator:
User: admin@test.tld
Password: admin

### Employee:
User: employee@test.tld
Password: employee


