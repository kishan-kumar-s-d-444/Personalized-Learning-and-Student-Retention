import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    Paper,
    Grid,
    Container,
    Alert,
    Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useDispatch, useSelector } from 'react-redux';
import { uploadMaterial } from '../../redux/actionRelated/actionHandle';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    background: 'linear-gradient(to right bottom, #ffffff, #fafafa)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: 8,
    padding: '10px 24px',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    '&:hover': {
        boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
    },
}));

const UploadMaterial = () => {
    const dispatch = useDispatch();
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
    const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
    const { currentUser } = useSelector((state) => state.user);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file || !title || !description) {
            setOpenErrorSnackbar(true);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('teacherId', currentUser._id);
        formData.append('subjectId', currentUser.teachSubject._id);
        formData.append('sclassId', currentUser.teachSclass._id);

        dispatch(uploadMaterial(formData))
            .then(() => {
                setOpenSuccessSnackbar(true);
                setFile(null);
                setTitle('');
                setDescription('');
            })
            .catch((error) => {
                setOpenErrorSnackbar(true);
            });
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <StyledPaper elevation={3}>
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
                    Upload Course Material
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                variant="outlined"
                                sx={{ 
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                variant="outlined"
                                sx={{ 
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <StyledButton
                                component="label"
                                variant="contained"
                                startIcon={<CloudUploadIcon />}
                                sx={{ mr: 2 }}
                            >
                                Select File
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.webm"
                                />
                            </StyledButton>
                            {file && (
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        mt: 2,
                                        color: 'success.main',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    Selected file: {file.name}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <StyledButton
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                }}
                            >
                                Upload Material
                            </StyledButton>
                        </Grid>
                    </Grid>
                </form>
            </StyledPaper>
            <Snackbar
                open={openErrorSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenErrorSnackbar(false)}
            >
                <Alert 
                    onClose={() => setOpenErrorSnackbar(false)} 
                    severity="error" 
                    variant="filled"
                >
                    Please fill all fields before submitting
                </Alert>
            </Snackbar>
            <Snackbar
                open={openSuccessSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSuccessSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setOpenSuccessSnackbar(false)} 
                    severity="success" 
                    variant="filled"
                >
                    Material uploaded successfully!
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default UploadMaterial;
