const API_URL = "/api";

const resultDepartment =
document.getElementById("resultDepartment");

const resultYear =
document.getElementById("resultYear");

const resultSemester =
document.getElementById("resultSemester");

const resultStudent =
document.getElementById("resultStudent");

const viewResult =
document.getElementById("viewResult");

const resultContainer =
document.getElementById("resultContainer");

let allStudents = [];

// =====================================
// LOAD ALL STUDENTS
// =====================================

async function loadStudents() {

try {

    const response =
        await fetch(`${API_URL}/students`);

    const data =
        await response.json();

    console.log("Students:", data);

    if (!response.ok || !data.success) {

        throw new Error(
            data.message ||
            "Failed to load students"
        );
    }

    allStudents = data.students;

    console.log(
        "Students loaded:",
        allStudents.length
    );

} catch (error) {

    console.error(
        "Failed to load students:",
        error
    );

    resultContainer.innerHTML = `
        <p style="color:red">
            Failed to load students.
        </p>
    `;
}

}

// =====================================
// DEPARTMENT CHANGE
// =====================================

resultDepartment.addEventListener(
"change",
function () {

    resultYear.value = "";

    resultSemester.value = "";

    resultStudent.innerHTML = `
        <option value="">
            Select Student
        </option>
    `;

    resultContainer.innerHTML = `
        <p>
            Select year, semester and student
            to view the result.
        </p>
    `;
}


);

// =====================================
// YEAR CHANGE
// =====================================

resultYear.addEventListener(
"change",
function () {


    resultSemester.value = "";

    resultStudent.innerHTML = `
        <option value="">
            Select Student
        </option>
    `;
}


);

// =====================================
// SEMESTER CHANGE
// =====================================

resultSemester.addEventListener(
"change",
function () {


    filterStudents();
}


);

// =====================================
// FILTER STUDENTS
// =====================================

function filterStudents() {


const department =
    resultDepartment.value
        .trim()
        .toUpperCase();

const year =
    Number(resultYear.value);

const semester =
    Number(resultSemester.value);


resultStudent.innerHTML = `
    <option value="">
        Select Student
    </option>
`;


if (
    !department ||
    !year ||
    !semester
) {
    return;
}


const students =
    allStudents.filter(student => {

        return (

            String(student.department)
                .trim()
                .toUpperCase()
                === department

            &&

            Number(student.year)
                === year

            &&

            Number(student.semester)
                === semester

        );
    });


students.sort(
    (a, b) =>
        String(a.roll_no)
            .localeCompare(
                String(b.roll_no),
                undefined,
                {
                    numeric: true
                }
            )
);


students.forEach(student => {

    const option =
        document.createElement("option");

    option.value =
        student.student_id;

    option.textContent =
        `${student.roll_no} - ${student.name}`;

    resultStudent.appendChild(option);
});


if (students.length === 0) {

    const option =
        document.createElement("option");

    option.value = "";

    option.textContent =
        "No students found";

    resultStudent.appendChild(option);
}


}

// =====================================
// VIEW RESULT
// =====================================

