import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Collapse, Table, TableBody, TableHead, Typography, Paper, Grid } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import styled from 'styled-components';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../components/attendanceCalculator';
import CustomPieChart from '../../components/CustomPieChart';
import { PurpleButton } from '../../components/buttonStyles';

// Styled Components
const PageContainer = styled.div`
    padding: 20px;
    background: #f8f9fa;
`;

const StyledPaper = styled(Paper)`
    padding: 20px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;

    .detail-row {
        margin-bottom: 15px;
        
        .label {
            color: #6c757d;
            font-size: 0.9rem;
            margin-bottom: 5px;
        }
        
        .value {
            color: #2c3e50;
            font-weight: 500;
        }
    }
`;

const StyledTable = styled(Table)`
    margin: 20px 0;
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const StyledTableRow = styled.tr`
    &:nth-of-type(even) {
        background-color: #f8f9fa;
    }
    &:hover {
        background-color: #f1f3f5;
    }
`;

const StyledTableCell = styled.td`
    padding: 16px;
    border-bottom: 1px solid #dee2e6;
    color: #2c3e50;
`;

const StyledTableHeaderCell = styled.th`
    padding: 16px;
    background: #f8f9fa;
    color: #2c3e50;
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
`;

const SectionTitle = styled.h3`
    color: #2c3e50;
    font-size: 1.5rem;
    margin: 30px 0 20px;
    font-weight: 600;
`;

const AttendanceSummary = styled.div`
    background: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    margin: 20px 0;
    text-align: center;
    
    .percentage {
        font-size: 2rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 10px;
    }
    
    .details {
        color: #6c757d;
    }
`;

const ActionButton = styled(Button)`
    margin: 10px 0;
    padding: 8px 20px;
    background: ${props => props.color === 'error' ? '#dc3545' : '#4a90e2'};
    color: white;
    
    &:hover {
        background: ${props => props.color === 'error' ? '#c82333' : '#357abd'};
    }
