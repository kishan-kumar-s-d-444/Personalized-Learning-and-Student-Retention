import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllComplains } from '../../../redux/complainRelated/complainHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import styled from 'styled-components';
import { Box, Checkbox } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';

const ComplainContainer = styled.div`
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    position: relative;
`;

const ComplainCard = styled.div`
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    opacity: ${props => props.isDone ? 0.7 : 1};
    text-decoration: ${props => props.isDone ? 'line-through' : 'none'};

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
`;

const ComplainTitle = styled.h3`
    color: #2c3e50;
    font-size: 1.25rem;
    margin-bottom: 10px;
    font-weight: 600;
`;

const ComplainContent = styled.p`
    color: #34495e;
    margin: 10px 0;
    line-height: 1.5;
`;

const ComplainDate = styled.p`
    color: #7f8c8d;
    font-size: 0.9rem;
    margin-top: 15px;
`;

const ComplainMeta = styled.div`
    color: #666;
    font-size: 0.9rem;
    margin: 5px 0;
    display: flex;
    align-items: center;
    gap: 5px;

    &:before {
        content: '•';
        color: #3498db;
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
`;

const CheckboxContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const SpeedDialContainer = styled.div`
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
`;

const SeeComplains = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { complainsList, loading, error } = useSelector((state) => state.complain);
    const { currentUser } = useSelector((state) => state.user);
    const [checkedComplains, setCheckedComplains] = useState({});

    useEffect(() => {
        dispatch(getAllComplains(currentUser._id, "Complain"));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.log(error);
    }

    const handleCheckComplain = (id) => {
        setCheckedComplains(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const actions = [
        {
            icon: <DeleteIcon color="error" />,
            name: 'Clear Completed',
            action: () => {
                // Handle clearing completed complaints
                Object.entries(checkedComplains).forEach(([id, checked]) => {
                    if (checked) {
                        dispatch(deleteUser(id, "Complain"));
                    }
                });
                dispatch(getAllComplains(currentUser._id, "Complain"));
            }
        }
    ];

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <ComplainContainer>
                    {Array.isArray(complainsList) && complainsList.map((complain) => {
                        const date = new Date(complain.date);
                        const dateString = date.toString() !== "Invalid Date"
                            ? date.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })
                            : "Invalid Date";

                        return (
                            <ComplainCard 
                                key={complain._id} 
                                isDone={checkedComplains[complain._id]}
                            >
                                <CardHeader>
                                    <ComplainTitle>{complain.user?.name}'s Complaint</ComplainTitle>
                                    <CheckboxContainer>
                                        <Checkbox
                                            checked={checkedComplains[complain._id] || false}
                                            onChange={() => handleCheckComplain(complain._id)}
                                            color="primary"
                                        />
                                    </CheckboxContainer>
                                </CardHeader>
                                {/* <ComplainMeta>
                                    Class: {complain.user?.sclassName?.sclassName || 'N/A'}
                                </ComplainMeta> */}
                                <ComplainContent>{complain.complaint}</ComplainContent>
                                <ComplainDate>{dateString}</ComplainDate>
                            </ComplainCard>
                        );
                    })}
                    <SpeedDialContainer>
                        <SpeedDialTemplate actions={actions} />
                    </SpeedDialContainer>
                </ComplainContainer>
            )}
        </>
    );
};

export default SeeComplains;