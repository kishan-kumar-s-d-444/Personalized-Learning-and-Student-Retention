import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllNotices } from '../redux/noticeRelated/noticeHandle';
import { Box, styled } from '@mui/material';

const NoticeContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
    marginTop: '64px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #f5f7fa 100%)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
}));

const NoticeHeader = styled('h3')(({ theme }) => ({
    color: '#2c3e50',
    fontSize: '2.5rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    textAlign: 'center',
    marginBottom: '48px',
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '120px',
        height: '4px',
        background: 'linear-gradient(90deg, #3498db, #2ecc71)',
        borderRadius: '2px',
    },
}));

const NoticeCard = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    background: 'white',
    color: '#2c3e50',
    padding: '24px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    margin: '0 auto',
    width: '90%',
    maxWidth: '32em',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 25px rgba(0, 0, 0, 0.15)',
    },
}));

const NoticeTitle = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(90deg, #3498db, #2ecc71)',
    '-webkit-background-clip': 'text',
    backgroundClip: 'text',
    color: 'transparent',
    fontWeight: '700',
    textTransform: 'capitalize',
    padding: '12px 20px',
    fontSize: '1.5rem',
    marginBottom: '16px',
    borderBottom: '2px solid rgba(0, 0, 0, 0.05)',
}));

const NoticeContent = styled(Box)(({ theme }) => ({
    color: '#34495e',
    lineHeight: '1.7em',
    textAlign: 'justify',
    padding: '0 12px',
    fontSize: '1.1rem',
    fontWeight: '400',
    marginBottom: '16px',
}));

const NoticeDate = styled(Box)(({ theme }) => ({
    color: '#7f8c8d',
    fontSize: '0.9rem',
    marginTop: '16px',
    textAlign: 'right',
    fontStyle: 'italic',
    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
    paddingTop: '12px',
}));

const LoadingText = styled(Box)(({ theme }) => ({
    fontSize: '1.5rem',
    color: '#3498db',
    textAlign: 'center',
    padding: '32px',
    fontWeight: '500',
    animation: 'pulse 1.5s infinite',
    '@keyframes pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.6 },
    },
}));

const SeeNotice = () => {
    const dispatch = useDispatch();
    const { currentUser, currentRole } = useSelector(state => state.user);
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);

    useEffect(() => {
        if (currentRole === 'Admin') {
            dispatch(getAllNotices(currentUser._id, 'Notice'));
        } else {
            dispatch(getAllNotices(currentUser.school._id, 'Notice'));
        }
    }, [dispatch, currentRole, currentUser]);

    if (error) {
        console.log(error);
    }

    return (
        <NoticeContainer>
            {loading ? (
                <LoadingText>Loading...</LoadingText>
            ) : response ? (
                <LoadingText>No Notices to Show Right Now</LoadingText>
            ) : (
                <>
                    <NoticeHeader>Notices</NoticeHeader>
                    {Array.isArray(noticesList) && [...noticesList].reverse().map((notice) => {
                        const date = new Date(notice.date);
                        const dateString =
                            date.toString() !== 'Invalid Date'
                                ? date.toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                  })
                                : 'Invalid Date';

                        return (
                            <NoticeCard key={notice._id}>
                                <NoticeTitle>{notice.title}</NoticeTitle>
                                <NoticeContent>{notice.details}</NoticeContent>
                                <NoticeDate>{dateString}</NoticeDate>
                            </NoticeCard>
                        );
                    })}
                </>
            )}
        </NoticeContainer>
    );
};

export default SeeNotice;
