import React, { useEffect, useState } from 'react';
import { 
    Box, 
    CircularProgress, 
    Stack, 
    TextField, 
    Typography, 
    Container, 
    Paper, 
    Grid,
    Snackbar,
    Alert,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import axios from 'axios';
import { addStuff } from '../../redux/userRelated/userHandle';
import { doneSuccess } from '../../redux/userRelated/userSlice';

const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: 16,
    padding: theme.spacing(4),
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    background: 'linear-gradient(to right bottom, #ffffff, #f9fafb)',
    border: `1px solid ${theme.palette.divider}`,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
    }
}));

const StyledButton = styled('button')(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    '&:disabled': {
        opacity: 0.6,
        cursor: 'not-allowed',
    }
}));

const ComplaintList = styled(Paper)(({ theme }) => ({
    borderRadius: 16,
    padding: theme.spacing(3),
    marginTop: theme.spacing(4),
    background: 'linear-gradient(to right bottom, #ffffff, #f9fafb)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    border: `1px solid ${theme.palette.divider}`,
}));

const StudentComplain = () => {
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState("");
    const [date, setDate] = useState("");
    const dispatch = useDispatch();
    const { currentUser } = useSelector(state => state.user);
    const user = currentUser._id;
    const school = currentUser.school._id;
    const address = "Complain";
    const [loader, setLoader] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [userComplaints, setUserComplaints] = useState([]);

    // Fetch complaints when component mounts
    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Complain/${user}`);
                setUserComplaints(response.data);
            } catch (error) {
                console.error("Error fetching complaints:", error);
            }
        };

        fetchComplaints();
    }, [user]);

    const fields = {
        user,
        date,
        complaint,
        school,
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        dispatch(addStuff(fields, address))
            .then(async () => {
                setSnackbarMessage("Complaint submitted successfully!");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);
                
                // Refresh complaints list
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Complain/${user}`);
                    setUserComplaints(response.data);
                } catch (error) {
                    console.error("Error refreshing complaints:", error);
                }
                
                // Reset form
                setComplaint("");
                setDate("");
                setLoader(false);
            })
            .catch((err) => {
                setSnackbarMessage("Failed to submit complaint. Please try again.");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                setLoader(false);
            });
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <Box 
            sx={{ 
                minHeight: 'calc(100vh - 64px)', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#f4f6f9',
                py: 4
            }}
        >
            <Container maxWidth="md">
                <StyledPaper elevation={3}>
                    <Grid container spacing={3} alignItems="center" justifyContent="center">
                        <Grid item xs={12} textAlign="center">
                            <ReportProblemIcon 
                                sx={{ 
                                    fontSize: 60, 
                                    color: 'primary.main', 
                                    mb: 2 
                                }} 
                            />
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    mb: 3, 
                                    fontWeight: 700,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                Submit a Complaint
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <form onSubmit={submitHandler}>
                                <Stack spacing={3}>
                                    <TextField
                                        fullWidth
                                        label="Select Date"
                                        type="date"
                                        value={date}
                                        onChange={(event) => setDate(event.target.value)}
                                        required
                                        variant="outlined"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Write your complaint"
                                        variant="outlined"
                                        value={complaint}
                                        onChange={(event) => {
                                            setComplaint(event.target.value);
                                        }}
                                        required
                                        multiline
                                        rows={4}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                        placeholder="Describe your complaint in detail..."
                                    />
                                    <StyledButton 
                                        type="submit" 
                                        disabled={loader}
                                    >
                                        {loader ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            "Submit Complaint"
                                        )}
                                    </StyledButton>
                                </Stack>
                            </form>
                        </Grid>
                    </Grid>
                </StyledPaper>


            </Container>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={snackbarSeverity} 
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StudentComplain;