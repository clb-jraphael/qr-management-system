document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-event');
    searchInput.addEventListener('input', function () {
        const key = searchInput.value.trim().toLowerCase();
        filterTable(key);
    });
});

function filterTable(input) {
    const table = document.getElementById("table");
    const tbody = table.getElementsByTagName("tbody")[0];
    const rows = tbody.getElementsByTagName("tr");

    // Loop through all rows, starting from index 1 to exclude the header
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        let rowShouldBeVisible = false;

        if (cells.length > 0) {
            const cellText = cells[0].textContent.toLowerCase(); // Target the first cell (index 0) for movie title

            // If the cell text (movie title) contains the search term, make the row visible
            if (cellText.includes(input)) {
                rowShouldBeVisible = true;
            }
        }

        // Toggle the visibility of the row based on search results
        rows[i].style.display = rowShouldBeVisible ? "" : "none";
    }
}