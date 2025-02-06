import React, { useEffect, useState, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  CircularProgress, 
  Container, 
  Paper, 
  Button,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArticleIcon from '@mui/icons-material/Article';
import SchoolsIcon from '@mui/icons-material/AccountBalance';

// Styled components for enhanced card design
const StyledCard = styled(Card)(({ theme, risklevel }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '15px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '6px',
    height: '100%',
    backgroundColor: 
      risklevel === 'high' ? theme.palette.error.main :
      risklevel === 'medium' ? theme.palette.warning.main :
      theme.palette.success.main
  },
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
  }
}));

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    py: 4
  },
  headerContainer: {
    mb: 4,
    textAlign: 'center',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2
  },
  backButton: {
    position: 'absolute',
    left: 0
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '20px !important'
  },
  articleContainer: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  toggleButton: {
    mb: 3,
    display: 'flex',
    justifyContent: 'center'
  }
};

const dropoutData = {
  nationalStatistics: [
    { label: 'Overall Dropout Rate (Secondary Education)', value: '17.3%' },
    { label: 'Dropout Rate (Higher Secondary)', value: '25.6%' },
    { label: 'Reasons for Dropout', reasons: [
      'Economic constraints',
      'Lack of interest in studies',
      'Need to support family income',
      'Early marriage',
      'Lack of educational infrastructure'
    ]}
  ],
  articles: [
    {
      title: 'Understanding Student Dropout in India',
      content: 'Student dropout remains a critical challenge in the Indian education system. Socio-economic factors, lack of infrastructure, and limited access to quality education contribute significantly to high dropout rates, particularly in rural and economically disadvantaged regions.'
    },
    {
      title: 'Impact of COVID-19 on Education Dropout',
      content: 'The pandemic has exacerbated existing educational challenges, with increased dropout rates due to economic distress, digital divide, and disrupted learning environments. Marginalized communities have been disproportionately affected.'
    }
  ]
};

const AreaAttendance = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showArticles, setShowArticles] = useState(false);

  // Get risk levels from Redux store
  const schoolRiskLevels = useSelector((state) => state.schoolRisk.schoolRiskLevels);

  const uniqueSchools = useMemo(() => {
    if (!Array.isArray(admins)) return [];
    const schoolsMap = new Map();
    admins.forEach(user => {
      if (user.role === 'Admin' && user.schoolName && !schoolsMap.has(user.schoolName)) {
        const riskLevel = schoolRiskLevels[user._id] || user.riskLevel || 'low';
        schoolsMap.set(user.schoolName, { ...user, riskLevel });
      }
    });
    return Array.from(schoolsMap.values());
  }, [admins, schoolRiskLevels]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/Admin');
        setAdmins(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching admins:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleSchoolClick = (admin) => {
    navigate('/school-attendance', { state: { admin } });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <Typography variant="h6" color="error">
          Error Loading Data: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={styles.pageContainer}>
      <Box sx={styles.headerContainer}>
        <IconButton 
          sx={styles.backButton} 
          onClick={handleGoBack}
          aria-label="go back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {showArticles ? 'Dropout Insights' : 'Schoolwise Attendance'}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={showArticles ? <SchoolsIcon /> : <ArticleIcon />}
          onClick={() => setShowArticles(!showArticles)}
        >
          {showArticles ? 'View Schools' : 'View Insights'}
        </Button>
      </Box>

      <Container maxWidth="lg">
        {!showArticles ? (
          <Grid container spacing={3}>
            {uniqueSchools.map((admin) => (
              <Grid item xs={12} sm={6} md={4} key={admin._id}>
                <StyledCard 
                  risklevel={admin.riskLevel}
                  onClick={() => handleSchoolClick(admin)}
                >
                  <CardContent sx={styles.cardContent}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ 
                        color: '#1a237e', 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}>
                        <SchoolIcon /> {admin.schoolName}
                      </Typography>
                      <Chip 
                        label={admin.riskLevel.toUpperCase()} 
                        color={
                          admin.riskLevel === 'high' ? 'error' : 
                          admin.riskLevel === 'medium' ? 'warning' : 
                          'success'
                        } 
                        size="small" 
                      />
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      color: '#455a64' 
                    }}>
                      <PersonIcon /> {admin.name}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      color: '#455a64' 
                    }}>
                      <EmailIcon /> {admin.email}
                    </Typography>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={styles.articleContainer}>
            <Typography variant="h5" sx={{ 
              color: '#1a237e', 
              mb: 3, 
              textAlign: 'center',
              fontWeight: 600 
            }}>
              Student Dropout Insights
            </Typography>

            <Box sx={{ 
              background: 'rgba(26, 35, 126, 0.05)', 
              borderRadius: '10px', 
              p: 3, 
              mb: 3 
            }}>
              <Typography variant="h6" sx={{ color: '#1a237e', mb: 2 }}>
                National Dropout Statistics
              </Typography>
              {dropoutData.nationalStatistics.map((stat, index) => (
                <Typography key={index} variant="body1" sx={{ mb: 2 }}>
                  <strong>{stat.label}:</strong> {stat.value}
                  {stat.reasons && (
                    <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                      {stat.reasons.map((reason, idx) => (
                        <Typography key={idx} component="li" variant="body2">
                          {reason}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Typography>
              ))}
            </Box>

            {dropoutData.articles.map((article, index) => (
              <Paper 
                key={index} 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  mb: 2, 
                  background: 'rgba(26, 35, 126, 0.05)',
                  borderLeft: '6px solid #1a237e',
                  borderRadius: '10px'
                }}
              >
                <Typography variant="h6" sx={{ color: '#1a237e', mb: 2 }}>
                  {article.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#455a64', lineHeight: 1.6 }}>
                  {article.content}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Container>
  );
};

export default AreaAttendance;