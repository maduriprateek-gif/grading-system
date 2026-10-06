const API_URL =
    "https://grading-system-production.up.railway.app/api";


const loginForm =
    document.getElementById("loginForm");


const loginMessage =
    document.getElementById("loginMessage");


loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const username =
            document.getElementById(
                "username"
            ).value.trim();


        const password =
            document.getElementById(
                "password"
            ).value;


        loginMessage.textContent =
            "Logging in...";

        loginMessage.style.color =
            "black";


        try {

            const response =
                await fetch(
                    `${API_URL}/login`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            username:
                                username,

                            password:
                                password

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message
                );

            }


            // Save logged-in user

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(
                    data.user
                )
            );


            loginMessage.textContent =
                "Login successful!";

            loginMessage.style.color =
                "green";


            // Redirect to dashboard

            setTimeout(
                () => {

                    window.location.href =
                        "index.html";

                },
                500
            );


        } catch (error) {

            loginMessage.textContent =
                error.message ||
                "Login failed";

            loginMessage.style.color =
                "red";

        }

    }
);