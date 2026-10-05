const API_URL =
    "http://localhost:5000/api";


const resetPasswordForm =
    document.getElementById(
        "resetPasswordForm"
    );


const resetMessage =
    document.getElementById(
        "resetMessage"
    );


resetPasswordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const username =
            document.getElementById(
                "username"
            ).value.trim();

document.getElementById("username").value =
    username;

        const newPassword =
            document.getElementById(
                "newPassword"
            ).value;


        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            ).value;


        if (
            newPassword !==
            confirmPassword
        ) {

            resetMessage.textContent =
                "Passwords do not match.";

            resetMessage.style.color =
                "red";

            return;

        }


        if (newPassword.length < 6) {

            resetMessage.textContent =
                "Password must be at least 6 characters.";

            resetMessage.style.color =
                "red";

            return;

        }


        resetMessage.textContent =
            "Resetting password...";

        resetMessage.style.color =
            "black";


        try {

            const response =
                await fetch(
                    `${API_URL}/reset-password`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            username:
                                username,

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
                    "Password reset failed"
                );

            }


            resetMessage.textContent =
                data.message;

            resetMessage.style.color =
                "green";


            resetPasswordForm.reset();


            setTimeout(
                () => {

                    window.location.href =
                        "login.html";

                },
                1500
            );


        } catch (error) {

            console.error(
                "Reset password error:",
                error
            );


            resetMessage.textContent =
                error.message ||
                "Password reset failed";

            resetMessage.style.color =
                "red";

        }

    }
);