const API_URL = "https://grading-system-production.up.railway.app/api";


async function loadDashboard() {

    try {

        const response =
            await fetch(`${API_URL}/dashboard`);

        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message
            );

        }


        // ==============================
        // BASIC STATISTICS
        // ==============================

        document.getElementById(
            "totalStudents"
        ).textContent =
            data.students;


        document.getElementById(
            "totalSubjects"
        ).textContent =
            data.subjects;


        document.getElementById(
            "totalMarks"
        ).textContent =
            data.marks;


        document.getElementById(
            "passedStudents"
        ).textContent =
            data.passed;


        document.getElementById(
            "failedStudents"
        ).textContent =
            data.failed;


        // ==============================
        // PASS PERCENTAGE
        // ==============================

        const totalCompleted =
            Number(data.passed) +
            Number(data.failed);


        let passPercentage = 0;


        if (totalCompleted > 0) {

            passPercentage =
                (
                    Number(data.passed) /
                    totalCompleted
                ) * 100;

        }


        document.getElementById(
            "passPercentage"
        ).textContent =
            passPercentage.toFixed(1) + "%";


        // ==============================
        // GRADE COUNTS
        // ==============================

        document.getElementById(
            "aPlusCount"
        ).textContent =
            data.grades.A_PLUS || 0;


        document.getElementById(
            "aCount"
        ).textContent =
            data.grades.A || 0;


        document.getElementById(
            "bPlusCount"
        ).textContent =
            data.grades.B_PLUS || 0;


        document.getElementById(
            "bCount"
        ).textContent =
            data.grades.B || 0;


        document.getElementById(
            "cCount"
        ).textContent =
            data.grades.C || 0;


        document.getElementById(
            "dCount"
        ).textContent =
            data.grades.D || 0;


        document.getElementById(
            "fCount"
        ).textContent =
            data.grades.F || 0;


        // ==============================
        // ACADEMIC OVERVIEW
        // ==============================

        const academicTable =
            document.getElementById(
                "academicTable"
            );


        academicTable.innerHTML = "";


        data.academic.forEach(item => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${item.department}
                </td>

                <td>
                    ${item.year}
                </td>

                <td>
                    ${item.semester}
                </td>

                <td>
                    ${item.total_students}
                </td>

            `;


            academicTable.appendChild(row);

        });


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


loadDashboard();