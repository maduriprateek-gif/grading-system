const API_URL = "https://grading-system-production.up.railway.app/api";

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const forgotMessage =
    document.getElementById("forgotMessage");


forgotPasswordForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const username =
            document.getElementById("username").value.trim();


        if (!username) {

            forgotMessage.textContent =
                "Please enter your username.";

            forgotMessage.style.color =
                "red";

            return;

        }


        forgotMessage.textContent =
            "Verifying username...";

        forgotMessage.style.color =
            "black";


        try {

            const response =
                await fetch(
                    `${API_URL}/forgot-password`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username: username
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to verify username"
                );

            }


            forgotMessage.textContent =
                data.message;

            forgotMessage.style.color =
                "green";


            // Save username for reset page

            localStorage.setItem(
                "resetUsername",
                username
            );


            // Redirect to reset password page

            setTimeout(() => {

                window.location.href =
                    "reset-password.html";

            }, 800);


        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );


            forgotMessage.textContent =
                error.message ||
                "Something went wrong.";

            forgotMessage.style.color =
                "red";

        }

    }
);