`;

const TeacherViewStudent = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const params = useParams();

    const { currentUser, userDetails, response, loading, error } = useSelector((state) => state.user);

    const address = "Student";
    const studentID = params.id;
    const teachSubject = currentUser.teachSubject?.subName;
    const teachSubjectID = currentUser.teachSubject?._id;

    useEffect(() => {
        dispatch(getUserDetails(studentID, address));
    }, [dispatch, studentID]);

    if (response) { console.log(response) }
    else if (error) { console.log(error) }

    const [sclassName, setSclassName] = useState('');
    const [studentSchool, setStudentSchool] = useState('');
    const [subjectMarks, setSubjectMarks] = useState('');
    const [subjectAttendance, setSubjectAttendance] = useState([]);

    const [openStates, setOpenStates] = useState({});

    const handleOpen = (subId) => {
        setOpenStates((prevState) => ({
            ...prevState,
            [subId]: !prevState[subId],
        }));
    };

    useEffect(() => {
        if (userDetails) {
            setSclassName(userDetails.sclassName || '');
            setStudentSchool(userDetails.school || '');
            setSubjectMarks(userDetails.examResult || '');
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails]);

    let subjectAttendancePercentage = 0;
    let totalSessions = 0;
    let totalPresent = 0;

    if (subjectAttendance.length > 0) {
        const subjectData = groupAttendanceBySubject(subjectAttendance);
        if (subjectData[teachSubject]) {
            const { present, sessions } = subjectData[teachSubject];
            totalSessions = sessions;
            totalPresent = present;
            subjectAttendancePercentage = Number(calculateSubjectAttendancePercentage(present, sessions));
        }
    }

    const overallAttendancePercentage = subjectAttendancePercentage;
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    return (
        <PageContainer>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <StyledPaper>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <div className="detail-row">
                                    <div className="label">Name</div>
                                    <div className="value">{userDetails.name}</div>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div className="detail-row">
                                    <div className="label">Roll Number</div>
                                    <div className="value">{userDetails.rollNum}</div>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div className="detail-row">
                                    <div className="label">Class</div>
                                    <div className="value">{sclassName.sclassName}</div>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div className="detail-row">
                                    <div className="label">School</div>
                                    <div className="value">{studentSchool.schoolName}</div>
                                </div>
                            </Grid>
                        </Grid>
                    </StyledPaper>

                    <SectionTitle>Attendance</SectionTitle>
                    {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 && (
                        <>
                            {Object.entries(groupAttendanceBySubject(subjectAttendance)).map(([subName, { present, allData, subId, sessions }], index) => {
                                if (subName === teachSubject) {
                                    return (
                                        <StyledTable key={index}>
                                            <TableHead>
                                                <StyledTableRow>
                                                    <StyledTableHeaderCell>Subject</StyledTableHeaderCell>
                                                    <StyledTableHeaderCell>Present</StyledTableHeaderCell>
                                                    <StyledTableHeaderCell>Total Sessions</StyledTableHeaderCell>
                                                    <StyledTableHeaderCell>Attendance Percentage</StyledTableHeaderCell>
                                                    <StyledTableHeaderCell>Actions</StyledTableHeaderCell>
                                                </StyledTableRow>
                                            </TableHead>
                                            <TableBody>
                                                <StyledTableRow>
                                                    <StyledTableCell>{subName}</StyledTableCell>
                                                    <StyledTableCell>{present}</StyledTableCell>
                                                    <StyledTableCell>{sessions}</StyledTableCell>
                                                    <StyledTableCell>{subjectAttendancePercentage}%</StyledTableCell>
                                                    <StyledTableCell>
                                                        <ActionButton
                                                            variant="contained"
                                                            onClick={() => handleOpen(subId)}
                                                        >
                                                            {openStates[subId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                                            Details
                                                        </ActionButton>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                                <StyledTableRow>
                                                    <td colSpan={5} style={{ padding: 0 }}>
                                                        <Collapse in={openStates[subId]} timeout="auto" unmountOnExit>
                                                            <Box p={3}>
                                                                <Typography variant="h6" gutterBottom>
                                                                    Attendance Details
                                                                </Typography>
                                                                <StyledTable>
                                                                    <TableHead>
                                                                        <StyledTableRow>
                                                                            <StyledTableHeaderCell>Date</StyledTableHeaderCell>
                                                                            <StyledTableHeaderCell>Status</StyledTableHeaderCell>
                                                                        </StyledTableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {allData.map((data, index) => {
                                                                            const date = new Date(data.date);
                                                                            const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
                                                                            return (
                                                                                <StyledTableRow key={index}>
                                                                                    <StyledTableCell>{dateString}</StyledTableCell>
                                                                                    <StyledTableCell>{data.status}</StyledTableCell>
                                                                                </StyledTableRow>
                                                                            );
                                                                        })}
                                                                    </TableBody>
                                                                </StyledTable>
                                                            </Box>
                                                        </Collapse>
                                                    </td>
                                                </StyledTableRow>
                                            </TableBody>
                                        </StyledTable>
                                    );
                                }
                                return null;
                            })}

                            <AttendanceSummary>
                                <div className="percentage">
                                    {overallAttendancePercentage}%
                                </div>
                                <div className="details">
                                    {totalPresent} out of {totalSessions} sessions attended
                                </div>
                            </AttendanceSummary>

                            <Box sx={{ height: 400, my: 4 }}>
                                <CustomPieChart data={chartData} />
                            </Box>
                        </>
                    )}

                    <ActionButton
                        variant="contained"
                        onClick={() => navigate(`/Teacher/class/student/attendance/${studentID}/${teachSubjectID}`)}
                    >
                        Add Attendance
                    </ActionButton>

                    <SectionTitle>Subject Marks</SectionTitle>
                    {subjectMarks && Array.isArray(subjectMarks) && subjectMarks.length > 0 && (
                        <>
                            {subjectMarks.map((result, index) => {
                                if (result.subName.subName === teachSubject) {
                                    return (
                                        <StyledTable key={index}>
                                            <TableHead>
                                                <StyledTableRow>
                                                    <StyledTableHeaderCell>Subject</StyledTableHeaderCell>
                                                    <StyledTableHeaderCell>Marks</StyledTableHeaderCell>
                                                </StyledTableRow>
                                            </TableHead>
                                            <TableBody>
                                                <StyledTableRow>
                                                    <StyledTableCell>{result.subName.subName}</StyledTableCell>
                                                    <StyledTableCell>{result.marksObtained}</StyledTableCell>
                                                </StyledTableRow>
                                            </TableBody>
                                        </StyledTable>
                                    );
                                }
                                return null;
                            })}
                        </>
                    )}

                    <PurpleButton
                        variant="contained"
                        onClick={() => navigate(`/Teacher/class/student/marks/${studentID}/${teachSubjectID}`)}
                    >
                        Add Marks
                    </PurpleButton>
                </>
            )}
        </PageContainer>
    );
};

export default TeacherViewStudent;