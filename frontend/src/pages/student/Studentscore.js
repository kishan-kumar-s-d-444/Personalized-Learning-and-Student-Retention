import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { Link } from 'react-router-dom';
import { Button, Container, Typography, Grid, Paper } from '@mui/material';

const Studentscore = () => {
    const dispatch = useDispatch();
    const { userDetails, currentUser, loading } = useSelector((state) => state.user);
    const [subjectMarks, setSubjectMarks] = useState([]);
  
    useEffect(() => {
      dispatch(getUserDetails(currentUser._id, 'Student'));
    }, [dispatch, currentUser._id]);
  
    useEffect(() => {
      if (userDetails) {
        setSubjectMarks(userDetails.examResult || []);
      }
    }, [userDetails]);
  
    return (
      <Container className="studentscore-container">
        <Typography variant="h4" align="center" gutterBottom>
          Student Score Details
        </Typography>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {subjectMarks && subjectMarks.length > 0 ? (
              <Grid container spacing={4}>
                {subjectMarks.map((subject, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper className="subject-card">
                      <Typography variant="h6" gutterBottom>
                        {subject.subName.subName}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        Score: {subject.marksObtained}%
                      </Typography>
                      {subject.marksObtained < 75 && (
                        <Button
                          variant="contained"
                          color="primary"
                          component={Link}
                          to={`/Student/courserec/${subject.subName.subName}`}
                        >
                          Enhance Learning
                        </Button>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1">No scores available.</Typography>
            )}
          </>
        )}
      </Container>
    );
};

export default Studentscore;

const styles = `
.studentscore-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.subject-card {
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.subject-card:hover {
  transform: scale(1.05);
}

.subject-card h6 {
  color: #333;
  font-weight: bold;
}

.subject-card p {
  color: #555;
}

.subject-card button {
  margin-top: 10px;
}
`;
