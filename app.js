// ==========================================
// LOAD TEMPLE INFORMATION
// ==========================================

async function loadTemple() {

    const response =
        await fetch("/api/temple");


    const temple =
        await response.json();


    const templeInfo =
        document.getElementById("templeInfo");


    templeInfo.innerHTML = `

        <h3>
            ${temple.name}
        </h3>

        <p>
            <strong>Location:</strong>
            ${temple.location}
        </p>

        <p>
            ${temple.description}
        </p>

        <p>
            <strong>Available Dates:</strong>
            ${temple.dates.join(", ")}
        </p>

    `;


    // Add dates to dropdown

    const dateSelect =
        document.getElementById("date");


    temple.dates.forEach(date => {

        const option =
            document.createElement("option");


        option.value =
            date;


        option.textContent =
            date;


        dateSelect.appendChild(option);

    });

}


// ==========================================
// LOAD SESSIONS
// ==========================================

async function loadSessions() {

    const response =
        await fetch("/api/sessions");


    const sessions =
        await response.json();


    const sessionSelect =
        document.getElementById(
            "sessionSelect"
        );


    const sessionCards =
        document.getElementById(
            "sessionCards"
        );


    sessionCards.innerHTML = "";


    sessions.forEach(session => {


        // Add session to dropdown

        const option =
            document.createElement("option");


        option.value =
            session.id;


        option.textContent =
            `${session.name} - ${session.time}`;


        sessionSelect.appendChild(
            option
        );


        // Create session card

        const card =
            document.createElement("div");


        card.className =
            "session-card";


        card.innerHTML = `

            <h3>
                ${session.name}
            </h3>

            <p>
                <strong>Time:</strong>
                ${session.time}
            </p>

            <p>
                <strong>Capacity:</strong>
                ${session.capacity}
                visitors
            </p>

        `;


        sessionCards.appendChild(card);

    });

}


// ==========================================
// LOAD BOOKINGS
// ==========================================

async function loadBookings() {

    const response =
        await fetch("/api/bookings");


    const bookings =
        await response.json();


    const bookingList =
        document.getElementById(
            "bookingList"
        );


    bookingList.innerHTML = "";


    if (bookings.length === 0) {

        bookingList.innerHTML =
            "<p>No bookings yet.</p>";

        return;

    }


    bookings.forEach(booking => {


        const card =
            document.createElement("div");


        card.className =
            "booking-card";


        card.innerHTML = `

            <h3>
                Booking #${booking.id}
            </h3>

            <p>
                <strong>Visitor:</strong>
                ${booking.visitorName}
            </p>

            <p>
                <strong>Contact:</strong>
                ${booking.phone}
            </p>

            <p>
                <strong>Number of Visitors:</strong>
                ${booking.numberOfVisitors}
            </p>

            <p>
                <strong>Date:</strong>
                ${booking.date}
            </p>

            <p>
                <strong>Session:</strong>
                ${booking.sessionName}
            </p>

            <p>
                <strong>Timing:</strong>
                ${booking.sessionTime}
            </p>

            <p>
                <strong>Status:</strong>
                ${booking.status}
            </p>


            ${
                booking.status === "Confirmed"

                ?

                `

                    <button
                        class="edit-button"
                        onclick="
                            editBooking(
                                ${booking.id}
                            )
                        "
                    >
                        Modify
                    </button>


                    <button
                        class="cancel-button"
                        onclick="
                            cancelBooking(
                                ${booking.id}
                            )
                        "
                    >
                        Cancel
                    </button>

                `

                :

                ""

            }

        `;


        bookingList.appendChild(card);

    });

}


// ==========================================
// CREATE OR UPDATE BOOKING
// ==========================================

