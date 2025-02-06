import React from 'react';
import { 
  Box, 
  Container as MUIContainer, 
  Typography, 
  Grid, 
  Paper, 
  useMediaQuery, 
  useTheme 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: theme.shadows[8],
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const Courserec = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const items = [
    { 
      title: 'Assignments', 
      icon: 'fa-solid fa-book-open', 
      link: '/Student/assign', 
      count: 'View Assignments',
      gradient: 'linear-gradient(to bottom right, #bbcbfb, #f1d4ff)'
    },
    { 
      title: 'Queries', 
      icon: 'fa-solid fa-question', 
      link: '/Student/query', 
      count: 'Ask Questions',
      gradient: 'linear-gradient(to bottom right, #fbbbda, #ffd4d4)'
    },
    { 
      title: 'Dictionary', 
      icon: 'fa-solid fa-book', 
      link: '/Student/dict', 
      count: 'Learn Words',
      gradient: 'linear-gradient(to bottom right, #bbebfb, #efd4ff)'
    },
    { 
      title: 'Quiz', 
      icon: 'fa-solid fa-graduation-cap', 
      link: '/Student/quiz', 
      count: 'Take Quiz',
      gradient: 'linear-gradient(to bottom right, #bbfbe4, #d4e0ff)'
    },
    { 
      title: 'Videos', 
      icon: 'fa-solid fa-video', 
      link: '/Student/videos', 
      count: 'Watch Videos',
      gradient: 'linear-gradient(to bottom right, #bbd8fb, #ffd4d4)'
    }
  ];

  const handleCardClick = (link) => {
    navigate(link);
  };

  return (
    <Box 
      sx={{ 
        minHeight: 'calc(100vh - 64px)', // Subtract navbar height
        display: 'flex', 
        alignItems: 'center',
        py: 4, // Add vertical padding
        backgroundColor: '#f4f6f9' // Light background
      }}
    >
      <MUIContainer maxWidth="lg">
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          sx={{ 
            mb: 4,
            fontWeight: 700,
            color: '#1e2246',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Learning Resources
        </Typography>
        <Grid 
          container 
          spacing={isMobile ? 2 : 4} 
          justifyContent="center"
        >
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <StyledPaper 
                elevation={4} 
                onClick={() => handleCardClick(item.link)}
              >
                <IconWrapper>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: item.gradient,
                      mb: 2
                    }}
                  >
                    <i 
                      className={item.icon} 
                      style={{ 
                        fontSize: 36, 
                        color: '#1e2246' 
                      }} 
                    />
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#1e2246',
                      mb: 1
                    }}
                  >
                    {item.title}
                  </Typography>
                </IconWrapper>
                <Typography
                  variant="button"
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: '#e6f2ff',
                    color: '#1e2246',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#d0e6f7'
                    }
                  }}
                >
                  {item.count}
                </Typography>
              </StyledPaper>
            </Grid>
          ))}
        </Grid>
      </MUIContainer>
    </Box>
  );
};

export default Courserec;