viewResult.addEventListener(
"click",
async function () {


    const studentId =
        resultStudent.value;


    if (!studentId) {

        alert(
            "Please select a student."
        );

        return;
    }


    resultContainer.innerHTML = `
        <p>
            Loading result...
        </p>
    `;


    try {

        const response =
            await fetch(
                `${API_URL}/results/${studentId}`
            );


        const data =
            await response.json();


        console.log(
            "Result:",
            data
        );


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to load result"
            );
        }


        const student =
            data.student;

        const subjects =
            data.subjects;

        const summary =
            data.summary;


        let html = `

            <div class="result-header">

                <h2>
                    ${student.name}
                </h2>

                <p>
                    <strong>
                        Roll Number:
                    </strong>
                    ${student.roll_no}
                </p>

                <p>
                    <strong>
                        Department:
                    </strong>
                    ${student.department}
                </p>

                <p>
                    <strong>
                        Year:
                    </strong>
                    ${student.year}
                </p>

                <p>
    <strong>Semester:</strong>
    Semester ${resultSemester.value}
</p>

            </div>

            <br>

            <table class="result-table">

                <thead>

                    <tr>

                        <th>
                            Subject Code
                        </th>

                        <th>
                            Subject
                        </th>

                        <th>
                            Marks
                        </th>

                        <th>
                            Grade
                        </th>

                        <th>
                            Grade Point
                        </th>

                    </tr>

                </thead>

                <tbody>
        `;


        subjects.forEach(subject => {

            html += `

                <tr>

                    <td>
                        ${subject.subject_code}
                    </td>

                    <td>
                        ${subject.subject_name}
                    </td>

                    <td>
                        ${subject.marks}
                    </td>

                    <td>
                        <span class="grade-badge">
                            ${subject.grade}
                        </span>
                    </td>

                    <td>
                        ${subject.grade_point}
                    </td>

                </tr>
            `;
        });


        html += `

                </tbody>

            </table>

            <br>

            <div class="summary">

                <h2>
                    Result Summary
                </h2>

                <br>

                <div class="summary-grid">

                    <div>

                        <strong>
                            Total Marks
                        </strong>

                        <span>
                            ${summary.total_marks}
                        </span>

                    </div>


                    <div>

                        <strong>
                            Percentage
                        </strong>

                        <span>
                            ${summary.percentage}%
                        </span>

                    </div>


                    <div>

                        <strong>
                            GPA
                        </strong>

                        <span>
                            ${summary.GPA}
                        </span>

                    </div>


                    <div>

                        <strong>
                            Status
                        </strong>

                        <span>
                            ${summary.status}
                        </span>

                    </div>

                </div>

                <br>

                <p>

                    <strong>
                        Failed Subjects:
                    </strong>

                    ${summary.failed_subjects}

                </p>

            </div>
        `;


        resultContainer.innerHTML = html;


        // =====================================
        // PRINT BUTTON
        // =====================================

        const printButton =
            document.createElement("button");

        printButton.textContent =
            "🖨 Print Marksheet";

        printButton.style.marginTop =
            "20px";

        printButton.onclick =
            function () {

                printResult(
                    resultContainer.innerHTML
                );
            };


        resultContainer.appendChild(
            printButton
        );


    } catch (error) {

        console.error(
            "Result loading error:",
            error
        );

        resultContainer.innerHTML = `

            <p style="color:red">

                ${error.message}

            </p>
        `;
    }
}


);

// =====================================
// START
// =====================================

loadStudents();

// =====================================
// PRINT MARKSHEET
// =====================================

function printResult(resultHTML) {

const printWindow =
    window.open(
        "",
        "_blank",
        "width=900,height=700"
    );


printWindow.document.write(`

    <!DOCTYPE html>

    <html>

    <head>

        <title>
            Student Marksheet
        </title>

        <style>

            body {

                font-family:
                    Arial, sans-serif;

                padding: 40px;

                color: #222;
            }

            h1 {

                text-align: center;

                margin-bottom: 5px;
            }

            .college-title {

                text-align: center;

                font-size: 14px;

                margin-bottom: 30px;
            }

            .result-header {

                border: 1px solid #ccc;

                padding: 20px;

                margin-bottom: 20px;
            }

            .result-header h2 {

                margin-top: 0;
            }

            table {

                width: 100%;

                border-collapse:
                    collapse;
            }

            th,
            td {

                border: 1px solid #333;

                padding: 10px;

                text-align: left;
            }

            th {

                background: #eee;
            }

            .grade-badge {

                font-weight: bold;
            }

            .summary {

                margin-top: 25px;

                border: 1px solid #ccc;

                padding: 20px;
            }

            .summary-grid {

                display: grid;

                grid-template-columns:
                    repeat(4, 1fr);

                gap: 15px;
            }

            .summary-grid div {

                border: 1px solid #ccc;

                padding: 15px;

                text-align: center;
            }

            .summary-grid strong {

                display: block;

                margin-bottom: 8px;
            }

            button {

                display: none;
            }

            @media print {

                body {

                    padding: 10px;
                }
            }

        </style>

    </head>

    <body>

        <h1>
            Student Marksheet
        </h1>

        <div class="college-title">
            Grading System
        </div>

        ${resultHTML}

    </body>

    </html>
`);


printWindow.document.close();

printWindow.focus();


setTimeout(
    function () {

        printWindow.print();

        printWindow.close();

    },
    500
);

}
