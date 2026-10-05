const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());


// =====================================
// SERVE FRONTEND
// =====================================

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);


// =====================================
// HOME ROUTE
// =====================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../frontend/index.html")
    );
});


// =====================================
// TEST DATABASE
// =====================================

app.get("/api/test-db", (req, res) => {

    db.query(
        "SELECT 1 AS test",
        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database connection failed"
                });
            }

            res.json({
                success: true,
                message: "MySQL connected successfully",
                result: result
            });

        }
    );

});


// =====================================
// LOGIN
// =====================================

app.post("/api/login", (req, res) => {

    const {
        username,
        password
    } = req.body;

    if (!username || !password) {

        return res.status(400).json({

            success: false,

            message:
                "Username and password are required"

        });

    }

    const sql = `

        SELECT
            user_id,
            username,
            password,
            role

        FROM users

        WHERE username = ?

    `;

    db.query(
        sql,
        [username],
        async (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Login failed"

                });

            }

            if (results.length === 0) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid username or password"

                });

            }

            const user = results[0];

            try {

                const passwordMatch =
                    await bcrypt.compare(
                        password,
                        user.password
                    );

                if (!passwordMatch) {

                    return res.status(401).json({

                        success: false,

                        message:
                            "Invalid username or password"

                    });

                }

                res.json({

                    success: true,

                    message:
                        "Login successful",

                    user: {

                        user_id:
                            user.user_id,

                        username:
                            user.username,

                        role:
                            user.role

                    }

                });

            } catch (error) {

                console.error(error);

                res.status(500).json({

                    success: false,

                    message:
                        "Login failed"

                });

            }

        }

    );

});

// =====================================
// FORGOT PASSWORD
// =====================================

app.post("/api/forgot-password", (req, res) => {

    const { username } = req.body;

    if (!username) {

        return res.status(400).json({

            success: false,

            message:
                "Username is required"

        });

    }

    const sql = `
        SELECT
            user_id,
            username
        FROM users
        WHERE username = ?
    `;

    db.query(
        sql,
        [username],
        (err, results) => {

            if (err) {

                console.error(
                    "Forgot password error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to process request"

                });

            }

            if (results.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Username not found"

                });

            }

            res.json({

                success: true,

                message:
                    "Username verified. You can now reset your password."

            });

        }
    );

});

// =====================================
// RESET PASSWORD
// =====================================

app.post("/api/reset-password", async (req, res) => {

    const {
        username,
        newPassword
    } = req.body;


    if (!username || !newPassword) {

        return res.status(400).json({

            success: false,

            message:
                "Username and new password are required"

        });

    }


    if (newPassword.length < 6) {

        return res.status(400).json({

            success: false,

            message:
                "Password must be at least 6 characters"

        });

    }


    try {

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );


        const sql = `

            UPDATE users

            SET password = ?

            WHERE username = ?

        `;


        db.query(
            sql,
            [
                hashedPassword,
                username
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "Reset password error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to reset password"

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Username not found"

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Password reset successfully. Please login with your new password."

                });

            }
        );


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to reset password"

        });

    }

});

// =====================================
// CHANGE PASSWORD
// =====================================

app.put("/api/change-password", async (req, res) => {

    const {
        username,
        currentPassword,
        newPassword
    } = req.body;


    if (
        !username ||
        !currentPassword ||
        !newPassword
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Current password and new password are required"

        });

    }


    if (newPassword.length < 6) {

        return res.status(400).json({

            success: false,

            message:
                "New password must be at least 6 characters"

        });

    }


    try {

        // Get current password

        const selectSQL = `

            SELECT
                user_id,
                password

            FROM users

            WHERE username = ?

        `;


        db.query(
            selectSQL,
            [username],
            async (err, results) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to verify account"

                    });

                }


                if (results.length === 0) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "User not found"

                    });

                }


                const user =
                    results[0];


                // Verify current password

                const passwordMatch =
                    await bcrypt.compare(
                        currentPassword,
                        user.password
                    );


                if (!passwordMatch) {

                    return res.status(401).json({

                        success: false,

                        message:
                            "Current password is incorrect"

                    });

                }


                // Hash new password

                const hashedPassword =
                    await bcrypt.hash(
                        newPassword,
                        10
                    );


                // Update password

                const updateSQL = `

                    UPDATE users

                    SET password = ?

                    WHERE user_id = ?

                `;


                db.query(
                    updateSQL,
                    [
                        hashedPassword,
                        user.user_id
                    ],
                    (updateErr, result) => {

                        if (updateErr) {

                            console.error(
                                updateErr
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Failed to update password"

                            });

                        }


                        if (
                            result.affectedRows === 0
                        ) {

                            return res.status(404).json({

                                success: false,

                                message:
                                    "Password could not be changed"

                            });

                        }


                        res.json({

                            success: true,

                            message:
                                "Password changed successfully"

                        });

                    }
                );

            }
        );


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to change password"

        });

    }

});

