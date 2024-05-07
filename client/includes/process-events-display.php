<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css">

    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <style>
    #sortIcon {
        float: right;
        margin-left: 5px; 
    }
</style>
</head>

<body>

<script>
        $(document).ready(function () {
            var ascendingOrder = true; // Variable to track sorting order

            // Function to sort events alphabetically
            function sortEventsAlphabetically() {
                var table, rows, switching, i, x, y, shouldSwitch;
                table = document.getElementById("table");
                switching = true;
                
                while (switching) {
                    switching = false;
                    rows = table.rows;
                    
                    for (i = 1; i < (rows.length - 1); i++) {
                        shouldSwitch = false;
                        x = rows[i].getElementsByTagName("TD")[0];
                        y = rows[i + 1].getElementsByTagName("TD")[0];
                        
                        var comparison = ascendingOrder ?
                            x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase() :
                            x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase();

                        if (comparison) {
                            shouldSwitch = true;
                            break;
                        }
                    }
                    
                    if (shouldSwitch) {
                        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                        switching = true;
                    }
                }
            }

            // Event listener for the sort icon
            $('#sortIcon').on('click', function () {
                sortEventsAlphabetically();
                ascendingOrder = !ascendingOrder; // Toggle sorting order
                updateSortIcon(); // Update the sort icon based on the order
            });

            // Function to update the sort icon based on the sorting order
            function updateSortIcon() {
                var sortIcon = $('#sortIcon');
                sortIcon.removeClass('bi-sort-up bi-sort-down'); // Remove existing classes

                if (ascendingOrder) {
                    sortIcon.addClass('bi-sort-up'); // Add class for sorting A to Z
                } else {
                    sortIcon.addClass('bi-sort-down'); // Add class for sorting Z to A
                }
            }
        });
</script>
</body>

</html>

<?php
require 'DBQueries.php';

    function displayAvailableEvents($db) {
        $events = getAvailableEvents($db);
        
        echo
            '
            <div class="row justify-content-center">
                <div class="col-auto">
                    <table class="table table-responsive" id="table">
                        <tr>
                            <th>Title<i id="sortIcon" class="bi bi-sort-up"></i></th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Location</th>
                            <th>Action</th>
                        </tr>
                </div>
            </div>';
    
        
        if ($events) {
            foreach ($events as $event) {
                $formattedStartDate = date('F j, Y', strtotime($event['startDate']));
                $formattedEndDate = date('F j, Y', strtotime($event['endDate']));
                $formattedStartTime = date('h:i A', strtotime($event['startTime']));
                $formattedEndTime = date('h:i A', strtotime($event['endTime']));
                
                echo '<tr id="event-row">';
        
                echo '<td id="event-name">' . $event['eventName'] . '</td>';
                
                if ($event['startDate'] == $event['endDate']) {
                echo '<td id="date">' . $formattedStartDate . '</td>';
                } else {
                echo '<td id="date">' . $formattedStartDate . ' to ' . $formattedEndDate . '</td>';
                }

                echo '<td id="time">' . $formattedStartTime . ' to ' . $formattedEndTime . '</td>';
                echo '<td id="location">' . $event['eventLocation'] . '</td>';
                echo '<td><button class="btn btn-primary register-qr"> Register </button></td>';
                echo '</tr>';
            }
            echo '</table>';
        } else {
            echo '</table>';
            echo '<p>There is no available events at this moment. Please check again later.</p>';
        }
    }

    function displayAttendance($db, $email) {
        $attendance = getAttendance($db, $email);
        echo
            '
            <div class="row justify-content-center">
                <div class="col-auto">
                    <table class="table table-responsive" id="table">
                        <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Check-in Date</th>
                            <th>Check-in Time</th>
                        </tr>
                </div>
            </div>';
        if ($attendance) {
            foreach ($attendance as $event) {
                $formattedStartDate = date('F j, Y', strtotime($event['startDate']));
                $formattedEndDate = date('F j, Y', strtotime($event['endDate']));
                $formattedStartTime = date('h:i A', strtotime($event['startTime']));
                $formattedEndTime = date('h:i A', strtotime($event['endTime']));
                $formattedCheckInDate = date('F j, Y', strtotime($event['check_in_date']));
                $formattedCheckInTime = date('h:i A', strtotime($event['check_in_time']));
                
                echo '<tr>';

                echo '<td>' . $event['eventName'] . '</td>';
                if ($event['startDate'] == $event['endDate']) {
                    echo '<td>' . $formattedStartDate . '</td>';
                } else {
                    echo '<td>' . $formattedStartDate . ' to ' . $formattedEndDate . '</td>';
                }
                echo '<td>' . $formattedStartTime . ' to ' . $formattedEndTime . '</td>';
                echo '<td>' . $formattedCheckInDate . '</td>';
                echo '<td>' . $formattedCheckInTime . '</td>';

                echo '</tr>';
            }
            echo '</table>';
        } else {
            echo '</table>';
            echo '<p>No attendance records found.</p>';
        }
    }

    function displayQRCodes($db, $email) {
        $registrations = getRegistrations($db, $email);
        
        if ($registrations) {
            echo '<div id="QRCards-container">';
            foreach ($registrations as $registration) {
                $formattedStartDate = date('F j, Y', strtotime($registration['startDate']));
                $formattedEndDate = date('F j, Y', strtotime($registration['endDate']));
                $formattedStartTime = date('h:i A', strtotime($registration['startTime']));
                $formattedEndTime = date('h:i A', strtotime($registration['endTime']));

                echo '<div id="QRCard">';
                echo '<h4 class="event-title">' . $registration['eventName'] . '</h4>';
                echo '<img class="QRCode" src="' . $registration['qrcode'] . '">';
                if ($registration['startDate'] == $registration['endDate']) {
                    echo '<p class="event-date">' . $formattedStartDate . '</p>';
                } else {
                    echo '<p class="event-date">' . $formattedStartDate . ' to ' . $formattedEndDate . '</p>';
                }
                echo '<p class="event-time">' . $formattedStartTime . ' to ' . $formattedEndTime . '</p>';
                echo '<a class="download-button" href="' . $registration['qrcode'] . '" download="QRCode_' . $registration['eventName'] . '_' . $registration['email'] .'.png">Download</a>';
                echo '</div>';
            }
            echo '</div>';
        } else {
            echo '<h1 class="registration-not-found"> You are not registered in any event/s. </h1>';
        }
    }