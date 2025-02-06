import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Box, Container, CircularProgress, Backdrop, } from '@mui/material';
import { AccountCircle, School, Group } from '@mui/icons-material';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const password = "1234"

  const { status, currentUser, currentRole } = useSelector(state => state.user);

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = (user) => {
    if (user === "Admin") {
      if (visitor === "guest") {
        const email = "kshnkmr4444@gmail.com"
        const fields = { email, password }
        setLoader(true)
        dispatch(loginUser(fields, user))
      }
      else {
        navigate('/Adminlogin');
      }
    }

    else if (user === "Student") {
      if (visitor === "guest") {
        const rollNum = "01"
        const studentName = "guest student"
        const fields = { rollNum, studentName, password }
        setLoader(true)
        dispatch(loginUser(fields, user))
      }
      else {
        navigate('/Studentlogin');
      }
    }

    else if (user === "Teacher") {
      if (visitor === "guest") {
        const email = "kshnkmr4444@gmail.com"
        const fields = { email, password }
        setLoader(true)
        dispatch(loginUser(fields, user))
      }
      else {
        navigate('/Teacherlogin');
      }
    }
  }

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') {
        navigate('/Admin/dashboard');
      }
      else if (currentRole === 'Student') {
        navigate('/Student/dashboard');
      } else if (currentRole === 'Teacher') {
        navigate('/Teacher/dashboard');
      }
    }
    else if (status === 'error') {
      setLoader(false)
      setMessage("Network Error")
      setShowPopup(true)
    }
  }, [status, currentRole, navigate, currentUser]);

  return (
    <StyledContainer>
      <Container>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <div onClick={() => navigateHandler("Admin")}>
              <StyledPaper elevation={3} data-role="Admin">
                <Box mb={2}>
                  <AccountCircle fontSize="large" />
                </Box>
                <StyledTypography>
                  Admin
                </StyledTypography>
                <Description>
                  Login as an administrator to access the dashboard to manage app data.
                </Description>
              </StyledPaper>
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StyledPaper elevation={3} data-role="Student">
              <div onClick={() => navigateHandler("Student")}>
                <Box mb={2}>
                  <School fontSize="large" />
                </Box>
                <StyledTypography>
                  Student
                </StyledTypography>
                <Description>
                  Login as a student to explore course materials and assignments.
                </Description>
              </div>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StyledPaper elevation={3} data-role="Teacher">
              <div onClick={() => navigateHandler("Teacher")}>
                <Box mb={2}>
                  <Group fontSize="large" />
                </Box>
                <StyledTypography>
                  Teacher
                </StyledTypography>
                <Description>
                  Login as a teacher to create courses, assignments, and track student progress.
                </Description>
              </div>
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loader}
      >
        <CircularProgress color="inherit" />
        Please Wait
      </Backdrop>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </StyledContainer>
  );
};

export default ChooseUser;


const StyledContainer = styled.div`
  background: linear-gradient(135deg, #411d70 0%, #19118b 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%);
  }
`;

const StyledPaper = styled(Paper)`
 padding: 2rem;
 text-align: center;
 background-color: rgba(31, 31, 56, 0.9);
 color: rgba(255, 255, 255, 0.8);
 cursor: pointer;
 transition: all 0.3s ease-in-out;
 border-radius: 15px;
 box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
 position: relative;
 overflow: hidden;
  &::before {
   content: attr(data-role);
   position: absolute;
   top: 0;
   right: 0;
   background: #6c63ff;
   color: white;
   padding: 0.5rem 1.5rem;
   font-size: 0.8rem;
   font-weight: bold;
   border-bottom-left-radius: 15px;
   text-transform: uppercase;
   letter-spacing: 1px;
   box-shadow: -2px 2px 10px rgba(0, 0, 0, 0.2);
 }
  &:hover {
   background-color: #2c2c6c;
   color: white;
   transform: translateY(-5px);
   box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
 }
  svg {
   font-size: 3rem;
   margin-bottom: 1rem;
   color: #6c63ff;
   transition: all 0.3s ease;
 }
  &:hover svg {
   color: #8f88ff;
   transform: scale(1.1);
 }
`;

const StyledTypography = styled.h2`
  margin-bottom: 1rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.1); 
`;

const Description = styled.p`
  font-size: 0.9rem;
  line-height: 1.5;
  opacity: 0.8;
  margin-top: 1rem;
`;

