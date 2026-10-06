const API_URL = "https://grading-system-production.up.railway.app/api";

const changePasswordForm =
    document.getElementById("changePasswordForm");

const changeMessage =
    document.getElementById("changeMessage");


changePasswordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const currentPassword =
            document.getElementById(
                "currentPassword"
            ).value;


        const newPassword =
            document.getElementById(
                "newPassword"
            ).value;


        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            ).value;


        const loggedInUser =
            JSON.parse(
                localStorage.getItem(
                    "loggedInUser"
                )
            );


        if (!loggedInUser) {

            changeMessage.textContent =
                "Please login first.";

            changeMessage.style.color =
                "red";

            return;

        }


        if (
            newPassword !==
            confirmPassword
        ) {

            changeMessage.textContent =
                "New passwords do not match.";

            changeMessage.style.color =
                "red";

            return;

        }


        if (newPassword.length < 6) {

            changeMessage.textContent =
                "Password must be at least 6 characters.";

            changeMessage.style.color =
                "red";

            return;

        }


        if (
            currentPassword ===
            newPassword
        ) {

            changeMessage.textContent =
                "New password must be different from current password.";

            changeMessage.style.color =
                "red";

            return;

        }


        changeMessage.textContent =
            "Changing password...";

        changeMessage.style.color =
            "black";


        try {

            const response =
                await fetch(
                    `${API_URL}/change-password`,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            username:
                                loggedInUser.username,

                            currentPassword:
                                currentPassword,

                            newPassword:
                                newPassword

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to change password"
                );

            }


            changeMessage.textContent =
                data.message;

            changeMessage.style.color =
                "green";


            changePasswordForm.reset();


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1500);


        } catch (error) {

            console.error(
                "Change password error:",
                error
            );


            changeMessage.textContent =
                error.message ||
                "Failed to change password";

            changeMessage.style.color =
                "red";

        }

    }
);