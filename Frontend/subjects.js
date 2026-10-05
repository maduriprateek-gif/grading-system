const API_URL = "/api";

// =====================================
// HTML ELEMENTS
// =====================================

const subjectsTable =
    document.getElementById("subjectsTable");

const subjectCount =
    document.getElementById("subjectCount");

const subjectSearch =
    document.getElementById("subjectSearch");


// =====================================
// VARIABLES
// =====================================

let allSubjects = [];

let editingSubjectId = null;


// =====================================
// LOAD SUBJECTS
// =====================================

async function loadSubjects() {

    try {

        const response =
            await fetch(`${API_URL}/subjects`);

        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to load subjects"
            );

        }


        allSubjects =
            data.subjects || [];


        // Show total subjects

        subjectCount.textContent =
            allSubjects.length;


        // Display all subjects

        displaySubjects(allSubjects);


    } catch (error) {

        console.error(
            "Subject loading error:",
            error
        );


        subjectsTable.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="color:red;text-align:center;"
                >
                    Failed to load subjects
                </td>

            </tr>

        `;

    }

}


// =====================================
// DISPLAY SUBJECTS
// =====================================

function displaySubjects(subjects) {

    subjectsTable.innerHTML = "";

    if (subjects.length === 0) {

        subjectsTable.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    style="text-align:center;"
                >
                    No subjects found
                </td>
            </tr>
        `;

        return;
    }


    subjects.forEach(subject => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${subject.subject_id}
            </td>

            <td>
                <strong>
                    ${subject.subject_code}
                </strong>
            </td>

            <td>
                ${subject.subject_name}
            </td>

            <td>
                ${subject.department}
            </td>

            <td>
                ${subject.year}
            </td>

            <td>
                ${subject.semester}
            </td>

            <td>
                ${subject.credits || "-"}
            </td>

            <td>
                ${subject.subject_type || "-"}
            </td>

            <td>

                <button
                    type="button"
                    class="subject-edit-button"
                    data-id="${subject.subject_id}"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="subject-delete-button"
                    data-id="${subject.subject_id}"
                >
                    Delete
                </button>

            </td>

        `;


        subjectsTable.appendChild(row);

    });

}


// =====================================
// SEARCH SUBJECTS
// =====================================

subjectSearch.addEventListener(
    "input",
    function () {

        const searchText =
            subjectSearch.value
                .toLowerCase()
                .trim();


        // If search box is empty
        // show all subjects

        if (!searchText) {

            displaySubjects(
                allSubjects
            );

            return;

        }


        // Filter subjects

        const filteredSubjects =
            allSubjects.filter(subject => {

                const subjectId =
                    String(
                        subject.subject_id || ""
                    )
                    .toLowerCase();


                const subjectCode =
                    String(
                        subject.subject_code || ""
                    )
                    .toLowerCase();


                const subjectName =
                    String(
                        subject.subject_name || ""
                    )
                    .toLowerCase();


                const department =
                    String(
                        subject.department || ""
                    )
                    .toLowerCase();


                const year =
                    String(
                        subject.year || ""
                    )
                    .toLowerCase();


                const semester =
                    String(
                        subject.semester || ""
                    )
                    .toLowerCase();


                return (

                    subjectId.includes(searchText)

                    ||

                    subjectCode.includes(searchText)

                    ||

                    subjectName.includes(searchText)

                    ||

                    department.includes(searchText)

                    ||

                    year.includes(searchText)

                    ||

                    semester.includes(searchText)

                );

            });


        displaySubjects(
            filteredSubjects
        );

    }
);


// =====================================
// EDIT SUBJECT
// =====================================

subjectsTable.addEventListener(
    "click",
    function (event) {

        const editButton =
            event.target.closest(
                ".subject-edit-button"
            );


        if (editButton) {

            const subjectId =
                Number(
                    editButton.dataset.id
                );


            const subject =
                allSubjects.find(
                    item =>
                        Number(
                            item.subject_id
                        ) === subjectId
                );


            if (!subject) {

                console.error(
                    "Subject not found:",
                    subjectId
                );

                return;

            }


            editSubject(subject);

            return;

        }


        // =================================
        // DELETE
        // =================================

        const deleteButton =
            event.target.closest(
                ".subject-delete-button"
            );


        if (deleteButton) {

            const subjectId =
                Number(
                    deleteButton.dataset.id
                );


            deleteSubject(subjectId);

        }

    }
);


// =====================================
// EDIT SUBJECT
// =====================================

function editSubject(subject) {

    editingSubjectId =
        Number(subject.subject_id);


    const subjectCode =
        prompt(
            "Enter Subject Code:",
            subject.subject_code
        );


    if (subjectCode === null) {

        editingSubjectId = null;

        return;

    }


    const subjectName =
        prompt(
            "Enter Subject Name:",
            subject.subject_name
        );


    if (subjectName === null) {

        editingSubjectId = null;

        return;

    }


    const department =
        prompt(
            "Enter Department:",
            subject.department
        );


    if (department === null) {

        editingSubjectId = null;

        return;

    }


    const year =
        prompt(
            "Enter Year:",
            subject.year
        );


    if (year === null) {

        editingSubjectId = null;

        return;

    }


    const semester =
        prompt(
            "Enter Semester:",
            subject.semester
        );


    if (semester === null) {

        editingSubjectId = null;

        return;

    }


    updateSubject({

        subject_code:
            subjectCode.trim(),

        subject_name:
            subjectName.trim(),

        department:
            department.trim(),

        year:
            Number(year),

        semester:
            Number(semester)

    });

}


// =====================================
// UPDATE SUBJECT
// =====================================

async function updateSubject(subject) {

    try {

        const response =
            await fetch(
                `${API_URL}/subjects/${editingSubjectId}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(subject)

                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to update subject"
            );

        }


        alert(
            "Subject updated successfully"
        );


        editingSubjectId = null;


        await loadSubjects();


    } catch (error) {

        console.error(
            "Update subject error:",
            error
        );


        alert(
            error.message
        );

    }

}


// =====================================
// DELETE SUBJECT
// =====================================

async function deleteSubject(id) {

    const subject =
        allSubjects.find(
            item =>
                Number(
                    item.subject_id
                ) === Number(id)
        );


    const subjectName =
        subject
            ? subject.subject_name
            : "this subject";


    const confirmed =
        confirm(
            `Are you sure you want to delete ${subjectName}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/subjects/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to delete subject"
            );

        }


        alert(
            "Subject deleted successfully"
        );


        await loadSubjects();


    } catch (error) {

        console.error(
            "Delete subject error:",
            error
        );


        alert(
            error.message
        );

    }

}


// =====================================
// START
// =====================================

loadSubjects();