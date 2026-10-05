const API_URL = "/api";

const form = document.getElementById("studentForm");
const message = document.getElementById("message");
const studentTable = document.getElementById("studentTable");


// Add student
form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const student = {
        roll_no: document.getElementById("roll_no").value,
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        department: document.getElementById("department").value,
        year: Number(document.getElementById("year").value)
    };

    try {

        const response = await fetch(`${API_URL}/students`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(student)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        message.textContent = data.message;
        message.style.color = "green";

        form.reset();

        loadStudents();

    } catch (error) {

        message.textContent = error.message;
        message.style.color = "red";

    }

});


// Load students
async function loadStudents() {

    try {

        const response = await fetch(`${API_URL}/students`);

        const data = await response.json();

        studentTable.innerHTML = "";

        data.students.forEach(student => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${student.student_id}</td>
                <td>${student.roll_no}</td>
                <td>${student.name}</td>
                <td>${student.email || ""}</td>
                <td>${student.department}</td>
                <td>${student.year}</td>
            `;

            studentTable.appendChild(row);

        });

    } catch (error) {

        console.error("Failed to load students:", error);

    }

}


// Load students when page opens
loadStudents();

// Load students into marks dropdown

async function loadStudentDropdown() {

    const response = await fetch(`${API_URL}/students`);

    const data = await response.json();

    const studentSelect = document.getElementById("student_id");

    data.students.forEach(student => {

        const option = document.createElement("option");

        option.value = student.student_id;

        option.textContent =
            `${student.roll_no} - ${student.name}`;

        studentSelect.appendChild(option);

    });

}


// Load subjects into dropdown

async function loadSubjectDropdown() {

    const response = await fetch(`${API_URL}/subjects`);

    const data = await response.json();

    const subjectSelect = document.getElementById("subject_id");

    data.subjects.forEach(subject => {

        const option = document.createElement("option");

        option.value = subject.subject_id;

        option.textContent =
            `${subject.subject_code} - ${subject.subject_name}`;

        subjectSelect.appendChild(option);

    });

}


// Save marks

const marksForm = document.getElementById("marksForm");

marksForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const student_id =
        document.getElementById("student_id").value;

    const subject_id =
        document.getElementById("subject_id").value;

    const marks =
        Number(document.getElementById("marks").value);


    try {

        const response = await fetch(`${API_URL}/marks`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                student_id,
                subject_id,
                marks
            })

        });


        const data = await response.json();


        if (!response.ok) {
            throw new Error(data.message);
        }


        document.getElementById("marksMessage").textContent =
            `${data.message} Grade: ${data.grade}, Grade Point: ${data.grade_point}`;

        document.getElementById("marksMessage").style.color = "green";

        marksForm.reset();


    } catch (error) {

        document.getElementById("marksMessage").textContent =
            error.message;

        document.getElementById("marksMessage").style.color = "red";

    }

});


// Load dropdowns

loadStudentDropdown();
loadSubjectDropdown();

// Load students for result dropdown

async function loadResultStudents() {

    const response = await fetch(`${API_URL}/students`);

    const data = await response.json();

    const select = document.getElementById("resultStudent");

    data.students.forEach(student => {

        const option = document.createElement("option");

        option.value = student.student_id;

        option.textContent =
            `${student.roll_no} - ${student.name}`;

        select.appendChild(option);

    });

}


// View result

document.getElementById("viewResult")
    .addEventListener("click", async () => {

        const studentId =
            document.getElementById("resultStudent").value;

        if (!studentId) {
            alert("Please select a student");
            return;
        }

        try {

            const response =
                await fetch(`${API_URL}/results/${studentId}`);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            const student = data.student;
            const subjects = data.subjects;
            const summary = data.summary;

            let html = `

                <h3>${student.name}</h3>

                <p>
                    <strong>Roll No:</strong>
                    ${student.roll_no}
                </p>

                <p>
                    <strong>Department:</strong>
                    ${student.department}
                </p>

                <p>
                    <strong>Year:</strong>
                    ${student.year}
                </p>

                <br>

                <table>

                    <thead>

                        <tr>
                            <th>Subject</th>
                            <th>Marks</th>
                            <th>Grade</th>
                            <th>Grade Point</th>
                        </tr>

                    </thead>

                    <tbody>
            `;

            subjects.forEach(subject => {

                html += `

                    <tr>

                        <td>
                            ${subject.subject_name}
                        </td>

                        <td>
                            ${subject.marks}
                        </td>

                        <td>
                            ${subject.grade}
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

                <h3>Result Summary</h3>

                <p>
                    <strong>Total Marks:</strong>
                    ${summary.total_marks}
                </p>

                <p>
                    <strong>Percentage:</strong>
                    ${summary.percentage}%
                </p>

                <p>
                    <strong>GPA:</strong>
                    ${summary.GPA}
                </p>

            `;

            document.getElementById("resultContainer")
                .innerHTML = html;

        } catch (error) {

            document.getElementById("resultContainer")
                .innerHTML =
                `<p style="color:red">${error.message}</p>`;

        }

    });


// Load result students

loadResultStudents();