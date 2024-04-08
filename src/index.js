document.addEventListener("DOMContentLoaded", function () {
    // Base URL for the API
    const apiBaseUrl = "http://localhost:3000";

    // Function to fetch data from a URL
    function fetchDataFromUrl(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                return response.json();
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                throw error;
            });
    }

    // Function to fetch movie details from the server
    function fetchMovieDetails(movieId) {
        return fetchDataFromUrl(`${apiBaseUrl}/films/${movieId}`);
    }

    // Function to update ticket sales on the server
    function updateTicketsOnServer(movieId, ticketsSold) {
        return fetch(`${apiBaseUrl}/films/${movieId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tickets_sold: ticketsSold
            }),
        }).then(response => {
            if (!response.ok) {
                throw new Error("Failed to update ticket sales on server");
            }
            return response.json();
        }).catch(error => {
            console.error("Error updating ticket sales:", error);
            throw error;
        });
    }

    // Function to delete a movie from the server
    function deleteMovieFromServer(movieId) {
        return fetch(`${apiBaseUrl}/films/${movieId}`, {
            method: "DELETE",
        }).then(response => {
            if (!response.ok) {
                throw new Error("Failed to delete movie from server");
            }
            return response.json();
        }).catch(error => {
            console.error("Error deleting movie:", error);
            throw error;
        });
    }

    // Function to display movie details
    function displayMovieDetails(movie) {
        // Get DOM elements
        const titleElement = document.getElementById("title");
        const runtimeElement = document.getElementById("runtime");
        const descriptionElement = document.getElementById("film-info");
        const showtimeElement = document.getElementById("showtime");
        const remainingTicketsElement = document.getElementById("ticket-num");
        const posterElement = document.getElementById("poster");
        const buyButtonElement = document.getElementById("buy-ticket");
        const deleteButtonElement = document.getElementById("delete-movie");

        // Update DOM with movie details
        titleElement.textContent = movie.title;
        runtimeElement.textContent = `${movie.runtime} minutes`;
        descriptionElement.textContent = movie.description;
        showtimeElement.textContent = movie.showtime;
        const remainingTickets = movie.capacity - movie.tickets_sold;
        remainingTicketsElement.textContent = `${remainingTickets} tickets remaining`;
        posterElement.src = movie.poster;

        // Handle Buy Ticket button
        if (remainingTickets === 0) {
            buyButtonElement.textContent = "Sold Out";
            buyButtonElement.disabled = true;
        } else {
            buyButtonElement.textContent = "Buy Ticket";
            buyButtonElement.disabled = false;
            // Add event listener to Buy Ticket button
            buyButtonElement.onclick = function () {
                // Increase tickets sold and update on server
                movie.tickets_sold++;
                updateTicketsOnServer(movie.id, movie.tickets_sold)
                    .then(updatedMovie => displayMovieDetails(updatedMovie))
                    .catch(error => console.error("Error updating tickets:", error));
            };
        }

        // Handle Delete Movie button
        deleteButtonElement.onclick = function () {
            deleteMovieFromServer(movie.id)
                .then(() => {
                    // Remove movie from frontend
                    const filmListElement = document.getElementById("films");
                    const listItemToRemove = filmListElement.querySelector(`[data-movie-id="${movie.id}"]`);
                    if (listItemToRemove) {
                        filmListElement.removeChild(listItemToRemove);
                    }
                    // Clear movie details
                    titleElement.textContent = "";
                    runtimeElement.textContent = "";
                    descriptionElement.textContent = "";
                    showtimeElement.textContent = "";
                    remainingTicketsElement.textContent = "";
                    posterElement.src = "";
                    buyButtonElement.textContent = "";
                    buyButtonElement.disabled = true;
                    deleteButtonElement.style.display = "none";
                })
                .catch(error => console.error("Error deleting movie:", error));
        };
    }

    // Function to render movie menu
    function renderMovieMenu(movies) {
        const filmListElement = document.getElementById("films");
        filmListElement.innerHTML = ""; // Clear existing content

        // Loop through movies and create list items
        movies.forEach(movie => {
            const listItem = document.createElement("li");
            listItem.classList.add("film", "item");
            listItem.textContent = movie.title;
            listItem.dataset.movieId = movie.id; // Store movie ID in data attribute
            // Add event listener to each list item
            listItem.addEventListener("click", function () {
                displayMovieDetails(movie);
            });
            filmListElement.appendChild(listItem);
        });
    }

    // Fetch movies from the server and initialize
    fetchDataFromUrl(`${apiBaseUrl}/films`)
        .then(movies => {
            renderMovieMenu(movies);
            // Display details of the first movie
            if (movies.length > 0) {
                displayMovieDetails(movies[0]);
            }
        })
        .catch(error => console.error("Error fetching movies:", error));
});