// ==========================================
// GET STUDENTS
// ==========================================

app.get("/api/students", (req, res) => {

    const {
        department,
        year,
        semester
    } = req.query;


    let sql = `

        SELECT
            student_id,
            roll_no,
            name,
            email,
            department,
            year,
            semester

        FROM students

    `;


    let values = [];


    if (
        department &&
        year &&
        semester
    ) {

        sql += `

            WHERE department = ?
            AND year = ?
            AND semester = ?

        `;


        values = [
            department,
            year,
            semester
        ];

    }


    sql += `
        ORDER BY student_id
    `;


    db.query(
        sql,
        values,
        (err, results) => {

            if (err) {

                console.error(
                    "Error fetching students:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to fetch students",

                    error:
                        err.message

                });

            }


            res.json({

                success: true,

                students:
                    results

            });

        }
    );

});


// ==========================================
// ADD STUDENT
// ==========================================

app.post("/api/students", (req, res) => {

    const {
        roll_no,
        name,
        email,
        department,
        year,
        semester
    } = req.body;


    if (
        !roll_no ||
        !name ||
        !department ||
        !year ||
        !semester
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Roll number, name, department, year and semester are required"

        });

    }


    const sql = `

        INSERT INTO students
        (
            roll_no,
            name,
            email,
            department,
            year,
            semester
        )

        VALUES (?, ?, ?, ?, ?, ?)

    `;


    const values = [

        roll_no,
        name,
        email || null,
        department,
        year,
        semester

    ];


    db.query(
        sql,
        values,
        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to add student",

                    error:
                        err.message

                });

            }


            res.status(201).json({

                success: true,

                message:
                    "Student added successfully",

                student_id:
                    result.insertId

            });

        }
    );

});


// ==========================================
// GET ALL SUBJECTS
// ==========================================

app.get("/api/subjects", (req, res) => {

    const sql =
        "SELECT * FROM subjects";


    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to fetch subjects"

                });

            }


            res.json({

                success: true,

                subjects:
                    results

            });

        }
    );

});

// =====================================
// ADD SUBJECT
// =====================================

