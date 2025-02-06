import React from 'react'
import { Link } from 'react-router-dom';
import { Container, Grid, Box, Button } from '@mui/material';
import styled from 'styled-components';
import Students from "../assets/students.svg";
import { LightPurpleButton } from '../components/buttonStyles';

const Homepage = () => {
    return (
        <StyledContainer>
            <Grid container spacing={0}>
                <Grid item xs={12} md={6}>
                    <img src={Students} alt="students" style={{ width: '100%' }} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <StyledPaper elevation={3}>
                        <StyledTitle>
                            Welcome to
                            <br />
                            School Management
                            <br />
                            System
                        </StyledTitle>
                        <StyledText>
                            School management, class organization, and add students and faculty.
                            Seamlessly track attendance, assess performance, and provide feedback.
                            Access records, view marks, and communicate effortlessly.
                        </StyledText>
                        <StyledBox>
                            <StyledLink to="/choose">
                                <LightPurpleButton variant="contained" fullWidth>
                                    Login
                                </LightPurpleButton>
                            </StyledLink>
                            <StyledLink to="/chooseasguest">
                                <Button variant="outlined" fullWidth sx={{ mt: 2, mb: 3, color: "#7f56da", borderColor: "#7f56da" }}>
                                    View Stats
                                </Button>
                            </StyledLink>
                            <StyledText>
                                Don't have an account?{' '}
                                <Link to="/Adminregister" style={{color:"#550080"}}>
                                    Sign up
                                </Link>
                            </StyledText>
                        </StyledBox>
                    </StyledPaper>
                </Grid>
            </Grid>
        </StyledContainer>
    );
};

export default Homepage;

// ... existing imports ...

const StyledContainer = styled(Container)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f8f9fa 100%);
`;

const StyledPaper = styled.div`
  padding: 32px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(127, 86, 218, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(127, 86, 218, 0.15);
  }
`;

const StyledBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 32px;
  max-width: 400px;
  margin: 0 auto;
`;

const StyledTitle = styled.h1`
  font-size: 3.5rem;
  color: #1a1a1a;
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  padding-top: 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
  margin-bottom: 24px;
  background: linear-gradient(45deg, #7f56da, #550080);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StyledText = styled.p`
  color: #4a4a4a;
  margin: 24px 0;
  letter-spacing: 0.2px;
  line-height: 1.6;
  font-size: 1.1rem;
  font-weight: 400;
  text-align: center;
  
  a {
    color: #7f56da;
    font-weight: 500;
    transition: color 0.3s ease;
    
    &:hover {
      color: #550080;
    }
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  width: 100%;
  
  button {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(127, 86, 218, 0.2);
    }
  }
`;

// ... rest of the code ...