document
    .getElementById("bookingForm")
    .addEventListener(
        "submit",
        async function(event) {


            // Stop page refresh

            event.preventDefault();


            // Get values

            const visitorName =
                document.getElementById(
                    "visitorName"
                ).value;


            const phone =
                document.getElementById(
                    "phone"
                ).value;


            const numberOfVisitors =
                document.getElementById(
                    "numberOfVisitors"
                ).value;


            const date =
                document.getElementById(
                    "date"
                ).value;


            const sessionId =
                document.getElementById(
                    "sessionSelect"
                ).value;


            // Create data object

            const bookingData = {

                visitorName:
                    visitorName,

                phone:
                    phone,

                numberOfVisitors:
                    Number(numberOfVisitors),

                date:
                    date,

                sessionId:
                    Number(sessionId)

            };


            // Check whether editing

            const form =
                document.getElementById(
                    "bookingForm"
                );


            const editingId =
                form.dataset.editingId;


            let response;


            // ==================================
            // UPDATE
            // ==================================

            if (editingId) {

                response =
                    await fetch(

                        `/api/bookings/${editingId}`,

                        {

                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    bookingData
                                )

                        }

                    );

            }


            // ==================================
            // CREATE
            // ==================================

            else {

                response =
                    await fetch(

                        "/api/bookings",

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    bookingData
                                )

                        }

                    );

            }


            // Get server response

            const result =
                await response.json();


            const message =
                document.getElementById(
                    "message"
                );


            // ==================================
            // SUCCESS
            // ==================================

            if (response.ok) {

                message.textContent =
                    result.message;


                message.style.color =
                    "green";


                // Reset form

                form.reset();


                // Remove editing mode

                delete form.dataset.editingId;


                // Change button back

                document.getElementById(
                    "submitButton"
                ).textContent =
                    "Confirm Booking";


                // Hide cancel editing

                document.getElementById(
                    "cancelEditButton"
                ).style.display =
                    "none";


                // Reload bookings

                loadBookings();

            }


            // ==================================
            // ERROR
            // ==================================

            else {

                message.textContent =
                    result.message;


                message.style.color =
                    "red";

            }

        }
    );


// ==========================================
// MODIFY BOOKING
// ==========================================

async function editBooking(id) {


    // Get booking from backend

    const response =
        await fetch(
            `/api/bookings/${id}`
        );


    const booking =
        await response.json();


    if (!response.ok) {

        alert(
            booking.message
        );

        return;

    }


    // Put existing information
    // into the form

    document.getElementById(
        "visitorName"
    ).value =
        booking.visitorName;


    document.getElementById(
        "phone"
    ).value =
        booking.phone;


    document.getElementById(
        "numberOfVisitors"
    ).value =
        booking.numberOfVisitors;


    document.getElementById(
        "date"
    ).value =
        booking.date;


    document.getElementById(
        "sessionSelect"
    ).value =
        booking.sessionId;


    // Store ID of booking being edited

    document.getElementById(
        "bookingForm"
    ).dataset.editingId =
        id;


    // Change button

    document.getElementById(
        "submitButton"
    ).textContent =
        "Update Booking";


    // Show cancel editing button

    document.getElementById(
        "cancelEditButton"
    ).style.display =
        "block";


    // Scroll to form

    document.getElementById(
        "booking"
    ).scrollIntoView({

        behavior: "smooth"

    });

}


// ==========================================
// CANCEL EDITING
// ==========================================

function cancelEdit() {


    const form =
        document.getElementById(
            "bookingForm"
        );


    // Clear form

    form.reset();


    // Remove editing ID

    delete form.dataset.editingId;


    // Change button back

    document.getElementById(
        "submitButton"
    ).textContent =
        "Confirm Booking";


    // Hide cancel button

    document.getElementById(
        "cancelEditButton"
    ).style.display =
        "none";


    // Clear message

    document.getElementById(
        "message"
    ).textContent = "";

}


// ==========================================
// CANCEL BOOKING
// ==========================================

async function cancelBooking(id) {


    const confirmCancel =
        confirm(
            "Are you sure you want to cancel this booking?"
        );


    if (!confirmCancel) {

        return;

    }


    const response =
        await fetch(

            `/api/bookings/${id}`,

            {

                method: "DELETE"

            }

        );


    const result =
        await response.json();


    alert(
        result.message
    );


    loadBookings();

}


// ==========================================
// START APPLICATION
// ==========================================

loadTemple();

loadSessions();

loadBookings();