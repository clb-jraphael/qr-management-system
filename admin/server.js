const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');
const QRCode = require('qrcode');
const path = require('path');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const expressMySQLSession = require('express-mysql-session')(session);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('combined'));


const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'webdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});


//SESSION STORING
const sessionStore = new expressMySQLSession({
    clearExpired: true,
    checkExpirationInterval: 900000, // How often expired sessions will be cleared (in milliseconds)
    expiration: 86400000, // The maximum age of a valid session (in milliseconds)
    createDatabaseTable: true, // Automatically create the sessions table if it doesn't exists
    connectionLimit: 10, // Number of connections when creating a connection pool
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data',
        },
        primaryKey: 'session_id',
    },
}, db);

//SESSION
app.use(session({
    secret: 'asdfj',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
}));


// Log all incoming requests
app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    next();
});


//DIRECT TO INDEX
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//LOGIN BTN FROM INDEX
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [results] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);

        if (results.length > 0) {
            const hashedPassword = results[0].password;

            // Compare the entered password with the hashed password
            const passwordMatch = await bcrypt.compare(password, hashedPassword);

            if (passwordMatch) {
                // Passwords match, set user session
                req.session.user = {
                    email: results[0].email,
                };

                res.status(200).send('Login successful');
            } else {
                // Passwords do not match, send an error message to the client
                const errorMessage = 'Invalid credentials';
                res.status(401).send(errorMessage);
            }
        } else {
            // No user found with the given email
            const errorMessage = 'Invalid credentials';
            res.status(401).send(errorMessage);
        }
    } catch (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

//SIGN UP
app.post('/register', async (req, res) => {
    const { email, password, 'confirm-password': confirm_password } = req.body;

    //     const trimmedEmail = email.trim();
    //     const trimmedPassword = password.trim();
    //     const trimmedConfirmPassword = confirm_password.trim();

    // Validate input
    if (!email || !password || !confirm_password) {
        return res.status(400).send('All fields are required');
    }

    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match');
    }

    if (password.length < 8) {
        return res.status(400).send('Password must be at least 8 characters long');
    }

    // Check if the password contains at least one digit, one letter, and one special character
    if (!/(?=.*\d)(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9])/.test(password)) {
        return res.status(400).send('Password must contain at least one digit, one letter, and one special character');
    }

    try {
        // Check if email is already taken
        const [results] = await db.execute('SELECT * FROM admin WHERE email = ?', [email]);

        if (results.length > 0) {
            return res.status(400).send('Email is already taken');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        await db.execute('INSERT INTO admin (email, password) VALUES (?, ?)', [email, hashedPassword]);

        console.log('User registered successfully');
        res.send('User registered successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


//EVENT
app.get('/event', (req, res) => {
    console.log('Session user:', req.session.user);
    if (req.session.user) {
        // Render event page
        res.sendFile(path.join(__dirname, 'views', 'event.html'));
    } else {
        //If user is not authenticated redirect to login
        res.redirect('/');
    }
});

//SEARCH
app.get('/fetchData', async (request, response) => {
    const { draw, start, length, order, columns, search } = request.query;

    const column_index = order && order[0] && order[0].column;
    const column_sort_order = order === undefined ? 'desc' : order[0].dir;
    const column_name = column_index ? columns[column_index].data : 'event_id';
    const search_value = search.value;

    //SEARCH FUNCTION
    const search_query = search_value
        ? ` WHERE eventName LIKE '%${search_value}%' OR eventLocation LIKE '%${search_value}%'`
        : '';

    //SHOW here
    const query1 = `SELECT event_id, eventName, 
                    DATE_FORMAT(startDate, '%Y-%m-%d') as startDate,
                    DATE_FORMAT(endDate, '%Y-%m-%d') as endDate, 
                    DATE_FORMAT(startTime, '%h:%i %p') as startTime,
                    DATE_FORMAT(endTime, '%h:%i %p') as endTime,
                    eventLocation, noOfParticipant, status
                    FROM event ${search_query} ORDER BY ${column_name} ${column_sort_order} 
                    LIMIT ${start}, ${length}`;

    /*%Y-%m-%d - year-month-day
    %h:i: %p - hour:minute pm/am
    */
    //DATA RESULT
    const query2 = `SELECT COUNT(*) AS Total FROM event`;

    //FILTER DATA RESULT
    const query3 = `SELECT COUNT(*) AS Total FROM event ${search_query}`;

    //QUERY EXECUTION
    try {
        const [dataResult] = await db.execute(query1);

        const formattedData = dataResult.map(row => ({
            ...row,
        }));

        const [totalDataResult] = await db.execute(query2);
        const [totalFilterDataResult] = await db.execute(query3);

        response.json({
            draw: parseInt(draw),
            recordsTotal: totalDataResult[0].Total,
            recordsFiltered: totalFilterDataResult[0].Total,
            data: formattedData,
        });
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        response.status(500).send('Internal Server Error');
    }
});


//EVENT CRUD
app.post('/submitData', async (request, response) => {
    const event_id = request.body.event_id;

    const startDate = request.body.startDate;
    const endDate = request.body.endDate;
    const startTime = request.body.startTime;
    const endTime = request.body.endTime;
    const eventLocation = request.body.eventLocation;
    const noOfParticipant = request.body.noOfParticipant;
    const action = request.body.action;
    let query;
    let data;
    let message;

    //CREATE
    if (action === 'Insert') {
        const currentDate = new Date();
        const endDateObject = new Date(endDate);

        const eventName = request.body.eventName.trim();

        const status = endDateObject > currentDate ? 'Ongoing' : 'Finished';

        query = `INSERT INTO event (
            eventName, startDate, endDate, startTime, endTime,
            eventLocation, noOfParticipant, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;

        // Include status in the data array
        data = [eventName, startDate, endDate, startTime, endTime, eventLocation, noOfParticipant, status];
        message = 'Data has been inserted';
    }

    if (action === 'Edit') {
        const currentDate = new Date();
        console.log('currentDate:', currentDate);

        const endDateObject = new Date(endDate);
        console.log('endDate:', endDate);
        console.log('endDateObject:', endDateObject);

        const eventName = request.body.eventName.trim();

        const status = endDateObject > currentDate ? 'Ongoing' : 'Finished';
        console.log('status:', status);

        query = `UPDATE event SET 
                    eventName = ?,
                    startDate = ?,
                    endDate = ?,
                    startTime = ?,
                    endTime = ?,
                    eventLocation = ?,
                    noOfParticipant = ?,
                    status = ?
                 WHERE event_id = ?`;
        data = [eventName, startDate, endDate, startTime, endTime, eventLocation, noOfParticipant, status, event_id];
        message = 'Data has been updated';

        console.log('Query:', query);
        console.log('Data:', data);
    }

    //DELETE
    if (action === 'Delete') {
        query = `DELETE FROM event WHERE event_id = ?`;
        data = [event_id];
        message = 'Data has been deleted';
    }

    //QUERY EXECUTION
    try {
        const [result] = await db.execute(query, data);
        response.json({ 'message': message });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

//RENDER E.G.: SHOW 10, 25, AND SO ON
app.get('/fetchData/:id', async (request, response) => {
    const query = `SELECT * FROM event WHERE event_id = ?`;

    try {
        const [result] = await db.execute(query, [request.params.id]);
        response.json(result[0]);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

//USER
app.get('/usermngmt', (req, res) => {
    console.log('Session user:', req.session.user);
    if (req.session.user) {
        // Render event page
        res.sendFile(path.join(__dirname, 'views', 'user.html'));
    } else {
        //If user is not authenticated redirect to login
        res.redirect('/');
    }
});

//USER SEARCH
app.get('/fetchUserData', async (request, response) => {
    try {
        const { draw, start, length, order, columns, search } = request.query;

        const column_index = order && order[0] && order[0].column;
        const column_sort_order = order === undefined ? 'desc' : order[0].dir;
        const column_name = column_index ? columns[column_index].data : 'user_id';
        const search_value = search.value;

        // SEARCH FUNCTION
        const search_query = search_value
            ? ` WHERE email LIKE '%${search_value}%' OR firstname LIKE '%${search_value}%' 
            OR lastname LIKE '%${search_value}%' OR school LIKE '%${search_value}%'`
            : '';

        // SHOW
        const query1 = `SELECT user_id,
                        email,
                        firstname,
                        lastname,
                        school
                        FROM users ${search_query} ORDER BY ${column_name} ${column_sort_order} 
                        LIMIT ${start}, ${length}`;

        // console.log('Query:', query1);

        // DATA RESULT
        const [dataResult] = await db.execute(query1);

        console.log('Data Result:', dataResult);

        // FORMAT DATA
        const formattedData = dataResult.map(row => ({ ...row }));

        // TOTAL RECORDS
        const [totalDataResult] = await db.execute('SELECT COUNT(*) AS Total FROM users');
        const [totalFilterDataResult] = await db.execute(`SELECT COUNT(*) AS Total FROM users ${search_query}`);

        // HANDLE EMPTY RESULTS
        if (dataResult.length === 0) {
            console.log('No data found');
            return response.json({
                draw: request.query.draw,
                recordsTotal: totalDataResult[0]['Total'],
                recordsFiltered: totalFilterDataResult[0]['Total'],
                data: [],
            });
        }

        // SEND RESPONSE
        response.json({
            draw: request.query.draw,
            recordsTotal: totalDataResult[0]['Total'],
            recordsFiltered: totalFilterDataResult[0]['Total'],
            data: formattedData,
        });
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        response.status(500).send('Internal Server Error');
    }
});

//USER RENDER
app.get('/fetchUserData/:id', async (request, response) => {
    const query = `SELECT * FROM users WHERE user_id = ?`;

    try {
        const [result] = await db.execute(query, [request.params.id]);
        response.json(result[0]);
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

//USER DELETE
app.post('/submitUserData', async (request, response) => {
    const user_id = request.body.user_id;
    const action = request.body.action;
    let query;
    let data;
    let message;

    //DELETE
    if (action === 'Delete') {
        query = `DELETE FROM users WHERE user_id = ?`;
        data = [user_id];
        message = 'Data has been deleted';
    }

    //QUERY EXECUTION
    try {
        const [result] = await db.execute(query, data);
        response.json({ 'message': message });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/attendance', (req, res) => {
    // console.log('Session user:', req.session.user);
    if (req.session.user) {
        // Render event page
        res.sendFile(path.join(__dirname, 'views', 'attendance.html'));
        //res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    } else {
        // If user is not authenticated redirect to login
        res.redirect('/');
    }
});

//SEARCH
app.get('/fetchAttendance', async (request, response) => {
    const { draw, start, length, order, columns, search } = request.query;

    const column_index = order && order[0] && order[0].column;
    const column_sort_order = order === undefined ? 'desc' : order[0].dir;
    const column_name = column_index ? columns[column_index].data : 'attendance_id';
    const search_value = search.value;

    //SEARCH FUNCTION
    const search_query = search_value
        ? ` WHERE eventName LIKE '%${search_value}%' OR eventLocation LIKE '%${search_value}%'`
        : '';

    //SHOW here
    const query1 = `SELECT
                    e.eventName,
                    CONCAT(e.startDate, ' - ', e.endDate) AS eventDate,
                    CONCAT(e.startTime, ' - ', e.endTime) AS eventTime,
                    CONCAT(u.firstname, ' ', u.lastname) AS attendeeName,
                    DATE_FORMAT(a.check_in_date, '%Y-%m-%d') AS check_in_date,
                    DATE_FORMAT(a.check_in_time, '%h:%i %p') AS check_in_time
                    FROM users u
                    JOIN registration r ON u.user_id = r.user_id
                    JOIN attendance a ON r.registration_id = a.registration_id
                    JOIN event e ON r.event_id = e.event_id
                    ${search_query} 
                    ORDER BY ${column_name} ${column_sort_order} 
                    LIMIT ${start}, ${length}`;

    //DATA RESULT
    const query2 = `SELECT COUNT(*) AS Total FROM event`;

    //FILTER DATA RESULT
    const query3 = `SELECT COUNT(*) AS Total FROM event ${search_query}`;

    //QUERY EXECUTION
    try {
        const [dataResult] = await db.execute(query1);

        const formattedData = dataResult.map(row => ({
            ...row,
        }));

        const [totalDataResult] = await db.execute(query2);
        const [totalFilterDataResult] = await db.execute(query3);

        response.json({
            draw: parseInt(draw),
            recordsTotal: totalDataResult[0].Total,
            recordsFiltered: totalFilterDataResult[0].Total,
            data: formattedData,
        });
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        response.status(500).send('Internal Server Error');
    }
});



// LOGOUT BTN
app.get('/logout', (req, res) => {
    // console.log('Logout route accessed');

    // Check if a session exists
    if (req.session) {
        console.log('Session before destruction:', req.session);

        // Destroy the user's session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            // Logging for debugging
            console.log('Session destroyed successfully');

            // Redirect to login after logout
            res.redirect('/');
        });
    } else {
        // No session to destroy, redirect to login
        console.log('No session to destroy. Redirecting to login.');
        res.redirect('/');
    }
});

app.get('/qr', (req, res) => {
    console.log('Session user:', req.session.user);
    if (req.session.user) {
        // Render event page
        res.sendFile(path.join(__dirname, 'views', 'scan-qr.html'));
    } else {
        //If user is not authenticated redirect to login
        res.redirect('/');
    }
});

app.post('/generateQRCode', async (req, res) => {
    try {
        const data = req.body;
        const jsonData = JSON.stringify(data);

        //Get user_id and event_id
        const [result_user_id] = await db.query('SELECT user_id FROM users WHERE email = ?', data.email);
        const [result_event_id] = await db.query('SELECT event_id FROM event WHERE eventName = ?', data.eventTitle);
        const user_id = result_user_id[0].user_id;
        const event_id = result_event_id[0].event_id;


        //query for duplicate entry
        const [duplicate_registration] = await db.query('SELECT * FROM registration WHERE user_id= ? AND event_id = ?', [user_id, event_id]);
        if (duplicate_registration.length > 0) {
            return res.status(400).send(`You are already registered in ${data.eventTitle}.`);
        }

        const format = {
            type: 'png',
            width: 100,
            height: 100
        };

        QRCode.toDataURL(jsonData, format, async (err, url) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to generate QR code' });
            }

            res.json({ qrCode: url });
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/storeQRCode', async (req, res) => {
    const { qrCode, data } = req.body;

    try {
        // Get event_id and user_id based on data received
        const [result_user_id] = await db.query('SELECT user_id FROM users WHERE email = ?', data.email);
        const [result_event_id] = await db.query('SELECT event_id FROM event WHERE eventName = ?', data.eventTitle);
        const user_id = result_user_id[0].user_id;
        const event_id = result_event_id[0].event_id;

        // Get the current date and format it as YYYY-MM-DD
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];

        //Insert registration data
        const insertRegistration = `INSERT INTO registration (user_id, event_id, qrcode, registration_date) VALUES (?, ?, ?, ?)`;
        await db.query(insertRegistration, [user_id, event_id, qrCode, formattedDate]);
        console.log(`Successfully added ${data.email} to registration table.`);

        res.status(200).json({ error: 'QR code data stored successfully' });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/scanQRCode', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/scan-qr.html'));
});

app.post('/scanQRCode', async (req, res) => {
    const scannedData = req.body.scannedData;
    try {
        console.log('Scanned Data:', scannedData);

        parsedResult = JSON.parse(scannedData);
        const email = parsedResult.email;
        const eventTitle = parsedResult.eventTitle;

        // Get the current date and format it as YYYY-MM-DD
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];
        //get current time
        const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false });

        //get registration_id
        const [result_registration_id] = await db.query('SELECT r.registration_id FROM registration r JOIN users u ON r.user_id = u.user_id JOIN event e ON r.event_id = e.event_id WHERE u.email = ? AND e.eventName = ?', [email, eventTitle]);
        const registration_id = result_registration_id[0].registration_id;

        //query for duplicate attendance entry
        const [duplicate_attendance] = await db.query('SELECT * FROM attendance WHERE registration_id = ? AND check_in_date = ?', [registration_id, formattedDate]);
        if (duplicate_attendance.length > 0) {
            console.log(`Attendance of ${email} for ${eventTitle} is already registered.`);
            return res.status(400).send(`Attendance of ${email} for ${eventTitle} is already registered.`);
        }

        //insert attendance
        const insertAttendance = `INSERT INTO attendance (registration_id, check_in_date, check_in_time) VALUES (?, ?, ?)`;
        await db.query(insertAttendance, [registration_id, formattedDate, formattedTime]);
        console.log(`Successfully recorded attendance of ${email} in ${eventTitle}.`);
        return res.status(200).send(`Attendance of ${email} for ${eventTitle} successfully registered.`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/checkRegistrationId', async (req, res) => {

    const registrationId = req.body.registrationId;

    try {
        console.log(registrationId);
        // Query to check participant existence and retrieve user information
        const [result] = await db.query(`
            SELECT
                u.firstname,
                u.lastname,
                e.eventName AS event_name,
                u.school
            FROM
                registration r
            JOIN
                event e ON r.event_id = e.event_id
            JOIN
                users u ON r.user_id = u.user_id
            WHERE
                r.registration_id = ?;
        `, [registrationId]);
    
        if (result.length > 0) {
            // Participant exists
            const { firstName, lastName, event_name, school } = result[0];
            return res.status(200).json({
                message: `Name: ${firstName} ${lastName}\nEvent: ${event_name}\nSchool: ${school}`,
                firstName,
                lastName,
                event_name,
                school
            });
        } else {
            // Participant doesn't exist
            return res.status(404).json({ error: "Participant doesn't exist!" });
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }    
});

app.post('/granting', async (req, res) => {

    const participantData = req.body.participantData;

    const registration_id = participantData;
    try {

        console.log('Participant Data:', participantData );

        // Get the current date and format it as YYYY-MM-DD
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];
        //get current time
        const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false });

        //query for duplicate attendance entry
        const [duplicate_attendance] = await db.query('SELECT * FROM attendance WHERE registration_id = ? AND check_in_date = ?', [registration_id, formattedDate]);
        if (duplicate_attendance.length > 0) {
            console.log(`Already Registered`);
            return res.status(400).send(`Already Registered`);
        }

        //insert attendance 
        const insertAttendance = `INSERT INTO attendance (registration_id, check_in_date, check_in_time) VALUES (?, ?, ?)`;
        await db.query(insertAttendance, [registration_id, formattedDate, formattedTime]);
        console.log(`Recorded`);
        return res.status(200).send(`Recorded`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
