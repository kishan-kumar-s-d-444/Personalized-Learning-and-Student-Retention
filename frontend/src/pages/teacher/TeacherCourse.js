import React, { useState } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Container,
} from '@mui/material';
import UploadMaterial from './UploadMaterial';
import MaterialList from './MaterialList';

const TeacherCourse = () => {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

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
                    <Tab label="Upload Material" />
                    <Tab label="View Materials" />
                </Tabs>
            </Box>
            <Box sx={{ mt: 3 }}>
                {value === 0 && <UploadMaterial />}
                {value === 1 && <MaterialList />}
            </Box>
        </Container>
    );
};

export default TeacherCourse;
