// Global events array
let events = [];
let editingEventId = null; // Track which event is being edited

document.addEventListener("DOMContentLoaded", function () {
    updateLocationOptions();
});

/* =====================================================
   Toggle Location / Remote Fields
===================================================== */
function updateLocationOptions() {
    const modality = document.getElementById("event_modality").value;

    const locationGroup = document.getElementById("location_group");
    const remoteUrlGroup = document.getElementById("remote_url_group");

    if (modality === "In-Person") {
        locationGroup.style.display = "block";
        remoteUrlGroup.style.display = "none";
    } else {
        locationGroup.style.display = "none";
        remoteUrlGroup.style.display = "block";
    }
}

/* =====================================================
   Save Event (with Update Support)
===================================================== */
function saveEvent(event) {
    event.preventDefault();

    const form = document.getElementById("event_form");

    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    const eventDetails = {
        id: editingEventId || Date.now(), // unique ID for each event
        name: document.getElementById("event_name").value,
        weekday: document.getElementById("event_weekday").value,
        time: document.getElementById("event_time").value,
        modality: document.getElementById("event_modality").value,
        category: document.getElementById("event_category").value,
        location: document.getElementById("event_modality").value === "In-Person"
            ? document.getElementById("event_location").value
            : null,
        remote_url: document.getElementById("event_modality").value === "Remote"
            ? document.getElementById("event_remote_url").value
            : null,
        attendees: document.getElementById("event_attendees").value
    };

    if (editingEventId) {
        // UPDATE existing event
        const index = events.findIndex(ev => ev.id === editingEventId);
        events[index] = eventDetails;

        // Remove old card from UI
        const oldCard = document.querySelector(`.event[data-id="${editingEventId}"]`);
        if (oldCard) oldCard.remove();
    } else {
        // ADD new event
        events.push(eventDetails);
    }

    console.log(events);

    addEventToCalendarUI(eventDetails);

    form.reset();
    form.classList.remove("was-validated");
    updateLocationOptions();

    editingEventId = null; // reset

    const modalElement = document.getElementById("event_modal");
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstance.hide();
}

/* =====================================================
   Add Event to Calendar UI
===================================================== */
function addEventToCalendarUI(eventInfo) {
    let event_card = createEventCard(eventInfo);

    // Add click listener for updating
    event_card.addEventListener("click", () => editEvent(eventInfo.id));

    let dayDiv = document.getElementById(eventInfo.weekday.toLowerCase());
    dayDiv.appendChild(event_card);
}

/* =====================================================
   Create Event Card (Formatted Properly with Category Colors)
===================================================== */
function createEventCard(eventDetails) {
    let event_element = document.createElement('div');
    event_element.className = 'event border rounded m-1 p-2';
    event_element.setAttribute("data-id", eventDetails.id);

    // Category Color Logic
    switch (eventDetails.category) {
        case "Academic":
            event_element.style.backgroundColor = "#d1e7dd";
            break;
        case "Work":
            event_element.style.backgroundColor = "#cff4fc";
            break;
        case "Personal":
            event_element.style.backgroundColor = "#f8d7da";
            break;
        case "Social":
            event_element.style.backgroundColor = "#fff3cd";
            break;
        default:
            event_element.style.backgroundColor = "#e2e3e5";
    }

    let info = document.createElement('div');
    info.className = "small";

    info.innerHTML = `
        <div><strong>Event:</strong> ${eventDetails.name}</div>
        <div><strong>Category:</strong> ${eventDetails.category}</div>
        <div><strong>Time:</strong> ${eventDetails.time}</div>
        <div><strong>Modality:</strong> ${eventDetails.modality}</div>
        ${eventDetails.location ? `<div><strong>Location:</strong> ${eventDetails.location}</div>` : ""}
        ${eventDetails.remote_url ? `<div><strong>Remote URL:</strong> <a href="${eventDetails.remote_url}" target="_blank">Join Meeting</a></div>` : ""}
        <div><strong>Attendees:</strong> ${eventDetails.attendees}</div>
    `;

    event_element.appendChild(info);
    return event_element;
}

/* =====================================================
   Edit Event
===================================================== */
function editEvent(eventId) {
    const eventToEdit = events.find(ev => ev.id === eventId);
    if (!eventToEdit) return;

    editingEventId = eventId; // mark for update

    // Pre-fill modal fields
    document.getElementById("event_name").value = eventToEdit.name;
    document.getElementById("event_weekday").value = eventToEdit.weekday;
    document.getElementById("event_time").value = eventToEdit.time;
    document.getElementById("event_modality").value = eventToEdit.modality;
    document.getElementById("event_category").value = eventToEdit.category;
    document.getElementById("event_attendees").value = eventToEdit.attendees;
    document.getElementById("event_location").value = eventToEdit.location || "";
    document.getElementById("event_remote_url").value = eventToEdit.remote_url || "";

    updateLocationOptions(); // show correct fields

    const modalElement = document.getElementById("event_modal");
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstance.show();
}