app.post("/api/subjects", (req, res) => {

    const {
        subject_code,
        subject_name,
        department,
        year,
        semester,
        credits,
        subject_type
    } = req.body;


    if (
        !subject_code ||
        !subject_name ||
        !department ||
        !year ||
        !semester
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Subject code, subject name, department, year and semester are required"
        });

    }


    const sql = `
        INSERT INTO subjects
        (
            subject_code,
            subject_name,
            department,
            year,
            semester,
            credits,
            subject_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            subject_code,
            subject_name,
            department,
            year,
            semester,
            credits || 3,
            subject_type || "Theory"
        ],
        (err, result) => {

            if (err) {

                console.error(err);


                if (err.code === "ER_DUP_ENTRY") {

                    return res.status(409).json({
                        success: false,
                        message:
                            "Subject code already exists"
                    });

                }


                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to add subject",
                    error: err.message
                });

            }


            res.status(201).json({

                success: true,

                message:
                    "Subject added successfully",

                subject_id:
                    result.insertId

            });

        }
    );

});


// =====================================
// UPDATE SUBJECT
// =====================================

app.put("/api/subjects/:id", (req, res) => {

    const subjectId =
        req.params.id;


    const {
        subject_code,
        subject_name,
        department,
        year,
        semester,
        credits,
        subject_type
    } = req.body;


    if (
        !subject_code ||
        !subject_name ||
        !department ||
        !year ||
        !semester
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Subject code, subject name, department, year and semester are required"
        });

    }


    const sql = `
        UPDATE subjects
        SET
            subject_code = ?,
            subject_name = ?,
            department = ?,
            year = ?,
            semester = ?,
            credits = ?,
            subject_type = ?
        WHERE subject_id = ?
    `;


    db.query(
        sql,
        [
            subject_code,
            subject_name,
            department,
            year,
            semester,
            credits || 3,
            subject_type || "Theory",
            subjectId
        ],
        (err, result) => {

            if (err) {

                console.error(err);


                if (err.code === "ER_DUP_ENTRY") {

                    return res.status(409).json({
                        success: false,
                        message:
                            "Subject code already exists"
                    });

                }


                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to update subject",
                    error: err.message
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Subject not found"
                });

            }


            res.json({

                success: true,

                message:
                    "Subject updated successfully"

            });

        }
    );

});


// =====================================
// DELETE SUBJECT
// =====================================

app.delete("/api/subjects/:id", (req, res) => {

    const subjectId =
        req.params.id;


    const sql = `
        DELETE FROM subjects
        WHERE subject_id = ?
    `;


    db.query(
        sql,
        [subjectId],
        (err, result) => {

            if (err) {

                console.error(err);


                // Subject is being used by marks
                if (err.code === "ER_ROW_IS_REFERENCED_2") {

                    return res.status(409).json({
                        success: false,
                        message:
                            "Cannot delete this subject because marks already exist for it. Delete the related marks first."
                    });

                }


                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to delete subject",
                    error: err.message
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Subject not found"
                });

            }


            res.json({

                success: true,

                message:
                    "Subject deleted successfully"

            });

        }
    );

});

// ==========================================
// ADD MARKS
// ==========================================

app.post("/api/marks", (req, res) => {

    const {
        student_id,
        subject_id,
        marks
    } = req.body;


    if (
        !student_id ||
        !subject_id ||
        marks === undefined
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Student, subject and marks are required"

        });

    }


    if (
        marks < 0 ||
        marks > 100
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Marks must be between 0 and 100"

        });

    }


    let grade;
    let gradePoint;


    if (marks >= 90) {

        grade = "A+";
        gradePoint = 10.00;

    }

    else if (marks >= 80) {

        grade = "A";
        gradePoint = 9.00;

    }

    else if (marks >= 70) {

        grade = "B+";
        gradePoint = 8.00;

    }

    else if (marks >= 60) {

        grade = "B";
        gradePoint = 7.00;

    }

    else if (marks >= 50) {

        grade = "C";
        gradePoint = 6.00;

    }

    else if (marks >= 40) {

        grade = "D";
        gradePoint = 5.00;

    }

    else {

        grade = "F";
        gradePoint = 0.00;

    }


    const marksSQL = `

        INSERT INTO marks
        (
            student_id,
            subject_id,
            marks
        )

        VALUES (?, ?, ?)

    `;


    db.query(
        marksSQL,
        [
            student_id,
            subject_id,
            marks
        ],
        (err, result) => {

            if (err) {

                console.error(err);


                if (
                    err.code ===
                    "ER_DUP_ENTRY"
                ) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "Marks already exist for this student and subject."

                    });

                }


                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to save marks",

                    error:
                        err.message

                });

            }


            const markId =
                result.insertId;


            const gradeSQL = `

                INSERT INTO grades
                (
                    mark_id,
                    grade,
                    grade_point
                )

                VALUES (?, ?, ?)

            `;


            db.query(
                gradeSQL,
                [
                    markId,
                    grade,
                    gradePoint
                ],
                (gradeErr) => {

                    if (gradeErr) {

                        console.error(
                            gradeErr
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Marks saved but grade could not be saved",

                            error:
                                gradeErr.message

                        });

                    }


                    res.status(201).json({

                        success: true,

                        message:
                            "Marks added successfully",

                        grade:
                            grade,

                        grade_point:
                            gradePoint

                    });

                }
            );

        }
    );

});


// ==========================================
// GET COMPLETE STUDENT RESULT
// ==========================================

app.get(
    "/api/results/:studentId",
    (req, res) => {

        const studentId =
            req.params.studentId;


        const sql = `

            SELECT

                s.roll_no,
                s.name,
                s.department,
                s.year,
                s.semester,

                sub.subject_code,
                sub.subject_name,

                m.mark_id,
                m.marks,

                g.grade,
                g.grade_point

            FROM students s

            JOIN marks m
                ON s.student_id =
                   m.student_id

            JOIN subjects sub
                ON m.subject_id =
                   sub.subject_id

            JOIN grades g
                ON m.mark_id =
                   g.mark_id

            WHERE s.student_id = ?

            ORDER BY sub.subject_id

        `;


        db.query(
            sql,
            [studentId],
            (err, results) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to fetch result"

                    });

                }


                if (
                    results.length === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "No marks found for this student"

                    });

                }


                let totalMarks = 0;

                let totalGradePoints = 0;

                let failedSubjects = 0;


                results.forEach(result => {

                    totalMarks +=
                        Number(
                            result.marks
                        );


                    totalGradePoints +=
                        Number(
                            result.grade_point
                        );


                    if (
                        Number(result.marks) < 40
                    ) {

                        failedSubjects++;

                    }

                });


                const subjectCount =
                    results.length;


                const percentage =
                    totalMarks /
                    subjectCount;


                const gpa =
                    totalGradePoints /
                    subjectCount;


                const status =
                    failedSubjects === 0
                        ? "PASS"
                        : "FAIL";


                res.json({

                    success: true,

                    student: {

                        roll_no:
                            results[0].roll_no,

                        name:
                            results[0].name,

                        department:
                            results[0].department,

                        year:
                            results[0].year,

                        semester:
                            results[0].semester

                    },


                    subjects:
                        results,


                    summary: {

                        total_marks:
                            totalMarks,

                        percentage:
                            Number(
                                percentage.toFixed(2)
                            ),

                        GPA:
                            Number(
                                gpa.toFixed(2)
                            ),

                        failed_subjects:
                            failedSubjects,

                        status:
                            status

                    }

                });

            }
        );

    }
);


// ==========================================
// UPDATE STUDENT
// ==========================================

app.put(
    "/api/students/:id",
    (req, res) => {

        const studentId =
            req.params.id;


        const {
            roll_no,
            name,
            email,
            department,
            year,
            semester
        } = req.body;


        if (
            !roll_no ||
            !name ||
            !department ||
            !year ||
            !semester
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Roll number, name, department, year and semester are required"

            });

        }


        const sql = `

            UPDATE students

            SET

                roll_no = ?,
                name = ?,
                email = ?,
                department = ?,
                year = ?,
                semester = ?

            WHERE student_id = ?

        `;


        const values = [

            roll_no,
            name,
            email || null,
            department,
            year,
            semester,
            studentId

        ];


        db.query(
            sql,
            values,
            (err, result) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to update student",

                        error:
                            err.message

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Student not found"

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Student updated successfully"

                });

            }
        );

    }
);


// ==========================================
// DELETE STUDENT
// ==========================================

app.delete(
    "/api/students/:id",
    (req, res) => {

        const studentId =
            req.params.id;


        const sql = `

            DELETE FROM students

            WHERE student_id = ?

        `;


        db.query(
            sql,
            [studentId],
            (err, result) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to delete student",

                        error:
                            err.message

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Student not found"

                    });

                }


                res.json({

                    success: true,

                    message:
                        "Student deleted successfully"

                });

            }
        );

    }
);


// ==========================================
// UPDATE MARKS
// ==========================================

app.put(
    "/api/marks/:id",
    (req, res) => {

        const markId =
            req.params.id;


        const { marks } =
            req.body;


        if (
            marks === undefined ||
            marks < 0 ||
            marks > 100
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Marks must be between 0 and 100"

            });

        }


        let grade;
        let gradePoint;


        if (marks >= 90) {

            grade = "A+";
            gradePoint = 10;

        }

        else if (marks >= 80) {

            grade = "A";
            gradePoint = 9;

        }

        else if (marks >= 70) {

            grade = "B+";
            gradePoint = 8;

        }

        else if (marks >= 60) {

            grade = "B";
            gradePoint = 7;

        }

        else if (marks >= 50) {

            grade = "C";
            gradePoint = 6;

        }

        else if (marks >= 40) {

            grade = "D";
            gradePoint = 5;

        }

        else {

            grade = "F";
            gradePoint = 0;

        }


        const updateMarksSQL = `

            UPDATE marks

            SET marks = ?

            WHERE mark_id = ?

        `;


        db.query(
            updateMarksSQL,
            [marks, markId],
            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to update marks",

                        error:
                            err.message

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Mark record not found"

                    });

                }


                const updateGradeSQL = `

                    UPDATE grades

                    SET
                        grade = ?,
                        grade_point = ?

                    WHERE mark_id = ?

                `;


                db.query(
                    updateGradeSQL,
                    [
                        grade,
                        gradePoint,
                        markId
                    ],
                    (gradeErr) => {

                        if (gradeErr) {

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Marks updated but grade update failed",

                                error:
                                    gradeErr.message

                            });

                        }


                        res.json({

                            success: true,

                            message:
                                "Marks updated successfully",

                            grade:
                                grade,

                            grade_point:
                                gradePoint

                        });

                    }
                );

            }
        );

    }
);


// ==========================================
// DELETE MARKS
// ==========================================

app.delete(
    "/api/marks/:id",
    (req, res) => {

        const markId =
            req.params.id;


        db.query(
            "DELETE FROM grades WHERE mark_id = ?",
            [markId],
            (gradeErr) => {

                if (gradeErr) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to delete grade",

                        error:
                            gradeErr.message

                    });

                }


                db.query(
                    "DELETE FROM marks WHERE mark_id = ?",
                    [markId],
                    (markErr, result) => {

                        if (markErr) {

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Failed to delete marks",

                                error:
                                    markErr.message

                            });

                        }


                        if (
                            result.affectedRows === 0
                        ) {

                            return res.status(404).json({

                                success: false,

                                message:
                                    "Mark record not found"

                            });

                        }


                        res.json({

                            success: true,

                            message:
                                "Marks deleted successfully"

                        });

                    }
                );

            }
        );

    }
);


// ==========================================
// GET MARKS WITH PAGINATION
// ==========================================

app.get(
    "/api/marks",
    (req, res) => {

        const page =
            Number(req.query.page) || 1;


        const limit = 50;


        const offset =
            (page - 1) * limit;


        const sql = `

            SELECT

                m.mark_id,

                s.roll_no,

                s.name AS student_name,

                sub.subject_code,
                sub.subject_name,

                m.marks,

                g.grade,
                g.grade_point

            FROM marks m

            JOIN students s
                ON m.student_id =
                   s.student_id

            JOIN subjects sub
                ON m.subject_id =
                   sub.subject_id

            LEFT JOIN grades g
                ON m.mark_id =
                   g.mark_id

            ORDER BY m.mark_id DESC

            LIMIT ? OFFSET ?

        `;


        db.query(
            sql,
            [limit, offset],
            (err, results) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to fetch marks"

                    });

                }


                const countSQL = `

                    SELECT COUNT(*) AS total

                    FROM marks

                `;


                db.query(
                    countSQL,
                    (countErr, countResult) => {

                        if (countErr) {

                            console.error(
                                countErr
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Failed to count marks"

                            });

                        }


                        const total =
                            Number(
                                countResult[0].total
                            );


                        const totalPages =
                            Math.ceil(
                                total / limit
                            );


                        res.json({

                            success: true,

                            marks:
                                results,

                            page:
                                page,

                            limit:
                                limit,

                            total:
                                total,

                            totalPages:
                                totalPages

                        });

                    }
                );

            }
        );

    }
);



// ==========================================
// DASHBOARD STATISTICS
// ==========================================

app.get(
    "/api/dashboard",
    (req, res) => {


        // =====================================
        // BASIC COUNTS
        // =====================================

        const studentsQuery = `

            SELECT COUNT(*) AS total

            FROM students

        `;


        const subjectsQuery = `

            SELECT COUNT(*) AS total

            FROM subjects

        `;


        const marksQuery = `

            SELECT COUNT(*) AS total

            FROM marks

        `;


        // =====================================
        // PASS / FAIL
        // =====================================

        /*
         * Each student is compared against
         * the subjects that belong to their
         * department + year + semester.
         *
         * PASS:
         * All subjects have marks AND
         * no mark is below 40.
         *
         * FAIL:
         * All subjects have marks AND
         * at least one mark is below 40.
         *
         * Incomplete students are not counted
         * as PASS or FAIL.
         */

        const resultQuery = `

            SELECT

                s.student_id,

                s.department,

                s.year,

                s.semester,

                COUNT(
                    DISTINCT sub.subject_id
                ) AS total_subjects,

                COUNT(
                    DISTINCT m.subject_id
                ) AS completed_subjects,

                SUM(
                    CASE
                        WHEN m.marks < 40
                        THEN 1
                        ELSE 0
                    END
                ) AS failed_subjects

            FROM students s

            LEFT JOIN subjects sub

                ON sub.department =
                   s.department

                AND sub.year =
                    s.year

                AND sub.semester =
                    s.semester

            LEFT JOIN marks m

                ON m.student_id =
                   s.student_id

                AND m.subject_id =
                    sub.subject_id

            GROUP BY

                s.student_id,

                s.department,

                s.year,

                s.semester

        `;


        // =====================================
        // GRADE COUNTS
        // =====================================

        const gradeQuery = `

            SELECT

                grade,

                COUNT(*) AS total

            FROM grades

            GROUP BY grade

        `;


        // =====================================
        // ACADEMIC OVERVIEW
        // =====================================

        const academicQuery = `

            SELECT

                department,
                year,
                semester,

                COUNT(*) AS total_students

            FROM students

            GROUP BY

                department,
                year,
                semester

            ORDER BY

                department,
                year,
                semester

        `;


        // =====================================
        // STUDENTS
        // =====================================

        db.query(
            studentsQuery,
            (err, studentResult) => {

                if (err) {

                    console.error(
                        "Students query error:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to load students"

                    });

                }


                // =====================================
                // SUBJECTS
                // =====================================

                db.query(
                    subjectsQuery,
                    (err, subjectResult) => {

                        if (err) {

                            console.error(
                                "Subjects query error:",
                                err
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Failed to load subjects"

                            });

                        }


                        // =====================================
                        // MARKS
                        // =====================================

                        db.query(
                            marksQuery,
                            (err, marksResult) => {

                                if (err) {

                                    console.error(
                                        "Marks query error:",
                                        err
                                    );

                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Failed to load marks"

                                    });

                                }


                                // =====================================
                                // PASS / FAIL DATA
                                // =====================================

                                db.query(
                                    resultQuery,
                                    (err, resultData) => {

                                        if (err) {

                                            console.error(
                                                "Result query error:",
                                                err
                                            );

                                            return res.status(500).json({

                                                success: false,

                                                message:
                                                    "Failed to calculate results",

                                                error:
                                                    err.message

                                            });

                                        }


                                        // IMPORTANT:
                                        // Start from zero.
                                        // Each student is counted exactly once.

                                        let passed = 0;

                                        let failed = 0;


                                        resultData.forEach(
                                            student => {

                                                const totalSubjects =
                                                    Number(
                                                        student.total_subjects
                                                    );


                                                const completedSubjects =
                                                    Number(
                                                        student.completed_subjects
                                                    );


                                                const failedSubjects =
                                                    Number(
                                                        student.failed_subjects ||
                                                        0
                                                    );


                                                // =================================
                                                // ONLY COMPLETE RESULTS
                                                // =================================

                                                if (
                                                    totalSubjects > 0 &&
                                                    completedSubjects ===
                                                        totalSubjects
                                                ) {


                                                    // =============================
                                                    // FAILED STUDENT
                                                    // =============================

                                                    if (
                                                        failedSubjects > 0
                                                    ) {

                                                        failed++;

                                                    }


                                                    // =============================
                                                    // PASSED STUDENT
                                                    // =============================

                                                    else {

                                                        passed++;

                                                    }

                                                }

                                            }
                                        );


                                        // =====================================
                                        // GRADE COUNTS
                                        // =====================================

                                        db.query(
                                            gradeQuery,
                                            (err, gradeData) => {

                                                if (err) {

                                                    console.error(
                                                        "Grade query error:",
                                                        err
                                                    );

                                                    return res.status(500).json({

                                                        success: false,

                                                        message:
                                                            "Failed to load grades"

                                                    });

                                                }


                                                const grades = {

                                                    A_PLUS: 0,

                                                    A: 0,

                                                    B_PLUS: 0,

                                                    B: 0,

                                                    C: 0,

                                                    D: 0,

                                                    F: 0

                                                };


                                                gradeData.forEach(
                                                    item => {

                                                        const grade =
                                                            item.grade;


                                                        const total =
                                                            Number(
                                                                item.total
                                                            );


                                                        if (
                                                            grade ===
                                                            "A+"
                                                        ) {

                                                            grades.A_PLUS =
                                                                total;

                                                        }

                                                        else if (
                                                            grade ===
                                                            "A"
                                                        ) {

                                                            grades.A =
                                                                total;

                                                        }

                                                        else if (
                                                            grade ===
                                                            "B+"
                                                        ) {

                                                            grades.B_PLUS =
                                                                total;

                                                        }

                                                        else if (
                                                            grade ===
                                                            "B"
                                                        ) {

                                                            grades.B =
                                                                total;

                                                        }

                                                        else if (
                                                            grade ===
                                                            "C"
                                                        ) {

                                                            grades.C =
                                                                total;

                                                        }

                                                        else if (
                                                            grade ===
                                                            "D"
                                                        ) {

                                                            grades.D =
                                                                total;

                                                        }

                                                        else if (
                                                            grade ===
                                                            "F"
                                                        ) {

                                                            grades.F =
                                                                total;

                                                        }

                                                    }
                                                );


                                                // =====================================
                                                // ACADEMIC OVERVIEW
                                                // =====================================

                                                db.query(
                                                    academicQuery,
                                                    (err, academicData) => {

                                                        if (err) {

                                                            console.error(
                                                                "Academic query error:",
                                                                err
                                                            );

                                                            return res.status(500).json({

                                                                success: false,

                                                                message:
                                                                    "Failed to load academic data"

                                                            });

                                                        }


                                                        // =====================================
                                                        // FINAL RESPONSE
                                                        // =====================================

                                                        res.json({

                                                            success:
                                                                true,

                                                            students:
                                                                Number(
                                                                    studentResult[0].total
                                                                ),

                                                            subjects:
                                                                Number(
                                                                    subjectResult[0].total
                                                                ),

                                                            marks:
                                                                Number(
                                                                    marksResult[0].total
                                                                ),

                                                            passed:
                                                                passed,

                                                            failed:
                                                                failed,

                                                            grades:
                                                                grades,

                                                            academic:
                                                                academicData

                                                        });

                                                    }
                                                );

                                            }
                                        );

                                    }
                                );

                            }
                        );

                    }
                );

            }
        );

    }
);


// ==========================================
// GET SUBJECTS BY DEPARTMENT/YEAR/SEMESTER
// ==========================================

app.get(
    "/api/v1/rent/subjects",
    (req, res) => {

        const {
            department,
            year,
            semester
        } = req.query;


        if (
            !department ||
            !year ||
            !semester
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Department, year and semester are required"

            });

        }


        const sql = `

            SELECT

                subject_id,
                subject_code,
                subject_name,
                department,
                year,
                semester

            FROM subjects

            WHERE department = ?

            AND year = ?

            AND semester = ?

            ORDER BY subject_id

        `;


        db.query(
            sql,
            [
                department,
                year,
                semester
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "Error fetching subjects:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to fetch subjects",

                        error:
                            err.message

                    });

                }


                res.json({

                    success: true,

                    subjects:
                        result

                });

            }
        );

    }
);


// ==========================================
// PORT
// ==========================================

const PORT = process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    }
);