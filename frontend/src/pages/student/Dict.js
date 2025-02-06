import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Divider,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import TranslateIcon from '@mui/icons-material/Translate';

const DictionaryContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  padding: theme.spacing(4),
  width: '100vw',
  margin: 0,
  maxWidth: '100% !important',
}));

const SearchPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  width: '100%',
  maxWidth: 600,
  background: 'white',
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  marginBottom: theme.spacing(3),
}));

const WordCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  background: 'white',
  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
  transition: 'transform 0.3s ease',
  width: '90%',
  maxWidth: '600px',
  margin: '0 auto',
  '&:hover': {
    transform: 'scale(1.02)',
  }
}));

const Dict = () => {
  const [word, setWord] = useState('');
  const [wordData, setWordData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWordDefinition = async (word) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      setWordData(response.data[0]);
      setLoading(false);
    } catch (err) {
      setError('Word not found. Please check the spelling.');
      setWordData(null);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setWord(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (word.trim()) {
      fetchWordDefinition(word.trim());
    }
  };

  const handlePronunciation = () => {
    if (wordData && wordData.phonetics && wordData.phonetics.length > 0) {
      const audioUrl = wordData.phonetics.find(p => p.audio)?.audio;
      if (audioUrl) {
        new Audio(audioUrl).play();
      }
    }
  };

  return (
    <DictionaryContainer maxWidth="lg">
      <SearchPaper elevation={3}>
        <Box component="form" onSubmit={handleFormSubmit} sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            value={word}
            onChange={handleInputChange}
            placeholder="Enter a word"
            InputProps={{
              startAdornment: <TranslateIcon sx={{ mr: 2, color: 'text.secondary' }} />,
            }}
            sx={{ mr: 2 }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={loading}
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
        </Box>
      </SearchPaper>

      {error && (
        <Typography 
          variant="body1" 
          color="error" 
          align="center" 
          sx={{ mb: 3 }}
        >
          {error}
        </Typography>
      )}

      {wordData && (
        <WordCard elevation={4}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold', 
                  mr: 2, 
                  color: 'primary.main' 
                }}
              >
                {wordData.word}
              </Typography>
              {wordData.phonetic && (
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ fontStyle: 'italic' }}
                >
                  {wordData.phonetic}
                </Typography>
              )}
              {wordData.phonetics?.find(p => p.audio) && (
                <IconButton 
                  color="primary" 
                  onClick={handlePronunciation}
                  sx={{ ml: 1 }}
                >
                  <VolumeUpIcon />
                </IconButton>
              )}
            </Box>

            {wordData.origin && (
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="subtitle1" 
                  color="text.secondary"
                  sx={{ fontWeight: 'bold' }}
                >
                  Origin
                </Typography>
                <Typography variant="body1">
                  {wordData.origin}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography 
              variant="h5" 
              sx={{ 
                mb: 2, 
                fontWeight: 'bold', 
                color: 'primary.main' 
              }}
            >
              Meanings
            </Typography>

            {wordData.meanings.map((meaning, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    textTransform: 'capitalize', 
                    color: 'text.secondary', 
                    mb: 1 
                  }}
                >
                  {meaning.partOfSpeech}
                </Typography>
                {meaning.definitions.map((def, defIndex) => (
                  <Box key={defIndex} sx={{ mb: 2 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 'medium',
                        mb: 0.5 
                      }}
                    >
                      {def.definition}
                    </Typography>
                    {def.example && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontStyle: 'italic' }}
                      >
                        Example: {def.example}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ))}
          </CardContent>
        </WordCard>
      )}
    </DictionaryContainer>
  );
};

export default Dict;
