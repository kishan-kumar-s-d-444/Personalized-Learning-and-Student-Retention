import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import { Box, Container, Typography, Paper, Grid, Button, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios'; // Import axios
import { getAllStudents } from '../redux/studentRelated/studentHandle';
import { setSchoolRiskLevel } from '../redux/schoolRiskRelated/schoolRiskSlice';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    py: 4
  },
  paper: {
    p: 3,
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    mb: 3
  },
  header: {
    color: '#1a237e',
    fontWeight: 600,
    mb: 2
  },
  backButton: {
    mb: 3,
    display: 'flex',
    alignItems: 'center',
    gap: 1
  },
  chartContainer: {
    p: 2,
    height: '400px'
  }
};

const SchoolAttendance = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { admin } = location.state || {};
  const { studentsList, loading, error } = useSelector((state) => state.student);
  const [predictions, setPredictions] = useState({
    low: 0,
    medium: 0,
    high: 0,
    lowStudents: [],
    mediumStudents: [],
    highStudents: []
  });
  const [riskFactors, setRiskFactors] = useState({
    attendance: 0,
    academics: 0
  });

  useEffect(() => {
    if (!admin) {
      navigate('/');
      return;
    }

    console.log('SchoolAttendance - Fetching students for admin:', admin._id);
    dispatch(getAllStudents(admin._id));
  }, [admin, dispatch, navigate]);

  useEffect(() => {
    if (studentsList && studentsList.length > 0) {
      predictDropout(studentsList);
    }
  }, [studentsList]);

  const predictDropout = async (students) => {
    let low = 0, medium = 0, high = 0;
    const factors = { attendance: 0, academics: 0 };
    const lowStudents = [], mediumStudents = [], highStudents = [];

    console.log('Total students to process:', students.length);

    for (const student of students) {
      if (!student || !student.examResult) {
        console.log('Skipping student due to incomplete data:', student?._id);
        continue;
      }

      // Calculate attendance percentage
      const attendanceData = student.attendance || [];
      const totalSessions = attendanceData.length;
      const presentSessions = attendanceData.filter(att => att.status === "Present").length;
      const overallAttendancePercentage = totalSessions === 0 ? 0 : (presentSessions / totalSessions) * 100;

      console.log(student?._id, overallAttendancePercentage); // Debug log

      // Calculate average exam result score
      const averageScore = student.examResult && student.examResult.length > 0
        ? student.examResult.reduce((sum, result) => sum + (result?.marksObtained || 0), 0) / student.examResult.length
        : 0;

      try {
        const response = await fetch('http://127.0.0.1:5000/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            features: [overallAttendancePercentage, averageScore]
          }),
        });

        const data = await response.json();
        const prediction = data.prediction;

        if (prediction === 'low') {
          low++;
          lowStudents.push(student._id);
        } else if (prediction === 'medium') {
          medium++;
          mediumStudents.push(student._id);
          if (overallAttendancePercentage < 50) factors.attendance++;
          if (averageScore < 50) factors.academics++;
        } else if (prediction === 'high') {
          high++;
          highStudents.push(student._id);
          factors.attendance++;
          factors.academics++;
        }
      } catch (error) {
        console.error('Prediction error for student', student._id, ':', error);
      }
    }

    setPredictions({
      low,
      medium,
      high,
      lowStudents,
      mediumStudents,
      highStudents
    });

    setRiskFactors(factors);

    // Calculate predominant risk level
    let riskLevel = 'low';
    const total = low + medium + high;
    if (total > 0) {
      if (high >= medium && high >= low) {
        riskLevel = 'high';
      } else if (medium >= low) {
        riskLevel = 'medium';
      }
    }

    // Dispatch risk level to Redux store
    dispatch(setSchoolRiskLevel({ 
      schoolId: admin._id, 
      riskLevel 
    }));

    // Update admin's risk level in the database
    try {
      await axios.patch(`http://localhost:5000/Admin/${admin._id}`, {
        riskLevel
      });
    } catch (error) {
      console.error('Error updating admin risk level:', error);
    }
  };

  const chartData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        label: 'Number of Students',
        data: [predictions.low, predictions.medium, predictions.high],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',  // Green for low risk
          'rgba(255, 206, 86, 0.6)',  // Yellow for medium risk
          'rgba(255, 99, 132, 0.6)',  // Red for high risk
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Student Dropout Risk Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (loading) {
    return (
      <Box sx={styles.container}>
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    const errorMessage = error.response?.status === 500 
      ? 'Request failed with status code 500'
      : 'No student data found';

    return (
      <Box sx={styles.container}>
        <Container>
          <Button sx={styles.backButton} onClick={() => navigate(-1)}>
            <ArrowBackIcon /> Back
          </Button>
          <Paper sx={styles.paper}>
            <Typography color="error" variant="h6" align="center">
              {errorMessage}
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Container>
        <Button sx={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowBackIcon /> Back
        </Button>

        <Paper sx={styles.paper}>
          <Typography variant="h4" sx={styles.header}>
            {admin.schoolName} - Dropout Risk Analysis
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Principal: {admin.name}
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={styles.paper}>
              <Box sx={styles.chartContainer}>
                <Bar data={chartData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={styles.paper}>
              <Typography variant="h6" sx={styles.header}>
                Risk Distribution
              </Typography>
              <Typography>
                Low Risk Students: {predictions.low}
              </Typography>
              <Typography>
                Medium Risk Students: {predictions.medium}
              </Typography>
              <Typography>
                High Risk Students: {predictions.high}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={styles.paper}>
              <Typography variant="h6" sx={styles.header}>
                Risk Factors
              </Typography>
              <Typography>
                Students with Poor Attendance: {riskFactors.attendance}
              </Typography>
              <Typography>
                Students with Low Academic Performance: {riskFactors.academics}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SchoolAttendance;