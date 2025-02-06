import React, { useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Grid,
    Container,
    IconButton,
    Card,
    CardContent,
    CardActions,
    Chip,
    Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useDispatch, useSelector } from 'react-redux';
import { getMaterials, deleteMaterial } from '../../redux/actionRelated/actionHandle';

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

const MaterialList = () => {
    const dispatch = useDispatch();
    const materials = useSelector((state) => state.material.materials);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        if (currentUser?.teachSclass?._id) {
            dispatch(getMaterials(currentUser.teachSclass._id));
        }
    }, [dispatch, currentUser?.teachSclass]);

    const handleDelete = (id) => {
        dispatch(deleteMaterial(id));
    };

    const getFileExtension = (url) => {
        return url.split('.').pop().toLowerCase();
    };

    const handleView = (fileUrl) => {
        const fileExtension = getFileExtension(fileUrl);
        
        // For PDF files, open in a new tab with PDF viewer
        if (fileExtension === 'pdf') {
            const pdfUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
            window.open(pdfUrl, '_blank');
        } else {
            // For other file types, open directly
            window.open(fileUrl, '_blank');
        }
    };

    const filteredMaterials = materials.filter(material => material.teacherId === currentUser._id);

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
            <Grid container spacing={3}>
                {filteredMaterials?.map((material, index) => (
                    <Fade in={true} timeout={500 + index * 100}>
                        <Grid item xs={12} sm={6} md={4} key={material._id}>
                            <StyledCard>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography 
                                        variant="h6" 
                                        gutterBottom 
                                        sx={{ 
                                            fontWeight: 600,
                                            color: '#1976d2'
                                        }}
                                    >
                                        {material.title}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                                        sx={{ mb: 2 }}
                                    >
                                        {material.description}
                                    </Typography>
                                    <Chip 
                                        label={getFileExtension(material.fileUrl).toUpperCase()}
                                        size="small"
                                        sx={{ 
                                            backgroundColor: '#e3f2fd',
                                            color: '#1976d2',
                                            fontWeight: 500
                                        }}
                                    />
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                                    <StyledButton
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleView(material.fileUrl)}
                                        startIcon={<VisibilityIcon />}
                                        sx={{
                                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                        }}
                                    >
                                        View
                                    </StyledButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDelete(material._id)}
                                        sx={{ 
                                            '&:hover': {
                                                backgroundColor: 'rgba(211, 47, 47, 0.04)'
                                            }
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            </StyledCard>
                        </Grid>
                    </Fade>
                ))}
            </Grid>
        </Container>
    );
};

export default MaterialList;
