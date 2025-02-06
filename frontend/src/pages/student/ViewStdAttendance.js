import React, { useEffect, useState } from 'react'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Box, Button, Collapse, IconButton, Table, TableBody, TableHead, Typography, Tab, Paper, Container, Grid, Card, CardContent, Fade, Chip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { calculateOverallAttendancePercentage, calculateSubjectAttendancePercentage, groupAttendanceBySubject } from '../../components/attendanceCalculator';
import CustomBarChart from '../../components/CustomBarChart'
import CustomPieChart from '../../components/CustomPieChart'
import InsertChartIcon from '@mui/icons-material/InsertChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { styled } from '@mui/material/styles';

const StyledTab = styled(Tab)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: '1rem',
    '&.Mui-selected': {
        color: theme.palette.primary.main,
    },
}));

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
    },
}));

const ViewStdAttendance = () => {
    const dispatch = useDispatch();
    const [openStates, setOpenStates] = useState({});
    const handleOpen = (subId) => {
        setOpenStates((prevState) => ({
            ...prevState,
            [subId]: !prevState[subId],
        }));
    };

    const { userDetails, currentUser, loading, response, error } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
    }, [dispatch, currentUser._id]);

    if (response) { console.log(response) }
    else if (error) { console.log(error) }

    const [subjectAttendance, setSubjectAttendance] = useState([]);
    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        if (userDetails) {
            setSubjectAttendance(userDetails.attendance || []);
        }
    }, [userDetails])

    const attendanceBySubject = groupAttendanceBySubject(subjectAttendance)
    const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
    const overallAbsentPercentage = 100 - overallAttendancePercentage;

    const chartData = [
        { name: 'Present', value: overallAttendancePercentage },
        { name: 'Absent', value: overallAbsentPercentage }
    ];

    const subjectData = Object.entries(attendanceBySubject).map(([subName, { subCode, present, sessions }]) => {
        const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
        return {
            subject: subName,
            attendancePercentage: subjectAttendancePercentage,
            totalClasses: sessions,
            attendedClasses: present
        };
    });

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {loading ? (
                <Box display="flex" justifyContent="center">
                    <Typography variant="h5">Loading...</Typography>
                </Box>
            ) : (
                <>
                    {subjectAttendance && Array.isArray(subjectAttendance) && subjectAttendance.length > 0 ? (
                        <Box sx={{ width: '100%', typography: 'body1' }}>
                            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                <TabContext value={value}>
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                                        <TabList 
                                            onChange={handleChange} 
                                            aria-label="attendance views"
                                            centered
                                            sx={{ 
                                                '& .MuiTabs-indicator': {
                                                    height: 3,
                                                }
                                            }}
                                        >
                                            <StyledTab 
                                                icon={<TableChartIcon />} 
                                                iconPosition="start" 
                                                label="Table View" 
                                                value="1" 
                                            />
                                            <StyledTab 
                                                icon={<InsertChartIcon />} 
                                                iconPosition="start" 
                                                label="Graphical View" 
                                                value="2" 
                                            />
                                        </TabList>
                                    </Box>

                                    <TabPanel value="1">
                                        <Box sx={{ p: 2 }}>
                                            <Typography 
                                                variant="h5" 
                                                gutterBottom 
                                                sx={{ 
                                                    fontWeight: 600,
                                                    color: 'primary.main',
                                                    mb: 3
                                                }}
                                            >
                                                Attendance Overview
                                            </Typography>
                                            <Table>
                                                <TableHead>
                                                    <StyledTableRow>
                                                        <StyledTableCell>Subject</StyledTableCell>
                                                        <StyledTableCell>Present</StyledTableCell>
                                                        <StyledTableCell>Total Sessions</StyledTableCell>
                                                        <StyledTableCell>Attendance Percentage</StyledTableCell>
                                                        <StyledTableCell align="center">Actions</StyledTableCell>
                                                    </StyledTableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {Object.entries(attendanceBySubject).map(([subName, { present, allData, subId, sessions }], index) => {
                                                        const subjectAttendancePercentage = calculateSubjectAttendancePercentage(present, sessions);
                                                        return (
                                                            <React.Fragment key={index}>
                                                                <StyledTableRow>
                                                                    <StyledTableCell>{subName}</StyledTableCell>
                                                                    <StyledTableCell>{present}</StyledTableCell>
                                                                    <StyledTableCell>{sessions}</StyledTableCell>
                                                                    <StyledTableCell>
                                                                        <Box sx={{ 
                                                                            display: 'flex', 
                                                                            alignItems: 'center',
                                                                            gap: 1
                                                                        }}>
                                                                            {subjectAttendancePercentage}%
                                                                            <Box
                                                                                sx={{
                                                                                    width: 100,
                                                                                    height: 8,
                                                                                    bgcolor: 'grey.200',
                                                                                    borderRadius: 1,
                                                                                    overflow: 'hidden'
                                                                                }}
                                                                            >
                                                                                <Box
                                                                                    sx={{
                                                                                        width: `${subjectAttendancePercentage}%`,
                                                                                        height: '100%',
                                                                                        bgcolor: subjectAttendancePercentage >= 75 ? 'success.main' : 'warning.main',
                                                                                        transition: 'width 1s ease-in-out'
                                                                                    }}
                                                                                />
                                                                            </Box>
                                                                        </Box>
                                                                    </StyledTableCell>
                                                                    <StyledTableCell align="center">
                                                                        <Button 
                                                                            variant="contained"
                                                                            sx={styles.attendanceButton}
                                                                            onClick={() => handleOpen(subId)}
                                                                        >
                                                                            {openStates[subId] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                                                            Details
                                                                        </Button>
                                                                    </StyledTableCell>
                                                                </StyledTableRow>
                                                                <StyledTableRow>
                                                                    <StyledTableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                                                        <Collapse in={openStates[subId]} timeout="auto" unmountOnExit>
                                                                            <Box sx={{ margin: 1 }}>
                                                                                <Typography variant="h6" gutterBottom component="div">
                                                                                    Attendance Details
                                                                                </Typography>
                                                                                <Table size="small" aria-label="purchases">
                                                                                    <TableHead>
                                                                                        <StyledTableRow>
                                                                                            <StyledTableCell>Date</StyledTableCell>
                                                                                            <StyledTableCell align="right">Status</StyledTableCell>
                                                                                        </StyledTableRow>
                                                                                    </TableHead>
                                                                                    <TableBody>
                                                                                        {allData.map((data, index) => {
                                                                                            const date = new Date(data.date);
                                                                                            const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
                                                                                            return (
                                                                                                <StyledTableRow key={index}>
                                                                                                    <StyledTableCell component="th" scope="row">
                                                                                                        {dateString}
                                                                                                    </StyledTableCell>
                                                                                                    <StyledTableCell align="right">
                                                                                                        <Chip 
                                                                                                            label={data.status}
                                                                                                            color={data.status === 'Present' ? 'success' : 'error'}
                                                                                                            size="small"
                                                                                                        />
                                                                                                    </StyledTableCell>
                                                                                                </StyledTableRow>
                                                                                            )
                                                                                        })}
                                                                                    </TableBody>
                                                                                </Table>
                                                                            </Box>
                                                                        </Collapse>
                                                                    </StyledTableCell>
                                                                </StyledTableRow>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </Box>
                                    </TabPanel>

                                    <TabPanel value="2">
                                        <Box sx={{ p: 3 }}>
                                            <Typography 
                                                variant="h5" 
                                                gutterBottom 
                                                sx={{ 
                                                    fontWeight: 600,
                                                    color: 'primary.main',
                                                    mb: 4,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                Attendance Analytics
                                            </Typography>
                                            <Grid container spacing={4}>
                                                <Grid item xs={12} md={6}>
                                                    <Fade in={true} timeout={1000}>
                                                        <StyledCard>
                                                            <CardContent>
                                                                <Typography 
                                                                    variant="h6" 
                                                                    gutterBottom
                                                                    sx={{ 
                                                                        textAlign: 'center',
                                                                        mb: 2
                                                                    }}
                                                                >
                                                                    Overall Attendance
                                                                </Typography>
                                                                <Box sx={{ height: 300 }}>
                                                                    <CustomPieChart data={chartData} />
                                                                </Box>
                                                            </CardContent>
                                                        </StyledCard>
                                                    </Fade>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Fade in={true} timeout={1000}>
                                                        <StyledCard>
                                                            <CardContent>
                                                                <Typography 
                                                                    variant="h6" 
                                                                    gutterBottom
                                                                    sx={{ 
                                                                        textAlign: 'center',
                                                                        mb: 2
                                                                    }}
                                                                >
                                                                    Subject-wise Attendance
                                                                </Typography>
                                                                <Box sx={{ height: 300 }}>
                                                                    <CustomBarChart 
                                                                        chartData={subjectData} 
                                                                        dataKey="attendancePercentage" 
                                                                    />
                                                                </Box>
                                                            </CardContent>
                                                        </StyledCard>
                                                    </Fade>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </TabPanel>
                                </TabContext>
                            </Paper>
                        </Box>
                    ) : (
                        <Box display="flex" justifyContent="center">
                            <Typography variant="h5">No attendance records found</Typography>
                        </Box>
                    )}
                </>
            )}
        </Container>
    );
};

export default ViewStdAttendance;

const styles = {
    attendanceButton: {
        backgroundColor: "#270843",
        borderRadius: '8px',
        textTransform: 'none',
        transition: 'all 0.3s ease',
        "&:hover": {
            backgroundColor: "#3f1068",
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(39, 8, 67, 0.3)',
        }
    },
    styledButton: {
        margin: "20px",
        backgroundColor: "#02250b",
        borderRadius: '8px',
        textTransform: 'none',
        transition: 'all 0.3s ease',
        "&:hover": {
            backgroundColor: "#106312",
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(2, 37, 11, 0.3)',
        }
    }
};