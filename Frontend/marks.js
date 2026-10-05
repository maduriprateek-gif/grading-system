const departmentSelect = document.getElementById("marksDepartment");
const yearSelect = document.getElementById("marksYear");
const semesterSelect = document.getElementById("marksSemester");

const subjectSelect = document.getElementById("subject_id");
const studentSelect = document.getElementById("student_id");


// ==========================================
// LOAD STUDENTS
// ==========================================

async function loadStudents() {

    const department = departmentSelect.value;
    const year = yearSelect.value;
    const semester = semesterSelect.value;

    // Reset student dropdown
    studentSelect.innerHTML = `
        <option value="">
            Select Student
        </option>
    `;

    // Don't load until all three are selected
    if (!department || !year || !semester) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/students?` +
            `department=${encodeURIComponent(department)}` +
            `&year=${encodeURIComponent(year)}` +
            `&semester=${encodeURIComponent(semester)}`
        );

        const data = await response.json();

        console.log("Students:", data);

        if (!response.ok || !data.success) {

            studentSelect.innerHTML = `
                <option value="">
                    No Students Found
                </option>
            `;

            return;
        }

        if (!data.students || data.students.length === 0) {

            studentSelect.innerHTML = `
                <option value="">
                    No Students Found
                </option>
            `;

            return;
        }

        // Add students to dropdown
        data.students.forEach(student => {

            const option = document.createElement("option");

            option.value = student.student_id;

            option.textContent =
                `${student.roll_no} - ${student.name}`;

            studentSelect.appendChild(option);

        });

    } catch (error) {

        console.error("Student loading error:", error);

        studentSelect.innerHTML = `
            <option value="">
                Error Loading Students
            </option>
        `;
    }
}


// ==========================================
// LOAD SUBJECTS
// ==========================================

async function loadSubjects() {

    const department = departmentSelect.value;
    const year = yearSelect.value;
    const semester = semesterSelect.value;

    // Reset subject dropdown
    subjectSelect.innerHTML = `
        <option value="">
            Select Subject
        </option>
    `;

    // Don't load until all three are selected
    if (!department || !year || !semester) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/v1/rent/subjects?` +
            `department=${encodeURIComponent(department)}` +
            `&year=${encodeURIComponent(year)}` +
            `&semester=${encodeURIComponent(semester)}`
        );

        const data = await response.json();

        console.log("Subjects:", data);

        if (!response.ok || !data.success) {

            subjectSelect.innerHTML = `
                <option value="">
                    No Subject Found
                </option>
            `;

            return;
        }

        if (!data.subjects || data.subjects.length === 0) {

            subjectSelect.innerHTML = `
                <option value="">
                    No Subject Found
                </option>
            `;

            return;
        }

        // Add subjects to dropdown
        data.subjects.forEach(subject => {

            const option = document.createElement("option");

            option.value = subject.subject_id;

            option.textContent =
                `${subject.subject_code} - ${subject.subject_name}`;

            subjectSelect.appendChild(option);

        });

    } catch (error) {

        console.error("Subject loading error:", error);

        subjectSelect.innerHTML = `
            <option value="">
                Error Loading Subjects
            </option>
        `;
    }
}


// ==========================================
// WHEN DEPARTMENT CHANGES
// ==========================================

departmentSelect.addEventListener("change", () => {

    loadStudents();
    loadSubjects();

});


// ==========================================
// WHEN YEAR CHANGES
// ==========================================

yearSelect.addEventListener("change", () => {

    loadStudents();
    loadSubjects();

});


// ==========================================
// WHEN SEMESTER CHANGES
// ==========================================

semesterSelect.addEventListener("change", () => {

    loadStudents();
    loadSubjects();

});

// ==========================================
// SAVE MARKS
// ==========================================

const marksInput = document.getElementById("marks");
const saveMarksBtn = document.getElementById("saveMarksBtn");

