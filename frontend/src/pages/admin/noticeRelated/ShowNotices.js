import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import {
    Box
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllNotices } from '../../../redux/noticeRelated/noticeHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import { GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import styled from 'styled-components';

const NoticeContainer = styled.div`
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    position: relative;
`;

const NoticeCard = styled.div`
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
`;

const NoticeTitle = styled.h3`
    color: #1a237e;
    font-size: 1.25rem;
    margin-bottom: 10px;
    font-weight: 600;
`;

const NoticeContent = styled.p`
    color: #424242;
    margin: 10px 0;
    line-height: 1.5;
`;

const NoticeDate = styled.p`
    color: #666;
    font-size: 0.9rem;
    margin-top: 15px;
    font-style: italic;
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    color: #e74c3c;
    padding: 5px;
    transition: color 0.3s ease;

    &:hover {
        color: #c0392b;
    }
`;

const SpeedDialContainer = styled.div`
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
`;

const ShowNotices = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);
    const { currentUser } = useSelector(state => state.user)

    useEffect(() => {
        dispatch(getAllNotices(currentUser._id, "Notice"));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.log(error);
    }

    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getAllNotices(currentUser._id, "Notice"));
            })
    }

    const actions = [
        {
            icon: <NoteAddIcon color="primary" />, name: 'Add New Notice',
            action: () => navigate("/Admin/addnotice")
        },
        {
            icon: <DeleteIcon color="error" />, name: 'Delete All Notices',
            action: () => deleteHandler(currentUser._id, "Notices")
        }
    ];

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    {response ? (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton variant="contained" onClick={() => navigate("/Admin/addnotice")}>
                                Add Notice
                            </GreenButton>
                        </Box>
                    ) : (
                        <>
                            <NoticeContainer>
                                {Array.isArray(noticesList) && noticesList.map((notice) => {
                                    const date = new Date(notice.date);
                                    const dateString = date.toString() !== "Invalid Date"
                                        ? date.toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : "Invalid Date";

                                    return (
                                        <NoticeCard key={notice._id}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <NoticeTitle>{notice.title}</NoticeTitle>
                                                <ActionButton onClick={() => deleteHandler(notice._id, "Notice")}>
                                                    <DeleteIcon />
                                                </ActionButton>
                                            </Box>
                                            <NoticeContent>{notice.details}</NoticeContent>
                                            <NoticeDate>{dateString}</NoticeDate>
                                        </NoticeCard>
                                    );
                                })}
                            </NoticeContainer>
                            <SpeedDialContainer>
                                <SpeedDialTemplate actions={actions} />
                            </SpeedDialContainer>
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default ShowNotices;