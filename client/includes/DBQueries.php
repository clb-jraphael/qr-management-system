<?php
require 'database.php';

// Get a specific user email
function getEmail($db, $email) {
    $query = sprintf("SELECT * from users WHERE email = '%s'", $db->real_escape_string($email));
    $result = $db -> query($query);
    $user = $result-> fetch_assoc();
    return $user;
}

//Insert a specific user
function insertUserToDB($db, $email, $password, $firstname, $lastname, $school) {
    $query = "INSERT INTO users (email, password, firstname, lastname, school) VALUES (?, ?, ?, ?, ?)";
    $statement = $db->stmt_init();
    if(!$statement->prepare($query)) {
        die("Query error: " . $db->error);
    }
    $statement->bind_param("sssss", $email, $password, $firstname, $lastname, $school);
    $statement->execute();
}

//Get all ongoing events
function getAvailableEvents($db) {
    $query = "SELECT * FROM event WHERE status = 'ongoing'";
    $result = $db -> query($query);
    $events = $result -> fetch_all(MYSQLI_ASSOC);
    return $events;
}

//Get all attendance for a specific user
function getAttendance($db, $email) {
    $query = "SELECT
                    e.eventName,
                    e.startDate,
                    e.endDate,
                    e.startTime,
                    e.endTime,
                    a.check_in_date,
                    a.check_in_time
                FROM users u
                JOIN registration r ON u.user_id = r.user_id
                JOIN attendance a ON r.registration_id = a.registration_id
                JOIN event e ON r.event_id = e.event_id
                WHERE u.email = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $attendance = $result -> fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    return $attendance;
}

//Get registration table for a specific user
function getRegistrations($db, $email) {
    $query = "SELECT
                    u.email,
                    e.eventName,
                    r.qrcode,
                    e.startDate,
                    e.endDate,
                    e.startTime,
                    e.endTime
                FROM registration r
                JOIN users u ON r.user_id = u.user_id
                JOIN event e ON r.event_id = e.event_id
                WHERE u.email = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $registrations = $result -> fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    return $registrations;
}