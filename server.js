const express = require("express");

const app = express();

const PORT = 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

// Allows the server to read JSON data
app.use(express.json());

// Allows the server to use files inside public folder
app.use(express.static("public"));


// ==========================================
// TEMPLE INFORMATION
// ==========================================

const temple = {
    id: 1,

    name: "Shree Ganesh Temple",

    location: "Mumbai, Maharashtra",

    description:
        "Shree Ganesh Temple provides scheduled darshan sessions so visitors can plan their visit conveniently.",

    dates: [
        "2026-08-20",
        "2026-08-21",
        "2026-08-22",
        "2026-08-23",
        "2026-08-24"
    ]
};


// ==========================================
// AVAILABLE DARSHAN SESSIONS
// ==========================================

const sessions = [
    {
        id: 1,
        name: "Morning Darshan",
        time: "8:00 AM - 10:00 AM",
        capacity: 50
    },

    {
        id: 2,
        name: "Afternoon Darshan",
        time: "12:00 PM - 2:00 PM",
        capacity: 50
    },

    {
        id: 3,
        name: "Evening Darshan",
        time: "5:00 PM - 7:00 PM",
        capacity: 50
    }
];


// ==========================================
// BOOKINGS
// ==========================================

// Temporary storage for bookings
let bookings = [];

let nextBookingId = 1;


// ==========================================
// GET TEMPLE INFORMATION
// ==========================================

app.get("/api/temple", (req, res) => {

    res.json(temple);

});


// ==========================================
// GET AVAILABLE DATES
// ==========================================

app.get("/api/dates", (req, res) => {

    res.json(temple.dates);

});


// ==========================================
// GET AVAILABLE SESSIONS
// ==========================================

app.get("/api/sessions", (req, res) => {

    res.json(sessions);

});


// ==========================================
// GET ALL BOOKINGS
// ==========================================

app.get("/api/bookings", (req, res) => {

    res.json(bookings);

});


// ==========================================
// GET ONE BOOKING
// ==========================================

app.get("/api/bookings/:id", (req, res) => {

    const id = Number(req.params.id);

    const booking = bookings.find(
        booking => booking.id === id
    );

    if (!booking) {

        return res.status(404).json({
            message: "Booking not found."
        });

    }

    res.json(booking);

});


// ==========================================
// CREATE NEW BOOKING
// ==========================================

app.post("/api/bookings", (req, res) => {

    const {
        visitorName,
        phone,
        numberOfVisitors,
        date,
        sessionId
    } = req.body;


    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (
        !visitorName ||
        !phone ||
        !numberOfVisitors ||
        !date ||
        !sessionId
    ) {

        return res.status(400).json({
            message: "Please fill in all required fields."
        });

    }


    // Check number of visitors

    if (
        Number(numberOfVisitors) < 1 ||
        Number(numberOfVisitors) > 10
    ) {

        return res.status(400).json({
            message: "Number of visitors must be between 1 and 10."
        });

    }


    // Check date

    if (!temple.dates.includes(date)) {

        return res.status(400).json({
            message: "The selected date is not available."
        });

    }


    // Find selected session

    const session = sessions.find(
        session => session.id === Number(sessionId)
    );


    if (!session) {

        return res.status(400).json({
            message: "Invalid session selected."
        });

    }


    // ==========================================
    // CHECK SESSION CAPACITY
    // ==========================================

    const bookedVisitors = bookings
        .filter(
            booking =>
                booking.date === date &&
                booking.sessionId === Number(sessionId) &&
                booking.status === "Confirmed"
        )
        .reduce(
            (total, booking) =>
                total + booking.numberOfVisitors,
            0
        );


    if (
        bookedVisitors +
        Number(numberOfVisitors) >
        session.capacity
    ) {

        return res.status(400).json({
            message:
                "Not enough seats available for this session."
        });

    }


    // ==========================================
    // CREATE BOOKING
    // ==========================================

    const newBooking = {

        id: nextBookingId++,

        visitorName: visitorName,

        phone: phone,

        numberOfVisitors:
            Number(numberOfVisitors),

        date: date,

        sessionId:
            Number(sessionId),

        sessionName:
            session.name,

        sessionTime:
            session.time,

        status: "Confirmed"

    };


    bookings.push(newBooking);


    res.status(201).json({

        message:
            "Booking confirmed successfully!",

        booking:
            newBooking

    });

});


// ==========================================
// UPDATE BOOKING
// ==========================================

app.put("/api/bookings/:id", (req, res) => {

    const id = Number(req.params.id);


    const booking = bookings.find(
        booking => booking.id === id
    );


    if (!booking) {

        return res.status(404).json({
            message: "Booking not found."
        });

    }


    const {
        visitorName,
        phone,
        numberOfVisitors,
        date,
        sessionId
    } = req.body;


    // Validation

    if (
        !visitorName ||
        !phone ||
        !numberOfVisitors ||
        !date ||
        !sessionId
    ) {

        return res.status(400).json({
            message: "Please fill in all required fields."
        });

    }


    if (
        Number(numberOfVisitors) < 1 ||
        Number(numberOfVisitors) > 10
    ) {

        return res.status(400).json({
            message:
                "Number of visitors must be between 1 and 10."
        });

    }


    if (!temple.dates.includes(date)) {

        return res.status(400).json({
            message:
                "The selected date is not available."
        });

    }


    const session = sessions.find(
        session => session.id === Number(sessionId)
    );


    if (!session) {

        return res.status(400).json({
            message:
                "Invalid session selected."
        });

    }


    // Check capacity excluding current booking

    const bookedVisitors = bookings

        .filter(
            item =>
                item.id !== id &&
                item.date === date &&
                item.sessionId === Number(sessionId) &&
                item.status === "Confirmed"
        )

        .reduce(
            (total, item) =>
                total + item.numberOfVisitors,
            0
        );


    if (
        bookedVisitors +
        Number(numberOfVisitors) >
        session.capacity
    ) {

        return res.status(400).json({
            message:
                "Not enough seats available."
        });

    }


    // Update booking

    booking.visitorName =
        visitorName;

    booking.phone =
        phone;

    booking.numberOfVisitors =
        Number(numberOfVisitors);

    booking.date =
        date;

    booking.sessionId =
        Number(sessionId);

    booking.sessionName =
        session.name;

    booking.sessionTime =
        session.time;


    res.json({

        message:
            "Booking updated successfully!",

        booking:
            booking

    });

});


// ==========================================
// CANCEL BOOKING
// ==========================================

app.delete("/api/bookings/:id", (req, res) => {

    const id = Number(req.params.id);


    const booking = bookings.find(
        booking => booking.id === id
    );


    if (!booking) {

        return res.status(404).json({
            message:
                "Booking not found."
        });

    }


    booking.status = "Cancelled";


    res.json({

        message:
            "Booking cancelled successfully!",

        booking:
            booking

    });

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(
        `DarshanEase server running at http://localhost:${PORT}`
    );

});