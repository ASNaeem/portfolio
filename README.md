Install NodeJs and MySQL
Login to your MySQL
add the database to mysql database using the .sql file with source command
i.e. `source loacation/portfolio_db.sql` (replace location with the actual location of the file)
note: simply writing `source` and dragging the sql file also works
adjust the `dbConfig.json` file according to your MySQL credentials

run `npm install` in project directory to install all the required libraries
make sure the mysql service is running
start the server using `node app.js`