saveMarksBtn.addEventListener("click", async () => {

    const studentId = studentSelect.value;
    const subjectId = subjectSelect.value;
    const marks = marksInput.value;

    // Validate student
    if (!studentId) {
        alert("Please select a student.");
        return;
    }

    // Validate subject
    if (!subjectId) {
        alert("Please select a subject.");
        return;
    }

    // Validate marks
    if (marks === "") {
        alert("Please enter marks.");
        return;
    }

    if (Number(marks) < 0 || Number(marks) > 100) {
        alert("Marks must be between 0 and 100.");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/api/marks",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    student_id: Number(studentId),
                    subject_id: Number(subjectId),
                    marks: Number(marks)
                })
            }
        );

        const data = await response.json();

        console.log("Save marks response:", data);

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Failed to save marks."
            );

            return;
        }

        alert(
            `Marks saved successfully!\n\n` +
            `Grade: ${data.grade}\n` +
            `Grade Point: ${data.grade_point}`
        );

        // Clear marks field
        marksInput.value = "";

    } catch (error) {

        console.error(
            "Save marks error:",
            error
        );

        alert(
            "Unable to connect to the server."
        );
    }

});

// ==========================================
// LOAD MARKS MANAGEMENT TABLE
// ==========================================

async function loadMarks() {

    const tableBody =
        document.getElementById("marksTableBody");

    if (!tableBody) {
        console.error("marksTableBody not found");
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="8">
                Loading marks...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            "http://localhost:5000/api/marks"
        );

        const data = await response.json();

        console.log("Marks:", data);

        if (!response.ok || !data.success) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Failed to load marks
                    </td>
                </tr>
            `;

            return;
        }

        if (!data.marks || data.marks.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        No marks found
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML = "";

        data.marks.forEach(mark => {

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>
                    ${mark.mark_id}
                </td>

                <td>
                    ${mark.roll_no}
                </td>

                <td>
                    ${mark.student_name}
                </td>

                <td>
                    ${mark.subject_code}
                    -
                    ${mark.subject_name}
                </td>

                <td>
                    <span class="marks-value">
                        ${mark.marks}
                    </span>
                </td>

                <td>
                    ${mark.grade || "-"}
                </td>

                <td>
                    ${mark.grade_point ?? "-"}
                </td>

                <td>

                    <button
                        type="button"
                        onclick="editMarks(${mark.mark_id}, ${mark.marks})"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        onclick="deleteMarks(${mark.mark_id})"
                    >
                        Delete
                    </button>

                </td>

            `;

            tableBody.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Load marks error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    Error loading marks
                </td>
            </tr>
        `;
    }
}

// ==========================================
// EDIT MARKS
// ==========================================

async function editMarks(markId, currentMarks) {

    const newMarks = prompt(
        "Enter new marks (0-100):",
        currentMarks
    );

    // Cancel clicked
    if (newMarks === null) {
        return;
    }

    const marks = Number(newMarks);

    if (
        newMarks.trim() === "" ||
        isNaN(marks) ||
        marks < 0 ||
        marks > 100
    ) {

        alert(
            "Please enter marks between 0 and 100."
        );

        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/marks/${markId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    marks: marks
                })
            }
        );

        const data = await response.json();

        console.log(
            "Update marks response:",
            data
        );

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Failed to update marks."
            );

            return;
        }

        alert(
            `Marks updated successfully!\n\n` +
            `New Grade: ${data.grade}\n` +
            `Grade Point: ${data.grade_point}`
        );

        // Refresh table
        loadMarks();

    } catch (error) {

        console.error(
            "Update marks error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}

// ==========================================
// DELETE MARKS
// ==========================================

async function deleteMarks(markId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this marks record?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/marks/${markId}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        console.log(
            "Delete marks response:",
            data
        );

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Failed to delete marks."
            );

            return;
        }

        alert(
            "Marks deleted successfully."
        );

        // Refresh table
        loadMarks();

    } catch (error) {

        console.error(
            "Delete marks error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}

// ==========================================
// LOAD TABLE WHEN PAGE OPENS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadMarks();

    }
);

// ==========================================
// LOAD EXISTING MARKS
// ==========================================

async function loadMarks() {

    const marksTable = document.getElementById("marksTable");

    if (!marksTable) {
        console.error("marksTable not found");
        return;
    }

    marksTable.innerHTML = `
        <tr>
            <td colspan="7">Loading marks...</td>
        </tr>
    `;

    try {

        const response = await fetch(
            "http://localhost:5000/api/marks"
        );

        const data = await response.json();

        console.log("Marks:", data);

        if (!response.ok || !data.success) {

            marksTable.innerHTML = `
                <tr>
                    <td colspan="7">
                        Failed to load marks
                    </td>
                </tr>
            `;

            return;
        }

        if (!data.marks || data.marks.length === 0) {

            marksTable.innerHTML = `
                <tr>
                    <td colspan="7">
                        No marks found
                    </td>
                </tr>
            `;

            return;
        }

        marksTable.innerHTML = "";

        data.marks.forEach(mark => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${mark.mark_id}</td>

                <td>
                    ${mark.roll_no} - ${mark.student_name}
                </td>

                <td>
                    ${mark.subject_code} -
                    ${mark.subject_name}
                </td>

                <td>
                    ${mark.marks}
                </td>

                <td>
                    ${mark.grade || "-"}
                </td>

                <td>
                    ${mark.grade_point ?? "-"}
                </td>

                <td>
    <button type="button" class="edit-mark-btn"
        data-id="${mark.mark_id}"
        data-marks="${mark.marks}">
        Edit
    </button>

    <button type="button" class="delete-mark-btn"
        data-id="${mark.mark_id}">
        Delete
    </button>
</td>
            `;

            marksTable.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Marks loading error:",
            error
        );

        marksTable.innerHTML = `
            <tr>
                <td colspan="7">
                    Error Loading Marks
                </td>
            </tr>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadMarks();

async function editMark(markId, currentMarks) {

    const newMarks = prompt(
        "Enter new marks (0 - 100):",
        currentMarks
    );

    // User clicked Cancel
    if (newMarks === null) {
        return;
    }

    const marks = Number(newMarks);

    // Validate
    if (
        isNaN(marks) ||
        marks < 0 ||
        marks > 100
    ) {
        alert("Please enter marks between 0 and 100.");
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/marks/${markId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    marks: marks
                })
            }
        );

        const data = await response.json();

        console.log("Update:", data);

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Failed to update marks"
            );

            return;
        }

        alert("Marks updated successfully!");

        // Reload table
        loadMarks();

    } catch (error) {

        console.error(
            "Update marks error:",
            error
        );

        alert("Error updating marks.");
    }
}


// ==========================================
// DELETE MARKS
// ==========================================

async function deleteMark(markId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this mark?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/marks/${markId}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        console.log("Delete:", data);

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Failed to delete marks"
            );

            return;
        }

        alert("Marks deleted successfully!");

        // Reload table
        loadMarks();

    } catch (error) {

        console.error(
            "Delete marks error:",
            error
        );

        alert("Error deleting marks.");
    }
}

});

// ==========================================
// EDIT / DELETE BUTTON EVENTS
// ==========================================

document.addEventListener("click", function (event) {

    // EDIT
    if (event.target.classList.contains("edit-mark-btn")) {

        const markId =
            event.target.dataset.id;

        const currentMarks =
            event.target.dataset.marks;

        editMark(
            markId,
            currentMarks
        );
    }


    // DELETE
    if (event.target.classList.contains("delete-mark-btn")) {

        const markId =
            event.target.dataset.id;

        deleteMark(markId);
    }

});


// ==========================================
// EDIT MARK
// ==========================================

async function editMark(markId, currentMarks) {

    const newMarks = prompt(
        "Enter new marks (0 - 100):",
        currentMarks
    );

    if (newMarks === null) {
        return;
    }

    const marks = Number(newMarks);

    if (
        isNaN(marks) ||
        marks < 0 ||
        marks > 100
    ) {

        alert(
            "Please enter marks between 0 and 100."
        );

        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/marks/${markId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    marks: marks
                })
            }
        );

        const data = await response.json();

        console.log(
            "Edit response:",
            data
        );

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Failed to update marks"
            );

            return;
        }

        alert(
            "Marks updated successfully!"
        );

        loadMarks();

    } catch (error) {

        console.error(
            "Edit error:",
            error
        );

        alert(
            "Could not connect to backend."
        );
    }
}


// ==========================================
// DELETE MARK
// ==========================================

async function deleteMark(markId) {

    const confirmed = confirm(
        "Are you sure you want to delete this mark?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/marks/${markId}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        console.log(
            "Delete response:",
            data
        );

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Failed to delete marks"
            );

            return;
        }

        alert(
            "Marks deleted successfully!"
        );

        loadMarks();

    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Could not connect to backend."
        );
    }
}