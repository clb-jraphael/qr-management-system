<?php

$db = new mysqli("p:localhost", "root", "root123", "webdb");

if ($db->connect_errno) {
    die("Cannot establish connection to database" . $db->connect_error);
}