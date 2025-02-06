import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import axios from 'axios';
import {
  Box,
  Tabs,
  Tab,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import YouTubeIcon from '@mui/icons-material/YouTube';

const YOUTUBE_API_KEY = 'AIzaSyD6j9654K39ddAYmUc0Bv3yW09791YrAmk';

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: alpha(theme.palette.primary.light, 0.1),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const VideoCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: theme.shadows[6],
  }
}));

const SearchVideos = ({ YOUTUBE_API_KEY }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchPageToken, setSearchPageToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearchVideos = async (loadMore = false) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            part: 'snippet',
            q: searchQuery,
            type: 'video',
            key: YOUTUBE_API_KEY,
            maxResults: 8,
            pageToken: loadMore ? searchPageToken : ''
          },
        }
      );

      const newResults = loadMore 
        ? [...searchResults, ...response.data.items] 
        : response.data.items;

      setSearchResults(newResults);
      setSearchPageToken(response.data.nextPageToken || null);
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: 'primary.main',
          mb: 3
        }}
      >
        <SearchIcon sx={{ mr: 2 }} />
        Video Search
      </Typography>
      
      <SearchContainer>
        <TextField
          fullWidth
          variant="standard"
          placeholder="Search YouTube Videos"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchVideos()}
          InputProps={{
            disableUnderline: true,
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 2 }} />
          }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleSearchVideos()}
          sx={{ ml: 2 }}
          disabled={loading}
        >
          Search
        </Button>
      </SearchContainer>

      {searchResults.length > 0 && (
        <>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {searchResults.map((video, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <VideoCard>
                  <CardMedia
                    component="img"
                    height="180"
                    image={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {video.snippet.title}
                    </Typography>
                    <Tooltip title="Watch on YouTube">
                      <IconButton
                        color="primary"
                        href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                        target="_blank"
                      >
                        <PlayCircleOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </CardContent>
                </VideoCard>
              </Grid>
            ))}
          </Grid>
          {searchPageToken && (
            <Box textAlign="center" mt={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSearchVideos(true)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Videos'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

const SubjectVideos = ({ 
  subjectMarks, 
  subjectVideos, 
  loadMoreVideos, 
  pageTokens 
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: 'primary.main',
          mb: 3
        }}
      >
        <YouTubeIcon sx={{ mr: 2 }} />
        Subject Video Recommendations
      </Typography>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: 3
        }}
      >
        {subjectMarks.map((result, index) => (
          <Tab 
            key={index} 
            label={result.subName.subName} 
            icon={<YouTubeIcon />} 
            iconPosition="start"
          />
        ))}
      </Tabs>

      {subjectMarks.map((result, index) => {
        const subjectName = result.subName.subName;
        const subjectVideosArray = subjectVideos[subjectName] || [];

        return activeTab === index && (
          <Box key={subjectName}>
            <Grid container spacing={2}>
              {subjectVideosArray.map((video, videoIndex) => (
                <Grid item xs={12} sm={6} md={4} key={videoIndex}>
                  <VideoCard>
                    <CardMedia
                      component="img"
                      height="180"
                      image={video.snippet.thumbnails.medium.url}
                      alt={video.snippet.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600, 
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {video.snippet.title}
                      </Typography>
                      <Tooltip title="Watch on YouTube">
                        <IconButton
                          color="primary"
                          href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                          target="_blank"
                        >
                          <PlayCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </CardContent>
                  </VideoCard>
                </Grid>
              ))}
            </Grid>
            {pageTokens[subjectName] && (
              <Box textAlign="center" mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => loadMoreVideos(subjectName)}
                >
                  Load More Videos
                </Button>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

const Videos = () => {
  const dispatch = useDispatch();
  const { currentUser, userDetails } = useSelector((state) => state.user);

  const [subjectMarks, setSubjectMarks] = useState([]);
  const [subjectVideos, setSubjectVideos] = useState({});
  const [value, setValue] = useState(0);
  const [pageTokens, setPageTokens] = useState({});

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    dispatch(getUserDetails(currentUser._id, 'Student'));
  }, [dispatch, currentUser._id]);

  useEffect(() => {
    if (userDetails) {
      setSubjectMarks(userDetails.examResult || []);
    }
  }, [userDetails]);

  const fetchVideosForSubject = async (subject, pageToken = '') => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            part: 'snippet',
            q: subject,
            type: 'video',
            key: YOUTUBE_API_KEY,
            maxResults: 6,
            pageToken: pageToken
          },
        }
      );
      return {
        videos: response.data.items,
        nextPageToken: response.data.nextPageToken
      };
    } catch (error) {
      console.error(`Error fetching YouTube videos for ${subject}:`, error);
      return { videos: [], nextPageToken: null };
    }
  };

  const loadMoreVideos = useCallback((subject) => {
    const currentPageToken = pageTokens[subject] || '';
    
    fetchVideosForSubject(subject, currentPageToken)
      .then(({ videos, nextPageToken }) => {
        setSubjectVideos(prev => ({
          ...prev,
          [subject]: [
            ...(prev[subject] || []),
            ...videos
          ]
        }));
        
        setPageTokens(prev => ({
          ...prev,
          [subject]: nextPageToken
        }));
      });
  }, [pageTokens]);

  useEffect(() => {
    const fetchAllSubjectVideos = async () => {
      const videos = {};
      for (const result of subjectMarks) {
        const subjectName = result.subName.subName;
        const { videos: videosForSubject, nextPageToken } = await fetchVideosForSubject(subjectName);
        videos[subjectName] = videosForSubject;
        
        setPageTokens(prev => ({
          ...prev,
          [subjectName]: nextPageToken
        }));
      }
      setSubjectVideos(videos);
    };

    if (subjectMarks.length > 0) {
      fetchAllSubjectVideos();
    }
  }, [subjectMarks]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', bgcolor: 'background.paper', mt: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          centered
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              minWidth: 120,
            },
          }}
        >
          <Tab label="Search Videos" />
          <Tab label="Subject Recommendations" />
        </Tabs>
      </Box>
      <Box sx={{ mt: 3 }}>
        {value === 0 && (
          <SearchVideos 
            YOUTUBE_API_KEY={YOUTUBE_API_KEY} 
          />
        )}
        {value === 1 && (
          <SubjectVideos 
            subjectMarks={subjectMarks}
            subjectVideos={subjectVideos}
            loadMoreVideos={loadMoreVideos}
            pageTokens={pageTokens}
            YOUTUBE_API_KEY={YOUTUBE_API_KEY}
          />
        )}
      </Box>
    </Container>
  );
};

export default Videos;
