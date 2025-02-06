import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Grid,
    Container,
    Card,
    CardContent,
    CardActions,
    Chip,
    Fade,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useDispatch, useSelector } from 'react-redux';
import { getMaterials } from '../../redux/actionRelated/actionHandle';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: 8,
    textTransform: 'none',
    fontSize: '0.9rem',
    fontWeight: 600,
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(3),
    '& .MuiToggleButton-root': {
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: '20px !important',
        padding: theme.spacing(1, 3),
        '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            '&:hover': {
                backgroundColor: theme.palette.primary.dark,
            },
        },
    },
}));

const StudentCourse = () => {
    const dispatch = useDispatch();
    const materials = useSelector((state) => state.material.materials);
    const { currentUser } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);
    const [selectedSubject, setSelectedSubject] = useState('all');

    useEffect(() => {
        if (currentUser?.sclassName?._id) {
            dispatch(getMaterials(currentUser.sclassName._id));
        }
    }, [dispatch, currentUser?.sclassName]);

    const handleSubjectChange = (event, newSubject) => {
        if (newSubject !== null) {
            setSelectedSubject(newSubject);
        }
    };

    const getFileExtension = (url) => {
        return url.split('.').pop().toLowerCase();
    };

    const handleView = (fileUrl) => {
        const fileExtension = getFileExtension(fileUrl);
        
        // For PDF files, open with Google Docs viewer
        if (fileExtension === 'pdf') {
            const pdfUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
            window.open(pdfUrl, '_blank');
        } else {
            // For other file types, open directly
            window.open(fileUrl, '_blank');
        }
    };

    const renderFileIcon = (fileUrl) => {
        const fileExtension = getFileExtension(fileUrl);
        if (fileExtension === 'pdf') {
            return <PictureAsPdfIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            return <ImageIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
        }
        return <VisibilityIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
    };

    const filteredMaterials = selectedSubject === 'all'
        ? materials
        : materials.filter(material => material.subjectId === selectedSubject);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                    mb: 4, 
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}
            >
                Course Materials
            </Typography>

            <StyledToggleButtonGroup
                value={selectedSubject}
                exclusive
                onChange={handleSubjectChange}
                aria-label="subject filter"
            >
                <ToggleButton value="all" aria-label="all subjects">
                    All Subjects
                </ToggleButton>
                {subjectsList.map((subject) => (
                    <ToggleButton 
                        key={subject._id} 
                        value={subject._id} 
                        aria-label={subject.subName}
                    >
                        {subject.subName}
                    </ToggleButton>
                ))}
            </StyledToggleButtonGroup>

            <Grid container spacing={3}>
                {filteredMaterials.map((material) => {
                    const subject = subjectsList.find(s => s._id === material.subjectId);
                    return (
                        <Grid item xs={12} sm={6} md={4} key={material._id}>
                            <Fade in={true} timeout={500}>
                                <StyledCard>
                                    <CardContent>
                                        <Box display="flex" justifyContent="center" mb={2}>
                                            {renderFileIcon(material.fileUrl)}
                                        </Box>
                                        <Typography variant="h6" gutterBottom component="div" align="center">
                                            {material.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                                            {subject?.subName}
                                        </Typography>
                                        <Box display="flex" justifyContent="center" mt={1}>
                                            <Chip 
                                                label={getFileExtension(material.fileUrl).toUpperCase()} 
                                                color="primary" 
                                                variant="outlined" 
                                                size="small" 
                                            />
                                        </Box>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'center', mt: 'auto' }}>
                                        <StyledButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleView(material.fileUrl)}
                                            startIcon={<VisibilityIcon />}
                                        >
                                            View Material
                                        </StyledButton>
                                    </CardActions>
                                </StyledCard>
                            </Fade>
                        </Grid>
                    );
                })}
            </Grid>
        </Container>
    );
};

export default StudentCourse;
