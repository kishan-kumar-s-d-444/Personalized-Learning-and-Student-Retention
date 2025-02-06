import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';
import { 
    Container, 
    Paper, 
    Table, 
    TableBody, 
    TableHead, 
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Fade,
    Tab,
    Tabs,
    Chip,
    LinearProgress,
} from '@mui/material';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import CustomBarChart from '../../components/CustomBarChart'
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
    },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: '1rem',
    '&.Mui-selected': {
        color: theme.palette.primary.main,
    },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    '& .MuiTabs-indicator': {
        height: 3,
        borderRadius: 3,
    },
}));

const StudentSubjects = () => {
    const dispatch = useDispatch();
    const { subjectsList, sclassDetails } = useSelector((state) => state.sclass);
    const { userDetails, currentUser, loading, response, error } = useSelector((state) => state.user);
    
    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
    }, [dispatch, currentUser._id])

    if (response) { console.log(response) }
    else if (error) { console.log(error) }

    const [subjectMarks, setSubjectMarks] = useState([]);
    const [selectedSection, setSelectedSection] = useState('table');

    useEffect(() => {
        if (userDetails) {
            setSubjectMarks(userDetails.examResult || []);
        }
    }, [userDetails])

    useEffect(() => {
        if (subjectMarks.length === 0) {
            dispatch(getSubjectList(currentUser.sclassName._id, "ClassSubjects"));
        }
    }, [subjectMarks, dispatch, currentUser.sclassName._id]);

    const handleSectionChange = (event, newSection) => {
        setSelectedSection(newSection);
    };

    const getGradeColor = (marks) => {
        if (marks >= 90) return 'success';
        if (marks >= 70) return 'primary';
        if (marks >= 50) return 'warning';
        return 'error';
    };

    const renderTableSection = () => {
        return (
            <Fade in={true} timeout={1000}>
                <Box>
                    <Typography 
                        variant="h4" 
                        gutterBottom 
                        sx={{ 
                            textAlign: 'center',
                            fontWeight: 600,
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 4
                        }}
                    >
                        Subject Marks
                    </Typography>
                    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Table>
                            <TableHead>
                                <StyledTableRow>
                                    <StyledTableCell>Subject</StyledTableCell>
                                    <StyledTableCell>Marks</StyledTableCell>
                                    <StyledTableCell align="center">Grade</StyledTableCell>
                                    <StyledTableCell>Progress</StyledTableCell>
                                </StyledTableRow>
                            </TableHead>
                            <TableBody>
                                {subjectMarks.map((result, index) => {
                                    if (!result.subName || !result.marksObtained) {
                                        return null;
                                    }
                                    const marks = result.marksObtained;
                                    return (
                                        <StyledTableRow key={index}>
                                            <StyledTableCell>{result.subName.subName}</StyledTableCell>
                                            <StyledTableCell>{marks}</StyledTableCell>
                                            <StyledTableCell align="center">
                                                <Chip 
                                                    label={marks >= 90 ? 'Excellent' : marks >= 70 ? 'Good' : marks >= 50 ? 'Average' : 'Need Improvement'}
                                                    color={getGradeColor(marks)}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Box sx={{ width: '100%', mr: 1 }}>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={marks} 
                                                        color={getGradeColor(marks)}
                                                        sx={{ 
                                                            height: 8,
                                                            borderRadius: 5,
                                                        }}
                                                    />
                                                </Box>
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Paper>
                </Box>
            </Fade>
        );
    };

    const renderChartSection = () => {
        return (
            <Fade in={true} timeout={1000}>
                <StyledCard elevation={3}>
                    <CardContent>
                        <Typography 
                            variant="h4" 
                            gutterBottom 
                            sx={{ 
                                textAlign: 'center',
                                fontWeight: 600,
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 4
                            }}
                        >
                            Performance Analytics
                        </Typography>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
                        </Box>
                    </CardContent>
                </StyledCard>
            </Fade>
        );
    };

    const renderClassDetailsSection = () => {
        return (
            <Container maxWidth="md">
                <Fade in={true} timeout={1000}>
                    <StyledCard elevation={3}>
                        <CardContent>
                            <Typography 
                                variant="h4" 
                                gutterBottom 
                                sx={{ 
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 4
                                }}
                            >
                                Class Details
                            </Typography>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 500 }}>
                                    You are currently in Class {sclassDetails && sclassDetails.sclassName}
                                </Typography>
                            </Box>
                            <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'text.secondary' }}>
                                Enrolled Subjects:
                            </Typography>
                            <Grid container spacing={2}>
                                {subjectsList &&
                                    subjectsList.map((subject, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <StyledCard>
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom color="primary">
                                                        {subject.subName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Subject Code: {subject.subCode}
                                                    </Typography>
                                                </CardContent>
                                            </StyledCard>
                                        </Grid>
                                    ))}
                            </Grid>
                        </CardContent>
                    </StyledCard>
                </Fade>
            </Container>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {loading ? (
                <Box display="flex" justifyContent="center">
                    <Typography variant="h5">Loading...</Typography>
                </Box>
            ) : (
                <>
                    {subjectMarks && Array.isArray(subjectMarks) && subjectMarks.length > 0 ? (
                        <Box>
                            <Paper elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
                                <StyledTabs 
                                    value={selectedSection} 
                                    onChange={handleSectionChange} 
                                    centered
                                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                                >
                                    <StyledTab 
                                        icon={<TableChartIcon />} 
                                        iconPosition="start" 
                                        label="Table View" 
                                        value="table" 
                                    />
                                    <StyledTab 
                                        icon={<InsertChartIcon />} 
                                        iconPosition="start" 
                                        label="Chart View" 
                                        value="chart" 
                                    />
                                </StyledTabs>
                            </Paper>
                            {selectedSection === 'table' && renderTableSection()}
                            {selectedSection === 'chart' && renderChartSection()}
                        </Box>
                    ) : (
                        renderClassDetailsSection()
                    )}
                </>
            )}
        </Container>
    );
};

export default StudentSubjects;