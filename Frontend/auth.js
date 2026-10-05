// =====================================
// AUTHENTICATION CHECK
// =====================================

const loggedInUser =
    localStorage.getItem("loggedInUser");


if (!loggedInUser) {

    window.location.href =
        "login.html";

}


// =====================================
// LOGOUT
// =====================================

function logout() {

    // Remove logged-in user
    localStorage.removeItem("loggedInUser");

    // Redirect to login page
    window.location.href =
        "login.html";

}
