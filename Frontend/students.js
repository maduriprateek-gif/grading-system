const API_URL = "/api";

const form = document.getElementById("studentForm");
const message = document.getElementById("message");
const studentGroups = document.getElementById("studentGroups");
const studentSearch = document.getElementById("studentSearch");

let editingStudentId = null;
let allStudents = [];


// =====================================
// ADD / UPDATE STUDENT
// =====================================

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const student = {

        roll_no:
            document.getElementById("roll_no").value.trim(),

        name:
            document.getElementById("name").value.trim(),

        email:
            document.getElementById("email").value.trim(),

        department:
            document.getElementById("department").value,

        year:
            Number(document.getElementById("year").value),

        semester:
            Number(document.getElementById("semester").value)

    };


    try {

        let response;

        // UPDATE
        if (editingStudentId !== null) {

            response = await fetch(
                `${API_URL}/students/${editingStudentId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(student)
                }
            );

        }

        // ADD
        else {

            response = await fetch(
                `${API_URL}/students`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(student)
                }
            );

        }


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Something went wrong"
            );

        }


        message.textContent = data.message;
        message.style.color = "green";


        form.reset();

        document.getElementById("student_id").value = "";

        editingStudentId = null;


        const button =
            document.querySelector("#studentForm button");

        if (button) {

            button.textContent = "Add Student";

        }


        await loadStudents();


    } catch (error) {

        console.error(error);

        message.textContent = error.message;
        message.style.color = "red";

    }

});


// =====================================
// LOAD STUDENTS
// =====================================

async function loadStudents() {

    try {

        const response =
            await fetch(`${API_URL}/students`);


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Failed to load students"
            );

        }


        allStudents =
            data.students || [];


        displayStudents([...allStudents]);


    } catch (error) {

        console.error(
            "Load students error:",
            error
        );

        studentGroups.innerHTML =
            "<p>Unable to load students.</p>";

    }

}


// =====================================
// DISPLAY STUDENTS
// =====================================

function displayStudents(students) {

    studentGroups.innerHTML = "";


    if (students.length === 0) {

        studentGroups.innerHTML =
            "<p>No students found.</p>";

        return;

    }


    // Sort
    students.sort((a, b) => {

        const department =
            String(a.department || "")
                .localeCompare(
                    String(b.department || "")
                );

        if (department !== 0) {
            return department;
        }


        const year =
            Number(a.year || 0) -
            Number(b.year || 0);

        if (year !== 0) {
            return year;
        }


        const semester =
            Number(a.semester || 0) -
            Number(b.semester || 0);

        if (semester !== 0) {
            return semester;
        }


        return String(a.roll_no || "")
            .localeCompare(
                String(b.roll_no || ""),
                undefined,
                { numeric: true }
            );

    });


    // =====================================
    // GROUP DATA
    // =====================================

    const departments = {};


    students.forEach(student => {

        const department =
            student.department || "Unknown";

        const year =
            student.year || 0;

        const semester =
            student.semester || 0;


        if (!departments[department]) {

            departments[department] = {};

        }


        if (!departments[department][year]) {

            departments[department][year] = {};

        }


        if (
            !departments[department][year][semester]
        ) {

            departments[department][year][semester] = [];

        }


        departments[department][year][semester]
            .push(student);

    });


    // =====================================
    // CREATE TABLES
    // =====================================

    Object.keys(departments)
        .sort()
        .forEach(department => {

            const departmentCard =
                document.createElement("div");

            departmentCard.className =
                "dashboard-card";


            const departmentTitle =
                document.createElement("h2");

            departmentTitle.textContent =
                `${department} Department`;


            departmentCard.appendChild(
                departmentTitle
            );


            Object.keys(departments[department])
                .sort((a, b) => Number(a) - Number(b))
                .forEach(year => {

                    const yearTitle =
                        document.createElement("h3");

                    yearTitle.textContent =
                        `Year ${year}`;

                    yearTitle.style.marginTop =
                        "20px";


                    departmentCard.appendChild(
                        yearTitle
                    );


                    Object.keys(
                        departments[department][year]
                    )
                    .sort(
                        (a, b) =>
                            Number(a) - Number(b)
                    )
                    .forEach(semester => {

                        const semesterTitle =
                            document.createElement("h4");

                        semesterTitle.textContent =
                            `Semester ${semester}`;

                        semesterTitle.style.marginTop =
                            "15px";


                        departmentCard.appendChild(
                            semesterTitle
                        );


                        const table =
                            document.createElement("table");


                        table.innerHTML = `

                            <thead>

                                <tr>

                                    <th>ID</th>

                                    <th>Roll No</th>

                                    <th>Name</th>

                                    <th>Email</th>

                                    <th>Actions</th>

                                </tr>

                            </thead>

                            <tbody></tbody>

                        `;


                        const tbody =
                            table.querySelector("tbody");


                        departments[department][year][semester]
                            .forEach(student => {

                                const row =
                                    document.createElement("tr");


                                row.innerHTML = `

                                    <td>
                                        ${student.student_id}
                                    </td>

                                    <td>
                                        ${student.roll_no}
                                    </td>

                                    <td>
                                        ${student.name}
                                    </td>

                                    <td>
                                        ${student.email || "-"}
                                    </td>

                                    <td>

                                        <button
                                            type="button"
                                            class="student-edit-button"
                                            data-id="${student.student_id}"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            class="student-delete-button"
                                            data-id="${student.student_id}"
                                        >
                                            Delete
                                        </button>

                                    </td>

                                `;


                                tbody.appendChild(row);

                            });


                        departmentCard.appendChild(table);

                    });

                });


            studentGroups.appendChild(
                departmentCard
            );

        });

}


// =====================================
// EDIT / DELETE BUTTON HANDLER
// =====================================
//
// IMPORTANT:
// The buttons are created dynamically.
// So we handle clicks from studentGroups.
//

studentGroups.addEventListener(
    "click",
    function (event) {

        // =================================
        // EDIT
        // =================================

        const editButton =
            event.target.closest(
                ".student-edit-button"
            );


        if (editButton) {

            const studentId =
                Number(editButton.dataset.id);


            const student =
                allStudents.find(
                    s =>
                        Number(s.student_id) ===
                        studentId
                );


            if (!student) {

                console.error(
                    "Student not found:",
                    studentId
                );

                return;

            }

            editStudent(student);

            return;

        }


        // =================================
        // DELETE
        // =================================

        const deleteButton =
            event.target.closest(
                ".student-delete-button"
            );


        if (deleteButton) {

            const studentId =
                Number(deleteButton.dataset.id);


            deleteStudent(studentId);

        }

    }
);


// =====================================
// EDIT STUDENT
// =====================================

function editStudent(student) {

    editingStudentId =
        Number(student.student_id);

    document.getElementById("student_id").value =
    student.student_id || "";

    document.getElementById("roll_no").value =
        student.roll_no || "";


    document.getElementById("name").value =
        student.name || "";


    document.getElementById("email").value =
        student.email || "";


    document.getElementById("department").value =
        student.department || "";


    document.getElementById("year").value =
        student.year || "";


    document.getElementById("semester").value =
        student.semester || "";


    const button =
        document.querySelector(
            "#studentForm button"
        );


    if (button) {

        button.textContent =
            "Update Student";

    }


    message.textContent =
        `Editing ${student.name}`;

    message.style.color =
        "blue";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// =====================================
// DELETE STUDENT
// =====================================

async function deleteStudent(id) {

    const student =
        allStudents.find(
            s =>
                Number(s.student_id) ===
                Number(id)
        );


    const studentName =
        student
            ? student.name
            : "this student";


    const confirmed =
        confirm(
            `Are you sure you want to delete ${studentName}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        console.log(
            "Deleting student:",
            id
        );


        const response =
            await fetch(
                `${API_URL}/students/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        console.log(
            "Delete response:",
            data
        );


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to delete student"
            );

        }


        message.textContent =
            data.message;

        message.style.color =
            "green";


        await loadStudents();


    } catch (error) {

        console.error(
            "Delete student error:",
            error
        );


        message.textContent =
            error.message;

        message.style.color =
            "red";

    }

}


// =====================================
// SEARCH STUDENTS
// =====================================

studentSearch.addEventListener(
    "input",
    function () {

        const searchText =
            studentSearch.value
                .toLowerCase()
                .trim();


        if (!searchText) {

            displayStudents(
                [...allStudents]
            );

            return;

        }


        const filteredStudents =
            allStudents.filter(student => {

                const name =
                    String(
                        student.name || ""
                    )
                    .toLowerCase();


                const rollNo =
                    String(
                        student.roll_no || ""
                    )
                    .toLowerCase();


                const department =
                    String(
                        student.department || ""
                    )
                    .toLowerCase();


                return (

                    name.includes(searchText)

                    ||

                    rollNo.includes(searchText)

                    ||

                    department.includes(searchText)

                );

            });


        displayStudents(
            filteredStudents
        );

    }
);


// =====================================
// START
// =====================================

loadStudents();
